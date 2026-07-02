import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  type AnalyzeResultOutput,
} from '@azure-rest/ai-document-intelligence';

export interface DiWord {
  content: string;
  confidence: number; // DI per-word confidence, koristi se u formuli praga pouzdanosti (spec 5.4)
  boundingBox: { x: number; y: number; w: number; h: number };
  page: number;
}

export interface DiParagraph {
  content: string;
  boundingBox: { x: number; y: number; w: number; h: number };
  page: number;
}

export interface DiCell {
  rowIndex: number;
  columnIndex: number;
  content: string;
  boundingBox: { x: number; y: number; w: number; h: number };
  page: number;
}

export interface DiTable {
  rowCount: number;
  columnCount: number;
  cells: DiCell[];
}

export interface DiPage {
  pageNumber: number;
  width: number;
  height: number;
  unit: string;
}

// Jedna vizuelna linija teksta. Koristiti za same-line matching umesto paragraphs —
// DI ponekad spaja više vizuelnih redova u jedan paragraph (npr. naslov koji se prelama
// + labela ispod njega), što pomera centar paragrafa van same-line praga polja.
// lines su uvek jednolinijski pa je njihov vertikalni centar pouzdan za poređenje.
export interface DiLine {
  content: string;
  boundingBox: { x: number; y: number; w: number; h: number };
  page: number;
}

export interface DiSelectionMark {
  state: 'selected' | 'unselected';
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number };
  page: number;
}

export interface DiLayoutResult {
  pages: DiPage[];
  paragraphs: DiParagraph[]; // koristiti samo za "above" fallback
  lines: DiLine[];            // koristiti za same-line matching
  tables: DiTable[];
  words: DiWord[];            // potrebno za confidence signal u kalibracionom harnessu (spec 5.4)
  selectionMarks: DiSelectionMark[];
  _raw?: AnalyzeResultOutput;
}

function toBoundingBox(polygon: number[] | undefined): { x: number; y: number; w: number; h: number } {
  // novi SDK vraća flat number[] [x0,y0, x1,y1, x2,y2, x3,y3]
  if (!polygon || polygon.length < 8) return { x: 0, y: 0, w: 0, h: 0 };
  const xs = [polygon[0], polygon[2], polygon[4], polygon[6]];
  const ys = [polygon[1], polygon[3], polygon[5], polygon[7]];
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export interface AnalyzeLayoutOptions {
  // Ogranicava DI analizu na dati opseg strana (npr. "1") — koristi se za jeftin
  // fingerprint poziv koji ne treba pun dokument. Isti model/verzija kao pun poziv,
  // samo uzi query parametar.
  pages?: string;
}

export async function analyzeLayout(input: Buffer, options?: AnalyzeLayoutOptions): Promise<DiLayoutResult> {
  const endpoint = process.env.AZURE_DOC_INTEL_ENDPOINT;
  const key = process.env.AZURE_DOC_INTEL_KEY;
  if (!endpoint || !key) throw new Error('AZURE_DOC_INTEL_ENDPOINT i AZURE_DOC_INTEL_KEY moraju biti postavljeni u .env');

  const client = DocumentIntelligence(endpoint, { key });

  const initialResponse = await client
    .path('/documentModels/{modelId}:analyze', 'prebuilt-layout')
    .post({
      contentType: 'application/octet-stream',
      body: input,
      queryParameters: options?.pages ? { pages: options.pages } : undefined,
    });

  if (isUnexpected(initialResponse)) {
    throw new Error(`DI greška: ${JSON.stringify(initialResponse.body)}`);
  }

  const poller = getLongRunningPoller(client, initialResponse);
  const result = (await poller.pollUntilDone()).body as { analyzeResult?: AnalyzeResultOutput };
  const analyzeResult = result.analyzeResult;
  if (!analyzeResult) throw new Error('DI nije vratio analyzeResult');

  const pages: DiPage[] = (analyzeResult.pages ?? []).map((p) => ({
    pageNumber: p.pageNumber,
    width: p.width ?? 0,
    height: p.height ?? 0,
    unit: p.unit ?? 'inch',
  }));

  const paragraphs: DiParagraph[] = (analyzeResult.paragraphs ?? []).map((p) => {
    const region = p.boundingRegions?.[0];
    return {
      content: p.content,
      boundingBox: toBoundingBox(region?.polygon),
      page: region?.pageNumber ?? 1,
    };
  });

  const tables: DiTable[] = (analyzeResult.tables ?? []).map((t) => ({
    rowCount: t.rowCount,
    columnCount: t.columnCount,
    cells: t.cells.map((c) => {
      const region = c.boundingRegions?.[0];
      return {
        rowIndex: c.rowIndex,
        columnIndex: c.columnIndex,
        content: c.content,
        boundingBox: toBoundingBox(region?.polygon),
        page: region?.pageNumber ?? 1,
      };
    }),
  }));

  const lines: DiLine[] = (analyzeResult.pages ?? []).flatMap((p) =>
    (p.lines ?? []).map((l) => ({
      content: l.content,
      boundingBox: toBoundingBox(l.polygon),
      page: p.pageNumber,
    }))
  );

  const words: DiWord[] = (analyzeResult.pages ?? []).flatMap((p) =>
    (p.words ?? []).map((w) => ({
      content: w.content,
      confidence: w.confidence ?? 0,
      boundingBox: toBoundingBox(w.polygon),
      page: p.pageNumber,
    }))
  );

  const selectionMarks: DiSelectionMark[] = (analyzeResult.pages ?? []).flatMap((p) =>
    ((p as any).selectionMarks ?? []).map((s: any) => ({
      state: s.state as 'selected' | 'unselected',
      confidence: s.confidence ?? 0,
      boundingBox: toBoundingBox(s.polygon),
      page: p.pageNumber,
    }))
  );

  return { pages, paragraphs, lines, tables, words, selectionMarks, _raw: analyzeResult };
}
