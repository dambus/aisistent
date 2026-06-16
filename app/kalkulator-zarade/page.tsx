import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Kalkulator zarade Srbija 2026 — neto bruto | AIsistent',
  description: 'Besplatan kalkulator zarade za Srbiju. Izračunajte neto iz bruto zarade ili obratno. Ažurirano za 2026.',
  openGraph: {
    title: 'Kalkulator zarade Srbija 2026 — neto i bruto obračun',
    description: 'Besplatan kalkulator zarade za Srbiju. Izračunajte neto iz bruto zarade ili obratno. Ažurirano za 2026.',
    url: 'https://aisistent.rs/kalkulator-zarade',
  },
}

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ToolLandingPage
      isLoggedIn={!!user}
      h1="Kalkulator zarade Srbija 2026 — neto i bruto obračun"
      intro="Besplatno izračunajte neto zaradu iz bruto ili bruto zaradu iz neta. Ažurirani doprinosi i porez za 2026. godinu — za zaposlene, poslodavce i HR timove."
      ctaHref={user ? '/alati/kalkulator-zarade' : '/register'}
      ctaLabel="Otvorite kalkulator"
      ctaNote="Besplatno za sve registrovane korisnike"
      features={[
        { icon: '🧮', title: 'Bruto → Neto', text: 'Iz bruto zarade izračunajte tačan neto iznos koji zaposleni prima na ruku.' },
        { icon: '↕️', title: 'Neto → Bruto', text: 'Unapred znate šta zaposleni želi da prima — izračunajte koliki bruto treba ugovoriti.' },
        { icon: '🏢', title: 'Ukupan trošak', text: 'Bruto 2 — ukupan trošak za poslodavca uključujući doprinose na teret poslodavca.' },
        { icon: '📊', title: 'Ažurirano 2026.', text: 'Aktualni doprinosi i porez u skladu sa propisima za 2026. godinu.' },
        { icon: '💼', title: 'Za poslodavce i HR', text: 'Brza procena troška angažovanja pre potpisivanja ugovora o radu.' },
        { icon: '👤', title: 'Za zaposlene', text: 'Proverite da li je ponuđena zarada u skladu sa vašim zahtevima.' },
      ]}
      whyAisistent={[
        'Kalkulator prilagođen srpskim propisima — ne generički kalkulator',
        'Ažuriran za 2026. godinu sa aktualnim stopama doprinosa i poreza',
        'Prikazuje i ukupan trošak za poslodavca (bruto 2) — ključno za budžetiranje',
        'Besplatno za sve — bez registracije kreditne kartice',
        'Uz kalkulator, i generator ugovora o radu u jednoj platformi',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/kalkulator-pausala', label: 'Kalkulator paušala' },
        { href: '/blog/pausal-ili-doo', label: 'Članak: paušal ili DOO' },
      ]}
      faqs={[
        {
          q: 'Kako se računa neto zarada iz bruto u Srbiji?',
          a: 'Iz bruto 1 zarade se oduzimaju doprinosi na teret zaposlenog (PIO 14%, zdravstvo 5,15%, nezaposlenost 0,75% = ukupno 19,9%), a zatim i porez na dohodak (10% na razliku između bruto i neoporezivog dela koji je oko 25.000 RSD mesečno). Ostatak je neto — iznos koji zaposleni prima na tekući račun. Za tačan obračun koristite naš kalkulator.',
        },
        {
          q: 'Koliki su doprinosi na zaradu u 2026?',
          a: 'Na teret zaposlenog: PIO 14%, zdravstvo 5,15%, nezaposlenost 0,75% — ukupno 19,9% od bruto zarade. Na teret poslodavca: PIO 10%, zdravstvo 5,15% — ukupno 15,15% od bruto zarade. Ove stope čine ukupan teret od oko 35% povrh neto zarade zaposlenog, što je razlog zašto je bruto 2 (ukupan trošak za poslodavca) značajno veći od neto primanja.',
        },
        {
          q: 'Šta je minimalna zarada u Srbiji?',
          a: 'Minimalna zarada u Srbiji za 2026. godinu iznosi 84.031 RSD bruto mesečno za puno radno vreme (168 sati). Ovo je zakonski minimum — ugovorom o radu ne možete ugovoriti nižu zaradu. Neto iznos minimalne zarade je oko 55.000–57.000 RSD mesečno, u zavisnosti od statusa osiguranja zaposlenog.',
        },
        {
          q: 'Kako se obračunava porez na zarade?',
          a: 'Porez na zarade u Srbiji iznosi 10% od poreske osnovice. Poreska osnovica se dobija kada se od bruto zarade oduzmu svi doprinosi na teret zaposlenog i neoporezivi deo (tzv. poreska olakšica, koja za 2026. iznosi oko 25.000 RSD mesečno). Rezultat pomnožen sa 10% je iznos poreza. Za detaljan obračun sa svim odbitcima koristite naš kalkulator.',
        },
      ]}
    />
  )
}
