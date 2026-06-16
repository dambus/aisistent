import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Kalkulator ugovora o delu Srbija — porez i doprinosi | AIsistent',
  description: 'Besplatan kalkulator poreza i doprinosa za ugovor o delu u Srbiji. Bruto i neto za 2026.',
  openGraph: {
    title: 'Kalkulator ugovora o delu — porez i doprinosi 2026',
    description: 'Besplatan kalkulator poreza i doprinosa za ugovor o delu u Srbiji. Bruto i neto za 2026.',
    url: 'https://aisistent.rs/kalkulator-ugovora-o-delu',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Kalkulator ugovora o delu — porez i doprinosi 2026"
      intro="Izračunajte koliko ćete stvarno primiti po ugovoru o delu — uz normiran trošak, porez na dohodak i doprinose za PIO i zdravstvo. Ažurirano za 2026."
      ctaHref="/register"
      ctaLabel="Otvorite kalkulator"
      ctaNote="Besplatno za sve registrovane korisnike"
      features={[
        { icon: '🧮', title: 'Bruto → Neto obračun', text: 'Iz ugovorene naknade izračunajte tačan neto iznos koji izvodač prima na ruku.' },
        { icon: '💡', title: 'Normiran trošak 20%', text: 'Automatski odbitak normiranog troška koji umanjuje poresku osnovicu.' },
        { icon: '📊', title: 'Porez i doprinosi', text: 'Porez na dohodak 20% + PIO + zdravstvo — sve razdvojeno i jasno prikazano.' },
        { icon: '⚖️', title: 'Ugovor o delu vs. radu', text: 'Brzo poređenje neto primanja za isti bruto iznos po ugovoru o delu i o radu.' },
        { icon: '📅', title: 'Ažurirano 2026.', text: 'Aktualni parametri u skladu sa propisima za 2026. godinu.' },
        { icon: '📋', title: 'Generator ugovora o delu', text: 'Uz kalkulator, odmah i generator ugovora sa svim zakonskim elementima.' },
      ]}
      whyAisistent={[
        'Prilagođen srpskim propisima — normiran trošak, tačne stope za 2026.',
        'Jasno prikazuje ko plaća šta — izvođač ili naručilac',
        'Upoređuje neto primanja za ugovor o delu i o radu',
        'Uz kalkulator, i generator ugovora o delu spreman za potpis',
        'Besplatno za sve registrovane korisnike',
      ]}
      relatedLinks={[
        { href: '/kalkulator-zarade', label: 'Kalkulator zarade (ugovor o radu)' },
        { href: '/ugovor-o-delu', label: 'Generator ugovora o delu' },
        { href: '/blog/ugovor-o-delu-vs-ugovor-o-radu', label: 'Članak: ugovor o delu vs. o radu' },
        { href: '/kalkulator-pausala', label: 'Kalkulator paušala' },
      ]}
      faqs={[
        {
          q: 'Koji porez se plaća na ugovor o delu?',
          a: 'Na ugovor o delu plaća se porez na prihode od ugovora o delu po stopi od 20%. Poreska osnovica se dobija kada se od bruto naknade oduzme normiran trošak od 20% (tj. oporezuje se 80% naknade). Dakle, efektivna poreska stopa je 16% od bruto iznosa (20% × 80%). Porez obračunava i uplaćuje naručilac posla u ime izvođača.',
        },
        {
          q: 'Koji doprinosi se plaćaju na ugovor o delu?',
          a: 'Doprinosi za ugovor o delu zavise od statusa izvođača. Ako izvođač nije osiguran po drugom osnovu (nije zaposlen, nije penzioner), plaćaju se doprinosi za PIO (26%) i zdravstveno osiguranje (10,3%) od bruto naknade. Ako je već osiguran (npr. zaposlen na drugom mestu), plaća se samo razlika PIO ako je doprinos niži od mesečnog minimuma. Naručilac je obavezan da obračuna i uplati ove doprinose.',
        },
        {
          q: 'Može li se odbiti normiran trošak?',
          a: 'Da — po zakonu, od bruto naknade po ugovoru o delu može se odbiti normiran trošak od 20% bez podnošenja dokaza o stvarnim troškovima. Ovo automatski smanjuje poresku osnovicu. Alternativno, izvođač može podneti zahtev za odbitak stvarnih troškova ako su veći od 20%, ali to zahteva dokumentaciju i nije čest slučaj u praksi.',
        },
        {
          q: 'Ko plaća porez — izvođač ili naručilac?',
          a: 'Pravno, porez i doprinosi terete izvođača (oduzimaju se od naknade). Međutim, obavezu obračuna i uplate ima naručilac posla — on je poreski platac. Naručilac isplaćuje izvođaču neto iznos (nakon odbitka poreza i doprinosa) i posebno uplaćuje porez i doprinose na račun Poreske uprave. Izvođač dobija PPP-PD obrazac kao potvrdu da je porez uplaćen.',
        },
      ]}
    />
  )
}
