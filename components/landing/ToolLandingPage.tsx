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
const DARK = '#052e16'
const DARK_ALT = '#0f1f0f'

const navLinks = [
  { href: '/#alati', label: 'Alati' },
  { href: '/blog', label: 'Blog' },
  { href: '/#cenovnik', label: 'Cenovnik' },
]

const TOOL_LANDING_STYLES = `
.tool-hero-grid {
  display: grid;
  gap: 40px;
  align-items: center;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.95fr);
}

.tool-doc-preview {
  display: flex;
  justify-content: flex-end;
}

.tool-secondary-btn {
  border: 1px solid rgba(255, 255, 255, 0.85);
  color: white;
  background: transparent;
  transition: all 0.15s ease;
}

.tool-secondary-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: white;
}

.tool-primary-btn {
  transition: all 0.15s ease;
}

.tool-primary-btn:hover {
  background: #f0fdf4;
}

.tool-feature-card {
  border-left: 3px solid ${PRIMARY};
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.tool-feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
  border-left-color: ${DARK};
}

.tool-faq-item {
  border-bottom: 1px solid #e5e7eb;
}

.tool-faq-item summary {
  list-style: none;
}

.tool-faq-item summary::-webkit-details-marker {
  display: none;
}

.tool-faq-item .tool-faq-arrow {
  transition: transform 0.18s ease;
}

.tool-faq-item[open] .tool-faq-arrow {
  transform: rotate(90deg);
}

@media (max-width: 767px) {
  .tool-hero-grid {
    grid-template-columns: 1fr;
  }

  .tool-doc-preview {
    display: none;
  }
}
`

function getToolLabel(h1: string) {
  return h1.split('—')[0]?.trim() || h1
}

function LandingHeader({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center">
          <img
            src="/logo/AIsistent-Logo_6003x180.png"
            alt="AIsistent"
            height={32}
            style={{ objectFit: 'contain', maxWidth: '160px', width: 'auto' }}
          />
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            Moji dokumenti
          </Link>
        ) : (
          <Link
            href="/register"
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            Počnite besplatno
          </Link>
        )}
      </nav>
    </header>
  )
}

function LandingFooter() {
  return (
    <footer style={{ backgroundColor: DARK, color: '#d1fae5' }} className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-semibold text-white">Alati</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Ugovor o radu', '/ugovor-o-radu'],
                ['Ugovor o delu', '/ugovor-o-delu'],
                ['NDA sporazum', '/nda'],
                ['Ugovor o zakupu', '/ugovor-o-zakupu'],
                ['Ugovor o saradnji', '/ugovor-o-saradnji'],
                ['Punomoćje', '/punomocje'],
                ['Opšti uslovi', '/opsti-uslovi'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} style={{ color: '#6ee7b7' }} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">Resursi</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Blog', '/blog'],
                ['Kalkulator zarade', '/kalkulator-zarade'],
                ['Kalkulator paušala', '/kalkulator-pausala'],
                ['Poslovni mejl', '/poslovni-mejl'],
                ['Oglas za posao', '/oglas-za-posao'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} style={{ color: '#6ee7b7' }} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">AIsistent</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#6ee7b7' }}>
              <li>
                <a href="mailto:info@aisistent.rs" className="transition-colors hover:text-white">
                  info@aisistent.rs
                </a>
              </li>
              <li>Napravljeno u Srbiji</li>
            </ul>
          </div>
        </div>
        <div
          className="space-y-1 border-t pt-6 text-center text-xs"
          style={{ borderColor: '#14532d', color: '#6ee7b7' }}
        >
          <p>© 2026 AIsistent. Sva prava zadržana.</p>
          <p>Dokumenti generisani uz pomoć AIsistenta. Preporučuje se pravna provera pre upotrebe.</p>
        </div>
      </div>
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
  const toolLabel = getToolLabel(h1)
  const ctaTitle = `Napravite ${toolLabel} za 60 sekundi`
  const positioningBenefits = [
    'Nacrt dokumenta spreman za 60 sekundi — umesto sati pisanja od nule',
    'Svi obavezni elementi po srpskom pravu već su uključeni',
    'PDF i Word format — spreman za pregled i potpisivanje',
    'Arhiva svih dokumenata na jednom mestu',
    'Pravnik koji proverava gotov nacrt troši manje vremena — a vi plaćate manje',
    'Idealno za tipične situacije — konsultujte stručnjaka za složene slučajeve',
  ]
  void whyAisistent

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
      <style dangerouslySetInnerHTML={{ __html: TOOL_LANDING_STYLES }} />
      <LandingHeader isLoggedIn={isLoggedIn} />

      <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
        <section style={{ backgroundColor: DARK, padding: '72px 24px' }}>
          <div className="tool-hero-grid mx-auto max-w-6xl">
            <div>
              <div className="mb-6 text-sm" style={{ color: '#6ee7b7' }}>
                <Link href="/" className="transition-opacity hover:opacity-80">Početna</Link>
                <span className="mx-2">→</span>
                <a href="/#alati" className="transition-opacity hover:opacity-80">Alati</a>
                <span className="mx-2">→</span>
                <span>{toolLabel}</span>
              </div>
              <h1
                className="max-w-3xl text-white"
                style={{ fontSize: 'clamp(34px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.15 }}
              >
                {h1}
              </h1>
              <p
                className="mt-5 max-w-[520px]"
                style={{ color: '#a7f3d0', fontSize: '18px', lineHeight: 1.7 }}
              >
                {intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={ctaHref}
                  className="tool-primary-btn inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold"
                  style={{ backgroundColor: 'white', color: DARK }}
                >
                  Generišite {toolLabel} besplatno
                </Link>
                <a
                  href="#sta-sadrzi"
                  className="tool-secondary-btn inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold"
                >
                  Pogledajte primer ↓
                </a>
              </div>
              <p className="mt-5 text-sm" style={{ color: '#6ee7b7', fontSize: '13px' }}>
                ✓ Besplatno za početak · ✓ PDF i Word format · ✓ Srpsko pravo
              </p>
              {ctaNote && (
                <p className="mt-3 text-sm" style={{ color: '#a7f3d0' }}>
                  {ctaNote}
                </p>
              )}
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#6ee7b7', opacity: 0.8 }}>
                Dokumenti služe kao polazna osnova. Za složene slučajeve konsultujte pravnika.
              </div>
            </div>

            <div className="tool-doc-preview">
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  maxWidth: '280px',
                  width: '100%',
                  boxShadow: '0 24px 50px rgba(0,0,0,0.22)',
                }}
              >
                <div
                  style={{
                    height: '10px',
                    backgroundColor: PRIMARY,
                    borderRadius: '4px',
                    marginBottom: '16px',
                    width: '60%',
                  }}
                />
                {['100%', '85%', '92%', '70%', '88%', '75%'].map((width, index) => (
                  <div
                    key={index}
                    style={{
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      width,
                    }}
                  />
                ))}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: PRIMARY,
                    fontWeight: 600,
                  }}
                >
                  ✓ Generisan za 45 sekundi
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sta-sadrzi" className="px-6 py-16" style={{ backgroundColor: '#f9fafb' }}>
          <div className="mx-auto max-w-6xl">
            <p
              className="mb-3 text-sm font-bold uppercase tracking-[0.16em]"
              style={{ color: PRIMARY }}
            >
              Šta dobijate
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: DARK }}>
              Šta sadrži dokument
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="tool-feature-card rounded-2xl bg-white p-6"
                  style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}
                >
                  <div
                    className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: PRIMARY }}
                    aria-hidden="true"
                  >
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16" style={{ backgroundColor: DARK_ALT }}>
          <div className="mx-auto max-w-6xl">
            <p
              className="mb-3 text-sm font-bold uppercase tracking-[0.16em]"
              style={{ color: '#6ee7b7' }}
            >
              Prednosti
            </p>
            <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
              Štedite vreme na pripremi
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: '#a7f3d0' }}>
              AIsistent pripremi nacrt — vi (ili vaš pravnik) ga finalizujete.
            </p>
            <div className="mt-10 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {positioningBenefits.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="mt-1 text-lg font-bold" style={{ color: '#6ee7b7' }}>
                    ✓
                  </span>
                  <p style={{ color: '#d1fae5', lineHeight: 1.7 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div
            className="mx-auto max-w-5xl rounded-[28px] px-6 py-14 text-center sm:px-10"
            style={{ background: 'linear-gradient(135deg, #1B6B4A 0%, #052e16 100%)' }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7" style={{ color: '#d1fae5' }}>
              Bez registracije kreditne kartice.
            </p>
            <Link
              href={ctaHref}
              className="tool-primary-btn mt-8 inline-flex rounded-xl px-10 py-4 text-base font-bold"
              style={{ backgroundColor: 'white', color: DARK }}
            >
              {ctaLabel}
            </Link>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-bold sm:text-4xl" style={{ color: DARK }}>
              Česta pitanja
            </h2>
            <div className="mt-10">
              {faqs.map((faq, index) => (
                <details key={index} className="tool-faq-item py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-1">
                    <span className="text-left text-base font-semibold text-gray-900">{faq.q}</span>
                    <span className="tool-faq-arrow text-base font-bold" style={{ color: PRIMARY }}>
                      ▶
                    </span>
                  </summary>
                  <div className="pr-8 pt-3 text-gray-600" style={{ lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {relatedLinks.length > 0 && (
          <section className="px-6 py-16" style={{ backgroundColor: '#f9fafb' }}>
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-3xl font-bold sm:text-4xl" style={{ color: DARK }}>
                Pogledajte i
              </h2>
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {relatedLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="group rounded-xl bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      borderTop: `3px solid ${PRIMARY}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    <p className="text-sm font-semibold leading-7 text-gray-900 transition-colors group-hover:text-green-800">
                      {link.label}
                    </p>
                    <p className="mt-3 text-sm font-semibold" style={{ color: PRIMARY }}>
                      Otvorite alat →
                    </p>
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
