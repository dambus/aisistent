// Proverava sve same-line kandidate za T1/T7/T8/T9 da bismo videli margine
import { readFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

const pdf   = await PDFDocument.load(readFileSync('C:/Users/milan/Downloads/PPDG-1S-p.pdf'));
const pages = pdf.getPages();
const pageHeightsPt = pages.map(p => p.getSize().height);

const raw   = JSON.parse(readFileSync('scripts/output/ppdg1s-di-raw.json'));
const paras = (raw.analyzeResult.paragraphs ?? []).map(p => {
  const region = p.boundingRegions?.[0];
  const poly   = region?.polygon ?? [];
  const xs = [poly[0],poly[2],poly[4],poly[6]].filter(Number.isFinite);
  const ys = [poly[1],poly[3],poly[5],poly[7]].filter(Number.isFinite);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { content: p.content, page: region?.pageNumber ?? 1,
           boundingBox: { x, y, w: Math.max(...xs)-x, h: Math.max(...ys)-y } };
});

// words sa confidence
const words = (raw.analyzeResult.pages ?? []).flatMap(p =>
  (p.words ?? []).map(w => ({
    content: w.content, confidence: w.confidence ?? 0, page: p.pageNumber,
    x: Math.min(w.polygon[0],w.polygon[2],w.polygon[4],w.polygon[6]),
    y: Math.min(w.polygon[1],w.polygon[3],w.polygon[5],w.polygon[7]),
    x2: Math.max(w.polygon[0],w.polygon[2],w.polygon[4],w.polygon[6]),
    y2: Math.max(w.polygon[1],w.polygon[3],w.polygon[5],w.polygon[7]),
  }))
);

function avgConfidence(label, page, bb) {
  const ws = words.filter(w => w.page === page &&
    w.x >= bb.x - 0.02 && w.x2 <= bb.x + bb.w + 0.02 &&
    w.y >= bb.y - 0.02 && w.y2 <= bb.y + bb.h + 0.02);
  if (!ws.length) return null;
  return ws.reduce((s, w) => s + w.confidence, 0) / ws.length;
}

const targets = [
  { name: 'T1', page:1, x:171.1, y:763.8, w:93.3, h:15.2 },
  { name: 'T7', page:1, x:306.9, y:542.3, w:250.5, h:15.2 },
  { name: 'T8', page:1, x:306.9, y:525.3, w:250.5, h:15.2 },
  { name: 'T9', page:1, x:306.9, y:508.3, w:250.5, h:15.2 },
];

for (const t of targets) {
  const pageH = pageHeightsPt[t.page - 1];
  const xLeft = t.x / 72;
  const yCtr  = (pageH - (t.y + t.h / 2)) / 72;
  const pageParas = paras.filter(p => p.page === t.page);

  const sameLine = pageParas
    .filter(p => {
      const pyCtr  = p.boundingBox.y + p.boundingBox.h / 2;
      const pRight = p.boundingBox.x + p.boundingBox.w;
      return Math.abs(pyCtr - yCtr) < 0.12 && pRight <= xLeft + 0.05;
    })
    .map(p => {
      const pRight = p.boundingBox.x + p.boundingBox.w;
      const dist   = xLeft - pRight;
      const conf   = avgConfidence(p.content, t.page, p.boundingBox);
      return { content: p.content, dist: +dist.toFixed(4), diConf: conf };
    })
    .sort((a, b) => a.dist - b.dist);

  const best   = sameLine[0];
  const second = sameLine[1];
  const margin = second ? +(second.dist - best.dist).toFixed(4) : null;

  console.log(`\n${t.name}  xLeft:${xLeft.toFixed(3)}  yCtr:${yCtr.toFixed(3)}`);
  console.log(`  Kandidati (${sameLine.length}):`);
  sameLine.forEach((c, i) => console.log(`    [${i}] dist:${c.dist}  diConf:${c.diConf?.toFixed(3) ?? 'n/a'}  "${c.content}"`));
  console.log(`  Best: "${best?.content}"  dist:${best?.dist}  margin:${margin ?? '∞ (jedini)'}  diConf:${best?.diConf?.toFixed(3) ?? 'n/a'}`);
}
