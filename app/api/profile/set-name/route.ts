import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const raw = body?.display_name

  if (typeof raw !== 'string') {
    return NextResponse.json({ error: 'Neispravno ime.' }, { status: 400 })
  }

  const display_name = raw.trim()

  if (display_name.length < 2 || display_name.length > 50) {
    return NextResponse.json({ error: 'Ime mora imati između 2 i 50 karaktera.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ display_name })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: 'Greška pri čuvanju.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
