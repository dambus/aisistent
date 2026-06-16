import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ugovor o zakupu — obrazac za stan i poslovni prostor | AIsistent',
  description:
    'Besplatan generator ugovora o zakupu za stanove i poslovne prostore u Srbiji. Overen i spreman za potpisivanje.',
  keywords: [
    'ugovor o zakupu',
    'ugovor o zakupu stana',
    'ugovor o zakupu poslovnog prostora',
    'zakup stan srbija',
    'najam stan ugovor',
    'ugovor o zakupu obrazac',
  ],
  openGraph: {
    title: 'Ugovor o zakupu — obrazac za stan i poslovni prostor | AIsistent',
    description:
      'Besplatan generator ugovora o zakupu za stanove i poslovne prostore u Srbiji.',
    url: 'https://aisistent.rs/ugovor-o-zakupu',
    siteName: 'AIsistent',
    locale: 'sr_RS',
    type: 'website',
  },
}

const faq = [
  {
    q: 'Šta mora da sadrži ugovor o zakupu stana?',
    a: 'Prema Zakonu o stanovanju RS, ugovor mora da sadrži: opis nepokretnosti, visinu zakupnine i rok plaćanja, trajanje zakupa i otkazni rok, podatke o zakupodavcu i zakupcu. Preporučujemo da se doda i opis zatečenog stanja stana i popis opreme.',
  },
  {
    q: 'Da li je ugovor o zakupu potrebno overiti kod notara?',
    a: 'Za stanove: overa nije zakonski obavezna, ali je preporučljiva jer overen ugovor važi kao izvršna isprava — lakše se sprovodi iseljenje u slučaju kašnjenja sa plaćanjem. Za poslovni prostor: obavezna registracija ugovora u APR-u nije propisana, ali se preporučuje za poreske svrhe.',
  },
  {
    q: 'Kako raskinuti ugovor o zakupu?',
    a: 'Raskid zavisi od odredbi ugovora i razloga raskida. Na određeno vreme: ugovor ističe automatski, ili se raskida otkaznim rokom (uobičajeno 30–60 dana). Na neodređeno vreme: svaka strana može dati otkaz uz pisanu najavu. Posebni slučajevi (neplaćanje, šteta) mogu dati pravo na raskid bez otkaznog roka.',
  },
  {
    q: 'Koliki je porez na prihode od zakupa u Srbiji?',
    a: 'Fizičko lice koje iznajmljuje nepokretnost plaća 20% poreza na dohodak (na 80% prihoda = efektivno 16%) i obavezno je da prijavi prihode Poreskoj upravi. Ugovor o zakupu mora biti prijavljen PU u roku od 30 dana od zaključivanja. Firme koje iznajmljuju prostor plaćaju porez prema svom poreskom statusu.',
  },
]

const sadrzaj = [
  'Podaci o zakupodavcu i zakupcu',
  'Opis nepokretnosti (adresa, struktura, kvadratura)',
  'Visina zakupnine i rok plaćanja',
  'Trajanje zakupa i otkazni rok',
  'Obaveze i prava obe strane',
  'Opcionalno: depozit, komunalije, kućni red',
]

const prednosti = [
  { icon: '🏠', title: 'Stan i poslovni prostor', text: 'Odabir tipa zakupa — stambeni, poslovni ili kratkoročni (Airbnb).' },
  { icon: '📋', title: 'Sve obavezne stavke', text: 'Opis nepokretnosti, depozit, komunalije, zabrana podzakupa — ništa ne propuštate.' },
  { icon: '⚠️', title: 'Poreski podsetnik', text: 'Obavezan ste da prijavite zakup Poreskoj upravi. AIsistent vas upozorava na rok.' },
]

const ostaliAlati = [
  { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
  { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
  { href: '/nda', label: 'NDA sporazum' },
  { href: '/punomocje', label: 'Punomoćje' },
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

export default function UgovorOZakupuPage() {
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
              Ugovor o zakupu —<br className="hidden sm:block" /> generator za stanodavce i zakupce
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
              Iznajmljujete stan ili poslovni prostor? Ugovor o zakupu štiti i stanodavca i zakupca,
              obavezan je za prijavljivanje Poreskoj upravi i potreban je kod sudskih sporova.
              Generiše se za 2 minuta.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: PRIMARY }}
            >
              Napravi ugovor o zakupu besplatno →
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
            <h2 className="mb-3 text-2xl font-bold">Zaštitite se pre nego što date ključ</h2>
            <p className="mb-6 text-green-100">Ugovor o zakupu za 2 minuta. Besplatno za prvi dokument.</p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-white px-8 py-4 font-bold transition-all hover:bg-green-50"
              style={{ color: PRIMARY }}
            >
              Napravi ugovor o zakupu besplatno →
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
