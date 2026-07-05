/**
 * Faza 4 — harvester izvora obrazaca (FAZA4 spec, sekcija 6 + Milanova ideja 5. jul).
 *
 * Za svaki izvor iz scripts/curation/sources.json:
 *  1. Skine stranicu, izvuče linkove ka PDF-ovima (filtrira uputstva/vodiče/brošure)
 *  2. Skine svaki PDF u scripts/harvest/<sourceId>/ (folder je u .gitignore)
 *  3. Klasifikuje: AcroForm (kandidat za biblioteku) vs flat (preskače se po pravilu 6.1)
 *  4. Poredi sha256 sa scripts/curation/harvest-state.json → new / changed / unchanged
 *
 * Harvest ≠ publish: rezultat je RED ZA KURACIJU — kurator za svaki kandidat i dalje
 * pokreće curate-form.ts propose/publish/go-live. changed status na URL-u koji je već
 * kuriran znači da institucija ima novu verziju → re-kuracija.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/harvest-sources.ts [--source <id>]
 */
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { PDFDocument } from 'pdf-lib'

const SOURCES_PATH = path.join(process.cwd(), 'scripts/curation/sources.json')
const STATE_PATH = path.join(process.cwd(), 'scripts/curation/harvest-state.json')
const HARVEST_DIR = path.join(process.cwd(), 'scripts/harvest')

const USER_AGENT = 'Mozilla/5.0 (compatible; AIsistent-harvester/1.0; +https://aisistent.rs)'

// Dokumenti koji nisu obrasci — uputstva, vodiči, interna akta institucije
const NOISE_RE = /uputstvo|uputstva|vodic|vodi%C4%8D|brosura|bro%C5%A1ura|informator|pravilnik|program|plan_|_plan|odluka|izvestaj|obavestenje|korisnicko|zapisnik|cenovnik|naknade/i

interface Source {
  id: string
  institution: string
  category: string
  url: string
}

interface HarvestEntry {
  sourceId: string
  filename: string
  sha256: string
  pages: number
  acroFields: number
  type: 'acroform' | 'flat'
  firstSeen: string
  lastSeen: string
  // slug u library_forms ako je obrazac kuriran — kurator upisuje ručno posle go-live,
  // da bi "changed" status znao da pogađa živ obrazac
  curatedSlug?: string
}

type HarvestState = Record<string, HarvestEntry> // key = apsolutni URL PDF-a

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&scaron;/g, 'š').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function extractPdfLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>()
  const re = /href="([^"]+\.pdf)"/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const href = decodeEntities(m[1])
    if (NOISE_RE.test(href)) continue
    try {
      links.add(new URL(href, baseUrl).href)
    } catch {
      // nevalidan URL — preskoči
    }
  }
  return [...links].sort()
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const onlySource = process.argv.includes('--source')
    ? process.argv[process.argv.indexOf('--source') + 1]
    : null

  const { sources }: { sources: Source[] } = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'))
  const state: HarvestState = fs.existsSync(STATE_PATH)
    ? JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
    : {}

  const now = new Date().toISOString()
  const summary = { new: [] as string[], changed: [] as string[], unchanged: 0, flat: 0, errors: [] as string[] }

  for (const source of sources) {
    if (onlySource && source.id !== onlySource) continue
    console.log(`\n═══ ${source.institution} — ${source.id} ═══`)

    let html: string
    try {
      html = (await fetchBuffer(source.url)).toString('utf8')
    } catch (err) {
      console.error(`  ❌ stranica nedostupna: ${err instanceof Error ? err.message : err}`)
      summary.errors.push(`${source.id}: stranica nedostupna`)
      continue
    }

    const links = extractPdfLinks(html, source.url)
    console.log(`  PDF linkova (posle noise filtera): ${links.length}`)

    const outDir = path.join(HARVEST_DIR, source.id)
    fs.mkdirSync(outDir, { recursive: true })

    for (const url of links) {
      const filename = decodeURIComponent(url.split('/').pop() ?? 'unknown.pdf').replace(/[^\w.-]+/g, '_')
      try {
        const buffer = await fetchBuffer(url)
        const sha256 = createHash('sha256').update(buffer).digest('hex')

        const prev = state[url]
        if (prev && prev.sha256 === sha256) {
          prev.lastSeen = now
          summary.unchanged++
          continue
        }

        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
        const acroFields = pdfDoc.getForm().getFields().length
        const type: 'acroform' | 'flat' = acroFields > 0 ? 'acroform' : 'flat'

        fs.writeFileSync(path.join(outDir, filename), buffer)

        const status = prev ? 'changed' : 'new'
        state[url] = {
          sourceId: source.id,
          filename,
          sha256,
          pages: pdfDoc.getPageCount(),
          acroFields,
          type,
          firstSeen: prev?.firstSeen ?? now,
          lastSeen: now,
          ...(prev?.curatedSlug ? { curatedSlug: prev.curatedSlug } : {}),
        }

        if (type === 'flat') {
          summary.flat++
          console.log(`  [flat    ] ${filename} (preskače se — pravilo 6.1)`)
          continue
        }

        const curatedNote = prev?.curatedSlug ? `  ⚠️ KURIRAN kao "${prev.curatedSlug}" — treba re-kuracija!` : ''
        console.log(`  [${status.toUpperCase().padEnd(8)}] ${filename} — ${pdfDoc.getPageCount()} str, ${acroFields} polja${curatedNote}`)
        summary[status].push(`${source.id}/${filename}`)
      } catch (err) {
        console.error(`  ❌ ${filename}: ${err instanceof Error ? err.message : err}`)
        summary.errors.push(`${source.id}/${filename}`)
      }
    }
  }

  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))

  console.log(`\n═══ Rezime ═══`)
  console.log(`Novi AcroForm kandidati: ${summary.new.length}`)
  summary.new.forEach(f => console.log(`  + ${f}`))
  console.log(`Izmenjeni: ${summary.changed.length}`)
  summary.changed.forEach(f => console.log(`  ~ ${f}`))
  console.log(`Nepromenjeni: ${summary.unchanged} | flat (preskočeni): ${summary.flat} | greške: ${summary.errors.length}`)
  console.log(`\nStanje: ${STATE_PATH}`)
  console.log(`Fajlovi: ${HARVEST_DIR}/<sourceId>/`)
  console.log(`Sledeće za kandidata: npx tsx --tsconfig tsconfig.json scripts/curate-form.ts propose scripts/harvest/<sourceId>/<fajl>.pdf`)
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
