#!/usr/bin/env node
// Korak 5A test — fillAcroFormFields na PPDG-1S sa test vrednostima

import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument, PDFTextField } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fontkit = require('fontkit');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PDF_PATH  = process.argv[2] ?? 'C:/Users/milan/Downloads/PPDG-1S-p.pdf';
const CAL_PATH  = path.join(ROOT, 'scripts/output/PPDG-1S-p-calibration.json');
const OUT_PATH  = path.join(ROOT, 'scripts/output/PPDG-1S-filled.pdf');
const FONT_PATH = path.join(ROOT, 'public/fonts/Roboto-Regular.ttf');

// Test vrednosti — simuliraju profil firme
const TEST_VALUES = {
  // Mapiramo po labeli (iz calibration JSONa)
  'ПИБ':                  '123456789',
  'Матични број':         '87654321',
  'Пословно ime':         'Тест д.о.о.',
  'Пословно ime правног': 'Тест д.о.о.',
  'Адреса':               'Улица тест 42',
  'Општина':              'Врачар',
  'Место':                'Београд',
  'Телефон':              '011/234-567',
  'Е-пошта':              'test@primer.rs',
  'Е-маил':               'test@primer.rs',
};

const SIGNATURE_LABELS = [
  'потпис', 'potpis', 'одговорно лице', 'директор',
  'ovlašćeno', 'ovlasceno', 'печат', 'pecat', 'м.п',
];

function isSignature(label) {
  if (!label) return false;
  return SIGNATURE_LABELS.some(s => label.toLowerCase().includes(s));
}

// ─── Učitaj kalibracioni JSON ─────────────────────────────────────────────────
const cal = JSON.parse(readFileSync(CAL_PATH, 'utf8'));
console.log(`Kalibracioni JSON: ${cal.fields.length} polja`);

// Mapa label → fieldName (AcroForm ime)
const labelToField = new Map();
for (const f of cal.fields) {
  if (f.label && f.fieldName) {
    labelToField.set(f.label.trim(), f.fieldName);
  }
}

// ─── Učitaj PDF ───────────────────────────────────────────────────────────────
const pdfBytes = readFileSync(PDF_PATH);
const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
pdfDoc.registerFontkit(fontkit);
const fontBytes = readFileSync(FONT_PATH);
const customFont = await pdfDoc.embedFont(fontBytes);
const form = pdfDoc.getForm();

// ─── Upiši vrednosti ──────────────────────────────────────────────────────────
let filled = 0, skippedSig = 0, skippedNoVal = 0, skippedNotFound = 0;

// Prikaži prvih 20 kalibr. polja da vidimo labele i fieldName-ove
console.log('\nPrvih 20 polja iz calibration JSON:');
cal.fields.slice(0, 20).forEach(f =>
  console.log(`  ${f.fieldName} | label: ${JSON.stringify(f.label)}`)
);

console.log('\nUpisujem vrednosti...');
for (const f of cal.fields) {
  const label = f.label?.trim() ?? null;
  if (!label) { skippedNoVal++; continue; }
  if (isSignature(label)) { skippedSig++; continue; }

  const value = TEST_VALUES[label] ?? null;
  if (!value) { skippedNoVal++; continue; }

  const fieldName = f.fieldName;
  let pdfField;
  try {
    pdfField = form.getField(fieldName);
  } catch {
    console.log(`  ⚠ Nije pronađeno AcroForm polje: ${fieldName}`);
    skippedNotFound++;
    continue;
  }

  if (!(pdfField instanceof PDFTextField)) {
    skippedNotFound++;
    continue;
  }

  const maxLen = pdfField.getMaxLength();
  const finalVal = maxLen !== undefined && value.length > maxLen
    ? value.slice(0, maxLen)
    : value;
  pdfField.setFontSize(0); // auto-size
  pdfField.setText(finalVal);
  console.log(`  ✓ ${fieldName} (${label}) → "${finalVal}"${maxLen !== undefined ? ` [max=${maxLen}]` : ''}`);
  filled++;
}

// Jedan updateFieldAppearances za sve — konzistentan font size
form.updateFieldAppearances(customFont);

// ─── Sačuvaj ─────────────────────────────────────────────────────────────────
const outBytes = await pdfDoc.save();
writeFileSync(OUT_PATH, outBytes);

console.log(`\n📊 Rezultat:`);
console.log(`  Upisano: ${filled}`);
console.log(`  Preskočeno (potpis): ${skippedSig}`);
console.log(`  Preskočeno (nema vrednosti): ${skippedNoVal}`);
console.log(`  Preskočeno (polje nije pronađeno): ${skippedNotFound}`);
console.log(`\n✅ Sačuvano: ${OUT_PATH}`);
console.log('Otvori PPDG-1S-filled.pdf i proveri da su vrednosti u tačnim AcroForm poljima.');
