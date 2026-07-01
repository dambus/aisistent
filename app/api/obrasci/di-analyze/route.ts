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

  // Ekstrakcija polja prema tipu
  let extractedFields: Array<{ id: string; label: string | null; confidence: 'high' | 'low' }>

  if (type === 'acroform') {
    const { fields: acroFields } = await extractAcroFormFields(buffer)
    // Visine stranica u PDF points (1pt = 1/72 inch) — potrebno za Y-flip koordinata
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const pageHeightsPt = pdfDoc.getPages().map(p => p.getSize().height)
    const matches = matchFieldLabels(acroFields, diResult, pageHeightsPt)
    extractedFields = matches.map(m => ({
      id: m.fieldName,
      label: m.label,
      confidence: m.confidence,
    }))
  } else {
    const flatFields = extractFlatPdfFields(diResult)
    extractedFields = flatFields.map(f => ({
      id: f.id,
      label: f.label,
      confidence: f.confidence,
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
  const fields: GuideField[] = extractedFields.map(ef => {
    const mapped = mappedMap.get(ef.id)
    const suggestedValue = mapped?.suggestedValue ?? null
    const isInternal = mapped?.isInternal ?? false
    const profileKey = mapped?.profileKey ?? null

    let state: GuideField['state'] = 'manual'
    if (!isInternal && suggestedValue !== null) {
      state = ef.confidence // 'high' ili 'low'
    }

    return { id: ef.id, label: ef.label, suggestedValue, profileKey, isInternal, state }
  })

  return NextResponse.json({ fields })
}
