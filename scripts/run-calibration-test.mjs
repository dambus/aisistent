/**
 * Korak 4 — run-calibration-test.mjs
 * Pokreće ceo pipeline za dati PDF i generiše:
 *   - JSON sa per-field rezultatima (za record-ground-truth.mjs)
 *   - HTML vizuelni overlay (boja po confidence, hover signali)
 *
 * Ako DI raw za ovaj dokument već postoji, ne poziva API ponovo.
 *
 * Usage: node scripts/run-calibration-test.mjs <pdf-path> [--force-di]
 */
import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import DocumentIntelligence, { getLongRunningPoller, isUnexpected }
  from '@azure-rest/ai-document-intelligence';

config({ path: '.env.local' });

const pdfPath = process.argv[2];
const forceDi = process.argv.includes('--force-di');
if (!pdfPath) {
  console.error('Usage: node scripts/run-calibration-test.mjs <pdf-path> [--force-di]');
  process.exit(1);
}

const label   = path.basename(pdfPath, '.pdf').replace(/[^a-z0-9_-]/gi, '-');
const rawPath = `scripts/output/${label}-di-raw.json`;
const outPath = `scripts/output/${label}-calibration.json`;
const htmlPath= `scripts/output/${label}-overlay.html`;

// ─── 1. DI ekstrakcija (sa keširanjem) ───────────────────────────────────────
let diRaw;
if (!forceDi && existsSync(rawPath)) {
  console.log(`DI raw postoji, koristim keš: ${rawPath}`);
  diRaw = JSON.parse(readFileSync(rawPath));
} else {
  const endpoint = process.env.AZURE_DOC_INTEL_ENDPOINT;
  const key      = process.env.AZURE_DOC_INTEL_KEY;
  if (!endpoint || !key) { console.error('Nedostaju AZURE env varijable'); process.exit(1); }
  console.log(`DI analiza: ${pdfPath} ...`);
  const client = DocumentIntelligence(endpoint, { key });
  const resp   = await client.path('/documentModels/{modelId}:analyze', 'prebuilt-layout')
    .post({ contentType: 'application/octet-stream', body: readFileSync(pdfPath) });
  if (isUnexpected(resp)) { console.error('DI greška:', resp.body); process.exit(1); }
  const poller = getLongRunningPoller(client, resp);
  diRaw = (await poller.pollUntilDone()).body;
  writeFileSync(rawPath, JSON.stringify(diRaw, null, 2));
  console.log(`Raw sačuvan: ${rawPath}`);
}

const analyzeResult = diRaw.analyzeResult;

// ─── 2. Parse DI rezultata ────────────────────────────────────────────────────
function polyToBB(poly) {
  if (!poly || poly.length < 8) return { x:0, y:0, w:0, h:0 };
  const xs = [poly[0],poly[2],poly[4],poly[6]], ys = [poly[1],poly[3],poly[5],poly[7]];
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs)-x, h: Math.max(...ys)-y };
}

const diPages = (analyzeResult.pages ?? []).map(p => ({
  pageNumber: p.pageNumber, width: p.width ?? 0, height: p.height ?? 0, unit: p.unit ?? 'inch'
}));

const diParagraphs = (analyzeResult.paragraphs ?? []).map(p => {
  const r = p.boundingRegions?.[0];
  return { content: p.content, page: r?.pageNumber ?? 1, boundingBox: polyToBB(r?.polygon) };
});

// Lines = jednolinijski tekstualni elementi unutar pages.
// Koristimo za same-line matching — paragraphs ponekad spajaju više vizuelnih redova
// (npr. naslov koji se prelama + labela ispod), što pomera centar paragrafa van same-line praga.
const diLines = (analyzeResult.pages ?? []).flatMap(p =>
  (p.lines ?? []).map(l => ({
    content: l.content, page: p.pageNumber, boundingBox: polyToBB(l.polygon)
  }))
);

const diWords = (analyzeResult.pages ?? []).flatMap(p =>
  (p.words ?? []).map(w => ({
    content: w.content, confidence: w.confidence ?? 0, page: p.pageNumber,
    boundingBox: polyToBB(w.polygon)
  }))
);

// ─── 3. AcroForm ekstrakcija ──────────────────────────────────────────────────
const pdfBuffer = readFileSync(pdfPath);
const pdf       = await PDFDocument.load(pdfBuffer);
const pdfPages  = pdf.getPages();
const pageRefMap = new Map();
pdfPages.forEach((p, i) => pageRefMap.set(p.ref.toString(), i + 1));
const pageHeightsPt = pdfPages.map(p => p.getSize().height);

const acroFields = [];
for (const field of pdf.getForm().getFields()) {
  const name = field.getName();
  for (const widget of field.acroField.getWidgets()) {
    const r    = widget.getRectangle();
    const pRef = widget.P();
    const page = pRef ? (pageRefMap.get(pRef.toString()) ?? null) : null;
    if (page === null) continue;
    acroFields.push({ name, page, x: r.x, y: r.y, w: r.width, h: r.height });
  }
}

// ─── 4. Geometrijsko poklapanje ───────────────────────────────────────────────
// Pragovi — isti kao u matchFieldLabels.ts (PRIVREMENI, kalibrisati)
const SAME_LINE_Y   = 0.12;
const MARGIN_MIN    = 0.20;
const DI_CONF_MIN   = 0.80;
const SOLO_MAX_DIST = 3.0;
const ABOVE_MAX_Y   = 0.35;
const ABOVE_MAX_X   = 1.5;

function avgWordConf(bb, page) {
  const TOL = 0.03;
  const ws = diWords.filter(w =>
    w.page === page &&
    w.boundingBox.x >= bb.x - TOL && w.boundingBox.x + w.boundingBox.w <= bb.x + bb.w + TOL &&
    w.boundingBox.y >= bb.y - TOL && w.boundingBox.y + w.boundingBox.h <= bb.y + bb.h + TOL
  );
  return ws.length ? ws.reduce((s,w) => s+w.confidence, 0) / ws.length : null;
}

function computeConf(dist, margin, diConf) {
  const confOk = diConf === null || diConf >= DI_CONF_MIN;
  if (margin === null) return dist <= SOLO_MAX_DIST && confOk ? 'high' : 'low';
  return margin >= MARGIN_MIN && confOk ? 'high' : 'low';
}

const matches = acroFields.map(f => {
  const pageH   = pageHeightsPt[f.page - 1] ?? 841.89;
  const xLeft   = f.x / 72;
  const yCtr    = (pageH - (f.y + f.h / 2)) / 72;
  const fieldBB = { x: xLeft, y: yCtr - (f.h/72)/2, w: f.w/72, h: f.h/72 };

  // Same-line: koristimo lines (jednolinijski), ne paragraphs
  const pageLines = diLines.filter(l => l.page === f.page);
  const sameLine = pageLines
    .filter(l => {
      const lyCtr  = l.boundingBox.y + l.boundingBox.h / 2;
      const lRight = l.boundingBox.x + l.boundingBox.w;
      return Math.abs(lyCtr - yCtr) < SAME_LINE_Y && lRight <= xLeft + 0.05;
    })
    .map(l => ({ content: l.content, boundingBox: l.boundingBox,
                 dist: +(xLeft - (l.boundingBox.x + l.boundingBox.w)).toFixed(4),
                 diConf: avgWordConf(l.boundingBox, f.page) }))
    .sort((a,b) => a.dist - b.dist);

  if (sameLine.length > 0) {
    const best = sameLine[0], second = sameLine[1];
    const margin = second ? +(second.dist - best.dist).toFixed(4) : null;
    return { fieldName: f.name, page: f.page, boundingBox: fieldBB,
             label: best.content,
             confidence: computeConf(best.dist, margin, best.diConf),
             matchType: 'same-line', groundTruth: null,
             signals: { distanceIn: best.dist, relativeMarginIn: margin,
                        diConfidence: best.diConf !== null ? +best.diConf.toFixed(4) : null } };
  }

  // Fallback "iznad": paragraphs su ok ovde (ne radimo precizno y poređenje)
  const pageParas = diParagraphs.filter(p => p.page === f.page);
  const above = pageParas
    .filter(p => {
      const pXCtr = p.boundingBox.x + p.boundingBox.w / 2;
      return p.boundingBox.y > yCtr && p.boundingBox.y < yCtr + ABOVE_MAX_Y &&
             Math.abs(pXCtr - xLeft) < ABOVE_MAX_X;
    })
    .sort((a,b) => a.boundingBox.y - b.boundingBox.y);

  if (above.length > 0) {
    const best = above[0];
    return { fieldName: f.name, page: f.page, boundingBox: fieldBB,
             label: best.content, confidence: 'low', matchType: 'above', groundTruth: null,
             signals: { distanceIn: null, relativeMarginIn: null,
                        diConfidence: avgWordConf(best.boundingBox, f.page) } };
  }

  return { fieldName: f.name, page: f.page, boundingBox: fieldBB,
           label: null, confidence: 'low', matchType: 'none', groundTruth: null,
           signals: { distanceIn: null, relativeMarginIn: null, diConfidence: null } };
});

// ─── 5. Sačuvaj kalibracioni JSON ─────────────────────────────────────────────
const calJson = {
  _meta: { pdfPath, label, generatedAt: new Date().toISOString(),
           thresholds: { SAME_LINE_Y, MARGIN_MIN, DI_CONF_MIN, SOLO_MAX_DIST } },
  pages: diPages,
  fields: matches,
};
writeFileSync(outPath, JSON.stringify(calJson, null, 2));

// ─── 6. Statistika ────────────────────────────────────────────────────────────
const high = matches.filter(m => m.confidence === 'high').length;
const low  = matches.filter(m => m.confidence === 'low').length;
const none = matches.filter(m => m.matchType === 'none').length;
console.log(`\n=== ${label} ===`);
console.log(`Stranica: ${diPages.length}  |  AcroForm polja: ${matches.length}`);
console.log(`  high: ${high}  low: ${low}  bez labele: ${none}`);
console.log(`Kalibracioni JSON: ${outPath}`);

// ─── 7. HTML vizuelni overlay ─────────────────────────────────────────────────
const PX_PER_INCH = 96; // scale za prikaz

const fieldsByPage = {};
for (const m of matches) {
  if (!fieldsByPage[m.page]) fieldsByPage[m.page] = [];
  fieldsByPage[m.page].push(m);
}

const pageHtml = diPages.map(pg => {
  const W = (pg.width  * PX_PER_INCH).toFixed(0);
  const H = (pg.height * PX_PER_INCH).toFixed(0);
  const fields = fieldsByPage[pg.pageNumber] ?? [];

  const boxes = fields.map(m => {
    const bb = m.boundingBox;
    const left   = (bb.x * PX_PER_INCH).toFixed(1);
    const top    = (bb.y * PX_PER_INCH).toFixed(1);
    const width  = (bb.w * PX_PER_INCH).toFixed(1);
    const height = (bb.h * PX_PER_INCH).toFixed(1);

    const color = m.confidence === 'high'
      ? (m.matchType === 'none' ? '#aaa' : '#22c55e')   // zelena
      : (m.matchType === 'none' ? '#ef4444' : '#f59e0b'); // crvena / narandžasta

    const s = m.signals;
    const tooltip = [
      `Polje: ${m.fieldName}`,
      `Labela: ${m.label ?? 'null'}`,
      `Confidence: ${m.confidence}  (${m.matchType})`,
      `Dist: ${s.distanceIn?.toFixed(3) ?? 'n/a'}in`,
      `Margina: ${s.relativeMarginIn?.toFixed(3) ?? '∞'}in`,
      `DI conf: ${s.diConfidence?.toFixed(3) ?? 'n/a'}`,
    ].join('&#10;');

    return `<div class="field ${m.confidence}" id="field-${m.fieldName}"
      style="left:${left}px;top:${top}px;width:${width}px;height:${height}px;border-color:${color}"
      title="${tooltip}">
      <span class="fname">${m.fieldName}</span>
    </div>`;
  }).join('\n');

  return `
  <div class="page-wrap">
    <h3>Stranica ${pg.pageNumber} — ${pg.width.toFixed(2)} × ${pg.height.toFixed(2)} inch</h3>
    <div class="page" style="width:${W}px;height:${H}px">
      ${boxes}
    </div>
  </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<title>${label} — overlay</title>
<style>
  body { font-family: sans-serif; background: #f1f5f9; padding: 20px; }
  h1   { font-size: 1.1rem; color: #334155; }
  h3   { font-size: 0.85rem; color: #64748b; margin: 16px 0 6px; }
  .legend { display:flex; gap:16px; margin-bottom:16px; font-size:0.8rem; align-items:center; }
  .dot { width:14px;height:14px;border-radius:3px;border:2px solid; }
  .page-wrap { margin-bottom: 40px; }
  .page {
    position: relative;
    background: white;
    border: 1px solid #cbd5e1;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .field {
    position: absolute;
    border: 2px solid;
    border-radius: 2px;
    cursor: help;
    box-sizing: border-box;
    overflow: hidden;
    transition: box-shadow .15s;
  }
  .field.high { background: rgba(34,197,94,.15); }
  .field.low  { background: rgba(245,158,11,.15); }
  .field.current-field {
    border: 3px solid #2563eb !important;
    background: rgba(37,99,235,.18) !important;
    box-shadow: 0 0 0 3px rgba(37,99,235,.35), 0 0 12px 4px rgba(37,99,235,.25);
    z-index: 20;
  }
  .fname {
    font-size: 7px;
    color: #334155;
    padding: 1px;
    line-height: 1;
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
  }
  .stats { font-size: 0.82rem; color: #475569; margin-bottom: 12px; }
  #current-banner {
    display: none;
    position: sticky;
    top: 0;
    z-index: 100;
    background: #2563eb;
    color: white;
    padding: 6px 16px;
    font-size: 0.82rem;
    margin: -20px -20px 16px -20px;
  }
</style>
</head>
<body>
<div id="current-banner"></div>
<h1>${label} — kalibracioni overlay</h1>
<div class="legend">
  <div class="dot" style="border-color:#22c55e;background:rgba(34,197,94,.2)"></div> high confidence
  <div class="dot" style="border-color:#f59e0b;background:rgba(245,158,11,.2)"></div> low confidence (ima labelu)
  <div class="dot" style="border-color:#ef4444;background:rgba(239,68,68,.1)"></div> bez labele
  <div class="dot" style="border-color:#2563eb;background:rgba(37,99,235,.2)"></div> trenutno polje (review)
</div>
<div class="stats">
  Polja ukupno: ${matches.length} &nbsp;|&nbsp;
  <span style="color:#16a34a">high: ${high}</span> &nbsp;|&nbsp;
  <span style="color:#d97706">low: ${low - none}</span> &nbsp;|&nbsp;
  <span style="color:#dc2626">bez labele: ${none}</span>
  &nbsp;|&nbsp; Pragovi: MARGIN≥${MARGIN_MIN}in, DI≥${DI_CONF_MIN}, SOLO_MAX=${SOLO_MAX_DIST}in
</div>
${pageHtml}
<script>
function applyHash() {
  const prev = document.querySelector('.current-field');
  if (prev) prev.classList.remove('current-field');
  const name = location.hash.slice(1);
  if (!name) { document.getElementById('current-banner').style.display = 'none'; return; }
  const el = document.getElementById('field-' + name);
  if (!el) return;
  el.classList.add('current-field');
  const banner = document.getElementById('current-banner');
  const labelLine = el.title.split('\\n')[1] || '';
  banner.textContent = '► ' + name + '  |  ' + labelLine;
  banner.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
window.addEventListener('hashchange', applyHash);
window.addEventListener('load', applyHash);
</script>
</body>
</html>`;

writeFileSync(htmlPath, html);
console.log(`Overlay HTML: ${htmlPath}`);
console.log(`\nOtvori u browseru i proveri polja — zelena=high, narandžasta=low, crvena=bez labele.`);
console.log(`Hover nad svakim poljem prikazuje sve signale (dist, margina, DI conf).`);
