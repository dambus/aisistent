import type { PoslovniMejlData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITICNO PRAVILO

Ime primaoca korisnik daje u NOMINATIVU. Dekliniras ga prema kontekstu recenice, posebno u pozdravu i obracanju.

NIKADA ne kopiraj ime direktno iz inputa bez provere padeza.

Primeri: Petar Nikolic -> Petre Nikolicu / Petra Nikolica; Nikola Stanic -> Nikola / Nikoli Stanicu; Ana Markovic -> Ana / Ani Markovic; Jelena Stojanovic -> Jelena / Jeleni Stojanovic. Ako je primalac "Tim" ili odeljenje, koristi neutralno obracanje.`

export const systemPrompt = `Ti si asistent za pisanje profesionalnih poslovnih mejlova na srpskom jeziku za B2B komunikaciju.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi pises kratak, jasan i upotrebljiv poslovni mejl. Ton je profesionalan ali topao, direktan i bez korporativnog zargona.

Prilagodjavas ton tipu mejla: formalniji za opomenu, topliji za zahvalnicu, smiren za zalbu, konkretan za ponudu ili podsetnik.

${declensionRules}

## PRAVILA

- Ne pises subject line kao deo tela mejla - subject je posebno polje i ne generises ga osim ako korisnik to izricito trazi
- Telo mejla ima najvise 150 reci osim ako korisnik trazi duze
- Uvek ukljuci primeren pozdrav i potpis posiljaoca
- Ako je hitno, koristi jasan ali profesionalan jezik bez pritiska ili pretnji
- Ne izmisljas cinjenice, rokove, dugovanja ili ponude koje korisnik nije naveo

## FORMAT IZLAZA

Ako korisnik dostavi predmet mejla, pocni odgovor sa:
Predmet: [predmet]

Zatim generisi telo mejla, bez dodatnih objasnjenja.

Na kraju dodaj:
Generisano uz pomoc AIsistent.rs`

export function buildUserMessage(data: PoslovniMejlData): string {
  return `Molim te napisi poslovni mejl sa sledecim podacima:

POSILJALAC:
- Ime i prezime: ${data.posiljalac_ime}
- Firma: ${data.posiljalac_firma}
- Pozicija: ${data.posiljalac_pozicija}

PRIMALAC:
- Ime i prezime / tim: ${data.primalac_ime}
- Firma primaoca: ${data.primalac_firma}

MEJL:
- Tip mejla: ${data.tip_mejla}
- Kontekst/detalji: ${data.kontekst}
- Ton: ${data.ton}
- Hitno: ${data.hitno ? 'Da' : 'Ne'}${data.predmet ? `\n- Predmet mejla: ${data.predmet}` : ''}

Svi podaci su u nominativu. Dekliniras ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'posiljalac',
    title: 'Posiljalac',
    fields: [
      { id: 'posiljalac_ime', label: 'Ime i prezime', type: 'text', required: true },
      { id: 'posiljalac_firma', label: 'Naziv firme', type: 'text', required: true },
      { id: 'posiljalac_pozicija', label: 'Pozicija', type: 'text', required: true },
    ],
  },
  {
    id: 'primalac',
    title: 'Primalac',
    fields: [
      { id: 'primalac_ime', label: 'Ime i prezime ili tim/odeljenje', type: 'text', required: true },
      { id: 'primalac_firma', label: 'Naziv firme primaoca', type: 'text', required: true },
    ],
  },
  {
    id: 'mejl',
    title: 'Mejl',
    fields: [
      {
        id: 'tip_mejla',
        label: 'Tip mejla',
        type: 'dropdown',
        required: true,
        tooltip: 'Odaberite tip koji najbliže odgovara svrsi mejla — sistem će prilagoditi ton i strukturu.\nOpomena za dugovanje: preporučujemo slanje preporučenom poštom uz mejl.',
        options: [
          { value: 'Ponuda klijentu', label: 'Ponuda klijentu' },
          { value: 'Opomena za dugovanje', label: 'Opomena za dugovanje' },
          { value: 'Zahvalnica za saradnju', label: 'Zahvalnica za saradnju' },
          { value: 'Odbijanje ponude', label: 'Odbijanje ponude' },
          { value: 'Zahtev za produzenje roka', label: 'Zahtev za produzenje roka' },
          { value: 'Zalba na uslugu', label: 'Zalba na uslugu' },
          { value: 'Uvodni mejl / predstavljanje', label: 'Uvodni mejl / predstavljanje' },
          { value: 'Podsetnik na sastanak', label: 'Podsetnik na sastanak' },
          { value: 'Otkazivanje sastanka', label: 'Otkazivanje sastanka' },
          { value: 'Ostalo', label: 'Ostalo' },
        ],
      },
      { id: 'kontekst', label: 'Kontekst / detalji', type: 'textarea', required: true, helperText: 'npr. Klijent duguje 3 iznosa, poslednji podsetnik bio pre mesec dana', tooltip: 'Što više detalja unesete, to će mejl biti precizniji i personalizovaniji. Unesite ključne činjenice koje mejl mora da sadrži.' },
      {
        id: 'ton',
        label: 'Ton',
        type: 'radio',
        required: true,
        options: [
          { value: 'Formalan', label: 'Formalan' },
          { value: 'Profesionalan', label: 'Profesionalan' },
          { value: 'Topao', label: 'Topao' },
        ],
      },
      { id: 'hitno', label: 'Da li je hitno?', type: 'toggle', required: false, defaultValue: false },
      { id: 'predmet', label: 'Predmet mejla (opciono)', type: 'text', required: false },
    ],
  },
]
