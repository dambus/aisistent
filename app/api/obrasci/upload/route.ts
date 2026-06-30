import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument } from 'pdf-lib'
import { randomUUID } from 'crypto'

const UPLOAD_PLANS = ['starter', 'pro', 'agency']
const MAX_SIZE = 10 * 1024 * 1024
const MIME_PDF = 'application/pdf'
const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

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

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fajl nije priložen.' }, { status: 400 })
  }

  if (file.type !== MIME_PDF && file.type !== MIME_DOCX) {
    return NextResponse.json({ error: 'Dozvoljeni tipovi fajlova: PDF i DOCX.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Maksimalna veličina fajla je 10MB.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type === MIME_PDF ? 'pdf' : 'docx'
  const fileRef = `${user.id}/${randomUUID()}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('obrasci-uploads')
    .upload(fileRef, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `Upload greška: ${uploadError.message}` }, { status: 500 })
  }

  // Detekcija tipa
  let type: 'acroform' | 'docx' | 'flat' = 'flat'

  if (file.type === MIME_DOCX) {
    type = 'docx'
  } else {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const fields = pdfDoc.getForm().getFields()
      if (fields.length > 0) type = 'acroform'
    } catch {
      // Ne može da parsira → flat
    }
  }

  return NextResponse.json({ fileRef, type, filename: file.name })
}
