/**
 * Faza 4 — batch kuracija (next_session_note stavka 2).
 *
 * Za sve AcroForm kandidate iz harvest-state.json koji još nisu kurirani
 * (nema curatedSlug, nema postojeći .curation.json):
 *  1. pokreće curate-form.ts propose <pdf> (postojeći pipeline, nepromenjen)
 *  2. Claude skicira meta (title/short_name/category/description) na osnovu
 *     imena fajla + labela ekstrahovanih polja — SAMO predlog, kurator uvek
 *     ručno pregleda pre publish-a
 *
 * Ne radi publish/go-live — to ostaje ručni korak (spec: kurator uvek odobrava).
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/batch-curate.ts [--limit N] [--source <id>]
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

interface HarvestEntry {
  sourceId: string
  filename: string
  type: 'acroform' | 'flat'
  curatedSlug?: string
  sourceUrl: string
}

const CATEGORY_BY_SOURCE: Record<string, string> = {
  'apr-privredna-drustva': 'apr',
}

const META_SYSTEM_PROMPT = `Ti pišeš kratke, jasne meta podatke za obrazac državne institucije u srpskoj biblioteci obrazaca (na latinici).

Dobićeš ime fajla obrasca i listu labela polja iz njega. Vrati ISKLJUČIVO validan JSON:
{"title":"...","short_name":"...","description":"..."}

Pravila:
- title: pun, prepoznatljiv naziv obrasca (npr. "Dodatak 06 PS — Zakonski zastupnici"), latinicom
- short_name: KRATAK tag, bitno kraći od title (npr. "Dodatak 06"), nikad ne ponavljaj ceo title
- description: jedna rečenica, šta se ovim obrascem prijavljuje/traži, latinicom, bez fraza "ovaj obrazac služi za"
- Nikad ne izmišljaj instituciju ili svrhu koja nije vidljiva iz naziva fajla/labela
- Sve latinicom bez obzira na pismo originalnih labela`

async function draftMeta(filename: string, labels: string[]): Promise<{ title: string; short_name: string; description: string }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const userMessage = `Fajl: ${filename}\n\nLabele polja:\n${labels.slice(0, 40).join('\n')}`
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: META_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  return JSON.parse(stripped)
}

async function main() {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity
  const sourceIdx = args.indexOf('--source')
  const onlySource = sourceIdx >= 0 ? args[sourceIdx + 1] : null

  const rawState: Record<string, Omit<HarvestEntry, 'sourceUrl'>> = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
  const state: Record<string, HarvestEntry> = Object.fromEntries(
    Object.entries(rawState).map(([url, e]) => [url, { ...e, sourceUrl: url }])
  )

  const candidates = Object.values(state).filter(e => {
    if (e.type !== 'acroform') return false
    if (e.curatedSlug) return false
    if (onlySource && e.sourceId !== onlySource) return false
    const base = path.basename(e.filename, path.extname(e.filename)).replace(/[^a-z0-9_-]/gi, '-')
    const curationPath = path.join(CURATION_DIR, `${base}.curation.json`)
    return !fs.existsSync(curationPath) // već predložen — preskoči, ne pregazi kuratorove izmene
  })

  console.log(`Kandidata za batch propose: ${candidates.length}${limit < Infinity ? ` (radim prvih ${limit})` : ''}\n`)

  const done: string[] = []
  const failed: string[] = []

  for (const entry of candidates.slice(0, limit)) {
    const pdfPath = path.join(HARVEST_DIR, entry.sourceId, entry.filename)
    const base = path.basename(entry.filename, path.extname(entry.filename)).replace(/[^a-z0-9_-]/gi, '-')
    const curationPath = path.join(CURATION_DIR, `${base}.curation.json`)

    console.log(`═══ ${entry.filename} ═══`)
    try {
      execFileSync('npx', ['tsx', '--tsconfig', 'tsconfig.json', 'scripts/curate-form.ts', 'propose', pdfPath], { stdio: 'inherit', shell: true })

      const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'))
      const labels: string[] = curation.fields.map((f: { _label?: string | null }) => f._label).filter(Boolean)

      const meta = await draftMeta(entry.filename, labels)
      curation.meta.title = meta.title
      curation.meta.short_name = meta.short_name
      curation.meta.description = meta.description
      curation.meta.category = CATEGORY_BY_SOURCE[entry.sourceId] ?? 'ostalo'
      curation.meta.source_institution = 'Agencija za privredne registre'
      curation.meta.source_url = entry.sourceUrl
      // Grubi slug od short_name — kurator proverava/menja pre publish-a (validacija u publish-u i dalje važi)
      curation.meta.slug = meta.short_name
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // skini dijakritiku
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

      fs.writeFileSync(curationPath, JSON.stringify(curation, null, 2))
      console.log(`  meta upisana: "${meta.title}" (${meta.short_name})\n`)
      done.push(entry.filename)
    } catch (err) {
      console.error(`  ❌ ${err instanceof Error ? err.message : err}\n`)
      failed.push(entry.filename)
    }
  }

  console.log(`\n═══ Rezime ═══`)
  console.log(`Predloženo: ${done.length}`)
  console.log(`Greške: ${failed.length}`)
  failed.forEach(f => console.log(`  ✗ ${f}`))
  console.log(`\nSledeće: pregledaj JSON-ove u scripts/curation/*.curation.json (naročito fields — Claude predlog mapiranja i dalje treba proveriti), pa curate-form.ts publish za svaki.`)
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
