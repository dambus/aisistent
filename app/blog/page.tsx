import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPostMeta } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — AIsistent | Poslovni saveti za srpske preduzetnike',
  description: 'Vodiči, kalkulatori i pravni saveti za srpske preduzetnike i freelancere.',
}

const PRIMARY = '#1B6B4A'
const DARK = '#052e16'
const BLOG_CTA_STYLES = `
.blog-cta-btn {
  border: 1px solid white;
  color: white;
  background: transparent;
  transition: all 0.15s ease;
}

.blog-cta-btn:hover {
  background: white;
  color: ${DARK};
}
`

const navLinks = [
  { href: '/#alati', label: 'Alati' },
  { href: '/blog', label: 'Blog' },
  { href: '/#cenovnik', label: 'Cenovnik' },
]

const TOPICS = ['Ugovori', 'Porezi', 'Freelance', 'Registracija firme', 'HR', 'Kalkulatori']

export default function BlogPage() {
  const posts = getAllPostMeta()
  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen bg-white" style={{ color: '#111827' }}>
      <style dangerouslySetInnerHTML={{ __html: BLOG_CTA_STYLES }} />

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center">
            <img
              src="/logo/AIsistent-Logo_6003x180.png"
              alt="AIsistent"
              height={32}
              style={{ objectFit: 'contain', maxWidth: '160px', width: 'auto' }}
            />
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
              >
                {l.label}
              </a>
            ))}
          </div>
          <a
            href="/register"
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            Počnite besplatno
          </a>
        </nav>
      </header>

      <section style={{ backgroundColor: DARK }} className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: '#14532d', color: '#6ee7b7', letterSpacing: '0.12em' }}
          >
            Resursi
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Saveti za preduzetnike
          </h1>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: '#86efac' }}>
            Vodiči, kalkulatori i pravni saveti za srpske preduzetnike i freelancere.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-12 block rounded-2xl bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            style={{
              borderLeft: `4px solid ${PRIMARY}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: PRIMARY, letterSpacing: '0.1em' }}
            >
              Istaknuto
            </p>
            <h2 className="text-2xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-500 line-clamp-2">
              {featured.description}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
                Pročitajte →
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <time dateTime={featured.date}>{featured.date}</time>
                {featured.readTime && (
                  <>
                    <span>·</span>
                    <span>{featured.readTime} čitanja</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  borderTop: `3px solid ${PRIMARY}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
                    <time dateTime={post.date}>{post.date}</time>
                    {post.readTime && <span>{post.readTime} čitanja</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="rounded-xl p-5" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY, letterSpacing: '0.1em' }}>
                Popularne teme
              </h3>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map(topic => (
                  <span
                    key={topic}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: DARK }}>
              <h3 className="mb-2 text-sm font-bold text-white">Generišite dokument</h3>
              <p className="mb-4 text-xs leading-relaxed" style={{ color: '#86efac' }}>
                Ugovor, faktura, poslovni mejl — AI generiše za 60 sekundi.
              </p>
              <a
                href="/register"
                className="block rounded-lg py-2.5 text-center text-xs font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                Počnite besplatno
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-16 rounded-2xl px-8 py-12 text-center" style={{ backgroundColor: DARK }}>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Treba vam dokument odmah?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: '#86efac' }}>
            Naši AI alati generišu profesionalne dokumente za 60 sekundi.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Ugovor o radu', '/ugovor-o-radu'],
              ['NDA sporazum', '/nda'],
              ['Poslovni mejl', '/poslovni-mejl'],
              ['Ugovor o delu', '/ugovor-o-delu'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="blog-cta-btn rounded-xl px-4 py-3 text-sm font-semibold"
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: DARK, color: '#d1fae5' }} className="py-12 px-6">
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
                <li>Napravljeno u Srbiji</li>
              </ul>
            </div>
          </div>
          <div
            className="border-t pt-6 text-xs text-center space-y-1"
            style={{ borderColor: '#14532d', color: '#6ee7b7' }}
          >
            <p>© 2026 AIsistent. Sva prava zadržana.</p>
            <p>Dokumenti generisani uz pomoć AIsistenta. Preporučuje se pravna provera pre upotrebe.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
