import { createHash } from 'crypto';
import { PDFDocument } from 'pdf-lib';
import { analyzeLayout } from './analyzeLayout';

// Identifikuje "isti obrazac" bez obzira na metadata/kompresiju razlike između kopija.
// page_count i acroform field count su lokalni (pdf-lib, besplatno) — jedino OCR
// sadržaj prve strane zahteva DI poziv, i to ogranicen na stranu 1 (jeftinije od punog).
export interface FingerprintResult {
  fingerprint: string;
  pageCount: number;
  acroFormFieldCount: number;
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function computeFingerprint(buffer: Buffer): Promise<FingerprintResult> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const acroFormFieldCount = pdfDoc.getForm().getFields().length;

  const firstPage = await analyzeLayout(buffer, { pages: '1' });
  const rawContent = firstPage.paragraphs.map((p) => p.content).join(' ');
  const normalizedContent = normalize(rawContent).slice(0, 500);

  const fingerprint = createHash('sha256')
    .update(`${pageCount}|${normalizedContent}|${acroFormFieldCount}`)
    .digest('hex');

  return { fingerprint, pageCount, acroFormFieldCount };
}
