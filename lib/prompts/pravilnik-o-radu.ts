import type { PravilnikORaduData, WizardStep } from '@/types/wizard'
import { KNOWLEDGE_TOPICS } from '@/lib/knowledge'

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

ZAVRŠNE ODREDBE — obavezno uključiti:
- Datum usvajanja Pravilnika
- Datum stupanja na snagu (osmi dan od dana objavljivanja na oglasnoj tabli)
- Ako broj_zaposlenih > 10: 'Poslodavac je dužan da ovaj Pravilnik dostavi Ministarstvu nadležnom za rad na registraciju u roku od 15 dana od dana usvajanja, u skladu sa čl. 24a Zakona o radu.'
- Ako postoji_sindikat == true: 'Pre donošenja ovog Pravilnika, Poslodavac je pribavio/zatraži mišljenje sindikalne organizacije u skladu sa čl. 24a Zakona o radu. Sindikat ima pravo da dostavi mišljenje u roku od 15 dana.'

IX ZAŠTITA UZBUNJIVAČA — uvek generiši potpun završetak člana 59:
'Ako je prijava osnovana, Poslodavac je dužan da preduzme mere za otklanjanje nepravilnosti i spreči ponavljanje iste, kao i da o preduzetim merama obavesti uzbunjivača u roku od 30 dana od donošenja odluke.'

## ZAKONSKI LIMITI KOJE PRAVILNIK MORA POŠTOVATI (izvor: interna baza znanja, ${KNOWLEDGE_TOPICS['radni-odnosi'].pravniOsnov})

${KNOWLEDGE_TOPICS['radni-odnosi'].sadrzaj}

ZABRANA KONKURENCIJE U PRAVILNIKU — ako je zabrana_konkurencije == true:
Pravilnik reguliše OPŠTU POLITIKU, ne pojedinačnu klauzulu — ne izmišljaj konkretan iznos naknade niti fiksno trajanje za sve zaposlene (to se individualno ugovora u svakom ugovoru o radu). Umesto toga, generiši odredbu koja kaže da Poslodavac zadržava pravo da u pojedinačnim ugovorima o radu ugovori zabranu konkurencije, i da svaka takva klauzula MORA sadržati naknadu zaposlenom za period zabrane u skladu sa čl. 161. st. 2. Zakona o radu — bez naknade klauzula je ništava. Ne generiši opštu zabranu bez ove napomene.

## DUŽINA DOKUMENTA — KRITIČNO

Ovaj pravilnik mora stati u jedan AI odgovor. Ako primetiš da dokument postaje predugačak:
- Sekcije prava i obaveza zaposlenih/poslodavca napiši sažetije (liste umesto razrade)
- Disciplinske mere navedi u tabeli ili kraćoj listi
- Nikad ne ostavljaj dokument nedovršen — bolje kraći i kompletan nego dugačak i prekinut
- Završne odredbe i potpis su obavezni — uvek ih generiši

## ŠTA NE RADIŠ

- Ne izmišljaš organizacione detalje koje korisnik nije uneo
- Ne koristiš ćirilicu
- Ne daješ savete van okvira samog pravilnika
- Ne izostavljaš ključne sekcije o radnom vremenu, odmorima, zaradi i disciplinskoj odgovornosti
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (datum donošenja, uvodni deo...).
- Pravilnik potpisuje SAMO zastupnik poslodavca. Ne generiši 'Potpisuju:' ni drugu stranu. Sekcija potpisa se dodaje automatski.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne ostavljaj nijedan član ili rečenicu nedovršenu — ako primetiš da nemaš dovoljno prostora za ceo dokument, sažmi prethodne sekcije ali uvek završi Završnim odredbama i potpisom
- Ne koristiti reč 'posvči' — ispravno je 'posvedoči'
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.

## SAMOPROVERA PRE VRAĆANJA ODGOVORA

Pre nego što vratiš finalni tekst, tiho proveri Pravilnik naspram "ZAKONSKI LIMITI" iznad — element po element (godišnji odmor min 20 radnih dana, otkazni rok min 8 dana, zabrana konkurencije sa napomenom o obaveznoj naknadi ako se pominje). Ako nešto nedostaje ili je nekompletno, DOPUNI Pravilnik pre nego što ga vratiš. Ne vraćaj dokument sa poznatim propustom — ne pominji korisniku da si proveravao, samo isporuči popravljenu verziju.`

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
- Sindikat: ${data.postoji_sindikat ? 'Da — obavezno uključiti odredbu o mišljenju sindikata' : 'Ne'}
${Number(data.broj_zaposlenih) > 10
    ? '- NAPOMENA: Više od 10 zaposlenih — Pravilnik mora biti dostavljen Ministarstvu za rad na registraciju u roku od 15 dana od usvajanja (čl. 24a Zakona o radu).'
    : '- Broj zaposlenih je 10 ili manje — registracija Pravilnika nije obavezna.'}

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
      { id: 'smenski_rad', label: 'Smenski rad', type: 'toggle', required: false, defaultValue: false, helperText: 'Da li postoji smenski rad?' },
      {
        id: 'postoji_sindikat',
        label: 'Da li kod poslodavca postoji sindikalna organizacija?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        tooltip: 'Ako postoji sindikat, Zakon o radu (čl. 24a) obavezuje poslodavca da pre donošenja pravilnika zatraži mišljenje sindikata. Sindikat ima rok od 15 dana da dostavi mišljenje.',
      },
    ],
  },
  {
    id: 'napredne_opcije',
    title: 'Napredne opcije',
    fields: [
      { id: 'zabrana_konkurencije', label: 'Zabrana konkurencije', type: 'toggle', required: false, defaultValue: false, helperText: 'Uključite ako želite posebnu klauzulu' },
      { id: 'disciplinska_odgovornost', label: 'Disciplinska odgovornost', type: 'toggle', required: false, defaultValue: false, helperText: 'Detaljna razrada disciplinskog postupka' },
      { id: 'zastita_uzbunjivaca', label: 'Zaštita uzbunjivača', type: 'toggle', required: false, defaultValue: false, helperText: 'Zaštita zaposlenih koji prijave nepravilnosti' },
      { id: 'posebna_oprema', label: 'Posebna oprema', type: 'textarea', required: false, placeholder: 'npr. Laptop, mobilni telefon — uslovi korišćenja...', helperText: 'Opciono — posebna oprema i pravila korišćenja' },
    ],
  },
]
