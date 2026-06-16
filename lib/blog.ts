import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

interface PostFrontmatter {
  title: string
  date: string
  description: string
  readTime: string
}

export interface BlogPostSummary extends PostFrontmatter {
  slug: string
}

export interface BlogPost extends BlogPostSummary {
  content: string
}

function getMarkdownFiles(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter(fileName => fileName.endsWith('.md'))
}

function parsePost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, '')
  const fullPath = path.join(BLOG_DIR, fileName)
  const source = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(source)
  const frontmatter = data as Partial<PostFrontmatter>

  if (!frontmatter.title || !frontmatter.date || !frontmatter.description || !frontmatter.readTime) {
    throw new Error(`Blog post "${fileName}" nema kompletan frontmatter.`)
  }

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    description: frontmatter.description,
    readTime: frontmatter.readTime,
    content,
  }
}

export function getAllPosts(): BlogPostSummary[] {
  return getMarkdownFiles()
    .map(parsePost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _content, ...post }) => post)
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  return parsePost(`${slug}.md`)
}
