import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllLibraryForms, CATEGORY_LABELS, formatDateSr } from '@/lib/libraryForms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Obrasci — AIsistent | Zvanični obrasci za srpske preduzetnike',
  description:
    'Zvanični obrasci državnih institucija (Poreska uprava, APR, CROSO, RFZO) na jednom mestu — preuzmite prazne ili unapred popunjene podacima vaše firme.',
}

const P = '#1B6B4A'
const D = '#052e16'

const NAV = [
  { href: '/#alati', label: 'Alati' },
  { href: '/blog', label: 'Blog' },
  { href: '/#cenovnik', label: 'Cenovnik' },
]

export default async function ObrasciLibraryPage() {
  const forms = await getAllLibraryForms()

  // Grupisanje po kategoriji — redosled prati CATEGORY_LABELS
  const byCategory = new Map<string, typeof forms>()
  for (const key of Object.keys(CATEGORY_LABELS)) byCategory.set(key, [])
  for (const f of forms) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, [])
    byCategory.get(f.category)!.push(f)
  }

  return (
    <div className="min-h-screen bg-white">
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
        <div className="mx-auto max-w-6xl px-5 lg:px-8 pt-16 pb-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#6ee7b7' }}>
                Zvanični obrasci na jednom mestu
              </p>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
                Obrasci
              </h1>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 pb-1">
              <p className="text-4xl font-bold tabular-nums" style={{ color: '#6ee7b7' }}>{forms.length}</p>
              <p className="text-xs text-green-600 uppercase tracking-widest">obrazaca</p>
            </div>
          </div>
          <p className="mt-5 text-base leading-relaxed max-w-xl" style={{ color: '#86efac' }}>
            Provereni obrasci državnih institucija — preuzmite prazne ili unapred popunjene
            podacima vaše firme, pa dovršite u Adobe Reader-u.
          </p>
        </div>
        <div className="h-px mx-auto max-w-6xl px-5 lg:px-8">
          <div className="h-px opacity-20" style={{ background: `linear-gradient(to right, ${P}, transparent)` }} />
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 lg:px-8">
        {forms.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-400">
            Biblioteka se puni — prvi obrasci stižu uskoro.
          </p>
        )}

        {[...byCategory.entries()].map(([category, items]) =>
          items.length === 0 ? null : (
            <section key={category} className="py-8 border-b border-gray-100 last:border-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-5">
                {CATEGORY_LABELS[category] ?? category}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map(form => (
                  <Link key={form.slug} href={`/obrasci/${form.slug}`}
                    className="group rounded-2xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1"
                        style={{ backgroundColor: '#f0fdf4', color: P }}>
                        {form.shortName}
                      </span>
                      <span className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all text-sm">→</span>
                    </div>
                    <h2 className="mt-3 text-sm font-semibold text-gray-800 leading-snug group-hover:text-green-800 transition-colors line-clamp-2">
                      {form.title}
                    </h2>
                    {form.description && (
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">{form.description}</p>
                    )}
                    <p className="mt-3 text-[11px] text-gray-400">
                      {form.sourceInstitution} · proveren {formatDateSr(form.verifiedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        )}

        {/* ── CTA ── */}
        <section className="my-10 rounded-2xl px-8 py-12 text-center" style={{ backgroundColor: D }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Popunjeno vašim podacima, jednim klikom
          </h2>
          <p className="mt-3 text-sm leading-relaxed max-w-md mx-auto" style={{ color: '#86efac' }}>
            Registrujte firmu jednom — naziv, PIB, matični broj i adresa se upisuju
            u svaki obrazac automatski.
          </p>
          <a href="/register"
            className="mt-7 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
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
