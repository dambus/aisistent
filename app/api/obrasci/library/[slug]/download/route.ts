import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fillLibraryForm, type LibraryField, type FormScript } from '@/lib/documentIntelligence/fillLibraryForm'
import type { Company } from '@/types/database'

// Faza 4 — download obrasca iz biblioteke.
// Prazan original: javan (odluka 12.1 — lista je akvizicioni kanal).
// filled=1: auth + plan (Starter+), vrednosti iz default profila firme.
// Na download NEMA DI/Claude poziva — sve iz library_forms reda.

const FILLED_PLANS = ['starter', 'pro', 'agency']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const filled = req.nextUrl.searchParams.get('filled') === '1'

  const admin = createAdminClient()
  const { data: form, error } = await admin
    .from('library_forms')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !form) {
    return NextResponse.json({ error: 'Obrazac nije pronađen.' }, { status: 404 })
  }

  const { data: fileData, error: downloadError } = await admin.storage
    .from('obrasci-library')
    .download(form.file_ref)

  if (downloadError || !fileData) {
    console.error('[library download] storage error:', downloadError?.message)
    return NextResponse.json({ error: 'Fajl nije dostupan.' }, { status: 500 })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())
  const baseName = form.slug

  if (!filled) {
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseName}.pdf"`,
      },
    })
  }

  // ── filled=1: auth + plan + profil ──
  if (!Array.isArray(form.fields) || form.fields.length === 0) {
    return NextResponse.json({ error: 'no-autofill' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || !FILLED_PLANS.includes(profile.plan)) {
    return NextResponse.json({ error: 'plan' }, { status: 403 })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'no-company' }, { status: 400 })
  }

  try {
    const result = await fillLibraryForm(
      buffer,
      form.fields as unknown as LibraryField[],
      company as Company,
      form.script as FormScript,
    )
    return new NextResponse(new Uint8Array(result.bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseName}-popunjen.pdf"`,
      },
    })
  } catch (err) {
    console.error('[library download] fill error:', err)
    return NextResponse.json({ error: 'Greška pri popunjavanju obrasca.' }, { status: 500 })
  }
}
