/**
 * Faza 3 Korak 1 — STOP checkpoint test.
 * Verifikuje da fingerprint algoritam vraća isti hash za isti PDF (dva puta)
 * i različit hash za različite obrasce.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-fingerprint.ts <pdf1> [pdf2...]
 */
import { config } from 'dotenv'
import fs from 'fs'
import { computeFingerprint } from '../lib/documentIntelligence/computeFingerprint'

config({ path: '.env.local' })

async function main() {
  const paths = process.argv.slice(2)
  if (paths.length === 0) {
    console.error('Usage: npx tsx --tsconfig tsconfig.json scripts/test-fingerprint.ts <pdf1> [pdf2...]')
    process.exit(1)
  }

  const results: { path: string; fingerprint: string; pageCount: number; acroFormFieldCount: number }[] = []

  for (const p of paths) {
    const buffer = fs.readFileSync(p)
    const r = await computeFingerprint(buffer)
    results.push({ path: p, ...r })
    console.log(`${p}\n  fingerprint: ${r.fingerprint}\n  pageCount: ${r.pageCount}  acroFormFieldCount: ${r.acroFormFieldCount}\n`)
  }

  console.log('=== Determinizam (isti fajl dva puta) ===')
  const first = paths[0]
  const buffer = fs.readFileSync(first)
  const repeat = await computeFingerprint(buffer)
  const match = repeat.fingerprint === results[0].fingerprint
  console.log(`${first} — drugi poziv: ${repeat.fingerprint}`)
  console.log(match ? '✓ IDENTIČAN fingerprint na ponovljenom pozivu' : '✗ RAZLIČIT — determinizam pao')

  if (results.length > 1) {
    console.log('\n=== Različiti obrasci — fingerprint mora biti različit ===')
    for (let i = 1; i < results.length; i++) {
      const diff = results[i].fingerprint !== results[0].fingerprint
      console.log(`${results[0].path} vs ${results[i].path}: ${diff ? '✓ različit' : '✗ ISTI — kolizija!'}`)
    }
  }
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
