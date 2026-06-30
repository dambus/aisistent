import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const pdfPath = process.argv[2];
if (!pdfPath) { console.error('Usage: node scripts/inspect-acroform.mjs <path-to-pdf>'); process.exit(1); }

const pdf = await PDFDocument.load(fs.readFileSync(pdfPath));
const form = pdf.getForm();
const fields = form.getFields();

// Mapiraj ref -> pageIndex za brzo traženje
const pages = pdf.getPages();
const pageRefMap = new Map();
pages.forEach((page, i) => pageRefMap.set(page.ref.toString(), i + 1));

const result = { ukupnoPolja: fields.length, fields: {} };

for (const field of fields) {
  const name = field.getName();
  const type = field.constructor.name.replace('PDF', '');
  const widgets = field.acroField.getWidgets();
  for (const w of widgets) {
    const r = w.getRectangle();
    const pageRef = w.P();
    const page = pageRef ? (pageRefMap.get(pageRef.toString()) ?? null) : null;
    result.fields[name] = { type, page, x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  }
}

console.log(JSON.stringify(result, null, 2));
