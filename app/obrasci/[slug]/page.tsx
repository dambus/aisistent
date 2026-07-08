import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLibraryForm, getAllLibraryForms, CATEGORY_LABELS, formatDateSr } from '@/lib/libraryForms'
import { LibraryDownloadButtons } from '@/components/obrasci/LibraryDownloadButtons'

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

const NAV = [
  { href: '/#alati', label: 'Alati' },
  { href: '/obrasci', label: 'Obrasci' },
  { href: '/blog', label: 'Blog' },
]

export default async function LibraryFormPage({ params }: Props) {
  const { slug } = await params
  const form = await getLibraryForm(slug)
  if (!form) notFound()

  const all = await getAllLibraryForms()
  const related = all.filter(f => f.slug !== slug && f.category === form.category).slice(0, 4)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="mx-auto max-w-6xl px-5 lg:px-8 h-14 flex items-center justify-between">
          <a href="/">
            <img src="/logo/AIsistent-Logo_6003x180.png" alt="AIsistent" height={28}
              style={{ maxWidth: 140, width: 'auto', objectFit: 'contain' }} />
          </a>
          <div className="hidden md:flex items-center gap-6">
            {NAV.map(l => (
              <a key={l.href} href={l.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <a href="/register" className="text-sm font-bold text-white rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: P }}>
            Počnite besplatno
          </a>
        </nav>
      </header>

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
            {form.hasAutofill ? (
              <>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: P }}>1.</span>
                  Preuzmite obrazac — popunjen podacima vaše firme (naziv, PIB, matični broj...) ili prazan.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: P }}>2.</span>
                  Otvorite ga u Adobe Reader-u ili drugom PDF softveru — polja ostaju izmenjiva.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: P }}>3.</span>
                  Dopunite preostala polja, proverite podatke, odštampajte i potpišite.
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: P }}>1.</span>
                  Preuzmite prazan obrazac sa zvaničnog izvora — proverili smo da je važeći.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: P }}>2.</span>
                  Popunite ga ručno u Adobe Reader-u, drugom PDF softveru ili štampano.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold shrink-0" style={{ color: P }}>3.</span>
                  Proverite podatke, odštampajte i potpišite.
                </li>
              </>
            )}
          </ol>
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
