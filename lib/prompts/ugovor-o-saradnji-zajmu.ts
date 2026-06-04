import type { UgovorOSaradnjiZajmuData, WizardStep } from '@/types/wizard'

export const systemPrompt = `Ti si pravni asistent specijalizovan za izradu ugovora o poslovnoj saradnji i ugovora o zajmu u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši jedan od dva tipa dokumenta. Pre generisanja određuješ TIP.

## TIPOVI

TIP 1 - UGOVOR O POSLOVNOJ SARADNJI
→ Dve strane udružuju resurse radi zajedničkog cilja
→ Nema zajma novca - ravnopravne strane
→ Tipično: zajednički projekat, tender, podela klijenata
→ Termini: "Prva strana" / "Druga strana"
→ VAŽNO: ne osniva zajedničko preduzeće - strane ostaju samostalni subjekti

TIP 2 - UGOVOR O ZAJMU
→ Zajmodavac daje novac Zajmoprimcu na određeno vreme
→ Sa kamatom ili bezkamatni
→ Tipično: pozajmica između fizičkih lica, firmi, osnivača firmi
→ Termini: "Zajmodavac" / "Zajmoprimac"
→ Poreski tretman: kamata = prihod od kapitala, porez 15%

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu i potpisima.

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI - TIP 1 (Saradnja)

1. Identifikacija strana
2. Predmet i cilj saradnje
3. Doprinos svake strane
4. Podela prihoda i troškova
5. Upravljanje i donošenje odluka
6. Trajanje
7. Ekskluzivnost (ako se ugovara)
8. Poverljivost - NDA klauzula
9. Intelektualna svojina
10. Raskid i posledice
11. Rešavanje sporova
12. Potpisi

## FORMAT - TIP 1

UGOVOR O POSLOVNOJ SARADNJI
Broj: [auto] | Datum: [datum]

I.    UGOVORNE STRANE
II.   PREDMET I CILJ SARADNJE
III.  DOPRINOS STRANA
IV.   PODELA PRIHODA I TROŠKOVA
V.    UPRAVLJANJE SARADNJOM
VI.   TRAJANJE UGOVORA
VII.  EKSKLUZIVNOST [ako se ugovara]
VIII. POVERLJIVOST
IX.   INTELEKTUALNA SVOJINA
X.    RASKID UGOVORA
XI.   REŠAVANJE SPOROVA
XII.  ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## OBAVEZNI ELEMENTI - TIP 2 (Zajam)

1. Identifikacija zajmodavca i zajmoprimca
2. Iznos zajma
3. Svrha zajma (preporučljiva)
4. Rok vraćanja i plan otplate
5. Kamata ili eksplicitna izjava o bezkamatnosti
6. Način isplate i vraćanja
7. Sredstvo obezbeđenja (ako se ugovara)
8. Prevremena otplata
9. Posledice kašnjenja - zatezna kamata
10. Poreski tretman kamate
11. Potpisi i overa (preporučiti za iznose preko 50.000 RSD)

## FORMAT - TIP 2

UGOVOR O ZAJMU
Broj: [auto] | Datum: [datum]

I.    UGOVORNE STRANE
II.   PREDMET - IZNOS I VALUTA ZAJMA
III.  SVRHA ZAJMA
IV.   ISPLATA ZAJMA
V.    KAMATA / BEZKAMATNI ZAJAM
VI.   ROK I NAČIN VRAĆANJA
VII.  PREVREMENA OTPLATA
VIII. SREDSTVO OBEZBEĐENJA [ako se ugovara]
IX.   POSLEDICE KAŠNJENJA
X.    PORESKE NAPOMENE
XI.   ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## TON I STIL

- Formalan pravni jezik | Latinica, srpski
- TIP 1: "Prva strana" / "Druga strana"
- TIP 2: "Zajmodavac" / "Zajmoprimac"
- Novčane iznose i kamatnu stopu pisati i slovima
- Datume u punom formatu: 01. januar 2027. godine

## ŠTA NE RADIŠ

- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne osnuješ zajedničko preduzeće ugovorom o saradnji
- Ne garantuješ poresku ispravnost
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski`

export function buildUserMessage(data: UgovorOSaradnjiZajmuData): string {
  if (data.tip_dokumenta === 'Ugovor o zajmu') {
    return `Molim te generiši Ugovor o zajmu:

ZAJMODAVAC: ${data.tip_zajmodavca ?? '[POPUNITI: tip zajmodavca]'} | ${data.naziv_zajmodavca ?? '[POPUNITI: naziv zajmodavca]'} | JMBG/PIB: ${data.id_zajmodavca ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_zajmodavca ?? '[POPUNITI: adresa zajmodavca]'}
ZAJMOPRIMAC: ${data.tip_zajmoprimca ?? '[POPUNITI: tip zajmoprimca]'} | ${data.naziv_zajmoprimca ?? '[POPUNITI: naziv zajmoprimca]'} | JMBG/PIB: ${data.id_zajmoprimca ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_zajmoprimca ?? '[POPUNITI: adresa zajmoprimca]'} | Račun: ${data.racun ?? '[POPUNITI: račun]'}

ZAJAM: ${(data.iznos ?? 0).toLocaleString('sr-RS')} ${data.valuta ?? '[POPUNITI: valuta]'} | Svrha: ${data.svrha ?? '[nije navedena]'} | Isplata: ${data.datum_isplate ?? '[POPUNITI: datum isplate]'} | Način: ${data.nacin_isplate ?? '[POPUNITI: način isplate]'}

KAMATA: ${data.tip_kamate ?? '[POPUNITI: tip kamate]'} | Stopa: ${data.stopa ?? '[POPUNITI: stopa]'}% godišnje | Obračun: ${data.obracun ?? '[POPUNITI: obračun]'} | Plaćanje: ${data.placanje_kamate ?? '[POPUNITI: plaćanje kamate]'}

VRAĆANJE: ${data.nacin_vracanja ?? '[POPUNITI: način vraćanja]'} | Rok/Rate: ${data.rok_vracanja ?? '[POPUNITI: rok vraćanja]'} | Prva rata: ${data.prva_rata ?? '[nema]'} | Prevremena otplata: ${data.prevremena ? 'Da' : 'Ne'}

OBEZBEĐENJE: ${data.sredstvo} | Zatezna kamata: ${data.zatezna} | Napomene: ${data.napomene ?? '[nema]'}

Svi podaci u nominativu. Dekliniraš ispravno. Ako bezkamatni - eksplicitno navedi u ugovoru.`
  }

  return `Molim te generiši Ugovor o poslovnoj saradnji:

PRVA STRANA: ${data.tip_1 ?? '[POPUNITI: tip prve strane]'} | ${data.naziv_1 ?? '[POPUNITI: naziv prve strane]'} | PIB/JMBG: ${data.id_1 ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_1 ?? '[POPUNITI: adresa prve strane]'} | Zastupnik: ${data.zastupnik_1 ?? '[POPUNITI: zastupnik prve strane]'}
DRUGA STRANA: ${data.tip_2 ?? '[POPUNITI: tip druge strane]'} | ${data.naziv_2 ?? '[POPUNITI: naziv druge strane]'} | PIB/JMBG: ${data.id_2 ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_2 ?? '[POPUNITI: adresa druge strane]'} | Zastupnik: ${data.zastupnik_2 ?? '[POPUNITI: zastupnik druge strane]'}

PREDMET: ${data.naziv_saradnje ?? '[POPUNITI: naziv saradnje]'}
Opis: ${data.opis_saradnje ?? '[POPUNITI: opis saradnje]'}
Doprinos Prve strane: ${data.doprinos_1 ?? '[POPUNITI: doprinos prve strane]'}
Doprinos Druge strane: ${data.doprinos_2 ?? '[POPUNITI: doprinos druge strane]'}

FINANSIJE: Podela ${data.podela ?? '[POPUNITI: model podele]'} (${data.udeo_1 ?? '[n/a]'}% / ${data.udeo_2 ?? '[n/a]'}%) | Upravljanje: ${data.upravljanje ?? '[POPUNITI: upravljanje]'} | Izveštavanje: ${data.rok ?? '[POPUNITI: rok]'} dana

USLOVI: Početak ${data.datum_pocetka ?? '[POPUNITI: datum početka]'} | Trajanje: ${data.trajanje ?? '[POPUNITI: trajanje]'} | Ekskluzivnost: ${data.ekskluzivnost ? 'Da' : 'Ne'} - ${data.opis_ekskl ?? '[nema]'}
NDA: ${data.nda ? 'Da' : 'Ne'} | IP: ${data.vlasnistvo_ip ?? '[POPUNITI: vlasništvo nad IP]'} | Napomene: ${data.napomene ?? '[nema]'}

Svi podaci u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'zajednicki',
    title: 'Tip dokumenta',
    fields: [
      {
        id: 'tip_dokumenta',
        label: 'Tip dokumenta',
        type: 'radio',
        required: true,
        options: [
          { value: 'Ugovor o poslovnoj saradnji', label: 'Ugovor o poslovnoj saradnji' },
          { value: 'Ugovor o zajmu', label: 'Ugovor o zajmu' },
        ],
      },
    ],
  },
  {
    id: 'saradnja',
    title: 'Saradnja',
    fields: [
      { id: 'tip_1', label: 'Tip Prve strane', type: 'radio', required: false, options: [
        { value: 'Firma', label: 'Firma' },
        { value: 'Preduzetnik', label: 'Preduzetnik' },
        { value: 'Fizičko lice', label: 'Fizičko lice' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'naziv_1', label: 'Naziv / Ime Prve strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'id_1', label: 'PIB / JMBG Prve strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'adresa_1', label: 'Adresa Prve strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'zastupnik_1', label: 'Zastupnik Prve strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'tip_2', label: 'Tip Druge strane', type: 'radio', required: false, options: [
        { value: 'Firma', label: 'Firma' },
        { value: 'Preduzetnik', label: 'Preduzetnik' },
        { value: 'Fizičko lice', label: 'Fizičko lice' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'naziv_2', label: 'Naziv / Ime Druge strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'id_2', label: 'PIB / JMBG Druge strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'adresa_2', label: 'Adresa Druge strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'zastupnik_2', label: 'Zastupnik Druge strane', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'naziv_saradnje', label: 'Naziv saradnje', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'opis_saradnje', label: 'Detaljan opis', type: 'textarea', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'doprinos_1', label: 'Doprinos Prve strane', type: 'textarea', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'doprinos_2', label: 'Doprinos Druge strane', type: 'textarea', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'podela', label: 'Podela prihoda', type: 'radio', required: false, options: [
        { value: 'Procenat', label: 'Procenat' },
        { value: 'Fiksni iznosi', label: 'Fiksni iznosi' },
        { value: 'Po projektu', label: 'Po projektu' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'udeo_1', label: 'Udeo Prve strane (%)', type: 'number', required: false, min: 0, max: 100, conditional: { field: 'podela', value: 'Procenat' } },
      { id: 'udeo_2', label: 'Udeo Druge strane (%)', type: 'number', required: false, min: 0, max: 100, conditional: { field: 'podela', value: 'Procenat' } },
      { id: 'upravljanje', label: 'Ko upravlja finansijama?', type: 'radio', required: false, options: [
        { value: 'Prva', label: 'Prva' },
        { value: 'Druga', label: 'Druga' },
        { value: 'Zajednički račun', label: 'Zajednički račun' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'rok', label: 'Rok finansijskog izveštavanja (dana)', type: 'number', required: false, min: 1, defaultValue: 30, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'datum_pocetka', label: 'Datum početka', type: 'date', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'trajanje', label: 'Trajanje', type: 'radio', required: false, options: [
        { value: 'Određeno', label: 'Određeno' },
        { value: 'Neodređeno', label: 'Neodređeno' },
        { value: 'Do završetka projekta', label: 'Do završetka projekta' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'datum_zavrsetka', label: 'Datum završetka', type: 'date', required: false, conditional: { field: 'trajanje', value: 'Određeno' } },
      { id: 'ekskluzivnost', label: 'Ekskluzivnost?', type: 'toggle', required: false, defaultValue: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'opis_ekskl', label: 'Oblast ekskluzivnosti', type: 'textarea', required: false, conditional: { field: 'ekskluzivnost', value: true } },
      { id: 'nda', label: 'NDA klauzula?', type: 'toggle', required: false, defaultValue: true, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'vlasnistvo_ip', label: 'Vlasništvo nad IP', type: 'radio', required: false, options: [
        { value: 'Prva strana', label: 'Prva strana' },
        { value: 'Druga strana', label: 'Druga strana' },
        { value: 'Zajednički', label: 'Zajednički' },
        { value: 'Po projektu', label: 'Po projektu' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'napomene', label: 'Napomene', type: 'textarea', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
    ],
  },
  {
    id: 'zajam',
    title: 'Zajam',
    fields: [
      { id: 'tip_zajmodavca', label: 'Tip zajmodavca', type: 'radio', required: false, options: [
        { value: 'Fizičko lice', label: 'Fizičko lice' },
        { value: 'Firma', label: 'Firma' },
        { value: 'Osnivač firme', label: 'Osnivač firme' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'naziv_zajmodavca', label: 'Ime/Naziv zajmodavca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'id_zajmodavca', label: 'JMBG / PIB zajmodavca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'adresa_zajmodavca', label: 'Adresa zajmodavca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'tip_zajmoprimca', label: 'Tip zajmoprimca', type: 'radio', required: false, options: [
        { value: 'Fizičko lice', label: 'Fizičko lice' },
        { value: 'Firma', label: 'Firma' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'naziv_zajmoprimca', label: 'Ime/Naziv zajmoprimca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'id_zajmoprimca', label: 'JMBG / PIB zajmoprimca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'adresa_zajmoprimca', label: 'Adresa zajmoprimca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'iznos', label: 'Iznos zajma', type: 'number', required: false, min: 1, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'valuta', label: 'Valuta', type: 'radio', required: false, options: [
        { value: 'RSD', label: 'RSD' },
        { value: 'EUR (isplaćuje se u RSD po kursu NBS)', label: 'EUR (isplaćuje se u RSD po kursu NBS)' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'svrha', label: 'Svrha zajma', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'datum_isplate', label: 'Datum isplate', type: 'date', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'nacin_isplate', label: 'Način isplate', type: 'radio', required: false, options: [
        { value: 'Prenos na račun', label: 'Prenos na račun' },
        { value: 'Gotovina', label: 'Gotovina' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'racun', label: 'Broj računa zajmoprimca', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'tip_kamate', label: 'Kamatni ili bezkamatni?', type: 'radio', required: false, options: [
        { value: 'Sa kamatom', label: 'Sa kamatom' },
        { value: 'Bezkamatni', label: 'Bezkamatni' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'stopa', label: 'Godišnja kamatna stopa (%)', type: 'number', required: false, min: 0, conditional: { field: 'tip_kamate', value: 'Sa kamatom' } },
      { id: 'obracun', label: 'Obračun kamate', type: 'radio', required: false, options: [
        { value: 'Proporcionalni', label: 'Proporcionalni' },
        { value: 'Konformni', label: 'Konformni' },
      ], conditional: { field: 'tip_kamate', value: 'Sa kamatom' } },
      { id: 'placanje_kamate', label: 'Plaćanje kamate', type: 'radio', required: false, options: [
        { value: 'Mesečno', label: 'Mesečno' },
        { value: 'Kvartalno', label: 'Kvartalno' },
        { value: 'Na kraju', label: 'Na kraju' },
        { value: 'Uz svaku ratu', label: 'Uz svaku ratu' },
      ], conditional: { field: 'tip_kamate', value: 'Sa kamatom' } },
      { id: 'nacin_vracanja', label: 'Način vraćanja', type: 'radio', required: false, options: [
        { value: 'Jednokratno', label: 'Jednokratno' },
        { value: 'Mesečne rate', label: 'Mesečne rate' },
        { value: 'Kvartalne rate', label: 'Kvartalne rate' },
        { value: 'Balonska otplata', label: 'Balonska otplata' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'rok_vracanja', label: 'Datum vraćanja / plan rata', type: 'text', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'prva_rata', label: 'Datum prve rate', type: 'date', required: false, conditional: { field: 'nacin_vracanja', value: 'Mesečne rate' } },
      { id: 'prevremena', label: 'Pravo prevremene otplate?', type: 'toggle', required: false, defaultValue: true, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'sredstvo', label: 'Sredstvo obezbeđenja', type: 'radio', required: false, options: [
        { value: 'Bez', label: 'Bez' },
        { value: 'Menica', label: 'Menica' },
        { value: 'Jemstvo', label: 'Jemstvo' },
        { value: 'Hipoteka', label: 'Hipoteka' },
        { value: 'Ostalo', label: 'Ostalo' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'zatezna', label: 'Zatezna kamata', type: 'radio', required: false, options: [
        { value: 'Zakonska', label: 'Zakonska' },
        { value: 'Ugovorna stopa', label: 'Ugovorna stopa' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'napomene', label: 'Napomene', type: 'textarea', required: false, conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
    ],
  },
]
