import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlogAdminActions } from '@/components/admin/BlogAdminActions'

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: posts } = await (admin as any)
    .from('blog_posts')
    .select('id, slug, title, date, published, read_time, keywords')
    .order('date', { ascending: false }) as { data: Array<{ id: string; slug: string; title: string; date: string; published: boolean; read_time: string; keywords: string[] }> | null }

  const published = posts?.filter(p => p.published).length ?? 0
  const drafts = (posts?.length ?? 0) - published

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Blog postovi</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-zinc-500">
            <span className="text-green-400 font-bold tabular-nums">{published}</span> objavl.
          </span>
          <span className="text-zinc-500">
            <span className="text-zinc-300 font-bold tabular-nums">{drafts}</span> draft
          </span>
          <span className="text-zinc-600">
            {posts?.length ?? 0} ukupno
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="px-5 py-3 border-b border-zinc-800 grid grid-cols-[1fr_90px_160px] gap-4">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Naslov / Slug</span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Datum</span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Status / Akcije</span>
        </div>

        {(posts ?? []).map(post => (
          <div
            key={post.id}
            className="px-5 py-4 grid grid-cols-[1fr_90px_160px] gap-4 items-center border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate leading-snug">{post.title}</p>
              <p className="text-[11px] text-zinc-600 font-mono mt-0.5 truncate">{post.slug}</p>
            </div>
            <p className="text-xs text-zinc-500 tabular-nums">
              {new Date(post.date).toLocaleDateString('sr-RS')}
            </p>
            <BlogAdminActions id={post.id} published={post.published} title={post.title} />
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <div className="px-5 py-12 text-center text-sm text-zinc-600">
            Nema blog postova. Dodaj ih putem n8n ili direktno u Supabase.
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-700">
        Kreiranje i uređivanje postova radi se putem n8n ili direktnog upisa u Supabase tabelu <code className="font-mono text-zinc-500">blog_posts</code>.
      </p>
    </div>
  )
}
