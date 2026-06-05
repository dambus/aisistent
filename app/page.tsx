import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MobileMenu from '@/components/landing/MobileMenu'

export const metadata: Metadata = {
  title: 'AIsistent — Pravni dokumenti i poslovni alati za srpske preduzetnike',
  description:
    'Generator ugovora, poslovnih mejlova i HR dokumenata prilagođenih srpskom pravu. Ugovor o radu, NDA, ponuda klijentu i još 7 alata. Besplatno za početak.',
  openGraph: {
    title: 'AIsistent — Pravni dokumenti i poslovni alati za srpske preduzetnike',
    description:
      'Generator ugovora, poslovnih mejlova i HR dokumenata prilagođenih srpskom pravu. Besplatno za početak.',
    url: 'https://aisistent.rs',
    siteName: 'AIsistent',
    locale: 'sr_RS',
    type: 'website',
  },
}

const PRIMARY = '#1B6B4A'
const PRIMARY_DARK = '#155a3e'
const SURFACE = '#F8FAF9'

const navLinks = [
  { href: '#kako-radi', label: 'Kako radi' },
  { href: '#alati', label: 'Alati' },
  { href: '#cenovnik', label: 'Cenovnik' },
]

const steps = [
  {
    num: '1',
    icon: '📝',
    title: 'Popunite kratku formu',
    text: 'Unesite osnovne podatke. Nema pravnog znanja potrebno — vodimo vas korak po korak.',
  },
  {
    num: '2',
    icon: '⚡',
    title: 'AIsistent generiše za vas',
    text: 'Za manje od 60 sekundi dobijate kompletan dokument prilagođen srpskom pravu i vašem poslu.',
  },
  {
    num: '3',
    icon: '📥',
    title: 'Preuzmite i koristite',
    text: 'PDF ili Word format, spreman za potpisivanje. Sačuvan u arhivi za buduće korišćenje.',
  },
]

interface Tool {
  name: string
  desc: string
  type: string
}

interface ToolCategory {
  title: string
  tools: Tool[]
}

const toolCategories: ToolCategory[] = [
  {
    title: '📄 Ugovori i dokumenti',
    tools: [
      { name: 'Ugovor o radu',    desc: 'Usklađen sa Zakonom o radu RS',               type: 'ugovor-o-radu' },
      { name: 'Ugovor o delu',    desc: 'Za samostalne saradnike i projektnu saradnju',   type: 'ugovor-o-delu' },
      { name: 'NDA Sporazum',     desc: 'Zaštitite poslovnu tajnu',                     type: 'nda' },
      { name: 'Ugovor o zakupu',  desc: 'Za stanove i poslovne prostore',               type: 'ugovor-o-zakupu' },
      { name: 'Ugovor o saradnji',desc: 'Za partnerstva i zajedničke projekte',          type: 'ugovor-o-saradnji' },
      { name: 'Punomoćje',        desc: 'Za zastupanje pred organima i firmama',         type: 'punomocje' },
      { name: 'Opšti uslovi i Politika privatnosti', desc: 'Obavezno za svaki sajt',   type: 'opsti-uslovi' },
    ],
  },
  {
    title: '✉️ Poslovna komunikacija',
    tools: [
      { name: 'Poslovni mejl',    desc: 'Ponuda, opomena, zahvalnica i još 7 tipova',   type: 'poslovni-mejl' },
      { name: 'Ponuda klijentu',  desc: 'Profesionalna poslovna ponuda za 2 minuta',    type: 'ponuda-klijentu' },
    ],
  },
  {
    title: '👥 HR i zapošljavanje',
    tools: [
      { name: 'Oglas za posao',   desc: 'Privucite prave kandidate na Infostud i LinkedIn', type: 'oglas-za-posao' },
    ],
  },
]

const upcomingTools = [
  { name: 'Pravilnik o radu',           desc: 'Obavezan za firme sa 10+ zaposlenih' },
  { name: 'Zapisnik sa sastanka',        desc: 'Profesionalni zapisnici za timove' },
  { name: 'Opis proizvoda/usluge',       desc: 'Za sajt, katalog i društvene mreže' },
]

const withoutAisistent = [
  'Sat vremena pisanja ugovora',
  'Pravnik košta 100€+ po dokumentu',
  'ChatGPT ne zna srpsko pravo',
  'Dokumenti u različitim folderima',
  'Svaki put od nule',
]

const withAisistent = [
  'Gotov dokument za 2 minuta',
  'Mesečna pretplata jeftinija od jednog sata kod pravnika',
  'Prilagođeno srpskom pravu i praksi',
  'Svi dokumenti na jednom mestu',
  'Arhiva za ponovno korišćenje',
]

interface PricingPlan {
  name: string
  price: string
  euroEquivalent?: string
  badge?: string
  cta: string
  href: string
  featured?: boolean
  features: [string, string][]
}

const pricing: PricingPlan[] = [
  {
    name: 'Besplatno',
    price: 'Besplatno',
    cta: 'Počnite besplatno',
    href: '/register',
    features: [
      ['✓', '3 dokumenta mesečno'],
      ['✓', 'PDF format'],
      ['✓', 'Sve kategorije alata'],
      ['✕', 'Word format'],
      ['✕', 'Arhiva dokumenata'],
    ],
  },
  {
    name: 'Starter',
    price: '1.080 RSD / mes.',
    euroEquivalent: '(≈ 9 EUR)',
    cta: 'Izaberite Starter',
    href: '/register',
    features: [
      ['✓', '20 dokumenata mesečno'],
      ['✓', 'PDF bez oznake'],
      ['✓', 'Word format'],
      ['✓', 'Arhiva dokumenata'],
      ['✕', 'Višekorisnički pristup'],
    ],
  },
  {
    name: 'Pro',
    price: '3.000 RSD / mes.',
    euroEquivalent: '(≈ 25 EUR)',
    badge: 'Najpopularnije',
    cta: 'Izaberite Pro',
    href: '/register',
    featured: true,
    features: [
      ['✓', 'Neograničen broj dokumenata'],
      ['✓', 'PDF i Word format'],
      ['✓', 'Arhiva dokumenata'],
      ['✓', 'Brza tehnička podrška'],
      ['✕', 'Višekorisnički pristup'],
    ],
  },
  {
    name: 'Business',
    price: '7.200 RSD / mes.',
    euroEquivalent: '(≈ 60 EUR)',
    cta: 'Kontaktirajte nas',
    href: 'mailto:info@aisistent.rs',
    features: [
      ['✓', 'Sve iz Pro plana'],
      ['✓', 'Do 5 korisnika'],
      ['✓', 'Ažurna tehnička podrška'],
      ['✓', 'Prilagođeni izgled dokumenata (uskoro)'],
    ],
  },
]

function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="/" className="text-xl font-bold" style={{ color: PRIMARY }}>
          AIsistent
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <a
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Moji dokumenti
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
              >
                Prijavi se
              </a>
              <a
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                Počnite besplatno
              </a>
            </>
          )}
        </div>

        <MobileMenu isLoggedIn={isLoggedIn} navLinks={navLinks} />
      </nav>
    </header>
  )
}

function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-gray-600">{text}</p>}
    </div>
  )
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header isLoggedIn={isLoggedIn} />

      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative overflow-hidden border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #F0F7F4 60%, #F8FAF9 100%)' }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <p
              className="mb-5 inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: '#c6dfd4', backgroundColor: '#edf7f2', color: PRIMARY }}
            >
              Švajcarski nož za mali biznis
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Pravni dokumenti i poslovni alati za vaš biznis — za 2 minuta
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Prestanite da gubite vreme na ugovore, mejlove i papirologiju. AIsistent generiše
              profesionalne dokumente prilagođene srpskom tržištu — brzo, jednostavno, bez advokata.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={isLoggedIn ? '/dashboard' : '/register'}
                className="rounded-xl px-7 py-4 text-center text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{ backgroundColor: PRIMARY }}
              >
                {isLoggedIn ? 'Moji dokumenti' : 'Počnite besplatno'}
              </a>
              <a
                href="#alati"
                className="rounded-xl border border-gray-300 bg-white px-7 py-4 text-center text-base font-semibold text-gray-800 transition-all duration-200 hover:border-gray-400 hover:shadow-sm"
              >
                Pogledajte alate
              </a>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500">
              ✓ Bez avansa &nbsp;·&nbsp; ✓ Srpsko pravo &nbsp;·&nbsp; ✓ PDF i Word format
            </p>
          </div>

          {/* Hero illustration — dashboard mockup */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
            <div className="rounded-xl bg-gray-900 p-5 text-white">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold" style={{ color: '#6ee7b7' }}>AIsistent radni sto</span>
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#052e16', color: '#6ee7b7' }}>
                  spreman
                </span>
              </div>
              <div className="grid gap-3">
                {['Ugovor o radu', 'Poslovni mejl', 'Ponuda klijentu', 'Oglas za posao'].map(item => (
                  <div key={item} className="flex items-center justify-between rounded-xl bg-white/8 p-4">
                    <div>
                      <p className="font-semibold text-white">{item}</p>
                      <p className="text-sm text-gray-400">Generisan za 45 sekundi</p>
                    </div>
                    <span style={{ color: '#6ee7b7' }}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KAKO RADI ── */}
      <section id="kako-radi" className="px-5 py-20 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <SectionHeading
          eyebrow="Proces"
          title="Kako funkcioniše?"
          text="Tri koraka do gotovog dokumenta"
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {steps.map(step => (
            <article
              key={step.title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div
                className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                {step.num}
              </div>
              <div className="mb-4 text-4xl">{step.icon}</div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── ALATI ── */}
      <section id="alati" className="bg-white px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="10 alata"
          title="Sve što vašem biznisu treba"
          text="Švajcarski nož za srpske preduzetnike — u jednoj pretplati"
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-10">
          {toolCategories.map(category => (
            <div key={category.title}>
              <div className="mb-5 flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map(tool => (
                  <article
                    key={tool.name}
                    className="flex min-h-40 flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ ['--hover-border' as string]: PRIMARY }}
                  >
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{tool.name}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{tool.desc}</p>
                    </div>
                    <a
                      href={isLoggedIn ? `/dokumenti/${tool.type}` : '/register'}
                      className="mt-4 text-sm font-semibold transition-colors duration-200"
                      style={{ color: PRIMARY }}
                    >
                      Napravite dokument →
                    </a>
                  </article>
                ))}
              </div>
            </div>
          ))}

          {/* Uskoro */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-400">🏢 Uskoro</h3>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 opacity-50 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTools.map(tool => (
                <article
                  key={tool.name}
                  className="min-h-28 cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 p-5"
                >
                  <h4 className="text-base font-bold text-gray-700">{tool.name}</h4>
                  <p className="mt-1.5 text-sm text-gray-500">{tool.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ZAŠTO AISISTENT ── */}
      <section id="zasto" className="px-5 py-20 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <SectionHeading title="Zašto AIsistent, a ne ChatGPT?" />
        <div className="mx-auto mt-12 grid max-w-5xl items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
            <h3 className="text-lg font-bold text-red-700">Bez AIsistenta</h3>
            <ul className="mt-5 grid gap-3">
              {withoutAisistent.map(item => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 text-red-400">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-lg"
            style={{ backgroundColor: PRIMARY }}
          >
            VS
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-8">
            <h3 className="text-lg font-bold" style={{ color: PRIMARY }}>Sa AIsistentom</h3>
            <ul className="mt-5 grid gap-3">
              {withAisistent.map(item => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5" style={{ color: PRIMARY }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CENOVNIK ── */}
      <section id="cenovnik" className="bg-gray-900 px-5 py-20 text-white lg:px-8">
        <SectionHeading
          title="Jednostavne cene, bez iznenađenja"
          text="Otkažite kad hoćete. Bez ugovora."
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pricing.map(plan => (
            <article
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all duration-200 ${
                plan.featured
                  ? 'border-2 bg-white text-gray-900 shadow-xl'
                  : 'border-white/10 bg-white/5 hover:bg-white/8'
              }`}
              style={plan.featured ? { borderColor: PRIMARY } : {}}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-5 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-3 text-4xl font-bold">
                {plan.price}
              </p>
              {plan.euroEquivalent && (
                <p className="mt-1 text-xs font-medium opacity-60">{plan.euroEquivalent}</p>
              )}
              <ul className="mt-6 grid gap-2.5 text-sm">
                {plan.features.map(([mark, text]) => (
                  <li key={text} className="flex gap-2.5">
                    <span
                      className={mark === '✓' ? 'font-bold' : 'opacity-30'}
                      style={mark === '✓' ? { color: plan.featured ? PRIMARY : '#6ee7b7' } : {}}
                    >
                      {mark}
                    </span>
                    <span className={mark === '✓' ? '' : 'opacity-40'}>{text}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className="mt-7 block rounded-lg px-5 py-3 text-center text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
                style={
                  plan.featured
                    ? { backgroundColor: PRIMARY, color: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }
                }
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-sm text-gray-400">
          * Cene su u dinarima. Plaćanje karticom ili bankovnim transferom.
        </p>
      </section>

      {/* ── FINALNI CTA ── */}
      <section
        className="px-5 py-20 text-center lg:px-8"
        style={{ backgroundColor: PRIMARY }}
      >
        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Napravite prvi dokument već danas
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
          Preduzetnici širom Srbije već koriste AIsistent za ugovore, mejlove i papirologiju.
        </p>
        <a
          href={isLoggedIn ? '/dashboard' : '/register'}
          className="mt-8 inline-flex rounded-xl bg-white px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          style={{ color: PRIMARY }}
        >
          {isLoggedIn ? 'Moji dokumenti' : 'Počnite besplatno'}
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 px-5 py-10 text-sm text-gray-400 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-base font-bold text-white">AIsistent</p>
              <p className="text-gray-500">Pravni dokumenti za srpske preduzetnike</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="grid gap-2">
                <a href="/login" className="transition-colors hover:text-white">Prijavi se</a>
                <a href="/register" className="transition-colors hover:text-white">Napravi nalog</a>
                <a href="#cenovnik" className="transition-colors hover:text-white">Cenovnik</a>
              </div>
              <div className="grid gap-2">
                <a href="mailto:info@aisistent.rs" className="transition-colors hover:text-white">
                  info@aisistent.rs
                </a>
                <span className="text-gray-500">© 2026 AIsistent</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-1 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Dokumenti generisani uz pomoć AIsistenta. Preporučuje se pravna provera pre upotrebe.</p>
            <p className="shrink-0">Napravljeno u Srbiji 🇷🇸</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
