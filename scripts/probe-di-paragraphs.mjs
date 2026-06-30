import { readFileSync } from 'fs';

const raw = JSON.parse(readFileSync('scripts/output/ppdg1s-di-raw.json'));
const paras = raw.analyzeResult.paragraphs.filter(p => p.boundingRegions[0].pageNumber === 1);

// AcroForm koordinate (PDF pts, y od dna) -> DI koordinate (inči, y od vrha)
// page height za A4 = 841.89 pts
const PH = 841.89;
const toYdi = (yPt, hPt) => (PH - (yPt + hPt / 2)) / 72;

const targets = [
  { name: 'T1', xPt: 171.1, yPt: 763.8, hPt: 15.2 },
  { name: 'T7', xPt: 306.9, yPt: 542.3, hPt: 15.2 },
  { name: 'T8', xPt: 306.9, yPt: 525.3, hPt: 15.2 },
  { name: 'T9', xPt: 306.9, yPt: 508.3, hPt: 15.2 },
];

for (const t of targets) {
  const xDi   = t.xPt / 72;
  const yCtr  = toYdi(t.yPt, t.hPt);
  console.log(`\n--- ${t.name}  x_di:${xDi.toFixed(3)}  y_di:${yCtr.toFixed(3)} ---`);

  const candidates = paras.filter(p => {
    const poly   = p.boundingRegions[0].polygon; // [x0,y0, x1,y1, x2,y2, x3,y3]
    const pX     = poly[0], pY = poly[1];
    const pRight = poly[2];
    const pBot   = poly[5];
    const pyCtr  = (pY + pBot) / 2;
    return Math.abs(pyCtr - yCtr) < 0.15 && pRight <= xDi + 0.05;
  });

  if (!candidates.length) {
    // fallback: tražimo iznad
    const above = paras.filter(p => {
      const poly  = p.boundingRegions[0].polygon;
      const pX    = poly[0], pY = poly[1];
      const pRight= poly[2], pBot = poly[5];
      const pXCtr = (pX + pRight) / 2;
      return pY > yCtr && pY < yCtr + 0.35 && Math.abs(pXCtr - xDi) < 1.5;
    });
    if (above.length) {
      console.log('  (nema na liniji — fallback iznad:)');
      above.slice(0, 3).forEach(p => {
        const poly = p.boundingRegions[0].polygon;
        console.log(`  [${poly[0].toFixed(3)},${poly[1].toFixed(3)}] "${p.content.slice(0, 70)}"`);
      });
    } else {
      console.log('  (nema kandidata)');
    }
    continue;
  }

  // Sortiraj po horizontalnoj distanci (najbliži desni rub paragrafa ka levoj ivici polja)
  candidates.sort((a, b) => {
    const aR = a.boundingRegions[0].polygon[2];
    const bR = b.boundingRegions[0].polygon[2];
    return (xDi - aR) - (xDi - bR);
  });

  candidates.forEach(p => {
    const poly  = p.boundingRegions[0].polygon;
    const pRight = poly[2];
    const dist   = (xDi - pRight).toFixed(3);
    console.log(`  dist:${dist}  [${poly[0].toFixed(3)},${poly[1].toFixed(3)}]  "${p.content.slice(0, 70)}"`);
  });
}
