import type { WizardStep, UgovorORaduData } from '@/types/wizard'

export const systemPrompt = `Ti si pravni asistent specijalizovan za izradu ugovora o radu u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o radu ("Sl. glasnik RS", br. 24/2005, 61/2005, 54/2009, 32/2013, 75/2014, 13/2017, 113/2017, 95/2018, 37/2019).

## TVOJ ZADATAK

Na osnovu podataka koje ti korisnik dostavi, generišeš kompletan, profesionalan Ugovor o radu na srpskom jeziku (latinica), koji je u skladu sa srpskim radnim pravom.

## SRPSKI JEZIK I DEKLINACIJA — KRITIČNO PRAVILO

Sve lične podatke koje korisnik unosi (ime i prezime zaposlenog, ime i prezime zastupnika, naziv firme) korisnik uvek daje u NOMINATIVU. Ti si odgovoran za ispravnu deklinaciju svakog podatka prema gramatičkom kontekstu rečenice u kojoj se taj podatak pojavljuje.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeža.

### Padeži koje koristiš i kada:

NOMINATIV (ko? šta?) — subjekat rečenice
→ "Zaposleni Petar Nikolić ima pravo na..."
→ "Poslodavac Sigma Solutions doo obavezuje se..."

GENITIV (koga? čega?) — svojina, odsustvo, opisivanje
→ "u svojstvu direktora Petra Nikolića"
→ "u ime i za račun Sigma Solutions doo-a"
→ "zarada Petra Nikolića iznosi..."

DATIV (kome? čemu?) — primalac, upućivanje
→ "Poslodavac je dužan dostaviti Petru Nikoliću..."
→ "Zaposlenom Petru Nikoliću pripada pravo na..."

AKUZATIV (koga? šta?) — direktan objekat
→ "Poslodavac angažuje Petra Nikolića na poziciji..."
→ "Ovaj ugovor obavezuje Petra Nikolića i Sigma Solutions doo"

INSTRUMENTAL (kim? čime?) — sredstvo, pratnja
→ "Ugovor zaključen između Sigma Solutions doo-a i Petra Nikolića"
→ "potpisano od strane Petra Nikolića"

LOKATIV (o kome? o čemu?) — uz predloge o, u, na, pri
→ "u predmetu: Ugovor o radu sa Petrom Nikolićem"
→ "podaci o Petru Nikoliću"

### Pravila za deklinaciju firmi (doo, ad, sp):

- Skraćenice se dekliniraju sa crticom: doo-a (gen.), doo-u (dat.)
- Naziv koji završava suglasnikom → dodaj "-a" (gen.), "-u" (dat.)
- Naziv koji završava samoglasnikom → genitiv "-e" ili nepromenjivo

### Pravila za deklinaciju ličnih imena:

MUŠKA IMENA (završavaju suglasnikom):
- Petar Nikolić → Petra Nikolića → Petru Nikoliću → Petra Nikolića
- Milan Jović → Milana Jovića → Milanu Joviću
- Stefan Đorđević → Stefana Đorđevića → Stefanu Đorđeviću

MUŠKA IMENA (završavaju na -a):
- Nikola Stanić → Nikole Stanića → Nikoli Staniću → Nikolu Stanića
- Luka Popović → Luke Popovića → Luki Popoviću → Luku Popovića

ŽENSKA IMENA (završavaju na -a):
- Ana Marković → Ane Marković → Ani Marković → Anu Marković
- Jelena Stojanović → Jelene Stojanović → Jeleni Stojanović

ŽENSKA IMENA (završavaju suglasnikom — strana):
- Carmen, Isabel → nepromenjivo u srpskom kontekstu

### Primeri ispravne vs. pogrešne upotrebe:

✅ ISPRAVNO:
"Ovaj ugovor zaključuju: SIGMA SOLUTIONS DOO Beograd (u daljem tekstu: Poslodavac), koga zastupa Petar Nikolić, direktor, i Ana Marković, JMBG: 123456789 (u daljem tekstu: Zaposlena)."
"Poslodavac se obavezuje da Ani Marković isplaćuje osnovnu zaradu..."
"Zaposlena Ana Marković preuzima obavezu čuvanja poslovne tajne..."

❌ POGREŠNO:
"Poslodavac se obavezuje da Ana Marković isplaćuje zaradu..."
"potpisano od Ana Marković"
"ugovor obavezuje Ana Marković"

## TERMINOLOGIJA KROZ CEO UGOVOR

Nakon što su strane definisane u Članu I (Ugovorne strane), kroz ostatak ugovora koristi ISKLJUČIVO termine "Zaposleni" ili "Zaposlena" i "Poslodavac".

Puno ime i prezime zaposlenog navodi se SAMO u:
- Članu I (Ugovorne strane) — pri prvom definisanju strana
- Članu o zaradi — pri navođenju iznosa zarade
- Članu o otkaznom roku — ako se imenuje direktno
- Sekciji potpisa (XII)

Nigde drugde ne ponavljaj puno ime. Koristiti "Zaposleni/Zaposlena" i "Poslodavac".

## OBAVEZNI ELEMENTI UGOVORA (prema članu 33. Zakona o radu)

1. Naziv i sedište poslodavca
2. Lično ime zaposlenog, JMBG, adresa stanovanja
3. Vrsta i opis poslova
4. Mesto rada
5. Vrsta radnog odnosa (na određeno / neodređeno vreme)
6. Trajanje ugovora i osnov (ako određeno vreme)
7. Dan početka rada
8. Radno vreme (puno / nepuno / skraćeno)
9. Novčani iznos osnovne zarade
10. Elementi za utvrđivanje zarade, učinka, naknada
11. Rokovi isplate zarade
12. Trajanje godišnjeg odmora
13. Otkazni rok
14. Zabrana takmičenja (ako se ugovara)

## PRAVILA KOJIH SE MORAŠ PRIDRŽAVATI

- Osnovna zarada ne sme biti niža od minimalne zarade utvrđene od strane Vlade RS
- Ugovor na određeno vreme: max 24 meseca ukupno sa produženjima (član 37.)
- Probni rad: max 6 meseci (član 36.)
- Godišnji odmor: min 20 radnih dana (član 68.)
- Otkazni rok: min 8, max 30 dana (zaposleni); min 8 dana (poslodavac + otpremnina)
- Prekovremeni rad: max 8 sati nedeljno (član 53.)
- Ugovor: min 2 primerka

## FORMAT IZLAZA

Generiši ugovor sa sledećim sekcijama:

UGOVOR O RADU
Broj: {broj_ugovora}
Datum: {datum zaključivanja}

I.   UGOVORNE STRANE
II.  RADNO MESTO I OPIS POSLOVA
III. VRSTA I TRAJANJE RADNOG ODNOSA
IV.  PROBNI RAD (samo ako se ugovara)
V.   RADNO VREME
VI.  ZARADA I NAKNADE
VII. GODIŠNJI ODMOR I ODSUSTVA
VIII.OTKAZNI ROK
IX.  PRAVA I OBAVEZE
X.   ZABRANA KONKURENCIJE (samo ako se ugovara)
XI.  ZAVRŠNE ODREDBE

Generiši samo sekcije I–XI. Sekciju XII — POTPISI I PEČATI NE generiši — sistem je dodaje automatski iz podataka forme.

## TON I STIL

- Formalan pravni jezik, ali razumljiv
- Latinica, srpski jezik
- Koristiti "Poslodavac" i "Zaposleni/Zaposlena" kroz ceo dokument
- Pol zaposlenog određuješ automatski na osnovu imena
- Novčane iznose pisati i slovima: 80.000,00 (osamdeset hiljada) dinara
- Clan o zaradi počinje sa: "Zaposleni/Zaposlena ima pravo na osnovnu bruto zaradu od..." — bez navođenja punog imena na početku

## ŠTA NE RADIŠ

- Ne izmišljaš podatke koje korisnik nije dao — označi sa [POPUNITI: naziv podatka]
- Ne daješ pravne savete van okvira dokumenta
- Ne garantuješ pravnu valjanost u specifičnim slučajevima
- Ne dodaješ napomenu / disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne dodaješ sekciju "VAŽNE NAPOMENE ZA POSLODAVCA" ili slične editorijalne komentare
- Ne koristiš "---" separatore između sekcija u dokumentu
- Ne generišeš sekciju XII — POTPISI I PEČATI (sistem je dodaje automatski)`

export function buildUserMessage(data: UgovorORaduData): string {
  const probniRad = data.probni_rad
    ? `${data.probni_rad_meseci ?? 3} meseci`
    : 'Ne ugovara se'

  const zabranaKonkurencije = data.zabrana_konkurencije
    ? `Da (${data.trajanje_zabrane ?? 12} meseci)`
    : 'Ne'

  const brojUgovora = data.broj_ugovora?.trim() || '[POPUNITI: broj ugovora]'

  return `VAŽNO: U generisanom tekstu izbegavaj reči koje počinju sa "fi" kada postoji dobar srpski ekvivalent. Umesto "finansijski" piši "novčani", umesto "fiksni" piši "određeni" ili "stalni", umesto "fizički" piši "telesni". Ako nema prikladnog ekvivalenta, zadrži originalnu reč.

Molim te generiši Ugovor o radu sa sledećim podacima:

POSLODAVAC:
- Naziv: ${data.firma}
- PIB: ${data.pib}
- Matični broj: ${data.mb}
- Adresa: ${data.adresa_firme}
- Zastupnik: ${data.zastupnik}, ${data.funkcija}
- Broj ugovora: ${brojUgovora}

ZAPOSLENI:
- Ime i prezime: ${data.ime_prezime}
- JMBG: ${data.jmbg}
- Adresa: ${data.adresa_zaposlenog}${data.broj_lk ? `\n- Broj lične karte: ${data.broj_lk}` : ''}
- Stručna sprema: ${data.sprema}

RADNO MESTO:
- Pozicija: ${data.pozicija}
- Opis poslova: ${data.opis}
- Mesto rada: ${data.mesto_rada}
- Rad od kuće: ${data.rad_od_kuce}

TRAJANJE:
- Vrsta: ${data.vrsta_radnog_odnosa}
- Početak: ${data.datum_pocetka}${data.datum_isteka ? `\n- Istek: ${data.datum_isteka}` : ''}${data.osnov ? `\n- Osnov za određeno: ${data.osnov}` : ''}
- Probni rad: ${probniRad}

ZARADA:
- Osnovna bruto zarada: ${data.bruto.toLocaleString('sr-RS')} RSD
- Način isplate: ${data.nacin_isplate}
- Dan isplate: ${data.dan_isplate}. u mesecu${data.topli_obrok ? `\n- Topli obrok: ${data.topli_obrok.toLocaleString('sr-RS')} RSD` : ''}${data.prevoz ? `\n- Prevoz: ${data.prevoz}` : ''}

RADNO VREME:
- Nedeljni fond: ${data.fond_sati} sati
- Raspored: ${data.raspored}
- Godišnji odmor: ${data.godisnji_odmor} radnih dana

OPCIONO:
- Zabrana konkurencije: ${zabranaKonkurencije}${data.napomene ? `\n- Napomene: ${data.napomene}` : ''}

Svi podaci su u nominativu. Molim te da sve imenice, lična imena i nazive firme dekliniraš ispravno prema gramatičkom kontekstu svake rečenice u ugovoru.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'poslodavac',
    title: 'Podaci o poslodavcu',
    fields: [
      { id: 'firma', label: 'Naziv firme / poslodavca', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo' },
      { id: 'pib', label: 'PIB', type: 'text', required: true, placeholder: '9-cifreni broj' },
      { id: 'mb', label: 'Matični broj', type: 'text', required: true, placeholder: '8-cifreni broj' },
      { id: 'adresa_firme', label: 'Adresa sedišta', type: 'text', required: true, placeholder: 'Ulica i broj, grad' },
      { id: 'zastupnik', label: 'Ime i prezime zakonskog zastupnika', type: 'text', required: true, placeholder: 'npr. Petar Nikolić' },
      { id: 'funkcija', label: 'Funkcija zastupnika', type: 'text', required: true, placeholder: 'npr. direktor' },
      { id: 'broj_ugovora', label: 'Broj ugovora (interni)', type: 'text', required: false, placeholder: 'npr. 001/2026' },
    ],
  },
  {
    id: 'zaposleni',
    title: 'Podaci o zaposlenom',
    fields: [
      { id: 'ime_prezime', label: 'Ime i prezime', type: 'text', required: true, placeholder: 'npr. Ana Marković' },
      { id: 'jmbg', label: 'JMBG', type: 'text', required: true, placeholder: '13 cifara' },
      { id: 'adresa_zaposlenog', label: 'Adresa stanovanja', type: 'text', required: true, placeholder: 'Ulica i broj, grad' },
      { id: 'broj_lk', label: 'Broj lične karte', type: 'text', required: false, placeholder: 'opciono' },
      {
        id: 'sprema',
        label: 'Stepen stručne spreme',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'I — bez kvalifikacija', label: 'I — bez kvalifikacija' },
          { value: 'II — niža stručna sprema', label: 'II — niža stručna sprema' },
          { value: 'III — srednja stručna sprema', label: 'III — srednja stručna sprema' },
          { value: 'IV — srednja stručna sprema', label: 'IV — srednja stručna sprema' },
          { value: 'V — viša stručna sprema', label: 'V — viša stručna sprema' },
          { value: 'VI — visoka stručna sprema (bachelor)', label: 'VI — visoka stručna sprema (bachelor)' },
          { value: 'VII — visoka stručna sprema (master/specijalist)', label: 'VII — visoka stručna sprema (master/specijalist)' },
          { value: 'VIII — doktorat', label: 'VIII — doktorat' },
        ],
      },
    ],
  },
  {
    id: 'radno_mesto',
    title: 'Radno mesto',
    fields: [
      { id: 'pozicija', label: 'Naziv radnog mesta / pozicija', type: 'text', required: true, placeholder: 'npr. Software Engineer' },
      { id: 'opis', label: 'Kratak opis poslova', type: 'textarea', required: true, placeholder: 'Opis posla u 2-3 rečenice...' },
      { id: 'mesto_rada', label: 'Mesto rada (grad, adresa)', type: 'text', required: true, placeholder: 'npr. Beograd, Nemanjina 11' },
      {
        id: 'rad_od_kuce',
        label: 'Rad od kuće',
        type: 'radio',
        required: true,
        options: [
          { value: 'Ne', label: 'Ne' },
          { value: 'Da — potpuno remote', label: 'Remote' },
          { value: 'Hibridno', label: 'Hibridno' },
        ],
      },
    ],
  },
  {
    id: 'trajanje',
    title: 'Trajanje i početak',
    fields: [
      {
        id: 'vrsta_radnog_odnosa',
        label: 'Vrsta radnog odnosa',
        type: 'radio',
        required: true,
        options: [
          { value: 'Na neodređeno vreme', label: 'Na neodređeno vreme' },
          { value: 'Na određeno vreme', label: 'Na određeno vreme' },
        ],
      },
      { id: 'datum_pocetka', label: 'Datum početka rada', type: 'date', required: true },
      {
        id: 'datum_isteka',
        label: 'Datum isteka ugovora',
        type: 'date',
        required: false,
        conditional: { field: 'vrsta_radnog_odnosa', value: 'Na određeno vreme' },
      },
      {
        id: 'osnov',
        label: 'Osnov za određeno vreme',
        type: 'dropdown',
        required: false,
        conditional: { field: 'vrsta_radnog_odnosa', value: 'Na određeno vreme' },
        options: [
          { value: 'zamena odsutnog radnika', label: 'Zamena odsutnog radnika' },
          { value: 'privremeno povećanje obima posla', label: 'Privremeno povećanje obima posla' },
          { value: 'sezonski poslovi', label: 'Sezonski poslovi' },
          { value: 'rad na specifičnom projektu', label: 'Rad na specifičnom projektu' },
        ],
      },
      {
        id: 'probni_rad',
        label: 'Probni rad',
        type: 'toggle',
        required: false,
        defaultValue: false,
      },
      {
        id: 'probni_rad_meseci',
        label: 'Trajanje probnog rada (meseci)',
        type: 'number',
        required: false,
        min: 1,
        max: 6,
        defaultValue: 3,
        conditional: { field: 'probni_rad', value: true },
      },
    ],
  },
  {
    id: 'zarada',
    title: 'Zarada i naknade',
    fields: [
      {
        id: 'bruto',
        label: 'Osnovna bruto zarada (RSD)',
        type: 'number',
        required: true,
        min: 1,
        placeholder: 'npr. 120000',
        hint: 'Minimalna zarada 2024: ~46.000 RSD neto za puno radno vreme',
      },
      {
        id: 'nacin_isplate',
        label: 'Način isplate',
        type: 'text',
        required: true,
        defaultValue: 'na tekući račun banke',
      },
      { id: 'dan_isplate', label: 'Dan isplate u mesecu', type: 'number', required: true, min: 1, max: 31, placeholder: 'npr. 15' },
      { id: 'topli_obrok', label: 'Topli obrok (RSD mesečno)', type: 'number', required: false, placeholder: 'opciono' },
      {
        id: 'prevoz',
        label: 'Naknada za prevoz',
        type: 'radio',
        required: false,
        options: [
          { value: 'Stvarni troškovi prevoza', label: 'Stvarni troškovi' },
          { value: 'Fiksni iznos', label: 'Fiksni iznos' },
          { value: 'Bez naknade za prevoz', label: 'Bez naknade' },
        ],
      },
    ],
  },
  {
    id: 'radno_vreme',
    title: 'Radno vreme i odmor',
    fields: [
      {
        id: 'fond_sati',
        label: 'Nedeljni fond radnih sati',
        type: 'number',
        required: true,
        min: 1,
        max: 48,
        defaultValue: 40,
      },
      { id: 'raspored', label: 'Raspored radnog vremena', type: 'text', required: true, placeholder: 'npr. Pon–Pet 09:00–17:00h' },
      {
        id: 'godisnji_odmor',
        label: 'Broj dana godišnjeg odmora',
        type: 'number',
        required: true,
        min: 20,
        defaultValue: 20,
        hint: 'Zakonski minimum je 20 radnih dana',
      },
    ],
  },
  {
    id: 'opciono',
    title: 'Dodatne odredbe',
    fields: [
      { id: 'zabrana_konkurencije', label: 'Zabrana konkurencije', type: 'toggle', required: false, defaultValue: false },
      {
        id: 'trajanje_zabrane',
        label: 'Trajanje zabrane (meseci, max 24)',
        type: 'number',
        required: false,
        min: 1,
        max: 24,
        defaultValue: 12,
        conditional: { field: 'zabrana_konkurencije', value: true },
      },
      { id: 'napomene', label: 'Posebne napomene / dodatne klauzule', type: 'textarea', required: false, placeholder: 'opciono' },
    ],
  },
]
