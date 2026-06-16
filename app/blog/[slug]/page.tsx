import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

const PRIMARY = '#1B6B4A'

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateStaticParams() {
  return getAllPosts().map(post => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Blog | AIsistent',
    }
  }

  return {
    title: `${post.title} | AIsistent`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <article className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/blog" className="transition-colors hover:text-[#1B6B4A]">
            Blog
          </Link>
          <span className="mx-2">→</span>
          <span>{post.title}</span>
        </nav>

        <header className="rounded-3xl border border-gray-100 px-6 py-8 shadow-sm sm:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true">•</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">{post.description}</p>
        </header>

        <div className="mt-10 rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm sm:px-8">
          <ReactMarkdown
            components={{
              h2: props => <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900" {...props} />,
              h3: props => <h3 className="mt-8 text-xl font-bold text-gray-900" {...props} />,
              p: props => <p className="mt-5 text-base leading-8 text-gray-700" {...props} />,
              ul: props => <ul className="mt-5 list-disc space-y-2 pl-6 text-gray-700" {...props} />,
              ol: props => <ol className="mt-5 list-decimal space-y-2 pl-6 text-gray-700" {...props} />,
              li: props => <li className="leading-8" {...props} />,
              strong: props => <strong className="font-semibold text-gray-900" {...props} />,
              a: props => (
                <a
                  className="font-semibold underline underline-offset-4"
                  style={{ color: PRIMARY }}
                  {...props}
                />
              ),
              blockquote: props => (
                <blockquote
                  className="mt-6 border-l-4 border-[#1B6B4A] bg-[#F4FAF6] px-4 py-3 italic text-gray-700"
                  {...props}
                />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <section
          className="mt-10 rounded-3xl px-6 py-8 text-center text-white shadow-sm sm:px-8"
          style={{ backgroundColor: PRIMARY }}
        >
          <h2 className="text-2xl font-bold tracking-tight">Isprobajte AIsistent besplatno</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/85">
            Generišite poslovne dokumente za srpsko tržište brže, jasnije i bez kretanja od nule.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
            style={{ color: PRIMARY }}
          >
            Isprobajte AIsistent besplatno
          </Link>
        </section>
      </article>
    </main>
  )
}
