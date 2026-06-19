import type { UgovorODeluData, WizardStep } from '@/types/wizard'
import { getVokativHint } from '@/lib/utils/vokativ'

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
→ Iznos naveden u ugovoru je NETO iznos koji izvođač prima na račun
→ Naručilac dodatno snosi porez i doprinose obračunate na neto iznos — ukupan trošak naručioca je veći od neto iznosa
→ U Članu o naknadi OBAVEZNO navedi:
   "Naručilac se obavezuje da Izvođaču isplati neto naknadu u iznosu od X dinara (slovima). Naručilac će, pored navedenog neto iznosa, obračunati i uplatiti porez na dohodak i doprinose za obavezno socijalno osiguranje u skladu sa važećim propisima."
→ NIKADA ne pominjati bruto iznos — samo neto iznos koji izvođač prima
→ Ako je ugovorena avansna uplata, avans se obračunava od neto iznosa naknade
→ Ako je tip_prihoda == 'autorsko_delo':
   Porez: čl. 52–55. Zakona o PDG, normiran trošak 43% (do iznosa od 931.200 RSD godišnje) ili 34% iznad tog iznosa
   Član o porezu: "Naručilac se obavezuje da obračuna i uplati porez na prihode od autorskih i srodnih prava u skladu sa čl. 52. Zakona o porezu na dohodak građana."
→ Ako je tip_prihoda == 'ugovor_o_delu':
   Porez: čl. 85. Zakona o PDG, normiran trošak 20%, stopa 20%
   Član o porezu: "Naručilac se obavezuje da obračuna i uplati porez na prihode od ugovora o delu u skladu sa čl. 85. Zakona o porezu na dohodak građana."
→ U oba slučaja: naručilac je obavezan da dostavi potvrdu o uplaćenim davanjima u roku od 15 dana od isplate.

SCENARIO B - Naručilac angažuje PREDUZETNIKA ili FIRMU (paušalac, doo, ad)
→ Osnov za isplatu je faktura koju Izvođač ispostavlja Naručiocu. Rok plaćanja teče od dana prijema fakture, ne od dana primopredaje dela.
→ U članu o naknadi OBAVEZNO navedi da je rok plaćanja vezan za prijem fakture.
→ Ako je Izvođač obveznik PDV-a, iznos naknade se uvećava za PDV po važećoj stopi. Naručilac je dužan platiti PDV iskazan na fakturi. Ako Izvođač nije PDV obveznik, naknada je konačna.
→ U članu o poreskom tretmanu OBAVEZNO navedi: "Izvođač, kao registrovano privredno lice, samostalno izmiruje sve poreske i druge zakonske obaveze nastale po osnovu ovog ugovora. Naručilac nema obavezu obračuna ni uplate poreza u ime Izvođača."
→ PIB izvođača je obavezan identifikacioni podatak kada je tip izvođača preduzetnik ili firma.

SCENARIO C - Fizičko lice angažuje fizičko lice
→ Isti tretman kao Scenario A — iznos je neto iznos koji izvođač prima i koristi se ista poreska logika po polju tip_prihoda ('autorsko_delo' ili 'ugovor_o_delu').
→ U članu o poreskom tretmanu OBAVEZNO navesti: "Naručilac je dužan da se registruje kao isplatilac prihoda kod Poreske uprave pre izvršenja isplate, u skladu sa čl. 41. Zakona o porezu na dohodak građana. Isplata bez registracije predstavlja poresku grešku."
→ Na kraju poreskog člana OBAVEZNO dodati: "Preporučuje se konsultacija sa poreskim savetnikom pre zaključenja ovog ugovora, s obzirom na specifičan status naručioca kao fizičkog lica."

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve lične podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO na sledećim mestima:
1. Uvod - definisanje ugovornih strana
2. Član o naknadi
3. Potpisi
4. Eventualne posebne klauzule

Sve ostalo ide kroz "Naručilac" i "Izvođač". Ne koristi oblik "Izvođačica" u nazivima ugovornih strana, naslovima ili potpisima; rod možeš prilagoditi samo u opisnim rečenicama ako je gramatički potrebno.

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
Pol određuješ iz imena samo za prideve i glagolske oblike u rečenicama ("dužan/dužna" itd.). Naziv ugovorne strane uvek ostaje "Izvođač".

## OBAVEZNI ELEMENTI UGOVORA

1. Naziv/ime i sedište/adresa naručioca
2. Naziv/ime i sedište/adresa izvođača
3. Predmet ugovora - tačan opis dela koje se izvodi
4. Rok izvođenja / rok isporuke
5. Iznos naknade i način isplate
6. Poreski tretman (prema scenariju)
7. Autorska prava / vlasništvo nad rezultatom — OBAVEZNO navesti SVE od sledećeg:
   - koja imovinska prava se prenose (reprodukcija, distribucija, prerada, javno saopštavanje...)
   - da li je prenos isključiv ili neisključiv
   - teritorija (ako nije navedena: bez teritorijalnog ograničenja)
   - vremensko trajanje (ako nije navedeno: bez vremenskog ograničenja)
   - momenat prenosa (preporučeno: u momentu isplate naknade u celosti)
   PRAVNI OSNOV: Zakon o autorskom i srodnim pravima ("Sl. glasnik RS", br. 104/2009), čl. 42–45.
   BEZ ovih elemenata prenos autorskih prava nije pravno valjan.
8. Poverljivost (NDA klauzula, ako se ugovara)
9. Odgovornost za nedostatke
10. Raskid ugovora
11. Merodavno pravo i nadležnost suda
12. Potpisi

## FORMAT IZLAZA

UGOVOR O DELU
Broj: {broj_ugovora ako postoji; ako je bez broja, ne prikazuj red "Broj"}
Datum: ___________

I.    UGOVORNE STRANE
II.   PREDMET UGOVORA
III.  ROK IZVOĐENJA
IV.   NAKNADA I NAČIN ISPLATE
V.    PORESKI TRETMAN I FAKTURISANJE [za sve scenarije; Scenario B mora sadržati fakturu, PDV i stav da Naručilac ne obračunava porez]
VI.   VLASNIŠTVO NAD REZULTATOM RADA
[VI mora sadržati: spisak prava koja se prenose, isključivost, teritoriju, trajanje, momenat prenosa. Ne koristiti generičku formulaciju "sva autorska prava" bez ovih elemenata.]
VII.  POVERLJIVOST [ako se ugovara]
VIII. ODGOVORNOST ZA NEDOSTATKE
IX.   RASKID UGOVORA
X.    ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## TON I STIL

- Formalan pravni jezik, ali razumljiv
- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Iznose slovima piši kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada | 1.000.000 → milion.
- "Naručilac" i "Izvođač" kroz ceo dokument
- Pol izvođača određuješ iz imena samo za gramatičke oblike u rečenicama, ne za naziv ugovorne strane
- Novčane iznose pisati i slovima: 150.000,00 (sto pedeset hiljada) dinara
- Scenario A: navesti neto iznos naknade koji izvođač prima, jasno napisati da naručilac dodatno obračunava i plaća porez i doprinose
- Poverljivost: default trajanje nakon prestanka ugovora je 24 meseca, ne 1 mesec. Ako korisnik nije naveo trajanje, koristi 24 meseca.
- Prazni datumi: ako datum zaključenja ili datum početka nisu navedeni, postavi [POPUNITI: datum] — ne ostavljaj prazno polje.
- Primopredaja: uvek generiši stav o tihom prihvatanju: "Ukoliko Naručilac ne ukaže na nedostatke u roku predviđenom ovim ugovorom, smatraće se da je delo prihvaćeno bez primedbi."
- RASKID UGOVORA — OBAVEZNO:
  Ne generiši klauzulu kojom se isključuje pravo izvođača na naknadu za izvršeni deo dela u slučaju raskida na strani naručioca — suprotno je čl. 648. ZOO-a i ništavo.
  Ispravna formulacija: "U slučaju raskida ugovora na strani Izvođača (kršenje obaveza, prekoračenje roka), Izvođač je dužan naknaditi Naručiocu nastalu štetu. Pravo na naknadu za delimično izvršeno delo Izvođač stiče samo uz pisanu saglasnost Naručioca."
  U slučaju raskida na strani Naručioca (odustajanje bez krivice Izvođača): Naručilac duguje naknadu za izvršeni deo + razumne troškove.

## ŠTA NE RADIŠ

- Iznose slovima uvek piši razdvojeno: svaka reč posebno.
  Ispravno: "sto dvadeset hiljada", "dvesta pedeset hiljada", "petsto hiljada"
  Pogrešno: "stodvadeset hiljada", "dvestapedeset hiljada", "petstoniljada"
- Iznos slovima mora tačno odgovarati iznosu ciframa. Uvek proveri.
- Nikada ne računaj datume samostalno (npr. "danas + 24 meseca = datum isteka").
  Ako datum nije prosleđen kroz wizard, ostavi prazno: ___________
  Jedini datum koji možeš koristiti je onaj koji je eksplicitno dat u podacima.
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne ponavljaj naslov dokumenta u uvodnoj formuli. Umesto "zaključuju dana ___ ovaj UGOVOR O DELU" piši samo "zaključuju dana ___________ godine sledeći ugovor:"
- Ne izmišljaš podatke - označi sa [POPUNITI: naziv podatka]
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne daješ pravne ni poreske savete van okvira dokumenta
- Ne garantuješ poresku ispravnost u specifičnim slučajevima
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski
- DATUM ZAKLJUČIVANJA I DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum zaključivanja u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum zaključivanja (npr. 'zaključen dana...') piše: 'zaključen dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - JEDINI datum koji se generiše iz wizard inputa je datum stupanja na snagu / početka / rok isporuke — jer ga korisnik eksplicitno unosi.
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.
- Ne generiši klauzulu "objavljivanje pod imenom trećeg lica" — pravo atribucije (navođenja autora) je moralno pravo autora koje je neprenosivo i ne može se ugovorom oduzeti po ZASP-u čl. 19–20. Umesto toga generiši: "Naručilac nije dužan da navodi ime Izvođača pri korišćenju rezultata rada, osim ako je to posebno ugovoreno."
- Ne koristi generičku formulaciju "sva autorska prava" bez navođenja obima prava, isključivosti, teritorije, trajanja i momenta prenosa.`

export function buildUserMessage(data: UgovorODeluData): string {
  const fazno = data.fazno ? `Da - ${data.opis_faza ?? '[POPUNITI: opis faza]'}` : 'Ne'
  const avans = data.avans ?? 0
  const nda = data.nda ? `Da (${data.trajanje_nda ?? 24} meseci)` : 'Ne'
  const zabrana = data.zabrana ? 'Da' : 'Ne'
  const brojUgovora = data.broj_ugovora?.trim() || 'bez broja'
  const tipPrihoda = data.tip_prihoda === 'autorsko_delo'
    ? 'Autorsko delo (originalan kreativni rad)'
    : 'Ugovor o delu (usluge, izrada, konsalting)'
  const ugovornaKazna = data.ugovorna_kazna
    ? `Da — ${data.iznos_kazne_dnevno?.toLocaleString('sr-RS') ?? '[POPUNITI: dnevna kazna]'} RSD/dan`
    : 'Ne'
  const narucilacIdentifikatorLabel = data.tip_narucioca === 'Fizičko lice' ? 'JMBG' : 'PIB'
  const narucilacIdentifikatorVrednost = data.pib_narucioca ?? `[POPUNITI: ${narucilacIdentifikatorLabel.toLowerCase()} naručioca]`
  const narucilacBrojLk = data.tip_narucioca === 'Fizičko lice'
    ? `\n- Broj lične karte: ${data.broj_lk_narucioca ?? '[opciono]'}` 
    : ''
  const scenarioNapomena = data.tip_izvodjaca === 'Fizičko lice (bez firme)'
    ? (data.tip_narucioca === 'Fizičko lice'
      ? '\n- Poreska napomena: U članu o poreskom tretmanu obavezno navedi registraciju naručioca kao isplatioca prihoda pre isplate i preporuku konsultacije sa poreskim savetnikom.'
      : '\n- Poreska napomena: U članu o poreskom tretmanu primeni isti režim kao za fizičko lice bez firme, prema izabranom tipu prihoda.')
    : '\n- Fakturisanje i PDV: U članu o naknadi navedi da rok plaćanja teče od prijema fakture i da se PDV plaća samo ako je Izvođač PDV obveznik.'

  return `Molim te generiši Ugovor o delu sa sledećim podacima:

NARUČILAC:
- Broj ugovora: ${brojUgovora}
- Tip: ${data.tip_narucioca}
- Naziv/Ime: ${data.naziv_narucioca}
- ${narucilacIdentifikatorLabel}: ${narucilacIdentifikatorVrednost}${narucilacBrojLk}
- Adresa: ${data.adresa_narucioca}
- Zastupnik: ${data.zastupnik_narucioca ?? '[POPUNITI: zastupnik naručioca]'}

IZVOĐAČ:
- Tip: ${data.tip_izvodjaca}
- Ime/Naziv: ${data.naziv_izvodjaca}${data.tip_izvodjaca === 'Fizičko lice (bez firme)' ? getVokativHint(data.naziv_izvodjaca) : ''}
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
- Tip prihoda: ${tipPrihoda}
- Neto iznos naknade: ${data.iznos.toLocaleString('sr-RS')} RSD
- Način isplate: ${data.nacin_isplate}
- Avans: ${avans > 0 ? `${avans}% = ${Math.round(data.iznos * avans / 100).toLocaleString('sr-RS')} RSD od neto iznosa` : 'Ne'}
- Rok plaćanja: ${data.rok_placanja} dana${data.tip_izvodjaca === 'Fizičko lice (bez firme)' ? ' od isporuke' : ' od prijema fakture'}${scenarioNapomena}

DODATNO:
- Vlasništvo nad rezultatom: ${data.vlasnistvo}
- NDA: ${nda}
- Zabrana konkurencije: ${zabrana}
- Ugovorna kazna: ${ugovornaKazna}
- Garancijski rok: ${data.garantni_rok ?? 30} dana
- Napomene: ${data.napomene ?? '[nema]'}

Svi podaci su u nominativu. Dekliniraš sva lična imena i nazive firmi ispravno. Odredi scenario (A, B ili C) i primeni odgovarajući poreski tretman.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'narucilac',
    title: 'Naručilac',
    fields: [
      {
        id: 'broj_ugovora',
        label: 'Broj ugovora',
        type: 'text',
        required: false,
        placeholder: 'npr. 001/2026',
        helperText: 'Ostavite prazno ako ne želite broj',
        tooltip: 'Interni broj ugovora za vašu evidenciju. Ako ostavite prazno, ugovor neće imati broj.',
      },
      {
        id: 'tip_narucioca',
        label: 'Tip naručioca',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Firma', label: 'Firma' },
          { value: 'Preduzetnik', label: 'Preduzetnik' },
          { value: 'Fizičko lice', label: 'Fizičko lice' },
        ],
      },
      { id: 'naziv_narucioca', label: 'Naziv / Ime i prezime', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme ili ime i prezime naručioca' },
      {
        id: 'pib_narucioca',
        label: 'PIB / JMBG naručioca',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_narucioca',
          values: {
            'Firma': { label: 'PIB naručioca', helperText: '9 cifara', tooltip: 'PIB je obavezan kada je naručilac firma.' },
            'Preduzetnik': { label: 'PIB naručioca', helperText: '9 cifara', tooltip: 'PIB je obavezan kada je naručilac preduzetnik.' },
            'Fizičko lice': { label: 'JMBG naručioca', helperText: '13 cifara sa lične karte', tooltip: 'Za fizičko lice kao naručioca unosi se JMBG umesto PIB-a.' },
          },
        },
      },
      { id: 'broj_lk_narucioca', label: 'Broj lične karte naručioca', type: 'text', required: false, conditional: { field: 'tip_narucioca', value: 'Fizičko lice' }, placeholder: 'npr. 012345678', helperText: 'Opciono — samo kada je naručilac fizičko lice' },
      { id: 'adresa_narucioca', label: 'Adresa sedišta / stanovanja', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta firme ili adresa stanovanja' },
      { id: 'zastupnik_narucioca', label: 'Zastupnik - ime i funkcija (ako je firma)', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija osobe koja potpisuje ugovor u ime firme' },
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
        tooltip: 'Važno za poreski tretman:\n• Fizičko lice — naručilac plaća porez pre isplate\n• Preduzetnik/firma — izvođač sam plaća porez, izdaje fakturu',
        options: [
          { value: 'Fizičko lice (bez firme)', label: 'Fizičko lice (bez firme)' },
          { value: 'Preduzetnik-paušalac', label: 'Preduzetnik-paušalac' },
          { value: 'Firma doo', label: 'Firma doo' },
        ],
      },
      { id: 'naziv_izvodjaca', label: 'Ime i prezime / Naziv firme', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime izvođača ili naziv firme' },
      {
        id: 'jmbg_pib_izvodjaca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_izvodjaca',
          values: {
            'Fizičko lice (bez firme)': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Preduzetnik-paušalac': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
            'Firma doo': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_izvodjaca', label: 'Adresa stanovanja / sedišta', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta izvođača' },
      { id: 'racun_izvodjaca', label: 'Broj tekućeg računa za isplatu', type: 'text', required: false, placeholder: 'npr. 160-123456-33', helperText: 'Broj tekućeg računa u banci' },
    ],
  },
  {
    id: 'predmet',
    title: 'Predmet ugovora',
    fields: [
      {
        id: 'naziv_dela',
        label: 'Naziv dela / usluge',
        type: 'text',
        required: true,
        placeholder: 'npr. Izrada web sajta',
        helperText: 'npr. Izrada web sajta, Grafički dizajn',
        tooltip: 'Kratak naziv dela/usluge koja se izvodi.',
      },
      {
        id: 'opis_dela',
        label: 'Detaljan opis dela',
        type: 'textarea',
        required: true,
        placeholder: 'npr. Potrebno je izraditi prezentacioni sajt sa 5 strana i kontakt formom.',
        helperText: 'Opišite šta tačno treba uraditi',
        tooltip: 'Što precizniji opis smanjuje nesporazume. Navedite šta je uključeno i šta nije.',
      },
      {
        id: 'rezultat',
        label: 'Merljivi rezultat / isporuka',
        type: 'text',
        required: true,
        placeholder: 'npr. Funkcionalan sajt',
        helperText: 'npr. Funkcionalan sajt, Dizajn logotipa',
        tooltip: 'Konkretan, merljiv rezultat koji izvođač isporučuje. Osnova za prihvatanje ili odbijanje dela.',
      },
      { id: 'specifikacije', label: 'Posebni zahtevi / tehničke specifikacije', type: 'textarea', required: false, placeholder: 'npr. Sajt mora biti responzivan, koristiti WordPress...', helperText: 'Tehnički zahtevi koje rezultat mora ispuniti' },
    ],
  },
  {
    id: 'rokovi',
    title: 'Rokovi',
    fields: [
      { id: 'datum_pocetka', label: 'Datum početka', type: 'date', required: true, helperText: 'Kada izvođač počinje sa radom' },
      { id: 'datum_zavrsetka', label: 'Datum završetka / isporuke', type: 'date', required: true, helperText: 'Rok za isporuku rezultata' },
      { id: 'fazno', label: 'Fazna isporuka?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Ako je posao podeljen u faze sa zasebnim rokovima i isplatama — uključite ovu opciju.' },
      { id: 'opis_faza', label: 'Opis faza i rokova', type: 'textarea', required: false, conditional: { field: 'fazno', value: true }, placeholder: 'npr. Faza 1: Dizajn do 15.7, Faza 2: Razvoj do 1.8...', helperText: 'Opišite svaku fazu i njen rok' },
    ],
  },
  {
    id: 'naknada',
    title: 'Naknada',
    fields: [
      {
        id: 'tip_prihoda',
        label: 'Tip prihoda za poreske svrhe',
        type: 'radio',
        required: true,
        tooltip: 'Određuje koji porez naručilac uplaćuje i koji PPP-PD obrazac se podnosi:\n• Autorsko delo: originalan kreativni rad (softver pisan od nule, originalan grafički dizajn, književni/muzički rad). Normiran trošak 43% ili 34%.\n• Ugovor o delu: sve ostalo — usluge, montaža, izrada po predlošku, konsalting. Normiran trošak 20%.\nAko niste sigurni, konsultujte računovođu.',
        options: [
          { value: 'autorsko_delo', label: 'Autorsko delo (originalan kreativni rad)' },
          { value: 'ugovor_o_delu', label: 'Ugovor o delu (usluge, izrada, konsalting)' },
        ],
      },
      {
        id: 'iznos',
        label: 'Neto iznos naknade (RSD)',
        type: 'number',
        required: true,
        min: 1,
        helperText: 'Iznos koji izvođač prima na račun',
        tooltip: 'Unesite neto iznos koji izvođač prima. Ako je izvođač fizičko lice bez firme, naručilac dodatno snosi porez i doprinose koji se obračunavaju na ovaj iznos. Ako je izvođač preduzetnik ili firma, osnovica za plaćanje je faktura; ako je izvođač PDV obveznik, PDV se dodaje na fakturisani iznos.',
      },
      {
        id: 'nacin_isplate',
        label: 'Način isplate',
        type: 'radio',
        required: true,
        tooltip: 'Jednokratno — ceo iznos po završetku.\nAvans + ostatak — deo unapred, ostatak po isporuci.\nPo fazama — isplata po dogovorenoj dinamici.',
        options: [
          { value: 'Jednokratno', label: 'Jednokratno' },
          { value: 'Avans + ostatak', label: 'Avans + ostatak' },
          { value: 'Po fazama', label: 'Po fazama' },
        ],
      },
      {
        id: 'avans',
        label: 'Procenat avansa (%)',
        type: 'number',
        required: false,
        min: 0,
        max: 100,
        conditional: { field: 'nacin_isplate', value: 'Avans + ostatak' },
        helperText: 'Unesite procenat od 0 do 100',
        tooltip: 'Procenat neto iznosa naknade koji se isplaćuje unapred. Na primer, 50% od neto naknade od 20.000 RSD = avans 10.000 RSD.',
      },
      {
        id: 'rok_placanja',
        label: 'Rok plaćanja po isporuci (dana)',
        type: 'number',
        required: true,
        min: 1,
        defaultValue: 15,
        helperText: 'npr. 15',
        tooltip: 'Broj dana od isporuke rezultata do isplate. Standard u Srbiji je 15-30 dana.',
      },
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
        tooltip: 'Ko poseduje rezultat rada (kod, dizajn, tekst...). Bez eksplicitnog ugovora, autor zadržava autorska prava po srpskom pravu.',
        options: [
          { value: 'Naručilac', label: 'Naručilac' },
          { value: 'Izvođač', label: 'Izvođač' },
          { value: 'Zajednička prava', label: 'Zajednička prava' },
        ],
      },
      { id: 'nda', label: 'Klauzula poverljivosti (NDA)?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Dodaje klauzulu o čuvanju poverljivih informacija u ugovor.' },
      { id: 'trajanje_nda', label: 'Trajanje NDA (meseci)', type: 'number', required: false, min: 1, conditional: { field: 'nda', value: true }, helperText: 'Preporučeno 24-36 meseci' },
      { id: 'zabrana', label: 'Zabrana konkurencije?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Zabranjuje izvođaču da radi za direktnu konkurenciju u određenom periodu.' },
      { id: 'ugovorna_kazna', label: 'Ugovorna kazna za prekoračenje roka?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Bez ugovorne kazne, naručilac mora dokazivati konkretnu štetu da bi tražio naknadu za kašnjenje. Sa kaznom, iznos je unapred definisan.' },
      { id: 'iznos_kazne_dnevno', label: 'Dnevna kazna (RSD po danu kašnjenja)', type: 'number', required: false, conditional: { field: 'ugovorna_kazna', value: true }, placeholder: 'npr. 1000', helperText: 'Uobičajeno 0.5–1% ukupne naknade po danu' },
      { id: 'garantni_rok', label: 'Garancijski rok nakon primopredaje (dani)', type: 'number', required: false, defaultValue: 30, tooltip: 'Period u kom je izvođač dužan otkloniti nedostatke bez dodatne naknade. Default: 30 dana.' },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false, placeholder: 'npr. Posebni uslovi, rokovi, napomene za drugu stranu...', helperText: 'Opciono — dodatni uslovi koji nisu obuhvaćeni ostalim poljima' },
    ],
  },
]
