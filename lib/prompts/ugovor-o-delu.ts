import type { UgovorODeluData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu ugovora o delu u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima ("Sl. list SFRJ", br. 29/78, 39/85, 45/89, 57/89; "Sl. list SRJ", br. 31/93; "Sl. list SCG", br. 1/2003) i Zakonom o porezu na dohodak građana ("Sl. glasnik RS", br. 24/2001 i izmene).

## TVOJ ZADATAK

Na osnovu podataka koje ti korisnik dostavi, generišeš kompletan, profesionalan Ugovor o delu na srpskom jeziku (latinica). Pre generisanja određuješ SCENARIO na osnovu tipa izvođača, jer od toga zavisi poreski tretman i formulacija ugovora.

## ODREĐIVANJE SCENARIJA - OBAVEZNO PRE GENERISANJA

Na osnovu polja "Tip izvođača" određuješ jedan od tri scenarija:

SCENARIO A - Naručilac angažuje FIZIČKO LICE bez registrovane delatnosti
→ Naručilac je poreski platac - obračunava i uplaćuje porez (20% na bruto) i doprinose
→ U ugovoru OBAVEZNO navesti: bruto iznos naknade, napomenu da naručilac vrši obračun i uplatu poreza
→ Dodati član: "Naručilac se obavezuje da obračuna i uplati porez na dohodak i doprinose za obavezno socijalno osiguranje u skladu sa Zakonom o porezu na dohodak građana."

SCENARIO B - Naručilac angažuje PREDUZETNIKA ili FIRMU (paušalac, doo, ad)
→ Izvođač sam plaća porez kroz svoju registrovanu delatnost
→ Dodati: "Izvođač, kao registrovano privredno lice, samostalno izmiruje sve poreske i druge zakonske obaveze."
→ Faktura je osnov za plaćanje

SCENARIO C - Fizičko lice angažuje fizičko lice
→ Isti tretman kao Scenario A
→ Napomenuti da naručilac mora biti registrovan kao isplatilac prihoda

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve lične podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO na sledećim mestima:
1. Uvod - definisanje ugovornih strana
2. Član o naknadi
3. Potpisi
4. Eventualne posebne klauzule

Sve ostalo ide kroz "Naručilac" i "Izvođač".

### Padeži:
NOMINATIV: "Izvođač Nikola Jovanović preuzima obavezu..."
GENITIV: "naknada Nikole Jovanovića", "u ime Sigma doo-a"
DATIV: "isplatiti Nikoli Jovanoviću", "dostaviti Ani Marković"
AKUZATIV: "angažuje Nikolu Jovanovića"
INSTRUMENTAL: "potpisano od strane Nikole Jovanovića"

### Deklinacija firmi:
- "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
- Naziv koji završava suglasnikom → dodaj "-a" (gen.), "-u" (dat.)

### Deklinacija ličnih imena:
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu | Luka→Luke→Luki→Luku
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu
Pol određuješ iz imena - "Izvođač/Izvođačica", "dužan/dužna" itd.

## OBAVEZNI ELEMENTI UGOVORA

1. Naziv/ime i sedište/adresa naručioca
2. Naziv/ime i sedište/adresa izvođača
3. Predmet ugovora - tačan opis dela koje se izvodi
4. Rok izvođenja / rok isporuke
5. Iznos naknade i način isplate
6. Poreski tretman (prema scenariju)
7. Autorska prava / vlasništvo nad rezultatom
8. Poverljivost (NDA klauzula, ako se ugovara)
9. Odgovornost za nedostatke
10. Raskid ugovora
11. Merodavno pravo i nadležnost suda
12. Potpisi

## FORMAT IZLAZA

UGOVOR O DELU
Broj: [auto]
Datum: [datum zaključenja]

I.    UGOVORNE STRANE
II.   PREDMET UGOVORA
III.  ROK IZVOĐENJA
IV.   NAKNADA I NAČIN ISPLATE
V.    PORESKI TRETMAN [samo Scenario A i C]
VI.   VLASNIŠTVO NAD REZULTATOM RADA
VII.  POVERLJIVOST [ako se ugovara]
VIII. ODGOVORNOST ZA NEDOSTATKE
IX.   RASKID UGOVORA
X.    ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## TON I STIL

- Formalan pravni jezik, ali razumljiv
- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Iznose slovima piši kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada | 1.000.000 → milion.
- "Naručilac" i "Izvođač/Izvođačica" kroz ceo dokument
- Pol izvođača određuješ iz imena
- Novčane iznose pisati i slovima: 150.000,00 (sto pedeset hiljada) dinara
- Scenario A: navesti i bruto i neto iznos, jasno ko plaća porez

## ŠTA NE RADIŠ

- Ne izmišljaš podatke - označi sa [POPUNITI: naziv podatka]
- Ne daješ pravne ni poreske savete van okvira dokumenta
- Ne garantuješ poresku ispravnost u specifičnim slučajevima
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski`

export function buildUserMessage(data: UgovorODeluData): string {
  const fazno = data.fazno ? `Da - ${data.opis_faza ?? '[POPUNITI: opis faza]'}` : 'Ne'
  const avans = data.avans ?? 0
  const nda = data.nda ? `Da (${data.trajanje_nda ?? '[POPUNITI: trajanje NDA]'} meseci)` : 'Ne'
  const zabrana = data.zabrana ? 'Da' : 'Ne'

  return `Molim te generiši Ugovor o delu sa sledećim podacima:

NARUČILAC:
- Tip: ${data.tip_narucioca}
- Naziv/Ime: ${data.naziv_narucioca}
- PIB: ${data.pib_narucioca ?? '[POPUNITI: PIB naručioca]'}
- Adresa: ${data.adresa_narucioca}
- Zastupnik: ${data.zastupnik_narucioca ?? '[POPUNITI: zastupnik naručioca]'}

IZVOĐAČ:
- Tip: ${data.tip_izvodjaca}
- Ime/Naziv: ${data.naziv_izvodjaca}
- JMBG/PIB: ${data.jmbg_pib_izvodjaca}
- Adresa: ${data.adresa_izvodjaca}
- Račun: ${data.racun_izvodjaca ?? '[POPUNITI: račun izvođača]'}

PREDMET:
- Naziv dela: ${data.naziv_dela}
- Opis: ${data.opis_dela}
- Merljivi rezultat: ${data.rezultat}
- Specifikacije: ${data.specifikacije ?? '[POPUNITI: specifikacije]'}

ROKOVI:
- Početak: ${data.datum_pocetka}
- Završetak: ${data.datum_zavrsetka}
- Fazna isporuka: ${fazno}

NAKNADA:
- Iznos: ${data.iznos.toLocaleString('sr-RS')} RSD (${data.bruto_neto})
- Način isplate: ${data.nacin_isplate}
- Avans: ${avans}%
- Rok plaćanja: ${data.rok_placanja} dana od isporuke

DODATNO:
- Vlasništvo nad rezultatom: ${data.vlasnistvo}
- NDA: ${nda}
- Zabrana konkurencije: ${zabrana}
- Napomene: ${data.napomene ?? '[nema]'}

Svi podaci su u nominativu. Dekliniraš sva lična imena i nazive firmi ispravno. Odredi scenario (A, B ili C) i primeni odgovarajući poreski tretman.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'narucilac',
    title: 'Naručilac',
    fields: [
      {
        id: 'tip_narucioca',
        label: 'Tip naručioca',
        type: 'radio',
        required: true,
        options: [
          { value: 'Firma', label: 'Firma' },
          { value: 'Preduzetnik', label: 'Preduzetnik' },
          { value: 'Fizičko lice', label: 'Fizičko lice' },
        ],
      },
      { id: 'naziv_narucioca', label: 'Naziv / Ime i prezime', type: 'text', required: true },
      { id: 'pib_narucioca', label: 'PIB (ako je firma/preduzetnik)', type: 'text', required: false },
      { id: 'adresa_narucioca', label: 'Adresa sedišta / stanovanja', type: 'text', required: true },
      { id: 'zastupnik_narucioca', label: 'Zastupnik - ime i funkcija (ako je firma)', type: 'text', required: false },
    ],
  },
  {
    id: 'izvodjac',
    title: 'Izvođač',
    fields: [
      {
        id: 'tip_izvodjaca',
        label: 'Tip izvođača',
        type: 'radio',
        required: true,
        tooltip: 'Ovo je najvažniji izbor jer određuje ko plaća porez:\n• Fizičko lice bez firme → Vi (naručilac) plaćate porez pre isplate\n• Preduzetnik/paušalac → Izvođač sam plaća porez kroz svoju firmu\n• Firma doo → Isto kao preduzetnik, plaća sami',
        options: [
          { value: 'Fizičko lice (bez firme)', label: 'Fizičko lice (bez firme)' },
          { value: 'Preduzetnik-paušalac', label: 'Preduzetnik-paušalac' },
          { value: 'Firma doo', label: 'Firma doo' },
        ],
      },
      { id: 'naziv_izvodjaca', label: 'Ime i prezime / Naziv firme', type: 'text', required: true },
      {
        id: 'jmbg_pib_izvodjaca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        dynamicConfig: {
          watchField: 'tip_izvodjaca',
          values: {
            'Fizičko lice (bez firme)': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Preduzetnik-paušalac': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
            'Firma doo': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_izvodjaca', label: 'Adresa stanovanja / sedišta', type: 'text', required: true },
      { id: 'racun_izvodjaca', label: 'Broj tekućeg računa za isplatu', type: 'text', required: false },
    ],
  },
  {
    id: 'predmet',
    title: 'Predmet ugovora',
    fields: [
      { id: 'naziv_dela', label: 'Naziv dela / usluge', type: 'text', required: true, helperText: 'npr. Izrada web sajta, Grafički dizajn logotipa' },
      { id: 'opis_dela', label: 'Detaljan opis dela', type: 'textarea', required: true },
      { id: 'rezultat', label: 'Merljivi rezultat / isporuka', type: 'text', required: true, helperText: 'npr. Funkcionalan sajt sa CMS sistemom i 5 stranica', tooltip: 'Opišite konkretan, merljiv rezultat koji izvođač treba da isporuči. Što preciznije, to je bolja zaštita za obe strane.' },
      { id: 'specifikacije', label: 'Posebni zahtevi / tehničke specifikacije', type: 'textarea', required: false },
    ],
  },
  {
    id: 'rokovi',
    title: 'Rokovi',
    fields: [
      { id: 'datum_pocetka', label: 'Datum početka', type: 'date', required: true },
      { id: 'datum_zavrsetka', label: 'Datum završetka / isporuke', type: 'date', required: true },
      { id: 'fazno', label: 'Fazna isporuka?', type: 'toggle', required: false, defaultValue: false },
      { id: 'opis_faza', label: 'Opis faza i rokova', type: 'textarea', required: false, conditional: { field: 'fazno', value: true } },
    ],
  },
  {
    id: 'naknada',
    title: 'Naknada',
    fields: [
      { id: 'iznos', label: 'Iznos naknade (RSD)', type: 'number', required: true, min: 1 },
      {
        id: 'bruto_neto',
        label: 'Bruto ili neto?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Bruto', label: 'Bruto' },
          { value: 'Neto', label: 'Neto' },
        ],
      },
      {
        id: 'nacin_isplate',
        label: 'Način isplate',
        type: 'radio',
        required: true,
        options: [
          { value: 'Jednokratno', label: 'Jednokratno' },
          { value: 'Avans + ostatak', label: 'Avans + ostatak' },
          { value: 'Po fazama', label: 'Po fazama' },
        ],
      },
      { id: 'avans', label: 'Procenat avansa', type: 'number', required: false, min: 0, max: 100, conditional: { field: 'nacin_isplate', value: 'Avans + ostatak' } },
      { id: 'rok_placanja', label: 'Rok plaćanja po isporuci (dana)', type: 'number', required: true, min: 1, defaultValue: 15 },
    ],
  },
  {
    id: 'dodatno',
    title: 'Dodatne odredbe',
    fields: [
      {
        id: 'vlasnistvo',
        label: 'Ko je vlasnik rezultata rada?',
        type: 'radio',
        required: true,
        tooltip: 'Po srpskom pravu, autor automatski zadržava autorska prava. Ako želite da koristite rezultat slobodno (modifikujete, prodajete, distribuirate), morate eksplicitno ugovoriti prenos prava na naručioca.',
        options: [
          { value: 'Naručilac', label: 'Naručilac' },
          { value: 'Izvođač', label: 'Izvođač' },
          { value: 'Zajednička prava', label: 'Zajednička prava' },
        ],
      },
      { id: 'nda', label: 'Klauzula poverljivosti (NDA)?', type: 'toggle', required: false, defaultValue: false },
      { id: 'trajanje_nda', label: 'Trajanje NDA (meseci)', type: 'number', required: false, min: 1, conditional: { field: 'nda', value: true } },
      { id: 'zabrana', label: 'Zabrana konkurencije?', type: 'toggle', required: false, defaultValue: false },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false },
    ],
  },
]
