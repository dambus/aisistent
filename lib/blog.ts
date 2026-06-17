import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  readTime: string
  keywords: string[]
}

export interface Post extends PostMeta {
  contentHtml: string
}

export function getAllPostMeta(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  return files
    .map(filename => {
      const slug = filename.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
      const { data } = matter(raw)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        description: data.description ?? '',
        readTime: data.readTime ?? '',
        keywords: data.keywords ?? [],
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

const SR_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar']

export function formatDateSr(isoDate: string): string {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return `${d.getDate()}. ${SR_MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

export function splitHtmlAtMidpoint(html: string): [string, string] {
  // Split on top-level block tags - find the tag closest to 50%
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

export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const processed = await remark().use(html).process(content)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    description: data.description ?? '',
    readTime: data.readTime ?? '',
    keywords: data.keywords ?? [],
    contentHtml: processed.toString(),
  }
}
