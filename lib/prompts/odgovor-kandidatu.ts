import type { OdgovorKandidatuData, WizardStep } from '@/types/wizard'
import { detectGender } from '@/lib/utils/genderDetect'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani poslodavci u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog i korporativni žargon
- Piši jasno, direktno i ljudski
- Koristi aktivnu formu gde god je moguće
- Srpska latinica je obavezna

Ti si asistent za pisanje profesionalnih odgovora kandidatima na oglase za posao.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi pišeš gotov odgovor kandidatu. Ton prilagođavaš tipu poruke:
- poziv na intervju: profesionalan, topao i konkretan
- prihvatanje ponude: pozitivan, jasan i motivišući
- odbijanje: korektan, human i dostojanstven

Uvek koristiš ime kandidata u pravilnom padežu i pišeš tekst kao mejl ili poruku spremnu za slanje.

## SRPSKI JEZIK I DEKLINACIJA

Ime kandidata i kontakt osobe korisnik daje u nominativu. Dekliniraš ih prema kontekstu rečenice.

Oslovljavanje na početku poruke je već određeno u polju "oslovljavanje" — koristi ga tačno onako kako je navedeno (Poštovana / Poštovani / Poštovani/a).

## FORMAT IZLAZA

Generiši samo gotov tekst odgovora, bez dodatnih objašnjenja, napomena ili uvoda za korisnika.

## ŠTA NE RADIŠ

- Ne izmišljaš podatke koje korisnik nije dao
- Ne obećavaš uslove, rokove ili iznose koji nisu navedeni
- Ne koristiš ćirilicu
- Ne pišeš generičke fraze bez sadržaja
- Ne dodaješ komentar da je tekst generisan veštačkom inteligencijom
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (oslovljavanje, uvod...).
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: OdgovorKandidatuData): string {
  const firstName = (data.ime_kandidata || '').split(' ')[0]
  const rod = detectGender(firstName)
  const oslovljavanje = rod === 'F' ? 'Poštovana' : rod === 'M' ? 'Poštovani' : 'Poštovani/a'

  return `Napiši profesionalan odgovor kandidatu sa sledećim podacima:

FIRMA:
- Naziv firme: ${data.naziv_firme}
- Kontakt osoba: ${data.kontakt_osoba}
- Pozicija: ${data.pozicija}

KANDIDAT:
- Ime kandidata: ${data.ime_kandidata}
- Oslovljavanje: ${oslovljavanje}${data.email_kandidata ? `\n- Email kandidata: ${data.email_kandidata}` : ''}

TIP ODGOVORA:
- Tip: ${data.tip_odgovora}${data.datum_intervjua ? `\n- Datum intervjua: ${data.datum_intervjua}` : ''}${data.vreme_intervjua ? `\n- Vreme intervjua: ${data.vreme_intervjua}` : ''}${data.format_intervjua ? `\n- Format intervjua: ${data.format_intervjua}` : ''}${data.adresa_ili_link ? `\n- Adresa ili link: ${data.adresa_ili_link}` : ''}${data.datum_pocetka ? `\n- Datum početka rada: ${data.datum_pocetka}` : ''}${typeof data.bruto_zarada === 'number' ? `\n- Bruto zarada: ${data.bruto_zarada.toLocaleString('sr-RS')} RSD` : ''}${data.napomena ? `\n- Dodatna napomena: ${data.napomena}` : ''}

Svi podaci su u nominativu. Molim te da imena dekliniraš ispravno prema kontekstu.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma',
    title: 'Firma',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Firma koja šalje odgovor kandidatu' },
      { id: 'kontakt_osoba', label: 'Kontakt osoba', type: 'text', required: true, placeholder: 'npr. Petar Nikolić', helperText: 'Osoba koja šalje ili potpisuje odgovor' },
      { id: 'pozicija', label: 'Za koju poziciju?', type: 'text', required: true, placeholder: 'npr. Senior Developer', helperText: 'Naziv pozicije za koju je kandidat aplicirao' },
    ],
  },
  {
    id: 'kandidat',
    title: 'Kandidat',
    fields: [
      { id: 'ime_kandidata', label: 'Ime i prezime kandidata', type: 'text', required: true, placeholder: 'npr. Ana Marković', helperText: 'Ime i prezime kandidata u nominativu' },
      { id: 'email_kandidata', label: 'Email kandidata', type: 'text', required: false, placeholder: 'npr. ana.markovic@gmail.com', helperText: 'Opciono, ako želite da bude pomenut u poruci' },
    ],
  },
  {
    id: 'odgovor',
    title: 'Tip odgovora',
    fields: [
      {
        id: 'tip_odgovora',
        label: 'Tip odgovora',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite tip poruke kako bi sistem prilagodio ton i sadržaj odgovora.',
        options: [
          { value: 'Poziv na intervju', label: 'Poziv na intervju' },
          { value: 'Prihvatanje ponude', label: 'Prihvatanje ponude' },
          { value: 'Odbijanje — ušao u uži izbor', label: 'Odbijanje — ušao u uži izbor' },
          { value: 'Odbijanje — nije ušao u uži izbor', label: 'Odbijanje — nije ušao u uži izbor' },
        ],
      },
      { id: 'datum_intervjua', label: 'Datum intervjua', type: 'date', required: false, conditional: { field: 'tip_odgovora', value: 'Poziv na intervju' }, helperText: 'Datum planiranog intervjua' },
      { id: 'vreme_intervjua', label: 'Vreme intervjua', type: 'text', required: false, conditional: { field: 'tip_odgovora', value: 'Poziv na intervju' }, placeholder: 'npr. 10:00', helperText: 'Tačno vreme održavanja intervjua' },
      {
        id: 'format_intervjua',
        label: 'Format intervjua',
        type: 'radio',
        required: false,
        conditional: { field: 'tip_odgovora', value: 'Poziv na intervju' },
        tooltip: 'Odaberite način održavanja intervjua kako bi poruka bila precizna.',
        options: [
          { value: 'Uživo', label: 'Uživo' },
          { value: 'Online', label: 'Online' },
          { value: 'Telefonski', label: 'Telefonski' },
        ],
      },
      { id: 'adresa_ili_link', label: 'Adresa ili link', type: 'text', required: false, conditional: { field: 'tip_odgovora', value: 'Poziv na intervju' }, placeholder: 'npr. Bulevar 10 ili zoom.us/j/...', helperText: 'Lokacija sastanka ili online link' },
      { id: 'datum_pocetka', label: 'Datum početka rada', type: 'date', required: false, conditional: { field: 'tip_odgovora', value: 'Prihvatanje ponude' }, helperText: 'Kada kandidat treba da započne angažman' },
      { id: 'bruto_zarada', label: 'Bruto zarada', type: 'number', required: false, conditional: { field: 'tip_odgovora', value: 'Prihvatanje ponude' }, helperText: 'Iznos u RSD' },
      { id: 'napomena', label: 'Dodatna napomena', type: 'textarea', required: false, placeholder: 'npr. Donesite portfelj, pripremite se za tehnički test...', helperText: 'Opciono — dodatne informacije za kandidata' },
    ],
  },
]
