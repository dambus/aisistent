export type DocumentReminder = {
  title: string
  message: string
  learnMoreUrl: string | null
  type: 'info' | 'warning'
}

export const documentReminders: Record<string, DocumentReminder> = {
  'ugovor-o-radu': {
    title: 'Važan podsetnik',
    message:
      'Zaposlenog moraš prijaviti na PIO pre prvog radnog dana. Rok za prijavu je isti dan kada zaposleni počinje sa radom. Zarada ugovorena u ugovoru je BRUTO 1 iznos. Stvarni mesečni trošak za firmu (Bruto 2) je za oko 17,4% veći. Koristite Kalkulator zarade za tačan preračun.',
    learnMoreUrl: '/alati/kalkulator-zarade',
    type: 'warning',
  },
  'ugovor-o-delu': {
    title: 'Poreski podsetnik',
    message:
      'Ako je izvođač fizičko lice bez firme, kao naručilac si dužan da obračunaš i uplatiš porez i doprinose pre isplate honorara.',
    learnMoreUrl: null,
    type: 'warning',
  },
  nda: {
    title: 'Savet',
    message:
      'NDA je pravno jači ako je overen kod javnog beležnika. Nije obavezno, ali se preporučuje za vredne poslovne tajne.',
    learnMoreUrl: null,
    type: 'info',
  },
  'ugovor-o-zakupu': {
    title: 'Važan podsetnik',
    message:
      'Ugovor o zakupu moraš prijaviti Poreskoj upravi u roku od 30 dana od zaključivanja. Neprijavljivanje je prekršaj.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'ugovor-o-saradnji': {
    title: 'Savet',
    message:
      'Preporučujemo da ugovor o saradnji proverite sa računovođom — podela prihoda između firmi može imati PDV implikacije.',
    learnMoreUrl: null,
    type: 'info',
  },
  punomocje: {
    title: 'Važan podsetnik',
    message:
      'Punomoćje za zastupanje pred sudom, državnim organima ili za promet nepokretnosti mora biti overeno kod javnog beležnika. Bez overe nije pravno važeće za ove namene.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'opsti-uslovi': {
    title: 'Obaveza objave',
    message:
      'Opšte uslove korišćenja i Politiku privatnosti morate vidno objaviti na sajtu pre nego što počnete da prikupljate podatke korisnika. Nepridržavanje GDPR obaveza može rezultirati značajnim kaznama.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'poslovni-mejl': {
    title: 'Savet',
    message:
      'Za opomenu pred tužbu preporučujemo slanje preporučenom poštom sa povratnicom — tako imaš dokaz o prijemu.',
    learnMoreUrl: null,
    type: 'info',
  },
  'oglas-za-posao': {
    title: 'Zakonska obaveza',
    message:
      'Oglas ne sme sadržati uslove koji diskriminišu po osnovu pola, godina, porekla ili invaliditeta. Infostud može odbiti oglas koji krši ova pravila.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'ponuda-klijentu': {
    title: 'Savet',
    message:
      'Poslovna ponuda nije pravno obavezujući dokument dok je klijent ne potpiše ili pismeno ne prihvati. Za obavezujuće uslove, napravi ugovor o saradnji.',
    learnMoreUrl: null,
    type: 'info',
  },
  'odgovor-kandidatu': {
    title: 'Savet',
    message:
      'Odgovorite kandidatima u roku od 7 dana — duže čekanje ostavlja loš utisak o firmi i može uticati na vašu reputaciju kao poslodavca.',
    learnMoreUrl: null,
    type: 'info',
  },
  'preporuka': {
    title: 'Savet',
    message:
      'Proverite sa kandidatom da li sme da navedete vaš kontakt u preporuci — neke firme to zahtevaju unapred.',
    learnMoreUrl: null,
    type: 'info',
  },
  'resenje-godisnji-odmor': {
    title: 'Zakonska obaveza',
    message:
      'Rešenje o godišnjem odmoru mora biti dostavljeno zaposlenom najmanje 8 dana pre početka korišćenja odmora.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'pravilnik-o-radu': {
    title: 'Važan podsetnik',
    message:
      'Pravilnik o radu mora biti objavljen na oglasnoj tabli i dostupan svim zaposlenima. Zaposleni mora biti upoznat sa pravilnikom pre početka rada.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'opis-proizvoda': {
    title: 'Savet',
    message:
      'Pre objavljivanja, proverite da opisi ne sadrže superlative bez dokaza ("najbolji", "jedini") — Zakon o oglašavanju ih ograničava.',
    learnMoreUrl: null,
    type: 'info',
  },
  'bio-o-nama': {
    title: 'Savet',
    message:
      'Ažurirajte Bio/O nama tekst najmanje jednom godišnje — zastareli podaci umanjuju poverenje posetilaca.',
    learnMoreUrl: null,
    type: 'info',
  },
  'zapisnik-sastanak': {
    title: 'Savet',
    message:
      'Pošaljite zapisnik svim učesnicima najkasnije 24 sata nakon sastanka dok su zaključci još sveži.',
    learnMoreUrl: null,
    type: 'info',
  },
  'faktura': {
    title: 'Važan podsetnik',
    message:
      'Faktura je važeća tek kada je primalac potvrdi ili izvrši uplatu. PDV obveznici moraju evidentirati fakturu u poreskom periodu kada je promet izvršen.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'putni-nalog': {
    title: 'Poreski podsetnik',
    message:
      'Dnevnica do 2.750 RSD/dan za putovanje u zemlji je neoporeziva. Za inostranstvo, neoporeziv iznos zavisi od destinacije i određuje ga Vlada RS. Čuvajte račune za sve troškove — prevoz, smeštaj i ostalo.',
    learnMoreUrl: null,
    type: 'info',
  },
  'otpremnica': {
    title: 'Podsetnik',
    message:
      'Otpremnica nije fiskalni dokument — ne zamenjuje fakturu. Uz isporuku robe koja podleže PDV-u, morate izdati i fakturu. Primalac potpisom potvrđuje prijem robe u navedenim količinama.',
    learnMoreUrl: null,
    type: 'info',
  },
}
