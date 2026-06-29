import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Contact } from '@/types/database'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { naziv, pib, adresa, grad, zastupnik, email, telefon, ziro_racun, tip } = body

  if (!naziv || typeof naziv !== 'string' || naziv.trim().length === 0) {
    return NextResponse.json({ error: 'Naziv kontakta je obavezan.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('contacts')
    .update({
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
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Contact)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
