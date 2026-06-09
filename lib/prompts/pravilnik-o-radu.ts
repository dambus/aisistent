import type { PravilnikORaduData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši formalnim pravnim jezikom na srpskom, latinicom, uz jasne i čitljive odredbe.

Pravila:
- Koristi terminologiju Zakona o radu Republike Srbije
- Odredbe formuliši jasno i primenljivo
- Izbegavaj preduge rečenice bez potrebe

Ti si asistent za izradu Pravilnika o radu u skladu sa Zakonom o radu Republike Srbije.

## TVOJ ZADATAK

Generišeš nacrt Pravilnika o radu za poslodavca, sa posebnim fokusom na radno vreme, zarade, odmore, disciplinsku odgovornost i bezbednost na radu.

Pravilnik je posebno važan za poslodavce sa 10 ili više zaposlenih.

## SRPSKI JEZIK I DEKLINACIJA

Naziv firme, delatnost i ime zastupnika korisnik daje u nominativu. Dekliniraš ih prema kontekstu.

## OBAVEZNO

Na kraju dokumenta dodaj napomenu da se preporučuje pravna provera pre usvajanja pravilnika.

## ŠTA NE RADIŠ

- Ne izmišljaš organizacione detalje koje korisnik nije uneo
- Ne koristiš ćirilicu
- Ne daješ savete van okvira samog pravilnika
- Ne izostavljaš ključne sekcije o radnom vremenu, odmorima, zaradi i disciplinskoj odgovornosti`

export function buildUserMessage(data: PravilnikORaduData): string {
  return `Napiši Pravilnik o radu sa sledećim podacima:

FIRMA:
- Naziv firme: ${data.naziv_firme}
- PIB: ${data.pib}
- Adresa: ${data.adresa}
- Zastupnik: ${data.zastupnik}
- Delatnost: ${data.delatnost}

ORGANIZACIJA:
- Broj zaposlenih: ${data.broj_zaposlenih}
- Radno vreme: ${data.radno_vreme}
- Rad od kuće: ${data.rad_od_kuce}
- Smenski rad: ${data.smenski_rad ? 'Da' : 'Ne'}

NAPREDNE OPCIJE:
- Zabrana konkurencije: ${data.zabrana_konkurencije ? 'Da' : 'Ne'}
- Disciplinska odgovornost: ${data.disciplinska_odgovornost ? 'Da' : 'Ne'}
- Zaštita uzbunjivača: ${data.zastita_uzbunjivaca ? 'Da' : 'Ne'}${data.posebna_oprema ? `\n- Posebna oprema: ${data.posebna_oprema}` : ''}

Svi podaci su u nominativu. Molim te da nazive i imena dekliniraš ispravno prema kontekstu.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'firma',
    title: 'Firma',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv poslodavca koji usvaja pravilnik' },
      { id: 'pib', label: 'PIB', type: 'text', required: true, placeholder: 'npr. 123456789', helperText: 'PIB firme' },
      { id: 'adresa', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Sedište firme' },
      { id: 'zastupnik', label: 'Zastupnik', type: 'text', required: true, placeholder: 'npr. Petar Nikolić', helperText: 'Zakonski zastupnik firme' },
      { id: 'delatnost', label: 'Delatnost', type: 'text', required: true, placeholder: 'npr. Razvoj softvera, IT usluge', helperText: 'Osnovna delatnost firme' },
    ],
  },
  {
    id: 'organizacija',
    title: 'Organizacija',
    fields: [
      { id: 'broj_zaposlenih', label: 'Broj zaposlenih', type: 'number', required: true, helperText: 'Trenutni broj zaposlenih' },
      { id: 'radno_vreme', label: 'Radno vreme', type: 'text', required: true, placeholder: 'npr. Ponedeljak-Petak 09:00-17:00', helperText: 'Osnovni raspored rada u firmi' },
      {
        id: 'rad_od_kuce',
        label: 'Rad od kuće',
        type: 'radio',
        required: true,
        tooltip: 'Odaberite u kojoj meri je rad od kuće zastupljen u organizaciji.',
        options: [
          { value: 'Ne', label: 'Ne' },
          { value: 'Delimično', label: 'Delimično' },
          { value: 'Potpuno remote', label: 'Potpuno remote' },
        ],
      },
      { id: 'smenski_rad', label: 'Smenski rad', type: 'toggle', required: false, helperText: 'Da li postoji smenski rad?' },
    ],
  },
  {
    id: 'napredne_opcije',
    title: 'Napredne opcije',
    fields: [
      { id: 'zabrana_konkurencije', label: 'Zabrana konkurencije', type: 'toggle', required: false, helperText: 'Uključite ako želite posebnu klauzulu' },
      { id: 'disciplinska_odgovornost', label: 'Disciplinska odgovornost', type: 'toggle', required: false, defaultValue: true, helperText: 'Detaljna razrada disciplinskog postupka' },
      { id: 'zastita_uzbunjivaca', label: 'Zaštita uzbunjivača', type: 'toggle', required: false, defaultValue: true, helperText: 'Zaštita zaposlenih koji prijave nepravilnosti' },
      { id: 'posebna_oprema', label: 'Posebna oprema', type: 'textarea', required: false, placeholder: 'npr. Laptop, mobilni telefon — uslovi korišćenja...', helperText: 'Opciono — posebna oprema i pravila korišćenja' },
    ],
  },
]
