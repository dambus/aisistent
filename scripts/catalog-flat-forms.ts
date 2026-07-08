/**
 * Faza 4 — kataloški (referentni) unos flat obrazaca bez autofill pokušaja (8. jul, Milan).
 *
 * Za institucije čija je cela biblioteka flat (npr. Poreska uprava) nema smisla trošiti
 * DI/Claude-field-mapping pipeline (curate-form.ts propose) — obrazac se ionako objavljuje
 * bez ijednog mapiranog polja. Ovaj skript umesto toga:
 *  1. Uzima STVARAN naziv obrasca sa izvorne stranice (input JSON: label/url/sourceId/filename/pages)
 *  2. Claude piše kratku meta (title/short_name/description) iz tog naziva — mnogo pouzdanije
 *     nego iz kriptičnog imena fajla
 *  3. Piše curation.json sa fields: [] (flat, bez profileKey — publish to i zahteva)
 *  4. publish + go-live odmah (nema šta vizuelno proveriti — nema fill-a)
 *  5. Upisuje curatedSlug u harvest-state.json
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/catalog-flat-forms.ts --input <json> [--limit N]
 *
 * Input JSON format: [{ label, url, sourceId, filename, pages, type }, ...]
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import Anthropic from '@anthropic-ai/sdk'

const STATE_PATH = path.join(process.cwd(), 'scripts/curation/harvest-state.json')
const CURATION_DIR = path.join(process.cwd(), 'scripts/curation')
const HARVEST_DIR = path.join(process.cwd(), 'scripts/harvest')

interface InputEntry {
  label: string
  url: string
  sourceId: string
  filename: string
  pages: number
  type: string
}

const CATEGORY_BY_SOURCE: Record<string, string> = {
  'poreska-pravna-lica': 'poreska',
  'poreska-preduzetnici': 'poreska',
  'apr-privredna-drustva': 'apr',
  'apr-preduzetnici': 'apr',
  'apr-udruzenja': 'apr',
  'croso-obrasci': 'croso',
  'pio-maticna-evidencija': 'ostalo',
}

const INSTITUTION_BY_SOURCE: Record<string, string> = {
  'poreska-pravna-lica': 'Poreska uprava',
  'poreska-preduzetnici': 'Poreska uprava',
  'apr-privredna-drustva': 'Agencija za privredne registre',
  'apr-preduzetnici': 'Agencija za privredne registre',
  'apr-udruzenja': 'Agencija za privredne registre',
  'croso-obrasci': 'Centralni registar obaveznog socijalnog osiguranja',
  'pio-maticna-evidencija': 'Republički fond za penzijsko i invalidsko osiguranje',
}

const META_SYSTEM_PROMPT = `Ti pišeš kratke, jasne meta podatke za obrazac državne institucije u srpskoj biblioteci obrazaca (na latinici).

Dobićeš ZVANIČAN naziv obrasca sa sajta institucije. Vrati ISKLJUČIVO validan JSON:
{"title":"...","short_name":"...","description":"..."}

Pravila:
- title: zvaničan naziv, može biti skraćen ako je predugačak, ali mora ostati prepoznatljiv, latinicom
- short_name: KRATAK tag (2-5 reči), bitno kraći od title, nikad ne ponavljaj ceo title (npr. "PPP-PD", "Poreski bilans", "Obračun amortizacije")
- description: jedna rečenica, ko i kada podnosi ovaj obrazac, latinicom, bez fraza "ovaj obrazac služi za"
- Sve latinicom bez obzira na pismo naziva`

async function draftMeta(label: string): Promise<{ title: string; short_name: string; description: string }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system: META_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Zvaničan naziv obrasca: ${label}` }],
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  return JSON.parse(stripped)
}

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function existingSlugs(): Set<string> {
  const slugs = new Set<string>()
  for (const f of fs.readdirSync(CURATION_DIR)) {
    if (!f.endsWith('.curation.json')) continue
    try {
      const j = JSON.parse(fs.readFileSync(path.join(CURATION_DIR, f), 'utf8'))
      if (j.meta?.slug) slugs.add(j.meta.slug)
    } catch { /* skip */ }
  }
  return slugs
}

async function main() {
  const args = process.argv.slice(2)
  const inputIdx = args.indexOf('--input')
  if (inputIdx < 0) {
    console.error('Usage: catalog-flat-forms.ts --input <json> [--limit N]')
    process.exit(1)
  }
  const inputPath = args[inputIdx + 1]
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity

  const entries: InputEntry[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
  const usedSlugs = existingSlugs()

  const todo = entries.filter(e => !state[e.url]?.curatedSlug)
  console.log(`Kandidata: ${todo.length}${limit < Infinity ? ` (radim prvih ${limit})` : ''}\n`)

  let done = 0, failed = 0
  for (const entry of todo.slice(0, limit)) {
    console.log(`═══ ${entry.label} ═══`)
    try {
      const meta = await draftMeta(entry.label)
      let slug = slugify(meta.short_name)
      if (usedSlugs.has(slug)) {
        let i = 2
        while (usedSlugs.has(`${slug}-${i}`)) i++
        slug = `${slug}-${i}`
      }
      usedSlugs.add(slug)

      const curation = {
        meta: {
          slug,
          title: meta.title,
          short_name: meta.short_name,
          category: CATEGORY_BY_SOURCE[entry.sourceId] ?? 'ostalo',
          description: meta.description,
          source_institution: INSTITUTION_BY_SOURCE[entry.sourceId] ?? 'Nepoznato',
          source_url: entry.url,
          script: 'cyrillic',
          source_type: 'flat',
          page_count: entry.pages,
        },
        fields: [],
      }

      const base = path.basename(entry.filename, path.extname(entry.filename)).replace(/[^a-z0-9_-]/gi, '-')
      const curationPath = path.join(CURATION_DIR, `${base}.curation.json`)
      fs.writeFileSync(curationPath, JSON.stringify(curation, null, 2))

      const pdfPath = path.join(HARVEST_DIR, entry.sourceId, entry.filename)
      execFileSync('npx', ['tsx', '--tsconfig', 'tsconfig.json', 'scripts/curate-form.ts', 'publish', pdfPath, curationPath], { stdio: 'inherit', shell: true })
      execFileSync('npx', ['tsx', '--tsconfig', 'tsconfig.json', 'scripts/curate-form.ts', 'go-live', slug], { stdio: 'inherit', shell: true })

      state[entry.url] = { ...state[entry.url], curatedSlug: slug }
      fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))

      console.log(`  ✅ "${slug}"\n`)
      done++
    } catch (err) {
      console.error(`  ❌ ${err instanceof Error ? err.message : err}\n`)
      failed++
    }
  }

  console.log(`\n═══ Rezime ═══\nObjavljeno: ${done} | Greške: ${failed}`)
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
