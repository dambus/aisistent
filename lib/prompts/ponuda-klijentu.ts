import type { PonudaKlijentuData, WizardStep } from '@/types/wizard'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Nazive firmi, kontakt osobe i predmete ponude korisnik daje u NOMINATIVU. Dekliniraš ih prema kontekstu rečenice.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeža.

Firme: "Sigma doo" -> "Sigma doo-a" u genitivu i "Sigma doo-u" u dativu. Lična imena: Petar Nikolić -> Petra Nikolića -> Petru Nikoliću; Nikola Stanić -> Nikole Stanića -> Nikoli Staniću; Ana Marković -> Ane Marković -> Ani Marković.`

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si asistent za izradu profesionalnih poslovnih ponuda (oferta) na srpskom jeziku.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generišeš strukturiranu poslovnu ponudu sa svim elementima koje B2B klijent očekuje: uvod, opis usluge/proizvoda, cenu, rok isporuke, uslove plaćanja, validnost ponude i kontakt.

${declensionRules}

## TON I STIL

- Profesionalan, samopouzdan i orijentisan ka vrednosti
- Jasan i konkretan, bez preteranog prodajnog tona
- Srpski jezik, latinica
- Cena mora biti pregledna i razumljiva

## OBAVEZNI ELEMENTI

1. Broj i datum ponude
2. Podaci o ponuđaču
3. Podaci o klijentu
4. Predmet ponude
5. Opis usluge ili proizvoda
6. Cena bez PDV-a, PDV tretman i ukupan iznos ako je primenljivo
7. Rok isporuke ili realizacije
8. Uslovi plaćanja
9. Validnost ponude
10. Kontakt za prihvatanje ponude

## PRAVNA NAPOMENA

Ponuda nije pravno obavezujući dokument sama po sebi, ali može biti osnova za ugovor ako je klijent prihvati.

## ŠTA NE RADIŠ

- Ne izmišljaš cene, rokove, garancije ili uslove koje korisnik nije naveo
- Ne garantuješ pravnu obaveznost ponude
- Na kraju dodaj: "Generisano uz pomoć AIsistent.rs"`

export function buildUserMessage(data: PonudaKlijentuData): string {
  const brojPonude = data.broj_ponude?.trim() || '[POPUNITI: broj ponude]'

  return `Molim te generiši poslovnu ponudu sa sledećim podacima:

PONUĐAČ:
- Naziv firme: ${data.ponudjac_naziv}
- PIB: ${data.ponudjac_pib}
- Adresa: ${data.ponudjac_adresa}
- Kontakt osoba: ${data.kontakt_osoba}
- Email: ${data.email}
- Telefon: ${data.telefon}

KLIJENT:
- Naziv firme / ime: ${data.klijent_naziv}
- Adresa: ${data.klijent_adresa}
- Kontakt osoba: ${data.klijent_kontakt}

PONUDA:
- Broj ponude: ${brojPonude}
- Datum ponude: ${data.datum_ponude}
- Predmet ponude: ${data.predmet_ponude}
- Opis usluge/proizvoda: ${data.opis}
- Rok isporuke/realizacije: ${data.rok_isporuke}

FINANSIJE:
- Iznos bez PDV: ${data.iznos_bez_pdv.toLocaleString('sr-RS')} RSD
- PDV: ${data.pdv}
- Uslovi plaćanja: ${data.uslovi_placanja}
- Validnost ponude: ${data.validnost} dana
- Napomene: ${data.napomene ?? '[nema]'}

Svi podaci su u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'ponudjac',
    title: 'Ponuđač',
    fields: [
      { id: 'ponudjac_naziv', label: 'Naziv firme', type: 'text', required: true },
      { id: 'ponudjac_pib', label: 'PIB', type: 'text', required: true },
      { id: 'ponudjac_adresa', label: 'Adresa', type: 'text', required: true },
      { id: 'kontakt_osoba', label: 'Kontakt osoba', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'text', required: true },
      { id: 'telefon', label: 'Telefon', type: 'text', required: true },
    ],
  },
  {
    id: 'klijent',
    title: 'Klijent',
    fields: [
      { id: 'klijent_naziv', label: 'Naziv firme / ime', type: 'text', required: true },
      { id: 'klijent_adresa', label: 'Adresa', type: 'text', required: true },
      { id: 'klijent_kontakt', label: 'Kontakt osoba', type: 'text', required: true },
    ],
  },
  {
    id: 'ponuda',
    title: 'Ponuda',
    fields: [
      { id: 'broj_ponude', label: 'Broj ponude', type: 'text', required: false },
      { id: 'datum_ponude', label: 'Datum ponude', type: 'date', required: true },
      { id: 'predmet_ponude', label: 'Predmet ponude', type: 'text', required: true },
      { id: 'opis', label: 'Opis usluge/proizvoda', type: 'textarea', required: true, helperText: 'Opišite šta tačno radite, šta je uključeno i šta nije', tooltip: 'Što precizniji opis smanjuje nesporazume sa klijentom i štiti vas ako dođe do spora. Navedite i šta NIJE uključeno u cenu.' },
      { id: 'rok_isporuke', label: 'Rok isporuke/realizacije', type: 'text', required: true },
    ],
  },
  {
    id: 'finansije',
    title: 'Finansije',
    fields: [
      { id: 'iznos_bez_pdv', label: 'Iznos bez PDV (RSD)', type: 'number', required: true, min: 0 },
      {
        id: 'pdv',
        label: 'PDV',
        type: 'radio',
        required: true,
        options: [
          { value: '20%', label: '20%' },
          { value: '10%', label: '10%' },
          { value: 'Oslobođeno', label: 'Oslobođeno' },
          { value: 'Nije u sistemu PDV', label: 'Nije u sistemu PDV' },
        ],
      },
      {
        id: 'uslovi_placanja',
        label: 'Uslovi plaćanja',
        type: 'radio',
        required: true,
        tooltip: 'Standard u Srbiji je 15-30 dana. Kraći rok (8-15 dana) možete tražiti od manjih klijenata, duži (45-60 dana) može biti potreban za saradnju sa velikim firmama.',
        options: [
          { value: 'Avansno', label: 'Avansno' },
          { value: '15 dana', label: '15 dana' },
          { value: '30 dana', label: '30 dana' },
          { value: '45 dana', label: '45 dana' },
          { value: 'Prema dogovoru', label: 'Prema dogovoru' },
        ],
      },
      { id: 'validnost', label: 'Validnost ponude (dani)', type: 'number', required: true, min: 1, defaultValue: 30 },
      { id: 'napomene', label: 'Napomene', type: 'textarea', required: false },
    ],
  },
]
