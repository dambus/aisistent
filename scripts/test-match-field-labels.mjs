// Test Korak 3/4 — geometrijsko poklapanje sa novom formulom (margina + DI confidence)
import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

const pdfPath = process.argv[2] || 'C:/Users/milan/Downloads/PPDG-1S-p.pdf';
const diRaw   = process.argv[3] || 'scripts/output/ppdg1s-di-raw.json';
const outPath = process.argv[4] || 'scripts/output/ppdg1s-field-matches.json';

// Pragovi (moraju biti isti kao u matchFieldLabels.ts)
const SAME_LINE_Y  = 0.12;
const MARGIN_MIN   = 0.20;
const DI_CONF_MIN  = 0.80;
const SOLO_MAX_DIST = 3.0;
const ABOVE_MAX_Y  = 0.35;
const ABOVE_MAX_X  = 1.5;

// --- AcroForm ekstrakcija ---
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

// --- DI rezultati iz raw fajla ---
const raw = JSON.parse(readFileSync(diRaw));

const paragraphs = (raw.analyzeResult.paragraphs ?? []).map(p => {
  const region = p.boundingRegions?.[0];
  const poly   = region?.polygon ?? [];
  const xs = [poly[0],poly[2],poly[4],poly[6]].filter(Number.isFinite);
  const ys = [poly[1],poly[3],poly[5],poly[7]].filter(Number.isFinite);
  const x  = Math.min(...xs), y = Math.min(...ys);
  return { content: p.content, page: region?.pageNumber ?? 1,
           boundingBox: { x, y, w: Math.max(...xs)-x, h: Math.max(...ys)-y } };
});

const words = (raw.analyzeResult.pages ?? []).flatMap(p =>
  (p.words ?? []).map(w => {
    const poly = w.polygon ?? [];
    const xs = [poly[0],poly[2],poly[4],poly[6]].filter(Number.isFinite);
    const ys = [poly[1],poly[3],poly[5],poly[7]].filter(Number.isFinite);
    const x  = Math.min(...xs), y = Math.min(...ys);
    return { content: w.content, confidence: w.confidence ?? 0, page: p.pageNumber,
             boundingBox: { x, y, w: Math.max(...xs)-x, h: Math.max(...ys)-y } };
  })
);

function avgWordConf(bb, page) {
  const TOL = 0.03;
  const ws = words.filter(w =>
    w.page === page &&
    w.boundingBox.x >= bb.x - TOL && w.boundingBox.x + w.boundingBox.w <= bb.x + bb.w + TOL &&
    w.boundingBox.y >= bb.y - TOL && w.boundingBox.y + w.boundingBox.h <= bb.y + bb.h + TOL
  );
  if (!ws.length) return null;
  return ws.reduce((s, w) => s + w.confidence, 0) / ws.length;
}

function computeConfidence(dist, margin, diConf) {
  const confOk = diConf === null || diConf >= DI_CONF_MIN;
  if (margin === null) return dist <= SOLO_MAX_DIST && confOk ? 'high' : 'low';
  return margin >= MARGIN_MIN && confOk ? 'high' : 'low';
}

// --- Poklapanje ---
const results = acroFields.map(f => {
  const pageH  = pageHeightsPt[f.page - 1] ?? 841.89;
  const xLeft  = f.x / 72;
  const yCtr   = (pageH - (f.y + f.h / 2)) / 72;
  const fieldBB = { x: xLeft, y: yCtr - f.h/2/72, w: f.w/72, h: f.h/72 };
  const pageParas = paragraphs.filter(p => p.page === f.page);

  const sameLine = pageParas
    .filter(p => {
      const pyCtr  = p.boundingBox.y + p.boundingBox.h / 2;
      const pRight = p.boundingBox.x + p.boundingBox.w;
      return Math.abs(pyCtr - yCtr) < SAME_LINE_Y && pRight <= xLeft + 0.05;
    })
    .map(p => ({ para: p, dist: +(xLeft - (p.boundingBox.x + p.boundingBox.w)).toFixed(4),
                 diConf: avgWordConf(p.boundingBox, f.page) }))
    .sort((a, b) => a.dist - b.dist);

  if (sameLine.length > 0) {
    const best   = sameLine[0];
    const second = sameLine[1];
    const margin = second ? +(second.dist - best.dist).toFixed(4) : null;
    return { fieldName: f.name, page: f.page, boundingBox: fieldBB,
             label: best.para.content, confidence: computeConfidence(best.dist, margin, best.diConf),
             matchType: 'same-line',
             signals: { distanceIn: best.dist, relativeMarginIn: margin,
                        diConfidence: best.diConf !== null ? +best.diConf.toFixed(4) : null } };
  }

  const above = pageParas
    .filter(p => {
      const pXCtr = p.boundingBox.x + p.boundingBox.w / 2;
      return p.boundingBox.y > yCtr && p.boundingBox.y < yCtr + ABOVE_MAX_Y &&
             Math.abs(pXCtr - xLeft) < ABOVE_MAX_X;
    })
    .sort((a, b) => a.boundingBox.y - b.boundingBox.y);

  if (above.length > 0) {
    const best = above[0];
    return { fieldName: f.name, page: f.page, boundingBox: fieldBB,
             label: best.content, confidence: 'low', matchType: 'above',
             signals: { distanceIn: null, relativeMarginIn: null,
                        diConfidence: avgWordConf(best.boundingBox, f.page) } };
  }

  return { fieldName: f.name, page: f.page, boundingBox: fieldBB,
           label: null, confidence: 'low', matchType: 'none',
           signals: { distanceIn: null, relativeMarginIn: null, diConfidence: null } };
});

writeFileSync(outPath, JSON.stringify(results, null, 2));

// --- Statistika ---
const high = results.filter(r => r.confidence === 'high').length;
const low  = results.filter(r => r.confidence === 'low').length;
const none = results.filter(r => r.matchType === 'none').length;
console.log(`\n=== Poklapanje sa novom formulom (margina + DI confidence) ===`);
console.log(`Ukupno polja: ${results.length}`);
console.log(`  high confidence: ${high}`);
console.log(`  low confidence:  ${low}  (od toga bez labele: ${none})`);
console.log(`\nPragovi: MARGIN_MIN=${MARGIN_MIN}in  DI_CONF_MIN=${DI_CONF_MIN}  SOLO_MAX_DIST=${SOLO_MAX_DIST}in`);

// --- STOP checkpoint: T1, T7, T8, T9 sa svim signalima ---
console.log(`\n=== STOP CHECK: T1, T7, T8, T9 ===`);
console.log(`${'Polje'.padEnd(6)} ${'Label'.padEnd(26)} ${'Conf'.padEnd(6)} ${'Match'.padEnd(10)} ${'Dist'.padEnd(7)} ${'Margin'.padEnd(8)} ${'DiConf'}`);
console.log('-'.repeat(80));

const checkFields = { T1: 'Организациона јединица', T7: 'Општина', T8: 'Место', T9: 'Назив улице' };
// Očekivanje: sve 4 treba da budu high — T1 (jedini kandidat, mala dist), T7/T8/T9 (jasna margina)
let allOk = true;
for (const [name, expected] of Object.entries(checkFields)) {
  const r = results.find(r => r.fieldName === name);
  if (!r) { console.log(`${name}: NEMA u rezultatima`); allOk = false; continue; }
  const labelOk = r.label?.startsWith(expected.slice(0, 5));
  const confOk  = r.confidence === 'high';
  const status  = labelOk && confOk ? '✓' : '✗';
  const s = r.signals;
  console.log(`${status} ${name.padEnd(5)} "${(r.label ?? 'null').slice(0,24).padEnd(24)}" ${r.confidence.padEnd(6)} ${r.matchType.padEnd(10)} ${(s.distanceIn?.toFixed(3) ?? 'n/a').padEnd(7)} ${(s.relativeMarginIn?.toFixed(3) ?? '∞').padEnd(8)} ${s.diConfidence?.toFixed(3) ?? 'n/a'}`);
  if (!labelOk || !confOk) allOk = false;
}

if (!allOk) {
  console.error('\n⛔ STOP CHECK PAO — formula još nije dobra.');
  process.exit(1);
}
console.log('\n✅ STOP check prošao — T1 high (jedini kandidat), T7/T8/T9 high (jasna margina).');
console.log('   Spreman za Korak 4 — kalibracioni harness.');
