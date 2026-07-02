/**
 * Korak 8 — pun pipeline test bez UI/auth.
 *
 * Provlači dati PDF kroz STVARNE produkcijske module (isti kod kao di-analyze
 * i generate-filled API rute): analyzeLayout → extractAcroFormFields/extractFlatPdfFields
 * → matchFieldLabels → mapFieldsToProfile (pravi Claude poziv) → composite/hint
 * post-processing → fillAcroFormFields/fillTableCells. Snima popunjeni PDF za
 * vizuelnu proveru.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-full-pipeline.ts <pdf-path>
 */
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import { analyzeLayout } from '../lib/documentIntelligence/analyzeLayout'
import { extractAcroFormFields } from '../lib/documentIntelligence/extractAcroFormFields'
import { matchFieldLabels } from '../lib/documentIntelligence/matchFieldLabels'
import { extractFlatPdfFields } from '../lib/documentIntelligence/extractFlatPdfFields'
import { mapFieldsToProfile } from '../lib/documentIntelligence/semanticMapper'
import { detectSectionHeadings, assignSections } from '../lib/documentIntelligence/detectSections'
import { fillAcroFormFields, fillTableCells } from '../lib/documentIntelligence/pdfOverlay'
import type { GuideField } from '../types/obrasci'
import type { Company } from '../types/database'

config({ path: '.env.local' })

const pdfPath = process.argv[2]
if (!pdfPath) {
  console.error('Usage: npx tsx --tsconfig tsconfig.json scripts/test-full-pipeline.ts <pdf-path>')
  process.exit(1)
}

const MOCK_COMPANY: Company = {
  id: 'mock',
  user_id: 'mock',
  naziv: 'Testna Firma d.o.o.',
  pib: '123456789',
  maticni_broj: '87654321',
  adresa: 'Kneza Miloša 42',
  grad: 'Beograd',
  zastupnik: 'Marko Marković',
  funkcija_zastupnika: 'Direktor',
  email: 'info@testnafirma.rs',
  telefon: '063 1234567',
  logo_url: null,
  delatnost: 'Razvoj softvera (62.01)',
  ziro_racun: '160-123456789-12',
  pdv_obveznik: true,
  website: 'www.testnafirma.rs',
  is_default: true,
  created_at: new Date().toISOString(),
}

async function main() {
  const label = path.basename(pdfPath, path.extname(pdfPath)).replace(/[^a-z0-9_-]/gi, '-')
  const outDir = path.join(process.cwd(), 'scripts/output')
  fs.mkdirSync(outDir, { recursive: true })

  const buffer = fs.readFileSync(pdfPath)
  console.log(`\n=== ${label} ===`)

  console.log('DI analiza...')
  const diResult = await analyzeLayout(buffer)

  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const { fields: acroFields } = await extractAcroFormFields(buffer)
  const type: 'acroform' | 'flat' = acroFields.length > 0 ? 'acroform' : 'flat'
  console.log(`Tip: ${type}  |  AcroForm polja: ${acroFields.length}`)

  type ExtractedField = {
    id: string
    label: string | null
    confidence: 'high' | 'low'
    page: number
    xLeft: number
    yCtr: number
  }
  let extractedFields: ExtractedField[]

  if (type === 'acroform') {
    const pageHeightsPt = pdfDoc.getPages().map(p => p.getSize().height)
    const matches = matchFieldLabels(acroFields, diResult, pageHeightsPt)
    extractedFields = matches.map(m => ({
      id: m.fieldName,
      label: m.label,
      confidence: m.confidence,
      page: m.page,
      xLeft: m.boundingBox.x,
      yCtr: m.boundingBox.y + m.boundingBox.h / 2,
    }))
  } else {
    const flatFields = extractFlatPdfFields(diResult)
    extractedFields = flatFields.map(f => ({
      id: f.id,
      label: f.label,
      confidence: f.confidence,
      page: f.page,
      xLeft: f.boundingBox.x,
      yCtr: f.boundingBox.y + f.boundingBox.h / 2,
    }))
  }

  console.log(`Ekstrahovano polja: ${extractedFields.length}`)

  const sectionHeadings = detectSectionHeadings(diResult)
  const sectionMap = assignSections(extractedFields, sectionHeadings)
  console.log(`Detektovano sekcija: ${sectionHeadings.length}`)

  console.log('Semantičko mapiranje (Claude)...')
  const mappingInput = extractedFields.map(f => ({ id: f.id, label: f.label, section: sectionMap.get(f.id) ?? null }))
  const mappedFields = await mapFieldsToProfile(mappingInput, MOCK_COMPANY)
  const mappedMap = new Map(mappedFields.map(m => [m.id, m]))

  const rawFields: GuideField[] = extractedFields.map(ef => {
    const mapped = mappedMap.get(ef.id)
    const suggestedValue = mapped?.suggestedValue ?? null
    const isInternal = mapped?.isInternal ?? false
    const profileKey = mapped?.profileKey ?? null

    let state: GuideField['state'] = 'manual'
    if (!isInternal && suggestedValue !== null) {
      state = ef.confidence
    }

    return { id: ef.id, label: ef.label, suggestedValue, profileKey, isInternal, state }
  })

  // Composite grupe (identično di-analyze/route.ts)
  const SAME_LINE_Y_IN = 0.12
  const compositeSecondary = new Map<string, string>()
  const compositePrimary = new Set<string>()

  for (let i = 0; i < extractedFields.length; i++) {
    const a = extractedFields[i]
    if (!a.label) continue
    for (let j = i + 1; j < extractedFields.length; j++) {
      const b = extractedFields[j]
      if (b.label !== a.label) continue
      if (b.page !== a.page) continue
      if (Math.abs(b.yCtr - a.yCtr) >= SAME_LINE_Y_IN) continue
      const [primary, secondary] = b.xLeft > a.xLeft ? [a, b] : [b, a]
      compositeSecondary.set(secondary.id, primary.id)
      compositePrimary.add(primary.id)
    }
  }

  const PHONE_PRIMARY_HINT = 'Broj telefona je podeljen u više polja obrasca — proverite da li ceo broj staje.'
  const PHONE_SECONDARY_HINT = 'Nastavak broja telefona iz susednog polja.'

  const fields: GuideField[] = rawFields.map(f => {
    const primaryId = compositeSecondary.get(f.id)
    if (primaryId) {
      const primaryMapped = mappedMap.get(primaryId)
      const hint = primaryMapped?.profileKey === 'telefon' ? PHONE_SECONDARY_HINT : null
      return { ...f, suggestedValue: null, state: 'manual' as const, hint }
    }
    if (compositePrimary.has(f.id)) {
      const mapped = mappedMap.get(f.id)
      const hint = mapped?.profileKey === 'telefon' ? PHONE_PRIMARY_HINT : null
      return { ...f, hint }
    }
    return f
  })

  const high = fields.filter(f => f.state === 'high').length
  const low = fields.filter(f => f.state === 'low').length
  const manual = fields.filter(f => f.state === 'manual').length
  const noLabel = fields.filter(f => !f.label).length
  console.log(`\nStanja: high=${high}  low=${low}  manual=${manual}  (bez labele: ${noLabel})`)

  console.log('\nPrimeri mapiranih polja (high/low):')
  fields.filter(f => f.state !== 'manual').slice(0, 25).forEach(f => {
    console.log(`  [${f.state}] "${f.label}" → ${f.profileKey} = "${f.suggestedValue}"${f.hint ? `  ⚠ ${f.hint}` : ''}`)
  })

  const compositeCount = [...compositeSecondary.keys()].length
  if (compositeCount > 0) {
    console.log(`\nComposite grupe detektovane: ${compositeCount}`)
  }

  // ─── Overlay — pravi fillAcroFormFields / fillTableCells ───────────────────
  console.log('\nGenerišem popunjeni PDF (overlay)...')
  const outPath = path.join(outDir, `${label}-pipeline-filled.pdf`)

  if (type === 'acroform') {
    const result = await fillAcroFormFields(pdfDoc, fields, diResult)
    pdfDoc.getForm().flatten()
    console.log(`Overlay rezultat:`, result)
  } else {
    const result = await fillTableCells(pdfDoc, fields, diResult)
    console.log(`Overlay rezultat:`, result)
  }

  const outBytes = await pdfDoc.save()
  fs.writeFileSync(outPath, outBytes)
  console.log(`\n✅ Sačuvano: ${outPath}`)
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
