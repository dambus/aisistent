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
    id: '2026-07-pregled-ugovora',
    date: '2026-07-12',
    title: 'Novo — Pregled ugovora (AI analiza)',
    description: 'Dobili ste ugovor na potpis? AI ukazuje na rizične klauzule i šta nedostaje pre nego što potpišete. Dostupno na Pro i Agency planu.',
    href: '/alati/pregled-ugovora',
  },
  {
    id: '2026-07-smart-autofill',
    date: '2026-07-10',
    title: 'Smart Autofill — katalog usluga i sačuvani zaposleni',
    description: 'Sačuvajte stavke kataloga za fakture/ponude i podatke zaposlenih za HR dokumente — popunite ih jednim klikom. Dostupno na Pro i Agency planu.',
    href: '/profil',
  },
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
