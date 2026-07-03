import { createAdminClient } from '@/lib/supabase/admin';

export type FormSourceType = 'acroform' | 'flat' | 'mixed';

// Strukturno polje u kešu — NIKAD ne sadrži suggestedValue (korisnički podatak).
// confidence je DI geometrijski signal (nezavisan od korisnika); state se izvodi
// na cache hit-u iz confidence + sveže vrednosti profila TRENUTNOG korisnika.
// confidence: null = polje se strukturno nikad ne auto-popunjava (composite
// sekundarno polje — npr. drugi deo telefona), iako profileKey može biti postavljen.
export interface TemplateFieldStruct {
  id: string;
  label: string | null;
  profileKey: string | null;
  isInternal: boolean;
  confidence: 'high' | 'low' | null;
  hint?: string | null;
}

// Struktura sekcije — samo naslov, strana i redosled id-jeva polja (isti oblik kao
// SectionShape u ObraściClient.tsx). FormSection[] se gradi spajanjem sa poljima.
export interface TemplateSectionShape {
  title: string;
  page: number;
  fieldIds: string[];
}

export interface FormTemplate {
  fingerprint: string;
  name: string | null;
  pageCount: number;
  sourceType: FormSourceType;
  fields: TemplateFieldStruct[];
  sections: TemplateSectionShape[] | null;
  hitCount: number;
}

export interface SaveTemplateInput {
  name: string | null;
  pageCount: number;
  sourceType: FormSourceType;
  fields: TemplateFieldStruct[];
  sections: TemplateSectionShape[] | null;
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
    fields: data.fields as unknown as TemplateFieldStruct[],
    sections: data.sections as unknown as TemplateSectionShape[] | null,
    hitCount: data.hit_count,
  };
}

// Cuva strukturu NOVOG obrasca (cache miss put). Nikad ne cuvati korisnicke vrednosti —
// samo strukturu (labele, profileKey, confidence, hint), ne suggestedValue iz konkretnog
// korisnickog profila. Pozivalac gradi TemplateFieldStruct[] bez vrednosti.
export async function saveTemplate(fingerprint: string, input: SaveTemplateInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('form_templates').insert({
    fingerprint,
    name: input.name,
    page_count: input.pageCount,
    source_type: input.sourceType,
    fields: input.fields as unknown as object,
    sections: input.sections as unknown as object | null,
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
