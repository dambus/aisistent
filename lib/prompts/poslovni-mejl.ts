import type { PoslovniMejlData, WizardStep } from '@/types/wizard'
import { getVokativHint } from '@/lib/utils/vokativ'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Ime primaoca korisnik daje u NOMINATIVU. Dekliniraš ga prema kontekstu rečenice, posebno u pozdravu i obraćanju.

NIKADA ne kopiraj ime direktno iz inputa bez provere padeža.

Primeri: Petar Nikolić -> Petre Nikoliću / Petra Nikolića; Nikola Stanić -> Nikola / Nikoli Staniću; Ana Marković -> Ana / Ani Marković; Jelena Stojanović -> Jelena / Jeleni Stojanović. Ako je primalac "Tim" ili odeljenje, koristi neutralno obraćanje.`

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si asistent za pisanje profesionalnih poslovnih mejlova na srpskom jeziku za B2B komunikaciju.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi pišeš kratak, jasan i upotrebljiv poslovni mejl. Ton je profesionalan ali topao, direktan i bez korporativnog žargona.

Prilagođavaš ton tipu mejla: formalniji za opomenu, topliji za zahvalnicu, smiren za žalbu, konkretan za ponudu ili podsetnik.

${declensionRules}

## TON I STIL

- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.

## PRAVILA

- Ne pišeš subject line kao deo tela mejla - subject je posebno polje i ne generišeš ga osim ako korisnik to izričito traži
- Telo mejla ima najviše 150 reči osim ako korisnik traži duže
- Uvek uključi primeren pozdrav i potpis pošiljaoca
- Ako je hitno, koristi jasan ali profesionalan jezik bez pritiska ili pretnji
- Ne izmišljaš činjenice, rokove, dugovanja ili ponude koje korisnik nije naveo

## FORMAT IZLAZA

Ako korisnik dostavi predmet mejla, počni odgovor sa:
Predmet: [predmet]

Zatim generiši telo mejla, bez dodatnih objašnjenja.

Na kraju dodaj:
Generisano uz pomoć AIsistent.rs

## ŠTA NE RADIŠ

- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (pozdrav, telo mejla...).
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: PoslovniMejlData): string {
  return `Molim te napiši poslovni mejl sa sledećim podacima:

POŠILJALAC:
- Ime i prezime: ${data.posiljalac_ime}
- Firma: ${data.posiljalac_firma}
- Pozicija: ${data.posiljalac_pozicija}

PRIMALAC:
- Ime i prezime / tim: ${data.primalac_ime}${getVokativHint(data.primalac_ime)}
- Firma primaoca: ${data.primalac_firma}

MEJL:
- Tip mejla: ${data.tip_mejla}
- Kontekst/detalji: ${data.kontekst ?? '[POPUNITI: kontekst i detalji mejla]'}
- Ton: ${data.ton}
- Hitno: ${data.hitno ? 'Da' : 'Ne'}${data.predmet ? `\n- Predmet mejla: ${data.predmet}` : ''}

Svi podaci su u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'posiljalac',
    title: 'Pošiljalac',
    fields: [
      { id: 'posiljalac_ime', label: 'Ime i prezime', type: 'text', required: true, placeholder: 'npr. Petar Nikolić', helperText: 'Ime i prezime pošiljaoca mejla' },
      { id: 'posiljalac_firma', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme pošiljaoca' },
      { id: 'posiljalac_pozicija', label: 'Pozicija', type: 'text', required: true, placeholder: 'npr. Direktor prodaje', helperText: 'Funkcija ili radna pozicija pošiljaoca' },
    ],
  },
  {
    id: 'primalac',
    title: 'Primalac',
    fields: [
      { id: 'primalac_ime', label: 'Ime i prezime ili tim/odeljenje', type: 'text', required: true, placeholder: 'npr. Ana Marković ili Tim nabavke', helperText: 'Ime osobe ili naziv tima/odeljenja' },
      { id: 'primalac_firma', label: 'Naziv firme primaoca', type: 'text', required: true, placeholder: 'npr. ABC Company doo', helperText: 'Naziv firme kojoj šaljete mejl' },
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
          { value: 'Zahtev za produženje roka', label: 'Zahtev za produženje roka' },
          { value: 'Žalba na uslugu', label: 'Žalba na uslugu' },
          { value: 'Uvodni mejl / predstavljanje', label: 'Uvodni mejl / predstavljanje' },
          { value: 'Podsetnik na sastanak', label: 'Podsetnik na sastanak' },
          { value: 'Otkazivanje sastanka', label: 'Otkazivanje sastanka' },
          { value: 'Ostalo', label: 'Ostalo' },
        ],
      },
      { id: 'kontekst', label: 'Kontekst / detalji', type: 'textarea', required: true, placeholder: 'npr. Klijent duguje 3 iznosa, poslednji podsetnik bio pre mesec dana', helperText: 'npr. Klijent duguje 3 iznosa, poslednji podsetnik bio pre mesec dana', tooltip: 'Što više detalja unesete, to će mejl biti precizniji i personalizovaniji. Unesite ključne činjenice koje mejl mora da sadrži.' },
      {
        id: 'ton',
        label: 'Ton',
        type: 'radio',
        required: true,
        tooltip: 'Formalan — zvaničan poslovni ton.\nProfesionalan — ljubazan ali direktan.\nTopao — prijateljski i ličan.',
        options: [
          { value: 'Formalan', label: 'Formalan' },
          { value: 'Profesionalan', label: 'Profesionalan' },
          { value: 'Topao', label: 'Topao' },
        ],
      },
      { id: 'hitno', label: 'Da li je hitno?', type: 'toggle', required: false, defaultValue: false, helperText: 'Utiče na ton — hitniji i direktniji mejl' },
      { id: 'predmet', label: 'Predmet mejla (opciono)', type: 'text', required: false, placeholder: 'npr. Ponuda za web razvoj — jul 2026.', helperText: 'Subject line mejla (opciono)' },
    ],
  },
]
