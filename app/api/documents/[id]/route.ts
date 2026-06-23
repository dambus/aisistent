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
