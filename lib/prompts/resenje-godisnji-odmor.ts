import type { ResenjeGodisnjiOdmorData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši formalnim, jasnim i pravno urednim srpskim jezikom u latinici.

Pravila:
- Koristi terminologiju primerenu internim HR dokumentima
- Piši precizno i bez suvišnih ukrasa
- Ne koristi anglicizme

Ti si asistent za izradu rešenja o godišnjem odmoru u skladu sa Zakonom o radu Republike Srbije.

## TVOJ ZADATAK

Na osnovu dostavljenih podataka generišeš formalno rešenje o korišćenju godišnjeg odmora za konkretnog zaposlenog.

## SRPSKI JEZIK I DEKLINACIJA

Naziv firme, ime zaposlenog i ime zastupnika korisnik daje u nominativu. Dekliniraš ih prema kontekstu.

## OBAVEZNO

U rešenju jasno navedi period odmora, broj dana i datum povratka na posao.
Na kraju dokumenta dodaj kratku napomenu da se preporučuje pravna provera pre konačne upotrebe.

## ŠTA NE RADIŠ

- Ne izmišljaš podatke koje korisnik nije uneo
- Ne navodiš pogrešne rokove ili brojeve dana
- Ne koristiš ćirilicu
- Ne daješ pravno mišljenje van samog dokumenta
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (broj rešenja, datum, uvodni deo...).
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: ResenjeGodisnjiOdmorData): string {
  return `Napiši rešenje o godišnjem odmoru sa sledećim podacima:

POSLODAVAC:
- Naziv firme: ${data.naziv_firme}
- PIB: ${data.pib}
- Adresa: ${data.adresa}
- Zastupnik: ${data.zastupnik}
- Funkcija zastupnika: ${data.funkcija}

ZAPOSLENI:
- Ime i prezime: ${data.ime_prezime}
- Radno mesto: ${data.radno_mesto}
- Broj dana godišnjeg odmora: ${data.broj_dana}

PERIOD ODMORA:
- Početak odmora: ${data.datum_od}
- Kraj odmora: ${data.datum_do}
- Povratak na posao: ${data.datum_povratka}${data.zamena ? `\n- Zamena: ${data.zamena}` : ''}

Svi podaci su u nominativu. Molim te da nazive i imena dekliniraš ispravno prema kontekstu.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'poslodavac',
    title: 'Poslodavac',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Puni naziv poslodavca' },
      { id: 'pib', label: 'PIB', type: 'text', required: true, placeholder: 'npr. 123456789', helperText: 'PIB poslodavca' },
      { id: 'adresa', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta poslodavca' },
      { id: 'zastupnik', label: 'Zastupnik', type: 'text', required: true, placeholder: 'npr. Petar Nikolić', helperText: 'Zakonski zastupnik ili ovlašćeno lice' },
      { id: 'funkcija', label: 'Funkcija', type: 'text', required: true, placeholder: 'npr. direktor', helperText: 'Funkcija potpisnika rešenja' },
    ],
  },
  {
    id: 'zaposleni',
    title: 'Zaposleni',
    fields: [
      { id: 'ime_prezime', label: 'Ime i prezime', type: 'text', required: true, placeholder: 'npr. Ana Marković', helperText: 'Zaposleni na koga se rešenje odnosi' },
      { id: 'radno_mesto', label: 'Radno mesto', type: 'text', required: true, placeholder: 'npr. Softverski inženjer', helperText: 'Naziv radnog mesta zaposlenog' },
      { id: 'broj_dana', label: 'Broj dana', type: 'number', required: true, helperText: 'Broj dana godišnjeg odmora (minimum 20 po zakonu)' },
    ],
  },
  {
    id: 'period',
    title: 'Period',
    fields: [
      { id: 'datum_od', label: 'Datum od', type: 'date', required: true, helperText: 'Početak godišnjeg odmora' },
      { id: 'datum_do', label: 'Datum do', type: 'date', required: true, helperText: 'Kraj godišnjeg odmora' },
      { id: 'datum_povratka', label: 'Datum povratka', type: 'date', required: true, helperText: 'Datum povratka na posao' },
      { id: 'zamena', label: 'Zamena', type: 'text', required: false, placeholder: 'npr. Marko Marković, isti sektor', helperText: 'Ko pokriva posao za vreme odsustva' },
    ],
  },
]
