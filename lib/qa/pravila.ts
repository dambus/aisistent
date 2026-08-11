// Priručnik gramatičkih/pravopisnih pravila koje QA korak (lib/qa/review.ts) mora
// da poštuje — raste kako se nalaze konkretni slučajevi gde je QA sam napravio
// grešku (ne samo propustio tuđu). Svaki novi slučaj postaje novi red ovde, ne
// izmena review.ts prompta direktno — jedno mesto, lakše za pregled i proširenje.
//
// Kad dodaješ pravilo: navedi konkretan otkriveno/kontekst trag (BUG broj ili
// opis) da se zna zašto pravilo postoji.

export interface GramatickoPravilo {
  id: string
  pravilo: string
  primerPogresno?: string
  primerIspravno?: string
  otkriveno: string
}

export const GRAMATICKA_PRAVILA: GramatickoPravilo[] = [
  {
    id: 'oslovljavanje-zarez',
    pravilo: 'Posle formule oslovljavanja u poslovnom pismu/mejlu ("Poštovani", "Poštovani gospodine/gospođo" i sl.) ide ZAREZ, nikad tačka.',
    primerPogresno: 'Poštovani.',
    primerIspravno: 'Poštovani,',
    otkriveno: 'BUG-054, 11. avgust 2026. — QA korak (poslovni-mejl, light mode) sam zamenio ispravan zarez pogrešnom tačkom.',
  },
]

export function getPravilaText(): string {
  return GRAMATICKA_PRAVILA.map(p => {
    const primer = p.primerPogresno && p.primerIspravno
      ? ` (POGREŠNO: "${p.primerPogresno}" / ISPRAVNO: "${p.primerIspravno}")`
      : ''
    return `- ${p.pravilo}${primer}`
  }).join('\n')
}
