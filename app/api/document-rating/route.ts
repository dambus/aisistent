import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { document_id, document_type, rating, comment } = body as {
    document_id?: unknown
    document_type?: unknown
    rating?: unknown
    comment?: unknown
  }

  if (typeof document_id !== 'string' || !document_id) {
    return NextResponse.json({ error: 'Missing document_id' }, { status: 400 })
  }
  if (typeof document_type !== 'string' || !document_type) {
    return NextResponse.json({ error: 'Missing document_type' }, { status: 400 })
  }
  if (typeof rating !== 'boolean') {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  const { error } = await supabase
    .from('document_ratings')
    .upsert(
      {
        document_id,
        user_id: user.id,
        document_type,
        rating,
        comment: typeof comment === 'string' ? comment.trim() || null : null,
      },
      { onConflict: 'document_id,user_id' }
    )

  if (error) {
    console.error('[document-rating]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
