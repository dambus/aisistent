import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, ctx: RouteContext<'/api/documents/[id]'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const { id } = await ctx.params

  const { data: document, error } = await supabase
    .from('documents')
    .select('id, type, input_data, version, root_document_id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (error || !document || document.user_id !== user.id) {
    return NextResponse.json({ error: 'Dokument nije pronađen.' }, { status: 404 })
  }

  return NextResponse.json({
    id: document.id,
    type: document.type,
    input_data: document.input_data,
    version: document.version,
    root_document_id: document.root_document_id,
  })
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/documents/[id]'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const { id } = await ctx.params

  let body: { generated_text?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { generated_text } = body
  if (!generated_text || typeof generated_text !== 'string') {
    return NextResponse.json({ error: 'Nedostaje generated_text.' }, { status: 400 })
  }

  const { data: doc } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (!doc || doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Dokument nije pronađen.' }, { status: 404 })
  }

  const { error } = await supabase
    .from('documents')
    .update({ generated_text })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/documents/[id]'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  const { id } = await ctx.params

  const { data: document, error: selectError } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 })
  }

  if (!document || document.user_id !== user.id) {
    return NextResponse.json({ error: 'Dokument nije pronađen.' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
