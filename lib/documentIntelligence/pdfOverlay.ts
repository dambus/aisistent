import { PDFDocument, PDFPage, PDFTextField, rgb } from 'pdf-lib';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fontkit = require('fontkit') as typeof import('fontkit');
import { readFileSync } from 'fs';
import path from 'path';
import { diToPdfCoords } from './pdfCoordinates';
import { detectScript, toDocumentScript } from './transliterate';
import type { DiLayoutResult } from './analyzeLayout';
import type { GuideField } from '@/types/obrasci';

// Sistematski X offset: DI bbox uključuje border ćelije (~1mm) + 2pt text padding
const TEXT_X_OFFSET_PT = 3;
const FONT_SIZE_MAX = 10;
const FONT_SIZE_MIN = 6;

// Labele koje označavaju potpis — nikad ne upisivati
const SIGNATURE_LABELS = [
  'потпис', 'potpis', 'одговорно лице', 'odgovorno lice',
  'директор', 'direktor', 'ovlašćeno lice', 'ovlasceno lice',
  'lice ovlašćeno', 'lice ovlasceno', 'печат', 'pecat', 'м.п', 'м.п.',
];

function isSignatureField(label: string | null): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return SIGNATURE_LABELS.some((s) => l.includes(s));
}

function getFontPath(): string {
  // Roboto-Regular podržava ćirilicu i već je u projektu
  return path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf');
}

function fitText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
): { text: string; fontSize: number } {
  // Smanjuj font do minimuma
  let size = fontSize;
  while (size > FONT_SIZE_MIN && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  // Ako i dalje ne staje, skrati tekst sa ellipsis
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxWidth) {
    t = t.slice(0, -1);
  }
  if (t !== text) t = t + '…';
  return { text: t, fontSize: size };
}

export interface OverlayResult {
  filledCount: number;
  skippedSignature: number;
  skippedNoValue: number;
  skippedNotFound?: number;
}

/**
 * Korak 5A — upisuje vrednosti u AcroForm text polja.
 * Koristi pdf-lib native form API (setText), ne ručne koordinate.
 * Pozivati PRE flatten() — flatten se radi na kraju u endpoint-u.
 */
export async function fillAcroFormFields(
  pdfDoc: PDFDocument,
  confirmedFields: GuideField[],
  diResult: DiLayoutResult,
): Promise<OverlayResult> {
  const result: OverlayResult = { filledCount: 0, skippedSignature: 0, skippedNoValue: 0, skippedNotFound: 0 };

  pdfDoc.registerFontkit(fontkit as Parameters<typeof pdfDoc.registerFontkit>[0]);
  const fontBytes = readFileSync(getFontPath());
  const customFont = await pdfDoc.embedFont(fontBytes);

  const allText = diResult.paragraphs.map((p) => p.content).join(' ');
  const script = detectScript(allText);

  const form = pdfDoc.getForm();

  for (const field of confirmedFields) {
    if (!field.suggestedValue || field.state === 'manual') {
      result.skippedNoValue++;
      continue;
    }
    if (isSignatureField(field.label)) {
      result.skippedSignature++;
      continue;
    }

    let pdfField;
    try {
      pdfField = form.getField(field.id);
    } catch {
      result.skippedNotFound = (result.skippedNotFound ?? 0) + 1;
      continue;
    }

    if (!(pdfField instanceof PDFTextField)) {
      // Checkboxovi i sl. — preskočiti, posebna logika nije u obuhvatu 5A
      result.skippedNotFound = (result.skippedNotFound ?? 0) + 1;
      continue;
    }

    const value = toDocumentScript(field.suggestedValue, script);
    const maxLen = pdfField.getMaxLength();
    const finalVal = maxLen !== undefined && value.length > maxLen ? value.slice(0, maxLen) : value;
    // Fiksni 9pt — konzistentan font size bez obzira na visinu polja
    pdfField.setFontSize(9);
    pdfField.setText(finalVal);
    result.filledCount++;
  }

  // updateFieldAppearances jednom za sva polja
  form.updateFieldAppearances(customFont);

  return result;
}

/**
 * Korak A — upisuje vrednosti u prazne table-ćelije flat PDF-a.
 * Koristi DI bounding box-ove iz diResult.tables.
 */
export async function fillTableCells(
  pdfDoc: PDFDocument,
  confirmedFields: GuideField[],
  diResult: DiLayoutResult,
): Promise<OverlayResult> {
  const result: OverlayResult = { filledCount: 0, skippedSignature: 0, skippedNoValue: 0 };

  pdfDoc.registerFontkit(fontkit as Parameters<typeof pdfDoc.registerFontkit>[0]);
  const fontBytes = readFileSync(getFontPath());
  const font = await pdfDoc.embedFont(fontBytes);

  // Detektuj pismo dokumenta iz DI content-a
  const allText = diResult.paragraphs.map((p) => p.content).join(' ');
  const script = detectScript(allText);

  // Mapa fieldId → GuideField za brzo lookup
  const fieldMap = new Map(confirmedFields.map((f) => [f.id, f]));

  // Prolazi kroz sve table ćelije iz DI rezultata
  const pages = pdfDoc.getPages();

  for (const [tableIdx, table] of diResult.tables.entries()) {
    for (const cell of table.cells) {
      if (cell.content.trim() !== '') continue; // samo prazne ćelije

      const fieldId = `table${tableIdx}_r${cell.rowIndex}c${cell.columnIndex}_p${cell.page}`;
      const field = fieldMap.get(fieldId);

      if (!field || field.state === 'manual') {
        result.skippedNoValue++;
        continue;
      }
      if (!field.suggestedValue) {
        result.skippedNoValue++;
        continue;
      }
      if (isSignatureField(field.label)) {
        result.skippedSignature++;
        continue;
      }

      const page: PDFPage = pages[cell.page - 1];
      if (!page) continue;

      const { height: pageHeight } = page.getSize();
      const pdf = diToPdfCoords(cell.boundingBox, pageHeight);

      const fontSize = Math.min(pdf.h * 0.6, FONT_SIZE_MAX);
      const maxWidth = pdf.w - TEXT_X_OFFSET_PT * 2;
      const value = toDocumentScript(field.suggestedValue, script);
      const { text, fontSize: finalSize } = fitText(value, maxWidth, fontSize, font);

      // Vertikalni centar ćelije
      const textY = pdf.y + (pdf.h - finalSize) / 2;

      page.drawText(text, {
        x: pdf.x + TEXT_X_OFFSET_PT,
        y: textY,
        size: finalSize,
        font,
        color: rgb(0, 0, 0),
      });

      result.filledCount++;
    }
  }

  return result;
}
