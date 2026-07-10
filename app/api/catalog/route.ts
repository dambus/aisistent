import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CatalogItem } from '@/types/database'

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 0,
  pro:     50,
  agency:  null,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('catalog_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as CatalogItem[])
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
      .from('catalog_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      const limitMsg = limit === 0
        ? 'Katalog usluga dostupan je od Pro plana.'
        : `Vaš plan dozvoljava maksimalno ${limit} stavki u katalogu.`
      return NextResponse.json(
        { error: `${limitMsg} Nadogradite plan za više stavki.` },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const { naziv, opis, jedinica, cena_bez_pdv, pdv_stopa } = body

  if (!naziv || typeof naziv !== 'string' || naziv.trim().length === 0) {
    return NextResponse.json({ error: 'Naziv stavke je obavezan.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('catalog_items')
    .insert({
      user_id: user.id,
      naziv: naziv.trim(),
      opis: opis?.trim() || null,
      jedinica: jedinica?.trim() || 'kom',
      cena_bez_pdv: typeof cena_bez_pdv === 'number' ? cena_bez_pdv : 0,
      pdv_stopa: typeof pdv_stopa === 'number' ? pdv_stopa : 20,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as CatalogItem, { status: 201 })
}
