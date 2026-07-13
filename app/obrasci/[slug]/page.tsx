import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLibraryForm, getAllLibraryForms, CATEGORY_LABELS, formatDateSr, type LibraryFormMeta } from '@/lib/libraryForms'
import { LibraryDownloadButtons } from '@/components/obrasci/LibraryDownloadButtons'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/landing/SiteHeader'

const BASE_URL = 'https://aisistent.rs'

function buildHowToSteps(form: LibraryFormMeta): string[] {
  return form.hasAutofill
    ? [
        `Preuzmite ${form.shortName} — popunjen podacima vaše firme (naziv, PIB, matični broj...) ili prazan.`,
        'Otvorite ga u Adobe Reader-u ili drugom PDF softveru — polja ostaju izmenjiva.',
        'Dopunite preostala polja, proverite podatke, odštampajte i potpišite.',
      ]
    : [
        `Preuzmite prazan obrazac ${form.shortName} sa zvaničnog izvora — proverili smo da je važeći.`,
        'Popunite ga ručno u Adobe Reader-u, drugom PDF softveru ili štampano.',
        'Proverite podatke, odštampajte i potpišite.',
      ]
}

function buildFaq(form: LibraryFormMeta): { q: string; a: string }[] {
  const faq = [
    {
      q: `Da li se ${form.shortName} može popuniti automatski?`,
      a: form.hasAutofill
        ? `Da — ${form.shortName} je AcroForm obrazac, pa ga AIsistent može unapred popuniti podacima vaše firme (naziv, PIB, matični broj) uz besplatnu registraciju. Polja ostaju izmenjiva u PDF softveru.`
        : `Ne — ${form.shortName} je obrazac bez elektronskih polja za popunjavanje, pa se preuzima kao čist referentni dokument i popunjava ručno.`,
    },
    {
      q: `Da li je ovo zvaničan obrazac?`,
      a: `Da, preuzet je sa zvaničnog izvora (${form.sourceInstitution}) i poslednji put proveren ${formatDateSr(form.verifiedAt)}.`,
    },
    {
      q: `Gde se predaje ${form.shortName}?`,
      a: `Obrazac se predaje instituciji ${form.sourceInstitution}, u skladu sa propisanom procedurom za ovaj tip zahteva.`,
    },
    {
      q: `Koliko strana ima ${form.shortName}?`,
      a: `Obrazac ima ${form.pageCount} ${form.pageCount === 1 ? 'stranu' : 'strane'}.`,
    },
  ]
  return faq
}

const KEYWORD_LINKS: { pattern: RegExp; href: string; label: string }[] = [
  { pattern: /zarad/i, href: '/kalkulator-zarade', label: 'Kalkulator neto zarade' },
  { pattern: /paušal/i, href: '/kalkulator-pausala', label: 'Kalkulator paušalnog poreza' },
  { pattern: /ugovor.{0,3}o.{0,3}delu/i, href: '/kalkulator-ugovora-o-delu', label: 'Kalkulator ugovora o delu' },
  { pattern: /zaposlen|radni.{0,3}odnos|M-4|M-8|M-10/i, href: '/ugovor-o-radu', label: 'Ugovor o radu (generator)' },
  { pattern: /otpremn|prevoz.{0,3}robe/i, href: '/otpremnica', label: 'Otpremnica (generator)' },
  { pattern: /punomoć|ovlašćenj/i, href: '/punomocje', label: 'Punomoćje (generator)' },
  { pattern: /zakup|najam/i, href: '/ugovor-o-zakupu', label: 'Ugovor o zakupu (generator)' },
  { pattern: /poverljiv|poslovn.{0,3}tajn/i, href: '/nda', label: 'NDA — sporazum o poverljivosti (generator)' },
]

function buildRelatedTools(form: LibraryFormMeta) {
  const haystack = `${form.title} ${form.shortName}`
  const seen = new Set<string>()
  const links: { href: string; label: string }[] = []
  for (const { pattern, href, label } of KEYWORD_LINKS) {
    if (pattern.test(haystack) && !seen.has(href)) {
      seen.add(href)
      links.push({ href, label })
    }
  }
  return links.slice(0, 3)
}

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const form = await getLibraryForm(slug)
  if (!form) return {}
  return {
    title: `${form.shortName} obrazac — preuzimanje i popunjavanje | AIsistent`,
    description: form.description ?? form.title,
    openGraph: {
      title: form.title,
      description: form.description ?? undefined,
      url: `https://aisistent.rs/obrasci/${slug}`,
      type: 'article',
    },
  }
}

const P = '#1B6B4A'
const D = '#052e16'

export default async function LibraryFormPage({ params }: Props) {
  const { slug } = await params
  const form = await getLibraryForm(slug)
  if (!form) notFound()

  const all = await getAllLibraryForms()
  const related = all.filter(f => f.slug !== slug && f.category === form.category).slice(0, 4)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const howToSteps = buildHowToSteps(form)
  const faq = buildFaq(form)
  const relatedTools = buildRelatedTools(form)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Obrasci', item: `${BASE_URL}/obrasci` },
          { '@type': 'ListItem', position: 2, name: form.shortName, item: `${BASE_URL}/obrasci/${form.slug}` },
        ],
      },
      {
        '@type': 'HowTo',
        name: `Kako popuniti ${form.shortName}`,
        step: howToSteps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader isLoggedIn={isLoggedIn} />

      {/* ── HERO ── */}
      <section style={{ backgroundColor: D }}>
        <div className="mx-auto max-w-3xl px-5 lg:px-8 pt-12 pb-10">
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#6ee7b7' }}>
            <Link href="/obrasci" className="hover:text-white transition-colors">Obrasci</Link>
            <span className="opacity-40">›</span>
            <span className="opacity-70">{CATEGORY_LABELS[form.category] ?? form.category}</span>
          </div>

          <p className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] rounded-full px-3 py-1 mb-5"
            style={{ backgroundColor: '#14532d', color: '#6ee7b7' }}>
            {form.shortName}
          </p>

          <h1 className="text-white font-extrabold leading-tight tracking-tight"
            style={{ fontSize: 'clamp(24px, 4.5vw, 38px)' }}>
            <span style={{ color: '#6ee7b7' }}>{form.shortName}</span> — {form.title}
          </h1>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <div className="text-xs rounded-full px-3 py-1.5" style={{ backgroundColor: '#0f3d22', color: '#6ee7b7' }}>
              {form.sourceInstitution}
            </div>
            <div className="text-xs rounded-full px-3 py-1.5" style={{ backgroundColor: '#0f3d22', color: '#6ee7b7' }}>
              proveren {formatDateSr(form.verifiedAt)}
            </div>
            <div className="text-xs rounded-full px-3 py-1.5" style={{ backgroundColor: '#0f3d22', color: '#6ee7b7' }}>
              {form.pageCount} {form.pageCount === 1 ? 'strana' : 'strane'}
            </div>
          </div>
        </div>
      </section>

      {/* ── SADRŽAJ ── */}
      <main className="mx-auto max-w-3xl px-5 lg:px-8 py-10">
        {form.description && (
          <p className="text-base text-gray-600 leading-relaxed mb-8">{form.description}</p>
        )}

        <LibraryDownloadButtons slug={form.slug} shortName={form.shortName} hasAutofill={form.hasAutofill} />

        {/* Kako radi */}
        <section className="mt-10 rounded-2xl bg-gray-50 border border-gray-100 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Kako radi</p>
          <ol className="space-y-3 text-sm text-gray-600">
            {howToSteps.map((text, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-bold shrink-0" style={{ color: P }}>{i + 1}.</span>
                {text}
              </li>
            ))}
          </ol>
        </section>

        {/* Povezani alati */}
        {relatedTools.length > 0 && (
          <section className="mt-6 flex flex-wrap gap-2">
            {relatedTools.map(t => (
              <Link key={t.href} href={t.href}
                className="text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors"
                style={{ borderColor: '#bbf7d0', color: P }}>
                {t.label} →
              </Link>
            ))}
          </section>
        )}

        {/* FAQ */}
        <section className="mt-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-5">
            Najčešća pitanja
          </p>
          <div className="divide-y divide-gray-100">
            {faq.map(({ q, a }) => (
              <details key={q} className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-800 list-none">
                  {q}
                  <span className="text-gray-300 group-open:rotate-45 transition-transform text-lg shrink-0 ml-3">+</span>
                </summary>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Izvor */}
        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          Zvaničan izvor:{' '}
          <a href={form.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-600 transition-colors">
            {form.sourceInstitution}
          </a>
          . Ako primetite da je obrazac u međuvremenu izmenjen, javite nam na{' '}
          <a href="mailto:info@aisistent.rs" className="underline underline-offset-2">info@aisistent.rs</a>.
        </p>

        {/* Srodni obrasci */}
        {related.length > 0 && (
          <section className="mt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-5">
              Srodni obrasci
            </p>
            <div className="divide-y divide-gray-100">
              {related.map(f => (
                <Link key={f.slug} href={`/obrasci/${f.slug}`}
                  className="group flex items-baseline gap-4 py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 w-20" style={{ color: P }}>
                    {f.shortName}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-gray-700 group-hover:text-green-800 transition-colors leading-snug line-clamp-1">
                    {f.title}
                  </span>
                  <span className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0 text-sm">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 rounded-2xl px-8 py-10 text-center" style={{ backgroundColor: D }}>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Podaci firme upisani automatski
          </h2>
          <p className="mt-3 text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#86efac' }}>
            Popunite profil jednom — svaki obrazac iz biblioteke stiže sa vašim podacima.
          </p>
          <a href="/register"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ color: P }}>
            Počnite besplatno →
          </a>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: D, color: '#d1fae5' }} className="py-12 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-semibold text-white mb-4 text-sm">Alati</p>
            <ul className="space-y-2 text-sm">
              {[['Ugovor o radu','/ugovor-o-radu'],['Ugovor o delu','/ugovor-o-delu'],['NDA sporazum','/nda'],['Punomoćje','/punomocje'],['Opšti uslovi','/opsti-uslovi']].map(([l,h])=>(
                <li key={h}><a href={h} style={{ color: '#6ee7b7' }} className="hover:text-white transition-colors text-sm">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-4 text-sm">Resursi</p>
            <ul className="space-y-2">
              {[['Blog','/blog'],['Obrasci','/obrasci'],['Kalkulator zarade','/kalkulator-zarade'],['Kalkulator paušala','/kalkulator-pausala']].map(([l,h])=>(
                <li key={h}><a href={h} style={{ color: '#6ee7b7' }} className="hover:text-white transition-colors text-sm">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-4 text-sm">AIsistent</p>
            <ul className="space-y-2" style={{ color: '#6ee7b7' }}>
              <li><a href="mailto:info@aisistent.rs" className="hover:text-white transition-colors text-sm">info@aisistent.rs</a></li>
              <li className="text-sm">Napravljeno u Srbiji</li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 text-xs text-center" style={{ borderColor: '#14532d', color: '#6ee7b7' }}>
          <p>© 2026 AIsistent. Sva prava zadržana.</p>
        </div>
      </footer>
    </div>
  )
}
