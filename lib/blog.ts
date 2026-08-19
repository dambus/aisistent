import { createClient } from '@supabase/supabase-js'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  readTime: string
  keywords: string[]
  // SEO <title>/<meta description> override — nezavisno od title/description (H1/body).
  // null = generateMetadata koristi title/description kao fallback.
  metaTitle: string | null
  metaDescription: string | null
}

export interface Post extends PostMeta {
  contentHtml: string
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, date, description, read_time, keywords, meta_title, meta_description')
    .eq('published', true)
    .order('date', { ascending: false })

  return (data ?? []).map(row => ({
    slug: row.slug,
    title: row.title,
    date: row.date,
    description: row.description,
    readTime: row.read_time,
    keywords: row.keywords ?? [],
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  }))
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, date, description, read_time, keywords, content_md, meta_title, meta_description')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) return null

  const processed = await remark().use(remarkGfm).use(html).process(data.content_md)

  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    description: data.description,
    readTime: data.read_time,
    keywords: data.keywords ?? [],
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    contentHtml: processed.toString(),
  }
}

const SR_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar']

export function formatDateSr(isoDate: string): string {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return `${d.getDate()}. ${SR_MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

export function splitHtmlAtMidpoint(html: string): [string, string] {
  const tagRe = /(<\/(?:p|h[2-6]|ul|ol|blockquote)>)/gi
  const matches: number[] = []
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(html)) !== null) {
    matches.push(m.index + m[0].length)
  }
  if (matches.length < 2) return [html, '']
  const mid = html.length / 2
  const splitAt = matches.reduce((prev, cur) => Math.abs(cur - mid) < Math.abs(prev - mid) ? cur : prev)
  return [html.slice(0, splitAt), html.slice(splitAt)]
}
