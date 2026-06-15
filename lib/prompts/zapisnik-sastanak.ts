import type { WizardStep, ZapisnikSastanakData } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši formalnim, jasnim i strukturiranim srpskim jezikom u latinici.

Pravila:
- Koristi pregledne odeljke i kratke stavke gde je to korisno
- Fokus je na činjenicama, zaključcima i obavezama
- Izbegavaj nejasne formulacije i suvišne ukrase

Ti si asistent za izradu profesionalnih zapisnika sa poslovnih sastanaka.

## TVOJ ZADATAK

Na osnovu dostavljenih podataka generišeš uredan zapisnik koji uključuje datum, prisutne, teme, zaključke i dalje akcije.

## SRPSKI JEZIK I DEKLINACIJA

Nazive firmi, imena i funkcije korisnik daje u nominativu. Dekliniraš ih prema kontekstu.

## FORMAT IZLAZA

Generiši gotov zapisnik sa jasnim naslovima i sekcijama:
- osnovni podaci o sastanku
- prisutni i odsutni
- teme
- zaključci
- akcioni koraci

## ŠTA NE RADIŠ

- Ne izmišljaš odluke, teme ili rokove
- Ne koristiš ćirilicu
- Ne dodaješ komentare koji nisu deo zapisnika
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (datum, mesto, prisutni...).
- NIKADA ne generiši sekciju za potpise, pečate niti 'Ugovor/Pravilnik potpisuju'. Ovaj dokument se ne potpisuje od strane dve strane.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: ZapisnikSastanakData): string {
  return `Napiši zapisnik sa sastanka sa sledećim podacima:

SASTANAK:
- Naziv firme: ${data.naziv_firme}
- Broj zapisnika: ${data.broj_zapisnika ?? '[bez broja]'}
- Datum sastanka: ${data.datum_sastanka}
- Vreme: ${data.vreme}
- Lokacija: ${data.lokacija}
- Predsedavajući: ${data.predsedavajuci}${data.zapisnicar ? `\n- Zapisničar: ${data.zapisnicar}` : '\n- Zapisničar: [nije naveden]'}

UČESNICI I TEME:
- Prisutni: ${data.prisutni}${data.odsutni ? `\n- Odsutni: ${data.odsutni}` : ''}
- Teme: ${data.teme ?? '[POPUNITI: teme i dnevni red]'}

ZAKLJUČCI:
- Zaključci: ${data.zakljucci ?? '[POPUNITI: zaključci sastanka]'}
- Akcije: ${data.akcije ?? '[POPUNITI: akcione tačke sa rokovima i odgovornim licima]'}${data.sledeci_sastanak ? `\n- Sledeći sastanak: ${data.sledeci_sastanak}` : ''}

Svi podaci su u nominativu. Molim te da nazive i imena dekliniraš ispravno kada je to potrebno u rečenici.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'sastanak',
    title: 'Sastanak',
    fields: [
      { id: 'naziv_firme', label: 'Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Firma ili organizacija koja vodi zapisnik' },
      { id: 'broj_zapisnika', label: 'Broj zapisnika', type: 'text', required: false, placeholder: 'npr. ZAP-005/2026', helperText: 'Redni broj zapisnika za internu evidenciju' },
      { id: 'datum_sastanka', label: 'Datum sastanka', type: 'date', required: true, helperText: 'Kada je sastanak održan' },
      { id: 'vreme', label: 'Vreme', type: 'text', required: true, placeholder: 'npr. 10:00 - 11:30', helperText: 'Trajanje ili vremenski raspon sastanka' },
      { id: 'lokacija', label: 'Lokacija', type: 'text', required: true, placeholder: 'npr. Kancelarija Bulevar 10 ili Online — Zoom', helperText: 'Gde je sastanak održan' },
      { id: 'predsedavajuci', label: 'Predsedavajući', type: 'text', required: true, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Osoba koja je vodila sastanak' },
      { id: 'zapisnicar', label: 'Zapisničar', type: 'text', required: false, placeholder: 'npr. Ana Marković', helperText: 'Lice koje vodi zapisnik' },
    ],
  },
  {
    id: 'ucesnici_i_teme',
    title: 'Učesnici i teme',
    fields: [
      { id: 'prisutni', label: 'Prisutni', type: 'textarea', required: true, placeholder: 'npr. Ana Marković (HR), Jovana Jovanović (razvoj)...', helperText: 'Ime, prezime i pozicija svakog učesnika' },
      { id: 'odsutni', label: 'Odsutni', type: 'text', required: false, placeholder: 'npr. Milan Đumić — bolovanje', helperText: 'Opciono — ko nije prisustvovao' },
      { id: 'teme', label: 'Teme', type: 'textarea', required: true, placeholder: 'npr. 1. Pregled Q2 rezultata\n2. Plan za Q3\n3. Novo zapošljavanje', helperText: 'Tačke dnevnog reda' },
    ],
  },
  {
    id: 'zakljucci',
    title: 'Zaključci',
    fields: [
      { id: 'zakljucci', label: 'Zaključci', type: 'textarea', required: true, placeholder: 'npr. 1. Odobren budžet za Q3 u iznosu od 500k RSD\n2. Rok za novi produkt je 1. septembar', helperText: 'Šta je dogovoreno na sastanku' },
      { id: 'akcije', label: 'Akcije', type: 'textarea', required: true, placeholder: 'npr. Ana M. — pripremiti HR plan do 15.7\nJovana J. — demo verzija do 1.8', helperText: 'Ko šta treba da uradi i do kada' },
      { id: 'sledeci_sastanak', label: 'Sledeći sastanak', type: 'text', required: false, placeholder: 'npr. 15. jul 2026. u 10:00', helperText: 'Opciono — termin sledećeg sastanka' },
    ],
  },
]
