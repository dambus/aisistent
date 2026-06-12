import type { NdaData, WizardStep } from '@/types/wizard'

function formatOblast(input: NdaData['oblast_informacija']): string {
  return Array.isArray(input) ? input.join(', ') : input
}

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu sporazuma o poverljivosti (NDA - Non-Disclosure Agreement) u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima i Zakonom o zaštiti poslovne tajne ("Sl. glasnik RS", br. 72/2011).

## TVOJ ZADATAK

Na osnovu podataka koje ti korisnik dostavi, generišeš kompletan, profesionalan Sporazum o poverljivosti na srpskom jeziku (latinica). Pre generisanja određuješ TIP NDA-a jer od toga zavisi struktura i obaveze strana.

## ODREĐIVANJE TIPA NDA - OBAVEZNO PRE GENERISANJA

TIP 1 - JEDNOSTRANI NDA (One-way)
→ Jedna strana otkriva, druga prima i čuva
→ Tipično: startup predstavlja ideju investitoru, firma deli podatke sa izvođačem
→ Termini: "Strana koja otkriva" i "Strana koja prima"

TIP 2 - DVOSTRANI NDA (Mutual)
→ Obe strane međusobno otkrivaju i čuvaju
→ Tipično: partnerstvo, M&A pregovori, tehnička saradnja
→ Termini: "Prva strana" i "Druga strana"

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu i pri potpisima. Sve ostalo kroz termine strana.

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI NDA

1. Identifikacija strana i tip sporazuma
2. Definicija poverljivih informacija
3. Definicija izuzetaka - šta NIJE poverljivo
4. Obaveze strane koja prima
5. Trajanje sporazuma i trajanje obaveze čuvanja
6. Dozvoljeno otkrivanje (zaposleni, pravnici, računovođe)
7. Vraćanje ili uništavanje informacija po isteku
8. Posledice kršenja
9. Merodavno pravo i nadležnost suda
10. Potpisi

## IZUZECI - OBAVEZNO UKLJUČITI

Informacije NISU poverljive ako:
a) su bile javno dostupne pre potpisivanja
b) postanu javno dostupne bez krivice primaoca
c) ih je primalac već znao pre otkrivanja
d) ih je primalac dobio od treće strane bez obaveze čuvanja
e) su otkrivene na osnovu zakonske obaveze ili sudskog naloga

## FORMAT IZLAZA

SPORAZUM O POVERLJIVOSTI (Non-Disclosure Agreement)
Broj: {broj_ugovora ako postoji; ako je 'bez broja', ne prikazuj red 'Broj:'}
Datum: ___________

I.    UVODNE ODREDBE I STRANE SPORAZUMA
II.   PREDMET SPORAZUMA I SVRHA OTKRIVANJA
III.  DEFINICIJA POVERLJIVIH INFORMACIJA
IV.   IZUZECI OD POVERLJIVOSTI
V.    OBAVEZE ČUVANJA POVERLJIVOSTI
VI.   DOZVOLJENO OTKRIVANJE
VII.  TRAJANJE SPORAZUMA
VIII. VRAĆANJE INFORMACIJA
IX.   POSLEDICE KRŠENJA
X.    ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## TON I STIL

- Formalan pravni jezik, ali razumljiv | Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Iznose slovima piši kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada | 1.000.000 → milion.
- Tip 1: koristi termine "Strana koja otkriva" i "Strana koja prima"
- Tip 2: koristi termine "Prva strana" i "Druga strana"
- Penali pisati i slovima ako se ugovaraju

## ŠTA NE RADIŠ

- Iznose slovima uvek piši razdvojeno: svaka reč posebno.
  Ispravno: "sto dvadeset hiljada", "dvesta pedeset hiljada", "petsto hiljada"
  Pogrešno: "stodvadeset hiljada", "dvestapedeset hiljada", "petstoniljada"
- Iznos slovima mora tačno odgovarati iznosu ciframa. Uvek proveri.
- Nikada ne računaj datume samostalno (npr. "danas + 24 meseca = datum isteka").
  Ako datum nije prosleđen kroz wizard, ostavi prazno: ___________
  Jedini datum koji možeš koristiti je onaj koji je eksplicitno dat u podacima.
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne garantuješ valjanost u međunarodnim slučajevima
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski
- Ako je broj_ugovora 'bez broja' ili prazan, ne generiši redak 'Broj:' u zaglavlju.
- DATUM ZAKLJUČIVANJA I DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum zaključivanja u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum zaključivanja (npr. 'zaključen dana...') piše: 'zaključen dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - JEDINI datum koji se generiše iz wizard inputa je datum trajanja sporazuma / rok čuvanja — jer ga korisnik eksplicitno unosi.
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: NdaData): string {
  const kazna = typeof data.kazna === 'number' ? `${data.kazna.toLocaleString('sr-RS')} RSD` : '[nije ugovorena]'
  const zabrana = data.zabrana ? `Da (${data.trajanje_zabrane ?? '[POPUNITI: trajanje zabrane]'} meseci)` : 'Ne'
  const brojUgovora = data.broj_ugovora?.trim() ? data.broj_ugovora.trim() : 'bez broja'

  return `Molim te generiši Sporazum o poverljivosti sa sledećim podacima:

BROJ UGOVORA: ${brojUgovora}
TIP: ${data.tip_nda}
SVRHA: ${data.svrha}

STRANA KOJA OTKRIVA:
- Tip: ${data.tip_strane_1} | Naziv/Ime: ${data.naziv_strane_1}
- PIB: ${data.pib_strane_1 ?? '[POPUNITI: PIB]'} | Adresa: ${data.adresa_strane_1}
- Zastupnik: ${data.zastupnik_strane_1 ?? '[POPUNITI: zastupnik]'}

STRANA KOJA PRIMA:
- Tip: ${data.tip_strane_2} | Naziv/Ime: ${data.naziv_strane_2}
- PIB: ${data.pib_strane_2 ?? '[POPUNITI: PIB]'} | Adresa: ${data.adresa_strane_2}
- Zastupnik: ${data.zastupnik_strane_2 ?? '[POPUNITI: zastupnik]'}

POVERLJIVE INFORMACIJE:
- Oblast: ${formatOblast(data.oblast_informacija)}
- Opis: ${data.opis_informacija ?? '[nema dodatnog opisa]'}
- Označavanje: ${data.oznacavanje ? 'Da' : 'Ne'}

TRAJANJE:
- Datum: ${data.datum}
- Trajanje sporazuma: ${data.trajanje_sporazuma} meseci
- Obaveza čuvanja po isteku: ${data.trajanje_cuvanja} meseci

DODATNO:
- Ugovorna kazna: ${kazna}
- Zabrana konkurencije: ${zabrana}
- Napomene: ${data.napomene ?? '[nema]'}

Svi podaci su u nominativu. Dekliniraš ispravno. Odredi tip NDA i primeni odgovarajuću strukturu.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'tip',
    title: 'Tip NDA',
    fields: [
      {
        id: 'broj_ugovora',
        label: 'Broj ugovora',
        type: 'text',
        required: false,
        placeholder: 'npr. 001/2026',
        helperText: 'Ostavite prazno ako ne želite broj',
        tooltip: 'Interni broj za vašu evidenciju. Ako ostavite prazno, ugovor neće imati broj u zaglavlju.',
      },
      {
        id: 'tip_nda',
        label: 'Tip sporazuma',
        type: 'radio',
        required: true,
        tooltip: 'Jednostrani NDA — samo jedna strana otkriva tajne informacije (npr. startup investitoru).\nDvostrani NDA — obe strane međusobno dele poverljive informacije (npr. dve firme razgovaraju o partnerstvu).',
        options: [
          { value: 'Jednostrani', label: 'Jednostrani' },
          { value: 'Dvostrani', label: 'Dvostrani' },
        ],
      },
      { id: 'svrha', label: 'Svrha otkrivanja', type: 'textarea', required: true, placeholder: 'npr. Razmatranje poslovne saradnje u oblasti razvoja softvera', helperText: 'npr. Razmatranje poslovne saradnje u oblasti razvoja softvera', tooltip: 'Opišite zašto razmenjujete poverljive informacije. Što preciznije, to je NDA bolje prilagođen situaciji i teže ga je osporiti.' },
    ],
  },
  {
    id: 'strana_1',
    title: 'Prva strana',
    fields: [
      {
        id: 'tip_strane_1',
        label: 'Tip subjekta',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Firma', label: 'Firma' },
          { value: 'Preduzetnik', label: 'Preduzetnik' },
          { value: 'Fizičko lice', label: 'Fizičko lice' },
        ],
      },
      { id: 'naziv_strane_1', label: 'Naziv / Ime i prezime', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme ili ime i prezime prve strane' },
      {
        id: 'pib_strane_1',
        label: 'PIB / JMBG',
        type: 'text',
        required: false,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_strane_1',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
            'Preduzetnik': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_strane_1', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta ili stanovanja prve strane' },
      { id: 'zastupnik_strane_1', label: 'Zastupnik (ako je firma)', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija zakonskog zastupnika prve strane' },
    ],
  },
  {
    id: 'strana_2',
    title: 'Druga strana',
    fields: [
      {
        id: 'tip_strane_2',
        label: 'Tip subjekta',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Firma', label: 'Firma' },
          { value: 'Preduzetnik', label: 'Preduzetnik' },
          { value: 'Fizičko lice', label: 'Fizičko lice' },
        ],
      },
      { id: 'naziv_strane_2', label: 'Naziv / Ime i prezime', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme ili ime i prezime druge strane' },
      {
        id: 'pib_strane_2',
        label: 'PIB / JMBG',
        type: 'text',
        required: false,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_strane_2',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
            'Preduzetnik': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_strane_2', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta ili stanovanja druge strane' },
      { id: 'zastupnik_strane_2', label: 'Zastupnik (ako je firma)', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija zakonskog zastupnika druge strane' },
    ],
  },
  {
    id: 'poverljive_informacije',
    title: 'Poverljive informacije',
    fields: [
      { id: 'oblast_informacija', label: 'Oblast informacija', type: 'textarea', required: true, placeholder: 'Nabroj oblasti, odvojene zarezom', helperText: 'Npr. finansije, klijenti, izvorni kod, poslovni planovi', tooltip: 'Označite sve kategorije koje se odnose na vaš slučaj. Šire označavanje bolje štiti — ali pazite da ne označite kategorije koje nemate nameru da delite.' },
      { id: 'opis_informacija', label: 'Dodatni opis', type: 'textarea', required: false, placeholder: 'npr. Podaci o klijentima, izvorni kod, poslovne strategije...', helperText: 'Preciznije navedite koje informacije su poverljive' },
      { id: 'oznacavanje', label: 'Označavanje dokumenata kao "Poverljivo"?', type: 'toggle', required: true, defaultValue: true, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Ako uključite, strane moraju fizički označavati poverljive dokumente. Ako isključite, sve razmenjene informacije automatski se smatraju poverljivim.' },
    ],
  },
  {
    id: 'trajanje',
    title: 'Trajanje',
    fields: [
      { id: 'datum', label: 'Datum potpisivanja', type: 'date', required: true, helperText: 'Datum kada sporazum stupa na snagu' },
      { id: 'trajanje_sporazuma', label: 'Trajanje sporazuma (meseci)', type: 'number', required: true, min: 1, defaultValue: 24, helperText: 'Koliko meseci traje aktivna razmena informacija', tooltip: 'Period tokom kojeg aktivno razmenjujete informacije. Nakon isteka, možete prestati sa razmenom — ali obaveza čuvanja tajne traje još određeno vreme (sledeće polje).' },
      { id: 'trajanje_cuvanja', label: 'Obaveza čuvanja po isteku (meseci)', type: 'number', required: true, min: 1, defaultValue: 36, helperText: 'Meseci čuvanja posle isteka sporazuma', tooltip: 'Koliko dugo primalac mora čuvati tajnost NAKON što sporazum istekne. Standard je 2-3 godine nakon isteka.' },
    ],
  },
  {
    id: 'dodatno',
    title: 'Dodatne odredbe',
    fields: [
      { id: 'kazna', label: 'Ugovorna kazna za kršenje (RSD)', type: 'number', required: false, min: 1, helperText: 'Iznos u RSD. Unesite 0 za bez ugovorne kazne.', tooltip: 'Ugovorna kazna je fiksni iznos koji prekršilac plaća bez dokazivanja visine štete. Preporučen iznos: 3-10x mesečna vrednost saradnje. Prenizak iznos ne odvraća od kršenja, previsok može biti smanjen od suda.' },
      { id: 'zabrana', label: 'Zabrana konkurencije?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Zabrana konkurencije znači da strana koja prima ne sme u određenom periodu raditi za direktne konkurente strane koja otkriva, niti pokretati sopstvenu delatnost u istoj oblasti. Ovo je stroži uslov od same poverljivosti — NDA bez ove klauzule dozvoljava rad za konkurenciju.' },
      { id: 'trajanje_zabrane', label: 'Trajanje zabrane (meseci)', type: 'number', required: false, min: 1, conditional: { field: 'zabrana', value: true }, helperText: 'Meseci zabrane rada za konkurenciju (max 24)' },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false, placeholder: 'npr. Posebni uslovi, dodatne definicije, napomene za obe strane...', helperText: 'Opciono — unesite samo ako postoje dodatni uslovi' },
    ],
  },
]
