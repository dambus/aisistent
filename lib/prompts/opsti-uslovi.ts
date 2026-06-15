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

KOLAČIĆI — obavezna pravila:
- Ako koristi_kolacice == true: u sekciji o kolačićima OBAVEZNO dodati: 'Analitički kolačići se postavljaju isključivo uz vaš prethodni, aktivni pristanak putem cookie bannera na sajtu. Možete odbiti postavljanje analitičkih kolačića bez uticaja na osnovnu funkcionalnost sajta.'
- Implicitni pristanak kroz korišćenje sajta NIJE valjan za analitičke kolačiće — ne koristiti formulaciju 'korišćenjem sajta pristajete na kolačiće'
- Tehnički kolačići (neophodni za funkcionisanje sajta) ne zahtevaju pristanak

PREKOGRANIČNI PRENOS PODATAKA:
- Ako koristi_google_analytics == true: generiši posebnu sekciju u Politici privatnosti:

'PREKOGRANIČNI PRENOS PODATAKA
Korišćenjem analitičkih alata (Google Analytics), određeni podaci o korišćenju sajta (IP adresa, ponašanje korisnika) prenose se na servere kompanije Google LLC, koji se nalaze u Sjedinjenim Američkim Državama.
Prenos se vrši na osnovu standardnih ugovornih klauzula (Standard Contractual Clauses) koje je Google LLC zaključio sa Evropskom komisijom, a koje se primenjuju i u odnosu na Republiku Srbiju u skladu sa čl. 64. Zakona o zaštiti podataka o ličnosti.
Za više informacija o načinu obrade podataka od strane Google-a, posetite: https://policies.google.com/privacy'

OGRANIČENJE ODGOVORNOSTI — obavezna klauzula:
Sekcija o ograničenju odgovornosti MORA sadržati: 'Ovo ograničenje odgovornosti ne primenjuje se u slučaju štete prouzrokovane namerno ili grubom nepažnjom Pružaoca usluge, u skladu sa čl. 264. Zakona o obligacionim odnosima Republike Srbije.'
Ne generiši potpuno isključenje odgovornosti bez ove rezerve — takva klauzula bi bila ništava po srpskom pravu.

## TON I STIL

- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Jasan, čitljiv jezik
- Bez korporativnog žargona
- Srpski jezik, latinica
- Prilagodi formulacije realnom tipu biznisa
- Datum objave: ako datum_objave nije unet, generiši '[POPUNITI: datum objave]' — NIKAD ne piši 'važi od dana objave' bez konkretnog datuma

## ŠTA NE RADIŠ

- Ne izmišljaš podatke koje korisnik nije dao - označi sa [POPUNITI: naziv podatka]
- Ne koristi termin 'Poverenica za zaštitu podataka' za interno lice u firmi — 'Poverenica' je naziv za državni regulatorni organ. Ispravni termin za interno lice je 'Lice za zaštitu podataka' ili 'DPO (Data Protection Officer)'
- Ako dpo_email postoji: generiši sekciju 'Lice za zaštitu podataka (DPO)' sa posebnim email kontaktom
- Ako dpo_email ne postoji: ne generiši sekciju o DPO — samo navedi opšti kontakt za pitanja o privatnosti
- Ne koristi formulaciju 'korišćenjem sajta pristajete na obradu podataka' kao osnov za pristanak — pristanak po GDPR/ZZPL mora biti slobodan, specifičan, informisan i nedvosmislen (aktivan opt-in)
- Ako se obrada zasniva na pristanku: navesti da se pristanak pribavlja posebno za svaku svrhu koja ga zahteva, odvojeno od prihvatanja Opštih uslova
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.
- Ne garantuješ usklađenost bez pravne provere
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (datum objave, puni naziv dokumenta...).
- Ne dodaješ nikakvu napomenu niti disclaimer na kraju dokumenta.
  Sistem automatski dodaje standardnu napomenu u footer PDF-a.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
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
- Datum objave: ${data.datum_objave ?? '[POPUNITI: datum objave]'}
- DPO email: ${data.dpo_email ?? '[koristiti opšti kontakt email]'}

TIP BIZNISA:
- Tip: ${data.tip_biznisa}
- Opis usluge: ${data.opis_usluge}
- Analitički kolačići: ${data.koristi_kolacice ? 'Da' : 'Ne'}
- Google Analytics: ${data.koristi_google_analytics ? 'Da — uključiti sekciju o prekograničnom prenosu podataka' : 'Ne'}

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
      {
        id: 'datum_objave',
        label: 'Datum objave dokumenta',
        type: 'date',
        required: false,
        helperText: 'Datum kada dokumenti stupaju na snagu. Ako se ne unese, biće označeno kao [POPUNITI].'
      },
      {
        id: 'koristi_kolacice',
        label: 'Da li sajt koristi analitičke kolačiće?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        tooltip: 'Analitički kolačići (Google Analytics i sl.) zahtevaju aktivni pristanak korisnika pre postavljanja — nije dovoljno "korišćenjem sajta pristajete". Ako koristite kolačiće, dokument mora sadržati napomenu o cookie banneru.'
      },
      {
        id: 'koristi_google_analytics',
        label: 'Da li koristite Google Analytics ili slične alate?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        conditional: { field: 'koristi_kolacice', value: true },
        tooltip: 'Google Analytics prenosi podatke o korisnicima (IP adresa, ponašanje) na servere u SAD. ZZPL i GDPR zahtevaju da se ovo eksplicitno navede u Politici privatnosti, zajedno sa pravnim osnovom za prekogranični prenos podataka.'
      },
      {
        id: 'dpo_email',
        label: 'Email lica za zaštitu podataka (DPO)',
        type: 'text',
        required: false,
        placeholder: 'npr. dpo@vasafirma.rs',
        helperText: 'Ako postoji posebno lice za zaštitu podataka, unesite njegov kontakt. Ako ne, polje ostavite prazno — koristiće se opšti kontakt email.',
        tooltip: 'Lice za zaštitu podataka (DPO) mora imati poseban kontakt kanal odvojen od opšteg kontakta firme. Manje firme koje nemaju obavezu imenovanja DPO mogu izostaviti ovo polje.'
      },
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
