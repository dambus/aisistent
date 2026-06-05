import type { PunomocjeData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITICNO PRAVILO

Sve licne podatke koje korisnik unosi korisnik uvek daje u NOMINATIVU. Ti si odgovoran za ispravnu deklinaciju svakog podatka prema gramatickom kontekstu recenice u kojoj se taj podatak pojavljuje.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeza.

### Padezi koje koristis i kada:

NOMINATIV (ko? sta?) - subjekat recenice
GENITIV (koga? cega?) - svojina, odsustvo, opisivanje
DATIV (kome? cemu?) - primalac, upucivanje
AKUZATIV (koga? sta?) - direktan objekat
INSTRUMENTAL (kim? cime?) - sredstvo, pratnja
LOKATIV (o kome? o cemu?) - uz predloge o, u, na, pri

### Pravila za deklinaciju firmi (doo, ad, sp):

- Skracenice se dekliniraju sa crticom: doo-a (gen.), doo-u (dat.)
- Naziv koji zavrsava suglasnikom - dodaj "-a" (gen.), "-u" (dat.)
- Naziv koji zavrsava samoglasnikom - genitiv "-e" ili nepromenjivo

### Pravila za deklinaciju licnih imena:

MUSKA IMENA (zavrsavaju suglasnikom):
- Petar Nikolic -> Petra Nikolica -> Petru Nikolicu -> Petra Nikolica
- Milan Jovic -> Milana Jovica -> Milanu Jovicu

MUSKA IMENA (zavrsavaju na -a):
- Nikola Stanic -> Nikole Stanica -> Nikoli Stanicu -> Nikolu Stanica
- Luka Popovic -> Luke Popovica -> Luki Popovicu -> Luku Popovica

ZENSKA IMENA (zavrsavaju na -a):
- Ana Markovic -> Ane Markovic -> Ani Markovic -> Anu Markovic
- Jelena Stojanovic -> Jelene Stojanovic -> Jeleni Stojanovic

ZENSKA IMENA (zavrsavaju suglasnikom - strana):
- Carmen, Isabel -> nepromenjivo u srpskom kontekstu`

export const systemPrompt = `Ti si pravni asistent specijalizovan za izradu punomocja po pravu Republike Srbije.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generises jasno, kompletno i upotrebljivo punomocje na srpskom jeziku (latinica). Podrzavas: opste punomocje, specijalno punomocje za odredjenu radnju, punomocje za zastupanje pred sudom ili organom i punomocje za prodaju nepokretnosti.

${declensionRules}

## TERMINI

Koristi termine "Vlastodavac" i "Punomocnik" kroz ceo dokument nakon sto strane definises u uvodnom delu.

## OBAVEZNI ELEMENTI

1. Naziv dokumenta prema tipu punomocja
2. Identifikacija Vlastodavca
3. Identifikacija Punomocnika
4. Precizan opis ovlascenja
5. Trajanje punomocja
6. Mogucnost opoziva
7. Napomena o overi kod javnog beleznika

## FORMAT IZLAZA

PUNOMOCJE
Datum: [datum generisanja]

I. UGOVORNE STRANE
II. PREDMET I OBIM OVLASCENJA
III. TRAJANJE I OPOZIV
IV. ZAVRSNE ODREDBE

## STA NE RADIS

- Ne izmisljas podatke koje korisnik nije dao - oznaci sa [POPUNITI: naziv podatka]
- Ne garantujes da ce organ prihvatiti punomocje bez overe ili dodatne dokumentacije
- Ne dodajes sekciju potpisa ako sistem to radi automatski
- Na kraju ukljuci napomenu: "Napomena: Ovaj dokument je generisan uz pomoc AI alata i sluzi kao polazna osnova. Preporucuje se konsultacija sa pravnikom i overa kod javnog beleznika pre upotrebe."`

export function buildUserMessage(data: PunomocjeData): string {
  return `Molim te generisi punomocje sa sledecim podacima:

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

OVLASCENJE:
- Tip punomocja: ${data.tip_punomocja}
- Opis ovlascenja: ${data.opis_ovlascenja}
- Trajanje: ${data.trajanje}${data.datum_isteka ? `\n- Datum isteka: ${data.datum_isteka}` : ''}

Svi podaci su u nominativu. Dekliniras ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'vlastodavac',
    title: 'Vlastodavac',
    fields: [
      {
        id: 'tip_vlastodavca',
        label: 'Tip vlastodavca',
        type: 'radio',
        required: true,
        options: [
          { value: 'Fizicko lice', label: 'Fizicko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_vlastodavca', label: 'Ime i prezime / Naziv', type: 'text', required: true },
      { id: 'jmbg_pib_vlastodavca', label: 'JMBG / PIB', type: 'text', required: true },
      { id: 'adresa_vlastodavca', label: 'Adresa', type: 'text', required: true },
    ],
  },
  {
    id: 'punomocnik',
    title: 'Punomocnik',
    fields: [
      {
        id: 'tip_punomocnika',
        label: 'Tip punomocnika',
        type: 'radio',
        required: true,
        options: [
          { value: 'Fizicko lice', label: 'Fizicko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_punomocnika', label: 'Ime i prezime / Naziv', type: 'text', required: true },
      { id: 'jmbg_pib_punomocnika', label: 'JMBG / PIB', type: 'text', required: true },
      { id: 'adresa_punomocnika', label: 'Adresa', type: 'text', required: true },
    ],
  },
  {
    id: 'ovlascenje',
    title: 'Ovlascenje',
    fields: [
      {
        id: 'tip_punomocja',
        label: 'Tip punomocja',
        type: 'radio',
        required: true,
        tooltip: 'Opste — ovlascuje punomoćnika za sve pravne radnje u ime vlastodavca.\nSpecijalno — samo za jednu konkretnu radnju.\nPred sudom/organima — za zastupanje u postupcima.\nZa nepokretnosti — obavezna overa kod javnog beleznika.',
        options: [
          { value: 'Opste', label: 'Opste' },
          { value: 'Specijalno', label: 'Specijalno' },
          { value: 'Sud i organi', label: 'Sud i organi' },
          { value: 'Nepokretnosti', label: 'Nepokretnosti' },
        ],
      },
      { id: 'opis_ovlascenja', label: 'Opis ovlascenja', type: 'textarea', required: true },
      {
        id: 'trajanje',
        label: 'Trajanje',
        type: 'radio',
        required: true,
        options: [
          { value: 'Neograniceno', label: 'Neograniceno' },
          { value: 'Do opoziva', label: 'Do opoziva' },
          { value: 'Odredjeni datum', label: 'Odredjeni datum' },
        ],
      },
      { id: 'datum_isteka', label: 'Datum isteka', type: 'date', required: false, conditional: { field: 'trajanje', value: 'Odredjeni datum' } },
    ],
  },
]
