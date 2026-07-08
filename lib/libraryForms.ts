import { createClient } from '@supabase/supabase-js'

// Javno čitanje biblioteke obrazaca (Faza 4) — anon klijent, RLS pušta samo published.
// Isti pattern kao lib/blog.ts.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const CATEGORY_LABELS: Record<string, string> = {
  poreska: 'Poreska uprava',
  apr: 'APR',
  croso: 'CROSO',
  lokalna: 'Lokalna samouprava',
  ostalo: 'Ostalo',
}

export interface LibraryFormMeta {
  slug: string
  title: string
  shortName: string
  category: string
  description: string | null
  sourceInstitution: string
  sourceUrl: string
  pageCount: number
  verifiedAt: string
  // false = referentni PDF (flat obrazac ili AcroForm bez ijednog mapiranog polja) —
  // frontend sakriva "Preuzmi popunjeno" i prikazuje napomenu da se samo preuzima prazan
  hasAutofill: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMeta(row: any): LibraryFormMeta {
  return {
    slug: row.slug,
    title: row.title,
    shortName: row.short_name,
    category: row.category,
    description: row.description,
    sourceInstitution: row.source_institution,
    sourceUrl: row.source_url,
    pageCount: row.page_count,
    verifiedAt: row.verified_at,
    hasAutofill: Array.isArray(row.fields) && row.fields.length > 0,
  }
}

export async function getAllLibraryForms(): Promise<LibraryFormMeta[]> {
  const { data } = await supabase
    .from('library_forms')
    .select('slug, title, short_name, category, description, source_institution, source_url, page_count, verified_at, fields')
    .eq('published', true)
    .order('category')
    .order('short_name')

  return (data ?? []).map(toMeta)
}

export async function getLibraryForm(slug: string): Promise<LibraryFormMeta | null> {
  const { data } = await supabase
    .from('library_forms')
    .select('slug, title, short_name, category, description, source_institution, source_url, page_count, verified_at, fields')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  return data ? toMeta(data) : null
}

export function formatDateSr(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' })
}
