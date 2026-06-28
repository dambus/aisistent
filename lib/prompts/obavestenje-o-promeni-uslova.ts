import type { ObavestenjeOPromeniUslovaData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši formalnim pravnim jezikom na srpskom, latinicom.
Koristi terminologiju Zakona o radu Republike Srbije.

Ti si asistent za izradu obaveštenja o promeni uslova rada u skladu sa čl. 172-174 Zakona o radu RS.

## TVOJ ZADATAK

Generišeš formalno, jasno i zakonski ispravno obaveštenje poslodavca zaposlenom
o promeni jednog ili više elemenata uslova rada.

## SRPSKI JEZIK I DEKLINACIJA

Naziv firme, ime zaposlenog i ime zastupnika korisnik daje u nominativu. Dekliniraš prema kontekstu.

## OBAVEZNI ELEMENTI DOKUMENTA

1. Zaglavlje sa podacima o poslodavcu i brojem/datumom (datumi uvek ___________)
2. Podaci o zaposlenom i radnom mestu
3. Jasno navedeno šta se menja (staro stanje → novo stanje)
4. Datum od kada nova promena važi
5. Ako je navedeno: rok u kom se zaposleni može izjasniti
6. Potpis zastupnika poslodavca

## ZAKONSKI KONTEKST (koristi u dokumentu samo ako je relevantno)

- Čl. 172 ZOR: poslodavac može ponuditi zaposlenom izmenu ugovorenih uslova rada
- Zaposleni ima pravo da prihvati ili odbije ponudu u roku koji odredi poslodavac
- Ako zaposleni odbije, poslodavac može otkazati ugovor o radu uz otkazni rok

## ŠTA NE RADIŠ

- Ne generiši naslov dokumenta kao prvi red — PDF dodaje naslov automatski
- Ne generiši sekciju potpisa — renderer je dodaje automatski
- Ne izmišljaš detalje koje korisnik nije uneo
- Ne daješ pravno mišljenje van dokumenta
- Ne koristiš ćirilicu
- Ne generiši prazan poslednji član`

export function buildUserMessage(data: ObavestenjeOPromeniUslovaData): string {
  return `Napiši obaveštenje o promeni uslova rada sa sledećim podacima:

POSLODAVAC:
- Naziv firme: ${data.naziv_firme}
- PIB: ${data.pib}
- Adresa: ${data.adresa}
- Zastupnik: ${data.zastupnik}
- Funkcija: ${data.funkcija}

ZAPOSLENI:
- Ime i prezime: ${data.ime_prezime}
- Radno mesto: ${data.radno_mesto}

PROMENA:
- Tip promene: ${data.tip_promene}
- Trenutno stanje: ${data.staro_stanje}
- Novo stanje: ${data.novo_stanje}
- Datum primene: ${data.datum_primene}${data.opis_promene ? `\n- Opis: ${data.opis_promene}` : ''}${data.razlog_promene ? `\n- Razlog: ${data.razlog_promene}` : ''}${data.rok_za_izjasnjavanje ? `\n- Rok za izjašnjavanje: ${data.rok_za_izjasnjavanje} dana` : ''}

Svi podaci su u nominativu. Dekliniraš ispravno prema kontekstu.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma',
    title: 'Firma',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo' },
      { id: 'pib', label: 'PIB', type: 'text', required: true, placeholder: '123456789' },
      { id: 'adresa', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad' },
      { id: 'zastupnik', label: 'Zastupnik', type: 'text', required: true, placeholder: 'npr. Petar Nikolić' },
      { id: 'funkcija', label: 'Funkcija zastupnika', type: 'text', required: true, placeholder: 'npr. Direktor' },
    ],
  },
  {
    id: 'zaposleni',
    title: 'Zaposleni',
    fields: [
      { id: 'ime_prezime', label: 'Ime i prezime zaposlenog', type: 'text', required: true, placeholder: 'npr. Ana Marković' },
      { id: 'radno_mesto', label: 'Radno mesto', type: 'text', required: true, placeholder: 'npr. Referent prodaje' },
    ],
  },
  {
    id: 'promena',
    title: 'Promena',
    fields: [
      {
        id: 'tip_promene',
        label: 'Tip promene',
        type: 'dropdown',
        required: true,
        tooltip: 'Odaberite šta se menja — obaveštenje će biti prilagođeno tipu promene i zakonskim zahtevima.',
        options: [
          { value: 'Radno vreme', label: 'Radno vreme' },
          { value: 'Zarada', label: 'Zarada' },
          { value: 'Mesto rada', label: 'Mesto rada' },
          { value: 'Naziv radnog mesta', label: 'Naziv radnog mesta' },
          { value: 'Organizaciona promena', label: 'Organizaciona promena' },
          { value: 'Više promena istovremeno', label: 'Više promena istovremeno' },
        ],
      },
      { id: 'staro_stanje', label: 'Trenutno stanje (kako je bilo)', type: 'textarea', required: true, placeholder: 'npr. Radno vreme: 9-17h, pon-pet' },
      { id: 'novo_stanje', label: 'Novo stanje (kako će biti)', type: 'textarea', required: true, placeholder: 'npr. Radno vreme: 8-16h, pon-pet' },
      { id: 'datum_primene', label: 'Datum primene promene', type: 'date', required: true, helperText: 'Od kada važi nova promena' },
      { id: 'opis_promene', label: 'Dodatni opis (opciono)', type: 'textarea', required: false, placeholder: 'npr. Promena je posledica reorganizacije odeljenja...' },
      { id: 'razlog_promene', label: 'Razlog promene (opciono)', type: 'textarea', required: false, placeholder: 'npr. Usklađivanje sa novim pravilnikom o radu...', helperText: 'Navođenje razloga nije obavezno ali povećava transparentnost' },
      { id: 'rok_za_izjasnjavanje', label: 'Rok za izjašnjavanje zaposlenog (dani)', type: 'text', required: false, placeholder: 'npr. 8', helperText: 'Opciono — broj dana u kojima zaposleni može da se izjasni ili odbije promenu' },
    ],
  },
]
