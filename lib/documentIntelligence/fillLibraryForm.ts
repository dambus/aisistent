import { PDFDocument, PDFTextField, rgb } from 'pdf-lib';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fontkit = require('fontkit') as typeof import('fontkit');
import { readFileSync } from 'fs';
import path from 'path';
import { diToPdfCoords } from './pdfCoordinates';
import { toDocumentScript } from './transliterate';
import { profileValue, PROFILE_KEYS, type ProfileKey } from './semanticMapper';
import type { Company } from '@/types/database';

// Faza 4 — fill engine za biblioteku kuriranih obrazaca.
// Na download NEMA DI ni Claude poziva: sve (mapiranja, koordinate, pismo) dolazi iz
// library_forms reda, vrednosti iz profila trenutnog korisnika. AcroForm polja ostaju
// ŽIVA (bez flatten) — editabilnost u Adobe-u je poenta featura.

// Jedno verifikovano zeleno mapiranje iz library_forms.fields (vidi FAZA4 spec 4.1).
// Nikad ne sadrži vrednosti — samo strukturu.
export type LibraryField =
  | { kind: 'acroform'; fieldName: string; profileKey: string }
  | { kind: 'flat'; page: number; x: number; y: number; w: number; h: number; profileKey: string };

export type FormScript = 'cyrillic' | 'latin';

const TEXT_X_OFFSET_PT = 3;
const FONT_SIZE_MAX = 10;
const FONT_SIZE_MIN = 6;

function getFontPath(): string {
  return path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf');
}

function fitText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
): { text: string; fontSize: number } {
  let size = fontSize;
  while (size > FONT_SIZE_MIN && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxWidth) {
    t = t.slice(0, -1);
  }
  if (t !== text) t = t + '…';
  return { text: t, fontSize: size };
}

export interface LibraryFillResult {
  bytes: Uint8Array;
  filledCount: number;
  // profileKey postoji u mapiranju ali profil korisnika nema vrednost — polje ostaje prazno
  skippedNoValue: number;
  // acroform polje iz mapiranja ne postoji u PDF-u (zastareo obrazac/mapiranje) — loguje se, ne obara fill
  skippedNotFound: number;
}

export async function fillLibraryForm(
  pdfBytes: Buffer | Uint8Array,
  fields: LibraryField[],
  company: Company,
  script: FormScript,
): Promise<LibraryFillResult> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const result = { filledCount: 0, skippedNoValue: 0, skippedNotFound: 0 };

  pdfDoc.registerFontkit(fontkit as Parameters<typeof pdfDoc.registerFontkit>[0]);
  const fontBytes = readFileSync(getFontPath());
  const customFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  let touchedAcroForm = false;

  for (const field of fields) {
    const key = PROFILE_KEYS.includes(field.profileKey as ProfileKey)
      ? (field.profileKey as ProfileKey)
      : null;
    const rawValue = key ? profileValue(key, company) : null;
    if (!rawValue) {
      result.skippedNoValue++;
      continue;
    }
    const value = toDocumentScript(rawValue, script);

    if (field.kind === 'acroform') {
      let pdfField;
      try {
        pdfField = pdfDoc.getForm().getField(field.fieldName);
      } catch {
        result.skippedNotFound++;
        continue;
      }
      if (!(pdfField instanceof PDFTextField)) {
        result.skippedNotFound++;
        continue;
      }
      const maxLen = pdfField.getMaxLength();
      const finalVal = maxLen !== undefined && value.length > maxLen ? value.slice(0, maxLen) : value;
      pdfField.setFontSize(9);
      pdfField.setText(finalVal);
      touchedAcroForm = true;
      result.filledCount++;
    } else {
      const page = pages[field.page - 1];
      if (!page) {
        result.skippedNotFound++;
        continue;
      }
      const { height: pageHeight } = page.getSize();
      const pdf = diToPdfCoords({ x: field.x, y: field.y, w: field.w, h: field.h }, pageHeight);
      const fontSize = Math.min(pdf.h * 0.6, FONT_SIZE_MAX);
      const maxWidth = pdf.w - TEXT_X_OFFSET_PT * 2;
      const { text, fontSize: finalSize } = fitText(value, maxWidth, fontSize, customFont);
      page.drawText(text, {
        x: pdf.x + TEXT_X_OFFSET_PT,
        y: pdf.y + (pdf.h - finalSize) / 2,
        size: finalSize,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      result.filledCount++;
    }
  }

  // Appearance refresh da upisane vrednosti budu vidljive i van Adobe-a.
  // NAMERNO bez form.flatten() — polja ostaju editabilna (FAZA4 spec, sekcija 5 i 11).
  if (touchedAcroForm) {
    pdfDoc.getForm().updateFieldAppearances(customFont);
  }

  const bytes = await pdfDoc.save();
  return { bytes, ...result };
}
