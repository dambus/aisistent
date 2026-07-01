import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument } from 'pdf-lib'
import { analyzeLayout } from '@/lib/documentIntelligence/analyzeLayout'
import { extractAcroFormFields } from '@/lib/documentIntelligence/extractAcroFormFields'
import { matchFieldLabels } from '@/lib/documentIntelligence/matchFieldLabels'
import { extractFlatPdfFields } from '@/lib/documentIntelligence/extractFlatPdfFields'
import { mapFieldsToProfile } from '@/lib/documentIntelligence/semanticMapper'
import type { GuideField } from '@/types/obrasci'

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

  let body: { fileRef?: string; type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { fileRef, type } = body
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

  // Azure Document Intelligence analiza
  let diResult
  try {
    diResult = await analyzeLayout(buffer)
  } catch (err) {
    console.error('[di-analyze] DI error:', err)
    return NextResponse.json({ error: 'Greška pri analizi dokumenta. Proverite Azure konfiguraciju.' }, { status: 500 })
  }

  // Ekstrakcija polja prema tipu — čuvamo i koordinate za composite detekciju
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

  // Semantičko mapiranje — Claude prima samo {id, label}[], nikad sirova imena polja
  let mappedFields
  try {
    const mappingInput = extractedFields.map(f => ({ id: f.id, label: f.label }))
    mappedFields = await mapFieldsToProfile(mappingInput, company)
  } catch (err) {
    console.error('[di-analyze] semantic mapper error:', err)
    return NextResponse.json({ error: 'Greška pri mapiranju polja.' }, { status: 500 })
  }

  const mappedMap = new Map(mappedFields.map(m => [m.id, m]))

  // Kombinovanje u GuideField[] sa tri stanja
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

  // Post-processing: composite grupe — više box-ova na istoj Y liniji sa istom labelom
  // (npr. Телефон = pozivni broj + lokalni broj). Samo prvi po X dobija suggestedValue;
  // ostali dobijaju state: 'manual' i suggestedValue: null.
  const SAME_LINE_Y_IN = 0.12
  const compositeSecondary = new Set<string>()

  for (let i = 0; i < extractedFields.length; i++) {
    const a = extractedFields[i]
    if (!a.label) continue
    for (let j = i + 1; j < extractedFields.length; j++) {
      const b = extractedFields[j]
      if (b.label !== a.label) continue
      if (b.page !== a.page) continue
      if (Math.abs(b.yCtr - a.yCtr) >= SAME_LINE_Y_IN) continue
      // Ista labela, ista strana, ista Y linija → composite grupa
      // Sortiraj po X: levi (manji xLeft) je primarni
      if (b.xLeft > a.xLeft) {
        compositeSecondary.add(b.id)
      } else {
        compositeSecondary.add(a.id)
      }
    }
  }

  const fields: GuideField[] = rawFields.map(f =>
    compositeSecondary.has(f.id)
      ? { ...f, suggestedValue: null, state: 'manual' as const }
      : f,
  )

  return NextResponse.json({ fields })
}
