// Centralni izvor metapodataka za svaki tip dokumenta/alata — naslov, opis, ikonica,
// rute i CTA tekst. Pre ovog fajla isti podaci su bili ručno duplirani u app/page.tsx,
// app/(dashboard)/dashboard/page.tsx i components/dashboard/Sidebar.tsx i znali su da se
// razminu (npr. NDA opis se razlikovao između homepage-a i dashboard-a).
export interface ToolConfig {
  slug: string
  label: string
  desc: string
  icon: string
  /** Javna landing stranica (app/<slug>/page.tsx), undefined ako ne postoji. */
  landingHref?: string
  /** Ruta unutar dashboard-a (/dokumenti/<slug> ili /alati/<slug>). */
  dashboardHref: string
  /** CTA tekst specifičan za tip (glagol prilagođen alatu, ne generički "Napravite dokument"). */
  ctaLabel: string
  /** Opcioni override za mid-page CTA naslov (default u ToolLandingPage je "Napravite {label} za 60 sekundi"). */
  ctaTitle?: string
}

export const TOOL_CONFIG: Record<string, ToolConfig> = {
  'ugovor-o-radu': {
    slug: 'ugovor-o-radu',
    label: 'Ugovor o radu',
    desc: 'Usklađen sa Zakonom o radu RS',
    icon: '👔',
    landingHref: '/ugovor-o-radu',
    dashboardHref: '/dokumenti/ugovor-o-radu',
    ctaLabel: 'Generišite ugovor besplatno',
  },
  'ugovor-o-delu': {
    slug: 'ugovor-o-delu',
    label: 'Ugovor o delu',
    desc: 'Za samostalne saradnike i projektnu saradnju',
    icon: '📋',
    landingHref: '/ugovor-o-delu',
    dashboardHref: '/dokumenti/ugovor-o-delu',
    ctaLabel: 'Generišite ugovor besplatno',
  },
  'nda': {
    slug: 'nda',
    label: 'NDA Sporazum',
    desc: 'Zaštitite poslovnu tajnu',
    icon: '🔒',
    landingHref: '/nda',
    dashboardHref: '/dokumenti/nda',
    ctaLabel: 'Generišite NDA besplatno',
  },
  'ugovor-o-zakupu': {
    slug: 'ugovor-o-zakupu',
    label: 'Ugovor o zakupu',
    desc: 'Za stanove i poslovne prostore',
    icon: '🏠',
    landingHref: '/ugovor-o-zakupu',
    dashboardHref: '/dokumenti/ugovor-o-zakupu',
    ctaLabel: 'Generišite ugovor besplatno',
  },
  'ugovor-o-saradnji': {
    slug: 'ugovor-o-saradnji',
    label: 'Ugovor o saradnji/Zajmu',
    desc: 'Za partnerstva i zajedničke projekte',
    icon: '🤝',
    landingHref: '/ugovor-o-saradnji',
    dashboardHref: '/dokumenti/ugovor-o-saradnji',
    ctaLabel: 'Generišite ugovor besplatno',
  },
  'punomocje': {
    slug: 'punomocje',
    label: 'Punomoćje',
    desc: 'Za zastupanje pred organima i firmama',
    icon: '✍️',
    landingHref: '/punomocje',
    dashboardHref: '/dokumenti/punomocje',
    ctaLabel: 'Generišite punomoćje besplatno',
  },
  'opsti-uslovi': {
    slug: 'opsti-uslovi',
    label: 'Opšti uslovi i Politika privatnosti',
    desc: 'Obavezno za svaki veb sajt',
    icon: '📄',
    landingHref: '/opsti-uslovi',
    dashboardHref: '/dokumenti/opsti-uslovi',
    ctaLabel: 'Generišite uslove besplatno',
  },
  'poslovni-mejl': {
    slug: 'poslovni-mejl',
    label: 'Poslovni mejl',
    desc: 'Ponuda, opomena, zahvalnica i još 7 tipova',
    icon: '✉️',
    landingHref: '/poslovni-mejl',
    dashboardHref: '/dokumenti/poslovni-mejl',
    ctaLabel: 'Napišite mejl besplatno',
  },
  'oglas-za-posao': {
    slug: 'oglas-za-posao',
    label: 'Oglas za posao',
    desc: 'Privucite prave kandidate na Infostud i LinkedIn',
    icon: '👥',
    landingHref: '/oglas-za-posao',
    dashboardHref: '/dokumenti/oglas-za-posao',
    ctaLabel: 'Napišite oglas besplatno',
  },
  'ponuda-klijentu': {
    slug: 'ponuda-klijentu',
    label: 'Ponuda klijentu',
    desc: 'Profesionalna poslovna ponuda za 2 minuta',
    icon: '💼',
    landingHref: '/ponuda-klijentu',
    dashboardHref: '/dokumenti/ponuda-klijentu',
    ctaLabel: 'Napišite ponudu besplatno',
  },
  'odgovor-kandidatu': {
    slug: 'odgovor-kandidatu',
    label: 'Odgovor kandidatu',
    desc: 'Poziv na intervju, prihvatanje ili odbijanje',
    icon: '📨',
    dashboardHref: '/dokumenti/odgovor-kandidatu',
    ctaLabel: 'Napišite odgovor besplatno',
  },
  'preporuka': {
    slug: 'preporuka',
    label: 'Preporuka/Referenca',
    desc: 'Profesionalna preporuka za zaposlenog ili saradnika',
    icon: '⭐',
    dashboardHref: '/dokumenti/preporuka',
    ctaLabel: 'Napišite preporuku besplatno',
  },
  'resenje-godisnji-odmor': {
    slug: 'resenje-godisnji-odmor',
    label: 'Rešenje o godišnjem odmoru',
    desc: 'Formalno rešenje u skladu sa Zakonom o radu',
    icon: '🌴',
    dashboardHref: '/dokumenti/resenje-godisnji-odmor',
    ctaLabel: 'Generišite rešenje besplatno',
  },
  'pravilnik-o-radu': {
    slug: 'pravilnik-o-radu',
    label: 'Pravilnik o radu',
    desc: 'Interni akt o radnom vremenu, zaradama i disciplini',
    icon: '📌',
    dashboardHref: '/dokumenti/pravilnik-o-radu',
    ctaLabel: 'Generišite pravilnik besplatno',
  },
  'obavestenje-o-promeni-uslova': {
    slug: 'obavestenje-o-promeni-uslova',
    label: 'Obaveštenje o promeni uslova rada',
    desc: 'Formalno obaveštenje po čl. 172-174 ZOR',
    icon: '📋',
    landingHref: '/obavestenje-o-promeni-uslova',
    dashboardHref: '/dokumenti/obavestenje-o-promeni-uslova',
    ctaLabel: 'Napravite obaveštenje besplatno',
  },
  'opis-proizvoda': {
    slug: 'opis-proizvoda',
    label: 'Opis proizvoda/usluge',
    desc: 'Prodajni opis za sajt, katalog ili kampanju',
    icon: '🛍️',
    dashboardHref: '/dokumenti/opis-proizvoda',
    ctaLabel: 'Napišite opis besplatno',
  },
  'bio-o-nama': {
    slug: 'bio-o-nama',
    label: 'Bio / O nama',
    desc: 'Tekst o firmi, preduzetnik bio ili LinkedIn profil',
    icon: '🏢',
    dashboardHref: '/dokumenti/bio-o-nama',
    ctaLabel: 'Napišite bio besplatno',
  },
  'zapisnik-sastanak': {
    slug: 'zapisnik-sastanak',
    label: 'Zapisnik sa sastanka',
    desc: 'Zaključci, akcije i odluke sa poslovnih sastanaka',
    icon: '📝',
    dashboardHref: '/dokumenti/zapisnik-sastanak',
    ctaLabel: 'Napišite zapisnik besplatno',
  },
  'faktura': {
    slug: 'faktura',
    label: 'Faktura / Profaktura',
    desc: 'Profesionalna faktura sa PDV logikom i stavkama',
    icon: '🧾',
    dashboardHref: '/dokumenti/faktura',
    ctaLabel: 'Izdajte fakturu besplatno',
  },
  'putni-nalog': {
    slug: 'putni-nalog',
    label: 'Putni nalog',
    desc: 'Službena putovanja — vozač, vozilo, ruta, troškovi',
    icon: '✈️',
    landingHref: '/putni-nalog',
    dashboardHref: '/dokumenti/putni-nalog',
    ctaLabel: 'Napravite putni nalog besplatno',
  },
  'otpremnica': {
    slug: 'otpremnica',
    label: 'Otpremnica',
    desc: 'Isporuka robe — stavke, količine, izdavalac i primalac',
    icon: '📦',
    landingHref: '/otpremnica',
    dashboardHref: '/dokumenti/otpremnica',
    ctaLabel: 'Napravite otpremnicu besplatno',
    ctaTitle: 'Napravite otpremnicu za 60 sekundi',
  },
  'ponuda-za-radove': {
    slug: 'ponuda-za-radove',
    label: 'Ponuda za radove',
    desc: 'Za izvođače, majstore i zanatlije — stavke, cene, PDV',
    icon: '🔨',
    landingHref: '/ponuda-za-radove',
    dashboardHref: '/dokumenti/ponuda-za-radove',
    ctaLabel: 'Napravite ponudu besplatno',
    ctaTitle: 'Napravite ponudu za radove za 60 sekundi',
  },
  'kalkulator-zarade': {
    slug: 'kalkulator-zarade',
    label: 'Kalkulator zarade',
    desc: 'Neto iz bruto ili bruto iz neto, bez registracije',
    icon: '🧮',
    landingHref: '/kalkulator-zarade',
    dashboardHref: '/alati/kalkulator-zarade',
    ctaLabel: 'Otvorite kalkulator',
    ctaTitle: 'Izračunajte odmah, besplatno',
  },
  'kalkulator-pausala': {
    slug: 'kalkulator-pausala',
    label: 'Kalkulator paušala',
    desc: 'Poreske obaveze paušalnog preduzetnika po delatnosti',
    icon: '🧾',
    landingHref: '/kalkulator-pausala',
    dashboardHref: '/alati/kalkulator-pausala',
    ctaLabel: 'Otvorite kalkulator',
    ctaTitle: 'Izračunajte odmah, besplatno',
  },
  'kalkulator-ugovora-o-delu': {
    slug: 'kalkulator-ugovora-o-delu',
    label: 'Kalkulator ugovora o delu',
    desc: 'Neto isplata i troškovi poslodavca za ugovor o delu',
    icon: '📑',
    landingHref: '/kalkulator-ugovora-o-delu',
    dashboardHref: '/alati/kalkulator-ugovora-o-delu',
    ctaLabel: 'Otvorite kalkulator',
    ctaTitle: 'Izračunajte odmah, besplatno',
  },
  'pregled-ugovora': {
    slug: 'pregled-ugovora',
    label: 'Pregled ugovora',
    desc: 'AI analiza rizičnih klauzula pre potpisivanja tuđeg ugovora',
    icon: '🔎',
    landingHref: '/pregled-ugovora',
    dashboardHref: '/alati/pregled-ugovora',
    ctaLabel: 'Analizirajte ugovor',
    ctaTitle: 'Proverite ugovor pre potpisa',
  },
}

export function getToolConfig(slug: string): ToolConfig | undefined {
  return TOOL_CONFIG[slug]
}

/** Grupisanje za homepage "Alati" sekciju (app/page.tsx) — komercijalni dokumenti izdvojeni u svoju kategoriju. */
export const HOMEPAGE_CATEGORIES: { title: string; slugs: string[] }[] = [
  {
    title: '📄 Ugovori i dokumenti',
    slugs: ['ugovor-o-radu', 'ugovor-o-delu', 'nda', 'ugovor-o-zakupu', 'ugovor-o-saradnji', 'punomocje', 'opsti-uslovi', 'faktura'],
  },
  {
    title: '✉️ Poslovna komunikacija',
    slugs: ['poslovni-mejl', 'ponuda-klijentu'],
  },
  {
    title: '👥 HR i zapošljavanje',
    slugs: ['oglas-za-posao', 'odgovor-kandidatu', 'preporuka', 'resenje-godisnji-odmor', 'pravilnik-o-radu'],
  },
  {
    title: '🏢 Marketing i prodaja',
    slugs: ['opis-proizvoda', 'bio-o-nama', 'zapisnik-sastanak'],
  },
  {
    title: '📦 Komercijalni dokumenti',
    slugs: ['otpremnica', 'ponuda-za-radove', 'putni-nalog', 'obavestenje-o-promeni-uslova'],
  },
  {
    title: '🧮 Besplatni kalkulatori',
    slugs: ['kalkulator-zarade', 'kalkulator-pausala', 'kalkulator-ugovora-o-delu'],
  },
  {
    title: '🤖 AI alati',
    slugs: ['pregled-ugovora'],
  },
]

/** Grupisanje za dashboard i sidebar (dokumenta grupe identične, kalkulatori posebna "Alati" kategorija). */
export const DASHBOARD_CATEGORIES: { title: string; slugs: string[] }[] = [
  {
    title: 'Ugovori i dokumenti',
    slugs: ['ugovor-o-radu', 'ugovor-o-delu', 'nda', 'ugovor-o-zakupu', 'ugovor-o-saradnji', 'punomocje', 'opsti-uslovi', 'faktura', 'putni-nalog', 'otpremnica', 'ponuda-za-radove'],
  },
  {
    title: 'Poslovna komunikacija',
    slugs: ['poslovni-mejl', 'ponuda-klijentu'],
  },
  {
    title: 'HR i zapošljavanje',
    slugs: ['oglas-za-posao', 'odgovor-kandidatu', 'preporuka', 'resenje-godisnji-odmor', 'pravilnik-o-radu', 'obavestenje-o-promeni-uslova'],
  },
  {
    title: 'Marketing i prodaja',
    slugs: ['opis-proizvoda', 'bio-o-nama', 'zapisnik-sastanak'],
  },
]

export const CALCULATOR_SLUGS = ['kalkulator-zarade', 'kalkulator-pausala', 'kalkulator-ugovora-o-delu', 'pregled-ugovora']
