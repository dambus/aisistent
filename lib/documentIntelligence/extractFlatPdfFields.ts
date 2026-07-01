import type { DiLayoutResult, DiCell } from './analyzeLayout';

export interface FlatPdfField {
  id: string;
  page: number;
  boundingBox: { x: number; y: number; w: number; h: number };
  label: string | null;
  labelBoundingBox: { x: number; y: number; w: number; h: number } | null;
  confidence: 'high' | 'low';
  sourceType: 'table-cell' | 'selection-mark' | 'underline';
}

// Horizontalni prag za "ista linija" — isti kao u AcroForm grani
const SAME_LINE_Y_IN = 0.12;

// Regex za linije podvlake (4+ uzastopna ista znaka): ___, ---, ...
const UNDERLINE_RE = /^[_\-\.]{4,}$/;

function isEmpty(content: string): boolean {
  const t = content.trim();
  return t === '' || t === ':unselected:' || t === ':selected:';
}

function isSelectionMark(content: string): boolean {
  const t = content.trim();
  return t === ':selected:' || t === ':unselected:';
}

function isUnderline(content: string): boolean {
  return UNDERLINE_RE.test(content.trim());
}

function rightEdge(bb: { x: number; y: number; w: number; h: number }): number {
  return bb.x + bb.w;
}

function yCenter(bb: { x: number; y: number; w: number; h: number }): number {
  return bb.y + bb.h / 2;
}

// Proverava da li centar bounding box-a pada unutar neke tabelarne ćelije
function isInsideTable(
  page: number,
  bb: { x: number; y: number; w: number; h: number },
  cellBBs: Array<{ page: number; bb: { x: number; y: number; w: number; h: number } }>,
): boolean {
  const cx = bb.x + bb.w / 2;
  const cy = bb.y + bb.h / 2;
  return cellBBs.some(
    (c) =>
      c.page === page &&
      cx >= c.bb.x && cx <= c.bb.x + c.bb.w &&
      cy >= c.bb.y && cy <= c.bb.y + c.bb.h,
  );
}

// Max Y prag za "above" fallback za textarea polja (visina > ovog praga)
const TEXTAREA_HEIGHT_THRESHOLD_IN = 0.5;
const ABOVE_MAX_Y_TEXTAREA_IN = 2.0;

export function extractFlatPdfFields(di: DiLayoutResult): FlatPdfField[] {
  const fields: FlatPdfField[] = [];

  // Sve bounding box-ove tabela — za isključivanje linija koje padaju unutar tabele
  const cellBBs = di.tables.flatMap((t) =>
    t.cells.map((c) => ({ page: c.page, bb: c.boundingBox })),
  );

  // ── 1. TABELE — primarni mehanizam (high confidence) ───────────────────────
  //
  // Prazne ćelije u tabelama su najstrukturiraniji signal u flat PDF-u.
  // DI precizno daje rowIndex/columnIndex, pa je pronalaženje labele
  // deterministično: najbliža neprazna ćelija u istom redu levo.

  di.tables.forEach((table, tableIdx) => {
    // Grupiši ćelije po redu
    const rowMap = new Map<number, DiCell[]>();
    for (const cell of table.cells) {
      if (!rowMap.has(cell.rowIndex)) rowMap.set(cell.rowIndex, []);
      rowMap.get(cell.rowIndex)!.push(cell);
    }

    for (const [rowIdx, cells] of rowMap.entries()) {
      const sorted = [...cells].sort((a, b) => a.columnIndex - b.columnIndex);

      for (const cell of sorted) {
        if (!isEmpty(cell.content)) continue;

        // Labela: najbliža neprazna ćelija u istom redu LEVO
        const leftCandidates = sorted.filter(
          (c) => c.columnIndex < cell.columnIndex && !isEmpty(c.content),
        );
        const labelCell = leftCandidates.at(-1) ?? null; // highest colIdx still left of empty

        // Fallback 1: prethodni red, isti columnIndex
        let aboveCell: DiCell | null = null;
        if (!labelCell) {
          const prevRow = rowMap.get(rowIdx - 1) ?? [];
          aboveCell =
            prevRow.find((c) => c.columnIndex === cell.columnIndex && !isEmpty(c.content)) ?? null;
        }

        // Fallback 2: DI line van tabele na istoj Y liniji levo od ćelije
        // Pokriva slučaj kada je labela reda tekstualni blok van tabele (ne ćelija)
        let externalLine: { content: string; boundingBox: { x: number; y: number; w: number; h: number } } | null = null;
        if (!labelCell && !aboveCell) {
          const cellYCtr = yCenter(cell.boundingBox);
          const cellXLeft = cell.boundingBox.x;
          const candidates = di.lines.filter((l) => {
            if (l.page !== cell.page) return false;
            if (isInsideTable(l.page, l.boundingBox, cellBBs)) return false;
            return (
              Math.abs(yCenter(l.boundingBox) - cellYCtr) < SAME_LINE_Y_IN &&
              rightEdge(l.boundingBox) <= cellXLeft + 0.05
            );
          });
          if (candidates.length > 0) {
            candidates.sort((a, b) => (cellXLeft - rightEdge(a.boundingBox)) - (cellXLeft - rightEdge(b.boundingBox)));
            externalLine = candidates[0];
          }
        }

        const found = labelCell ?? aboveCell ?? externalLine;
        const confidence: 'high' | 'low' = (labelCell || aboveCell) ? 'high' : (externalLine ? 'low' : 'low');

        fields.push({
          id: `table${tableIdx}_r${rowIdx}c${cell.columnIndex}_p${cell.page}`,
          page: cell.page,
          boundingBox: cell.boundingBox,
          label: found?.content ?? null,
          labelBoundingBox: found?.boundingBox ?? null,
          confidence,
          sourceType: isSelectionMark(cell.content) ? 'selection-mark' : 'table-cell',
        });
      }
    }
  });

  // ── 2. STANDALONE SELECTION MARKS — checkboxovi van tabela ────────────────
  //
  // DI vraća selection marks iz pages[i].selectionMarks za checkboxove koji
  // nisu unutar tabela. Label tražimo linijom na istoj Y-osi levo.

  let smIdx = 0;
  for (const sm of di.selectionMarks) {
    if (isInsideTable(sm.page, sm.boundingBox, cellBBs)) continue;

    const smYCtr  = yCenter(sm.boundingBox);
    const smXLeft = sm.boundingBox.x;

    const sameLine = di.lines
      .filter((l) => {
        if (l.page !== sm.page) return false;
        if (isUnderline(l.content)) return false;
        return (
          Math.abs(yCenter(l.boundingBox) - smYCtr) < SAME_LINE_Y_IN &&
          rightEdge(l.boundingBox) <= smXLeft + 0.05
        );
      })
      .sort((a, b) => (smXLeft - rightEdge(a.boundingBox)) - (smXLeft - rightEdge(b.boundingBox)));

    const labelLine = sameLine[0] ?? null;

    fields.push({
      id: `selmark_${smIdx++}_p${sm.page}`,
      page: sm.page,
      boundingBox: sm.boundingBox,
      label: labelLine?.content ?? null,
      labelBoundingBox: labelLine?.boundingBox ?? null,
      confidence: labelLine ? 'high' : 'low',
      sourceType: 'selection-mark',
    });
  }

  // ── 3. PODVLAKE VAN TABELA — sekundarni mehanizam (low confidence) ─────────
  //
  // Linije tipa "______" ili "------" koje DI prepoznaje kao tekst.
  // Van tabela, jer su unutar tabela već pokrivene praznim ćelijama.
  // Uvek low confidence — visual layout je jedini signal, nema strukturiranog
  // bounding box-a za prazno polje.

  let underlineIdx = 0;
  for (const line of di.lines) {
    if (!isUnderline(line.content)) continue;
    if (isInsideTable(line.page, line.boundingBox, cellBBs)) continue;

    const lineYCtr = yCenter(line.boundingBox);
    const lineXLeft = line.boundingBox.x;

    // Labela: tekst na istoj horizontalnoj liniji, levo od podvlake
    const sameLine = di.lines
      .filter((l) => {
        if (l.page !== line.page) return false;
        if (isUnderline(l.content)) return false;
        return (
          Math.abs(yCenter(l.boundingBox) - lineYCtr) < SAME_LINE_Y_IN &&
          rightEdge(l.boundingBox) <= lineXLeft + 0.05
        );
      })
      .sort((a, b) => (lineXLeft - rightEdge(a.boundingBox)) - (lineXLeft - rightEdge(b.boundingBox)));

    const labelLine = sameLine[0] ?? null;

    fields.push({
      id: `underline_${underlineIdx++}_p${line.page}`,
      page: line.page,
      boundingBox: line.boundingBox,
      label: labelLine?.content ?? null,
      labelBoundingBox: labelLine?.boundingBox ?? null,
      confidence: 'low',
      sourceType: 'underline',
    });
  }

  return fields;
}
