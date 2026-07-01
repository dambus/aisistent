#!/usr/bin/env node
// Korak 4 test — fillTableCells na eko-taksa obrascu sa test vrednostima

import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PDF_PATH = process.argv[2] ?? 'C:/Users/milan/Downloads/Obrazac-1-prijava-EKO-takse.pdf';
const CAL_PATH = path.join(ROOT, 'scripts/output/Obrazac-1-prijava-EKO-takse-calibration.json');
const OUT_PATH = path.join(ROOT, 'scripts/output/eko-taksa-filled.pdf');
const FONT_PATH = path.join(ROOT, 'public/fonts/Roboto-Regular.ttf');

// ─── Test vrednosti — simuliraju profil preduzeća ─────────────────────────────
const TEST_VALUES = {
  'ПИБ':               '123456789',
  'PIB':               '123456789',
  'Матични број':      '87654321',
  'Naziv':             'Тест д.о.о.',
  'Назив':             'Тест д.о.о.',
  'Адреса':            'Улица тест 42, Београд',
  'Adresa':            'Ulica test 42, Beograd',
  'Место':             'Београд',
  'Општина':           'Врачар',
  'Општина/Град':      'Врачар',
  'Телефон':           '011/234-567',
  'Е-маил':            'test@primer.rs',
};

const SIGNATURE_LABELS = [
  'потпис', 'potpis', 'одговорно лице', 'direktоr', 'директор',
  'ovlašćeno', 'ovlasceno', 'печат', 'pecat', 'м.п',
];

const TEXT_X_OFFSET_PT = 3;
const FONT_SIZE_MAX = 10;
const FONT_SIZE_MIN = 6;

function isSignature(label) {
  if (!label) return false;
  const l = label.toLowerCase();
  return SIGNATURE_LABELS.some(s => l.includes(s));
}

function latinToCyrillic(text) {
  const map = [
    ['lj','љ'],['Lj','Љ'],['LJ','Љ'],
    ['nj','њ'],['Nj','Њ'],['NJ','Њ'],
    ['dž','џ'],['Dž','Џ'],['DŽ','Џ'],
    ['a','а'],['A','А'],['b','б'],['B','Б'],['c','ц'],['C','Ц'],
    ['č','ч'],['Č','Ч'],['ć','ћ'],['Ć','Ћ'],['d','д'],['D','Д'],
    ['đ','ђ'],['Đ','Ђ'],['e','е'],['E','Е'],['f','ф'],['F','Ф'],
    ['g','г'],['G','Г'],['h','х'],['H','Х'],['i','и'],['I','И'],
    ['j','ј'],['J','Ј'],['k','к'],['K','К'],['l','л'],['L','Л'],
    ['m','м'],['M','М'],['n','н'],['N','Н'],['o','о'],['O','О'],
    ['p','п'],['P','П'],['r','р'],['R','Р'],['s','с'],['S','С'],
    ['š','ш'],['Š','Ш'],['t','т'],['T','Т'],['u','у'],['U','У'],
    ['v','в'],['V','В'],['z','з'],['Z','З'],['ž','ж'],['Ž','Ж'],
  ];
  let r = text;
  for (const [f, t] of map) r = r.split(f).join(t);
  return r;
}

function detectScript(text) {
  let cyr = 0, lat = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c >= 0x0400 && c <= 0x04FF) cyr++;
    else if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A)) lat++;
  }
  return cyr > lat ? 'cyrillic' : 'latin';
}

function toDocScript(value, script) {
  const vs = detectScript(value);
  if (script === 'cyrillic' && vs === 'latin') return latinToCyrillic(value);
  return value;
}

function fitText(text, maxW, size, font) {
  while (size > FONT_SIZE_MIN && font.widthOfTextAtSize(text, size) > maxW) size -= 0.5;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxW) t = t.slice(0, -1);
  if (t !== text) t += '…';
  return { text: t, size };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const cal = JSON.parse(readFileSync(CAL_PATH, 'utf8'));
console.log(`Kalibracioni JSON: ${cal.fields.length} polja`);

// Detektuj pismo dokumenta
const allLabels = cal.fields.map(f => f.label ?? '').join(' ');
const script = detectScript(allLabels);
console.log(`Pismo dokumenta: ${script}`);

const pdfBytes = readFileSync(PDF_PATH);
const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
pdfDoc.registerFontkit(fontkit);
const fontBytes = readFileSync(FONT_PATH);
const font = await pdfDoc.embedFont(fontBytes);
const pages = pdfDoc.getPages();

let filled = 0, skippedSig = 0, skippedNoVal = 0;

for (const field of cal.fields) {
  const label = field.label;
  if (!label) { skippedNoVal++; continue; }
  if (isSignature(label)) { skippedSig++; continue; }

  // Nađi test vrednost po labeli
  const value = TEST_VALUES[label] ?? TEST_VALUES[label.trim()] ?? null;
  if (!value) { skippedNoVal++; continue; }

  const bb = field.boundingBox; // DI inči
  const pageIdx = (field.page ?? 1) - 1;
  const page = pages[pageIdx];
  if (!page) continue;

  const { height: pH } = page.getSize();

  // DI → pdf-lib koordinate
  const x = bb.x * 72;
  const y = pH - (bb.y + bb.h) * 72;
  const w = bb.w * 72;
  const h = bb.h * 72;

  const fontSize = Math.min(h * 0.6, FONT_SIZE_MAX);
  const maxW = w - TEXT_X_OFFSET_PT * 2;
  const displayVal = toDocScript(value, script);
  const { text, size: finalSize } = fitText(displayVal, maxW, fontSize, font);

  const textY = y + (h - finalSize) / 2;

  page.drawText(text, {
    x: x + TEXT_X_OFFSET_PT,
    y: textY,
    size: finalSize,
    font,
    color: rgb(0, 0, 0.8), // plava — da se razlikuje od originalnog sadržaja
  });

  console.log(`  ✓ ${label} → "${text}" @ x=${x.toFixed(0)}pt y=${y.toFixed(0)}pt`);
  filled++;
}

const outBytes = await pdfDoc.save();
writeFileSync(OUT_PATH, outBytes);

console.log(`\n📊 Rezultat:`);
console.log(`  Upisano: ${filled}`);
console.log(`  Preskočeno (potpis): ${skippedSig}`);
console.log(`  Preskočeno (nema vrednosti): ${skippedNoVal}`);
console.log(`\n✅ Sačuvano: ${OUT_PATH}`);
console.log('Otvori eko-taksa-filled.pdf i proveri da su vrednosti unutar ćelija (plava boja).');
