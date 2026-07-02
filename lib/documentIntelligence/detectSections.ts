import type { DiLayoutResult, DiParagraph, DiSpan, DiStyle } from './analyzeLayout';

// Naslov sekcije = pouzdan DI role signal (sectionHeading/title) ILI bar 2 od 3 uslova:
// >80% caps karaktera, dužina < 80, bold stil. Spec: docs/obrasci/FAZA3_WIZARD_TEMPLATE_BAZA_1.md#4.
const CAPS_RATIO_THRESHOLD = 0.8;
const MAX_HEADING_LENGTH = 80;

export interface SectionHeading {
  title: string;
  page: number;
  yTop: number; // DI koordinate — manji Y = više na strani
}

export interface FieldPosition {
  id: string;
  page: number;
  yCtr: number;
}

function spansOverlap(a: DiSpan, b: DiSpan): boolean {
  return a.offset < b.offset + b.length && b.offset < a.offset + a.length;
}

function isBold(paragraph: DiParagraph, styles: DiStyle[]): boolean {
  return styles.some(
    (s) => s.fontWeight === 'bold' && paragraph.spans.some((ps) => s.spans.some((ss) => spansOverlap(ps, ss))),
  );
}

// Odnos velikih slova prema ukupnom broju slovnih karaktera (radi za latinicu i ćirilicu
// bez ručnih Unicode opsega — oslanja se na JS-ov toUpperCase/toLowerCase).
function capsRatio(text: string): number {
  const letters = [...text].filter((ch) => ch.toUpperCase() !== ch.toLowerCase());
  if (letters.length === 0) return 0;
  const upper = letters.filter((ch) => ch === ch.toUpperCase());
  return upper.length / letters.length;
}

function isHeadingCandidate(p: DiParagraph, styles: DiStyle[]): boolean {
  if (p.role === 'sectionHeading' || p.role === 'title') return true;

  const text = p.content.trim();
  if (text === '') return false;

  let score = 0;
  if (capsRatio(text) > CAPS_RATIO_THRESHOLD) score++;
  if (text.length < MAX_HEADING_LENGTH) score++;
  if (isBold(p, styles)) score++;
  return score >= 2;
}

export function detectSectionHeadings(di: DiLayoutResult): SectionHeading[] {
  return di.paragraphs
    .filter((p) => isHeadingCandidate(p, di.styles))
    .map((p) => ({ title: p.content.trim(), page: p.page, yTop: p.boundingBox.y }))
    .sort((a, b) => a.page - b.page || a.yTop - b.yTop);
}

// Za svako polje nalazi najbliži naslov IZNAD njega (manji Y) na istoj strani.
// Fallback: "Strana N" ako nema nijednog naslova na toj strani.
export function assignSections(fields: FieldPosition[], headings: SectionHeading[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const f of fields) {
    const above = headings.filter((h) => h.page === f.page && h.yTop < f.yCtr);
    const nearest = above.length > 0 ? above.reduce((best, h) => (h.yTop > best.yTop ? h : best)) : null;
    result.set(f.id, nearest ? nearest.title : `Strana ${f.page}`);
  }
  return result;
}
