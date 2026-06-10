import type { PreporukaData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom, profesionalno i ubedljivo, bez klišea i praznih fraza.

Pravila:
- Srpska latinica je obavezna
- Piši konkretno i sa merljivim utiscima kada su dostupni
- Izbegavaj opšta mesta kao što su "vredan i odgovoran" bez primera

Ti si asistent za pisanje profesionalnih preporuka i referenci za zaposlene i saradnike.

## TVOJ ZADATAK

Na osnovu dostavljenih podataka pišeš preporuku koja zvuči verodostojno, konkretno i profesionalno. Tekst treba da istakne kvalitete kandidata, način saradnje i rezultate koje je ostvario.

## SRPSKI JEZIK I DEKLINACIJA

Imena preporučioca i kandidata korisnik daje u nominativu. Dekliniraš ih prema kontekstu.

## FORMAT IZLAZA

Generiši gotov tekst preporuke, bez dodatnih objašnjenja za korisnika.

## ŠTA NE RADIŠ

- Ne izmišljaš rezultate ili činjenice koje korisnik nije naveo
- Ne koristiš generičke fraze bez primera
- Ne koristiš ćirilicu
- Ne pišeš pravne ili formalne formule koje nisu primerene preporuci
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (datum, oslovljavanje ili uvod...).`

export function buildUserMessage(data: PreporukaData): string {
  return `Napiši profesionalnu preporuku sa sledećim podacima:

PREPORUČILAC:
- Ime i prezime: ${data.ime_preporucioca}
- Pozicija: ${data.pozicija_preporucioca}
- Firma: ${data.naziv_firme}${data.email ? `\n- Email: ${data.email}` : ''}${data.telefon ? `\n- Telefon: ${data.telefon}` : ''}

KANDIDAT:
- Ime i prezime: ${data.ime_kandidata}
- Pozicija kandidata: ${data.pozicija_kandidata}
- Period saradnje: ${data.period_saradnje}

SADRŽAJ:
- Tip preporuke: ${data.tip_preporuke}
- Ključni kvaliteti: ${data.kvaliteti}
- Postignuća i rezultati: ${data.postignuca}${data.posebna_napomena ? `\n- Posebna napomena: ${data.posebna_napomena}` : ''}

Svi podaci su u nominativu. Molim te da imena dekliniraš ispravno prema kontekstu.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'preporucilac',
    title: 'Ko piše preporuku',
    fields: [
      { id: 'ime_preporucioca', label: 'Ime i prezime preporučioca', type: 'text', required: true, placeholder: 'npr. Petar Nikolić', helperText: 'Osoba koja daje preporuku' },
      { id: 'pozicija_preporucioca', label: 'Pozicija preporučioca', type: 'text', required: true, placeholder: 'npr. Direktor razvoja', helperText: 'Funkcija preporučioca u firmi' },
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme ili organizacije' },
      { id: 'email', label: 'Email', type: 'text', required: false, placeholder: 'npr. petar@firma.rs', helperText: 'Opciono — kontakt email preporučioca' },
      { id: 'telefon', label: 'Telefon', type: 'text', required: false, placeholder: 'npr. +381 64 123 45 67', helperText: 'Opciono — kontakt telefon preporučioca' },
    ],
  },
  {
    id: 'kandidat',
    title: 'Za koga se piše',
    fields: [
      { id: 'ime_kandidata', label: 'Ime i prezime kandidata', type: 'text', required: true, placeholder: 'npr. Ana Marković', helperText: 'Kome je preporuka namenjena' },
      { id: 'pozicija_kandidata', label: 'Pozicija kandidata', type: 'text', required: true, placeholder: 'npr. Frontend Developer', helperText: 'Radna pozicija ili profil kandidata' },
      { id: 'period_saradnje', label: 'Period saradnje', type: 'text', required: true, placeholder: 'npr. januar 2024 — decembar 2025', helperText: 'Koliko dugo ste sarađivali' },
    ],
  },
  {
    id: 'sadrzaj',
    title: 'Sadržaj',
    fields: [
      {
        id: 'tip_preporuke',
        label: 'Tip preporuke',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite svrhu preporuke da bi ton i fokus teksta bili odgovarajući.',
        options: [
          { value: 'Za novo zaposlenje', label: 'Za novo zaposlenje' },
          { value: 'Za studije/stipendiju', label: 'Za studije/stipendiju' },
          { value: 'Za poslovnu saradnju', label: 'Za poslovnu saradnju' },
          { value: 'Opšta preporuka', label: 'Opšta preporuka' },
        ],
      },
      { id: 'kvaliteti', label: 'Kvaliteti', type: 'textarea', required: true, placeholder: 'npr. Odlične tehničke veštine, inicijativnost, pouzdanost...', helperText: 'Navedite 3-5 ključnih kvaliteta' },
      { id: 'postignuca', label: 'Postignuća', type: 'textarea', required: true, placeholder: 'npr. Vodio projekat X koji je povećao prihode za 30%...', helperText: 'Konkretni rezultati i doprinosi' },
      { id: 'posebna_napomena', label: 'Posebna napomena', type: 'textarea', required: false, placeholder: 'npr. Toplo preporučujem bez rezerve...', helperText: 'Opciono — završna poruka ili dodatni naglasak' },
    ],
  },
]
