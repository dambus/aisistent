import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { HeroAnimation } from '@/components/landing/HeroAnimation'
import PricingSection from '@/components/landing/PricingSection'
import type { PricingPlan } from '@/components/landing/PricingSection'
import { getAllLibraryForms } from '@/lib/libraryForms'

export const metadata: Metadata = {
  title: 'AIsistent — Poslovni dokumenti i alati za srpske preduzetnike',
  description:
    'Generator ugovora, poslovnih mejlova i HR dokumenata za srpsko tržište. Ugovor o radu, NDA, ponuda klijentu i još 7 alata. Besplatno za početak.',
  openGraph: {
    title: 'AIsistent — Poslovni dokumenti i alati za srpske preduzetnike',
    description:
      'Generator ugovora, poslovnih mejlova i HR dokumenata za srpsko tržište. Besplatno za početak.',
    url: 'https://aisistent.rs',
    siteName: 'AIsistent',
    locale: 'sr_RS',
    type: 'website',
  },
}

const PRIMARY = '#1B6B4A'
const PRIMARY_DARK = '#155a3e'
const SURFACE = '#F8FAF9'

const steps = [
  {
    num: '1',
    icon: '📝',
    title: 'Popunite kratku formu',
    text: 'Unesite osnovne podatke. Nije vam potrebno iskustvo — vodimo vas korak po korak.',
  },
  {
    num: '2',
    icon: '⚡',
    title: 'AIsistent generiše za vas',
    text: 'Za manje od 60 sekundi dobijate kompletan dokument prilagođen srpskom tržištu i vašem poslu.',
  },
  {
    num: '3',
    icon: '📥',
    title: 'Preuzmite i doradite',
    text: 'PDF ili Word format, spreman za potpisivanje. Sačuvan u arhivi — izmenite jednom rečenicom kad god zatrebaju.',
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
      { name: 'Opšti uslovi i Politika privatnosti', desc: 'Obavezno za svaki veb sajt', type: 'opsti-uslovi' },
      { name: 'Faktura / Profaktura', desc: 'Profesionalna faktura sa PDV logikom i stavkama', type: 'faktura' },
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
      { name: 'Oglas za posao',            desc: 'Privucite prave kandidate na Infostud i LinkedIn',     type: 'oglas-za-posao' },
      { name: 'Odgovor kandidatu',          desc: 'Poziv na intervju, prihvatanje ili odbijanje',         type: 'odgovor-kandidatu' },
      { name: 'Preporuka/Referenca',        desc: 'Profesionalna preporuka za zaposlenog ili saradnika',  type: 'preporuka' },
      { name: 'Rešenje o godišnjem odmoru', desc: 'Formalno rešenje u skladu sa Zakonom o radu',          type: 'resenje-godisnji-odmor' },
      { name: 'Pravilnik o radu',           desc: 'Interni akt o radnom vremenu, zaradama i disciplini',  type: 'pravilnik-o-radu' },
    ],
  },
  {
    title: '🏢 Marketing i prodaja',
    tools: [
      { name: 'Opis proizvoda/usluge', desc: 'Prodajni opis za sajt, katalog ili kampanju',        type: 'opis-proizvoda' },
      { name: 'Bio / O nama',          desc: 'Tekst o firmi, preduzetnik bio ili LinkedIn profil', type: 'bio-o-nama' },
      { name: 'Zapisnik sa sastanka',  desc: 'Zaključci, akcije i odluke sa poslovnih sastanaka',  type: 'zapisnik-sastanak' },
    ],
  },
  {
    title: '📦 Komercijalni dokumenti',
    tools: [
      { name: 'Otpremnica',            desc: 'Isporuka robe — stavke, količine, izdavalac i primalac', type: 'otpremnica' },
      { name: 'Ponuda za radove',      desc: 'Za izvođače, majstore i zanatlije — stavke, cene, PDV',   type: 'ponuda-za-radove' },
      { name: 'Putni nalog',           desc: 'Službena putovanja — vozač, vozilo, ruta, troškovi',       type: 'putni-nalog' },
      { name: 'Obaveštenje o promeni uslova rada', desc: 'Formalno obaveštenje po čl. 172-174 ZOR', type: 'obavestenje-o-promeni-uslova' },
    ],
  },
  {
    title: '🧮 Besplatni kalkulatori',
    tools: [
      { name: 'Kalkulator zarade',            desc: 'Neto iz bruto ili bruto iz neto, bez registracije', type: 'kalkulator-zarade' },
      { name: 'Kalkulator paušala',           desc: 'Poreske obaveze paušalnog preduzetnika po delatnosti', type: 'kalkulator-pausala' },
      { name: 'Kalkulator ugovora o delu',    desc: 'Neto isplata i troškovi poslodavca za ugovor o delu', type: 'kalkulator-ugovora-o-delu' },
    ],
  },
]

const upcomingTools: { name: string; desc: string }[] = []

const withoutAisistent = [
  'Sat vremena pisanja ugovora',
  'Pravnik košta 100€+ po dokumentu',
  'ChatGPT nije prilagođen srpskom tržištu i praksi',
  'Dokumenti u različitim folderima',
  'Svaki put od nule',
]

const withAisistent = [
  'Gotov dokument za 2 minuta',
  'Mesečna pretplata jeftinija od jednog sata pravnih usluga',
  'Prilagođeno srpskom pravu i poslovnoj praksi',
  'Svi dokumenti na jednom mestu — arhiva sa preuzimanjem kad god zatrebaju',
  'AI izmene jednom rečenicom — bez ponovnog generisanja',
]

function getPricing(obrasciCount: number): (PricingPlan & { features: [string, string][] })[] {
  return [
    {
      name: 'Besplatno',
      price: 'Besplatno',
      cta: 'Počnite besplatno',
      href: '/register',
      features: [
        ['✓', '1 dokument mesečno'],
        ['✓', 'PDF sa watermarkom'],
        ['✓', 'Arhiva dokumenata'],
        ['✓', `Biblioteka od ${obrasciCount} zvaničnih obrazaca (preuzimanje praznih)`],
      ],
    },
    {
      name: 'Starter',
      price: '1.080 RSD / mes.',
      euroEquivalent: '(≈ 9 EUR)',
      cta: 'Izaberite Starter',
      waitlistPlan: 'starter',
      features: [
        ['✓', '20 dokumenata mesečno'],
        ['✓', 'PDF bez watermark-a'],
        ['✓', 'Email slanje dokumenata'],
        ['✓', 'Arhiva dokumenata'],
        ['✓', 'AI izmene dokumenta (15/dan)'],
        ['✓', `Biblioteka obrazaca — automatski popunjeno podacima firme`],
        ['✕', 'Word (DOCX) format'],
      ],
    },
    {
      name: 'Pro',
      price: '3.000 RSD / mes.',
      euroEquivalent: '(≈ 25 EUR)',
      badge: 'Najpopularnije',
      cta: 'Izaberite Pro',
      waitlistPlan: 'pro',
      featured: true,
      features: [
        ['✓', 'Neograničen broj dokumenata'],
        ['✓', 'PDF i Word (DOCX) export'],
        ['✓', 'Brendiranje sa logom firme'],
        ['✓', 'Email slanje dokumenata'],
        ['✓', 'AI izmene dokumenta (neograničeno)'],
        ['✓', `Biblioteka obrazaca — automatski popunjeno podacima firme`],
      ],
    },

    {
      name: 'Agencija',
      price: '9.990 RSD',
      euroEquivalent: '≈ 83 EUR/mes',
      badge: 'Za računovođe',
      badgeColor: '#4338CA',
      cta: 'Kontaktirajte nas',
      href: 'mailto:hello@aisistent.rs?subject=Agency plan',
      features: [
        ['✓', 'Neograničen broj klijentskih firmi'],
        ['✓', 'Neograničen broj dokumenata'],
        ['✓', 'PDF + DOCX export'],
        ['✓', 'Logo firme u dokumentima'],
        ['✓', 'Arhiva po klijentu'],
        ['✓', 'Email slanje dokumenta klijentu'],
        ['✓', 'AI izmene dokumenta (neograničeno)'],
        ['✓', `Biblioteka obrazaca — automatski popunjeno po izabranom klijentu`],
        ['✕', 'Više korisnika na nalogu (uskoro)'],
      ],
    },
  ]
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

const toolLandingPages: Record<string, string> = {
  'ugovor-o-radu': '/ugovor-o-radu',
  'ugovor-o-delu': '/ugovor-o-delu',
  'nda': '/nda',
  'ugovor-o-zakupu': '/ugovor-o-zakupu',
  'ugovor-o-saradnji': '/ugovor-o-saradnji',
  'punomocje': '/punomocje',
  'opsti-uslovi': '/opsti-uslovi',
  'poslovni-mejl': '/poslovni-mejl',
  'oglas-za-posao': '/oglas-za-posao',
  'ponuda-klijentu': '/ponuda-klijentu',
  'kalkulator-zarade': '/kalkulator-zarade',
  'kalkulator-pausala': '/kalkulator-pausala',
  'kalkulator-ugovora-o-delu': '/kalkulator-ugovora-o-delu',
  'otpremnica': '/otpremnica',
  'ponuda-za-radove': '/ponuda-za-radove',
  'putni-nalog': '/putni-nalog',
  'obavestenje-o-promeni-uslova': '/obavestenje-o-promeni-uslova',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const libraryForms = await getAllLibraryForms()

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <SiteHeader isLoggedIn={isLoggedIn} />

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
              profesionalne dokumente prilagođene srpskom tržištu — brzo i jednostavno, bez skupih savetovanja.
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
              ✓ Bez avansa &nbsp;·&nbsp; ✓ Prilagođeno Srbiji &nbsp;·&nbsp; ✓ PDF i Word format
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <HeroAnimation />
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

      {/* ── OBRASCI PROMO ── */}
      <section className="border-b border-gray-100 px-5 py-10 lg:px-8" style={{ backgroundColor: '#052e16' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: PRIMARY, color: '#ffffff' }}
            >
              Novo
            </span>
            <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
              Biblioteka zvaničnih obrazaca — {libraryForms.length} obrazaca i raste
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed" style={{ color: '#a7f3d0' }}>
              APR, poreski i drugi zvanični PDF obrasci na jednom mestu — preuzmite prazne ili
              popunjene podacima vaše firme.
            </p>
          </div>
          <a
            href="/obrasci"
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ color: PRIMARY }}
          >
            Pogledajte obrasce →
          </a>
        </div>
      </section>

      {/* ── ALATI ── */}
      <section id="alati" className="bg-white px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="25 alata i tipova dokumenata"
          title="Sve što je potrebno vašem biznisu"
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
                      href={toolLandingPages[tool.type] ?? '/register'}
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
        <PricingSection plans={getPricing(libraryForms.length)} />
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
          Napravljeno za srpske preduzetnike, freelancere i male firme
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
      <footer style={{ backgroundColor: '#052e16', color: '#d1fae5' }} className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Alati</h3>
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
                    <a href={href} style={{ color: '#6ee7b7' }} className="hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resursi</h3>
              <ul className="space-y-2 text-sm">
                {[
                  ['Blog', '/blog'],
                  ['Obrasci', '/obrasci'],
                  ['Kalkulator zarade', '/kalkulator-zarade'],
                  ['Kalkulator paušala', '/kalkulator-pausala'],
                  ['Poslovni mejl', '/poslovni-mejl'],
                  ['Oglas za posao', '/oglas-za-posao'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a href={href} style={{ color: '#6ee7b7' }} className="hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">AIsistent</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#6ee7b7' }}>
                <li>
                  <a href="mailto:info@aisistent.rs" className="hover:text-white transition-colors">
                    info@aisistent.rs
                  </a>
                </li>
                <li>Napravljeno u Srbiji 🇷🇸</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-xs text-center space-y-1"
            style={{ borderColor: '#14532d', color: '#6ee7b7' }}>
            <p>© 2026 AIsistent. Sva prava zadržana.</p>
            <p>Dokumenti generisani uz pomoć AIsistenta. Preporučuje se pravna provera pre upotrebe.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
