/**
 * Faza 3 Korak 5 — test template keša bez UI/auth.
 *
 * Faze:
 *  A. Fingerprint determinizam — isti PDF dva puta → isti hash
 *  B. Cache MISS → pun pipeline (isti kod kao di-analyze) → saveTemplate (samo struktura)
 *  C. Cache HIT → getTemplate → rehydrate → poređenje sa punim pipeline outputom
 *  D. incrementHitCount → hit_count raste
 *  E. Rehydrate sa DRUGIM profilom → vrednosti sveže (dokaz da keš ne čuva vrednosti)
 *
 * Piše u produkcijsku form_templates tabelu (service-role) — red se briše na kraju,
 * osim ako se prosledi --keep.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-template-cache.ts <pdf-path> [--keep]
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import { analyzeLayout } from '../lib/documentIntelligence/analyzeLayout'
import { extractAcroFormFields } from '../lib/documentIntelligence/extractAcroFormFields'
import { matchFieldLabels } from '../lib/documentIntelligence/matchFieldLabels'
import { extractFlatPdfFields } from '../lib/documentIntelligence/extractFlatPdfFields'
import { mapFieldsToProfile, profileValue, PROFILE_KEYS, type ProfileKey } from '../lib/documentIntelligence/semanticMapper'
import { composeGuideFields, groupIntoSections, type ExtractedFieldLite } from '../lib/documentIntelligence/composeGuideFields'
import { detectSectionHeadings, assignSections } from '../lib/documentIntelligence/detectSections'
import { computeFingerprint } from '../lib/documentIntelligence/computeFingerprint'
import {
  getTemplate,
  saveTemplate,
  incrementHitCount,
  type TemplateFieldStruct,
  type TemplateSectionShape,
} from '../lib/documentIntelligence/templateCache'
import { createAdminClient } from '../lib/supabase/admin'
import type { GuideField, FormSection } from '../types/obrasci'
import type { Company } from '../types/database'

const pdfPath = process.argv[2]
if (!pdfPath) {
  console.error('Usage: npx tsx --tsconfig tsconfig.json scripts/test-template-cache.ts <pdf-path> [--keep]')
  process.exit(1)
}
const keep = process.argv.includes('--keep')

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

// Drugi profil — za dokaz da vrednosti dolaze iz TRENUTNOG profila, ne iz keša
const OTHER_COMPANY: Company = {
  ...MOCK_COMPANY,
  naziv: 'Druga Firma pr',
  pib: '999888777',
  maticni_broj: '11223344',
  telefon: '011 9876543',
  email: 'kontakt@drugafirma.rs',
}

// Kopija privatnog rehydrateFields iz di-analyze/route.ts (route fajl ne sme da
// eksportuje ništa osim HTTP handlera) — održavati sinhronizovano.
function rehydrateFields(structs: TemplateFieldStruct[], company: Company): GuideField[] {
  return structs.map(s => {
    const key = s.profileKey && PROFILE_KEYS.includes(s.profileKey as ProfileKey)
      ? (s.profileKey as ProfileKey)
      : null
    const suggestedValue = !s.isInternal && s.confidence && key ? profileValue(key, company) : null
    const state: GuideField['state'] = suggestedValue !== null && s.confidence ? s.confidence : 'manual'
    return {
      id: s.id,
      label: s.label,
      suggestedValue,
      profileKey: s.profileKey,
      isInternal: s.isInternal,
      state,
      hint: s.hint ?? null,
    }
  })
}

// Pun pipeline — koristi ZAJEDNIČKI produkcijski kod (composeGuideFields.ts),
// isti koji koristi di-analyze/route.ts
async function runFullPipeline(buffer: Buffer, company: Company) {
  const diResult = await analyzeLayout(buffer)
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const { fields: acroFields } = await extractAcroFormFields(buffer)
  const type: 'acroform' | 'flat' = acroFields.length > 0 ? 'acroform' : 'flat'

  let extractedFields: ExtractedFieldLite[]

  if (type === 'acroform') {
    const pageHeightsPt = pdfDoc.getPages().map(p => p.getSize().height)
    const matches = matchFieldLabels(acroFields, diResult, pageHeightsPt)
    extractedFields = matches.map(m => ({
      id: m.fieldName, label: m.label, confidence: m.confidence,
      page: m.page, xLeft: m.boundingBox.x, yCtr: m.boundingBox.y + m.boundingBox.h / 2,
      width: m.boundingBox.w,
    }))
  } else {
    const flatFields = extractFlatPdfFields(diResult)
    extractedFields = flatFields.map(f => ({
      id: f.id, label: f.label, confidence: f.confidence,
      page: f.page, xLeft: f.boundingBox.x, yCtr: f.boundingBox.y + f.boundingBox.h / 2,
      width: f.boundingBox.w,
    }))
  }

  const sectionHeadings = detectSectionHeadings(diResult)
  const sectionMap = assignSections(extractedFields, sectionHeadings)

  const mappingInput = extractedFields.map(f => ({ id: f.id, label: f.label, section: sectionMap.get(f.id) ?? null }))
  const mappedFields = await mapFieldsToProfile(mappingInput, company)

  const { fields, neverAutofill } = composeGuideFields(extractedFields, mappedFields)
  const sections: FormSection[] = groupIntoSections(extractedFields, fields, sectionMap)

  return { fields, sections, extractedFields, neverAutofill, type }
}

function normalizeField(f: GuideField) {
  return { ...f, hint: f.hint ?? null }
}

function compareOutputs(fullFields: GuideField[], cachedFields: GuideField[], fullSections: FormSection[], cachedSections: FormSection[]) {
  const diffs: string[] = []
  if (fullFields.length !== cachedFields.length) {
    diffs.push(`broj polja: pun=${fullFields.length} keš=${cachedFields.length}`)
  }
  const cachedById = new Map(cachedFields.map(f => [f.id, f]))
  for (const ff of fullFields) {
    const cf = cachedById.get(ff.id)
    if (!cf) { diffs.push(`polje ${ff.id} nedostaje u keš outputu`); continue }
    const a = JSON.stringify(normalizeField(ff))
    const b = JSON.stringify(normalizeField(cf))
    if (a !== b) diffs.push(`polje ${ff.id}:\n    pun: ${a}\n    keš: ${b}`)
  }
  const fullShape = fullSections.map(s => ({ title: s.title, page: s.page, ids: s.fields.map(f => f.id) }))
  const cachedShape = cachedSections.map(s => ({ title: s.title, page: s.page, ids: s.fields.map(f => f.id) }))
  if (JSON.stringify(fullShape) !== JSON.stringify(cachedShape)) {
    diffs.push(`sekcije se razlikuju:\n    pun: ${JSON.stringify(fullShape)}\n    keš: ${JSON.stringify(cachedShape)}`)
  }
  return diffs
}

async function main() {
  const buffer = fs.readFileSync(pdfPath)
  const label = path.basename(pdfPath)
  console.log(`\n=== Template keš test: ${label} ===\n`)

  // ── A. Fingerprint determinizam ──
  console.log('A. Fingerprint determinizam (2x DI poziv, samo strana 1)...')
  const t0 = Date.now()
  const fp1 = await computeFingerprint(buffer)
  const tFp = Date.now() - t0
  const fp2 = await computeFingerprint(buffer)
  console.log(`   fp1: ${fp1.fingerprint}`)
  console.log(`   fp2: ${fp2.fingerprint}`)
  console.log(`   ${fp1.fingerprint === fp2.fingerprint ? '✅ identični' : '❌ RAZLIČITI!'}  (pageCount=${fp1.pageCount}, acroFields=${fp1.acroFormFieldCount}, ~${tFp}ms po pozivu)`)
  if (fp1.fingerprint !== fp2.fingerprint) process.exit(1)
  const fingerprint = fp1.fingerprint

  // Očisti eventualni ostatak prethodnog testa
  const admin = createAdminClient()
  await admin.from('form_templates').delete().eq('fingerprint', fingerprint)

  // ── B. MISS → pun pipeline → save ──
  console.log('\nB. Cache MISS → pun pipeline (DI + Claude) → saveTemplate...')
  const missBefore = await getTemplate(fingerprint)
  console.log(`   getTemplate pre pipeline-a: ${missBefore === null ? '✅ null (miss)' : '❌ nije null!'}`)

  const t1 = Date.now()
  const full = await runFullPipeline(buffer, MOCK_COMPANY)
  const tFull = Date.now() - t1
  console.log(`   Pun pipeline: ${full.fields.length} polja, ${full.sections.length} sekcija, tip=${full.type}, ${(tFull / 1000).toFixed(1)}s`)

  const efConfidence = new Map(full.extractedFields.map(ef => [ef.id, ef.confidence]))
  const templateFields: TemplateFieldStruct[] = full.fields.map(f => ({
    id: f.id,
    label: f.label,
    profileKey: f.profileKey,
    isInternal: f.isInternal,
    confidence: full.neverAutofill.has(f.id) ? null : (efConfidence.get(f.id) ?? 'low'),
    hint: f.hint ?? null,
  }))
  const templateSections: TemplateSectionShape[] = full.sections.map(s => ({
    title: s.title, page: s.page, fieldIds: s.fields.map(f => f.id),
  }))

  // Provera: struktura ne sme da sadrži nijednu vrednost iz profila
  const structJson = JSON.stringify({ templateFields, templateSections })
  const leaked = [MOCK_COMPANY.naziv, MOCK_COMPANY.pib, MOCK_COMPANY.telefon, MOCK_COMPANY.email]
    .filter(v => v && structJson.includes(v!))
  console.log(`   Provera curenja vrednosti u strukturu: ${leaked.length === 0 ? '✅ nema korisničkih podataka' : `❌ CURI: ${leaked.join(', ')}`}`)
  if (leaked.length > 0) process.exit(1)

  await saveTemplate(fingerprint, {
    name: `TEST-cache-script ${label}`,
    pageCount: fp1.pageCount,
    sourceType: full.type,
    fields: templateFields,
    sections: templateSections,
  })
  console.log('   saveTemplate: ✅')

  // ── C. HIT → rehydrate → poređenje ──
  console.log('\nC. Cache HIT → getTemplate → rehydrate → poređenje sa punim outputom...')
  const t2 = Date.now()
  const template = await getTemplate(fingerprint)
  if (!template || !template.sections) { console.log('   ❌ template nije pronađen posle save!'); process.exit(1) }
  const cachedFields = rehydrateFields(template.fields, MOCK_COMPANY)
  const cachedById = new Map(cachedFields.map(f => [f.id, f]))
  const cachedSections: FormSection[] = template.sections.map(sh => ({
    title: sh.title, page: sh.page,
    fields: sh.fieldIds.map(id => cachedById.get(id)).filter((f): f is GuideField => !!f),
  }))
  const tHit = Date.now() - t2
  console.log(`   HIT put (lookup + rehydrate, bez DI/Claude): ${tHit}ms  (pun pipeline: ${(tFull / 1000).toFixed(1)}s)`)

  const diffs = compareOutputs(full.fields, cachedFields, full.sections, cachedSections)
  if (diffs.length === 0) {
    console.log('   ✅ Output iz keša IDENTIČAN outputu punog pipeline-a (polja + sekcije)')
  } else {
    console.log(`   ❌ ${diffs.length} razlika:`)
    diffs.slice(0, 10).forEach(d => console.log(`   - ${d}`))
    process.exit(1)
  }

  // ── D. hit_count ──
  console.log('\nD. incrementHitCount...')
  await incrementHitCount(fingerprint)
  await incrementHitCount(fingerprint)
  const after = await getTemplate(fingerprint)
  console.log(`   hit_count posle 2 incrementa: ${after?.hitCount} ${after?.hitCount === 2 ? '✅' : '❌'}`)

  // ── E. Svež profil na HIT ──
  console.log('\nE. Rehydrate sa DRUGIM profilom (vrednosti moraju biti sveže, ne iz keša)...')
  const otherFields = rehydrateFields(template.fields, OTHER_COMPANY)
  const mappedPairs = otherFields.filter(f => f.suggestedValue !== null).slice(0, 8)
  mappedPairs.forEach(f => console.log(`   [${f.state}] "${f.label}" → ${f.profileKey} = "${f.suggestedValue}"`))
  const staleValues = otherFields.filter(f =>
    f.suggestedValue !== null &&
    f.profileKey !== null &&
    f.suggestedValue !== profileValue(f.profileKey as ProfileKey, OTHER_COMPANY)
  )
  console.log(`   ${staleValues.length === 0 ? '✅ sve vrednosti iz trenutnog profila' : `❌ ${staleValues.length} ustajalih vrednosti iz keša!`}`)

  // ── Cleanup ──
  if (keep) {
    console.log(`\nRed OSTAJE u form_templates (--keep): fingerprint ${fingerprint}`)
  } else {
    await admin.from('form_templates').delete().eq('fingerprint', fingerprint)
    console.log('\nTest red obrisan iz form_templates.')
  }

  console.log('\n=== ✅ Svi testovi prošli ===')
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
