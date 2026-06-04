import type { NdaData, WizardStep } from '@/types/wizard'

function formatOblast(input: NdaData['oblast_informacija']): string {
  return Array.isArray(input) ? input.join(', ') : input
}

export const systemPrompt = `Ti si pravni asistent specijalizovan za izradu sporazuma o poverljivosti (NDA - Non-Disclosure Agreement) u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima i Zakonom o zaštiti poslovne tajne ("Sl. glasnik RS", br. 72/2011).

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
Broj: [auto] | Datum: [datum]

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

- Formalan pravni jezik, ali razumljiv | Latinica, srpski jezik
- Tip 1: "Strana koja otkriva" / "Strana koja prima"
- Tip 2: "Prva strana" / "Druga strana"
- Penali pisati i slovima ako se ugovaraju

## ŠTA NE RADIŠ

- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne garantuješ valjanost u međunarodnim slučajevima
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski`

export function buildUserMessage(data: NdaData): string {
  const kazna = typeof data.kazna === 'number' ? `${data.kazna.toLocaleString('sr-RS')} RSD` : '[nije ugovorena]'
  const zabrana = data.zabrana ? `Da (${data.trajanje_zabrane ?? '[POPUNITI: trajanje zabrane]'} meseci)` : 'Ne'

  return `Molim te generiši Sporazum o poverljivosti sa sledećim podacima:

TIP: ${data.tip_nda}
SVRHA: ${data.svrha}

STRANA KOJA OTKRIVA / PRVA STRANA:
- Tip: ${data.tip_strane_1} | Naziv/Ime: ${data.naziv_strane_1}
- PIB: ${data.pib_strane_1 ?? '[POPUNITI: PIB]'} | Adresa: ${data.adresa_strane_1}
- Zastupnik: ${data.zastupnik_strane_1 ?? '[POPUNITI: zastupnik]'}

STRANA KOJA PRIMA / DRUGA STRANA:
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
        id: 'tip_nda',
        label: 'Tip sporazuma',
        type: 'radio',
        required: true,
        options: [
          { value: 'Jednostrani', label: 'Jednostrani' },
          { value: 'Dvostrani', label: 'Dvostrani' },
        ],
      },
      { id: 'svrha', label: 'Svrha otkrivanja', type: 'textarea', required: true },
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
        options: [
          { value: 'Firma', label: 'Firma' },
          { value: 'Preduzetnik', label: 'Preduzetnik' },
          { value: 'Fizičko lice', label: 'Fizičko lice' },
        ],
      },
      { id: 'naziv_strane_1', label: 'Naziv / Ime i prezime', type: 'text', required: true },
      { id: 'pib_strane_1', label: 'PIB (ako firma)', type: 'text', required: false },
      { id: 'adresa_strane_1', label: 'Adresa', type: 'text', required: true },
      { id: 'zastupnik_strane_1', label: 'Zastupnik (ako firma)', type: 'text', required: false },
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
        options: [
          { value: 'Firma', label: 'Firma' },
          { value: 'Preduzetnik', label: 'Preduzetnik' },
          { value: 'Fizičko lice', label: 'Fizičko lice' },
        ],
      },
      { id: 'naziv_strane_2', label: 'Naziv / Ime i prezime', type: 'text', required: true },
      { id: 'pib_strane_2', label: 'PIB (ako firma)', type: 'text', required: false },
      { id: 'adresa_strane_2', label: 'Adresa', type: 'text', required: true },
      { id: 'zastupnik_strane_2', label: 'Zastupnik (ako firma)', type: 'text', required: false },
    ],
  },
  {
    id: 'poverljive_informacije',
    title: 'Poverljive informacije',
    fields: [
      { id: 'oblast_informacija', label: 'Oblast informacija', type: 'textarea', required: true, placeholder: 'Nabroj oblasti, odvojene zarezom' },
      { id: 'opis_informacija', label: 'Dodatni opis', type: 'textarea', required: false },
      { id: 'oznacavanje', label: 'Označavanje dokumenata kao "Poverljivo"?', type: 'toggle', required: true, defaultValue: true },
    ],
  },
  {
    id: 'trajanje',
    title: 'Trajanje',
    fields: [
      { id: 'datum', label: 'Datum potpisivanja', type: 'date', required: true },
      { id: 'trajanje_sporazuma', label: 'Trajanje sporazuma (meseci)', type: 'number', required: true, min: 1, defaultValue: 24 },
      { id: 'trajanje_cuvanja', label: 'Obaveza čuvanja po isteku (meseci)', type: 'number', required: true, min: 1, defaultValue: 36 },
    ],
  },
  {
    id: 'dodatno',
    title: 'Dodatne odredbe',
    fields: [
      { id: 'kazna', label: 'Ugovorna kazna za kršenje (RSD)', type: 'number', required: false, min: 1 },
      { id: 'zabrana', label: 'Zabrana konkurencije?', type: 'toggle', required: false, defaultValue: false },
      { id: 'trajanje_zabrane', label: 'Trajanje zabrane (meseci)', type: 'number', required: false, min: 1, conditional: { field: 'zabrana', value: true } },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false },
    ],
  },
]
