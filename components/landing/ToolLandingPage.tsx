import Link from 'next/link'

export interface FAQ {
  q: string
  a: string
}

export interface ToolLandingPageProps {
  h1: string
  intro: string
  features: { icon: string; title: string; text: string }[]
  whyAisistent: string[]
  ctaHref: string
  ctaLabel: string
  ctaNote?: string
  relatedLinks: { href: string; label: string }[]
  faqs: FAQ[]
  isLoggedIn?: boolean
}

const PRIMARY = '#1B6B4A'

function LandingHeader({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center">
          <img
            src="/logo/AIsistent-Logo_6003x180.png"
            alt="AIsistent"
            height={32}
            style={{ objectFit: 'contain', maxWidth: '150px', width: 'auto' }}
          />
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              Moji dokumenti
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Prijavi se
              </Link>
              <Link
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                Besplatno
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} AIsistent · <Link href="/" className="hover:underline">Početna</Link> · <Link href="/login" className="hover:underline">Prijava</Link></p>
      <p className="mt-1 text-xs text-gray-400">Dokumenti generisani ovim alatom služe kao polazna osnova. Preporučuje se pravna provera pre potpisivanja.</p>
    </footer>
  )
}

export function ToolLandingPage({
  h1,
  intro,
  features,
  whyAisistent,
  ctaHref,
  ctaLabel,
  ctaNote,
  relatedLinks,
  faqs,
  isLoggedIn,
}: ToolLandingPageProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingHeader isLoggedIn={isLoggedIn} />

      <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-5 py-16 text-center lg:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            {intro}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="w-full rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:w-auto"
              style={{ backgroundColor: PRIMARY }}
            >
              {ctaLabel}
            </Link>
            {ctaNote && (
              <p className="text-sm text-gray-500">{ctaNote}</p>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-400">Besplatno za početak · Bez kreditne kartice</p>
        </section>

        {/* Features */}
        <section className="bg-[#F8FAF9] py-14">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Šta sadrži dokument</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="mb-3 text-2xl">{f.icon}</div>
                  <h3 className="mb-1 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why AIsistent */}
        <section className="mx-auto max-w-4xl px-5 py-14">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Zašto AIsistent</h2>
          <ul className="mx-auto max-w-2xl space-y-3">
            {whyAisistent.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: PRIMARY }}>✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA mid */}
        <section className="bg-[#F8FAF9] py-12 text-center">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-2xl font-bold text-gray-900">Isprobajte besplatno</h2>
            <p className="mt-2 text-gray-600">Bez registracije kreditne kartice. Besplatan plan uključuje 1 dokument mesečno.</p>
            <Link
              href={ctaHref}
              className="mt-6 inline-block rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              {ctaLabel}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Česta pitanja</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        {relatedLinks.length > 0 && (
          <section className="bg-[#F8FAF9] py-10">
            <div className="mx-auto max-w-4xl px-5">
              <h2 className="mb-5 text-center text-lg font-semibold text-gray-700">Pogledajte i</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {relatedLinks.map((l, i) => (
                  <Link
                    key={i}
                    href={l.href}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <LandingFooter />
    </>
  )
}
