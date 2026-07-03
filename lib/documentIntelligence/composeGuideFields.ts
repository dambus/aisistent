import type { GuideField, FormSection } from '@/types/obrasci';
import type { MappedField } from './semanticMapper';

// Post-processing ekstrahovanih polja u GuideField[] — JEDINA implementacija,
// koriste je i /api/obrasci/di-analyze i test skripte (test-full-pipeline,
// test-template-cache), da testovi zaista provlače produkcijski kod.

export interface ExtractedFieldLite {
  id: string;
  label: string | null;
  confidence: 'high' | 'low';
  page: number;
  xLeft: number;
  yCtr: number;
  // Širina box-a u inčima — kod duplikat labele kroz redove najširi box dobija vrednost
  width: number;
}

const SAME_LINE_Y_IN = 0.12;

const PHONE_PRIMARY_HINT =
  'Broj telefona je podeljen u više polja obrasca — proverite da li ceo broj staje.';
const PHONE_SECONDARY_HINT = 'Nastavak broja telefona iz susednog polja.';
const DUPLICATE_LABEL_HINT =
  'Ova labela se pojavljuje na više mesta u obrascu — vrednost je predložena samo na jednom.';

export interface ComposeResult {
  fields: GuideField[];
  // Polja koja se STRUKTURNO nikad ne auto-popunjavaju (composite sekundarna +
  // cross-row duplikati) — templateCache ih čuva sa confidence: null da se odluka
  // reprodukuje i na cache hit.
  neverAutofill: Set<string>;
}

export function composeGuideFields(
  extractedFields: ExtractedFieldLite[],
  mappedFields: MappedField[],
): ComposeResult {
  const mappedMap = new Map(mappedFields.map((m) => [m.id, m]));

  const rawFields: GuideField[] = extractedFields.map((ef) => {
    const mapped = mappedMap.get(ef.id);
    const suggestedValue = mapped?.suggestedValue ?? null;
    const isInternal = mapped?.isInternal ?? false;
    const profileKey = mapped?.profileKey ?? null;

    let state: GuideField['state'] = 'manual';
    if (!isInternal && suggestedValue !== null) {
      state = ef.confidence;
    }

    return { id: ef.id, label: ef.label, suggestedValue, profileKey, isInternal, state };
  });

  // Composite grupe — više box-ova na ISTOJ Y liniji sa istom labelom
  // (npr. Телефон = pozivni broj + lokalni broj). Samo prvi po X dobija suggestedValue.
  const compositeSecondary = new Map<string, string>(); // secondaryId -> primaryId
  const compositePrimary = new Set<string>();

  for (let i = 0; i < extractedFields.length; i++) {
    const a = extractedFields[i];
    if (!a.label) continue;
    for (let j = i + 1; j < extractedFields.length; j++) {
      const b = extractedFields[j];
      if (b.label !== a.label) continue;
      if (b.page !== a.page) continue;
      if (Math.abs(b.yCtr - a.yCtr) >= SAME_LINE_Y_IN) continue;
      // Ista labela, ista strana, ista Y linija → composite grupa; levi je primarni
      const [primary, secondary] = b.xLeft > a.xLeft ? [a, b] : [b, a];
      compositeSecondary.set(secondary.id, primary.id);
      compositePrimary.add(primary.id);
    }
  }

  let fields: GuideField[] = rawFields.map((f) => {
    const primaryId = compositeSecondary.get(f.id);
    if (primaryId) {
      const primaryMapped = mappedMap.get(primaryId);
      const hint = primaryMapped?.profileKey === 'telefon' ? PHONE_SECONDARY_HINT : null;
      return { ...f, suggestedValue: null, state: 'manual' as const, hint };
    }
    if (compositePrimary.has(f.id)) {
      const mapped = mappedMap.get(f.id);
      const hint = mapped?.profileKey === 'telefon' ? PHONE_PRIMARY_HINT : null;
      return { ...f, hint };
    }
    return f;
  });

  // Cross-row duplikati — ista labela na istoj strani u RAZLIČITIM redovima (same-line
  // composite ih ne hvata). Bez ovoga se ista vrednost upisuje dvaput i vizuelno razbija
  // PDF (OPD-o: "11. Матични број" i u uskoj ćeliji do labele i preko comb reda ispod).
  // Vrednost zadržava samo NAJŠIRI box — najverovatnije pravo polje za upis; ostali idu
  // na manual sa napomenom. Kriterijum je STRUKTURNI (profileKey, ne trenutna vrednost) —
  // odluka mora biti ista bez obzira na to čiji profil je popunjen, da bi se ispravno
  // keširala u form_templates i reprodukovala na cache hit za drugog korisnika.
  const pageById = new Map(extractedFields.map((ef) => [ef.id, ef.page]));
  const widthById = new Map(extractedFields.map((ef) => [ef.id, ef.width]));
  const valueByLabelPage = new Map<string, GuideField[]>();
  for (const f of fields) {
    if (!f.label || !f.profileKey || f.isInternal) continue;
    if (compositeSecondary.has(f.id)) continue;
    const key = `${pageById.get(f.id)}|${f.label}`;
    if (!valueByLabelPage.has(key)) valueByLabelPage.set(key, []);
    valueByLabelPage.get(key)!.push(f);
  }

  const duplicateSecondary = new Set<string>();
  for (const group of valueByLabelPage.values()) {
    if (group.length < 2) continue;
    const primary = group.reduce((best, f) =>
      (widthById.get(f.id) ?? 0) > (widthById.get(best.id) ?? 0) ? f : best,
    );
    for (const f of group) {
      if (f.id !== primary.id) duplicateSecondary.add(f.id);
    }
  }

  if (duplicateSecondary.size > 0) {
    fields = fields.map((f) =>
      duplicateSecondary.has(f.id)
        ? { ...f, suggestedValue: null, state: 'manual' as const, hint: DUPLICATE_LABEL_HINT }
        : f,
    );
  }

  const neverAutofill = new Set<string>([...compositeSecondary.keys(), ...duplicateSecondary]);

  return { fields, neverAutofill };
}

// Grupisanje u FormSection[] — mora se raditi server-side dok extractedFields (page/yCtr)
// još postoje; GuideField namerno ne nosi koordinate. Redosled prati ekstrakcioni
// redosled, "Strana N" fallback gde nema detektovanog naslova.
export function groupIntoSections(
  extractedFields: ExtractedFieldLite[],
  fields: GuideField[],
  sectionMap: Map<string, string>,
): FormSection[] {
  const fieldById = new Map(fields.map((f) => [f.id, f]));
  const sectionOrder: string[] = [];
  const sectionFieldsMap = new Map<string, GuideField[]>();
  const sectionPageMap = new Map<string, number>();

  for (const ef of extractedFields) {
    const field = fieldById.get(ef.id);
    if (!field) continue;
    const title = sectionMap.get(ef.id) ?? `Strana ${ef.page}`;
    if (!sectionFieldsMap.has(title)) {
      sectionOrder.push(title);
      sectionFieldsMap.set(title, []);
      sectionPageMap.set(title, ef.page);
    }
    sectionFieldsMap.get(title)!.push(field);
  }

  return sectionOrder.map((title) => ({
    title,
    page: sectionPageMap.get(title)!,
    fields: sectionFieldsMap.get(title)!,
  }));
}
