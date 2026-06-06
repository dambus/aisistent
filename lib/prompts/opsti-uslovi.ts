import type { OpstiUsloviData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITICNO PRAVILO

Sve licne podatke i nazive firmi korisnik daje u NOMINATIVU. Dekliniras ih prema gramatickom kontekstu svake recenice.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeza.

Padezi: nominativ za subjekat, genitiv za svojinu i opisivanje, dativ za primaoca, akuzativ za direktan objekat, instrumental za sredstvo ili pratnju, lokativ uz predloge o/u/na/pri.

Firme: "Sigma doo" -> "Sigma doo-a" u genitivu i "Sigma doo-u" u dativu. Skraćenice doo, ad i sp dekliniraju se sa crticom.

Lična imena: Petar Nikolić -> Petra Nikolića -> Petru Nikoliću; Nikola Stanić -> Nikole Stanića -> Nikoli Staniću; Ana Marković -> Ane Marković -> Ani Marković; Jelena Stojanović -> Jelene Stojanović -> Jeleni Stojanović.`

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu Opstih uslova koriscenja i Politike privatnosti za srpsko trziste.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generises OBA dokumenta u jednom odgovoru:
1. OPSTI USLOVI KORISCENJA
2. POLITIKA PRIVATNOSTI

Dokumente jasno odvoji velikim naslovima. Tekst prilagodi tipu biznisa koji korisnik unese. Pokrij GDPR obaveze i Zakon o zastiti podataka o licnosti ("Sl. glasnik RS", br. 87/2018).

${declensionRules}

## OBAVEZNI ELEMENTI - OPSTI USLOVI

1. Podaci o pruzaocu usluge
2. Opis usluge ili platforme
3. Prava i obaveze korisnika
4. Uslovi placanja ako su relevantni
5. Ogranicenje odgovornosti
6. Intelektualna svojina
7. Izmene uslova
8. Kontakt i resavanje sporova

## OBAVEZNI ELEMENTI - POLITIKA PRIVATNOSTI

1. Rukovalac podacima
2. Koji podaci se prikupljaju
3. Svrha i pravni osnov obrade
4. Cookies i analitika
5. Deljenje podataka sa trecim stranama
6. Rok cuvanja podataka
7. Prava lica na koje se podaci odnose
8. Kontakt za privatnost

## TON I STIL

- Jasan, citljiv jezik
- Bez korporativnog zargona
- Srpski jezik, latinica
- Prilagodi formulacije realnom tipu biznisa

## STA NE RADIS

- Ne izmisljas podatke koje korisnik nije dao - oznaci sa [POPUNITI: naziv podatka]
- Ne garantujes uskladjenost bez pravne provere
- Na kraju oba dokumenta ukljuci napomenu: "Napomena: Ovaj dokument je generisan uz pomoc AI alata i sluzi kao polazna osnova. Preporucuje se pravna provera pre objavljivanja."`

function formatList(value: string[] | string): string {
  return Array.isArray(value) ? value.join(', ') : value
}

export function buildUserMessage(data: OpstiUsloviData): string {
  return `Molim te generisi Opste uslove koriscenja i Politiku privatnosti sa sledecim podacima:

FIRMA:
- Naziv: ${data.naziv_firme}
- PIB: ${data.pib}
- Adresa: ${data.adresa}
- Email za kontakt: ${data.email}
- Sajt/aplikacija URL: ${data.url}

TIP BIZNISA:
- Tip: ${data.tip_biznisa}
- Opis usluge: ${data.opis_usluge}

PODACI:
- Prikupljaju se licni podaci: ${data.prikuplja_podatke ? 'Da' : 'Ne'}
- Vrste podataka: ${formatList(data.vrste_podataka)}
- Koriste se analiticki alati: ${data.analitika ? 'Da' : 'Ne'}
- Podaci se dele sa trecim stranama: ${data.deli_sa_trecim_stranama ? 'Da' : 'Ne'}

Svi podaci su u nominativu. Dekliniras ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma',
    title: 'Firma',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true },
      { id: 'pib', label: 'PIB', type: 'text', required: true },
      { id: 'adresa', label: 'Adresa', type: 'text', required: true },
      { id: 'email', label: 'Email za kontakt', type: 'text', required: true },
      { id: 'url', label: 'Sajt/aplikacija URL', type: 'text', required: true },
    ],
  },
  {
    id: 'biznis',
    title: 'Tip biznisa',
    fields: [
      {
        id: 'tip_biznisa',
        label: 'Tip biznisa',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite najbliži tip — od toga zavisi sadržaj dokumenata. E-commerce ima specifične obaveze o pravu na odustanak, SaaS o licenci i ograničenju odgovornosti.',
        options: [
          { value: 'E-commerce', label: 'E-commerce' },
          { value: 'SaaS/Aplikacija', label: 'SaaS/Aplikacija' },
          { value: 'Usluzna delatnost', label: 'Usluzna delatnost' },
          { value: 'Blog/Mediji', label: 'Blog/Mediji' },
          { value: 'Ostalo', label: 'Ostalo' },
        ],
      },
      { id: 'opis_usluge', label: 'Opis usluge', type: 'textarea', required: true },
    ],
  },
  {
    id: 'podaci',
    title: 'Podaci',
    fields: [
      { id: 'prikuplja_podatke', label: 'Da li se prikupljaju licni podaci?', type: 'toggle', required: false, defaultValue: true, tooltip: 'Ako prikupljate i/ili obrađujete lične podatke korisnika (email, ime, adresa...), imate obaveze po Zakonu o zaštiti podataka o ličnosti i GDPR-u.' },
      {
        id: 'vrste_podataka',
        label: 'Koje vrste podataka?',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'Ime/email', label: 'Ime/email' },
          { value: 'Adresa', label: 'Adresa' },
          { value: 'Platne informacije', label: 'Platne informacije' },
          { value: 'Lokacija', label: 'Lokacija' },
          { value: 'Cookies', label: 'Cookies' },
        ],
      },
      { id: 'analitika', label: 'Koriste se analiticki alati?', type: 'toggle', required: false, defaultValue: false },
      { id: 'deli_sa_trecim_stranama', label: 'Podaci se dele sa trecim stranama?', type: 'toggle', required: false, defaultValue: false },
    ],
  },
]
