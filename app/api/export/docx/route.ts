import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildDocx } from '@/lib/pdf/docxBuilder'

export const maxDuration = 60

const DOCX_PLANS = ['starter', 'pro', 'business']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  let body: { document_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  if (!body.document_id) {
    return NextResponse.json({ error: 'Nedostaje document_id.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Plan check
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || !DOCX_PLANS.includes(profile.plan)) {
    return NextResponse.json(
      { error: 'DOCX export je dostupan samo korisnicima Starter, Pro i Business plana. Pređite na plaćeni plan da biste preuzeli Word dokument bez watermark-a.' },
      { status: 403 }
    )
  }

  const { data: doc, error } = await admin
    .from('documents')
    .select('id, user_id, type, title, generated_text, input_data, is_free, created_at')
    .eq('id', body.document_id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Dokument nije pronađen.' }, { status: 404 })
  }

  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Nemate pristup ovom dokumentu.' }, { status: 403 })
  }

  const docxBuffer = await buildDocx(doc.generated_text, doc.title, doc.created_at, {
    documentType: doc.type,
    inputData: (doc.input_data as Record<string, unknown>) ?? undefined,
    isFree: doc.is_free ?? false,
  })

  const slug = doc.type.replace('ugovor-o-', 'ugovor-')
  const date = new Date(doc.created_at).toISOString().split('T')[0]
  const filename = `${slug}-${date}.docx`

  return new NextResponse(new Uint8Array(docxBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(docxBuffer.byteLength),
    },
  })
}
