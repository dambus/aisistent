import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPostMeta, getPost, formatDateSr, splitHtmlAtMidpoint } from '@/lib/blog'
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/landing/SiteHeader'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

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

const P = '#1B6B4A'
const D = '#052e16'

function extractDocName(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('ugovor o radu')) return 'Ugovor o radu'
  if (t.includes('ugovor o delu')) return 'Ugovor o delu'
  if (t.includes('nda') || t.includes('poverljiv')) return 'NDA sporazum'
  if (t.includes('ugovor o saradnji')) return 'Ugovor o saradnji'
  if (t.includes('opšt') || t.includes('opst')) return 'Opšte uslove'
  return 'dokument'
}

const STYLES = `
/* Prose */
.prose { font-size: 17px; line-height: 1.85; color: #1f2937; }
.prose p { margin-bottom: 1.4em; }
.prose h2 { font-size: 22px; font-weight: 700; color: ${D}; margin: 2.5em 0 0.8em; line-height: 1.3; }
.prose h3 { font-size: 18px; font-weight: 600; color: ${D}; margin: 2em 0 0.6em; }
.prose strong { color: ${D}; font-weight: 700; }
.prose ul { padding-left: 1.5em; margin-bottom: 1.4em; list-style: disc; }
.prose ol { padding-left: 1.5em; margin-bottom: 1.4em; list-style: decimal; }
.prose li { margin-bottom: 0.4em; font-size: 16px; }
.prose a { color: ${P}; text-decoration: underline; text-underline-offset: 3px; }
.prose a:hover { opacity: 0.75; }
.prose blockquote { border-left: 3px solid ${P}; padding-left: 1.2em; color: #6b7280; font-style: italic; margin: 2em 0; }
.prose code { font-family: monospace; background: #f3f4f6; padding: 2px 5px; border-radius: 3px; font-size: 13px; }
.prose pre { background: #f8f9fa; border: 1px solid #e5e7eb; padding: 1em; border-radius: 8px; overflow-x: auto; margin-bottom: 1.4em; }
.prose pre code { background: none; padding: 0; font-size: 13px; }
.prose table { width: 100%; border-collapse: collapse; margin-bottom: 1.4em; font-size: 15px; }
.prose th { background: #f0fdf4; color: ${D}; font-weight: 700; text-align: left; padding: 10px 14px; border: 1px solid #d1fae5; }
.prose td { padding: 9px 14px; border: 1px solid #e5e7eb; color: #374151; }
.prose tr:nth-child(even) td { background: #fafafa; }

/* Drop-cap na prvom paragrafu */
.prose p:first-of-type::first-letter {
  float: left;
  font-size: 3.5em;
  line-height: 0.78;
  margin: 0.06em 0.1em 0 0;
  font-weight: 800;
  color: ${P};
  font-family: Georgia, serif;
}

/* CTA button */
.cta-outline {
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  background: transparent;
  transition: all 0.15s;
}
.cta-outline:hover { background: white; color: ${D}; }
`

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const allPosts = await getAllPostMeta()
  const related = allPosts.filter(p => p.slug !== slug).slice(0, 3)
  const category = post.keywords[0] ?? 'Blog'
  const dateFormatted = formatDateSr(post.date)
  const docName = extractDocName(post.title)
  const [firstHalf, secondHalf] = splitHtmlAtMidpoint(post.contentHtml)
  const shareUrl = `https://aisistent.rs/blog/${slug}`
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <ReadingProgressBar />

      <SiteHeader isLoggedIn={isLoggedIn} />

      {/* ── HERO ── */}
      <section style={{ backgroundColor: D }}>
        <div className="mx-auto max-w-3xl px-5 lg:px-8 pt-12 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#6ee7b7' }}>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <span className="opacity-40">›</span>
            <span className="opacity-70 truncate max-w-[200px]">{category}</span>
          </div>

          {/* Kategorija */}
          <p className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] rounded-full px-3 py-1 mb-5"
            style={{ backgroundColor: '#14532d', color: '#6ee7b7' }}>
            {category}
          </p>

          {/* Naslov */}
          <h1 className="text-white font-extrabold leading-tight tracking-tight"
            style={{ fontSize: 'clamp(26px, 5vw, 42px)' }}>
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs rounded-full px-3 py-1.5"
              style={{ backgroundColor: '#0f3d22', color: '#6ee7b7' }}>
              <span>{dateFormatted}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2 text-xs rounded-full px-3 py-1.5"
                style={{ backgroundColor: '#0f3d22', color: '#6ee7b7' }}>
                <span>{post.readTime} čitanja</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs rounded-full px-3 py-1.5"
              style={{ backgroundColor: '#0f3d22', color: '#6ee7b7' }}>
              AIsistent tim
            </div>
          </div>
        </div>
      </section>

      {/* ── ČLANAK ── */}
      <main className="mx-auto max-w-3xl px-5 lg:px-8 py-12">
        <div className="prose" dangerouslySetInnerHTML={{ __html: firstHalf }} />

        {secondHalf && (
          <>
            {/* Mid-CTA */}
            <div className="my-10 rounded-2xl px-6 py-7 flex flex-col sm:flex-row sm:items-center gap-5"
              style={{ backgroundColor: P }}>
              <div className="flex-1">
                <p className="text-sm font-bold text-white leading-snug">
                  Treba vam {docName}? AIsistent ga generiše za 60 sekundi.
                </p>
                <p className="text-xs mt-1" style={{ color: '#bbf7d0' }}>
                  Profesionalni dokument prilagođen srpskom pravu.
                </p>
              </div>
              <a href="/register"
                className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ color: P }}>
                Napravi dokument →
              </a>
            </div>

            <div className="prose" dangerouslySetInnerHTML={{ __html: secondHalf }} />
          </>
        )}

        {/* ── ČLANAK FOOTER ── */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-400">
            Napisao <span className="font-semibold text-gray-600">AIsistent tim</span> · {dateFormatted}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Podelite:</span>
            <a href={`https://linkedin.com/shareArticle?url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
              LinkedIn
            </a>
            <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
              X
            </a>
          </div>
        </div>

        {/* ── NASTAVI ČITANJE ── */}
        {related.length > 0 && (
          <section className="mt-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-5">
              Nastavi čitanje
            </p>
            <div className="divide-y divide-gray-100">
              {related.map((p, i) => (
                <a key={p.slug} href={`/blog/${p.slug}`}
                  className="group flex items-baseline gap-5 py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-xs font-bold tabular-nums text-gray-300 group-hover:text-green-400 transition-colors shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-gray-700 group-hover:text-green-800 transition-colors leading-snug line-clamp-2">
                    {p.title}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{p.readTime}</span>
                  <span className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0 text-sm">→</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── BIG CTA ── */}
        <section className="mt-14 rounded-2xl px-8 py-12 text-center" style={{ backgroundColor: D }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Treba vam dokument odmah?
          </h2>
          <p className="mt-3 text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#86efac' }}>
            AI alati generišu profesionalne dokumente za 60 sekundi.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[['Ugovor o radu','/ugovor-o-radu'],['NDA sporazum','/nda'],['Poslovni mejl','/poslovni-mejl'],['Ugovor o delu','/ugovor-o-delu']].map(([l,h]) => (
              <a key={h} href={h} className="cta-outline rounded-xl px-4 py-2.5 text-sm font-semibold">{l}</a>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: D, color: '#d1fae5' }} className="py-12 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-semibold text-white mb-4 text-sm">Alati</p>
            <ul className="space-y-2">
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
        <div className="border-t pt-6 text-xs text-center" style={{ borderColor: '#14532d', color: '#6ee7b7' }}>
          <p>© 2026 AIsistent. Sva prava zadržana.</p>
        </div>
      </footer>
    </div>
  )
}
