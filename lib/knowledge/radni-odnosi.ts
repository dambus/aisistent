import type { KnowledgeTopic } from './types'

export const radniOdnosi: KnowledgeTopic = {
  id: 'radni-odnosi',
  naslov: 'Radni odnosi',
  poslednjaProvera: '2026-07-12',
  pravniOsnov: 'Zakon o radu RS, čl. 33, 36, 37, 53, 68, 105, 161',
  sadrzaj: `Obavezni elementi ugovora o radu (čl. 33 Zakona o radu):
1. Naziv i sedište poslodavca
2. Lično ime zaposlenog, JMBG, adresa stanovanja
3. Vrsta i opis poslova
4. Mesto rada
5. Vrsta radnog odnosa (na određeno/neodređeno vreme)
6. Trajanje ugovora i osnov (ako određeno vreme)
7. Dan početka rada
8. Radno vreme (puno/nepuno/skraćeno)
9. Novčani iznos osnovne zarade (mora biti u BRUTO 1 iznosu, čl. 105)
10. Elementi za utvrđivanje zarade, učinka, naknada
11. Rokovi isplate zarade
12. Trajanje godišnjeg odmora
13. Otkazni rok
14. Zabrana takmičenja (ako se ugovara)

Kritični zakonski limiti:
- Osnovna zarada ne sme biti niža od minimalne zarade utvrđene od strane Vlade RS
- Ugovor na određeno vreme: max 24 meseca ukupno sa produženjima (čl. 37)
- Probni rad: max 6 meseci (čl. 36)
- Godišnji odmor: min 20 radnih dana (čl. 68)
- Otkazni rok: min 8, max 30 dana (zaposleni); min 8 dana (poslodavac + otpremnina)
- Prekovremeni rad: max 8 sati nedeljno (čl. 53)
- Zabrana konkurencije: OBAVEZNO naknada zaposlenom za period zabrane (čl. 161 st. 2) — bez naknade klauzula je ništava
- Zaštita podataka o ličnosti zaposlenog: obavezna napomena u skladu sa Zakonom o zaštiti podataka o ličnosti ("Sl. glasnik RS", br. 87/2018)`,
}
