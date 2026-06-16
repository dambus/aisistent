import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NDA sporazum — obrazac o čuvanju poslovne tajne | AIsistent',
  description:
    'Generator NDA sporazuma (Non-disclosure agreement) prilagođen srpskom pravu. Zaštitite poslovnu tajnu za 2 minuta.',
  keywords: [
    'NDA sporazum',
    'sporazum o poverljivosti',
    'non-disclosure agreement srbija',
    'zaštita poslovne tajne',
    'NDA obrazac',
    'ugovor o čuvanju tajne',
  ],
  openGraph: {
    title: 'NDA sporazum — obrazac o čuvanju poslovne tajne | AIsistent',
    description:
      'Generator NDA sporazuma prilagođen srpskom pravu. Zaštitite poslovnu tajnu za 2 minuta.',
    url: 'https://aisistent.rs/nda',
    siteName: 'AIsistent',
    locale: 'sr_RS',
    type: 'website',
  },
}

const faq = [
  {
    q: 'Šta je NDA i kada ga treba potpisati?',
    a: 'NDA (Non-Disclosure Agreement) ili Sporazum o poverljivosti je ugovor kojim se jedna ili obe strane obavezuju da neće otkrivati poverljive informacije trećim licima. Potpisuje se pre pregovora o poslovnoj saradnji, pri angažovanju zaposlenih sa pristupom poverljivim podacima, pre otkrivanja poslovnog plana investitoru ili partneru.',
  },
  {
    q: 'Da li NDA važi po srpskom pravu?',
    a: 'Da. NDA se zasniva na principu slobode ugovaranja (Zakon o obligacionim odnosima RS) i potpuno je pravno validan. Preporučujemo overu kod javnog beležnika za vredne poslovne tajne — nije obavezno, ali pojačava pravnu sigurnost i olakšava dokazivanje u slučaju spora.',
  },
  {
    q: 'Koliko traje NDA sporazum?',
    a: 'AIsistent vam nudi izbor trajanja: uobičajeno je 2–5 godina, ali može biti i na neodređeno vreme za posebno vredne tajne. Trajanje obaveze čuvanja tajne može biti duže od trajanja poslovne saradnje — to se definiše u ugovoru.',
  },
  {
    q: 'Šta se dešava ako neko prekrši NDA?',
    a: 'Oštećena strana može tražiti naknadu štete po opštim pravilima obligacionog prava. Ako je NDA predvideo ugovornu kaznu (poenalnu klauzulu), ta suma se može naplatiti bez dokazivanja visine štete. Preporučujemo da uvek uključite ugovornu kaznu — AIsistent to nudi kao opciju u formi.',
  },
]

const sadrzaj = [
  'Definicija poverljivih informacija',
  'Obaveza čuvanja i zabrana otkrivanja',
  'Trajanje sporazuma i perioda čuvanja',
  'Izuzeci od poverljivosti (javno dostupne informacije)',
  'Opcionalno: ugovorna kazna za prekršaj',
  'Opcionalno: zabrana konkurencije',
]

const prednosti = [
  { icon: '🔒', title: 'Sveobuhvatna zaštita', text: 'Sve ključne klauzule: definicija tajne, izuzeci, kazna za prekršaj.' },
  { icon: '⚖️', title: 'Srpsko pravo', text: 'Usklađen sa ZOO RS i sudskom praksom. Poziva se na domaće zakone.' },
  { icon: '✍️', title: 'Jednosmerni ili obostrani', text: 'Birajte između jednostranog (samo jedna strana čuva tajnu) i obostranog NDA.' },
]

const ostaliAlati = [
  { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
  { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
  { href: '/ugovor-o-saradnji', label: 'Ugovor o saradnji' },
  { href: '/ponuda-klijentu', label: 'Ponuda klijentu' },
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

export default function NdaPage() {
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
              NDA sporazum —<br className="hidden sm:block" /> zaštitite poslovnu tajnu
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
              Delite poslovni plan, tehnologiju ili strategiju? NDA sporazum sprečava
              zloupotrebu poverljivih informacija i važi po srpskom pravu.
              Generiše se za 2 minuta — jednostrani ili obostrani.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: PRIMARY }}
            >
              Napravi NDA sporazum besplatno →
            </Link>
            <p className="mt-3 text-sm text-gray-400">Bez kreditne kartice. Besplatno za 1 dokument.</p>
          </div>

          <section className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Šta sadrži ovaj sporazum</h2>
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
            <h2 className="mb-3 text-2xl font-bold">Zaštitite poslovnu tajnu za 2 minuta</h2>
            <p className="mb-6 text-green-100">NDA spreman za potpisivanje. Besplatno za prvi dokument.</p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-white px-8 py-4 font-bold transition-all hover:bg-green-50"
              style={{ color: PRIMARY }}
            >
              Napravi NDA sporazum besplatno →
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
