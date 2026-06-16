import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ugovor o delu — obrazac za freelancere | AIsistent',
  description:
    'Generator ugovora o delu za srpske freelancere i agencije. Prilagođen Zakonu o obligacionim odnosima RS.',
  keywords: [
    'ugovor o delu',
    'ugovor o delu srbija',
    'ugovor o delu freelancer',
    'ugovor o delu obrazac',
    'honorarni rad ugovor',
    'ugovor o delu porez',
  ],
  openGraph: {
    title: 'Ugovor o delu — obrazac za freelancere | AIsistent',
    description:
      'Generator ugovora o delu za srpske freelancere i agencije. Prilagođen Zakonu o obligacionim odnosima RS.',
    url: 'https://aisistent.rs/ugovor-o-delu',
    siteName: 'AIsistent',
    locale: 'sr_RS',
    type: 'website',
  },
}

const faq = [
  {
    q: 'Razlika između ugovora o radu i ugovora o delu?',
    a: 'Ugovor o radu zasniva trajni radni odnos sa punim pravima (PIO, zdravstveno, godišnji odmor). Ugovor o delu je za jednokratni ili projektni angažman — bez radnog odnosa. Izvođač je po pravilu preduzetnik ili fizičko lice koje prima honorar. Porez i doprinose po ugovoru o delu obračunava i plaća naručilac.',
  },
  {
    q: 'Koji porez se plaća na ugovor o delu?',
    a: 'Na honorar fizičkog lica plaća se porez na dohodak (20% na 80% honorara = efektivno 16%) i doprinosi za PIO (26%), ukupno oko 42%. Naručilac ih obračunava i uplaćuje pre isplate honorara. Ako je izvođač preduzetnik paušalac, naručilac ne plaća doprinose — samo fakturisani iznos.',
  },
  {
    q: 'Da li je ugovor o delu obavezan u pisanoj formi?',
    a: 'Zakon o obligacionim odnosima RS ne propisuje obaveznu pisanu formu, ali pisani ugovor je neophodan iz praktičnih razloga: dokaz o iznosu naknade, rokovima i predmetu dela, zaštita obe strane u slučaju spora. Poreska uprava može tražiti kopiju ugovora pri kontroli.',
  },
  {
    q: 'Može li stranac potpisati ugovor o delu u Srbiji?',
    a: 'Da, uz uslov da stranac ima pravo boravka i rada u Srbiji (radna dozvola). Iznimka: za kratke projektne angažmane (do 90 dana godišnje) iz zemalja sa kojima Srbija ima sporazum o socijalnom osiguranju, doprinosi mogu biti izuzeti. Preporučujemo konsultaciju sa računovođom.',
  },
]

const sadrzaj = [
  'Podaci o naručiocu i izvođaču',
  'Precizni opis dela/posla koji se izvodi',
  'Rokovi početka i završetka',
  'Iznos naknade i način isplate',
  'Vlasništvo nad rezultatom (IP)',
  'Opcionalno: NDA klauzula i zabrana konkurencije',
]

const prednosti = [
  { icon: '📋', title: 'Sve klauzule', text: 'Opis dela, rokovi, naknada, autorska prava — ništa ne preskačete.' },
  { icon: '🧮', title: 'Poreski podsetnik', text: 'Dokument uključuje napomenu o obavezi obračuna poreza i doprinosa.' },
  { icon: '⚡', title: 'Za 2 minuta', text: 'Brže od traženja template-a, unosa podataka i formatiranja u Wordu.' },
]

const ostaliAlati = [
  { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
  { href: '/nda', label: 'NDA sporazum' },
  { href: '/ponuda-klijentu', label: 'Ponuda klijentu' },
  { href: '/ugovor-o-saradnji', label: 'Ugovor o saradnji' },
]

const PRIMARY = '#1B6B4A'

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function UgovorODeluPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold" style={{ color: PRIMARY }}>
              AIsistent
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: PRIMARY }}
            >
              Besplatno počnite
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold" style={{ color: PRIMARY }}>
              Ugovori i dokumenti
            </span>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 leading-tight">
              Ugovor o delu —<br className="hidden sm:block" /> generator za freelancere i agencije
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
              Angažujete spoljnog saradnika? Potreban vam je ugovor o delu koji štiti obe strane,
              precizno definiše obaveze i uključuje sve poreski relevantne elemente po srpskom pravu.
              Spreman za 2 minuta.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: PRIMARY }}
            >
              Napravi ugovor o delu besplatno →
            </Link>
            <p className="mt-3 text-sm text-gray-400">Bez kreditne kartice. Besplatno za 1 dokument.</p>
          </div>

          <section className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Šta sadrži ovaj ugovor</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {sadrzaj.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: PRIMARY }}>✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Zašto AIsistent, a ne pravnik ili Word template?</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {prednosti.map(p => (
                <div key={p.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-3 text-3xl">{p.icon}</div>
                  <h3 className="mb-2 font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12 rounded-2xl p-10 text-center text-white" style={{ backgroundColor: PRIMARY }}>
            <h2 className="mb-3 text-2xl font-bold">Angažujete freelancera? Zaštitite se.</h2>
            <p className="mb-6 text-green-100">Ugovor o delu za 2 minuta. Besplatno za prvi dokument.</p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-white px-8 py-4 font-bold transition-all hover:bg-green-50"
              style={{ color: PRIMARY }}
            >
              Napravi ugovor o delu besplatno →
            </Link>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Česta pitanja</h2>
            <div className="space-y-4">
              {faq.map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-gray-100 bg-white p-6">
                  <h3 className="mb-2 font-semibold text-gray-900">{q}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Ostali alati koje možda trebate</h2>
            <div className="flex flex-wrap gap-3">
              {ostaliAlati.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-300 hover:text-green-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
          <Link href="/" className="font-semibold hover:text-gray-600" style={{ color: PRIMARY }}>AIsistent.rs</Link>
          {' '}— Generator poslovnih dokumenata za srpsko tržište
        </footer>
      </div>
    </>
  )
}
