import type { BioONamaData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim, profesionalnim i autentičnim srpskim jezikom u latinici.

Pravila:
- Tekst treba da zvuči ljudski, a ne korporativno
- U prvi plan stavi identitet, misiju i razliku u odnosu na druge
- Izbegavaj prazne fraze i preterano samohvalisanje

Ti si asistent za pisanje Bio i O nama tekstova za sajtove firmi i LinkedIn profile.

## TVOJ ZADATAK

Na osnovu dostavljenih podataka generišeš tekst koji jasno odgovara na pitanja ko ste, šta radite i zašto ste drugačiji.

## FORMAT IZLAZA

Generiši samo gotov tekst, bez dodatnih objašnjenja za korisnika.

## ŠTA NE RADIŠ

- Ne izmišljaš istoriju, rezultate ili tim koji korisnik nije naveo
- Ne koristiš ćirilicu
- Ne koristiš korporativni žargon i prazne slogane
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (uvod o firmi ili osobi...).
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: BioONamaData): string {
  return `Napiši Bio / O nama tekst sa sledećim podacima:

TIP I SUBJEKT:
- Tip teksta: ${data.tip}
- Naziv: ${data.naziv}
- Delatnost: ${data.delatnost}${data.godina_osnivanja ? `\n- Godina osnivanja: ${data.godina_osnivanja}` : ''}

SADRŽAJ:
- Misija: ${data.misija}
- Prednosti: ${data.prednosti}${data.tim ? `\n- Tim: ${data.tim}` : ''}
- Ton: ${data.ton}
- Dužina: ${data.duzina}

Svi podaci su u nominativu. Molim te da nazive dekliniraš ispravno kada je to potrebno u rečenici.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'tip_i_subjekt',
    title: 'Tip i subjekt',
    fields: [
      {
        id: 'tip',
        label: 'Tip teksta',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite tip teksta kako bi stil i struktura bili odgovarajući.',
        options: [
          { value: 'O nama — firma', label: 'O nama — firma' },
          { value: 'Bio — preduzetnik/freelancer', label: 'Bio — preduzetnik/freelancer' },
          { value: 'LinkedIn profil', label: 'LinkedIn profil' },
        ],
      },
      { id: 'naziv', label: 'Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo ili Ana Marković', helperText: 'Naziv firme ili ime osobe' },
      { id: 'delatnost', label: 'Delatnost', type: 'text', required: true, placeholder: 'npr. Web razvoj, digitalni marketing', helperText: 'Čime se bavite' },
      { id: 'godina_osnivanja', label: 'Godina osnivanja', type: 'text', required: false, placeholder: 'npr. 2018.', helperText: 'Opciono — ako je relevantno' },
    ],
  },
  {
    id: 'sadrzaj',
    title: 'Sadržaj',
    fields: [
      { id: 'misija', label: 'Misija', type: 'textarea', required: true, placeholder: 'npr. Pomažemo malim firmama da digitalizuju poslovanje...', helperText: 'Zašto postojite, šta je vaša svrha' },
      { id: 'prednosti', label: 'Prednosti', type: 'textarea', required: true, placeholder: 'npr. 10 godina iskustva, 200+ zadovoljnih klijenata...', helperText: 'Šta vas čini drugačijim od konkurencije' },
      { id: 'tim', label: 'Tim', type: 'text', required: false, placeholder: 'npr. Tim od 5 stručnjaka sa iskustvom u EU projektima', helperText: 'Opciono — kratko predstavljanje tima' },
      {
        id: 'ton',
        label: 'Ton',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite ton koji najbolje odgovara vašem identitetu.',
        options: [
          { value: 'Profesionalan', label: 'Profesionalan' },
          { value: 'Topao', label: 'Topao' },
          { value: 'Dinamičan', label: 'Dinamičan' },
        ],
      },
      {
        id: 'duzina',
        label: 'Dužina',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite približnu dužinu teksta prema kanalu objave.',
        options: [
          { value: 'Kratko (do 100 reči)', label: 'Kratko (do 100 reči)' },
          { value: 'Srednje (100-200)', label: 'Srednje (100-200)' },
          { value: 'Dugo (200-350)', label: 'Dugo (200-350)' },
        ],
      },
    ],
  },
]
