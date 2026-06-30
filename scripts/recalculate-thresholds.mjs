/**
 * Korak 4 — recalculate-thresholds.mjs
 * Čita akumulirani calibration-data.jsonl i predlaže nove vrednosti pragova.
 *
 * Metodologija:
 *   - Za svaki signal (relativeMarginIn, diConfidence, distanceIn) traži prag koji
 *     maksimizuje F1 score (balans između precision i recall za "high" klasu).
 *   - Predlaže izmenu, NE menja konstante u kodu automatski.
 *   - Minimalni dataset za pouzdanu preporuku: 20 verifikovanih polja.
 *
 * Usage: node scripts/recalculate-thresholds.mjs
 */
import { readFileSync, existsSync } from 'fs';

const JSONL_PATH = 'scripts/calibration-data.jsonl';
if (!existsSync(JSONL_PATH)) {
  console.error(`Nema ${JSONL_PATH}. Pokreni record-ground-truth.mjs prvo.`);
  process.exit(1);
}

const records = readFileSync(JSONL_PATH, 'utf8')
  .split('\n').filter(Boolean)
  .map(l => { try { return JSON.parse(l); } catch { return null; } })
  .filter(Boolean);

console.log(`\n=== Recalculate thresholds ===`);
console.log(`Ukupno zapisa: ${records.length}`);

if (records.length < 5) {
  console.warn('⚠  Premalo podataka (< 5 zapisa). Preporuke nisu pouzdane.');
}

// Grupiše po dokumentu
const byDoc = {};
for (const r of records) {
  if (!byDoc[r.docLabel]) byDoc[r.docLabel] = [];
  byDoc[r.docLabel].push(r);
}
for (const [doc, recs] of Object.entries(byDoc)) {
  const ok = recs.filter(r => r.correct).length;
  console.log(`  ${doc}: ${recs.length} zapisa, ${ok} tačnih (${(ok/recs.length*100).toFixed(0)}%)`);
}

// ─── Funkcija za traženje optimalnog praga ────────────────────────────────────
function findBestThreshold(records, getSignal, direction = 'above') {
  // direction 'above' = signal >= threshold → predict high
  // direction 'below' = signal <= threshold → predict high
  const withSignal = records.filter(r => getSignal(r) !== null);
  if (withSignal.length < 3) return null;

  const values = [...new Set(withSignal.map(getSignal))].sort((a,b) => a-b);
  let bestF1 = 0, bestThreshold = null;

  for (const thresh of values) {
    let tp=0, fp=0, fn=0;
    for (const r of withSignal) {
      const v        = getSignal(r);
      const predHigh = direction === 'above' ? v >= thresh : v <= thresh;
      const actHigh  = r.correct;
      if (predHigh && actHigh) tp++;
      else if (predHigh && !actHigh) fp++;
      else if (!predHigh && actHigh) fn++;
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall    = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1        = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    if (f1 > bestF1) { bestF1 = f1; bestThreshold = thresh; }
  }

  const withThresh = withSignal.filter(r => {
    const v = getSignal(r);
    return direction === 'above' ? v >= bestThreshold : v <= bestThreshold;
  });
  const tp = withThresh.filter(r => r.correct).length;
  const precision = withThresh.length > 0 ? tp / withThresh.length : 0;
  const recall    = records.filter(r => r.correct).length > 0
    ? tp / records.filter(r => r.correct).length : 0;

  return { threshold: bestThreshold, f1: +bestF1.toFixed(3),
           precision: +precision.toFixed(3), recall: +recall.toFixed(3),
           n: withSignal.length };
}

// ─── Analiza po signalu ───────────────────────────────────────────────────────
console.log(`\n─── Relativna margina (MARGIN_MIN) ───`);
const marginResult = findBestThreshold(
  records,
  r => r.signals?.relativeMarginIn ?? null,
  'above'
);
if (marginResult) {
  console.log(`  Optimalni prag: ${marginResult.threshold} in`);
  console.log(`  F1: ${marginResult.f1}  Precision: ${marginResult.precision}  Recall: ${marginResult.recall}`);
  console.log(`  Na osnovu ${marginResult.n} zapisa sa ovim signalom.`);
} else {
  console.log('  Nedovoljno podataka sa relativeMarginIn signalom.');
}

console.log(`\n─── DI confidence (DI_CONF_MIN) ───`);
const confResult = findBestThreshold(
  records,
  r => r.signals?.diConfidence ?? null,
  'above'
);
if (confResult) {
  console.log(`  Optimalni prag: ${confResult.threshold}`);
  console.log(`  F1: ${confResult.f1}  Precision: ${confResult.precision}  Recall: ${confResult.recall}`);
  console.log(`  Na osnovu ${confResult.n} zapisa sa ovim signalom.`);
} else {
  console.log('  Nedovoljno podataka sa diConfidence signalom.');
}

console.log(`\n─── Apsolutna distanca / solo max (SOLO_MAX_DIST) ───`);
const soloRecords = records.filter(r => r.signals?.relativeMarginIn === null);
const soloResult  = findBestThreshold(
  soloRecords,
  r => r.signals?.distanceIn ?? null,
  'below'
);
if (soloResult) {
  console.log(`  Optimalni prag (jedini kandidat): ${soloResult.threshold} in`);
  console.log(`  F1: ${soloResult.f1}  Precision: ${soloResult.precision}  Recall: ${soloResult.recall}`);
  console.log(`  Na osnovu ${soloResult.n} solo zapisa.`);
} else {
  console.log('  Nedovoljno solo zapisa.');
}

// ─── Preporuka ─────────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════════════`);
console.log(`PREDLOG za matchFieldLabels.ts (pregled pa ručna primena):`);
console.log(`═══════════════════════════════════════════════`);
if (marginResult) console.log(`  THRESHOLD_MARGIN_IN    = ${marginResult.threshold}`);
if (confResult)   console.log(`  THRESHOLD_DI_CONF      = ${confResult.threshold}`);
if (soloResult)   console.log(`  THRESHOLD_SOLO_MAX_DIST_IN = ${soloResult.threshold}`);
console.log(`\n⚠  Ovo je PREDLOG — ne menja kod automatski.`);
console.log(`   Primeni ručno u lib/documentIntelligence/matchFieldLabels.ts nakon pregleda.`);
if (records.length < 20) {
  console.log(`\n⚠  Upozorenje: samo ${records.length} zapisa. Preporučeno minimum 20 za pouzdane pragove.`);
}
