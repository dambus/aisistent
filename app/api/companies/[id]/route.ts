import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Company, Database } from '@/types/database'

type CompanyUpdate = Database['public']['Tables']['companies']['Update']

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Proveri da firma pripada korisniku
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Firma nije pronađena.' }, { status: 404 })

  const body = await req.json()
  const {
    naziv, pib, maticni_broj, adresa, grad,
    zastupnik, funkcija_zastupnika, email, telefon, is_default,
  } = body

  const updatePayload: CompanyUpdate = {}
  if (naziv !== undefined) updatePayload.naziv = naziv.trim()
  if (pib !== undefined) updatePayload.pib = pib?.trim() || null
  if (maticni_broj !== undefined) updatePayload.maticni_broj = maticni_broj?.trim() || null
  if (adresa !== undefined) updatePayload.adresa = adresa?.trim() || null
  if (grad !== undefined) updatePayload.grad = grad?.trim() || null
  if (zastupnik !== undefined) updatePayload.zastupnik = zastupnik?.trim() || null
  if (funkcija_zastupnika !== undefined) updatePayload.funkcija_zastupnika = funkcija_zastupnika?.trim() || null
  if (email !== undefined) updatePayload.email = email?.trim() || null
  if (telefon !== undefined) updatePayload.telefon = telefon?.trim() || null
  if (is_default !== undefined) updatePayload.is_default = Boolean(is_default)

  const { data, error } = await supabase
    .from('companies')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Company)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
