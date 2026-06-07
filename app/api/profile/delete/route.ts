import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Briši dokumente korisnika
  await admin.from('documents').delete().eq('user_id', user.id)

  // Briši profil
  await admin.from('profiles').delete().eq('id', user.id)

  // Briši auth korisnika (service role)
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'Greška pri brisanju naloga.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
