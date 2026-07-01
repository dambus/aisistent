import type { AcroFormField } from './extractAcroFormFields';
import type { DiLayoutResult, DiLine, DiParagraph, DiWord } from './analyzeLayout';

// ---------------------------------------------------------------------------
// Pragovi — PRIVREMENE startne vrednosti, biće kalibrisane kroz Korak 4 harness
// ---------------------------------------------------------------------------

// Horizontalna traka za "ista linija" (u inčima)
export const THRESHOLD_SAME_LINE_Y_IN = 0.12;

// Minimalna relativna margina (dist_2nd - dist_best) za high confidence
// na same-line matchevima sa 2+ kandidata. Kalibracioni harness ovo precizira.
export const THRESHOLD_MARGIN_IN = 0.20;

// Minimalni DI confidence prosek reči u pronađenoj labeli
export const THRESHOLD_DI_CONF = 0.80;

// Ako je polje jedini kandidat na liniji, max apsolutna distanca za high confidence.
// Apsolutna distanca je tie-breaker, ne primarni kriterijum.
export const THRESHOLD_SOLO_MAX_DIST_IN = 3.0;

// Fallback "iznad" — uvek low, nema high threshold
const ABOVE_MAX_Y_IN = 0.35;
const ABOVE_MAX_X_IN = 1.5;

// ---------------------------------------------------------------------------

export type MatchConfidence = 'high' | 'low';

export interface FieldMatch {
  fieldName: string;
  page: number;
  boundingBox: { x: number; y: number; w: number; h: number }; // inči, DI koord.
  label: string | null;
  labelBoundingBox: { x: number; y: number; w: number; h: number } | null;
  confidence: MatchConfidence;
  matchType: 'same-line' | 'above' | 'none';
  // Signali koji ulaze u formulu — prikazuju se u kalibracionom harnessu
  signals: {
    distanceIn: number | null;
    relativeMarginIn: number | null; // null = jedini kandidat (∞)
    diConfidence: number | null;     // prosek confidence reči u labeli
  };
}

function acroToDi(
  field: AcroFormField,
  pageHeightPt: number,
): { xLeft: number; yCtr: number; w: number; h: number } {
  return {
    xLeft: field.x / 72,
    yCtr:  (pageHeightPt - (field.y + field.h / 2)) / 72,
    w:     field.w / 72,
    h:     field.h / 72,
  };
}

function rightEdge(bb: { x: number; y: number; w: number; h: number }): number {
  return bb.x + bb.w;
}

function yCenter(bb: { x: number; y: number; w: number; h: number }): number {
  return bb.y + bb.h / 2;
}

/** Prosek DI confidence reči koje se geometrijski poklapaju sa labelom. */
function avgWordConfidence(
  bb: { x: number; y: number; w: number; h: number },
  page: number,
  words: DiWord[],
): number | null {
  const TOL = 0.03; // inči tolerancija za rubove
  const ws = words.filter(
    (w) =>
      w.page === page &&
      w.boundingBox.x >= bb.x - TOL &&
      w.boundingBox.x + w.boundingBox.w <= bb.x + bb.w + TOL &&
      w.boundingBox.y >= bb.y - TOL &&
      w.boundingBox.y + w.boundingBox.h <= bb.y + bb.h + TOL,
  );
  if (!ws.length) return null;
  return ws.reduce((s, w) => s + w.confidence, 0) / ws.length;
}

/**
 * Izračunava confidence status na osnovu tri signala:
 *   1. Relativna margina (primarna) — razlika između distance do najbližeg i drugog kandida
 *   2. DI confidence (sekundarna) — prosek OCR confidence reči u labeli
 *   3. Apsolutna distanca (tie-breaker) — koristi se samo kad je kandidat jedini na liniji
 *
 * Apsolutna distanca sama po sebi NIJE dovoljna za high confidence.
 */
function computeConfidence(
  dist: number,
  margin: number | null, // null = jedini kandidat
  diConf: number | null,
): MatchConfidence {
  const confOk = diConf === null || diConf >= THRESHOLD_DI_CONF;

  if (margin === null) {
    // Jedini kandidat na liniji — nema konkurencije, apsolutna distanca kao tie-breaker
    return dist <= THRESHOLD_SOLO_MAX_DIST_IN && confOk ? 'high' : 'low';
  }

  // Više kandidata — relativna margina je primarna
  return margin >= THRESHOLD_MARGIN_IN && confOk ? 'high' : 'low';
}

export function matchFieldLabels(
  fields: AcroFormField[],
  di: DiLayoutResult,
  pageHeightsPt: number[],
): FieldMatch[] {
  const results: FieldMatch[] = [];

  for (const field of fields) {
    const pageHeightPt = pageHeightsPt[field.page - 1] ?? 841.89;
    const fc           = acroToDi(field, pageHeightPt);
    const fieldBB      = { x: fc.xLeft, y: fc.yCtr - fc.h / 2, w: fc.w, h: fc.h };

    // 1. Same-line matching: koristimo lines (jednolinijski), ne paragraphs.
    //    Paragraphs DI ponekad spaja više vizuelnih redova u jedan item — tada je
    //    vertikalni centar paragrafa van same-line praga čak i za ispravnu labelu.
    //    Lines su uvek jednolinijske pa je njihov yCtr pouzdan za poređenje.
    const pageLines = di.lines.filter((l) => l.page === field.page);
    const sameLine = pageLines
      .filter((l) => {
        return (
          Math.abs(yCenter(l.boundingBox) - fc.yCtr) < THRESHOLD_SAME_LINE_Y_IN &&
          rightEdge(l.boundingBox) <= fc.xLeft + 0.05
        );
      })
      .map((l) => ({
        content:  l.content,
        boundingBox: l.boundingBox,
        dist:     +(fc.xLeft - rightEdge(l.boundingBox)).toFixed(4),
        diConf:   avgWordConfidence(l.boundingBox, field.page, di.words),
      }))
      .sort((a, b) => a.dist - b.dist);

    if (sameLine.length > 0) {
      const best   = sameLine[0];
      const second = sameLine[1];
      const margin = second ? +(second.dist - best.dist).toFixed(4) : null;
      const conf   = computeConfidence(best.dist, margin, best.diConf);

      results.push({
        fieldName:        field.name,
        page:             field.page,
        boundingBox:      fieldBB,
        label:            best.content,
        labelBoundingBox: best.boundingBox,
        confidence:       conf,
        matchType:        'same-line',
        signals: {
          distanceIn:       best.dist,
          relativeMarginIn: margin,
          diConfidence:     best.diConf !== null ? +best.diConf.toFixed(4) : null,
        },
      });
      continue;
    }

    // 1b. Same-line desno — labela je desno od polja (npr. checkbox + numerisana lista).
    //     Uvek low confidence jer je neobičan raspored; služi kao fallback pre "above".
    const SAME_LINE_RIGHT_MAX_DIST_IN = 0.5;
    const fieldRightEdge = fc.xLeft + fc.w;
    const sameLineRight = pageLines
      .filter((l) => {
        return (
          Math.abs(yCenter(l.boundingBox) - fc.yCtr) < THRESHOLD_SAME_LINE_Y_IN &&
          l.boundingBox.x >= fieldRightEdge - 0.05 &&
          l.boundingBox.x - fieldRightEdge <= SAME_LINE_RIGHT_MAX_DIST_IN
        );
      })
      .map((l) => ({
        content:     l.content,
        boundingBox: l.boundingBox,
        dist:        +(l.boundingBox.x - fieldRightEdge).toFixed(4),
        diConf:      avgWordConfidence(l.boundingBox, field.page, di.words),
      }))
      .sort((a, b) => a.dist - b.dist);

    if (sameLineRight.length > 0) {
      const best = sameLineRight[0];
      results.push({
        fieldName:        field.name,
        page:             field.page,
        boundingBox:      fieldBB,
        label:            best.content,
        labelBoundingBox: best.boundingBox,
        confidence:       'low',
        matchType:        'same-line',
        signals: {
          distanceIn:       best.dist,
          relativeMarginIn: null,
          diConfidence:     best.diConf !== null ? +best.diConf.toFixed(4) : null,
        },
      });
      continue;
    }

    // 2. Fallback: labela iznad polja — paragraphs su ok za ovu heuristiku
    //    jer ne radimo precizno vertikalno poređenje, samo "u blizini iznad".
    //    Za textarea polja (visoka polja) koristimo veći Y prag — labela
    //    može biti daleko iznad (naslov sekcije ili opis polja).
    const TEXTAREA_H_IN = 0.5;
    const aboveYMax = fc.h > TEXTAREA_H_IN ? 2.0 : ABOVE_MAX_Y_IN;
    const pageParas = di.paragraphs.filter((p) => p.page === field.page);
    const above = pageParas
      .filter((p) => {
        const pXCtr = p.boundingBox.x + p.boundingBox.w / 2;
        return (
          p.boundingBox.y > fc.yCtr &&
          p.boundingBox.y < fc.yCtr + aboveYMax &&
          Math.abs(pXCtr - fc.xLeft) < ABOVE_MAX_X_IN
        );
      })
      .sort((a, b) => a.boundingBox.y - b.boundingBox.y);

    // 2b. Za textarea polja (fc.h > 0.5"): traži i vizuelno iznad gornje ivice polja
    //     (paragraf sa manjim Y od gornje ivice — standardna "label iznad" pozicija)
    if (above.length === 0 && fc.h > TEXTAREA_H_IN) {
      const fieldTopY = fc.yCtr - fc.h / 2;
      const visuallyAbove = pageParas
        .filter((p) => {
          const pXCtr = p.boundingBox.x + p.boundingBox.w / 2;
          return (
            p.boundingBox.y < fieldTopY &&
            p.boundingBox.y > fieldTopY - 2.0 &&
            Math.abs(pXCtr - fc.xLeft) < ABOVE_MAX_X_IN
          );
        })
        .sort((a, b) => b.boundingBox.y - a.boundingBox.y); // najbliži iznad prvi
      above.push(...visuallyAbove);
    }

    if (above.length > 0) {
      const best   = above[0];
      const diConf = avgWordConfidence(best.boundingBox, field.page, di.words);
      results.push({
        fieldName:      field.name,
        page:           field.page,
        boundingBox:    fieldBB,
        label:          best.content,
        labelBoundingBox: best.boundingBox,
        confidence:     'low',
        matchType:      'above',
        signals: { distanceIn: null, relativeMarginIn: null, diConfidence: diConf },
      });
      continue;
    }

    // 3. Bez kandidata
    results.push({
      fieldName:      field.name,
      page:           field.page,
      boundingBox:    fieldBB,
      label:          null,
      labelBoundingBox: null,
      confidence:     'low',
      matchType:      'none',
      signals: { distanceIn: null, relativeMarginIn: null, diConfidence: null },
    });
  }

  return results;
}
