import type { OpisProizvodaData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim, ubedljivim i jasnim srpskim jezikom u latinici.

Pravila:
- Fokus je na benefitima za kupca, ne samo na tehničkim karakteristikama
- Izbegavaj fraze koje zvuče generički ili napadno prodajno
- Prilagodi stil kanalu objave i željenoj dužini

Ti si asistent za pisanje prodajnih opisa proizvoda i usluga na srpskom jeziku.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generišeš prodajni opis koji jasno objašnjava šta se nudi, kome je namenjeno i zašto je vredno pažnje.

## FORMAT IZLAZA

Generiši samo gotov opis spreman za objavu, bez uvodnih napomena za korisnika.

## ŠTA NE RADIŠ

- Ne izmišljaš karakteristike, benefite ili cene
- Ne koristiš ćirilicu
- Ne pišeš klišee kao što su "vrhunski kvalitet" bez objašnjenja
- Ne koristiš anglicizme kada postoji prirodna srpska alternativa
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (uvodni tekst, karakteristike...).
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.`

export function buildUserMessage(data: OpisProizvodaData): string {
  return `Napiši prodajni opis sa sledećim podacima:

FIRMA I KANAL:
- Naziv firme: ${data.naziv_firme}
- Kanal objave: ${data.kanal}
- Dužina: ${data.duzina}

PROIZVOD ILI USLUGA:
- Naziv: ${data.naziv}
- Kategorija: ${data.kategorija}
- Glavne karakteristike: ${data.glavne_karakteristike}${data.cena ? `\n- Cena: ${data.cena}` : ''}

CILJNA GRUPA I TON:
- Ciljna grupa: ${data.ciljna_grupa}
- Ton: ${data.ton}
- Ključne prednosti i benefiti: ${data.kljucne_prednosti}

Svi podaci su u nominativu. Molim te da nazive dekliniraš ispravno kada je to potrebno u rečenici.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma_i_kanal',
    title: 'Firma i kanal',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Commerce', helperText: 'Firma ili brend koji stoji iza proizvoda' },
      {
        id: 'kanal',
        label: 'Kanal',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite kanal objave kako bi opis bio prilagođen formatu i očekivanjima publike.',
        options: [
          { value: 'Sajt / E-commerce', label: 'Sajt / E-commerce' },
          { value: 'Društvene mreže', label: 'Društvene mreže' },
          { value: 'Katalog / Štampani materijal', label: 'Katalog / Štampani materijal' },
          { value: 'Email kampanja', label: 'Email kampanja' },
        ],
      },
      {
        id: 'duzina',
        label: 'Dužina',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite željenu dužinu kako bi opis odgovarao formatu objave.',
        options: [
          { value: 'Kratko (50-100 reči)', label: 'Kratko (50-100 reči)' },
          { value: 'Srednje (100-200 reči)', label: 'Srednje (100-200 reči)' },
          { value: 'Dugo (200-400 reči)', label: 'Dugo (200-400 reči)' },
        ],
      },
    ],
  },
  {
    id: 'proizvod',
    title: 'Proizvod/Usluga',
    fields: [
      { id: 'naziv', label: 'Naziv', type: 'text', required: true, placeholder: 'npr. Zimska jakna ProThermal', helperText: 'Naziv proizvoda ili usluge' },
      { id: 'kategorija', label: 'Kategorija', type: 'text', required: true, placeholder: 'npr. Zimska odeća, IT usluge', helperText: 'Šira kategorija proizvoda ili usluge' },
      { id: 'glavne_karakteristike', label: 'Glavne karakteristike', type: 'textarea', required: true, placeholder: 'npr. Vodootporan materijal, punjenje od recikliranog poliestera...', helperText: 'Navedite 3-5 ključnih karakteristika' },
      { id: 'cena', label: 'Cena', type: 'text', required: false, placeholder: "npr. 8.990 RSD ili 'od 50 EUR'", helperText: 'Opciono — cena ili cenovni raspon' },
    ],
  },
  {
    id: 'ciljna_grupa_i_ton',
    title: 'Ciljna grupa i ton',
    fields: [
      { id: 'ciljna_grupa', label: 'Ciljna grupa', type: 'text', required: true, placeholder: 'npr. Sportisti, planinari 25-45 godina', helperText: 'Kome je proizvod ili usluga namenjena' },
      {
        id: 'ton',
        label: 'Ton',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite ton koji odgovara vašem brendu i kanalu komunikacije.',
        options: [
          { value: 'Profesionalan', label: 'Profesionalan' },
          { value: 'Entuzijastičan', label: 'Entuzijastičan' },
          { value: 'Informativan', label: 'Informativan' },
          { value: 'Luksuzni', label: 'Luksuzni' },
        ],
      },
      { id: 'kljucne_prednosti', label: 'Ključne prednosti', type: 'textarea', required: true, placeholder: 'npr. Toplo, lagano, ekološki — savršeno za aktivne ljude', helperText: 'Šta kupca ubedi da kupi — benefiti, ne samo karakteristike' },
    ],
  },
]
