import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPostMeta, getPost } from '@/lib/blog'

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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/95 sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <Link href="/">
            <img
              src="/logo/AIsistent-Logo_6003x180.png"
              alt="AIsistent"
              height={28}
              style={{ objectFit: 'contain', maxWidth: '140px', width: 'auto' }}
            />
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Počnite besplatno
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/blog" className="hover:text-gray-900">← Blog</Link>
        </nav>

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <time dateTime={post.date}>{post.date}</time>
          {post.readTime && (
            <>
              <span>·</span>
              <span>{post.readTime} čitanja</span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">{post.description}</p>

        <article
          className="mt-10 prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-[#1B6B4A] prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          <h2 className="text-xl font-bold">Generišite poslovne dokumente za minuta</h2>
          <p className="mt-2 text-sm text-white/80">
            Ugovor o radu, NDA, faktura i još 16 tipova — besplatno za početak.
          </p>
          <Link
            href="/register"
            className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ color: PRIMARY }}
          >
            Počnite besplatno →
          </Link>
        </div>

        <nav className="mt-10 text-sm">
          <Link href="/blog" className="text-gray-500 hover:text-gray-900">← Svi blog postovi</Link>
        </nav>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © 2026 AIsistent · <Link href="/" className="hover:text-gray-600">Početna</Link>
      </footer>
    </div>
  )
}
