import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPostMeta, getPost, formatDateSr, splitHtmlAtMidpoint } from '@/lib/blog'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPostMeta().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | AIsistent Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://aisistent.rs/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

const PRIMARY = '#1B6B4A'
const DARK = '#052e16'

const navLinks = [
  { href: '/#alati', label: 'Alati' },
  { href: '/blog', label: 'Blog' },
  { href: '/#cenovnik', label: 'Cenovnik' },
]

// Heuristic: extract document name from post title for mid-CTA
function extractDocName(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('ugovor o radu')) return 'Ugovor o radu'
  if (lower.includes('ugovor o delu')) return 'Ugovor o delu'
  if (lower.includes('nda') || lower.includes('poverljivost')) return 'NDA sporazum'
  if (lower.includes('ugovor o saradnji')) return 'Ugovor o saradnji'
  if (lower.includes('opšt') || lower.includes('opst')) return 'Opšte uslove'
  if (lower.includes('registr')) return 'poslovne dokumente'
  if (lower.includes('paušal') || lower.includes('pausal') || lower.includes('doo')) return 'poslovne dokumente'
  return 'dokument'
}

const PROSE_STYLES = `
.blog-prose { font-size: 18px; line-height: 1.8; color: #1a1a1a; }
.blog-prose p { margin-bottom: 1.4em; }
.blog-prose h2 { font-size: 24px; font-weight: 700; color: ${DARK}; margin-top: 40px; margin-bottom: 12px; line-height: 1.3; }
.blog-prose h3 { font-size: 20px; font-weight: 600; color: #111827; margin-top: 32px; margin-bottom: 10px; line-height: 1.3; }
.blog-prose h4 { font-size: 17px; font-weight: 600; color: #111827; margin-top: 24px; margin-bottom: 8px; }
.blog-prose strong { color: ${DARK}; font-weight: 700; }
.blog-prose ul { padding-left: 24px; margin-bottom: 1.2em; list-style-type: disc; }
.blog-prose ol { padding-left: 24px; margin-bottom: 1.2em; list-style-type: decimal; }
.blog-prose li { margin-bottom: 8px; }
.blog-prose a { color: ${PRIMARY}; text-decoration: underline; }
.blog-prose a:hover { opacity: 0.8; }
.blog-prose blockquote { border-left: 4px solid ${PRIMARY}; padding-left: 16px; font-style: italic; color: #4b5563; margin: 1.5em 0; }
.blog-prose code { font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 15px; }
.blog-prose pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 1.4em; }
.blog-prose pre code { background: none; padding: 0; }
`

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const allPosts = getAllPostMeta()
  const related = allPosts.filter(p => p.slug !== slug).slice(0, 3)
  const eyebrow = post.keywords[0] ?? 'Blog'
  const dateFormatted = formatDateSr(post.date)
  const docName = extractDocName(post.title)
  const [firstHalf, secondHalf] = splitHtmlAtMidpoint(post.contentHtml)
  const shareUrl = `https://aisistent.rs/blog/${slug}`

  return (
    <div className="min-h-screen bg-white" style={{ color: '#111827' }}>
      <style dangerouslySetInnerHTML={{ __html: PROSE_STYLES }} />

      {/* ── NAV ── */}
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

      {/* ── HERO ── */}
      <section style={{ backgroundColor: DARK }} className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <a
            href="/blog"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ color: '#6ee7b7', letterSpacing: '0.1em' }}
          >
            ← Blog
          </a>
          <p
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: '#14532d', color: '#6ee7b7', letterSpacing: '0.12em' }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-4xl font-bold leading-tight text-white sm:text-5xl"
            style={{ maxWidth: '700px' }}
          >
            {post.title}
          </h1>
          <div className="mt-5 flex items-center gap-2 text-sm" style={{ color: '#6ee7b7' }}>
            <time dateTime={post.date}>{dateFormatted}</time>
            {post.readTime && (
              <>
                <span style={{ color: '#166534' }}>·</span>
                <span>{post.readTime} čitanja</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── PROSE + MID CTA ── */}
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">

        {/* Prva polovina sadržaja */}
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: firstHalf }}
        />

        {/* Mid-CTA baner */}
        {secondHalf && (
          <div
            className="my-10 rounded-2xl px-7 py-7"
            style={{ backgroundColor: PRIMARY }}
          >
            <p className="text-base font-bold text-white">
              Treba vam {docName}? AIsistent ga generiše za 60 sekundi.
            </p>
            <a
              href="/register"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ color: PRIMARY }}
            >
              Napravi dokument →
            </a>
          </div>
        )}

        {/* Druga polovina sadržaja */}
        {secondHalf && (
          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: secondHalf }}
          />
        )}

        {/* ── AUTOR / SHARE ── */}
        <div
          className="mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: '#e5e7eb' }}
        >
          <p className="text-sm text-gray-500">
            Napisao <strong className="text-gray-700">AIsistent tim</strong> · {dateFormatted}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">Podelite:</span>
            <a
              href={`https://linkedin.com/shareArticle?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-3 py-1.5 font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: '#d1d5db', color: '#374151' }}
            >
              LinkedIn
            </a>
            <a
              href={`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-3 py-1.5 font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: '#d1d5db', color: '#374151' }}
            >
              X / Twitter
            </a>
          </div>
        </div>

        {/* ── RELATED POSTS ── */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-xl font-bold" style={{ color: DARK }}>
              Pročitajte i
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map(p => (
                <a
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    borderTop: `3px solid ${PRIMARY}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary line-clamp-3">
                      {p.title}
                    </h3>
                    <div className="mt-3 text-xs text-gray-400">
                      <time dateTime={p.date}>{p.date}</time>
                      {p.readTime && <span className="ml-2">· {p.readTime}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM CTA ── */}
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
                className="rounded-xl border px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-primary"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
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
