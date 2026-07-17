import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Test samostalnosti — proverite rizik nesamostalnosti paušalca | AIsistent',
  description: 'Besplatan test samostalnosti za paušalce i frilensere sa stranim klijentima. 9 zakonskih kriterijuma, odmah rezultat.',
  openGraph: {
    title: 'Test samostalnosti — proverite rizik nesamostalnosti',
    description: 'Besplatan test samostalnosti za paušalce i frilensere sa stranim klijentima. 9 zakonskih kriterijuma, odmah rezultat.',
    url: 'https://aisistent.rs/test-samostalnosti',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Test samostalnosti — proverite rizik nesamostalnosti"
      heroFlightLabel="Provera"
      intro="Radite kao paušalac ili frilenser sa jednim ili dva strana klijenta kao primarnim izvorom prihoda? Proverite u 2 minuta da li vaš odnos nosi rizik da vas poreska uprava tretira kao nesamostalnog preduzetnika."
      slug="test-samostalnosti"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['test-samostalnosti'].ctaLabel}
      ctaTitle={TOOL_CONFIG['test-samostalnosti'].ctaTitle}
      ctaNote="Besplatno za sve registrovane korisnike"
      features={[
        { icon: '🧭', title: '9 zakonskih kriterijuma', text: 'Zasnovano na čl. 85 Zakona o porezu na dohodak građana, u primeni od 2020. godine.' },
        { icon: '🌍', title: 'Radi i za strane nalogodavce', text: 'Test se primenjuje i kad je klijent firma iz inostranstva — čest slučaj kod srpskih frilensera.' },
        { icon: '⚡', title: 'Odgovor za 2 minuta', text: 'Devet da/ne pitanja, odmah vidite ocenu rizika i objašnjenje posledica.' },
        { icon: '🔎', title: 'Dublja analiza ugovora', text: 'Uz kviz, i AI analiza koja čita vaš stvarni ugovor i procenjuje svaki kriterijum (Pregled ugovora).' },
      ]}
      whyAisistent={[
        'Zasnovano na aktuelnom zakonskom tekstu, ne uopštenim savetima sa foruma',
        'Objašnjava svaki kriterijum jednostavnim jezikom, bez pravnog žargona',
        'Pokriva specifičan slučaj stranih nalogodavaca kao primarnog izvora prihoda',
        'Povezano sa AI analizom stvarnog ugovora za detaljniju procenu',
        'Besplatno, bez registracije potrebne za sam kviz',
      ]}
      relatedLinks={[
        { href: '/pregled-ugovora', label: 'Pregled ugovora — AI analiza pre potpisa' },
        { href: '/kalkulator-pausala', label: 'Kalkulator paušala' },
        { href: '/ugovor-o-delu', label: 'Generator ugovora o delu' },
      ]}
      faqs={[
        {
          q: 'Šta je test samostalnosti?',
          a: 'Test samostalnosti je zakonski mehanizam (čl. 85 Zakona o porezu na dohodak građana, u primeni od 1.3.2020.) kojim poreska uprava proverava da li je paušalno oporezovani preduzetnik u stvari prikriveno zaposlen kod nalogodavca. Sprovodi se posebno za svaki ugovorni odnos, na osnovu 9 kriterijuma.',
        },
        {
          q: 'Koliko kriterijuma mora biti ispunjeno da bih bio nesamostalan?',
          a: 'Ako je ispunjeno najmanje 5 od 9 kriterijuma, preduzetnik se smatra nesamostalnim u tom odnosu. Tada se prihod od tog nalogodavca ne oporezuje kao paušal, nego kao "drugi prihodi" po stopi od 20% na bruto iznos, uz doprinose za PIO.',
        },
        {
          q: 'Da li se test primenjuje i kad je nalogodavac firma iz inostranstva?',
          a: 'Da. Test se primenjuje bez obzira na to da li je nalogodavac domaća ili strana firma. Razlika je što strana firma nema obavezu obračuna poreza po odbitku — preduzetnik sam prijavljuje i plaća porez ako test "padne", što rizik čini lakše neprimećenim dok ne dođe do poreske kontrole.',
        },
        {
          q: 'Da li ovaj kviz zamenjuje savet knjigovođe ili advokata?',
          a: 'Ne. Kviz daje indikativnu procenu na osnovu vaših odgovora. Za konačnu ocenu i za konkretne korake u vašoj situaciji obavezno konsultujte knjigovođu ili poreskog savetnika.',
        },
      ]}
    />
  )
}
