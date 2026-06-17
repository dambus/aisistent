import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Ugovor o saradnji — generator za partnerstva | AIsistent',
  description: 'Generator ugovora o saradnji između firmi. Partnerski ugovor prilagođen srpskom pravu — PDF za 60 sekundi.',
  openGraph: {
    title: 'Ugovor o saradnji — generator za poslovne partnere',
    description: 'Generator ugovora o saradnji između firmi. Partnerski ugovor prilagođen srpskom pravu — PDF za 60 sekundi.',
    url: 'https://aisistent.rs/ugovor-o-saradnji',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      previewSlug="ugovor-o-saradnji"
      h1="Ugovor o saradnji — generator za poslovne partnere"
      intro="Generišite kompletan ugovor o poslovnoj saradnji ili ugovor o zajmu prilagođen srpskom pravu. Wizard vas vodi kroz sve bitne klauzule — od podele prihoda do raskida."
      ctaHref="/register"
      ctaLabel="Generišite ugovor besplatno"
      ctaNote="Dokument u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '🤝', title: 'Identifikacija strana', text: 'Tačna identifikacija obe ugovorne strane — firme, preduzetnici ili fizička lica.' },
        { icon: '🎯', title: 'Predmet i cilj saradnje', text: 'Precizno definisan predmet saradnje, doprinos svake strane i zajednički cilj.' },
        { icon: '💰', title: 'Podela prihoda', text: 'Ugovorena podela prihoda i troškova — procentualna, fiksna ili po projektu.' },
        { icon: '🔒', title: 'Poverljivost (NDA)', text: 'Standardna klauzula o čuvanju poverljivih informacija između poslovnih partnera.' },
        { icon: '⚖️', title: 'Intelektualna svojina', text: 'Definisano vlasništvo nad rezultatima rada i intelektualnom svojinom.' },
        { icon: '📋', title: 'Raskid i sporovi', text: 'Uslovi raskida, otkazni rok i nadležnost suda u skladu sa srpskim pravom.' },
      ]}
      whyAisistent={[
        'Prilagođen srpskom Zakonu o obligacionim odnosima',
        'Podržava i ugovor o saradnji i ugovor o zajmu — izaberete tip u wizard-u',
        'Automatska deklinacija naziva firmi i lica u srpskom jeziku',
        'PDF i Word (DOCX) format spreman za potpisivanje',
        'Arhiva svih dokumenata na jednom mestu',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/nda', label: 'NDA sporazum' },
        { href: '/punomocje', label: 'Punomoćje' },
        { href: '/blog/ugovor-o-delu-vs-ugovor-o-radu', label: 'Članak: ugovor o delu vs. radu' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži ugovor o saradnji između firmi?',
          a: 'Ugovor o poslovnoj saradnji mora da sadrži: identifikaciju obe strane (PIB, adresa, zastupnik), precizno definisan predmet i cilj saradnje, doprinos svake strane (novac, rad, resursi), podelu prihoda i troškova, trajanje, uslove raskida i merodavno pravo. Poželjno je i uključiti NDA klauzulu i odredbe o vlasništvu nad intelektualnom svojinom.',
        },
        {
          q: 'Koja je razlika između ugovora o saradnji i ortačkog ugovora?',
          a: 'Ugovor o saradnji reguliše saradnju između pravno samostalnih subjekata koji ostaju odvojeni entiteti. Ortački ugovor osniva ortačko društvo — novi pravni subjekat gde ortaci dele neograničenu odgovornost. Ugovor o saradnji je daleko češći u srpskoj poslovnoj praksi jer ne kreira novi pravni subjekt i ne nosi neograničenu odgovornost.',
        },
        {
          q: 'Da li ugovor o saradnji treba overiti kod notara?',
          a: 'Za većinu ugovora o poslovnoj saradnji overa kod javnog beležnika nije zakonski obavezna. Izuzetak su ugovori koji se tiču nepokretnosti ili koji se registruju kod APR-a. Preporučuje se overiti ugovor za saradnju veće vrednosti ili dugoročno trajanje, jer to otežava ospojavanje potpisa.',
        },
        {
          q: 'Može li ugovor o saradnji biti na određeno vreme?',
          a: 'Da, ugovor o saradnji može biti na određeno ili neodređeno vreme. Na određeno vreme je čest kada saradnja prati konkretan projekat ili tender. Na neodređeno vreme ima smisla za stalnu poslovnu saradnju — obavezno je tada precizno definisati otkazni rok i uslove raskida.',
        },
      ]}
    />
  )
}
