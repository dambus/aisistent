import type { UgovorOZakupuData, WizardStep } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu ugovora o zakupu nepokretnosti u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima, Zakonom o stanovanju i održavanju zgrada ("Sl. glasnik RS", br. 104/2016) i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši kompletan Ugovor o zakupu na srpskom jeziku (latinica). Pre generisanja određuješ SCENARIO.

## SCENARIJI

SCENARIO A - ZAKUP STANA / STANOVANJE
→ Primenjuje se Zakon o stanovanju
→ Poreski tretman: porez 20% na 80% prihoda (~16% efektivno)
→ Obavezno: popis nameštaja, depozit, komunalije, prijava boravišta
→ Preporučiti: overa kod javnog beležnika, prijava poreskoj upravi u roku 30 dana

SCENARIO B - ZAKUP POSLOVNOG PROSTORA
→ Zakon o obligacionim odnosima - veća sloboda ugovaranja
→ Obavezno: namena prostora, adaptacije, komunalije, PDV tretman
→ Preporučiti: uknjižba zakupa ako duže od godinu dana

SCENARIO C - KRATKOROČNI ZAKUP (do 30 dana)
→ Kraća forma dokumenta
→ Obavezno: identifikacija gosta (ime, prezime, JMBG/br. pasoša), check-in i check-out termin, ukupan iznos
→ NE generisati: depozit, prijava boravišta, zabrana životinja, kućni red, popis nameštaja
→ Poreski tretman: zakupodavac je dužan da prijavi prihod i plati porez. Ako je fizičko lice: porez 20% na 80% prihoda (~16% efektivno). Turistička taksa: zakonska obaveza, navesti ko je plaća.
→ Preporučiti u poreskim napomenama: registracija kao domaćin na eVisitor platformi ako se radi o turistički aktivnoj lokaciji

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu, članu o zakupnini i potpisima.
Sve ostalo ide kroz "Zakupodavac" i "Zakupac".

## ROD U UGOVORU O ZAKUPU

Koristi isključivo termin "Zakupac" kroz ceo dokument — i u zaglavlju i u telu i u potpisima. Ne menjaj rod čak ni kada je zakupac ženskog pola.

U zaglavlju pri definisanju strana:
"Ana Marković... (u daljem tekstu: Zakupac)"

U telu: uvek "Zakupac", "Zakupodavac". Ne koristiti "Zakupnica" ni "Zakupodavačica".

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI (svi scenariji)

1. Identifikacija zakupodavca i zakupca
2. Opis nepokretnosti - adresa, kvadratura, sprat, struktura
3. Svrha zakupa
4. Trajanje i datum početka
5. Iznos zakupnine i rok plaćanja
6. Depozit (ako se ugovara)
7. Komunalije - ko plaća šta
8. Stanje pri primopredaji
9. Obaveze održavanja
10. Zabrana podzakupa
11. Uslovi raskida i otkazni rok
12. Poreski tretman - napomena
13. Potpisi i primopredajni zapisnik

## DODATNI ELEMENTI ZA SCENARIO A

- Popis nameštaja i opreme (prilog)
- Depozit: iznos, uslovi i rok vraćanja (max 30 dana)
- Zabrana životinja (ako se ugovara)
- Broj lica koja stanuju
- Saglasnost za prijavu boravišta
- Kućni red zgrade

## DODATNI ELEMENTI ZA SCENARIO B

- Tačna namena i zabrana promene bez saglasnosti
- Ko vrši adaptacije i ko finansira
- Tabla/natpis firme - pravo i uslovi
- PDV tretman zakupnine
- Pravo preče kupovine (ako se ugovara)
- Indeksacija zakupnine
- Indeksacija zakupnine: generiši član prema izboru korisnika:
  • 'bez': nema indeksacije, zakupnina je fiksna
  • 'eur': "Iznos zakupnine izražen je u EUR, a plaća se u dinarima po prodajnom kursu NBS na dan plaćanja."
  • 'inflacija': "Zakupnina se usklađuje godišnje prema zvaničnom indeksu potrošačkih cena koji objavljuje RZS, počev od druge godine zakupa."
- Pravo preče kupovine: ako true, generiši poseban član: "U slučaju da Zakupodavac odluči da proda predmetnu nepokretnost, Zakupac ima pravo preče kupovine pod istim uslovima koji su ponuđeni trećim licima. Zakupodavac je dužan da Zakupca pisano obavesti o nameri prodaje i uslovima, a Zakupac je dužan da se izjasni u roku od 15 dana."
- Tabla/natpis: ako true, generiši član o pravu postavljanja table uz uslov saglasnosti zakupodavca za lokaciju i dimenzije.
- Podela održavanja mora biti precizna: generiši napomenu u članu o obavezama da "tekuće popravke" obuhvataju: zamenu sijalica, slavina, brava, kvaka, manjih obloga i slično; dok "investiciono održavanje" obuhvata: krov, fasadu, noseće konstrukcije, glavne instalacije (struja, voda, grejanje), lift.

## FORMAT IZLAZA

UGOVOR O ZAKUPU NEPOKRETNOSTI
Broj: {broj_ugovora ako postoji; ako je 'bez broja', ne prikazuj red 'Broj:'}
Datum: ___________

I.    UGOVORNE STRANE
II.   PREDMET ZAKUPA
III.  TRAJANJE ZAKUPA
IV.   ZAKUPNINA I NAČIN PLAĆANJA
V.    DEPOZIT
VI.   KOMUNALIJE I REŽIJSKI TROŠKOVI
VII.  STANJE NEPOKRETNOSTI I PRIMOPREDAJA
VIII. OBAVEZE ZAKUPCA
IX.   OBAVEZE ZAKUPODAVCA
X.    ZABRANA PODZAKUPA
XI.   RASKID UGOVORA I OTKAZNI ROK
XII.  PORESKE NAPOMENE
XIII. ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## TON I STIL

- Formalan pravni jezik | Koristi ISKLJUČIVO latinicu kroz ceo dokument. Ako primetiš ćirilične karaktere, zameni ih latiničnim ekvivalentom. Posebno pazi na: č, ć, š, đ, ž.
- "Zakupodavac" i "Zakupac" kroz ceo dokument
- Zakupninu iskazati i u EUR ako je indeksirana: "iznos u RSD koji odgovara vrednosti X EUR po kursu NBS na dan plaćanja"
- Novčane iznose pisati i slovima kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada. EUR primeri: 300 EUR → tristotine (300,00) evra | 500 EUR → petsto (500,00) evra.

## OPCIONI ELEMENTI

Generiši sledeće sekcije SAMO ako je vrednost true:

POPIS NAMEŠTAJA:
- Ako true: navedi "kao u Prilogu 1 — Popis nameštaja i opreme" bez generisanja samog popisa
- Ako false (Ne — stan se preuzima u viđenom stanju): napiši "Stan se preuzima u viđenom stanju, bez posebnog popisa nameštaja i opreme."

ZABRANA ŽIVOTINJA:
- Sekciju o zabrani kućnih ljubimaca generiši SAMO za Scenario A (stambeni zakup). Za Scenario B i C ovu sekciju izostaviti.
- Ako true: uključi klauzulu o zabrani držanja kućnih ljubimaca bez pisane saglasnosti zakupodavca
- Ako false: ne generiši ovaj član

ZABRANA PODZAKUPA:
- Ako true: uključi klauzulu koja zabranjuje podzakup bez pisane saglasnosti zakupodavca
- Ako false: ne generiši ovaj član

KOMUNALNA TAKSA:
- Ako je vrednost "Ne primenjuje se": ne generiši član o komunalnoj taksi. Komunalna taksa za isticanje firme ne primenjuje se na stambeni zakup fizičkog lica.

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
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne daješ savete o tržišnoj vrednosti zakupa
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski
- NIKADA ne navodi SCENARIO A, SCENARIO B ili SCENARIO C u generisanom dokumentu — ovo su interne instrukcije za tebe, ne deo dokumenta
- Ne generiši sekciju PRILOZI kao deo ugovora. Ako se pominje popis nameštaja, navedi samo "kao u Prilogu 1" bez generisanja samog popisa.
- Ako je broj_ugovora 'bez broja' ili prazan, ne generiši redak 'Broj:' u zaglavlju.
- DATUM ZAKLJUČIVANJA I DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum zaključivanja u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum zaključivanja (npr. 'zaključen dana...') piše: 'zaključen dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - JEDINI datum koji se generiše iz wizard inputa je datum početka zakupa / datum isteka — jer ga korisnik eksplicitno unosi.
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.
- Nikada ne ostavljaj placeholder [ne uključuje / uključuje] — uvek koristi PDV podatak koji je prosleđen
- Ako Zakupodavac nije u sistemu PDV-a: ne pominjati PDV u odredbama o zakupnini, ali dodati napomenu o porezu po odbitku u sekciji Poreske napomene
- Ako Zakupodavac jeste u sistemu PDV-a: jasno naznačiti da zakupnina ne/uključuje PDV u članu o zakupnini`

export function buildUserMessage(data: UgovorOZakupuData): string {
  const depozit = data.deponija ? `Da (${data.iznos_deponije ?? '[POPUNITI: iznos depozita]'} mesečnih zakupnina)` : 'Ne'
  const brojUgovora = data.broj_ugovora?.trim() ? data.broj_ugovora.trim() : 'bez broja'

  const komunalnaTaksaText = (() => {
    const val = data.komunalna_taksa
    if (!val || val === 'Ne primenjuje se') {
      return data.tip_zakupa === 'Stambeni'
        ? 'Ne primenjuje se (stambeni zakup fizičkog lica)'
        : 'Ne primenjuje se'
    }
    return val
  })()

  const popisNamestajaText = data.popis_namestaja
    ? 'Da — dodati napomenu o Prilogu 1'
    : 'Ne — stan se preuzima u viđenom stanju'
  const datumZakljucivanja = data.datum_zakljucivanja
    ? data.datum_zakljucivanja
    : '[POPUNITI: datum zaključivanja]'

  return `Molim te generiši Ugovor o zakupu sa sledećim podacima:

BROJ UGOVORA: ${brojUgovora}
TIP ZAKUPA: ${data.tip_zakupa} | UKNJIŽENA: ${data.uknjizena ? 'Da' : 'Ne'}
DATUM ZAKLJUČIVANJA: ${datumZakljucivanja}

ZAKUPODAVAC:
- Tip: ${data.tip_zakupodavca} | Naziv/Ime: ${data.naziv_zakupodavca}
- JMBG/PIB: ${data.jmbg_pib_zakupodavca} | Adresa: ${data.adresa_zakupodavca}
- Zastupnik: ${data.zastupnik_zakupodavca ?? '[POPUNITI: zastupnik zakupodavca]'}

ZAKUPAC:
- Tip: ${data.tip_zakupca} | Naziv/Ime: ${data.naziv_zakupca}
- JMBG/PIB: ${data.jmbg_pib_zakupca} | Adresa: ${data.adresa_zakupca}
- Zastupnik: ${data.zastupnik_zakupca ?? '[POPUNITI: zastupnik zakupca]'}

NEPOKRETNOST:
- Adresa: ${data.adresa_nepokretnosti} | Kvadratura: ${data.kvadratura} m²
- Sprat: ${data.sprat} | Struktura: ${data.struktura}
- List nepokretnosti: ${data.list_nepokretnosti ?? '[nema]'} | Stanje: ${data.stanje ?? '[POPUNITI: stanje]'}

TRAJANJE:
- Početak zakupa: ${data.datum_pocetka ?? '[POPUNITI: datum početka]'} | Tip: ${data.tip_trajanja}
- Istek: ${data.datum_isteka ?? '[nema]'} | Otkazni rok: ${data.otkazni_rok} meseci

ZAKUPNINA:
- Iznos: ${data.iznos.toLocaleString('sr-RS')} ${data.valuta} | Dan plaćanja: ${data.dan_placanja}. u mesecu
- Način: ${data.nacin_placanja}
- Indeksacija zakupnine: ${data.indeksacija_zakupnine ?? 'bez'}
- PDV tretman: ${(() => {
  if (data.tip_zakupa !== 'Poslovni') {
    return 'Stambeni zakup — PDV se ne obračunava (oslobođenje po članu 25. Zakona o PDV)'
  }
  if (data.pdv_obveznik) {
    return 'Zakupodavac JE u sistemu PDV-a — zakupnina za poslovni prostor podleže PDV-u po stopi 20%. Zakupodavac izdaje PDV račun.'
  }
  return 'Zakupodavac NIJE u sistemu PDV-a (fizičko lice, paušalac ili firma van sistema PDV-a) — PDV se ne obračunava. NAPOMENA: Ako je zakupac firma ili preduzetnik, ima zakonsku obavezu da obračuna i plati porez po odbitku po stopi od ~16% na ime zakupodavca, i da podnese poresku prijavu PPP-PD.'
})()}
- Depozit: ${depozit}

TROŠKOVI I USLOVI:
- Komunalije (struja/voda/gas): ${data.komunalije}
- Internet/kablovska: ${data.internet}
- Komunalna taksa: ${komunalnaTaksaText}
- Adaptacije/rekonstrukcija: ${typeof data.adaptacije === 'boolean' ? (data.adaptacije ? 'Da (dogovoreno)' : 'Ne (zabranjeno bez saglasnosti)') : '[nije definisano]'}
- Prijava boravišta: ${typeof data.prijava_boravista === 'boolean' ? (data.prijava_boravista ? 'Da' : 'Ne') : '[nije definisano]'}
- Broj stanara: ${data.broj_stanara ?? '[nije navedeno]'}
- Popis nameštaja: ${popisNamestajaText}
- Zabrana životinja: ${data.zabrana_zivotinja ? 'Da' : 'Ne'}
- Zabrana podzakupa: ${data.zabrana_podzakupa ? 'Da' : 'Ne'}
- Pravo preče kupovine: ${data.pravo_prece_kupovine ? 'da' : 'ne'}
- Tabla/natpis firme: ${data.tabla_natpis ? 'da' : 'ne'}
- Broj gostiju: ${data.broj_gostiju ?? '[nije navedeno]'}
- Check-in: ${data.datum_checkin ?? '[POPUNITI]'}
- Check-out: ${data.datum_checkout ?? '[POPUNITI]'}
- Turistička taksa uključena: ${data.turisticka_taksa ? 'da' : 'ne'}
- Napomene: ${data.napomene ?? '[nema]'}

Svi podaci su u nominativu. Dekliniraš ispravno. Odredi scenario (A, B ili C).`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'tip_zakupa',
    title: 'Tip zakupa',
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
        id: 'tip_zakupa',
        label: 'Tip zakupa',
        type: 'radio',
        required: true,
        tooltip: 'Stambeni — za stanovanje fizičkog lica. Primenjuje se Zakon o stanovanju.\nPoslovni — za obavljanje delatnosti firme ili preduzetnika. Veća sloboda ugovaranja.\nKratkoročni — do 30 dana, turistički zakup.',
        options: [
          { value: 'Stambeni', label: 'Stambeni' },
          { value: 'Poslovni', label: 'Poslovni' },
          { value: 'Kratkoročni', label: 'Kratkoročni' },
        ],
      },
      {
        id: 'datum_zakljucivanja',
        label: 'Datum zaključivanja ugovora',
        type: 'date',
        required: false,
        helperText: 'Ostavite prazno ako datum još nije poznat',
        tooltip: 'Datum kada se ugovor potpisuje. Možete ga ostaviti prazno i ručno upisati datum pre štampanja.',
      },
      { id: 'uknjizena', label: 'Uknjižena nepokretnost?', type: 'toggle', required: true, defaultValue: true, tooltip: 'Uknjižena nepokretnost ima čist vlasnički list u katastru. Zakup neuknjižene nepokretnosti nosi pravne rizike — preporučujemo konsultaciju sa pravnikom.' },
    ],
  },
  {
    id: 'zakupodavac',
    title: 'Zakupodavac',
    fields: [
      {
        id: 'tip_zakupodavca',
        label: 'Tip',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_zakupodavca', label: 'Ime i prezime / Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime zakupodavca ili naziv firme' },
      {
        id: 'jmbg_pib_zakupodavca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_zakupodavca',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_zakupodavca', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta zakupodavca' },
      { id: 'zastupnik_zakupodavca', label: 'Zastupnik (ako je firma)', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija osobe koja zastupa zakupodavca' },
      {
        id: 'pdv_obveznik',
        label: 'Zakupodavac je u sistemu PDV-a?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Označite samo ako Zakupodavac ima PIB i PDV broj i izdaje PDV račune. Fizička lica i paušalci NISU u sistemu PDV-a.',
        tooltip: 'Ako je Zakupodavac fizičko lice ili paušalac: nema PDV-a, ali zakupac ima obavezu da plati porez po odbitku (~16%) na ime zakupodavca.\n\nAko je Zakupodavac firma/preduzetnik knjigaš u sistemu PDV-a: zakupnina za poslovni prostor se uvećava za PDV 20%.\n\nZa stambeni prostor: PDV se ne obračunava ni u jednom slučaju.',
        conditional: { field: 'tip_zakupa', value: 'Poslovni' },
      },
    ],
  },
  {
    id: 'zakupac',
    title: 'Zakupac',
    fields: [
      {
        id: 'tip_zakupca',
        label: 'Tip',
        type: 'radio',
        required: true,
        tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.',
        options: [
          { value: 'Fizičko lice', label: 'Fizičko lice' },
          { value: 'Firma', label: 'Firma' },
        ],
      },
      { id: 'naziv_zakupca', label: 'Ime i prezime / Naziv', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime zakupca ili naziv firme' },
      {
        id: 'jmbg_pib_zakupca',
        label: 'JMBG / PIB',
        type: 'text',
        required: true,
        placeholder: '123456789',
        dynamicConfig: {
          watchField: 'tip_zakupca',
          values: {
            'Fizičko lice': { label: 'JMBG', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za ugovore sa fizičkim licima. Nalazi se na ličnoj karti.' },
            'Firma': { label: 'PIB', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB možete pronaći na sajtu Poreske uprave ili rešenju o registraciji.' },
          },
        },
      },
      { id: 'adresa_zakupca', label: 'Adresa', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta zakupca' },
      { id: 'zastupnik_zakupca', label: 'Zastupnik (ako je firma)', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija osobe koja zastupa zakupca' },
    ],
  },
  {
    id: 'nepokretnost',
    title: 'Nepokretnost',
    fields: [
      { id: 'adresa_nepokretnosti', label: 'Adresa nepokretnosti', type: 'text', required: true, placeholder: 'npr. Bulevar Oslobođenja 5, stan 12, Novi Sad', helperText: 'Puna adresa stana ili poslovnog prostora' },
      { id: 'kvadratura', label: 'Kvadratura (m²)', type: 'number', required: true, min: 1, helperText: 'Površina u kvadratnim metrima' },
      { id: 'sprat', label: 'Sprat / ukupno spratova', type: 'text', required: true, placeholder: 'npr. 3/5', helperText: 'Navedite sprat i ukupan broj spratova ako je poznat' },
      {
        id: 'struktura',
        label: 'Struktura',
        type: 'text',
        required: true,
        placeholder: 'npr. jednosoban stan, namešten',
        helperText: 'npr. garsonjera, jednosoban, dvosoban...',
        tooltip: 'Opišite strukturu nekretnine:\n• Garsonjera — jedna prostorija sa kupatilom\n• Jednosoban stan — dnevna soba + spavaća + kupatilo\n• Dvosoban stan — dnevna soba + 2 sobe + kupatilo\n• Poslovni prostor — navedite namenu (kancelarija, lokal...)\nMožete dodati i stanje: namešten, polunamešten, prazan.',
      },
      { id: 'list_nepokretnosti', label: 'Broj lista nepokretnosti', type: 'text', required: false, placeholder: 'npr. 12345 KO Novi Sad', helperText: 'Broj lista iz katastra (opciono)' },
      {
        id: 'stanje',
        label: 'Stanje',
        type: 'radio',
        required: false,
        tooltip: 'Namešten — sa svim nameštajem i aparatima.\nPolunamešten — delimično opremljen.\nNenamešten — prazan prostor.',
        options: [
          { value: 'Namešten', label: 'Namešten' },
          { value: 'Polunamešten', label: 'Polunamešten' },
          { value: 'Nenamešten', label: 'Nenamešten' },
        ],
      },
      {
        id: 'broj_stanara',
        label: 'Broj lica koja stanuju',
        type: 'number',
        required: false,
        conditional: { field: 'tip_zakupa', value: 'Stambeni' },
        min: 1,
        defaultValue: 1,
        helperText: 'Ugovor će navesti maksimalan broj lica koja mogu koristiti stan',
        tooltip: 'Zakupodavac ima pravo da ograniči broj stanara. Prekoračenje broja može biti osnov za raskid ugovora.',
      },
    ],
  },
  {
    id: 'trajanje',
    title: 'Trajanje',
    fields: [
      { id: 'datum_pocetka', label: 'Datum početka', type: 'date', required: true, helperText: 'Kada zakupac uselje ili počinje da koristi prostor' },
      {
        id: 'tip_trajanja',
        label: 'Tip trajanja',
        type: 'radio',
        required: true,
        tooltip: 'Određeno vreme — ugovor ističe na dogovoreni datum.\nNeodređeno vreme — traje dok jedna strana ne otkaže.',
        options: [
          { value: 'Određeno', label: 'Određeno' },
          { value: 'Neodređeno', label: 'Neodređeno' },
        ],
      },
      { id: 'datum_isteka', label: 'Datum isteka', type: 'date', required: false, conditional: { field: 'tip_trajanja', value: 'Određeno' }, helperText: 'Datum kada ugovor ističe' },
      { id: 'otkazni_rok', label: 'Otkazni rok (meseci)', type: 'number', required: true, min: 1, defaultValue: 1, helperText: 'Broj meseci otkaznog roka (standardno 1-3)' },
    ],
  },
  {
    id: 'zakupnina',
    title: 'Zakupnina i depozit',
    fields: [
      { id: 'iznos', label: 'Iznos zakupnine', type: 'number', required: true, min: 1, helperText: 'Mesečni iznos zakupnine' },
      {
        id: 'valuta',
        label: 'Valuta',
        type: 'radio',
        required: true,
        tooltip: 'U Srbiji je legalno ugovoriti zakupninu u evrima koja se plaća u dinarima po kursu NBS na dan plaćanja. Ovo štiti zakupodavca od inflacije.',
        options: [
          { value: 'RSD', label: 'RSD' },
          { value: 'EUR (plaća se u RSD po kursu NBS)', label: 'EUR (plaća se u RSD po kursu NBS)' },
        ],
      },
      { id: 'dan_placanja', label: 'Dan plaćanja u mesecu', type: 'number', required: true, min: 1, max: 31, defaultValue: 1, helperText: 'Dan u mesecu do kojeg se plaća zakupnina (npr. 1 ili 15)' },
      {
        id: 'nacin_placanja',
        label: 'Način plaćanja',
        type: 'radio',
        required: true,
        tooltip: 'Na račun — bankarski transfer.\nGotovina — gotovinska isplata uz priznanicu.',
        options: [
          { value: 'Na račun', label: 'Na račun' },
          { value: 'Gotovina', label: 'Gotovina' },
        ],
      },
      {
        id: 'pdv_zakupnina',
        label: 'PDV tretman zakupnine',
        type: 'radio',
        required: true,
        tooltip: 'Važno za poslovne zakupe. Ako zakupodavac nije u sistemu PDV-a, zakupnina je bez PDV-a. Ako jeste, navodi se da li iznos uključuje ili ne uključuje PDV.',
        options: [
          { value: 'nije_u_sistemu', label: 'Zakupodavac nije u sistemu PDV-a' },
          { value: 'ukljucuje', label: 'Zakupnina uključuje PDV' },
          { value: 'ne_ukljucuje', label: 'Zakupnina ne uključuje PDV' },
        ],
        defaultValue: 'nije_u_sistemu',
        conditional: { field: 'tip_zakupa', value: 'Poslovni' },
      },
      {
        id: 'indeksacija_zakupnine',
        label: 'Indeksacija zakupnine?',
        type: 'radio',
        required: false,
        conditional: { field: 'tip_zakupa', value: 'Poslovni' },
        defaultValue: 'bez',
        tooltip: 'Bez indeksacije, realna vrednost zakupnine pada sa inflacijom. EUR indeksacija štiti zakupodavca ali je zakonski dozvoljena samo uz plaćanje u dinarima po kursu NBS.',
        options: [
          { value: 'bez', label: 'Bez indeksacije' },
          { value: 'eur', label: 'Vezano za EUR (plaća se u RSD po kursu NBS)' },
          { value: 'inflacija', label: 'Vezano za zvanični indeks inflacije RZS' },
        ],
      },
      {
        id: 'pravo_prece_kupovine',
        label: 'Pravo preče kupovine?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        conditional: { field: 'tip_zakupa', value: 'Poslovni' },
        tooltip: 'Ako zakupodavac odluči da proda nepokretnost, zakupac ima pravo da je kupi pod istim uslovima pre trećih lica. Korisno za zakupce koji planiraju dugoročno poslovanje na lokaciji.',
      },
      {
        id: 'tabla_natpis',
        label: 'Pravo na tablu / natpis firme?',
        type: 'toggle',
        required: false,
        defaultValue: true,
        conditional: { field: 'tip_zakupa', value: 'Poslovni' },
        tooltip: 'Da li zakupac ima pravo da postavi tablu ili natpis firme na fasadi ili ulazu zgrade. Preporučuje se da se ugovori unapred da bi se izbegao spor sa upravnikom zgrade.',
      },
      { id: 'deponija', label: 'Depozit?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Depozit koji zakupac plaća unapred kao obezbeđenje. Vraća se po isteku zakupa ako nema štete. Standard je 1-2 mesečne zakupnine. Zakon ne propisuje maksimum.' },
      {
        id: 'iznos_deponije',
        label: 'Iznos depozita (mesečnih zakupnina)',
        type: 'number',
        required: false,
        min: 1,
        max: 3,
        conditional: { field: 'deponija', value: true },
        helperText: 'Broj mesečnih zakupnina (npr. 2)',
        tooltip: "Unesite BROJ mesečnih zakupnina, ne iznos u novcu. Na primer, ako je zakupnina 500 EUR i unesete '2', depozit je 1.000 EUR. Standard u Srbiji je 1-3 mesečne zakupnine.",
      },
    ],
  },
  {
    id: 'uslovi',
    title: 'Troškovi i uslovi',
    fields: [
      {
        id: 'komunalije',
        label: 'Ko plaća struju/vodu/gas?',
        type: 'radio',
        required: true,
        tooltip: 'Ko plaća mesečne režijske račune — struju, vodu, gas.',
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
          { value: 'Podeljeno', label: 'Podeljeno' },
        ],
      },
      {
        id: 'internet',
        label: 'Ko plaća internet i kablovsku?',
        type: 'radio',
        required: true,
        tooltip: 'Ko plaća internet i kablovsku televiziju.',
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
          { value: 'Nije priključeno', label: 'Nije priključeno' },
        ],
      },
      {
        id: 'komunalna_taksa',
        label: 'Ko plaća komunalnu taksu?',
        type: 'radio',
        required: false,
        helperText: 'Ko plaća komunalnu taksu za isticanje firme',
        tooltip: "Komunalna taksa za isticanje firme primenjuje se samo kada zakupac obavlja registrovanu delatnost u prostoru (poslovni zakup). Za stambeni zakup fizičkog lica — izaberite 'Ne primenjuje se'.",
        options: [
          { value: 'Zakupac', label: 'Zakupac' },
          { value: 'Zakupodavac', label: 'Zakupodavac' },
          { value: 'Ne primenjuje se', label: 'Ne primenjuje se' },
        ],
      },
      { id: 'adaptacije', label: 'Dozvola za adaptacije/rekonstrukciju?', type: 'toggle', required: false, defaultValue: false, tooltip: 'Ako zakupac planira rekonstrukciju ili adaptaciju prostora, to mora biti eksplicitno dogovoreno u ugovoru. Bez saglasnosti zakupodavca, zakupac nema pravo na promene i mora vratiti prostor u prvobitno stanje.' },
      { id: 'prijava_boravista', label: 'Saglasnost za prijavu boravišta?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Saglasnost zakupodavca da zakupac može prijaviti boravište na adresi stana. Potrebno za zdravstveno osiguranje i slično.' },
      {
        id: 'broj_gostiju',
        label: 'Maksimalan broj gostiju',
        type: 'number',
        required: false,
        conditional: { field: 'tip_zakupa', value: 'Kratkoročni' },
        min: 1,
        defaultValue: 2,
        helperText: 'Ugovor će navesti maksimalan broj lica',
      },
      {
        id: 'datum_checkin',
        label: 'Datum i vreme check-in',
        type: 'text',
        required: false,
        conditional: { field: 'tip_zakupa', value: 'Kratkoročni' },
        placeholder: 'npr. 01.07.2026. od 14:00',
        helperText: 'Tačan termin preuzimanja ključeva',
      },
      {
        id: 'datum_checkout',
        label: 'Datum i vreme check-out',
        type: 'text',
        required: false,
        conditional: { field: 'tip_zakupa', value: 'Kratkoročni' },
        placeholder: 'npr. 08.07.2026. do 11:00',
        helperText: 'Tačan termin predaje ključeva',
      },
      {
        id: 'turisticka_taksa',
        label: 'Turistička taksa uključena u cenu?',
        type: 'toggle',
        required: false,
        conditional: { field: 'tip_zakupa', value: 'Kratkoročni' },
        defaultValue: false,
        tooltip: 'Turistička taksa je zakonska obaveza zakupodavca za kratkoročni zakup. Mora biti naplaćena od gosta ili uključena u cenu.',
      },
      { id: 'napomene', label: 'Posebne napomene', type: 'textarea', required: false, placeholder: 'npr. Posebni uslovi korišćenja prostora, primopredaja ključeva, kućni red...', helperText: 'Opciono — dodatne odredbe koje želite u ugovoru' },
    ],
  },
  {
    id: 'napredne_opcije',
    title: 'Napredne opcije',
    fields: [
      {
        id: 'popis_namestaja',
        label: 'Popis nameštaja kao prilog',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Dodaje napomenu o prilogu sa popisom nameštaja',
        tooltip: 'Ako isključite, ugovor će navesti da se stan preuzima u viđenom stanju bez posebnog popisa.',
      },
      {
        id: 'zabrana_zivotinja',
        label: 'Klauzula o zabrani životinja',
        type: 'toggle',
        required: false,
        defaultValue: false,
        conditional: { field: 'tip_zakupa', value: 'Stambeni' },
        helperText: 'Opciono — isključeno po defaultu',
        tooltip: 'Uključite ako zabranjujete držanje kućnih ljubimaca.',
      },
      {
        id: 'zabrana_podzakupa',
        label: 'Zabrana podzakupa',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Preporučuje se uključiti',
        tooltip: 'Zabranjuje zakupcu da stan dalje izdaje trećim licima bez saglasnosti zakupodavca.',
      },
    ],
  },
]
