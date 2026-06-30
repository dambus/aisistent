// Test skripta za Korak 1 — Azure DI analyzeLayout modul (novi SDK @azure-rest/ai-document-intelligence)
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

config({ path: '.env.local' });

import DocumentIntelligence, { getLongRunningPoller, isUnexpected } from '@azure-rest/ai-document-intelligence';

const pdfPath = process.argv[2];
const label   = process.argv[3] || path.basename(pdfPath, '.pdf');
const outPath = `scripts/output/${label}-di-raw.json`;

if (!pdfPath) { console.error('Usage: node test-analyze-layout.mjs <pdf-path> [label]'); process.exit(1); }

const endpoint = process.env.AZURE_DOC_INTEL_ENDPOINT;
const key      = process.env.AZURE_DOC_INTEL_KEY;
if (!endpoint || !key) { console.error('Nedostaju AZURE env varijable'); process.exit(1); }

console.log(`\n=== ${label} ===`);
console.log(`PDF: ${pdfPath}`);
console.log(`Endpoint: ${endpoint}`);

const client = DocumentIntelligence(endpoint, { key });
const buffer = readFileSync(pdfPath);

const initialResponse = await client
  .path('/documentModels/{modelId}:analyze', 'prebuilt-layout')
  .post({ contentType: 'application/octet-stream', body: buffer });

if (isUnexpected(initialResponse)) {
  console.error('DI greška:', JSON.stringify(initialResponse.body, null, 2));
  process.exit(1);
}

console.log('Zahtev pokrenut, čekam rezultat...');
const poller = getLongRunningPoller(client, initialResponse);
const raw    = (await poller.pollUntilDone()).body;

writeFileSync(outPath, JSON.stringify(raw, null, 2));
console.log(`Raw sačuvan: ${outPath}`);

const r = raw.analyzeResult;
console.log(`\nAPI verzija: ${raw.apiVersion ?? r?.apiVersion ?? '?'}`);
console.log(`Stranica:   ${r?.pages?.length ?? 0}`);
r?.pages?.forEach(p => console.log(`  Str.${p.pageNumber}: ${p.width?.toFixed(3)} x ${p.height?.toFixed(3)} ${p.unit}`));
console.log(`Paragrafa:  ${r?.paragraphs?.length ?? 0}`);
console.log(`Tabela:     ${r?.tables?.length ?? 0}`);
r?.tables?.forEach((t, i) => console.log(`  Tabela ${i+1}: ${t.rowCount} reda x ${t.columnCount} kolona`));

console.log(`\nPrvih 10 paragrafa (str.1):`);
const str1 = (r?.paragraphs ?? []).filter(p => p.boundingRegions?.[0]?.pageNumber === 1).slice(0, 10);
for (const p of str1) {
  const poly = p.boundingRegions?.[0]?.polygon ?? [];
  const x = poly[0]?.toFixed(3) ?? '?';
  const y = poly[1]?.toFixed(3) ?? '?';
  console.log(`  [${x}, ${y}] "${p.content.slice(0, 70)}"`);
}

if (r?.tables?.length > 0) {
  console.log(`\nPrve 5 ćelija tabele 1:`);
  r.tables[0].cells.slice(0, 5).forEach(c =>
    console.log(`  [r${c.rowIndex}c${c.columnIndex}] "${c.content.slice(0, 50)}"`)
  );
}
