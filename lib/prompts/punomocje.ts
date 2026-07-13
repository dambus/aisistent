import type { PunomocjeData, WizardStep } from '@/types/wizard'
import { getZastupnikRod } from '@/lib/utils/rod'
import { KNOWLEDGE_TOPICS } from '@/lib/knowledge'

const declensionRules = `## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve lične podatke koje korisnik unosi korisnik uvek daje u NOMINATIVU. Ti si odgovoran za ispravnu deklinaciju svakog podatka prema gramatičkom kontekstu rečenice u kojoj se taj podatak pojavljuje.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeža.

### Padeži koje koristiš i kada:

NOMINATIV (ko? šta?) - subjekat rečenice
GENITIV (koga? čega?) - svojina, odsustvo, opisivanje
DATIV (kome? čemu?) - primalac, upućivanje
AKUZATIV (koga? šta?) - direktan objekat
INSTRUMENTAL (kim? čime?) - sredstvo, pratnja
LOKATIV (o kome? o čemu?) - uz predloge o, u, na, pri

### Pravila za deklinaciju firmi (doo, ad, sp):

- Skraćenice se dekliniraju sa crticom: doo-a (gen.), doo-u (dat.)
- Naziv koji završava suglasnikom - dodaj "-a" (gen.), "-u" (dat.)
- Naziv koji završava samoglasnikom - genitiv "-e" ili nepromenjivo

### Pravila za deklinaciju ličnih imena:

MUŠKA IMENA (završavaju suglasnikom):
- Petar Nikolić -> Petra Nikolića -> Petru Nikoliću -> Petra Nikolića
- Milan Jović -> Milana Jovića -> Milanu Joviću

MUŠKA IMENA (završavaju na -a):
- Nikola Stanić -> Nikole Stanića -> Nikoli Staniću -> Nikolu Stanića
- Luka Popović -> Luke Popovića -> Luki Popoviću -> Luku Popovića

ŽENSKA IMENA (završavaju na -a):
- Ana Marković -> Ane Marković -> Ani Marković -> Anu Marković
- Jelena Stojanović -> Jelene Stojanović -> Jeleni Stojanović

ŽENSKA IMENA (završavaju suglasnikom - strana):
- Carmen, Isabel -> nepromenjivo u srpskom kontekstu`

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu punomoćja po pravu Republike Srbije.

## TVOJ ZADATAK

Na osnovu podataka koje korisnik dostavi generišeš jasno, kompletno i upotrebljivo punomoćje na srpskom jeziku (latinica). Podržavaš: opšte punomoćje, specijalno punomoćje za određenu radnju, punomoćje za zastupanje pred sudom ili organom i punomoćje za prodaju nepokretnosti.

VAŽNO — OGRANIČENJA OPŠTEG PUNOMOĆJA:
Opšte punomoćje ne pokriva radnje koje po zakonu zahtevaju specijalno punomoćje, uključujući:
- prodaju, poklon ili zamenu nepokretnosti
- zaključenje poravnanja u sudskom postupku
- odricanje od nasledstva ili legata
- preuzimanje menice ili jemstva
Za ove radnje uvek generiši specijalno ili punomoćje za nepokretnosti, i dodaj napomenu u dokument.

TIP: SUD I ORGANI — obavezno uključiti u dokument:
- Napomenu: 'Ovo punomoćje mora biti overeno kod javnog beležnika i priloženo uz svaki podnesak sudu ili organu u skladu sa čl. 85. Zakona o parničnom postupku.'
- Ako je naziv suda/organa poznat: navesti ga eksplicitno u telu punomoćja
- Ako je broj predmeta poznat: navesti ga eksplicitno
- Napomenu: 'Punomoćje važi samo pred navedenim sudom/organom i za navedeni predmet, osim ako nije drugačije navedeno.'

TIP: NEPOKRETNOSTI — obavezno uključiti u dokument:
- Tačne podatke o nepokretnosti: adresu, katastarsku parcelu i broj lista nepokretnosti
- Napomenu: 'Overa potpisa vlastodavca kod javnog beležnika mora biti izvršena PRE zaključenja ugovora o kupoprodaji, a ne nakon.'
- Razlikovanje overe potpisa od solemnizacije: 'Overa potpisa (potvrda autentičnosti potpisa) razlikuje se od solemnizacije (overa celog ugovora). Za kupoprodaju nepokretnosti zakon zahteva solemnizaciju ugovora, ne samo overu potpisa na punomoćju.'
- Napomenu o uknjižbi: 'Punomoćnik može podneti zahtev za uknjižbu prava svojine u katastru u ime vlastodavca na osnovu ovog punomoćja.'

${declensionRules}

## TERMINI

Koristi termine "Vlastodavac" i "Punomoćnik" (muški rod) ili "Punomoćnica" (ženski rod) kroz ceo dokument. Rod punomoćnika je naznačen u korisničkim podacima — prati navedeni termin dosledno.

## OBAVEZNI ELEMENTI (izvor: interna baza znanja, ${KNOWLEDGE_TOPICS['punomocje'].pravniOsnov})

${KNOWLEDGE_TOPICS['punomocje'].sadrzaj}

Ako trajanje == 'Neograničeno' ili 'Do opoziva': generiši preporuku u napomenama: 'Preporučuje se periodična provera da li su se ovlašćenja punomoćnika promenila i da li punomoćje i dalje odgovara aktuelnim potrebama vlastodavca. Za upravljačka punomoćja (nekretnine, firma) razmotrite vremensko ograničenje.'

## FORMAT IZLAZA

PUNOMOĆJE
Broj: {broj_ugovora ako postoji; ako je 'bez broja', ne prikazuj red 'Broj:'}
Datum: ___________

I. STRANE
II. PREDMET I OBIM OVLAŠĆENJA
III. TRAJANJE I OPOZIV
IV. ZAVRŠNE ODREDBE

## TON I STIL

- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.

## ŠTA NE RADIŠ

- Iznose slovima uvek piši razdvojeno: svaka reč posebno.
  Ispravno: "sto dvadeset hiljada", "dvesta pedeset hiljada", "petsto hiljada"
  Pogrešno: "stodvadeset hiljada", "dvestapedeset hiljada", "petstoniljada"
- Iznos slovima mora tačno odgovarati iznosu ciframa. Uvek proveri.
- Nikada ne računaj datume samostalno (npr. "danas + 24 meseca = datum isteka").
  Ako datum nije prosleđen kroz wizard, ostavi prazno: ___________
  Jedini datum koji možeš koristiti je onaj koji je eksplicitno dat u podacima.
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne izmišljaš podatke koje korisnik nije dao - označi sa [POPUNITI: naziv podatka]
- Ne garantuješ da će organ prihvatiti punomoćje bez overe ili dodatne dokumentacije
- Ne generiši NIKAKVU sekciju potpisa, liniju za potpis, "ZA VLASTODAVCA:", "PUNOMOĆNIK:" blok niti bilo kakav potpis format u tekstu dokumenta. Sistem automatski dodaje potpise. Završi dokument sa završnim odredbama i napomenom o overi.
- Ne dodaješ nikakvu napomenu niti disclaimer na kraju dokumenta.
  Sistem automatski dodaje standardnu napomenu u footer PDF-a.
- Ako je broj_ugovora 'bez broja' ili prazan, ne generiši redak 'Broj:' u zaglavlju.
- DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum (npr. 'dana...') piše: 'dana ___________. godine'
  - JEDINI datum koji se generiše iz wizard inputa je datum isteka punomoćja — jer ga korisnik eksplicitno unosi.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne koristi termin 'ugovorne strane' ni 'zaključen između' — punomoćje je jednostrani pravni akt. Koristi 'Vlastodavac:' i 'Punomoćnik:' direktno, bez fraze 'zaključen između'.
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.

## SAMOPROVERA PRE VRAĆANJA ODGOVORA

Pre nego što vratiš finalni tekst, tiho proveri generisano punomoćje naspram liste "OBAVEZNI ELEMENTI" iznad — element po element. Ako neki obavezan element nedostaje ili je nekompletan (npr. opis ovlašćenja nije dovoljno precizan, napomena o overi nedostaje za tip koji je zahteva, trajanje nije jasno definisano), DOPUNI dokument pre nego što ga vratiš. Ne vraćaj dokument sa poznatim propustom — ne pominji korisniku da si proveravao, samo isporuči popravljenu verziju.`

export function buildUserMessage(data: PunomocjeData): string {
  const brojUgovora = data.broj_ugovora?.trim() ? data.broj_ugovora.trim() : 'bez broja'

  const prvoImePunomocnika = data.naziv_punomocnika?.trim().split(/[\s,]+/)[0] ?? ''
  const rodPunomocnika = data.tip_punomocnika === 'Fizičko lice'
    ? (getZastupnikRod(prvoImePunomocnika) === 'zenski' ? 'Punomoćnica' : 'Punomoćnik')
    : 'Punomoćnik'

  return `Molim te generiši punomoćje sa sledećim podacima:

BROJ: ${brojUgovora}
VLASTODAVAC:
- Tip: ${data.tip_vlastodavca}
- Ime/Naziv: ${data.naziv_vlastodavca}
- JMBG/PIB: ${data.jmbg_pib_vlastodavca}
- Adresa: ${data.adresa_vlastodavca}

PUNOMOĆNIK/CA: ${rodPunomocnika} — ${data.naziv_punomocnika}
- Tip: ${data.tip_punomocnika}
- JMBG/PIB: ${data.jmbg_pib_punomocnika}
- Adresa: ${data.adresa_punomocnika}

OVLAŠĆENJE:
- Tip punomoćja: ${data.tip_punomocja}
- Opis ovlašćenja: ${data.opis_ovlascenja}
- Trajanje: ${data.trajanje}${data.trajanje === 'Određeni datum'
    ? `\n- Datum isteka: ${data.datum_isteka ?? '[POPUNITI: datum isteka punomoćja]'}`
    : ''}${data.tip_punomocja === 'Sud i organi' ? `
- Sud/organ: ${data.naziv_suda_organa ?? '[POPUNITI: naziv suda ili organa]'}
- Broj predmeta: ${data.broj_predmeta ?? '[nije zaveden]'}` : ''}${data.tip_punomocja === 'Nepokretnosti' ? `
- Adresa nepokretnosti: ${data.adresa_nepokretnosti ?? '[POPUNITI]'}
- Katastarska parcela: ${data.katastarska_parcela ?? '[POPUNITI]'}
- List nepokretnosti: ${data.list_nepokretnosti ?? '[POPUNITI]'}` : ''}

Svi podaci su u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'vlastodavac',
    title: 'Vlastodavac',
    fields: [
      {
        id: 'broj_ugovora',
        label: 'Broj ugovora',
        type: 'text',
        required: false,
        placeholder: 'npr. 001/2026',
        helperText: 'Ostavite prazno ako ne želite broj',
        tooltip: 'Interni broj za vašu evidenciju. Ako ostavite prazno, punomoćje neće imati broj u zaglavlju.',
      },
      {
        id: 'tip_vlastodavca',
        label: 'Tip vlastodavca',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_vlastodavca', label: 'Ime i prezime / Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime vlastodavca ili naziv firme' },
      {
        id: 'jmbg_pib_vlastodavca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_vlastodavca',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_vlastodavca', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta vlastodavca' },
    ],
  },
  {
    id: 'punomocnik',
    title: 'Punomoćnik',
    fields: [
      {
        id: 'tip_punomocnika',
        label: 'Tip punomoćnika',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_punomocnika', label: 'Ime i prezime / Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime punomoćnika ili naziv firme' },
      {
        id: 'jmbg_pib_punomocnika',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_punomocnika',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_punomocnika', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta punomoćnika' },
    ],
  },
  {
    id: 'ovlascenje',
    title: 'Ovlascenje',
    fields: [
      {
        id: 'tip_punomocja',
        label: 'Tip punomoćja',
        type: 'radio',
        required: true,
        tooltip: 'Opšte — ovlašćuje punomoćnika za sve pravne radnje u ime vlastodavca.\nSpecijalno — samo za jednu konkretnu radnju.\nPred sudom/organima — za zastupanje u postupcima.\nZa nepokretnosti — obavezna overa kod javnog beležnika.',
        options: [
          { value: 'Opšte', label: 'Opšte' },
          { value: 'Specijalno', label: 'Specijalno' },
          { value: 'Sud i organi', label: 'Sud i organi' },
          { value: 'Nepokretnosti', label: 'Nepokretnosti' },
        ],
      },
      { id: 'opis_ovlascenja', label: 'Opis ovlašćenja', type: 'textarea', required: true, placeholder: 'npr. Zastupanje pred Poreskom upravom radi uvida u poresku evidenciju i podnošenja poreskih prijava...', helperText: 'Navedite tačno za šta punomoćnik ima ovlašćenje' },
      {
        id: 'naziv_suda_organa',
        label: 'Naziv suda / organa',
        type: 'text',
        required: false,
        conditional: { field: 'tip_punomocja', value: 'Sud i organi' },
        placeholder: 'npr. Osnovni sud u Novom Sadu, Poreska uprava — filijala Novi Sad',
        helperText: 'Navedite tačan naziv organa pred kojim punomoćnik zastupa',
      },
      {
        id: 'broj_predmeta',
        label: 'Broj predmeta (ako je poznat)',
        type: 'text',
        required: false,
        conditional: { field: 'tip_punomocja', value: 'Sud i organi' },
        placeholder: 'npr. P 123/2026',
        helperText: 'Ostavite prazno ako predmet još nije zaveden',
      },
      {
        id: 'adresa_nepokretnosti',
        label: 'Adresa nepokretnosti',
        type: 'text',
        required: false,
        conditional: { field: 'tip_punomocja', value: 'Nepokretnosti' },
        placeholder: 'npr. Tolstojeva 13, Novi Sad',
        helperText: 'Adresa nepokretnosti koja je predmet punomoćja',
      },
      {
        id: 'katastarska_parcela',
        label: 'Katastarska parcela',
        type: 'text',
        required: false,
        conditional: { field: 'tip_punomocja', value: 'Nepokretnosti' },
        placeholder: 'npr. k.p. 1234/1 KO Novi Sad I',
        helperText: 'Nalazi se na listu nepokretnosti ili rešenju o kupoprodaji',
      },
      {
        id: 'list_nepokretnosti',
        label: 'List nepokretnosti (broj)',
        type: 'text',
        required: false,
        conditional: { field: 'tip_punomocja', value: 'Nepokretnosti' },
        placeholder: 'npr. LN 12345',
        helperText: 'Broj lista nepokretnosti iz katastra',
      },
      {
        id: 'trajanje',
        label: 'Trajanje',
        type: 'radio',
        required: true,
        tooltip: 'Neograničeno — važi dok se ne opozove.\nDo opoziva — važi dok vlastodavac pismeno ne opozove.\nOdređeni datum — automatski ističe na navedeni datum.',
        options: [
          { value: 'Neograničeno', label: 'Neograničeno' },
          { value: 'Do opoziva', label: 'Do opoziva' },
          { value: 'Određeni datum', label: 'Određeni datum' },
        ],
      },
      { id: 'datum_isteka', label: 'Datum isteka', type: 'date', required: false, helperText: 'Datum do kada punomoćje važi', conditional: { field: 'trajanje', value: 'Određeni datum' } },
    ],
  },
]
