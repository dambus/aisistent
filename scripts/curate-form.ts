/**
 * Faza 4 Korak 2 — kuratorski CLI za biblioteku obrazaca.
 *
 * Tok (FAZA4 spec, sekcija 6):
 *
 *  1. propose — provuče PDF kroz POSTOJEĆI pipeline (DI + matching + Claude predlog
 *     + composite/duplikat guardovi) i ispiše predlog kuracije u JSON:
 *       npx tsx --tsconfig tsconfig.json scripts/curate-form.ts propose <pdf>
 *     → scripts/curation/<ime>.curation.json
 *
 *  2. Kurator RUČNO pregleda JSON: obriše pogrešna mapiranja, ispravi profileKey,
 *     promoviše promašena polja (upiše profileKey umesto null), popuni meta sekciju.
 *     Redovi sa profileKey: null se IGNORIŠU pri publish-u — ne moraju se brisati.
 *
 *  3. publish — validira, testni fill sa mock profilom (vizuelna kontrola!), upload
 *     praznog PDF-a u Storage, upis reda u library_forms (published=false):
 *       npx tsx --tsconfig tsconfig.json scripts/curate-form.ts publish <pdf> <curation.json>
 *
 *  4. go-live — posle vizuelnog pregleda testnog fill-a i stranice:
 *       npx tsx --tsconfig tsconfig.json scripts/curate-form.ts go-live <slug>
 *
 * Pravila: u fields ide SAMO ono što kurator verifikuje; potpis polja se odbijaju;
 * vrednosti se nikad ne čuvaju; bez source_url nema go-live.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { PDFDocument, PDFTextField } from 'pdf-lib'
import { analyzeLayout } from '../lib/documentIntelligence/analyzeLayout'
import { extractAcroFormFields } from '../lib/documentIntelligence/extractAcroFormFields'
import { matchFieldLabels } from '../lib/documentIntelligence/matchFieldLabels'
import { extractFlatPdfFields } from '../lib/documentIntelligence/extractFlatPdfFields'
import { mapFieldsToProfile, PROFILE_KEYS } from '../lib/documentIntelligence/semanticMapper'
import { composeGuideFields, groupIntoSections, type ExtractedFieldLite } from '../lib/documentIntelligence/composeGuideFields'
import { detectSectionHeadings, assignSections } from '../lib/documentIntelligence/detectSections'
import { detectScript, cyrillicToLatin } from '../lib/documentIntelligence/transliterate'
import { isSignatureField } from '../lib/documentIntelligence/signatureLabels'
import { fillLibraryForm, type LibraryField, type FormScript } from '../lib/documentIntelligence/fillLibraryForm'
import { createAdminClient } from '../lib/supabase/admin'
import type { Company } from '../types/database'

const CATEGORIES = ['poreska', 'apr', 'croso', 'rzzo', 'lokalna', 'ostalo'] as const

// Predlog jednog mapiranja — _label/_state su informativni za kuratora, brišu se pri publish-u.
// profileKey: null = kandidat bez predloga; kurator upiše ključ da ga promoviše, inače se ignoriše.
type CurationField =
  | { kind: 'acroform'; fieldName: string; profileKey: string | null; _label?: string | null; _state?: string }
  | { kind: 'flat'; page: number; x: number; y: number; w: number; h: number; profileKey: string | null; _label?: string | null; _state?: string }

interface CurationFile {
  meta: {
    slug: string
    title: string
    short_name: string
    category: string
    description: string
    source_institution: string
    source_url: string
    script: FormScript
    source_type: 'acroform' | 'flat'
    page_count: number
  }
  fields: CurationField[]
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

// ─────────────────────────────────────────────────────────────────────────────

async function propose(pdfPath: string) {
  const buffer = fs.readFileSync(pdfPath)
  const base = path.basename(pdfPath, path.extname(pdfPath)).replace(/[^a-z0-9_-]/gi, '-')

  console.log('DI analiza...')
  const diResult = await analyzeLayout(buffer)
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const { fields: acroFields } = await extractAcroFormFields(buffer)
  const sourceType: 'acroform' | 'flat' = acroFields.length > 0 ? 'acroform' : 'flat'
  console.log(`Tip: ${sourceType} | strana: ${pdfDoc.getPageCount()} | AcroForm polja: ${acroFields.length}`)
  if (sourceType === 'flat') {
    console.warn('⚠️  FLAT obrazac — publish će ga ODBITI (biblioteka prima samo AcroForm; korisnik flat ne može da popuni u PDF čitaču).')
  }

  // Ekstrakcija — čuvamo pun bbox (flat publish upisuje na ove koordinate, bez DI na download)
  let extractedFields: ExtractedFieldLite[]
  const bboxById = new Map<string, { page: number; x: number; y: number; w: number; h: number }>()

  if (sourceType === 'acroform') {
    const pageHeightsPt = pdfDoc.getPages().map(p => p.getSize().height)
    const matches = matchFieldLabels(acroFields, diResult, pageHeightsPt)
    extractedFields = matches.map(m => {
      bboxById.set(m.fieldName, { page: m.page, ...m.boundingBox })
      return {
        id: m.fieldName, label: m.label, confidence: m.confidence,
        page: m.page, xLeft: m.boundingBox.x, yCtr: m.boundingBox.y + m.boundingBox.h / 2,
        width: m.boundingBox.w,
      }
    })
  } else {
    const flatFields = extractFlatPdfFields(diResult)
    extractedFields = flatFields.map(f => {
      bboxById.set(f.id, { page: f.page, ...f.boundingBox })
      return {
        id: f.id, label: f.label, confidence: f.confidence,
        page: f.page, xLeft: f.boundingBox.x, yCtr: f.boundingBox.y + f.boundingBox.h / 2,
        width: f.boundingBox.w,
      }
    })
  }

  const sectionHeadings = detectSectionHeadings(diResult)
  const sectionMap = assignSections(extractedFields, sectionHeadings)

  console.log(`Ekstrahovano polja: ${extractedFields.length} — Claude predlog mapiranja...`)
  const mappingInput = extractedFields.map(f => ({ id: f.id, label: f.label, section: sectionMap.get(f.id) ?? null }))
  const mappedFields = await mapFieldsToProfile(mappingInput, MOCK_COMPANY)

  // composite/duplikat/potpis guardovi važe i za kuratorske predloge
  const { fields } = composeGuideFields(extractedFields, mappedFields)
  const sections = groupIntoSections(extractedFields, fields, sectionMap)

  const allText = diResult.paragraphs.map(p => p.content).join(' ')
  const script: FormScript = detectScript(allText) === 'latin' ? 'latin' : 'cyrillic'

  const curationFields: CurationField[] = fields
    .filter(f => !isSignatureField(f.label))
    .map(f => {
      const proposed = f.state !== 'manual' && f.profileKey ? f.profileKey : null
      const info = { profileKey: proposed, _label: f.label, _state: f.state }
      if (sourceType === 'acroform') {
        return { kind: 'acroform' as const, fieldName: f.id, ...info }
      }
      const bb = bboxById.get(f.id)!
      return { kind: 'flat' as const, page: bb.page, x: bb.x, y: bb.y, w: bb.w, h: bb.h, ...info }
    })

  const curation: CurationFile = {
    meta: {
      slug: '',
      title: '',
      short_name: base,
      category: 'ostalo',
      description: '',
      source_institution: '',
      source_url: '',
      script,
      source_type: sourceType,
      page_count: pdfDoc.getPageCount(),
    },
    fields: curationFields,
  }

  const outDir = path.join(process.cwd(), 'scripts/curation')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `${base}.curation.json`)
  fs.writeFileSync(outPath, JSON.stringify(curation, null, 2))

  const proposedCount = curationFields.filter(f => f.profileKey).length
  console.log(`\nPredlog: ${proposedCount} mapiranih, ${curationFields.length - proposedCount} kandidata (profileKey: null)`)
  console.log(`Sekcije (kontekst za orijentaciju): ${sections.map(s => s.title).slice(0, 10).join(' | ')}`)
  console.log(`\n→ ${outPath}`)
  console.log('Sledeće: ručno pregledaj/ispravi JSON (meta + fields), pa: curate-form.ts publish <pdf> <json>')
}

// ─────────────────────────────────────────────────────────────────────────────

async function publish(pdfPath: string, jsonPath: string) {
  const buffer = fs.readFileSync(pdfPath)
  const curation: CurationFile = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const { meta } = curation

  // SAMO AcroForm obrasci ulaze u biblioteku — flat PDF posle overlay-a korisnik ne može
  // da popunjava u Adobe Reader-u kako reklamiramo (Milan, 5. jul). Flat obrasci mogu ući
  // tek uz buduće proširenje: dodavanje AcroForm polja pri kuraciji (spec sekcija 11).
  if (meta.source_type !== 'acroform') {
    console.error(`❌ Biblioteka prima samo AcroForm obrasce — "${meta.source_type}" korisnik ne može da popuni u PDF čitaču.`)
    process.exit(1)
  }

  // Sajt je latiničан — sav meta tekst se auto-transliteruje (pravilo, Milan 5. jul).
  // Sam obrazac (PDF) ostaje na svom pismu — pravilo važi samo za UI tekst.
  for (const k of ['title', 'short_name', 'description', 'source_institution'] as const) {
    const lat = cyrillicToLatin(meta[k] ?? '')
    if (lat !== meta[k]) {
      console.log(`  meta.${k}: transliterovano u latinicu`)
      meta[k] = lat
    }
  }

  // Validacija meta
  const missing = (['slug', 'title', 'short_name', 'category', 'source_institution', 'source_url'] as const)
    .filter(k => !meta[k] || meta[k].trim() === '')
  if (missing.length > 0) {
    console.error(`❌ meta nepotpuna: ${missing.join(', ')} — popuni u ${jsonPath}`)
    process.exit(1)
  }
  if (!CATEGORIES.includes(meta.category as (typeof CATEGORIES)[number])) {
    console.error(`❌ nepoznata kategorija "${meta.category}" (dozvoljeno: ${CATEGORIES.join(', ')})`)
    process.exit(1)
  }
  if (!/^[a-z0-9-]+$/.test(meta.slug)) {
    console.error(`❌ slug "${meta.slug}" — samo mala slova, brojevi i crtice`)
    process.exit(1)
  }

  // Verifikovana polja = profileKey upisan; _label/_state se brišu (u bazu ide samo struktura)
  const verified: LibraryField[] = []
  for (const f of curation.fields) {
    if (!f.profileKey) continue
    if (!PROFILE_KEYS.includes(f.profileKey as (typeof PROFILE_KEYS)[number])) {
      console.error(`❌ nepoznat profileKey "${f.profileKey}" (${'_label' in f ? f._label : ''})`)
      process.exit(1)
    }
    if ('_label' in f && isSignatureField(f._label ?? null)) {
      console.error(`❌ potpis polje se ne mapira: "${f._label}"`)
      process.exit(1)
    }
    if (f.kind === 'acroform') {
      verified.push({ kind: 'acroform', fieldName: f.fieldName, profileKey: f.profileKey })
    } else {
      verified.push({ kind: 'flat', page: f.page, x: f.x, y: f.y, w: f.w, h: f.h, profileKey: f.profileKey })
    }
  }
  // Obrazac bez ijednog autofill polja i dalje ulazi u biblioteku (referentni PDF, korisnik
  // ga barem nalazi na jednom mestu) — samo se test-fill i AcroForm provera preskaču.
  if (verified.length === 0) {
    console.log('⚠️  nijedno verifikovano polje — objavljuje se kao referentni PDF, bez autofill-a')
  }

  // AcroForm polja moraju postojati u PDF-u
  if (verified.length > 0 && meta.source_type === 'acroform') {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const form = pdfDoc.getForm()
    for (const v of verified) {
      if (v.kind !== 'acroform') continue
      try {
        const f = form.getField(v.fieldName)
        if (!(f instanceof PDFTextField)) throw new Error('nije text polje')
      } catch {
        console.error(`❌ AcroForm polje "${v.fieldName}" ne postoji u PDF-u ili nije text polje`)
        process.exit(1)
      }
    }
  }

  // Testni fill sa mock profilom — obavezna vizuelna kontrola pre go-live (preskače se ako nema polja)
  if (verified.length > 0) {
    console.log(`Testni fill (${verified.length} polja)...`)
    const fillResult = await fillLibraryForm(buffer, verified, MOCK_COMPANY, meta.script)
    const outDir = path.join(process.cwd(), 'scripts/output')
    fs.mkdirSync(outDir, { recursive: true })
    const testPath = path.join(outDir, `${meta.slug}-curated-fill.pdf`)
    fs.writeFileSync(testPath, fillResult.bytes)
    console.log(`  filled=${fillResult.filledCount} noValue=${fillResult.skippedNoValue} notFound=${fillResult.skippedNotFound}`)
    if (fillResult.skippedNotFound > 0) {
      console.error('❌ skippedNotFound > 0 — mapiranje pokazuje na nepostojeća polja')
      process.exit(1)
    }
    console.log(`  → ${testPath} (OBAVEZNO vizuelno pregledati)`)
  }

  // Upload praznog originala u Storage
  const admin = createAdminClient()
  const fileRef = `${meta.slug}.pdf`
  const { error: upErr } = await admin.storage
    .from('obrasci-library')
    .upload(fileRef, buffer, { contentType: 'application/pdf', upsert: true })
  if (upErr) {
    console.error(`❌ Storage upload: ${upErr.message}`)
    process.exit(1)
  }
  console.log(`Storage: obrasci-library/${fileRef} ✅`)

  // Upis reda (published=false — go-live je poseban korak posle pregleda)
  const row = {
    slug: meta.slug,
    title: meta.title,
    short_name: meta.short_name,
    category: meta.category,
    description: meta.description || null,
    source_institution: meta.source_institution,
    source_url: meta.source_url,
    file_ref: fileRef,
    source_type: meta.source_type,
    script: meta.script,
    page_count: meta.page_count,
    fields: verified as unknown as object,
    published: false,
    verified_at: new Date().toISOString(),
  }
  const { error: dbErr } = await admin
    .from('library_forms')
    .upsert(row, { onConflict: 'slug' })
  if (dbErr) {
    console.error(`❌ library_forms upsert: ${dbErr.message}`)
    process.exit(1)
  }

  console.log(`library_forms: "${meta.slug}" upisan (published=false) ✅`)
  console.log(verified.length > 0
    ? `\nSledeće: pregledaj test-fill PDF, pa: curate-form.ts go-live ${meta.slug}`
    : `\nSledeće (bez autofill-a, nema test-fill-a): curate-form.ts go-live ${meta.slug}`)
}

// ─────────────────────────────────────────────────────────────────────────────

async function goLive(slug: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('library_forms')
    .update({ published: true, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select('slug, title, short_name')
    .single()
  if (error) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }
  console.log(`✅ Publikovan: ${data.short_name} — ${data.title} (/obrasci/${data.slug})`)
}

// ─────────────────────────────────────────────────────────────────────────────

const [, , cmd, arg1, arg2] = process.argv

async function main() {
  if (cmd === 'propose' && arg1) return propose(arg1)
  if (cmd === 'publish' && arg1 && arg2) return publish(arg1, arg2)
  if (cmd === 'go-live' && arg1) return goLive(arg1)
  console.error(`Usage:
  curate-form.ts propose <pdf>              → scripts/curation/<ime>.curation.json (predlog)
  curate-form.ts publish <pdf> <json>       → testni fill + Storage + library_forms (published=false)
  curate-form.ts go-live <slug>             → published=true`)
  process.exit(1)
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
