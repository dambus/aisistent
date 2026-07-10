import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CatalogItem } from '@/types/database'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { naziv, opis, jedinica, cena_bez_pdv, pdv_stopa } = body

  if (!naziv || typeof naziv !== 'string' || naziv.trim().length === 0) {
    return NextResponse.json({ error: 'Naziv stavke je obavezan.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('catalog_items')
    .update({
      naziv: naziv.trim(),
      opis: opis?.trim() || null,
      jedinica: jedinica?.trim() || 'kom',
      cena_bez_pdv: typeof cena_bez_pdv === 'number' ? cena_bez_pdv : 0,
      pdv_stopa: typeof pdv_stopa === 'number' ? pdv_stopa : 20,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as CatalogItem)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase
    .from('catalog_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
