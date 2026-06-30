/**
 * Korak 4 — record-ground-truth.mjs
 * Interaktivni CLI za unos tačno/netačno za svako polje iz kalibracionog JSON-a.
 * Potvrde se akumuliraju u scripts/calibration-data.jsonl (jedan red = jedno polje).
 *
 * Pokreće mini HTTP server na portu 7789 koji servira overlay HTML.
 * Za svako polje ispisuje URL sa hashem — otvori u browseru i drži na drugom monitoru;
 * overlay automatski highlightuje trenutno polje i skroluje do njega.
 *
 * Usage: node scripts/record-ground-truth.mjs <calibration-json>
 * Tipke: y=tačno  n=netačno  s=preskoči  q=izlaz
 */
import { readFileSync, appendFileSync, existsSync } from 'fs';
import * as readline from 'readline';
import { createServer } from 'http';
import path from 'path';

const calPath = process.argv[2];
if (!calPath || !existsSync(calPath)) {
  console.error('Usage: node scripts/record-ground-truth.mjs <calibration-json>');
  console.error('Generiši ga prvo sa: node scripts/run-calibration-test.mjs <pdf>');
  process.exit(1);
}

const JSONL_PATH = 'scripts/calibration-data.jsonl';
const PORT       = 7789;

const cal    = JSON.parse(readFileSync(calPath));
const label  = cal._meta.label;
const fields = cal.fields;

// Putanja do overlay HTML — u istom direktorijumu kao calibration JSON
const calDir     = path.dirname(path.resolve(calPath));
const htmlFile   = `${label}-overlay.html`;
const htmlPath   = path.join(calDir, htmlFile);

// Mini HTTP server za overlay
const server = createServer((req, res) => {
  const file = req.url === '/' ? htmlFile : req.url.replace(/^\//, '').split('?')[0].split('#')[0];
  const fullPath = path.join(calDir, file);
  try {
    const body = readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8',
                         'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

if (existsSync(htmlPath)) {
  server.listen(PORT, () => {
    console.log(`\nOverlay server: http://localhost:${PORT}/${htmlFile}`);
    console.log(`Otvori gornji URL u browseru — polje će se automatski highlight-ovati.\n`);
  });
} else {
  console.log(`\nNapomena: overlay HTML nije pronađen (${htmlPath}).`);
  console.log(`Pokreni run-calibration-test.mjs da ga generišeš za vizuelni prikaz.\n`);
}

// Pronađi već unesene zapise za ovaj dokument
const existing = new Set();
if (existsSync(JSONL_PATH)) {
  for (const line of readFileSync(JSONL_PATH, 'utf8').split('\n').filter(Boolean)) {
    try {
      const r = JSON.parse(line);
      if (r.docLabel === label) existing.add(r.fieldName);
    } catch {}
  }
}

const pending = fields.filter(f => !existing.has(f.fieldName) && f.matchType !== 'none');
console.log(`=== Ground truth unos: ${label} ===`);
console.log(`Ukupno polja: ${fields.length}  |  Već uneseno: ${existing.size}  |  Preostalo: ${pending.length}`);
if (!pending.length) {
  console.log('Sva polja su već unesena.');
  server.close();
  process.exit(0);
}
console.log(`\nZa svako polje upiši:  y = tačno  |  n = netačno  |  s = preskoči  |  q = izlaz\n`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

let done = 0;
for (const f of pending) {
  const s = f.signals;

  // Ispiši URL za vizuelni pregled u browseru
  const overlayUrl = existsSync(htmlPath)
    ? `http://localhost:${PORT}/${htmlFile}#${f.fieldName}`
    : null;

  console.log(`\n[${done+1}/${pending.length}]  ${f.fieldName}  (str.${f.page})`);
  if (overlayUrl) console.log(`  Overlay:   ${overlayUrl}`);
  console.log(`  Labela:    "${f.label}"`);
  console.log(`  Confidence: ${f.confidence}  (${f.matchType})`);
  console.log(`  Dist:      ${s.distanceIn?.toFixed(3) ?? 'n/a'} in`);
  console.log(`  Margina:   ${s.relativeMarginIn?.toFixed(3) ?? '∞'} in`);
  console.log(`  DI conf:   ${s.diConfidence?.toFixed(3) ?? 'n/a'}`);

  const ans = (await ask('  > ')).trim().toLowerCase();
  if (ans === 'q') { console.log('Izlaz.'); break; }
  if (ans === 's') { console.log('  Preskočeno.'); continue; }

  const correct = ans === 'y';
  const record = {
    docLabel: label, fieldName: f.fieldName, page: f.page,
    label: f.label, correct,
    confidence: f.confidence, matchType: f.matchType,
    signals: f.signals,
    recordedAt: new Date().toISOString(),
  };
  appendFileSync(JSONL_PATH, JSON.stringify(record) + '\n');
  console.log(`  → ${correct ? 'Tačno ✓' : 'Netačno ✗'} — sačuvano`);
  done++;
}

rl.close();
server.close();
console.log(`\nSačuvano ${done} novih zapisa u ${JSONL_PATH}.`);
