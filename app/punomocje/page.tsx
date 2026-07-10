import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Punomoćje — generator opšteg i specijalnog punomoćja | AIsistent',
  description: 'Generator punomoćja za zastupanje pred organima, bankama i firmama u Srbiji. Opšte i specijalno punomoćje.',
  openGraph: {
    title: 'Punomoćje — generator za zastupanje u Srbiji',
    description: 'Generator punomoćja za zastupanje pred organima, bankama i firmama u Srbiji. Opšte i specijalno punomoćje.',
    url: 'https://aisistent.rs/punomocje',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Punomoćje — generator za zastupanje u Srbiji"
      heroFlightLabel="Punomoćje"
      intro="Generišite punomoćje za zastupanje pred organima, bankama, sudovima i firmama. Podržava opšte, specijalno i sudsko punomoćje u skladu sa srpskim pravom."
      slug="punomocje"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['punomocje'].ctaLabel}
      ctaNote="PDF ili Word dokument za manje od 60 sekundi"
      features={[
        { icon: '👤', title: 'Identifikacija strana', text: 'Vlastodavac i punomoćnik jasno identifikovani — fizička lica i firme.' },
        { icon: '📋', title: 'Precizna ovlašćenja', text: 'Tačno navedeno šta punomoćnik sme da radi — koje radnje i pred kojim organima.' },
        { icon: '⏱️', title: 'Trajanje i opoziv', text: 'Definisano trajanje punomoćja i pravo vlastodavca na opoziv.' },
        { icon: '🏛️', title: 'Svi tipovi', text: 'Opšte, specijalno, sudsko i punomoćje za promet nepokretnosti.' },
        { icon: '✍️', title: 'Napomena o overi', text: 'Automatski uključena napomena o overi kod javnog beležnika gde je to obavezno.' },
        { icon: '📄', title: 'PDF i Word', text: 'Preuzmite dokument spreman za štampu i potpisivanje.' },
      ]}
      whyAisistent={[
        'Prilagođeno srpskom Zakonu o obligacionim odnosima i pravilima javnog beležništva',
        'Podržava četiri tipa: opšte, specijalno, sud i organi, nepokretnosti',
        'Ispravna deklinacija lica i naziva firmi u srpskom jeziku',
        'Jasna napomena kada je overa kod notara obavezna',
        'PDF i Word format — odmah upotrebljivo',
        'Besplatno za početak',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/ugovor-o-saradnji', label: 'Ugovor o saradnji' },
        { href: '/nda', label: 'NDA sporazum' },
      ]}
      faqs={[
        {
          q: 'Koja je razlika između opšteg i specijalnog punomoćja?',
          a: 'Opšte punomoćje ovlašćuje punomoćnika da preduzima sve pravne radnje u ime vlastodavca — široko ovlašćenje bez ograničenja na konkretnu radnju. Specijalno punomoćje daje ovlašćenje samo za jednu tačno određenu radnju (npr. potpisivanje jednog ugovora, zastupanje u jednom postupku). Za veće rizike (promet nekretnina, bankarski poslovi) uvek koristite specijalno punomoćje sa precizno navedenim ovlašćenjem.',
        },
        {
          q: 'Da li punomoćje mora biti overeno kod notara?',
          a: 'Zavisi od svrhe. Punomoćje za promet nepokretnosti (kupoprodaja, hipoteka) mora biti overeno kod javnog beležnika. Punomoćje za zastupanje pred sudom mora biti sudski overeno ili overeno kod beležnika. Za zastupanje pred državnim organima i firmama u svakodnevnom poslovanju, overa nije uvek obavezna — ali je preporučljiva jer sprečava odbacivanje dokumenta zbog sumnje u autentičnost potpisa.',
        },
        {
          q: 'Koliko dugo važi punomoćje?',
          a: 'Punomoćje može biti na određeni rok (npr. 6 meseci, 1 godina), do obavljanja određene radnje ili do opoziva. Ako rok nije naveden, smatra se da je dato do opoziva. Punomoćje automatski prestaje smrću vlastodavca ili punomoćnika, stečajem vlastodavca i opozvanjem.',
        },
        {
          q: 'Može li punomoćje biti opozvano?',
          a: 'Da, vlastodavac može opozvati punomoćje u svakom trenutku, osim ako se radi o neopozivom punomoćju datom u interesu punomoćnika. Opoziv je efikasan od trenutka kada punomoćnik za njega sazna. Preporučuje se pismeni opoziv koji se dostavlja trećim licima pred kojima je punomoćnik nastupao.',
        },
      ]}
    />
  )
}
