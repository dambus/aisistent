import type { UgovorOZakupuData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu ugovora o zakupu nepokretnosti u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima, Zakonom o stanovanju i održavanju zgrada ("Sl. glasnik RS", br. 104/2016) i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši kompletan Ugovor o zakupu na srpskom jeziku (latinica). Pre generisanja određuješ SCENARIO.

## SCENARIJI

SCENARIO A - ZAKUP STANA / STANOVANJE
→ Primenjuje se Zakon o stanovanju
→ Poreski tretman: porez 20% na 80% prihoda (~16% efektivno)
→ Obavezno: popis nameštaja, depozit, komunalije, prijava boravišta
→ Preporučiti: overa kod javnog beležnika, prijava poreskoj upravi u roku 30 dana

SCENARIO B - ZAKUP POSLOVNOG PROSTORA
→ Zakon o obligacionim odnosima - veća sloboda ugovaranja
→ Obavezno: namena prostora, adaptacije, komunalije, PDV tretman
→ Preporučiti: uknjižba zakupa ako duže od godinu dana

SCENARIO C - KRATKOROČNI ZAKUP (do 30 dana)
→ Kraća forma, bez depozita, bez prijave boravišta
→ Poseban poreski tretman za turistički zakup

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu, članu o zakupnini i potpisima.
Sve ostalo ide kroz "Zakupodavac" i "Zakupac".

## ROD U UGOVORU O ZAKUPU

Koristi isključivo termin "Zakupac" kroz ceo dokument — i u zaglavlju i u telu i u potpisima. Ne menjaj rod čak ni kada je zakupac ženskog pola.

U zaglavlju pri definisanju strana:
"Ana Marković... (u daljem tekstu: Zakupac)"

U telu: uvek "Zakupac", "Zakupodavac". Ne koristiti "Zakupnica" ni "Zakupodavačica".

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
6. Depozit (ako se ugovara)
7. Komunalije - ko plaća šta
8. Stanje pri primopredaji
9. Obaveze održavanja
10. Zabrana podzakupa
11. Uslovi raskida i otkazni rok
12. Poreski tretman - napomena
13. Potpisi i primopredajni zapisnik

## DODATNI ELEMENTI ZA SCENARIO A

- Popis nameštaja i opreme (prilog)
- Depozit: iznos, uslovi i rok vraćanja (max 30 dana)
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
V.    DEPOZIT
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

- Formalan pravni jezik | Koristi ISKLJUČIVO latinicu kroz ceo dokument. Ako primetiš ćirilične karaktere, zameni ih latiničnim ekvivalentom. Posebno pazi na: č, ć, š, đ, ž.
- "Zakupodavac" i "Zakupac" kroz ceo dokument
- Zakupninu iskazati i u EUR ako je indeksirana: "iznos u RSD koji odgovara vrednosti X EUR po kursu NBS na dan plaćanja"
- Novčane iznose pisati i slovima kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada. EUR primeri: 300 EUR → tristotine (300,00) evra | 500 EUR → petsto (500,00) evra.

## OPCIONI ELEMENTI

Generiši sledeće sekcije SAMO ako je vrednost true:

POPIS NAMEŠTAJA:
- Ako true: navedi "kao u Prilogu 1 — Popis nameštaja i opreme" bez generisanja samog popisa
- Ako false (Ne — stan se preuzima u viđenom stanju): napiši "Stan se preuzima u viđenom stanju, bez posebnog popisa nameštaja i opreme."

ZABRANA ŽIVOTINJA:
- Ako true: uključi klauzulu o zabrani držanja kućnih ljubimaca bez pisane saglasnosti zakupodavca
- Ako false: ne generiši ovaj član

ZABRANA PODZAKUPA:
- Ako true: uključi klauzulu koja zabranjuje podzakup bez pisane saglasnosti zakupodavca
- Ako false: ne generiši ovaj član

KOMUNALNA TAKSA:
- Ako je vrednost "Ne primenjuje se": ne generiši član o komunalnoj taksi. Komunalna taksa za isticanje firme ne primenjuje se na stambeni zakup fizičkog lica.

## ŠTA NE RADIŠ

- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne daješ savete o tržišnoj vrednosti zakupa
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski
- NIKADA ne navodi SCENARIO A, SCENARIO B ili SCENARIO C u generisanom dokumentu — ovo su interne instrukcije za tebe, ne deo dokumenta
- Ne generiši sekciju PRILOZI kao deo ugovora. Ako se pominje popis nameštaja, navedi samo "kao u Prilogu 1" bez generisanja samog popisa.`

export function buildUserMessage(data: UgovorOZakupuData): string {
  const depozit = data.deponija ? `Da (${data.iznos_deponije ?? '[POPUNITI: iznos depozita]'} mesečnih zakupnina)` : 'Ne'

  const komunalnaTaksaText = (() => {
    const val = data.komunalna_taksa
    if (!val || val === 'Ne primenjuje se') {
      return data.tip_zakupa === 'Stambeni'
        ? 'Ne primenjuje se (stambeni zakup fizičkog lica)'
        : 'Ne primenjuje se'
    }
    return val
  })()

  const popisNamestajaText = data.popis_namestaja
    ? 'Da — dodati napomenu o Prilogu 1'
    : 'Ne — stan se preuzima u viđenom stanju'
  const datumZakljucivanja = data.datum_zakljucivanja
    ? data.datum_zakljucivanja
    : '[POPUNITI: datum zaključivanja]'

  return `Molim te generiši Ugovor o zakupu sa sledećim podacima:

TIP ZAKUPA: ${data.tip_zakupa} | UKNJIŽENA: ${data.uknjizena ? 'Da' : 'Ne'}
DATUM ZAKLJUČIVANJA: ${datumZakljucivanja}

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
- Depozit: ${depozit}

TROŠKOVI I USLOVI:
- Komunalije (struja/voda/gas): ${data.komunalije}
- Internet/kablovska: ${data.internet}
- Komunalna taksa: ${komunalnaTaksaText}
- Adaptacije/rekonstrukcija: ${typeof data.adaptacije === 'boolean' ? (data.adaptacije ? 'Da (dogovoreno)' : 'Ne (zabranjeno bez saglasnosti)') : '[nije definisano]'}
- Prijava boravišta: ${typeof data.prijava_boravista === 'boolean' ? (data.prijava_boravista ? 'Da' : 'Ne') : '[nije definisano]'}
- Popis nameštaja: ${popisNamestajaText}
- Zabrana životinja: ${data.zabrana_zivotinja ? 'Da' : 'Ne'}
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
        tooltip: 'Stambeni — za stanovanje fizičkog lica. Primenjuje se Zakon o stanovanju.\nPoslovni — za obavljanje delatnosti firme ili preduzetnika. Veća sloboda ugovaranja.\nKratkoročni — do 30 dana, turistički zakup.',
        options: [
          { value: 'Stambeni', label: 'Stambeni' },
          { value: 'Poslovni', label: 'Poslovni' },
          { value: 'Kratkoročni', label: 'Kratkoročni' },
        ],
      },
      {
        id: 'datum_zakljucivanja',
        label: 'Datum zaključivanja ugovora',
        type: 'date',
        required: false,
        helperText: 'Ostavite prazno ako datum još nije poznat',
        tooltip: 'Datum kada se ugovor potpisuje. Možete ga ostaviti prazno i ručno upisati datum pre štampanja.',
      },
      { id: 'uknjizena', label: 'Uknjižena nepokretnost?', type: 'toggle', required: true, defaultValue: true, tooltip: 'Uknjižena nepokretnost ima čist vlasnički list u katastru. Zakup neuknjižene nepokretnosti nosi pravne rizike — preporučujemo konsultaciju sa pravnikom.' },
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
      {
        id: 'jmbg_pib_zakupodavca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        dynamicConfig: {
          watchField: 'tip_zakupodavca',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_zakupodavca', label: 'Adresa', type: 'text', required: true },
      { id: 'zastupnik_zakupodavca', label: 'Zastupnik (ako je firma)', type: 'text', required: false },
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
      {
        id: 'jmbg_pib_zakupca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        dynamicConfig: {
          watchField: 'tip_zakupca',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_zakupca', label: 'Adresa', type: 'text', required: true },
      { id: 'zastupnik_zakupca', label: 'Zastupnik (ako je firma)', type: 'text', required: false },
    ],
  },
  {
    id: 'nepokretnost',
    title: 'Nepokretnost',
    fields: [
      { id: 'adresa_nepokretnosti', label: 'Adresa nepokretnosti', type: 'text', required: true },
      { id: 'kvadratura', label: 'Kvadratura (m²)', type: 'number', required: true, min: 1 },
      { id: 'sprat', label: 'Sprat / ukupno spratova', type: 'text', required: true, placeholder: 'npr. 3/5' },
      {
        id: 'struktura',
        label: 'Struktura',
        type: 'text',
        required: true,
        helperText: 'npr. garsonjera, jednosoban, dvosoban...',
        tooltip: 'Opišite strukturu nekretnine:\n• Garsonjera — jedna prostorija sa kupatilom\n• Jednosoban stan — dnevna soba + spavaća + kupatilo\n• Dvosoban stan — dnevna soba + 2 sobe + kupatilo\n• Poslovni prostor — navedite namenu (kancelarija, lokal...)\nMožete dodati i stanje: namešten, polunamešten, prazan.',
      },
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
    title: 'Zakupnina i depozit',
    fields: [
      { id: 'iznos', label: 'Iznos zakupnine', type: 'number', required: true, min: 1 },
      {
        id: 'valuta',
        label: 'Valuta',
        type: 'radio',
        required: true,
        tooltip: 'U Srbiji je legalno ugovoriti zakupninu u evrima koja se plaća u dinarima po kursu NBS na dan plaćanja. Ovo štiti zakupodavca od inflacije.',
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
      { id: 'deponija', label: 'Depozit?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Depozit koji zakupac plaća unapred kao obezbeđenje. Vraća se po isteku zakupa ako nema štete. Standard je 1-2 mesečne zakupnine. Zakon ne propisuje maksimum.' },
      {
        id: 'iznos_deponije',
        label: 'Iznos depozita (mesečnih zakupnina)',
        type: 'number',
        required: false,
        min: 1,
        max: 3,
        conditional: { field: 'deponija', value: true },
        helperText: 'Broj mesečnih zakupnina (npr. 2)',
        tooltip: "Unesite BROJ mesečnih zakupnina, ne iznos u novcu. Na primer, ako je zakupnina 500 EUR i unesete '2', depozit je 1.000 EUR. Standard u Srbiji je 1-3 mesečne zakupnine.",
      },
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
        required: false,
        helperText: 'Ko plaća komunalnu taksu za isticanje firme',
        tooltip: "Komunalna taksa za isticanje firme primenjuje se samo kada zakupac obavlja registrovanu delatnost u prostoru (poslovni zakup). Za stambeni zakup fizičkog lica — izaberite 'Ne primenjuje se'.",
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
          { value: 'Ne primenjuje se', label: 'Ne primenjuje se' },
        ],
      },
      { id: 'adaptacije', label: 'Dozvola za adaptacije/rekonstrukciju?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Ako zakupac planira rekonstrukciju ili adaptaciju prostora, to mora biti eksplicitno dogovoreno u ugovoru. Bez saglasnosti zakupodavca, zakupac nema pravo na promene i mora vratiti prostor u prvobitno stanje.' },
      { id: 'prijava_boravista', label: 'Saglasnost za prijavu boravišta?', type: 'toggle', required: false, defaultValue: false },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false },
    ],
  },
  {
    id: 'napredne_opcije',
    title: 'Napredne opcije',
    fields: [
      {
        id: 'popis_namestaja',
        label: 'Popis nameštaja kao prilog',
        type: 'toggle',
        required: false,
        helperText: 'Dodaje napomenu o prilogu sa popisom nameštaja',
        tooltip: 'Ako isključite, ugovor će navesti da se stan preuzima u viđenom stanju bez posebnog popisa.',
      },
      {
        id: 'zabrana_zivotinja',
        label: 'Klauzula o zabrani životinja',
        type: 'toggle',
        required: false,
      },
      {
        id: 'zabrana_podzakupa',
        label: 'Zabrana podzakupa',
        type: 'toggle',
        required: false,
        helperText: 'Preporučuje se uključiti',
        tooltip: 'Zabranjuje zakupcu da stan dalje izdaje trećim licima bez saglasnosti zakupodavca.',
      },
    ],
  },
]
