import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const LOGO_PLANS = ['pro', 'business', 'agency']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const EXT_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
}

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const { id } = await params

  // Plan check
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || !LOGO_PLANS.includes(profile.plan)) {
    return NextResponse.json(
      { error: 'Logo na dokumentima dostupan je za Pro i Business plan.' },
      { status: 403 }
    )
  }

  // Firma vlasništvo
  const { data: company } = await supabase
    .from('companies')
    .select('id, logo_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!company) return NextResponse.json({ error: 'Firma nije pronađena.' }, { status: 404 })

  // Parsiraj multipart
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const file = formData.get('logo')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fajl nije priložen.' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Dozvoljeni tipovi: PNG, JPEG, SVG, WebP.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Maksimalna veličina fajla je 2MB.' },
      { status: 400 }
    )
  }

  const ext = EXT_MAP[file.type]
  const storagePath = `${user.id}/${id}.${ext}`

  // Obriši stari logo ako postoji i ima drugačiji ext
  if (company.logo_url && company.logo_url !== storagePath) {
    await admin.storage.from('company-logos').remove([company.logo_url])
  }

  // Upload
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await admin.storage
    .from('company-logos')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Upload greška: ${uploadError.message}` }, { status: 500 })
  }

  // Sačuvaj path u bazi
  await admin
    .from('companies')
    .update({ logo_url: storagePath })
    .eq('id', id)
    .eq('user_id', user.id)

  // Generiši signed URL za prikaz (1 sat)
  const { data: signed } = await admin.storage
    .from('company-logos')
    .createSignedUrl(storagePath, 3600)

  return NextResponse.json({
    logo_url: storagePath,
    logo_display_url: signed?.signedUrl ?? null,
  })
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const { id } = await params

  const admin = createAdminClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id, logo_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!company) return NextResponse.json({ error: 'Firma nije pronađena.' }, { status: 404 })

  if (company.logo_url) {
    await admin.storage.from('company-logos').remove([company.logo_url])
  }

  await admin
    .from('companies')
    .update({ logo_url: null })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
