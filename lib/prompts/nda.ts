import type { NdaData, WizardStep } from '@/types/wizard'
import { KNOWLEDGE_TOPICS } from '@/lib/knowledge'

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
→ Obaveze čuvanja poverljivosti važe ISKLJUČIVO za Stranu koja prima
→ Strana koja otkriva NEMA obavezu čuvanja sopstvenih informacija po ovom sporazumu
→ NIKADA ne generiši simetrične obaveze za obe strane u jednostranom NDA
→ Svaki član koji počinje sa "Strane se obavezuju..." je greška u Tip 1 — zameni sa "Strana koja prima obavezuje se..."

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

## OBAVEZNI ELEMENTI NDA (izvor: interna baza znanja, ${KNOWLEDGE_TOPICS['poverljivost'].pravniOsnov})

${KNOWLEDGE_TOPICS['poverljivost'].sadrzaj}

Uz gornje elemente, sporazum mora sadržati i: merodavno pravo i nadležnost suda, i potpise strana (potpise sistem dodaje automatski).

## IZUZECI - OBAVEZNO UKLJUČITI

Informacije NISU poverljive ako:
a) su bile javno dostupne pre potpisivanja
b) postanu javno dostupne bez krivice primaoca
c) ih je primalac već znao pre otkrivanja
d) ih je primalac dobio od treće strane bez obaveze čuvanja
e) su otkrivene na osnovu zakonske obaveze ili sudskog naloga

## UGOVORNA KAZNA — PROPORCIONALNOST (izvor: interna baza znanja, ${KNOWLEDGE_TOPICS['ugovorna-kazna'].pravniOsnov})

${KNOWLEDGE_TOPICS['ugovorna-kazna'].sadrzaj}

Ako je ugovorna kazna uneta, član o posledicama kršenja mora sadržati napomenu da se kazna ne dira pravo na naknadu stvarne štete u meri u kojoj ona premašuje kaznu (čl. 275 ZOO) — ne generiši formulaciju koja isključuje ovo pravo. Ne dodaješ samostalno gornji limit (kap) kazne osim ako ga je korisnik eksplicitno uneo — ali ako je uneti iznos kazne izrazito visok u odnosu na svrhu sporazuma navedenu u SVRHA, formuliši član neutralno i precizno (bez preterivanja u jeziku), jer visina je korisnikova odluka.

## ZABRANA KONKURENCIJE — NAKNADA OBAVEZNA

Ako se zabrana konkurencije ugovara, sporazum MORA sadržati konkretnu novčanu naknadu koju Strana koja otkriva plaća Strani koja prima za period trajanja zabrane. Zabrana bez naknade ograničava slobodu privređivanja strane koja prima i rizikuje da bude ocenjena kao nesrazmerna ili teško izvršiva. Ako naknada nije uneta, postavi [POPUNITI: naknada za zabranu konkurencije] umesto da klauzulu ostaviš bez ikakve kompenzacije.

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
- DATUMI I TRAJANJE — PRAVILA:
  - Ako korisnik unese samo datum potpisivanja i period trajanja (trajanje_sporazuma u mesecima): generiši SAMO period u tekstu ("u periodu od X meseci"), NE računaj konkretan datum isteka
  - Ako korisnik unese i datum potpisivanja i eksplicitan datum isteka: proveri konzistentnost. Ako se datum isteka ne poklapa sa datum_potpisivanja + trajanje_sporazuma, generiši upozorenje u ugovoru: "[PROVERITI: datum isteka X ne odgovara periodu od Y meseci od datuma potpisivanja Z]"
  - Ako datum potpisivanja nije unet, postavi [POPUNITI: datum potpisivanja] — nikad ne ostavljaj prazno polje bez oznake
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne garantuješ valjanost u međunarodnim slučajevima
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski
- Ne generiši klauzulu zabrane konkurencije bez oba ograničenja: geografskog (npr. "na teritoriji Republike Srbije") i delatnostnog (precizno opisana zabranjena delatnost, ne generička oblast)
- Ne koristi formulaciju "oblast [delatnost]" kao jedino delatnostno ograničenje — to pokriva celu industriju i čini klauzulu neizvršivom
- Ako korisnik nije uneo geografsko_ogranicenje_zabrane i opis_zabranjene_delatnosti, generiši [POPUNITI: geografsko ograničenje] i [POPUNITI: opis zabranjene delatnosti] umesto generičke zabrane
- Ne kopiraj u ugovor tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje (opis_informacija, napomene, posebni_uslovi) sadrži bilo koji od sledećih signala, zameni celo polje sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario"
  • tekst je kraći od 10 karaktera i ne opisuje konkretan sadržaj
- Ako je broj_ugovora 'bez broja' ili prazan, ne generiši redak 'Broj:' u zaglavlju.
- DATUM ZAKLJUČIVANJA I DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum zaključivanja u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum zaključivanja (npr. 'zaključen dana...') piše: 'zaključen dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - Ako datum potpisivanja nije unet, koristi [POPUNITI: datum potpisivanja]
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.

## SAMOPROVERA PRE VRAĆANJA ODGOVORA

Pre nego što vratiš finalni tekst, tiho proveri generisan sporazum naspram liste "OBAVEZNI ELEMENTI NDA" i "IZUZECI" iznad — element po element. Ako neki obavezan element nedostaje ili je nekompletan (npr. tip NDA nije primenjen dosledno, izuzeci od poverljivosti nisu svi navedeni, zabrana konkurencije nema geografsko i delatnostno ograničenje ILI nema naknadu, ugovorna kazna nema napomenu o pravu na naknadu štete), DOPUNI sporazum pre nego što ga vratiš. Ne vraćaj dokument sa poznatim propustom — ne pominji korisniku da si proveravao, samo isporuči popravljenu verziju.`

export function buildUserMessage(data: NdaData): string {
  const kazna = typeof data.kazna === 'number' ? `${data.kazna.toLocaleString('sr-RS')} RSD` : '[nije ugovorena]'
  const zabranaAktivna = data.zabrana_konkurencije ?? data.zabrana ?? false
  const zabrana = zabranaAktivna ? 'Da' : 'Ne'
  const naknadaZabrana = zabranaAktivna
    ? `${data.naknada_zabrana?.toLocaleString('sr-RS') ?? '[POPUNITI: naknada za zabranu konkurencije]'} RSD mesečno`
    : 'Nije primenljivo'
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
- Oblast poverljivih informacija: ${formatOblast(data.oblast_informacija)}
- Opis (ako tekst opisuje samo polje umesto sadržaja, generiši [POPUNITI: opis poverljivih informacija]): ${data.opis_informacija ?? '[POPUNITI: opis poverljivih informacija]'}
- Označavanje: ${data.oznacavanje ? 'Da' : 'Ne'}

TRAJANJE:
- Datum potpisivanja: ${data.datum ?? '[POPUNITI: datum potpisivanja]'}
- Trajanje sporazuma: ${data.trajanje_sporazuma} meseci
- Obaveza čuvanja po isteku: ${data.trajanje_cuvanja} meseci

DODATNO:
- Ugovorna kazna: ${kazna}
- Zabrana konkurencije: ${zabrana}
- Trajanje zabrane: ${data.trajanje_zabrane ?? '[POPUNITI: trajanje zabrane]'} meseci
- Naknada za period zabrane: ${naknadaZabrana}
- Geografsko ograničenje: ${data.geografsko_ogranicenje_zabrane ?? '[POPUNITI: geografsko ograničenje]'}
- Opis zabranjene delatnosti: ${data.opis_zabranjene_delatnosti ?? '[POPUNITI: opis zabranjene delatnosti]'}
- Posebne napomene (ako tekst opisuje samo polje umesto sadržaja, generiši [POPUNITI: posebne napomene]): ${data.napomene ?? '[POPUNITI: posebne napomene]'}

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
      { id: 'oblast_informacija', label: 'Oblast informacija', type: 'textarea', required: true, placeholder: 'Nabroj oblasti, odvojene zarezom', helperText: 'Npr. finansije, klijenti, izvorni kod, poslovni planovi', tooltip: 'Nabrojte sve kategorije informacija koje planirate da razmenite (npr. finansije, klijenti, izvorni kod, poslovni planovi). Šira lista bolje štiti — ali nemojte navoditi kategorije koje ne nameravate da delite.' },
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
      { id: 'zabrana_konkurencije', label: 'Zabrana konkurencije?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Zabranjuje stranama da se takmiče međusobno nakon isteka sporazuma. Da bi bila izvršiva na sudu, mora biti geografski i delatnostno ograničena.' },
      { id: 'trajanje_zabrane', label: 'Trajanje zabrane (meseci)', type: 'number', required: false, min: 1, max: 24, defaultValue: 12, conditional: { field: 'zabrana_konkurencije', value: true }, helperText: 'Preporučeno: max 24 meseca' },
      {
        id: 'naknada_zabrana',
        label: 'Naknada za period zabrane (RSD mesečno)',
        type: 'number',
        required: true,
        conditional: { field: 'zabrana_konkurencije', value: true },
        min: 1,
        tooltip: 'Zabrana konkurencije bez naknade za period koji ograničava stranu koja prima rizikuje da bude ocenjena kao nesrazmerna ili teško izvršiva. Isti princip proporcionalnosti se u srpskom pravu primenjuje i van radnog odnosa (Zakon o radu, čl. 161. st. 2. — analogija).',
        helperText: 'Bez naknade klauzula je rizično neizvršiva — preporučeno uneti iznos',
        placeholder: 'npr. 20000',
      },
      { id: 'geografsko_ogranicenje_zabrane', label: 'Geografsko ograničenje zabrane', type: 'text', required: false, conditional: { field: 'zabrana_konkurencije', value: true }, placeholder: 'npr. na teritoriji Republike Srbije', helperText: 'Bez geografskog ograničenja klauzula je teško izvršiva' },
      { id: 'opis_zabranjene_delatnosti', label: 'Opis zabranjene delatnosti', type: 'textarea', required: false, conditional: { field: 'zabrana_konkurencije', value: true }, placeholder: 'npr. direktno kontaktiranje klijenata identifikovanih tokom saradnje, angažovanje ključnih zaposlenih druge strane', helperText: 'Što preciznije, to je klauzula izvršivija. Generička zabrana cele industrije se poništava na sudu.', tooltip: 'Preporučena formulacija za NDA: zabraniti samo (1) pristup konkretnim klijentima i (2) preuzimanje zaposlenih — ne celu delatnost.' },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false, placeholder: 'npr. Posebni uslovi, dodatne definicije, napomene za obe strane...', helperText: 'Opciono — unesite samo ako postoje dodatni uslovi' },
    ],
  },
]
