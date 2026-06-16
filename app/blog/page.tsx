import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPostMeta } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — AIsistent | Poslovni saveti za srpske preduzetnike',
  description: 'Vodič i saveti za preduzetnike u Srbiji: ugovori, porezi, registracija firme, poslovne odluke.',
}

const PRIMARY = '#1B6B4A'

export default function BlogPage() {
  const posts = getAllPostMeta()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/95 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">
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

      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blog</h1>
        <p className="mt-3 text-lg text-gray-600">
          Saveti i vodič za preduzetnike, freelancere i male firme u Srbiji.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 p-6 transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <time dateTime={post.date}>{post.date}</time>
                {post.readTime && (
                  <>
                    <span>·</span>
                    <span>{post.readTime} čitanja</span>
                  </>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#1B6B4A] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 flex-1">
                {post.description}
              </p>
              <span className="mt-4 text-sm font-semibold" style={{ color: PRIMARY }}>
                Pročitajte →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © 2026 AIsistent · <Link href="/" className="hover:text-gray-600">Početna</Link>
      </footer>
    </div>
  )
}
