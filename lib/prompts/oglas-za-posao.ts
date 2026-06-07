import type { OglasZaPosaoData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Nazive firmi, gradova i pozicija korisnik daje u NOMINATIVU. Dekliniraš ih prema kontekstu rečenice.

NIKADA ne kopiraj naziv direktno iz inputa bez provere padeža.

Primeri za firme: "Sigma doo" -> "u Sigma doo-u", "za Sigma doo-a". Primeri za lična imena ako se pojave: Petar Nikolić -> Petra Nikolića -> Petru Nikoliću; Ana Marković -> Ane Marković -> Ani Marković.`

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si asistent za pisanje oglasa za posao na srpskom jeziku.

## TVOJ ZADATAK

Generišeš profesionalan, human i konkretan oglas za posao koji privlači kvalitetne kandidate, jasno komunicira očekivanja i predstavlja firmu pozitivno.

Format prilagodi objavi na Infostudu, LinkedIn-u i sajtu firme.

${declensionRules}

## OBAVEZNI ELEMENTI

1. Naziv pozicije
2. Kratak uvod o firmi
3. Opis posla
4. Ključni zadaci
5. Uslovi: stručna sprema, iskustvo i veštine
6. Šta firma nudi
7. Rok za prijavu
8. Kako aplicirati

## TON I STIL

- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.

## PRAVILA

- Izbegavaj diskriminatorne uslove kao što su godine, pol, izgled, porodični status ili slično
- Ne izmišljaš benefite koje firma nije navela
- Ne praviš robotski spisak zahteva; tekst treba da zvuči kao da firma zna koga traži
- Ako je zarada "prema dogovoru" ili "konkurentna", ne navodi iznos
- Koristi srpski jezik latinicom

## FORMAT IZLAZA

Generiši oglas sa jasnim naslovima i kratkim pasusima. Na kraju dodaj:
Generisano uz pomoć AIsistent.rs`

function formatList(value: string[] | string): string {
  return Array.isArray(value) ? value.join(', ') : value
}

export function buildUserMessage(data: OglasZaPosaoData): string {
  const zarada = data.zarada_tip === 'Navedite iznos'
    ? `${data.zarada_tip}: ${data.iznos_zarade ?? '[POPUNITI: iznos zarade]'}`
    : data.zarada_tip

  return `Molim te generiši oglas za posao sa sledećim podacima:

FIRMA:
- Naziv firme: ${data.naziv_firme}
- Grad: ${data.grad}
- Delatnost: ${data.delatnost}
- Veličina: ${data.velicina}

POZICIJA:
- Naziv radnog mesta: ${data.naziv_pozicije}
- Tip angažovanja: ${data.tip_angazovanja}
- Lokacija rada: ${data.lokacija_rada}
- Stručna sprema: ${data.strucna_sprema}
- Iskustvo: ${data.iskustvo}

OPIS POSLA:
- Glavni zadaci: ${data.glavni_zadaci}
- Potrebne veštine: ${data.potrebne_vestine}
- Prednost: ${data.prednost ?? '[nema]'}

ŠTA FIRMA NUDI:
- Zarada: ${zarada}
- Benefiti: ${formatList(data.benefiti)}
- Rok za prijavu: ${data.rok_prijave}
- Kako aplicirati: ${data.kako_aplicirati}

Svi podaci su u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma',
    title: 'Firma',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true },
      { id: 'grad', label: 'Grad', type: 'text', required: true },
      { id: 'delatnost', label: 'Delatnost firme', type: 'textarea', required: true, helperText: 'npr. Razvoj softvera, Građevinarstvo, Ugostiteljstvo' },
      {
        id: 'velicina',
        label: 'Veličina firme',
        type: 'radio',
        required: true,
        options: [
          { value: 'Do 10', label: 'Do 10' },
          { value: '10-50', label: '10-50' },
          { value: '50-200', label: '50-200' },
          { value: '200+', label: '200+' },
        ],
      },
    ],
  },
  {
    id: 'pozicija',
    title: 'Pozicija',
    fields: [
      { id: 'naziv_pozicije', label: 'Naziv radnog mesta', type: 'text', required: true },
      {
        id: 'tip_angazovanja',
        label: 'Tip angažovanja',
        type: 'radio',
        required: true,
        options: [
          { value: 'Puno radno vreme', label: 'Puno radno vreme' },
          { value: 'Nepuno radno vreme', label: 'Nepuno' },
          { value: 'Projektno', label: 'Projektno' },
          { value: 'Praksa', label: 'Praksa' },
        ],
      },
      {
        id: 'lokacija_rada',
        label: 'Lokacija rada',
        type: 'radio',
        required: true,
        options: [
          { value: 'Kancelarija', label: 'Kancelarija' },
          { value: 'Remote', label: 'Remote' },
          { value: 'Hibridno', label: 'Hibridno' },
        ],
      },
      {
        id: 'strucna_sprema',
        label: 'Stručna sprema',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'Srednja stručna sprema', label: 'Srednja stručna sprema' },
          { value: 'Viša stručna sprema', label: 'Viša stručna sprema' },
          { value: 'Visoka stručna sprema', label: 'Visoka stručna sprema' },
          { value: 'Nije presudno', label: 'Nije presudno' },
        ],
      },
      {
        id: 'iskustvo',
        label: 'Iskustvo',
        type: 'radio',
        required: true,
        options: [
          { value: 'Bez iskustva', label: 'Bez iskustva' },
          { value: '1-2 god', label: '1-2 god' },
          { value: '3-5 god', label: '3-5 god' },
          { value: '5+', label: '5+' },
        ],
      },
    ],
  },
  {
    id: 'opis_posla',
    title: 'Opis posla',
    fields: [
      { id: 'glavni_zadaci', label: 'Glavni zadaci', type: 'textarea', required: true, helperText: 'Navedite 3-5 glavnih zadataka odvojenih zarezom ili u novim redovima', tooltip: 'Konkretni zadaci privlače bolje kandidate od opštih opisa. Umesto "komunikacija sa klijentima" napišite "vođenje 10-15 aktivnih klijenata mesečno".' },
      { id: 'potrebne_vestine', label: 'Potrebne veštine', type: 'textarea', required: true },
      { id: 'prednost', label: 'Prednost', type: 'textarea', required: false },
    ],
  },
  {
    id: 'ponuda',
    title: 'Šta firma nudi',
    fields: [
      {
        id: 'zarada_tip',
        label: 'Zarada',
        type: 'radio',
        required: true,
        options: [
          { value: 'Navedite iznos', label: 'Navedite iznos' },
          { value: 'Prema dogovoru', label: 'Prema dogovoru' },
          { value: 'Konkurentna', label: 'Konkurentna' },
        ],
      },
      { id: 'iznos_zarade', label: 'Iznos zarade', type: 'text', required: false, conditional: { field: 'zarada_tip', value: 'Navedite iznos' } },
      {
        id: 'benefiti',
        label: 'Benefiti',
        type: 'dropdown',
        required: true,
        tooltip: 'Kandidati često donose odluku o prijavi na osnovu benefita. Budite iskreni — nerealna obećanja vode do loše retencije.',
        options: [
          { value: 'Topli obrok', label: 'Topli obrok' },
          { value: 'Prevoz', label: 'Prevoz' },
          { value: 'Privatno zdravstveno', label: 'Privatno zdravstveno' },
          { value: 'Obuke', label: 'Obuke' },
          { value: 'Fleksibilno vreme', label: 'Fleksibilno vreme' },
          { value: 'Rad od kuce', label: 'Rad od kuce' },
          { value: 'Ostalo', label: 'Ostalo' },
        ],
      },
      { id: 'rok_prijave', label: 'Rok za prijavu', type: 'date', required: true },
      { id: 'kako_aplicirati', label: 'Kako aplicirati', type: 'textarea', required: true },
    ],
  },
]
