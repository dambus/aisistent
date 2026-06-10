import type { PunomocjeData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve lične podatke koje korisnik unosi korisnik uvek daje u NOMINATIVU. Ti si odgovoran za ispravnu deklinaciju svakog podatka prema gramatičkom kontekstu rečenice u kojoj se taj podatak pojavljuje.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeža.

### Padeži koje koristiš i kada:

NOMINATIV (ko? šta?) - subjekat rečenice
GENITIV (koga? čega?) - svojina, odsustvo, opisivanje
DATIV (kome? čemu?) - primalac, upućivanje
AKUZATIV (koga? šta?) - direktan objekat
INSTRUMENTAL (kim? čime?) - sredstvo, pratnja
LOKATIV (o kome? o čemu?) - uz predloge o, u, na, pri

### Pravila za deklinaciju firmi (doo, ad, sp):

- Skraćenice se dekliniraju sa crticom: doo-a (gen.), doo-u (dat.)
- Naziv koji završava suglasnikom - dodaj "-a" (gen.), "-u" (dat.)
- Naziv koji završava samoglasnikom - genitiv "-e" ili nepromenjivo

### Pravila za deklinaciju ličnih imena:

MUŠKA IMENA (završavaju suglasnikom):
- Petar Nikolić -> Petra Nikolića -> Petru Nikoliću -> Petra Nikolića
- Milan Jović -> Milana Jovića -> Milanu Joviću

MUŠKA IMENA (završavaju na -a):
- Nikola Stanić -> Nikole Stanića -> Nikoli Staniću -> Nikolu Stanića
- Luka Popović -> Luke Popovića -> Luki Popoviću -> Luku Popovića

ŽENSKA IMENA (završavaju na -a):
- Ana Marković -> Ane Marković -> Ani Marković -> Anu Marković
- Jelena Stojanović -> Jelene Stojanović -> Jeleni Stojanović

ŽENSKA IMENA (završavaju suglasnikom - strana):
- Carmen, Isabel -> nepromenjivo u srpskom kontekstu`

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu punomoćja po pravu Republike Srbije.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generišeš jasno, kompletno i upotrebljivo punomoćje na srpskom jeziku (latinica). Podržavaš: opšte punomoćje, specijalno punomoćje za određenu radnju, punomoćje za zastupanje pred sudom ili organom i punomoćje za prodaju nepokretnosti.

${declensionRules}

## TERMINI

Koristi termine "Vlastodavac" i "Punomoćnik" kroz ceo dokument nakon što strane definišeš u uvodnom delu.

## OBAVEZNI ELEMENTI

1. Naziv dokumenta prema tipu punomoćja
2. Identifikacija Vlastodavca
3. Identifikacija Punomoćnika
4. Precizan opis ovlašćenja
5. Trajanje punomoćja
6. Mogućnost opoziva
7. Napomena o overi kod javnog beležnika

## FORMAT IZLAZA

PUNOMOĆJE
Broj: {broj_ugovora ako postoji; ako je 'bez broja', ne prikazuj red 'Broj:'}
Datum: ___________

I. UGOVORNE STRANE
II. PREDMET I OBIM OVLAŠĆENJA
III. TRAJANJE I OPOZIV
IV. ZAVRŠNE ODREDBE

## TON I STIL

- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.

## ŠTA NE RADIŠ

- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne izmišljaš podatke koje korisnik nije dao - označi sa [POPUNITI: naziv podatka]
- Ne garantuješ da će organ prihvatiti punomoćje bez overe ili dodatne dokumentacije
- Ne dodaješ sekciju potpisa ako sistem to radi automatski
- Na kraju uključi napomenu: "Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao polazna osnova. Preporučuje se konsultacija sa pravnikom i overa kod javnog beležnika pre upotrebe."
- Ako je broj_ugovora 'bez broja' ili prazan, ne generiši redak 'Broj:' u zaglavlju.
- DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum (npr. 'dana...') piše: 'dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - JEDINI datum koji se generiše iz wizard inputa je datum isteka punomoćja — jer ga korisnik eksplicitno unosi.`

export function buildUserMessage(data: PunomocjeData): string {
  const brojUgovora = data.broj_ugovora?.trim() ? data.broj_ugovora.trim() : 'bez broja'

  return `Molim te generiši punomoćje sa sledećim podacima:

BROJ: ${brojUgovora}
VLASTODAVAC:
- Tip: ${data.tip_vlastodavca}
- Ime/Naziv: ${data.naziv_vlastodavca}
- JMBG/PIB: ${data.jmbg_pib_vlastodavca}
- Adresa: ${data.adresa_vlastodavca}

PUNOMOCNIK:
- Tip: ${data.tip_punomocnika}
- Ime/Naziv: ${data.naziv_punomocnika}
- JMBG/PIB: ${data.jmbg_pib_punomocnika}
- Adresa: ${data.adresa_punomocnika}

OVLAŠĆENJE:
- Tip punomoćja: ${data.tip_punomocja}
- Opis ovlašćenja: ${data.opis_ovlascenja}
- Trajanje: ${data.trajanje}${data.datum_isteka ? `\n- Datum isteka: ${data.datum_isteka}` : ''}

Svi podaci su u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'vlastodavac',
    title: 'Vlastodavac',
    fields: [
      {
        id: 'broj_ugovora',
        label: 'Broj ugovora',
        type: 'text',
        required: false,
        placeholder: 'npr. 001/2026',
        helperText: 'Ostavite prazno ako ne želite broj',
        tooltip: 'Interni broj za vašu evidenciju. Ako ostavite prazno, punomoćje neće imati broj u zaglavlju.',
      },
      {
        id: 'tip_vlastodavca',
        label: 'Tip vlastodavca',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_vlastodavca', label: 'Ime i prezime / Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime vlastodavca ili naziv firme' },
      {
        id: 'jmbg_pib_vlastodavca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_vlastodavca',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_vlastodavca', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta vlastodavca' },
    ],
  },
  {
    id: 'punomocnik',
    title: 'Punomoćnik',
    fields: [
      {
        id: 'tip_punomocnika',
        label: 'Tip punomoćnika',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_punomocnika', label: 'Ime i prezime / Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime punomoćnika ili naziv firme' },
      {
        id: 'jmbg_pib_punomocnika',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_punomocnika',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_punomocnika', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta punomoćnika' },
    ],
  },
  {
    id: 'ovlascenje',
    title: 'Ovlascenje',
    fields: [
      {
        id: 'tip_punomocja',
        label: 'Tip punomoćja',
        type: 'radio',
        required: true,
        tooltip: 'Opšte — ovlašćuje punomoćnika za sve pravne radnje u ime vlastodavca.\nSpecijalno — samo za jednu konkretnu radnju.\nPred sudom/organima — za zastupanje u postupcima.\nZa nepokretnosti — obavezna overa kod javnog beležnika.',
        options: [
          { value: 'Opšte', label: 'Opšte' },
          { value: 'Specijalno', label: 'Specijalno' },
          { value: 'Sud i organi', label: 'Sud i organi' },
          { value: 'Nepokretnosti', label: 'Nepokretnosti' },
        ],
      },
      { id: 'opis_ovlascenja', label: 'Opis ovlašćenja', type: 'textarea', required: true, placeholder: 'npr. Zastupanje pred Poreskom upravom radi uvida u poresku evidenciju i podnošenja poreskih prijava...', helperText: 'Navedite tačno za šta punomoćnik ima ovlašćenje' },
      {
        id: 'trajanje',
        label: 'Trajanje',
        type: 'radio',
        required: true,
        tooltip: 'Neograničeno — važi dok se ne opozove.\nDo opoziva — važi dok vlastodavac pismeno ne opozove.\nOdređeni datum — automatski ističe na navedeni datum.',
        options: [
          { value: 'Neograničeno', label: 'Neograničeno' },
          { value: 'Do opoziva', label: 'Do opoziva' },
          { value: 'Određeni datum', label: 'Određeni datum' },
        ],
      },
      { id: 'datum_isteka', label: 'Datum isteka', type: 'date', required: false, helperText: 'Datum do kada punomoćje važi', conditional: { field: 'trajanje', value: 'Određeni datum' } },
    ],
  },
]
