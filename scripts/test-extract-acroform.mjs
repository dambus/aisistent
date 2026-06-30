// Test skripta za Korak 2 — AcroForm ekstrakcija sa page brojevima
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

config({ path: '.env.local' });

const pdfPath = process.argv[2] || 'C:/Users/milan/Downloads/PPDG-1S-p.pdf';
const label   = process.argv[3] || path.basename(pdfPath, '.pdf');
const outPath = `scripts/output/${label}-acroform-fields.json`;

const buffer = readFileSync(pdfPath);
const pdf    = await PDFDocument.load(buffer);
const form   = pdf.getForm();
const pages  = pdf.getPages();

const pageRefMap = new Map();
pages.forEach((page, i) => pageRefMap.set(page.ref.toString(), i + 1));

const fields = [];
for (const field of form.getFields()) {
  const name = field.getName();
  const type = field.constructor.name.replace('PDF', '');
  for (const widget of field.acroField.getWidgets()) {
    const rect    = widget.getRectangle();
    const pageRef = widget.P();
    const page    = pageRef ? (pageRefMap.get(pageRef.toString()) ?? null) : null;
    if (page === null) { console.warn(`UPOZORENJE: Polje "${name}" nema P() referencu`); continue; }
    fields.push({ name, type, page,
      x: +rect.x.toFixed(2), y: +rect.y.toFixed(2),
      w: +rect.width.toFixed(2), h: +rect.height.toFixed(2) });
  }
}

const fieldsByPage = {};
for (const f of fields) fieldsByPage[f.page] = (fieldsByPage[f.page] ?? 0) + 1;

writeFileSync(outPath, JSON.stringify({ totalPages: pages.length, fieldsByPage, fields }, null, 2));
console.log(`\n=== AcroForm ekstrakcija: ${label} ===`);
console.log(`Ukupno stranica (PDF): ${pages.length}`);
console.log(`Ukupno polja: ${fields.length}`);
console.log(`Raspodela po stranicama:`);
for (const [pg, cnt] of Object.entries(fieldsByPage)) console.log(`  Str.${pg}: ${cnt} polja`);

// --- SANITY CHECK ---
// DI je pronašao tabelu potpisa (Mesto/Naziv banke/Broj računa) na str.1.
// Odgovarajuća AcroForm polja (T42/T43/T44, y≈66-67) moraju biti page:1.
// Ako nisu, geometrijsko poklapanje u Koraku 3 će biti pogrešno nizvodno.
console.log(`\n=== SANITY CHECK: tabela potpisa (str.1) ===`);
const signatureFields = fields.filter(f => ['T42','T43','T44'].includes(f.name));
if (signatureFields.length === 0) {
  console.log('  (Nema T42/T43/T44 — možda nije PPDG-1S, preskačem ovaj check)');
} else {
  let ok = true;
  for (const f of signatureFields) {
    const status = f.page === 1 ? '✓' : '✗ GREŠKA';
    console.log(`  ${status}  ${f.name}  page:${f.page}  x:${f.x} y:${f.y}`);
    if (f.page !== 1) ok = false;
  }
  if (!ok) {
    console.error('\n  ⛔ SANITY CHECK PAO — page broj nije tačan. Ne nastavljaj na Korak 3.');
    process.exit(1);
  } else {
    console.log('\n  ✅ Sanity check prošao — page:1 potvrđen za sva tri polja.');
  }
}

console.log(`\nJSON sačuvan: ${outPath}`);
