import type { Metadata } from 'next'
import { getAllLibraryForms, CATEGORY_LABELS } from '@/lib/libraryForms'
import { ObrasciSearch } from '@/components/obrasci/ObrasciSearch'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/landing/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Obrasci — AIsistent | Zvanični obrasci za srpske preduzetnike',
  description:
    'Zvanični obrasci državnih institucija (Poreska uprava, APR, CROSO, RFZO) na jednom mestu — preuzmite prazne ili unapred popunjene podacima vaše firme.',
}

const P = '#1B6B4A'
const D = '#052e16'

export default async function ObrasciLibraryPage() {
  const forms = await getAllLibraryForms()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader isLoggedIn={isLoggedIn} />

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
        {forms.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">
            Biblioteka se puni — prvi obrasci stižu uskoro.
          </p>
        ) : (
          <div className="py-8">
            <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Biblioteka se aktivno puni novim obrascima svake nedelje — ako ne nađete obrazac koji
              vam treba, javite nam se na{' '}
              <a href="mailto:info@aisistent.rs" className="font-semibold underline">info@aisistent.rs</a>{' '}
              i dodaćemo ga.
            </p>
            <ObrasciSearch forms={forms} categoryLabels={CATEGORY_LABELS} categoryOrder={Object.keys(CATEGORY_LABELS)} />
          </div>
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
