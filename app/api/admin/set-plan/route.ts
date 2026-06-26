import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_PLANS = ['free', 'starter', 'pro', 'agency']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, plan } = body

  if (!userId || !plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { error } = await admin
    .from('profiles')
    .update({ plan })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: 'Greška pri ažuriranju.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
