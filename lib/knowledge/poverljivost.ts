import type { KnowledgeTopic } from './types'

export const poverljivost: KnowledgeTopic = {
  id: 'poverljivost',
  naslov: 'Poverljivost / NDA',
  poslednjaProvera: '2026-07-12',
  pravniOsnov: 'Zakon o obligacionim odnosima, Zakon o zaštiti poslovne tajne ("Sl. glasnik RS", br. 72/2011)',
  sadrzaj: `Obavezni elementi sporazuma o poverljivosti:
1. Identifikacija strana i tip sporazuma (jednostrani ili dvostrani)
2. Definicija poverljivih informacija
3. Definicija izuzetaka — šta NIJE poverljivo (javno dostupno, već poznato, dobijeno od trećeg lica, zakonska obaveza)
4. Obaveze strane koja prima
5. Trajanje sporazuma i trajanje obaveze čuvanja nakon isteka
6. Dozvoljeno otkrivanje (zaposleni, pravnici, računovođe)
7. Vraćanje ili uništavanje informacija po isteku
8. Posledice kršenja

Jednostrani NDA (One-way): jedna strana otkriva, druga prima i čuva — obaveza čuvanja važi ISKLJUČIVO za stranu koja prima.
Dvostrani NDA (Mutual): obe strane međusobno otkrivaju i čuvaju.`,
}
