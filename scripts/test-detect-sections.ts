/**
 * Faza 3 Korak 2 — STOP checkpoint test.
 * Prikazuje detektovane naslove sekcija + primer dodele polja sekcijama.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-detect-sections.ts <pdf-path>
 */
import { config } from 'dotenv'
import fs from 'fs'
import { PDFDocument } from 'pdf-lib'
import { analyzeLayout } from '../lib/documentIntelligence/analyzeLayout'
import { extractAcroFormFields } from '../lib/documentIntelligence/extractAcroFormFields'
import { matchFieldLabels } from '../lib/documentIntelligence/matchFieldLabels'
import { extractFlatPdfFields } from '../lib/documentIntelligence/extractFlatPdfFields'
import { detectSectionHeadings, assignSections } from '../lib/documentIntelligence/detectSections'

config({ path: '.env.local' })

async function main() {
  const pdfPath = process.argv[2]
  if (!pdfPath) {
    console.error('Usage: npx tsx --tsconfig tsconfig.json scripts/test-detect-sections.ts <pdf-path>')
    process.exit(1)
  }

  const buffer = fs.readFileSync(pdfPath)
  console.log('DI analiza...')
  const diResult = await analyzeLayout(buffer)

  const headings = detectSectionHeadings(diResult)
  console.log(`\n=== Detektovani naslovi sekcija (${headings.length}) ===`)
  headings.forEach(h => console.log(`  [str. ${h.page}, y=${h.yTop.toFixed(2)}] "${h.title}"`))

  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const { fields: acroFields } = await extractAcroFormFields(buffer)
  const type: 'acroform' | 'flat' = acroFields.length > 0 ? 'acroform' : 'flat'

  let positions: { id: string; page: number; yCtr: number; label: string | null }[]
  if (type === 'acroform') {
    const pageHeightsPt = pdfDoc.getPages().map(p => p.getSize().height)
    const matches = matchFieldLabels(acroFields, diResult, pageHeightsPt)
    positions = matches.map(m => ({ id: m.fieldName, page: m.page, yCtr: m.boundingBox.y + m.boundingBox.h / 2, label: m.label }))
  } else {
    const flatFields = extractFlatPdfFields(diResult)
    positions = flatFields.map(f => ({ id: f.id, page: f.page, yCtr: f.boundingBox.y + f.boundingBox.h / 2, label: f.label }))
  }

  const sectionMap = assignSections(positions, headings)

  const bySection = new Map<string, number>()
  for (const p of positions) {
    const section = sectionMap.get(p.id) ?? '?'
    bySection.set(section, (bySection.get(section) ?? 0) + 1)
  }

  console.log(`\n=== Broj polja po sekciji (ukupno ${positions.length} polja) ===`)
  for (const [section, count] of bySection.entries()) {
    console.log(`  "${section}": ${count} polja`)
  }

  console.log('\n=== Primer 15 polja sa dodeljenom sekcijom ===')
  positions.slice(0, 15).forEach(p => {
    console.log(`  [${sectionMap.get(p.id)}] "${p.label}"`)
  })
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
