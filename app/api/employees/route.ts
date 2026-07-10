import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Employee } from '@/types/database'

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 0,
  pro:     50,
  agency:  null,
}

const JMBG_RE = /^\d{13}$/

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Employee[])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan] !== undefined ? PLAN_LIMITS[plan] : null

  if (limit !== null) {
    const { count } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      const limitMsg = limit === 0
        ? 'Sačuvani zaposleni dostupni su od Pro plana.'
        : `Vaš plan dozvoljava maksimalno ${limit} zaposlenih.`
      return NextResponse.json(
        { error: `${limitMsg} Nadogradite plan za više zaposlenih.` },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const { ime, jmbg, pozicija, datum_zaposlenja, email, plata_osnova } = body

  if (!ime || typeof ime !== 'string' || ime.trim().length === 0) {
    return NextResponse.json({ error: 'Ime zaposlenog je obavezno.' }, { status: 400 })
  }

  if (jmbg && !JMBG_RE.test(jmbg)) {
    return NextResponse.json({ error: 'JMBG mora imati tačno 13 cifara.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('employees')
    .insert({
      user_id: user.id,
      ime: ime.trim(),
      jmbg: jmbg?.trim() || null,
      pozicija: pozicija?.trim() || null,
      datum_zaposlenja: datum_zaposlenja || null,
      email: email?.trim() || null,
      plata_osnova: typeof plata_osnova === 'number' ? plata_osnova : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Employee, { status: 201 })
}
