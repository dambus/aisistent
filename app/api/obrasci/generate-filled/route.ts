import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument } from 'pdf-lib'
import { analyzeLayout } from '@/lib/documentIntelligence/analyzeLayout'
import { fillAcroFormFields, fillTableCells } from '@/lib/documentIntelligence/pdfOverlay'
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

  let body: { fileRef?: string; type?: string; confirmedFields?: GuideField[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { fileRef, type, confirmedFields } = body
  if (!fileRef || !type || !['acroform', 'flat'].includes(type) || !Array.isArray(confirmedFields)) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
  }

  // Preuzmi originalni PDF iz Storage
  const { data: fileData, error: downloadError } = await admin.storage
    .from('obrasci-upload')
    .download(fileRef)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Originalni fajl nije pronađen.' }, { status: 404 })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Generiši popunjeni PDF
  let filledBytes: Uint8Array
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })

    if (type === 'acroform') {
      // AcroForm: pdf-lib native form API, DI nije potreban
      // detectScript radimo iz labela polja (dovoljan proxy za pismo dokumenta)
      const fakeDialResult = {
        pages: [],
        paragraphs: confirmedFields
          .filter(f => f.label)
          .map(f => ({ content: f.label!, boundingBox: { x: 0, y: 0, w: 0, h: 0 }, page: 1 })),
        lines: [],
        tables: [],
        words: [],
        selectionMarks: [],
        _raw: null as unknown as ReturnType<typeof Object.create>,
      }
      await fillAcroFormFields(pdfDoc, confirmedFields, fakeDialResult as never)
      // Flatten AcroForm polja u statički sadržaj
      pdfDoc.getForm().flatten()
    } else {
      // Flat PDF: potrebni su DI bounding box-ovi za fillTableCells
      const diResult = await analyzeLayout(buffer)
      await fillTableCells(pdfDoc, confirmedFields, diResult)
    }

    filledBytes = await pdfDoc.save()
  } catch (err) {
    console.error('[generate-filled] Overlay greška:', err)
    return NextResponse.json(
      { error: 'Greška pri generisanju popunjenog PDF-a. Originalni fajl nije obrisan.' },
      { status: 500 },
    )
  }

  // Obrišemo originalni tek nakon uspešnog generisanja
  // Ako brisanje ne uspe — logujemo ali ne fail-ujemo (korisnik je već dobio fajl)
  admin.storage
    .from('obrasci-upload')
    .remove([fileRef])
    .then(({ error }) => {
      if (error) console.error('[generate-filled] Storage brisanje nije uspelo:', error.message)
    })

  return new NextResponse(Buffer.from(filledBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="popunjen-obrazac.pdf"',
      'Content-Length': filledBytes.byteLength.toString(),
    },
  })
}
