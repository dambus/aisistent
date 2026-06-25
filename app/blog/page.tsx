import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPostMeta } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — AIsistent | Poslovni saveti za srpske preduzetnike',
  description: 'Vodiči, kalkulatori i pravni saveti za srpske preduzetnike i freelancere.',
}

const P = '#1B6B4A'
const D = '#052e16'

const NAV = [
  { href: '/#alati', label: 'Alati' },
  { href: '/blog', label: 'Blog' },
  { href: '/#cenovnik', label: 'Cenovnik' },
]

function categoryFromKeywords(keywords: string[]): string {
  const kw = keywords[0] ?? ''
  if (/ugovor|nda|punomo/i.test(kw)) return 'Ugovori'
  if (/porez|paušal|doo|freelanc/i.test(kw)) return 'Porezi'
  if (/registr|osniv|apr/i.test(kw)) return 'Osnivanje'
  if (/gdpr|zzpl|privat/i.test(kw)) return 'Pravo'
  return 'Saveti'
}

export default async function BlogPage() {
  const posts = await getAllPostMeta()
  const [featured, ...rest] = posts

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
                Resursi za preduzetnike
              </p>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
                Blog
              </h1>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 pb-1">
              <p className="text-4xl font-bold tabular-nums" style={{ color: '#6ee7b7' }}>{posts.length}</p>
              <p className="text-xs text-green-600 uppercase tracking-widest">članaka</p>
            </div>
          </div>
          <p className="mt-5 text-base leading-relaxed max-w-xl" style={{ color: '#86efac' }}>
            Vodiči, pravni saveti i finansijski kalkulatori za srpske preduzetnike i freelancere.
          </p>
        </div>
        {/* Dekorativna linija */}
        <div className="h-px mx-auto max-w-6xl px-5 lg:px-8">
          <div className="h-px opacity-20" style={{ background: `linear-gradient(to right, ${P}, transparent)` }} />
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 lg:px-8">

        {/* ── ISTAKNUTI POST ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="py-10 sm:py-14 border-b-2 border-gray-100 grid sm:grid-cols-[1fr_320px] gap-8 sm:gap-16 items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: P }}>
                  Istaknuto
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-green-800 transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-4 text-base text-gray-500 leading-relaxed line-clamp-2">
                  {featured.description}
                </p>
              </div>
              <div className="flex sm:flex-col sm:items-end gap-4 sm:gap-3">
                <div className="flex sm:flex-col sm:items-end gap-2 text-xs text-gray-400">
                  <time dateTime={featured.date}>{featured.date}</time>
                  {featured.readTime && <span>· {featured.readTime} čitanja</span>}
                </div>
                <span className="text-sm font-bold transition-transform group-hover:translate-x-1 inline-block" style={{ color: P }}>
                  Pročitajte →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ── EDITORIAL INDEX ── */}
        {rest.length > 0 && (
          <section className="py-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-6">
              Svi članci
            </p>
            <div>
              {rest.map((post, i) => {
                const category = categoryFromKeywords(post.keywords)
                return (
                  <Link key={post.slug} href={`/blog/${post.slug}`}
                    className="group flex items-baseline gap-5 py-5 border-b border-gray-100 hover:border-green-200 transition-colors">

                    {/* Redni broj */}
                    <span className="text-xs font-bold tabular-nums text-gray-300 group-hover:text-green-400 transition-colors w-6 shrink-0">
                      {String(i + 2).padStart(2, '0')}
                    </span>

                    {/* Kategorija */}
                    <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest shrink-0 w-24"
                      style={{ color: P }}>
                      {category}
                    </span>

                    {/* Naslov */}
                    <span className="flex-1 text-base font-semibold text-gray-800 leading-snug group-hover:text-green-800 transition-colors line-clamp-1">
                      {post.title}
                    </span>

                    {/* Meta */}
                    <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 shrink-0">
                      <time dateTime={post.date}>{post.date}</time>
                      {post.readTime && <span>{post.readTime}</span>}
                    </div>

                    {/* Arrow */}
                    <span className="text-gray-300 group-hover:text-green-500 transition-all group-hover:translate-x-0.5 text-sm shrink-0">
                      →
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── CTA BLOK ── */}
        <section className="my-10 rounded-2xl px-8 py-12 text-center" style={{ backgroundColor: D }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Treba vam dokument odmah?
          </h2>
          <p className="mt-3 text-sm leading-relaxed max-w-md mx-auto" style={{ color: '#86efac' }}>
            AI alati generišu profesionalne dokumente za 60 sekundi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              ['Ugovor o radu', '/ugovor-o-radu'],
              ['NDA sporazum', '/nda'],
              ['Poslovni mejl', '/poslovni-mejl'],
              ['Ugovor o delu', '/ugovor-o-delu'],
            ].map(([label, href]) => (
              <a key={href} href={href}
                className="rounded-xl border border-white/20 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white hover:text-green-900 transition-all">
                {label}
              </a>
            ))}
          </div>
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
              {[['Blog','/blog'],['Kalkulator zarade','/kalkulator-zarade'],['Kalkulator paušala','/kalkulator-pausala']].map(([l,h])=>(
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
        <div className="border-t pt-6 text-xs text-center space-y-1" style={{ borderColor: '#14532d', color: '#6ee7b7' }}>
          <p>© 2026 AIsistent. Sva prava zadržana.</p>
        </div>
      </footer>
    </div>
  )
}
