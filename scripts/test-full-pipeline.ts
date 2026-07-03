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
import { composeGuideFields, groupIntoSections, type ExtractedFieldLite } from '../lib/documentIntelligence/composeGuideFields'
import { detectSectionHeadings, assignSections } from '../lib/documentIntelligence/detectSections'
import { fillAcroFormFields, fillTableCells } from '../lib/documentIntelligence/pdfOverlay'
import { isSignatureField } from '../lib/documentIntelligence/signatureLabels'
import type { FormSection } from '../types/obrasci'
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

  let extractedFields: ExtractedFieldLite[]

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
      width: m.boundingBox.w,
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
      width: f.boundingBox.w,
    }))
  }

  console.log(`Ekstrahovano polja: ${extractedFields.length}`)

  const sectionHeadings = detectSectionHeadings(diResult)
  const sectionMap = assignSections(extractedFields, sectionHeadings)
  console.log(`Detektovano sekcija: ${sectionHeadings.length}`)

  console.log('Semantičko mapiranje (Claude)...')
  const mappingInput = extractedFields.map(f => ({ id: f.id, label: f.label, section: sectionMap.get(f.id) ?? null }))
  const mappedFields = await mapFieldsToProfile(mappingInput, MOCK_COMPANY)

  // Post-processing (composite, cross-row duplikati, hintovi) — ZAJEDNIČKI produkcijski
  // kod, isti koji koristi di-analyze/route.ts
  const { fields, neverAutofill } = composeGuideFields(extractedFields, mappedFields)

  const high = fields.filter(f => f.state === 'high').length
  const low = fields.filter(f => f.state === 'low').length
  const manual = fields.filter(f => f.state === 'manual').length
  const noLabel = fields.filter(f => !f.label).length
  console.log(`\nStanja: high=${high}  low=${low}  manual=${manual}  (bez labele: ${noLabel})`)

  console.log('\nPrimeri mapiranih polja (high/low):')
  fields.filter(f => f.state !== 'manual').slice(0, 25).forEach(f => {
    console.log(`  [${f.state}] "${f.label}" → ${f.profileKey} = "${f.suggestedValue}"${f.hint ? `  ⚠ ${f.hint}` : ''}`)
  })

  if (neverAutofill.size > 0) {
    console.log(`\nStrukturno never-autofill polja (composite sekundarna + cross-row duplikati): ${neverAutofill.size}`)
  }

  // Grupisanje u FormSection[] — zajednički produkcijski kod (composeGuideFields.ts)
  const sections: FormSection[] = groupIntoSections(extractedFields, fields, sectionMap)

  // --fill-manual: simulira korisnikov unos u wizardu — upisuje test vrednosti u prvih
  // nekoliko manual polja sa labelom (isti state flip manual→low kao SectionWizardView.updateValue),
  // da se verifikuje da manual unos završava u finalnom PDF-u (Korak 7 validacija).
  if (process.argv.includes('--fill-manual')) {
    let injected = 0
    for (const f of fields) {
      if (injected >= 5) break
      if (f.state !== 'manual' || !f.label || f.isInternal) continue
      if (isSignatureField(f.label)) continue
      f.suggestedValue = `TEST-UNOS-${injected + 1}`
      f.state = 'low'
      injected++
      console.log(`  --fill-manual: "${f.label}" (${f.id}) = "TEST-UNOS-${injected}"`)
    }
  }

  if (process.argv.includes('--dump-json')) {
    const jsonPath = path.join(outDir, `${label}-fields-sections.json`)
    fs.writeFileSync(jsonPath, JSON.stringify({ fields, sections }, null, 2))
    console.log(`\nJSON fixture (fields + sections): ${jsonPath}`)
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
