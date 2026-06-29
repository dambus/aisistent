import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Contact } from '@/types/database'

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 5,
  pro:     null,
  agency:  null,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Contact[])
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
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      const limitMsg = limit === 0
        ? 'Dodavanje kontakata dostupno je od Starter plana.'
        : `Vaš plan dozvoljava maksimalno ${limit} kontakata.`
      return NextResponse.json(
        { error: `${limitMsg} Nadogradite plan za više kontakata.` },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const { naziv, pib, adresa, grad, zastupnik, email, telefon, ziro_racun, tip } = body

  if (!naziv || typeof naziv !== 'string' || naziv.trim().length === 0) {
    return NextResponse.json({ error: 'Naziv kontakta je obavezan.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: user.id,
      naziv: naziv.trim(),
      pib: pib?.trim() || null,
      adresa: adresa?.trim() || null,
      grad: grad?.trim() || null,
      zastupnik: zastupnik?.trim() || null,
      email: email?.trim() || null,
      telefon: telefon?.trim() || null,
      ziro_racun: ziro_racun?.trim() || null,
      tip: tip || 'firma',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Contact, { status: 201 })
}
