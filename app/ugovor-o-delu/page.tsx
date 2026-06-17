import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Ugovor o delu Srbija — generator i kalkulator poreza | AIsistent',
  description: 'Generator ugovora o delu za freelancere i firme u Srbiji. Ispravno obračunavanje poreza i doprinosa za 2026.',
  openGraph: {
    title: 'Ugovor o delu — generator za freelancere i firme',
    description: 'Generator ugovora o delu za freelancere i firme u Srbiji. Ispravno obračunavanje poreza i doprinosa za 2026.',
    url: 'https://aisistent.rs/ugovor-o-delu',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Ugovor o delu — generator za freelancere i firme"
      intro="Generišite ugovor o delu po Zakonu o obligacionim odnosima za konkretan zadatak ili projekat. Ispravne poreske klauzule, rokovi i isporuka — PDF za 60 sekundi."
      ctaHref="/register"
      ctaLabel="Generišite ugovor besplatno"
      ctaNote="Dokument u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '🎯', title: 'Predmet i rezultat', text: 'Precizno definisan konkretan zadatak i rezultat koji izvođač isporučuje — zaštita od nesporazuma.' },
        { icon: '💰', title: 'Naknada i PDV', text: 'Ugovorena naknada sa PDV statusom — ispravno za PDV obveznike i neobveznike.' },
        { icon: '📆', title: 'Rok isporuke', text: 'Rok za izvršenje sa jasnim posledicama kašnjenja — zaštita naručioca.' },
        { icon: '🧾', title: 'Porez i doprinosi', text: 'Klauzula o porezu na dohodak i doprinosima — ko plaća, ko obračunava, PPP-PD obrazac.' },
        { icon: '🔒', title: 'Autorska prava', text: 'Prenos autorskih prava na naručioca ili zadržavanje kod izvođača — eksplicitna odredba.' },
        { icon: '⚖️', title: 'Odgovornost za nedostatke', text: 'Garancija za ispravnost rezultata i rok za reklamacije u skladu sa ZOO.' },
      ]}
      whyAisistent={[
        'Prilagođen Zakonu o obligacionim odnosima RS — nije samo engleski template',
        'Ispravne poreske klauzule (normiran trošak 20%, porez 20%, doprinosi)',
        'Podržava i fizička lica i preduzetnike kao izvođače',
        'Automatska deklinacija naziva u srpskom jeziku',
        'PDF i Word (DOCX) format spreman za potpisivanje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/kalkulator-ugovora-o-delu', label: 'Kalkulator poreza za ugovor o delu' },
        { href: '/nda', label: 'NDA sporazum pre angažmana' },
        { href: '/blog/ugovor-o-delu-vs-ugovor-o-radu', label: 'Članak: ugovor o delu vs. o radu' },
      ]}
      faqs={[
        {
          q: 'Koja je razlika između ugovora o delu i ugovora o radu?',
          a: 'Ugovor o radu zasniva radni odnos — zaposleni ima pravo na godišnji odmor, bolovanje, zaštitu od otkaza. Ugovor o delu je obligacionopravni ugovor — angažujete nekoga da uradi konkretan posao bez zasnivanja radnog odnosa. Ugovor o delu ne sme se koristiti za trajno angažovanje na poslovima koji odgovaraju opisu radnog mesta — inspekcija rada to kvalifikuje kao prikriveni radni odnos.',
        },
        {
          q: 'Koji porez se plaća na ugovor o delu?',
          a: 'Na naknadu po ugovoru o delu plaća se porez na dohodak od 20% na poresku osnovicu. Osnova se dobija oduzimanjem normiranog troška (20% od bruto naknade) — dakle oporezuje se 80% iznosa, što daje efektivnu stopu od 16%. Naručilac je poreski platac — obračunava i uplaćuje porez u ime izvođača.',
        },
        {
          q: 'Da li se na ugovor o delu plaćaju doprinosi?',
          a: 'Da, ali samo ako izvođač nije osiguran po drugom osnovu (nije zaposlen na drugom mestu, nije penzioner). Tada naručilac obračunava i PIO (26%) i zdravstveno (10,3%). Ako je izvođač već osiguran, plaća se samo razlika PIO do zakonskog minimuma ako je naknada niska. Naručilac podnosi PPP-PD obrazac za svaku isplatu.',
        },
        {
          q: 'Može li ista firma imati i ugovor o radu i ugovor o delu sa istim licem?',
          a: 'Da, ovo je moguće — zaposleni može angažovati i po ugovoru o delu za posao koji je van opisa njegovog radnog mesta. Npr. zaposleni grafički dizajner može po ugovoru o delu prevesti tekst. Zabrana je angažovanje po ugovoru o delu za iste poslove koje obavlja po ugovoru o radu, jer to predstavlja zaobilaženje radnopravnih propisa.',
        },
      ]}
    />
  )
}
