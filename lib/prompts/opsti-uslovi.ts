import type { OpstiUsloviData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve lične podatke i nazive firmi korisnik daje u NOMINATIVU. Dekliniraš ih prema gramatičkom kontekstu svake rečenice.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeža.

Padeži: nominativ za subjekat, genitiv za svojinu i opisivanje, dativ za primaoca, akuzativ za direktan objekat, instrumental za sredstvo ili pratnju, lokativ uz predloge o/u/na/pri.

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

Ti si pravni asistent specijalizovan za izradu Opštih uslova korišćenja i Politike privatnosti za srpsko tržište.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generišeš OBA dokumenta u jednom odgovoru:
1. OPŠTI USLOVI KORIŠĆENJA
2. POLITIKA PRIVATNOSTI

Dokumente jasno odvoji velikim naslovima. Tekst prilagodi tipu biznisa koji korisnik unese. Pokrij GDPR obaveze i Zakon o zaštiti podataka o ličnosti ("Sl. glasnik RS", br. 87/2018).

${declensionRules}

## OBAVEZNI ELEMENTI - OPŠTI USLOVI

1. Podaci o pružaocu usluge
2. Opis usluge ili platforme
3. Prava i obaveze korisnika
4. Uslovi plaćanja ako su relevantni
5. Ograničenje odgovornosti
6. Intelektualna svojina
7. Izmene uslova
8. Kontakt i rešavanje sporova

## OBAVEZNI ELEMENTI - POLITIKA PRIVATNOSTI

1. Rukovalac podacima
2. Koji podaci se prikupljaju
3. Svrha i pravni osnov obrade
4. Cookies i analitika
5. Deljenje podataka sa trećim stranama
6. Rok čuvanja podataka
7. Prava lica na koje se podaci odnose
8. Kontakt za privatnost

## TON I STIL

- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Jasan, čitljiv jezik
- Bez korporativnog žargona
- Srpski jezik, latinica
- Prilagodi formulacije realnom tipu biznisa

## ŠTA NE RADIŠ

- Ne izmišljaš podatke koje korisnik nije dao - označi sa [POPUNITI: naziv podatka]
- Ne generiši datum stupanja na snagu kao posebno polje [POPUNITI]. Umesto toga napiši: "Ovi uslovi važe od dana objave na veb sajtu."
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.
- Ne garantuješ usklađenost bez pravne provere
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (datum objave, puni naziv dokumenta...).
- Ne dodaješ nikakvu napomenu niti disclaimer na kraju dokumenta.
  Sistem automatski dodaje standardnu napomenu u footer PDF-a.
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

function formatList(value: string[] | string): string {
  return Array.isArray(value) ? value.join(', ') : value
}

export function buildUserMessage(data: OpstiUsloviData): string {
  return `Molim te generiši Opšte uslove korišćenja i Politiku privatnosti sa sledećim podacima:

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
- Prikupljaju se lični podaci: ${data.prikuplja_podatke ? 'Da' : 'Ne'}
- Vrste podataka: ${formatList(data.vrste_podataka)}
- Koriste se analitički alati: ${data.analitika ? 'Da' : 'Ne'}
- Podaci se dele sa trećim stranama: ${data.deli_sa_trecim_stranama ? 'Da' : 'Ne'}

Svi podaci su u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma',
    title: 'Firma',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv kako piše u APR registru' },
      { id: 'pib', label: 'PIB', type: 'text', required: true, placeholder: '123456789', helperText: '9 cifara' },
      { id: 'adresa', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta firme' },
      { id: 'email', label: 'Email za kontakt', type: 'text', required: true, placeholder: 'npr. info@firma.rs', helperText: 'Email na koji korisnici šalju upite' },
      { id: 'url', label: 'Sajt/aplikacija URL', type: 'text', required: true, placeholder: 'npr. https://www.firma.rs', helperText: 'Adresa sajta ili aplikacije' },
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
          { value: 'Uslužna delatnost', label: 'Uslužna delatnost' },
          { value: 'Blog/Mediji', label: 'Blog/Mediji' },
          { value: 'Ostalo', label: 'Ostalo' },
        ],
      },
      { id: 'opis_usluge', label: 'Opis usluge', type: 'textarea', required: true, placeholder: 'npr. Online prodavnica sportske opreme. Korisnici mogu kupovati proizvode, pratiti narudžbine...', helperText: 'Kratko opišite šta vaša platforma radi' },
    ],
  },
  {
    id: 'podaci',
    title: 'Podaci',
    fields: [
      { id: 'prikuplja_podatke', label: 'Da li se prikupljaju lični podaci?', type: 'toggle', required: false, defaultValue: true, tooltip: 'Ako prikupljate i/ili obrađujete lične podatke korisnika (email, ime, adresa...), imate obaveze po Zakonu o zaštiti podataka o ličnosti i GDPR-u.' },
      {
        id: 'vrste_podataka',
        label: 'Koje vrste podataka?',
        type: 'dropdown',
        required: true,
        tooltip: 'Označite sve kategorije podataka koje prikupljate od korisnika sajta ili aplikacije.',
        options: [
          { value: 'Ime/email', label: 'Ime/email' },
          { value: 'Adresa', label: 'Adresa' },
          { value: 'Platne informacije', label: 'Platne informacije' },
          { value: 'Lokacija', label: 'Lokacija' },
          { value: 'Cookies', label: 'Cookies' },
        ],
      },
      { id: 'analitika', label: 'Koriste se analitički alati?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Google Analytics, Facebook Pixel i slični alati za praćenje poseta sajtu.' },
      { id: 'deli_sa_trecim_stranama', label: 'Podaci se dele sa trećim stranama?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Da li dostavljate podatke korisnika trećim stranama (marketinški partneri, procesori plaćanja i sl.)?' },
    ],
  },
]
