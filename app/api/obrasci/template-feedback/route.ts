import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Faza 3 Korak 6 — negativan feedback na kvalitet prepoznavanja obrasca.
// Samo logovanje (nikad automatska re-analiza). Pozitivan feedback se ne šalje —
// klijent ga samo prikaže kao "hvala". 3+ negativna → needs_review flag na template.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  let body: { fingerprint?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { fingerprint } = body
  if (!fingerprint || typeof fingerprint !== 'string') {
    return NextResponse.json({ error: 'Nedostaje fingerprint.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error: insertError } = await admin
    .from('template_feedback')
    .insert({ fingerprint, user_id: user.id })

  if (insertError) {
    console.error('[template-feedback] insert error:', insertError.message)
    return NextResponse.json({ error: 'Greška pri čuvanju ocene.' }, { status: 500 })
  }

  // 3+ negativna → template označen za ručni pregled. Neuspeh ovde ne obara zahtev —
  // feedback je već zabeležen, flag je samo statistika.
  const { count } = await admin
    .from('template_feedback')
    .select('id', { count: 'exact', head: true })
    .eq('fingerprint', fingerprint)

  if ((count ?? 0) >= 3) {
    const { error: flagError } = await admin
      .from('form_templates')
      .update({ needs_review: true })
      .eq('fingerprint', fingerprint)
    if (flagError) console.error('[template-feedback] needs_review flag error:', flagError.message)
  }

  return NextResponse.json({ ok: true })
}
