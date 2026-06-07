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
    title: 'Savet',
    message:
      'Za punomoćje pred sudom ili državnim organima, kao i za promet nepokretnosti, overa kod javnog beležnika je obavezna.',
    learnMoreUrl: null,
    type: 'warning',
  },
  'opsti-uslovi': {
    title: 'Važan podsetnik',
    message:
      'Opšte uslove i Politiku privatnosti moraš vidno objaviti na sajtu pre nego što počneš da prikupljaš podatke korisnika.',
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
}
