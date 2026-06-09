import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Company } from '@/types/database'

const PLAN_LIMITS: Record<string, number | null> = {
  free:     1,
  starter:  1,
  pro:      3,
  business: null,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Company[])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Dohvati plan korisnika
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan] ?? 1

  if (limit !== null) {
    const { count } = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      const limitMsg = limit === 1
        ? 'Vaš plan dozvoljava maksimalno 1 firmu.'
        : `Vaš plan dozvoljava maksimalno ${limit} firme.`
      return NextResponse.json(
        { error: `${limitMsg} Nadogradite plan za više firmi.` },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const {
    naziv, pib, maticni_broj, adresa, grad,
    zastupnik, funkcija_zastupnika, email, telefon, is_default,
  } = body

  if (!naziv || typeof naziv !== 'string' || naziv.trim().length === 0) {
    return NextResponse.json({ error: 'Naziv firme je obavezan.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      user_id: user.id,
      naziv: naziv.trim(),
      pib: pib?.trim() || null,
      maticni_broj: maticni_broj?.trim() || null,
      adresa: adresa?.trim() || null,
      grad: grad?.trim() || null,
      zastupnik: zastupnik?.trim() || null,
      funkcija_zastupnika: funkcija_zastupnika?.trim() || null,
      email: email?.trim() || null,
      telefon: telefon?.trim() || null,
      is_default: Boolean(is_default),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Company, { status: 201 })
}
