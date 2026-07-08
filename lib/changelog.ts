export interface ChangelogEntry {
  id: string
  date: string
  title: string
  description: string
  href?: string
}

// Najnovije prvo. Dodaj novi unos na vrh kad želiš da najaviš nešto korisnicima.
export const CHANGELOG: ChangelogEntry[] = [
  {
    id: '2026-07-obrasci-rast',
    date: '2026-07-08',
    title: 'Biblioteka obrazaca izrasla na stotine dokumenata',
    description: 'APR, Poreska uprava, CROSO i PIO obrasci — svi na jednom mestu, mnogi automatski popunjeni vašim podacima.',
    href: '/obrasci',
  },
  {
    id: '2026-07-komercijalni-dokumenti',
    date: '2026-07-08',
    title: 'Novi dokumenti — Otpremnica i Ponuda za radove',
    description: 'Dva nova tipa komercijalnih dokumenata dostupna u generatoru.',
    href: '/dokumenti/otpremnica',
  },
  {
    id: '2026-06-kalkulatori',
    date: '2026-06-20',
    title: 'Besplatni kalkulatori',
    description: 'Neto zarada, paušalni porez i ugovor o delu — izračunajte bez registracije.',
    href: '/alati/kalkulator-zarade',
  },
  {
    id: '2026-06-kontakti',
    date: '2026-06-10',
    title: 'Sačuvani kontakti',
    description: 'Sačuvajte kupce, klijente i partnere jednom — popunite ih u dokumentu jednim klikom.',
    href: '/profil',
  },
]
