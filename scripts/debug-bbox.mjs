#!/usr/bin/env node
// Korak 3 — debug koordinatne konverzije
// Crta CRVENI PRAVOUGAONIK (bez teksta) na DI bounding box prve prazne ćelije
// pored "ПИБ" labele u eko-taksa obrascu. Sačuvati kao debug-bbox.pdf.

import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PDF_PATH   = process.argv[2] ?? 'C:/Users/milan/Downloads/Obrazac-1-prijava-EKO-takse.pdf';
const CAL_PATH   = path.join(ROOT, 'scripts/output/Obrazac-1-prijava-EKO-takse-calibration.json');
const OUT_PATH   = path.join(ROOT, 'scripts/output/debug-bbox.pdf');

// ─── 1. Učitaj kalibracioni JSON i nađi polje sa labelom "ПИБ" ───────────────
const cal = JSON.parse(readFileSync(CAL_PATH, 'utf8'));
console.log(`Učitan kalibracioni JSON: ${CAL_PATH}`);
console.log(`Ukupno polja: ${cal.fields.length}`);

// Prikaži sva polja sa labelom da vidimo šta imamo
const pibField = cal.fields.find(f =>
  f.label && (f.label.includes('ПИБ') || f.label.includes('PIB') || f.label.includes('пиб'))
);

if (!pibField) {
  console.log('\nPolja u kalibracionom JSON-u (prva 10):');
  cal.fields.slice(0, 10).forEach(f =>
    console.log(`  ${f.fieldName}: label=${JSON.stringify(f.label)} bb=${JSON.stringify(f.boundingBox)}`)
  );
  console.log('\nNije pronađeno polje sa labelom ПИБ. Koristi prvo dostupno polje...');
}

const targetField = pibField ?? cal.fields[0];
console.log(`\nTarget polje: ${targetField.fieldName}`);
console.log(`Labela: ${JSON.stringify(targetField.label)}`);
console.log(`DI bounding box (inči): ${JSON.stringify(targetField.boundingBox)}`);

// ─── 2. Učitaj PDF i dobavi visinu stranice ───────────────────────────────────
const pdfBytes = readFileSync(PDF_PATH);
const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
const pages = pdfDoc.getPages();
const page = pages[(targetField.page ?? 1) - 1] ?? pages[0];
const { height: pageHeight } = page.getSize();
console.log(`\nStranica: ${targetField.page ?? 1} | pageHeight: ${pageHeight.toFixed(1)} pt`);

// ─── 3. Konvertuj DI koordinate u pdf-lib koordinate ─────────────────────────
const bb = targetField.boundingBox; // { x, y, w, h } u inčima
const x  = bb.x * 72;
const y  = pageHeight - (bb.y + bb.h) * 72;   // Y-flip
const w  = bb.w * 72;
const h  = bb.h * 72;

console.log(`\nKonvertovane pdf-lib koordinate (pt):`);
console.log(`  x=${x.toFixed(1)}  y=${y.toFixed(1)}  w=${w.toFixed(1)}  h=${h.toFixed(1)}`);

// ─── 4. Nacrtaj SAMO crveni pravougaonik — bez teksta ────────────────────────
page.drawRectangle({
  x, y, width: w, height: h,
  borderColor: rgb(1, 0, 0),
  borderWidth: 1.5,
  opacity: 0,            // providna unutrašnjost — ne prekriva originalni sadržaj
  borderOpacity: 1,
});

// ─── 5. Sačuvaj debug PDF ─────────────────────────────────────────────────────
const outBytes = await pdfDoc.save();
writeFileSync(OUT_PATH, outBytes);
console.log(`\n✅ Sačuvano: ${OUT_PATH}`);
console.log('Otvori debug-bbox.pdf i proveri da je crveni pravougaonik TAČNO na praznoj ćeliji pored ПИБ labele.');
console.log('Ako je pomeren ili pogrešno skaliran — STANI i prijavi pre nego što nastaviš na Korak 4.');
