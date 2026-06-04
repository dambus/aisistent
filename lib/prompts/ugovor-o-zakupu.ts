import type { UgovorOZakupuData, WizardStep } from '@/types/wizard'

export const systemPrompt = `Ti si pravni asistent specijalizovan za izradu ugovora o zakupu nepokretnosti u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima, Zakonom o stanovanju i održavanju zgrada ("Sl. glasnik RS", br. 104/2016) i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši kompletan Ugovor o zakupu na srpskom jeziku (latinica). Pre generisanja određuješ SCENARIO.

## SCENARIJI

SCENARIO A - ZAKUP STANA / STANOVANJE
→ Primenjuje se Zakon o stanovanju
→ Poreski tretman: porez 20% na 80% prihoda (~16% efektivno)
→ Obavezno: popis nameštaja, deponija, komunalije, prijava boravišta
→ Preporučiti: overa kod javnog beležnika, prijava poreskoj upravi u roku 30 dana

SCENARIO B - ZAKUP POSLOVNOG PROSTORA
→ Zakon o obligacionim odnosima - veća sloboda ugovaranja
→ Obavezno: namena prostora, adaptacije, komunalije, PDV tretman
→ Preporučiti: uknjižba zakupa ako duže od godinu dana

SCENARIO C - KRATKOROČNI ZAKUP (do 30 dana)
→ Kraća forma, bez deponije, bez prijave boravišta
→ Poseban poreski tretman za turistički zakup

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu, članu o zakupnini i potpisima.
Sve ostalo ide kroz "Zakupodavac" i "Zakupac/Zakupnica".

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI (svi scenariji)

1. Identifikacija zakupodavca i zakupca
2. Opis nepokretnosti - adresa, kvadratura, sprat, struktura
3. Svrha zakupa
4. Trajanje i datum početka
5. Iznos zakupnine i rok plaćanja
6. Deponija (ako se ugovara)
7. Komunalije - ko plaća šta
8. Stanje pri primopredaji
9. Obaveze održavanja
10. Zabrana podzakupa
11. Uslovi raskida i otkazni rok
12. Poreski tretman - napomena
13. Potpisi i primopredajni zapisnik

## DODATNI ELEMENTI ZA SCENARIO A

- Popis nameštaja i opreme (prilog)
- Deponija: iznos, uslovi i rok vraćanja (max 30 dana)
- Zabrana životinja (ako se ugovara)
- Broj lica koja stanuju
- Saglasnost za prijavu boravišta
- Kućni red zgrade

## DODATNI ELEMENTI ZA SCENARIO B

- Tačna namena i zabrana promene bez saglasnosti
- Ko vrši adaptacije i ko finansira
- Tabla/natpis firme - pravo i uslovi
- PDV tretman zakupnine
- Pravo preče kupovine (ako se ugovara)
- Indeksacija zakupnine

## FORMAT IZLAZA

UGOVOR O ZAKUPU NEPOKRETNOSTI
Broj: [auto] | Datum: [datum]

I.    UGOVORNE STRANE
II.   PREDMET ZAKUPA
III.  TRAJANJE ZAKUPA
IV.   ZAKUPNINA I NAČIN PLAĆANJA
V.    DEPONIJA
VI.   KOMUNALIJE I REŽIJSKI TROŠKOVI
VII.  STANJE NEPOKRETNOSTI I PRIMOPREDAJA
VIII. OBAVEZE ZAKUPCA
IX.   OBAVEZE ZAKUPODAVCA
X.    ZABRANA PODZAKUPA
XI.   RASKID UGOVORA I OTKAZNI ROK
XII.  PORESKE NAPOMENE
XIII. ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## TON I STIL

- Formalan pravni jezik | Latinica, srpski
- "Zakupodavac" i "Zakupac/Zakupnica" kroz ceo dokument
- Zakupninu iskazati i u EUR ako je indeksirana:
  "iznos u RSD koji odgovara vrednosti X EUR po kursu NBS na dan plaćanja"
- Novčane iznose pisati i slovima

## ŠTA NE RADIŠ

- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne daješ savete o tržišnoj vrednosti zakupa
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski`

export function buildUserMessage(data: UgovorOZakupuData): string {
  const deponija = data.deponija ? `Da (${data.iznos_deponije ?? '[POPUNITI: iznos deponije]'} mesečnih zakupnina)` : 'Ne'

  return `Molim te generiši Ugovor o zakupu sa sledećim podacima:

TIP ZAKUPA: ${data.tip_zakupa} | UKNJIŽENA: ${data.uknjizena ? 'Da' : 'Ne'}

ZAKUPODAVAC:
- Tip: ${data.tip_zakupodavca} | Naziv/Ime: ${data.naziv_zakupodavca}
- JMBG/PIB: ${data.jmbg_pib_zakupodavca} | Adresa: ${data.adresa_zakupodavca}
- Zastupnik: ${data.zastupnik_zakupodavca ?? '[POPUNITI: zastupnik zakupodavca]'}

ZAKUPAC:
- Tip: ${data.tip_zakupca} | Naziv/Ime: ${data.naziv_zakupca}
- JMBG/PIB: ${data.jmbg_pib_zakupca} | Adresa: ${data.adresa_zakupca}
- Zastupnik: ${data.zastupnik_zakupca ?? '[POPUNITI: zastupnik zakupca]'}

NEPOKRETNOST:
- Adresa: ${data.adresa_nepokretnosti} | Kvadratura: ${data.kvadratura} m²
- Sprat: ${data.sprat} | Struktura: ${data.struktura}
- List nepokretnosti: ${data.list_nepokretnosti ?? '[nema]'} | Stanje: ${data.stanje ?? '[POPUNITI: stanje]'}

TRAJANJE:
- Početak: ${data.datum_pocetka} | Tip: ${data.tip_trajanja}
- Istek: ${data.datum_isteka ?? '[nema]'} | Otkazni rok: ${data.otkazni_rok} meseci

ZAKUPNINA:
- Iznos: ${data.iznos.toLocaleString('sr-RS')} ${data.valuta} | Dan plaćanja: ${data.dan_placanja}. u mesecu
- Način: ${data.nacin_placanja}
- Deponija: ${deponija}

TROŠKOVI I USLOVI:
- Komunalije (struja/voda/gas): ${data.komunalije}
- Internet/kablovska: ${data.internet}
- Komunalna taksa: ${data.komunalna_taksa}
- Životinje: ${typeof data.zivotinje === 'boolean' ? (data.zivotinje ? 'Da' : 'Ne') : '[nije definisano]'}
- Prijava boravišta: ${typeof data.prijava_boravista === 'boolean' ? (data.prijava_boravista ? 'Da' : 'Ne') : '[nije definisano]'}
- Zabrana podzakupa: ${data.zabrana_podzakupa ? 'Da' : 'Ne'}
- Napomene: ${data.napomene ?? '[nema]'}

Svi podaci su u nominativu. Dekliniraš ispravno. Odredi scenario (A, B ili C).`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'tip_zakupa',
    title: 'Tip zakupa',
    fields: [
      {
        id: 'tip_zakupa',
        label: 'Tip zakupa',
        type: 'radio',
        required: true,
        options: [
          { value: 'Stambeni', label: 'Stambeni' },
          { value: 'Poslovni', label: 'Poslovni' },
          { value: 'Kratkoročni', label: 'Kratkoročni' },
        ],
      },
      { id: 'uknjizena', label: 'Uknjižena nepokretnost?', type: 'toggle', required: true, defaultValue: true },
    ],
  },
  {
    id: 'zakupodavac',
    title: 'Zakupodavac',
    fields: [
      {
        id: 'tip_zakupodavca',
        label: 'Tip',
        type: 'radio',
        required: true,
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_zakupodavca', label: 'Ime i prezime / Naziv', type: 'text', required: true },
      { id: 'jmbg_pib_zakupodavca', label: 'JMBG / PIB', type: 'text', required: true },
      { id: 'adresa_zakupodavca', label: 'Adresa', type: 'text', required: true },
      { id: 'zastupnik_zakupodavca', label: 'Zastupnik (ako firma)', type: 'text', required: false },
    ],
  },
  {
    id: 'zakupac',
    title: 'Zakupac',
    fields: [
      {
        id: 'tip_zakupca',
        label: 'Tip',
        type: 'radio',
        required: true,
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_zakupca', label: 'Ime i prezime / Naziv', type: 'text', required: true },
      { id: 'jmbg_pib_zakupca', label: 'JMBG / PIB', type: 'text', required: true },
      { id: 'adresa_zakupca', label: 'Adresa', type: 'text', required: true },
      { id: 'zastupnik_zakupca', label: 'Zastupnik (ako firma)', type: 'text', required: false },
    ],
  },
  {
    id: 'nepokretnost',
    title: 'Nepokretnost',
    fields: [
      { id: 'adresa_nepokretnosti', label: 'Adresa nepokretnosti', type: 'text', required: true },
      { id: 'kvadratura', label: 'Kvadratura (m²)', type: 'number', required: true, min: 1 },
      { id: 'sprat', label: 'Sprat / ukupno spratova', type: 'text', required: true, placeholder: 'npr. 3/5' },
      { id: 'struktura', label: 'Struktura', type: 'text', required: true },
      { id: 'list_nepokretnosti', label: 'Broj lista nepokretnosti', type: 'text', required: false },
      {
        id: 'stanje',
        label: 'Stanje',
        type: 'radio',
        required: false,
        options: [
          { value: 'Namešten', label: 'Namešten' },
          { value: 'Polunamešten', label: 'Polunamešten' },
          { value: 'Nenamešten', label: 'Nenamešten' },
        ],
      },
    ],
  },
  {
    id: 'trajanje',
    title: 'Trajanje',
    fields: [
      { id: 'datum_pocetka', label: 'Datum početka', type: 'date', required: true },
      {
        id: 'tip_trajanja',
        label: 'Tip trajanja',
        type: 'radio',
        required: true,
        options: [
          { value: 'Određeno', label: 'Određeno' },
          { value: 'Neodređeno', label: 'Neodređeno' },
        ],
      },
      { id: 'datum_isteka', label: 'Datum isteka', type: 'date', required: false, conditional: { field: 'tip_trajanja', value: 'Određeno' } },
      { id: 'otkazni_rok', label: 'Otkazni rok (meseci)', type: 'number', required: true, min: 1, defaultValue: 1 },
    ],
  },
  {
    id: 'zakupnina',
    title: 'Zakupnina i deponija',
    fields: [
      { id: 'iznos', label: 'Iznos zakupnine', type: 'number', required: true, min: 1 },
      {
        id: 'valuta',
        label: 'Valuta',
        type: 'radio',
        required: true,
        options: [
          { value: 'RSD', label: 'RSD' },
          { value: 'EUR (plaća se u RSD po kursu NBS)', label: 'EUR (plaća se u RSD po kursu NBS)' },
        ],
      },
      { id: 'dan_placanja', label: 'Dan plaćanja u mesecu', type: 'number', required: true, min: 1, max: 31, defaultValue: 1 },
      {
        id: 'nacin_placanja',
        label: 'Način plaćanja',
        type: 'radio',
        required: true,
        options: [
          { value: 'Na račun', label: 'Na račun' },
          { value: 'Gotovina', label: 'Gotovina' },
        ],
      },
      { id: 'deponija', label: 'Deponija?', type: 'toggle', required: false, defaultValue: false },
      { id: 'iznos_deponije', label: 'Iznos deponije (mesečnih zakupnina)', type: 'number', required: false, min: 1, max: 3, conditional: { field: 'deponija', value: true } },
    ],
  },
  {
    id: 'uslovi',
    title: 'Troškovi i uslovi',
    fields: [
      {
        id: 'komunalije',
        label: 'Ko plaća struju/vodu/gas?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
          { value: 'Podeljeno', label: 'Podeljeno' },
        ],
      },
      {
        id: 'internet',
        label: 'Ko plaća internet i kablovsku?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
          { value: 'Nije priključeno', label: 'Nije priključeno' },
        ],
      },
      {
        id: 'komunalna_taksa',
        label: 'Ko plaća komunalnu taksu?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
        ],
      },
      { id: 'zivotinje', label: 'Dozvola za životinje?', type: 'toggle', required: false, defaultValue: false },
      { id: 'prijava_boravista', label: 'Saglasnost za prijavu boravišta?', type: 'toggle', required: false, defaultValue: false },
      { id: 'zabrana_podzakupa', label: 'Zabrana podzakupa?', type: 'toggle', required: true, defaultValue: true },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false },
    ],
  },
]
