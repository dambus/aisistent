import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let reset = false
  try {
    const body = await request.json()
    reset = body?.reset === true
  } catch {}

  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({ onboarded: !reset })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
