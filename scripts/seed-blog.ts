/**
 * Migracija blog postova iz content/blog/*.md u Supabase blog_posts tabelu.
 *
 * Upotreba:
 *   npm run seed:blog
 *
 * Pokreni jednom nakon primene migracije 20260625000001_add_blog_posts.sql
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

// Load env files — .env.production.local ima prednost nad .env.local
for (const envFile of ['.env.local', '.env.production.local']) {
  const envPath = path.resolve(process.cwd(), envFile)
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) process.env[match[1].trim()] = match[2].trim()
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

async function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  console.log(`\n📝 Pronađeno ${files.length} blog postova\n${'─'.repeat(50)}`)

  let ok = 0
  let skip = 0

  for (const filename of files) {
    const slug = filename.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
    const { data, content } = matter(raw)

    const row = {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      content_md: content.trim(),
      date: data.date ?? new Date().toISOString().slice(0, 10),
      read_time: data.readTime ?? '',
      keywords: data.keywords ?? [],
      published: true,
    }

    const { error } = await supabase
      .from('blog_posts')
      .upsert(row, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ ${slug}: ${error.message}`)
    } else {
      console.log(`✅ ${slug}`)
      ok++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Završeno: ${ok} upisano, ${skip} preskočeno\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
