import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Employee } from '@/types/database'

const JMBG_RE = /^\d{13}$/

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
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
    .update({
      ime: ime.trim(),
      jmbg: jmbg?.trim() || null,
      pozicija: pozicija?.trim() || null,
      datum_zaposlenja: datum_zaposlenja || null,
      email: email?.trim() || null,
      plata_osnova: typeof plata_osnova === 'number' ? plata_osnova : null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as Employee)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
