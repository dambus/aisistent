// Referentne liste "obaveznih elemenata" po tipu ugovora — izvučene iz naših
// sopstvenih pravno auditovanih prompt modula (lib/prompts/*.ts, vidi AUDIT-01..05
// u docs/BUG_TRACKER.md). Ovo je osnova za analizu tuđeg ugovora u
// app/api/review-contract/route.ts: umesto da AI nagađa šta nedostaje iz opšteg
// znanja, poredi uploadovan ugovor naspram ONOGA ŠTO MI VEĆ ZNAMO da treba da
// sadrži ugovor tog tipa po srpskom pravu.
//
// Ažurirati ovaj fajl kad se menja odgovarajući lib/prompts/<tip>.ts "OBAVEZNI
// ELEMENTI" odeljak, da ne dođe do razminuti.

export const CONTRACT_TYPE_CHECKLISTS: Record<string, string> = {
  nda: `NDA (Sporazum o poverljivosti) — obavezni elementi:
1. Identifikacija strana i tip sporazuma (jednostrani ili dvostrani)
2. Definicija poverljivih informacija
3. Definicija izuzetaka — šta NIJE poverljivo (javno dostupno, već poznato, dobijeno od trećeg lica, zakonska obaveza)
4. Obaveze strane koja prima
5. Trajanje sporazuma i trajanje obaveze čuvanja nakon isteka
6. Dozvoljeno otkrivanje (zaposleni, pravnici, računovođe)
7. Vraćanje ili uništavanje informacija po isteku
8. Posledice kršenja
9. Merodavno pravo i nadležnost suda
Pravni osnov: Zakon o obligacionim odnosima, Zakon o zaštiti poslovne tajne ("Sl. glasnik RS", br. 72/2011).`,

  'ugovor-o-delu': `Ugovor o delu — obavezni elementi:
1. Identifikacija naručioca i izvođača
2. Predmet ugovora — tačan opis dela
3. Rok izvođenja/isporuke
4. Iznos naknade i način isplate
5. Poreski tretman
6. Autorska prava/vlasništvo nad rezultatom — mora eksplicitno navesti: koja imovinska prava se prenose, da li je prenos isključiv, teritorija, vremensko trajanje, momenat prenosa. Pravni osnov: Zakon o autorskom i srodnim pravima ("Sl. glasnik RS", br. 104/2009), čl. 42–45. Bez ovoga prenos autorskih prava nije pravno valjan.`,

  'ugovor-o-zakupu': `Ugovor o zakupu — obavezni elementi:
1. Identifikacija zakupodavca i zakupca
2. Opis nepokretnosti (adresa, kvadratura, sprat, struktura)
3. Svrha zakupa
4. Trajanje i datum početka
5. Iznos zakupnine i rok plaćanja
6. Depozit (ako se ugovara)
7. Komunalije — ko plaća šta
8. Stanje pri primopredaji
9. Obaveze održavanja
10. Zabrana podzakupa
11. Uslovi raskida i otkazni rok
12. Poreski tretman
13. Potpisi i primopredajni zapisnik`,

  'ugovor-o-saradnji': `Ugovor o saradnji — obavezni elementi:
1. Identifikacija strana
2. Predmet i cilj saradnje
3. Doprinos svake strane
4. Podela prihoda i troškova
5. Upravljanje i donošenje odluka
6. Trajanje
7. Ekskluzivnost (ako se ugovara)
8. Poverljivost — NDA klauzula
9. Intelektualna svojina
10. Raskid i posledice
11. Rešavanje sporova`,

  'ugovor-o-zajmu': `Ugovor o zajmu — obavezni elementi:
1. Identifikacija zajmodavca i zajmoprimca
2. Iznos zajma
3. Rok vraćanja
4. Kamata (ako se ugovara) i njena visina
5. Način isplate i vraćanja
6. Posledice neblagovremenog vraćanja
7. Sredstvo obezbeđenja (ako postoji)`,

  punomocje: `Punomoćje — obavezni elementi:
1. Naziv dokumenta prema tipu punomoćja
2. Identifikacija Vlastodavca
3. Identifikacija Punomoćnika
4. Precizan opis ovlašćenja
5. Trajanje punomoćja
6. Mogućnost opoziva
7. Napomena o overi kod javnog beležnika (gde je zakonom propisana)`,

  'ugovor-o-radu': `Ugovor o radu — obavezni elementi (Zakon o radu RS):
1. Identifikacija poslodavca i zaposlenog
2. Vrsta zaposlenja (određeno/neodređeno vreme)
3. Mesto rada
4. Radno vreme
5. Pozicija/opis poslova
6. Datum početka rada
7. Osnovna zarada i uvećanja
8. Trajanje probnog rada (ako postoji)
9. Otkazni rok
10. Potpisi obe strane`,

  other: `Opšti poslovni ugovor — minimalni elementi koje bi trebalo da ima svaki dvostrani poslovni ugovor:
1. Jasna identifikacija obe ugovorne strane (naziv/ime, adresa, PIB/JMBG ili matični broj)
2. Precizan predmet ugovora — šta tačno svaka strana daje/prima
3. Finansijski uslovi (iznos, rok, način plaćanja) ako je relevantno
4. Rokovi i trajanje
5. Uslovi raskida
6. Posledice kršenja/neispunjenja
7. Mesto i datum, potpisi obe strane`,
}

export const ALL_CHECKLISTS_TEXT = Object.entries(CONTRACT_TYPE_CHECKLISTS)
  .map(([, text]) => text)
  .join('\n\n')
