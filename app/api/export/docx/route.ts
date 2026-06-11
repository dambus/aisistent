import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildDocx } from '@/lib/pdf/docxBuilder'

export const maxDuration = 60

const DOCX_PLANS = ['starter', 'pro', 'business']
const LOGO_PLANS = ['pro', 'business']

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

  // Dohvati logo i podatke firme ako plan dozvoljava
  let logoBuffer: Buffer | null = null
  let logoMimeType: string | undefined
  let companyData: { naziv: string; pib: string | null; adresa: string | null; grad: string | null } | null = null

  if (LOGO_PLANS.includes(profile.plan)) {
    const { data: company } = await admin
      .from('companies')
      .select('logo_url, naziv, pib, adresa, grad')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .single()

    if (company) {
      companyData = {
        naziv: company.naziv,
        pib: company.pib,
        adresa: company.adresa,
        grad: company.grad,
      }
    }

    if (company?.logo_url) {
      const { data: fileData } = await admin.storage
        .from('company-logos')
        .download(company.logo_url)

      if (fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        logoBuffer = Buffer.from(arrayBuffer)
        const ext = company.logo_url.split('.').pop()?.toLowerCase()
        logoMimeType = ext === 'svg' ? 'image/svg+xml'
          : ext === 'webp' ? 'image/webp'
          : ext === 'png' ? 'image/png'
          : 'image/jpeg'
      }
    }
  }

  const docxBuffer = await buildDocx(doc.generated_text, doc.title, doc.created_at, {
    documentType: doc.type,
    inputData: (doc.input_data as Record<string, unknown>) ?? undefined,
    isFree: doc.is_free ?? false,
    logoBuffer,
    logoMimeType,
    companyData,
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
