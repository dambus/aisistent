import { createAdminClient } from '@/lib/supabase/admin';
import type { GuideField } from '@/types/obrasci';

export type FormSourceType = 'acroform' | 'flat' | 'mixed';

export interface FormTemplate {
  fingerprint: string;
  name: string | null;
  pageCount: number;
  sourceType: FormSourceType;
  fields: GuideField[];
  // Sekcije dolaze u Fazi 3 Koraku 2 (detectSections.ts) — do tada null.
  sections: unknown | null;
  hitCount: number;
}

export interface SaveTemplateInput {
  name: string | null;
  pageCount: number;
  sourceType: FormSourceType;
  fields: GuideField[];
  sections: unknown | null;
}

// Cita keširanu strukturu obrasca. null ako fingerprint nije pronadjen (cache miss).
export async function getTemplate(fingerprint: string): Promise<FormTemplate | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('form_templates')
    .select('*')
    .eq('fingerprint', fingerprint)
    .maybeSingle();

  if (error) throw new Error(`templateCache.getTemplate: ${error.message}`);
  if (!data) return null;

  return {
    fingerprint: data.fingerprint,
    name: data.name,
    pageCount: data.page_count,
    sourceType: data.source_type as FormSourceType,
    fields: data.fields as unknown as GuideField[],
    sections: data.sections,
    hitCount: data.hit_count,
  };
}

// Cuva strukturu NOVOG obrasca (cache miss put). Nikad ne cuvati korisnicke vrednosti —
// samo strukturu (labele, koordinate, profileKey/state), ne suggestedValue iz konkretnog
// korisnickog profila. Pozivalac je odgovoran da ocisti fields pre poziva ako je potrebno.
export async function saveTemplate(fingerprint: string, input: SaveTemplateInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('form_templates').insert({
    fingerprint,
    name: input.name,
    page_count: input.pageCount,
    source_type: input.sourceType,
    fields: input.fields as unknown as object,
    sections: input.sections as object | null,
  });

  if (error) throw new Error(`templateCache.saveTemplate: ${error.message}`);
}

// Beleži cache hit — ne baca gresku ako update ne uspe, jer je ovo samo statistika,
// ne sme da blokira glavni lookup flow.
export async function incrementHitCount(fingerprint: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc('increment_form_template_hit', { p_fingerprint: fingerprint });
  if (error) console.error('templateCache.incrementHitCount:', error.message);
}
