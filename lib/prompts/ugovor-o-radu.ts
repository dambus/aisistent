import type { WizardStep, UgovorORaduData } from '@/types/wizard'

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu ugovora o radu u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o radu ("Sl. glasnik RS", br. 24/2005, 61/2005, 54/2009, 32/2013, 75/2014, 13/2017, 113/2017, 95/2018, 37/2019).

## TVOJ ZADATAK

Na osnovu podataka koje ti korisnik dostavi, generišeš kompletan, profesionalan Ugovor o radu na srpskom jeziku (latinica), koji je u skladu sa srpskim radnim pravom.

## SRPSKI JEZIK I DEKLINACIJA — KRITIČNO PRAVILO

Sve lične podatke koje korisnik unosi (ime i prezime zaposlenog, ime i prezime zastupnika, naziv firme) korisnik uvek daje u NOMINATIVU. Ti si odgovoran za ispravnu deklinaciju svakog podatka prema gramatičkom kontekstu rečenice u kojoj se taj podatak pojavljuje.

NIKADA ne kopiraj ime/naziv direktno iz inputa bez provere da li je potrebna promena padeža.

### Padeži koje koristiš i kada:

NOMINATIV (ko? šta?) — subjekat rečenice
→ "Zaposleni Petar Nikolić ima pravo na..."
→ "Poslodavac Sigma Solutions doo obavezuje se..."

GENITIV (koga? čega?) — svojina, odsustvo, opisivanje
→ "u svojstvu direktora Petra Nikolića"
→ "u ime i za račun Sigma Solutions doo-a"
→ "zarada Petra Nikolića iznosi..."

DATIV (kome? čemu?) — primalac, upućivanje
→ "Poslodavac je dužan dostaviti Petru Nikoliću..."
→ "Zaposlenom Petru Nikoliću pripada pravo na..."

AKUZATIV (koga? šta?) — direktan objekat
→ "Poslodavac angažuje Petra Nikolića na poziciji..."
→ "Ovaj ugovor obavezuje Petra Nikolića i Sigma Solutions doo"

INSTRUMENTAL (kim? čime?) — sredstvo, pratnja
→ "Ugovor zaključen između Sigma Solutions doo-a i Petra Nikolića"
→ "potpisano od strane Petra Nikolića"

LOKATIV (o kome? o čemu?) — uz predloge o, u, na, pri
→ "u predmetu: Ugovor o radu sa Petrom Nikolićem"
→ "podaci o Petru Nikoliću"

### Pravila za deklinaciju firmi (doo, ad, sp):

- Skraćenice se dekliniraju sa crticom: doo-a (gen.), doo-u (dat.)
- Naziv koji završava suglasnikom → dodaj "-a" (gen.), "-u" (dat.)
- Naziv koji završava samoglasnikom → genitiv "-e" ili nepromenjivo

### Pravila za deklinaciju ličnih imena:

MUŠKA IMENA (završavaju suglasnikom):
- Petar Nikolić → Petra Nikolića → Petru Nikoliću → Petra Nikolića
- Milan Jović → Milana Jovića → Milanu Joviću
- Stefan Đorđević → Stefana Đorđevića → Stefanu Đorđeviću

MUŠKA IMENA (završavaju na -a):
- Nikola Stanić → Nikole Stanića → Nikoli Staniću → Nikolu Stanića
- Luka Popović → Luke Popovića → Luki Popoviću → Luku Popovića

ŽENSKA IMENA (završavaju na -a):
- Ana Marković → Ane Marković → Ani Marković → Anu Marković
- Jelena Stojanović → Jelene Stojanović → Jeleni Stojanović

ŽENSKA IMENA (završavaju suglasnikom — strana):
- Carmen, Isabel → nepromenjivo u srpskom kontekstu

### Primeri ispravne vs. pogrešne upotrebe:

✅ ISPRAVNO:
"Ovaj ugovor zaključuju: SIGMA SOLUTIONS DOO Beograd (u daljem tekstu: Poslodavac), koga zastupa Petar Nikolić, direktor, i Ana Marković, JMBG: 123456789 (u daljem tekstu: Zaposlena)."
"Poslodavac se obavezuje da Ani Marković isplaćuje osnovnu zaradu..."
"Zaposlena Ana Marković preuzima obavezu čuvanja poslovne tajne..."

❌ POGREŠNO:
"Poslodavac se obavezuje da Ana Marković isplaćuje zaradu..."
"potpisano od Ana Marković"
"ugovor obavezuje Ana Marković"

## TERMINOLOGIJA KROZ CEO UGOVOR

Nakon što su strane definisane u Članu I (Ugovorne strane), kroz ostatak ugovora koristi ISKLJUČIVO termine "Zaposleni" ili "Zaposlena" i "Poslodavac".

Puno ime i prezime zaposlenog navodi se SAMO u:
- Članu I (Ugovorne strane) — pri prvom definisanju strana
- Članu o zaradi — pri navođenju iznosa zarade
- Članu o otkaznom roku — ako se imenuje direktno
- Sekciji potpisa (XII)

Nigde drugde ne ponavljaj puno ime. Koristiti "Zaposleni/Zaposlena" i "Poslodavac".

## OBAVEZNI ELEMENTI UGOVORA (prema članu 33. Zakona o radu)

1. Naziv i sedište poslodavca
2. Lično ime zaposlenog, JMBG, adresa stanovanja
3. Vrsta i opis poslova
4. Mesto rada
5. Vrsta radnog odnosa (na određeno / neodređeno vreme)
6. Trajanje ugovora i osnov (ako određeno vreme)
7. Dan početka rada
8. Radno vreme (puno / nepuno / skraćeno)
9. Novčani iznos osnovne zarade
10. Elementi za utvrđivanje zarade, učinka, naknada
11. Rokovi isplate zarade
12. Trajanje godišnjeg odmora
13. Otkazni rok
14. Zabrana takmičenja (ako se ugovara)

## KONZISTENTNOST PODATAKA — KRITIČNA PROVERA

Pre nego što generišeš ugovor, proveri da li su sledeće vrednosti konzistentne. Ako nisu, generiši ugovor ali dodaj komentar [PROVERITI: opis problema] na mestu nekonzistentnosti umesto da tiho prihvatiš grešku:

- Naziv firme mora biti identičan u preambuli, zaglavlju, footeru i potpisnom delu — svako odstupanje je greška
- Adresa poslodavca i adresa mesta rada moraju biti logički konzistentne (ako se razlikuju, dodati obrazloženje u Čl. 3.)
- Datum zaključenja ugovora i datum početka rada moraju biti prisutni — ako su prazni, postavi [POPUNITI: datum]

## PRAVILA KOJIH SE MORAŠ PRIDRŽAVATI

- Osnovna zarada ne sme biti niža od minimalne zarade utvrđene od strane Vlade RS
- Ugovor na određeno vreme: max 24 meseca ukupno sa produženjima (član 37.)
- Probni rad: max 6 meseci (član 36.)
- Godišnji odmor: min 20 radnih dana (član 68.)
- Otkazni rok: min 8, max 30 dana (zaposleni); min 8 dana (poslodavac + otpremnina) — definiši odvojeno za zaposlenog i za poslodavca u zasebnim stavovima
- Prekovremeni rad: max 8 sati nedeljno (član 53.)
- Zarada se ugovara u bruto 1 iznosu (Zakon o radu, član 105). Minimalna bruto 1 zarada za 2026. godinu iznosi 84.031 RSD mesečno za puno radno vreme.
- Ugovor: min 2 primerka
- Zabrana konkurencije: OBAVEZNO ugovoriti naknadu zaposlenom za period zabrane (čl. 161. st. 2. Zakona o radu) — bez naknade klauzula je ništava. Naknada mora biti eksplicitno navedena u članu o zabrani konkurencije.
- Slovni zapis iznosa: koristiti format "sto sedamdeset šest hiljada" (reči odvojene razmacima) — uvek proveri da slovni zapis odgovara ciframa
- Opis poslova: formulacija "kao i druge poslove koje mu poslodavac poveri" mora biti ograničena na: "u okviru opisa radnog mesta i odgovarajuće stručne spreme"
- Izmena zarade: ako se uključuje pravo poslodavca na izmenu zarade, mora sadržati: minimum ne može biti niži od zakonskog minimuma, izmena se vrši pisanim aneksom uz obaveštenje minimum 15 dana unapred
- Probni rad: ako korisnik nije naveo probni rad, dodati eksplicitnu rečenicu "Probni rad se ne ugovara."
- Zaštita podataka: u Završne odredbe dodati standardni stav o zaštiti podataka o ličnosti zaposlenog u skladu sa Zakonom o zaštiti podataka o ličnosti ("Sl. glasnik RS", br. 87/2018)

## FORMAT IZLAZA

Generiši ugovor sa sledećim sekcijama:

UGOVOR O RADU
Broj: {broj_ugovora}
Datum: ___________

I.    UGOVORNE STRANE
II.   RADNO MESTO I OPIS POSLOVA
III.  VRSTA I TRAJANJE RADNOG ODNOSA
IV.   PROBNI RAD (samo ako se ugovara)
V.    RADNO VREME
VI.   ZARADA I NAKNADE
VII.  GODIŠNJI ODMOR I ODSUSTVA
VIII. OTKAZNI ROK
IX.   PRAVA I OBAVEZE
IX-A. ZAŠTITA PODATAKA O LIČNOSTI (uvek generisati)
X.    ZABRANA KONKURENCIJE (samo ako se ugovara)
XI.   ZAVRŠNE ODREDBE

Sekciju IX-A. ZAŠTITA PODATAKA O LIČNOSTI uvek generiši sa sledećim standardnim tekstom:

Poslodavac se obavezuje da obrađuje lične podatke Zaposlenog isključivo u svrhu izvršavanja prava i obaveza iz radnog odnosa, u skladu sa Zakonom o zaštiti podataka o ličnosti ("Sl. glasnik RS", br. 87/2018). Podaci se čuvaju za vreme trajanja radnog odnosa i u zakonski predviđenom roku nakon njegovog prestanka. Zaposleni ima pravo uvida, ispravke i brisanja podataka u skladu sa zakonom.

Generiši samo sekcije I–XI (uključujući IX-A). Završi sa XI. ZAVRŠNE ODREDBE.
Sekciju POTPISI I PEČATI NE generiši ni pod kojim rimskim brojem (ni X, ni XI, ni XII) — sistem je dodaje automatski.

## TON I STIL

- Formalan pravni jezik, ali razumljiv
- Koristi ISKLJUČIVO latinicu kroz ceo dokument. Ako primetiš ćirilične karaktere, zameni ih latiničnim ekvivalentom. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Koristiti "Poslodavac" i "Zaposleni/Zaposlena" kroz ceo dokument
- Pol zaposlenog određuješ automatski na osnovu imena
- Novčane iznose pisati i slovima kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada | 1.000.000 → milion. Primer: 120.000,00 (stodvadeset hiljada) dinara.
- Član o zaradi počinje sa: "Zaposleni/Zaposlena ima pravo na osnovnu bruto zaradu od..." — bez navođenja punog imena na početku
- U članu o zaradi uvek navodi BRUTO 1 iznos kao ugovorenu zaradu, u skladu sa članom 105. Zakona o radu. NIKADA ne ugovaraj neto zaradu osim ako korisnik eksplicitno ne navede da želi neto ugovaranje.

## OPCIONI ELEMENTI

Generiši sledeće sekcije SAMO ako je vrednost true:

DETALJNA PRAVA I OBAVEZE:
- Ako true: generiši opširnu sekciju IX sa listom prava i obaveza zaposlenog i poslodavca
- Ako false: preskoči sekciju IX ili je svedi na jednu rečenicu: "Prava i obaveze zaposlenog i poslodavca regulisana su Zakonom o radu."

ČUVANJE POSLOVNE TAJNE:
- Ako true: generiši poseban član o čuvanju poslovne tajne i poverljivih informacija
- Ako false: ne generiši ovaj član

## ŠTA NE RADIŠ

- Iznose slovima uvek piši razdvojeno: svaka reč posebno.
  Ispravno: "sto dvadeset hiljada", "dvesta pedeset hiljada", "petsto hiljada"
  Pogrešno: "stodvadeset hiljada", "dvestapedeset hiljada", "petstoniljada"
- Iznos slovima mora tačno odgovarati iznosu ciframa. Uvek proveri.
- Nikada ne računaj datume samostalno (npr. "danas + 24 meseca = datum isteka").
  Ako datum nije prosleđen kroz wizard, ostavi prazno: ___________
  Jedini datum koji možeš koristiti je onaj koji je eksplicitno dat u podacima.
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne izmišljaš podatke koje korisnik nije dao — označi sa [POPUNITI: naziv podatka]
- Ne daješ pravne savete van okvira dokumenta
- Ne garantuješ pravnu valjanost u specifičnim slučajevima
- Ne dodaješ napomenu / disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne dodaješ sekciju "VAŽNE NAPOMENE ZA POSLODAVCA" ili slične editorijalne komentare
- Ne koristiš "---" separatore između sekcija u dokumentu
- Ne generišeš sekciju POTPISI I PEČATI ni pod kojim rimskim brojem
- DATUM ZAKLJUČIVANJA I DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum zaključivanja u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum zaključivanja (npr. 'zaključen dana...') piše: 'zaključen dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - JEDINI datum koji se generiše iz wizard inputa je datum stupanja na snagu / početka / rok isporuke — jer ga korisnik eksplicitno unosi.
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.
- Ne prihvataj tiho kontradikciju adresa poslodavca i mesta rada — uvek postavi [PROVERITI: adresa]
- Ne koristi slovne zapise koji ne odgovaraju ciframa
- Ne generišeš klauzulu zabrane konkurencije bez naknade — ako naknada nije uneta, postavi [POPUNITI: iznos naknade za zabranu konkurencije]
- Ne ostavljaj datum zaključenja ugovora prazan bez [POPUNITI] oznake`

export function buildUserMessage(data: UgovorORaduData): string {
  const probniRad = data.probni_rad
    ? `${data.probni_rad_meseci ?? 3} meseci`
    : 'Ne ugovara se'

  const zabranaKonkurencije = data.zabrana_konkurencije
    ? `Da (${data.trajanje_zabrane ?? 12} meseci)`
    : 'Ne'

  const naknadaZabrana = data.zabrana_konkurencije
    ? `${data.naknada_zabrana?.toLocaleString('sr-RS') ?? '[POPUNITI: naknada za zabranu konkurencije]'} RSD mesečno`
    : 'Nije primenljivo'

  const brojUgovora = data.broj_ugovora?.trim() || '[POPUNITI: broj ugovora]'
  const datumZakljucivanja = data.datum_zakljucivanja
    ? data.datum_zakljucivanja
    : '[POPUNITI: datum zaključivanja]'

  return `VAŽNO: U generisanom tekstu izbegavaj reči koje počinju sa "fi" kada postoji dobar srpski ekvivalent. Umesto "finansijski" piši "novčani", umesto "fiksni" piši "određeni" ili "stalni", umesto "fizički" piši "telesni". Ako nema prikladnog ekvivalenta, zadrži originalnu reč.

Molim te generiši Ugovor o radu sa sledećim podacima:

POSLODAVAC:
- Naziv: ${data.firma}
- PIB: ${data.pib}
- Matični broj: ${data.mb}
- Adresa: ${data.adresa_firme}
- Zastupnik: ${data.zastupnik}, ${data.funkcija}
- Broj ugovora: ${brojUgovora}
- Datum zaključivanja: ${datumZakljucivanja}

ZAPOSLENI:
- Ime i prezime: ${data.ime_prezime}
- JMBG: ${data.jmbg}
- Adresa: ${data.adresa_zaposlenog}${data.broj_lk ? `\n- Broj lične karte: ${data.broj_lk}` : ''}
- Stručna sprema: ${data.sprema}

RADNO MESTO:
- Pozicija: ${data.pozicija}
- Opis poslova: ${data.opis}
- Mesto rada: ${data.mesto_rada}
- Način rada: ${data.nacin_rada}

TRAJANJE:
- Vrsta: ${data.vrsta_radnog_odnosa}
- Početak: ${data.datum_pocetka}${data.datum_isteka ? `\n- Istek: ${data.datum_isteka}` : ''}${data.osnov ? `\n- Osnov za određeno: ${data.osnov}` : ''}
- Probni rad: ${probniRad}

ZARADA:
- Osnovna bruto zarada: ${data.bruto.toLocaleString('sr-RS')} RSD
- Način isplate: ${data.nacin_isplate}
- Dan isplate: ${data.dan_isplate}. u mesecu${data.topli_obrok ? `\n- Topli obrok: ${data.topli_obrok.toLocaleString('sr-RS')} RSD` : ''}${data.prevoz ? `\n- Prevoz: ${data.prevoz}` : ''}

RADNO VREME:
- Nedeljni fond: ${data.fond_sati} sati
- Raspored: ${data.raspored}
- Godišnji odmor: ${data.godisnji_odmor} radnih dana
- Otkazni rok zaposlenog: ${data.otkazni_rok_zaposleni} dana
- Otkazni rok poslodavca: ${data.otkazni_rok_poslodavac} dana

OPCIONO:
- Zabrana konkurencije: ${zabranaKonkurencije}
- Naknada za zabranu konkurencije: ${naknadaZabrana}
- Klauzula izmene zarade: ${data.klauzula_izmene_zarade ? 'Da' : 'Ne'}
- Detaljna razrada prava i obaveza: ${data.detaljna_prava_obaveze ? 'Da' : 'Ne'}
- Klauzula o čuvanju poslovne tajne: ${data.cuvanje_poslovne_tajne ? 'Da' : 'Ne'}${data.napomene ? `\n- Napomene: ${data.napomene}` : ''}

Svi podaci su u nominativu. Molim te da sve imenice, lična imena i nazive firme dekliniraš ispravno prema gramatičkom kontekstu svake rečenice u ugovoru.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'poslodavac',
    title: 'Podaci o poslodavcu',
    fields: [
      { id: 'firma', label: 'Naziv firme / poslodavca', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'npr. Sigma Solutions doo', tooltip: 'Unesite puni naziv firme tačno kao što piše u APR registru.' },
      { id: 'pib', label: 'PIB', type: 'text', required: true, placeholder: '9-cifreni broj', helperText: '9 cifara, npr. 123456789', tooltip: 'PIB (Poreski identifikacioni broj) možete pronaći na sajtu Poreske uprave ili na rešenju o registraciji.' },
      { id: 'mb', label: 'Matični broj', type: 'text', required: true, placeholder: '8-cifreni broj', helperText: '8 cifara, npr. 12345678', tooltip: 'Matični broj dodeljuje APR pri registraciji firme. Nalazi se na izvodu iz APR registra.' },
      { id: 'adresa_firme', label: 'Adresa sedišta', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta firme iz APR registra' },
      { id: 'zastupnik', label: 'Ime i prezime zakonskog zastupnika', type: 'text', required: true, placeholder: 'npr. Petar Nikolić', helperText: 'npr. Petar Nikolić', tooltip: 'Ime i prezime osobe koja potpisuje ugovor u ime firme — najčešće direktor ili prokurista.' },
      { id: 'funkcija', label: 'Funkcija zastupnika', type: 'text', required: true, placeholder: 'npr. direktor', helperText: 'npr. direktor, prokurista' },
      { id: 'broj_ugovora', label: 'Broj ugovora (interni)', type: 'text', required: false, placeholder: 'npr. 001/2026', helperText: 'Vaš interni broj ugovora (opciono)' },
      {
        id: 'datum_zakljucivanja',
        label: 'Datum zaključivanja ugovora',
        type: 'date',
        required: false,
        helperText: 'Ostavite prazno ako datum još nije poznat',
        tooltip: 'Datum kada se ugovor potpisuje. Možete ga ostaviti prazno i ručno upisati datum pre štampanja.',
      },
    ],
  },
  {
    id: 'zaposleni',
    title: 'Podaci o zaposlenom',
    fields: [
      { id: 'ime_prezime', label: 'Ime i prezime', type: 'text', required: true, placeholder: 'npr. Ana Marković', helperText: 'Ime i prezime zaposlenog sa lične karte' },
      { id: 'jmbg', label: 'JMBG', type: 'text', required: true, placeholder: '13 cifara', helperText: '13 cifara sa lične karte', tooltip: 'JMBG je obavezan za prijavu zaposlenog na PIO fond. Nalazi se na ličnoj karti.' },
      { id: 'adresa_zaposlenog', label: 'Adresa stanovanja', type: 'text', required: true, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa prebivališta ili boravišta zaposlenog' },
      { id: 'broj_lk', label: 'Broj lične karte', type: 'text', required: false, placeholder: 'npr. 012345678', helperText: 'Opciono, ako želite da bude navedeno u ugovoru' },
      {
        id: 'sprema',
        label: 'Stepen stručne spreme',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'I — bez kvalifikacija', label: 'I — bez kvalifikacija' },
          { value: 'II — niža stručna sprema', label: 'II — niža stručna sprema' },
          { value: 'III — srednja stručna sprema', label: 'III — srednja stručna sprema' },
          { value: 'IV — srednja stručna sprema', label: 'IV — srednja stručna sprema' },
          { value: 'V — viša stručna sprema', label: 'V — viša stručna sprema' },
          { value: 'VI — visoka stručna sprema (bachelor)', label: 'VI — visoka stručna sprema (bachelor)' },
          { value: 'VII — visoka stručna sprema (master/specijalističke)', label: 'VII — visoka stručna sprema (master/specijalističke)' },
          { value: 'VIII — doktorat', label: 'VIII — doktorat' },
        ],
        tooltip: 'Odaberite stepen stručne spreme zaposlenog prema završenom nivou obrazovanja.',
      },
    ],
  },
  {
    id: 'radno_mesto',
    title: 'Radno mesto',
    fields: [
      { id: 'pozicija', label: 'Naziv radnog mesta / pozicija', type: 'text', required: true, placeholder: 'npr. Softverski inženjer', helperText: 'Zvaničan naziv radnog mesta iz ugovora' },
      { id: 'opis', label: 'Kratak opis poslova', type: 'textarea', required: true, placeholder: 'Opis posla u 2-3 rečenice...', helperText: 'Opišite glavne zadatke i odgovornosti zaposlenog' },
      { id: 'mesto_rada', label: 'Mesto rada (grad, adresa)', type: 'text', required: true, placeholder: 'npr. Beograd, Nemanjina 11', helperText: 'Adresa ili grad gde zaposleni obavlja posao' },
      {
        id: 'nacin_rada',
        label: 'Način rada',
        type: 'radio',
        required: true,
        helperText: 'Gde zaposleni fizički obavlja posao',
        tooltip: 'Na lokaciji — zaposleni radi u prostorijama firme.\nOd kuće — rad van kancelarije, full remote.\nHibridno — kombinacija kancelarije i rada od kuće.',
        options: [
          { value: 'Na lokaciji', label: 'Na lokaciji' },
          { value: 'Od kuće', label: 'Od kuće' },
          { value: 'Hibridno', label: 'Hibridno' },
        ],
      },
    ],
  },
  {
    id: 'trajanje',
    title: 'Trajanje i početak',
    fields: [
      {
        id: 'vrsta_radnog_odnosa',
        label: 'Vrsta radnog odnosa',
        type: 'radio',
        required: true,
        tooltip: 'Neodređeno vreme je standardni radni odnos bez krajnjeg datuma. Određeno vreme ima zakonska ograničenja — ukupno trajanje sa produženjima ne može biti duže od 24 meseca.',
        options: [
          { value: 'Na neodređeno vreme', label: 'Na neodređeno vreme' },
          { value: 'Na određeno vreme', label: 'Na određeno vreme' },
        ],
      },
      { id: 'datum_pocetka', label: 'Datum početka rada', type: 'date', required: true, helperText: 'Kada zaposleni počinje sa radom' },
      {
        id: 'datum_isteka',
        label: 'Datum isteka ugovora',
        type: 'date',
        required: false,
        conditional: { field: 'vrsta_radnog_odnosa', value: 'Na određeno vreme' },
        helperText: 'Datum kada ugovor na određeno vreme ističe',
      },
      {
        id: 'osnov',
        label: 'Osnov za određeno vreme',
        type: 'dropdown',
        required: false,
        conditional: { field: 'vrsta_radnog_odnosa', value: 'Na određeno vreme' },
        tooltip: 'Zakon o radu zahteva da postoji zakonski osnov za određeno vreme:\n• Zamena odsutnog — privremeno pokrivate odsutnog radnika\n• Povećanje obima — privremeno više posla\n• Sezonski poslovi — posao koji se periodično ponavlja\n• Specifičan projekat — posao vezan za konkretan projekat',
        options: [
          { value: 'zamena odsutnog radnika', label: 'Zamena odsutnog radnika' },
          { value: 'privremeno povećanje obima posla', label: 'Privremeno povećanje obima posla' },
          { value: 'sezonski poslovi', label: 'Sezonski poslovi' },
          { value: 'rad na specifičnom projektu', label: 'Rad na specifičnom projektu' },
        ],
      },
      {
        id: 'probni_rad',
        label: 'Probni rad',
        type: 'toggle',
        required: false,
        defaultValue: false,
        tooltip: 'Probni rad je opcioni period tokom kojeg i poslodavac i zaposleni mogu lakše raskinuti ugovor. Maksimalno trajanje je 6 meseci. Nije obavezan.',
      },
      {
        id: 'probni_rad_meseci',
        label: 'Trajanje probnog rada (meseci)',
        type: 'number',
        required: false,
        min: 1,
        max: 6,
        defaultValue: 3,
        conditional: { field: 'probni_rad', value: true },
        helperText: 'Između 1 i 6 meseci',
      },
    ],
  },
  {
    id: 'zarada',
    title: 'Zarada i naknade',
    fields: [
      {
        id: 'bruto',
        label: 'Osnovna bruto zarada (RSD)',
        type: 'number',
        required: true,
        min: 1,
        placeholder: 'npr. 120000',
        hint: 'Minimalna bruto zarada 2026: ~84.031 RSD za 168 radnih sati (371 RSD neto/h)',
        helperText: 'Iznos u dinarima, npr. 120000',
        tooltip: 'Ugovorom o radu se uvek ugovara BRUTO 1 zarada — iznos koji uključuje neto platu, porez i doprinose na teret zaposlenog. Neto iznos koji zaposleni prima je otprilike 60-65% bruto 1 iznosa.\n\nBruto 2 (ukupan trošak za firmu) je za dodatnih ~17,4% veći od bruto 1 iznosa koji unosite ovde.\n\nMinimalna bruto 1 zarada za 2026: 84.031 RSD.',
      },
      {
        id: 'nacin_isplate',
        label: 'Način isplate',
        type: 'text',
        required: true,
        defaultValue: 'na tekući račun banke',
        placeholder: 'npr. na tekući račun banke',
        helperText: 'Kako se zarada isplaćuje zaposlenom',
      },
      { id: 'dan_isplate', label: 'Dan isplate u mesecu', type: 'number', required: true, min: 1, max: 31, placeholder: 'npr. 15', helperText: 'Dan u mesecu (1-31)' },
      { id: 'topli_obrok', label: 'Topli obrok (RSD mesečno)', type: 'number', required: false, placeholder: 'opciono', helperText: 'Mesečni iznos u RSD. Unesite 0 ako se ne isplaćuje.' },
      {
        id: 'prevoz',
        label: 'Naknada za prevoz',
        type: 'radio',
        required: false,
        tooltip: 'Stvarni troškovi — refundacija mesečne karte.\nFiksni iznos — mesečna naknada bez računa.\nBez naknade — prevoz nije uključen.',
        options: [
          { value: 'Stvarni troškovi prevoza', label: 'Stvarni troškovi' },
          { value: 'Fiksni iznos', label: 'Fiksni iznos' },
          { value: 'Bez naknade za prevoz', label: 'Bez naknade' },
        ],
      },
    ],
  },
  {
    id: 'radno_vreme',
    title: 'Radno vreme i odmor',
    fields: [
      {
        id: 'fond_sati',
        label: 'Nedeljni fond radnih sati',
        type: 'number',
        required: true,
        min: 1,
        max: 48,
        defaultValue: 40,
        helperText: 'Standardno puno radno vreme je 40 sati nedeljno',
      },
      { id: 'raspored', label: 'Raspored radnog vremena', type: 'text', required: true, placeholder: 'npr. Ponedeljak-Petak 09:00-17:00', helperText: 'Navedite dane i vremenski raspon rada' },
      {
        id: 'godisnji_odmor',
        label: 'Broj dana godišnjeg odmora',
        type: 'number',
        required: true,
        min: 20,
        defaultValue: 20,
        hint: 'Zakonski minimum je 20 radnih dana',
        helperText: 'Minimum po zakonu je 20 radnih dana',
      },
      {
        id: 'otkazni_rok_zaposleni',
        label: 'Otkazni rok — zaposleni (dani)',
        type: 'number',
        required: true,
        min: 8,
        max: 30,
        defaultValue: 15,
        tooltip: 'Zakon o radu propisuje minimum 8, maksimum 30 dana za otkaz od strane zaposlenog.',
        helperText: 'Min 8, max 30 dana (Zakon o radu)',
      },
      {
        id: 'otkazni_rok_poslodavac',
        label: 'Otkazni rok — poslodavac (dani)',
        type: 'number',
        required: true,
        min: 8,
        defaultValue: 30,
        tooltip: 'Zakon o radu propisuje minimum 8 dana. Nema zakonskog maksimuma za poslodavca, ali je preporuka 15-30 dana.',
        helperText: 'Min 8 dana (Zakon o radu)',
      },
    ],
  },
  {
    id: 'opciono',
    title: 'Dodatne odredbe',
    fields: [
      { id: 'zabrana_konkurencije', label: 'Zabrana konkurencije', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Zabranjuje zaposlenom da radi za direktnu konkurenciju ili pokrene sličan biznis u određenom periodu.' },
      {
        id: 'trajanje_zabrane',
        label: 'Trajanje zabrane (meseci, max 24)',
        type: 'number',
        required: false,
        min: 1,
        max: 24,
        defaultValue: 12,
        conditional: { field: 'zabrana_konkurencije', value: true },
        helperText: 'Između 1 i 24 meseca',
      },
      {
        id: 'naknada_zabrana',
        label: 'Mesečna naknada za zabranu konkurencije (RSD)',
        type: 'number',
        required: true,
        conditional: { field: 'zabrana_konkurencije', value: true },
        min: 1,
        tooltip: 'Zakon o radu čl. 161. st. 2. obavezuje poslodavca da isplaćuje naknadu zaposlenom za period trajanja zabrane. Bez ovog iznosa klauzula o zabrani konkurencije je pravno ništava.',
        helperText: 'Obavezno po čl. 161. st. 2. Zakona o radu — bez naknade klauzula je ništava',
        placeholder: 'npr. 30000',
      },
      { id: 'napomene', label: 'Posebne napomene / dodatne klauzule', type: 'textarea', required: false, placeholder: 'npr. Posebni uslovi rada, dodatne klauzule, interne napomene...', helperText: 'Opciono — unesite samo ako postoje posebni uslovi' },
    ],
  },
  {
    id: 'napredne_opcije',
    title: 'Napredne opcije',
    fields: [
      {
        id: 'detaljna_prava_obaveze',
        label: 'Detaljna razrada prava i obaveza',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Uključuje opširnu listu prava i obaveza obe strane',
        tooltip: 'Ako isključite ovu opciju, ugovor će sadržati samo zakonski obavezne elemente bez detaljne razrade članova o pravima i obavezama.',
      },
      {
        id: 'cuvanje_poslovne_tajne',
        label: 'Klauzula o čuvanju poslovne tajne',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Preporučuje se za pozicije sa pristupom poverljivim informacijama',
        tooltip: 'Ako isključite, ugovor neće sadržati poseban član o čuvanju poslovne tajne. Zaposleni je i bez toga zakonski obavezan da čuva poslovnu tajnu.',
      },
      {
        id: 'klauzula_izmene_zarade',
        label: 'Uključiti klauzulu o pravu izmene zarade?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        tooltip: 'Ako je uključeno, ugovor će sadržati odredbu da poslodavac može menjati zaradu pisanim aneksom uz obaveštenje 15 dana unapred, ali ne ispod zakonskog minimuma.',
      },
    ],
  },
]
