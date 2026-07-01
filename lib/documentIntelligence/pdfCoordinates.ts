// Konverzija između DI koordinata (inči, Y od vrha) i pdf-lib koordinata (pt, Y od dna)

export interface DiBox {
  x: number; // inči od leve ivice
  y: number; // inči od vrha stranice
  w: number; // širina u inčima
  h: number; // visina u inčima
}

export interface PdfBox {
  x: number; // pt od leve ivice
  y: number; // pt od dne stranice (pdf-lib konvencija)
  w: number; // širina u pt
  h: number; // visina u pt
}

/**
 * Konvertuje DI bounding box u pdf-lib koordinate.
 *
 * DI: x, y od top-left, Y raste nadole
 * pdf-lib: x, y od bottom-left, Y raste nagore
 *
 * @param bbox  DI bounding box (inči)
 * @param pageHeight  visina stranice u pt (pdf-lib page.getSize().height)
 */
export function diToPdfCoords(bbox: DiBox, pageHeight: number): PdfBox {
  const x = bbox.x * 72;
  const y = pageHeight - (bbox.y + bbox.h) * 72; // Y-flip
  const w = bbox.w * 72;
  const h = bbox.h * 72;
  return { x, y, w, h };
}
