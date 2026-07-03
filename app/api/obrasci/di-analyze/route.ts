import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument } from 'pdf-lib'
import { analyzeLayout } from '@/lib/documentIntelligence/analyzeLayout'
import { extractAcroFormFields } from '@/lib/documentIntelligence/extractAcroFormFields'
import { matchFieldLabels } from '@/lib/documentIntelligence/matchFieldLabels'
import { extractFlatPdfFields } from '@/lib/documentIntelligence/extractFlatPdfFields'
import { mapFieldsToProfile, profileValue, PROFILE_KEYS, type ProfileKey } from '@/lib/documentIntelligence/semanticMapper'
import { composeGuideFields, groupIntoSections, type ExtractedFieldLite } from '@/lib/documentIntelligence/composeGuideFields'
import { detectSectionHeadings, assignSections } from '@/lib/documentIntelligence/detectSections'
import { computeFingerprint } from '@/lib/documentIntelligence/computeFingerprint'
import {
  getTemplate,
  saveTemplate,
  incrementHitCount,
  type TemplateFieldStruct,
  type TemplateSectionShape,
} from '@/lib/documentIntelligence/templateCache'
import type { Company } from '@/types/database'
import type { GuideField, FormSection } from '@/types/obrasci'

export const maxDuration = 60

const UPLOAD_PLANS = ['starter', 'pro', 'agency']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || !UPLOAD_PLANS.includes(profile.plan)) {
    return NextResponse.json(
      { error: 'Popunjavanje obrazaca dostupno je za Starter plan i više.' },
      { status: 403 },
    )
  }

  let body: { fileRef?: string; type?: string; filename?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { fileRef, type, filename } = body
  if (!fileRef || !type || !['acroform', 'flat'].includes(type)) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
  }

  // Preuzmi fajl iz Storage
  const { data: fileData, error: downloadError } = await admin.storage
    .from('obrasci-upload')
    .download(fileRef)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Fajl nije pronađen.' }, { status: 404 })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Profil firme
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Profil firme nije pronađen. Popunite profil pre učitavanja obrasca.' }, { status: 400 })
  }

  // ── Template keš (Faza 3 Korak 5) ──────────────────────────────────────────
  // Fingerprint = jeftin DI poziv (samo prva strana, isti model/verzija kao pun poziv).
  // HIT: struktura (labele, profileKey, confidence, sekcije) dolazi iz keša — preskaču se
  // pun DI poziv i Claude mapiranje. Vrednosti (suggestedValue) se UVEK popunjavaju sveže
  // iz profila trenutnog korisnika — keš nikad ne sadrži korisničke podatke.
  // Greška u keš sloju nikad ne obara zahtev — fallback je pun pipeline.
  let fingerprint: string | null = null
  let fpPageCount = 0
  try {
    const fp = await computeFingerprint(buffer)
    fingerprint = fp.fingerprint
    fpPageCount = fp.pageCount
  } catch (err) {
    console.error('[di-analyze] fingerprint error (nastavljam pun pipeline):', err)
  }

  if (fingerprint) {
    try {
      const template = await getTemplate(fingerprint)
      // Template bez sekcija (ne bi trebalo da postoji posle Koraka 5) tretiramo kao miss.
      if (template && template.sections) {
        const fields = rehydrateFields(template.fields, company as Company)
        const fieldById = new Map(fields.map(f => [f.id, f]))
        const sections: FormSection[] = template.sections.map(sh => ({
          title: sh.title,
          page: sh.page,
          fields: sh.fieldIds.map(id => fieldById.get(id)).filter((f): f is GuideField => !!f),
        }))
        await incrementHitCount(fingerprint)
        return NextResponse.json({ fields, sections, fingerprint, cached: true })
      }
    } catch (err) {
      console.error('[di-analyze] template lookup error (nastavljam pun pipeline):', err)
    }
  }

  // Azure Document Intelligence analiza
  let diResult
  try {
    diResult = await analyzeLayout(buffer)
  } catch (err) {
    console.error('[di-analyze] DI error:', err)
    return NextResponse.json({ error: 'Greška pri analizi dokumenta. Proverite Azure konfiguraciju.' }, { status: 500 })
  }

  // Ekstrakcija polja prema tipu — čuvamo i koordinate za composite/duplikat detekciju
  let extractedFields: ExtractedFieldLite[]

  if (type === 'acroform') {
    const { fields: acroFields } = await extractAcroFormFields(buffer)
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
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

  // Detekcija sekcija — naslov dela obrasca iznad svakog polja, na istoj strani.
  // Ide kao dodatni kontekst u Claude prompt (semanticMapper.ts) da razlikuje polja
  // sa istom labelom u različitim delovima obrasca.
  const sectionHeadings = detectSectionHeadings(diResult)
  const sectionMap = assignSections(extractedFields, sectionHeadings)

  // Semantičko mapiranje — Claude prima {id, label, section?}, nikad sirova imena polja
  let mappedFields
  try {
    const mappingInput = extractedFields.map(f => ({ id: f.id, label: f.label, section: sectionMap.get(f.id) ?? null }))
    mappedFields = await mapFieldsToProfile(mappingInput, company)
  } catch (err) {
    console.error('[di-analyze] semantic mapper error:', err)
    return NextResponse.json({ error: 'Greška pri mapiranju polja.' }, { status: 500 })
  }

  // Post-processing (composite grupe, cross-row duplikati, telefon hintovi) + sekcije —
  // zajednička implementacija sa test skriptama (composeGuideFields.ts)
  const { fields, neverAutofill } = composeGuideFields(extractedFields, mappedFields)
  const sections: FormSection[] = groupIntoSections(extractedFields, fields, sectionMap)

  // Cache MISS → sačuvaj STRUKTURU obrasca (bez suggestedValue — korisnički podatak).
  // confidence: null za polja koja se strukturno nikad ne auto-popunjavaju (composite
  // sekundarna + cross-row duplikati). Neuspeh snimanja ne obara zahtev (npr. race na
  // unique fingerprint).
  if (fingerprint) {
    try {
      const efConfidence = new Map(extractedFields.map(ef => [ef.id, ef.confidence]))
      const templateFields: TemplateFieldStruct[] = fields.map(f => ({
        id: f.id,
        label: f.label,
        profileKey: f.profileKey,
        isInternal: f.isInternal,
        confidence: neverAutofill.has(f.id) ? null : (efConfidence.get(f.id) ?? 'low'),
        hint: f.hint ?? null,
      }))
      const templateSections: TemplateSectionShape[] = sections.map(s => ({
        title: s.title,
        page: s.page,
        fieldIds: s.fields.map(f => f.id),
      }))
      await saveTemplate(fingerprint, {
        name: filename ?? null,
        pageCount: fpPageCount,
        sourceType: type as 'acroform' | 'flat',
        fields: templateFields,
        sections: templateSections,
      })
    } catch (err) {
      console.error('[di-analyze] saveTemplate error (odgovor svejedno ide korisniku):', err)
    }
  }

  return NextResponse.json({ fields, sections, fingerprint, cached: false })
}

// Cache HIT: struktura iz keša + SVEŽE vrednosti iz profila trenutnog korisnika.
// Reprodukuje tačno logiku punog pipeline-a: state = confidence kad polje ima predlog,
// inače 'manual' (isInternal, bez profileKey, prazna vrednost u profilu, composite sekundarno).
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
