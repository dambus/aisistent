import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Faza 4 Korak 5 — "obrazac je zastareo ili ima grešku?" dugme (spec sekcija 8).
// Samo logovanje, bez auth (javna stranica) — inkrement outdated_reports.
// Nikad automatska reakcija — kurator ručno pregleda i re-kurira ako treba.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const admin = createAdminClient()
  const { data: form, error: fetchError } = await admin
    .from('library_forms')
    .select('outdated_reports')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (fetchError || !form) {
    return NextResponse.json({ error: 'Obrazac nije pronađen.' }, { status: 404 })
  }

  const { error: updateError } = await admin
    .from('library_forms')
    .update({ outdated_reports: form.outdated_reports + 1 })
    .eq('slug', slug)

  if (updateError) {
    console.error('[report-outdated] update error:', updateError.message)
    return NextResponse.json({ error: 'Greška pri čuvanju prijave.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
