import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Kalkulator paušalnog poreza Srbija 2026 | AIsistent',
  description: 'Besplatan kalkulator paušalnog oporezivanja za preduzetnike u Srbiji. Izračunajte vaš paušalni porez za 2026.',
  openGraph: {
    title: 'Kalkulator paušalnog poreza — Srbija 2026',
    description: 'Besplatan kalkulator paušalnog oporezivanja za preduzetnike u Srbiji. Izračunajte vaš paušalni porez za 2026.',
    url: 'https://aisistent.rs/kalkulator-pausala',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Kalkulator paušalnog poreza — Srbija 2026"
      heroFlightLabel="Obračun"
      intro="Brza procena paušalnog poreza i doprinosa za preduzetnike u Srbiji. Razumejte šta plaćate pre nego što se registrujete kao paušalni obveznik."
      ctaHref="/register"
      ctaLabel="Otvorite kalkulator"
      ctaTitle="Izračunajte odmah, besplatno"
      ctaNote="Besplatno za sve registrovane korisnike"
      features={[
        { icon: '🧮', title: 'Procena paušalnog poreza', text: 'Brza procena mesečnog paušalnog poreza i doprinosa prema delatnosti i mestu.' },
        { icon: '📊', title: 'Ažurirano 2026.', text: 'Aktualni parametri za obračun paušala u skladu sa propisima za 2026.' },
        { icon: '⚖️', title: 'Poređenje sa DOO', text: 'Razumejte prednosti i mane paušala u odnosu na DOO pre donošenja odluke.' },
        { icon: '💡', title: 'Informativni vodič', text: 'Uz kalkulator, vodič o tome ko može i ko ne može biti paušalac.' },
        { icon: '🔗', title: 'Zvanični kalkulator', text: 'Link na zvanični kalkulator Poreske uprave za tačan mesečni iznos.' },
        { icon: '📋', title: 'Dokumenti za paušalca', text: 'Uz kalkulator, i generator ugovora o delu i faktura u jednoj platformi.' },
      ]}
      whyAisistent={[
        'Informativni prikaz paušalnog poreza prilagođen srpskim propisima za 2026.',
        'Jasan vodič o uslovima za paušal — ko može, ko ne može',
        'Poređenje sa DOO i knjižnim vođenjem za informisanu odluku',
        'Direktan link na zvanični kalkulator Poreske uprave za tačan iznos',
        'Uz kalkulator, i svi dokumenti koji paušalcu trebaju — u jednoj platformi',
        'Besplatno za sve korisnike',
      ]}
      relatedLinks={[
        { href: '/kalkulator-zarade', label: 'Kalkulator zarade' },
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/blog/pausal-ili-doo', label: 'Članak: paušal ili DOO?' },
        { href: '/blog/kako-registrovati-firmu-srbija', label: 'Članak: kako registrovati firmu' },
      ]}
      faqs={[
        {
          q: 'Ko može biti paušalni poreski obveznik u Srbiji?',
          a: 'Paušalni obveznik može biti preduzetnik koji: godišnje ostvaruje prihode ispod 6 miliona RSD, nije PDV obveznik, nema zaposlene (u nekim slučajevima), i ne obavlja delatnost koja je zakonski isključena iz paušalnog oporezivanja. Isključene delatnosti su finansijsko posredovanje, osiguranje, promet nekretnina i neke druge. Programeri, dizajneri, konsultanti i prevodioci tipično mogu biti paušalci.',
        },
        {
          q: 'Kako se obračunava paušalni porez?',
          a: 'Paušalni porez utvrđuje Poreska uprava rešenjem na osnovu delatnosti (APR šifra), mesta poslovanja (Beograd plaća više od manjih gradova), prethodnih prihoda i grupe razvrstavanja. Iznos je mesečno fiksni — plaćate ga bez obzira na stvarne prihode tog meseca. Osim poreza, plaćate i doprinose za PIO i zdravstveno osiguranje.',
        },
        {
          q: 'Koja je razlika između paušalca i DOO?',
          a: 'Paušalac je preduzetnik — fizičko lice koje obavlja delatnost, bez ograničenja lične odgovornosti. DOO je privredno društvo — pravno lice sa ograničenom odgovornošću osnivača. Paušalac ne može vodi PDV, ima jednostavniju administraciju i niže troškove, ali je izložen ličnoj odgovornosti. DOO može biti PDV obveznik, privlačniji je za veće klijente, ali zahteva računovođu i veće troškove poslovanja.',
        },
        {
          q: 'Može li paušalac postati PDV obveznik?',
          a: 'Ne — paušalni obveznik ne može biti PDV obveznik. Ako preduzetnik postane PDV obveznik (obavezno pri prometu iznad 8 miliona RSD ili dobrovoljno), automatski gubi status paušalnog obveznika i mora da vodi poslovne knjige. Ovo je jedna od ključnih ograničenja paušalnog sistema za preduzetnike koji žele da sarađuju sa PDV obveznicima.',
        },
      ]}
    />
  )
}
