import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Contact } from '@/types/database'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('id, user_id, ime, email, firma, created_at')
    .eq('user_id', user.id)
    .order('ime', { ascending: true, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: 'Greška pri dohvatanju kontakata.' }, { status: 500 })
  }

  return NextResponse.json((data ?? []) as Contact[])
}
