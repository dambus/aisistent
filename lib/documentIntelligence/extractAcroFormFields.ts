import { PDFDocument } from 'pdf-lib';

export interface AcroFormField {
  name: string;
  type: string;
  page: number; // 1-indexed, programski izvučen iz widget P() reference — ne pretpostavljen
  x: number;    // PDF pts od donjeg levog ugla stranice
  y: number;
  w: number;
  h: number;
}

export interface AcroFormExtractionResult {
  fields: AcroFormField[];
  totalPages: number;
  fieldsByPage: Record<number, number>; // page -> broj polja, za sanity check
}

export async function extractAcroFormFields(input: Buffer): Promise<AcroFormExtractionResult> {
  const pdf = await PDFDocument.load(input);
  const form = pdf.getForm();
  const pages = pdf.getPages();

  // Mapira PDF internal ref string -> page broj (1-indexed)
  // KRITIČNO: ovo mora biti programski izvučeno, ne hardkodovano.
  // Ranija verzija skripte je pretpostavljala broj stranica po y koordinati — to je pogrešno.
  const pageRefMap = new Map<string, number>();
  pages.forEach((page, i) => pageRefMap.set(page.ref.toString(), i + 1));

  const totalPages = pages.length;
  const fields: AcroFormField[] = [];

  for (const field of form.getFields()) {
    const name = field.getName();
    const type = field.constructor.name.replace('PDF', '');

    for (const widget of field.acroField.getWidgets()) {
      const rect = widget.getRectangle();
      const pageRef = widget.P();
      const page = pageRef ? (pageRefMap.get(pageRef.toString()) ?? null) : null;

      if (page === null) {
        // Polje bez validne stranice — ne pretpostavljamo, logujemo kao grešku
        console.warn(`[extractAcroFormFields] Polje "${name}" nema validnu P() referencu — preskočeno`);
        continue;
      }

      fields.push({
        name,
        type,
        page,
        x: +rect.x.toFixed(2),
        y: +rect.y.toFixed(2),
        w: +rect.width.toFixed(2),
        h: +rect.height.toFixed(2),
      });
    }
  }

  // Statistika po stranici za sanity check
  const fieldsByPage: Record<number, number> = {};
  for (const f of fields) {
    fieldsByPage[f.page] = (fieldsByPage[f.page] ?? 0) + 1;
  }

  return { fields, totalPages, fieldsByPage };
}
