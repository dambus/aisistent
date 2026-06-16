import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — saveti za preduzetnike | AIsistent',
  description:
    'Praktični saveti za preduzetnike u Srbiji: ugovori, dokumentacija, HR i svakodnevno poslovanje.',
}

const PRIMARY = '#1B6B4A'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section
        className="border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #F0F7F4 60%, #F8FAF9 100%)' }}
      >
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em]" style={{ color: PRIMARY }}>
            Blog
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Saveti za preduzetnike, poslodavce i male timove
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
            Kratki i praktični vodiči o dokumentima, zapošljavanju i svakodnevnim poslovnim odlukama
            za srpsko tržište.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-6">
          {posts.map(post => (
            <article
              key={post.slug}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{formatDate(post.date)}</span>
                <span aria-hidden="true">•</span>
                <span>{post.readTime}</span>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
                <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-[#1B6B4A]">
                  {post.title}
                </Link>
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-gray-600">{post.description}</p>

              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex text-sm font-semibold"
                style={{ color: PRIMARY }}
              >
                Pročitajte tekst →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
