---
name: project-autofill-research
description: Istraživanje dva autofill featura — sačuvani kontakti/katalog i Upload & Fill za tuđe obrasce
metadata:
  type: project
---

## 1. Sačuvani kontakti, katalog usluga, zaposleni

`companyFieldMap` već popunjava *tvoju* firmu u svim tipovima dokumenta. Praznina je **druga strana** — kupac, naručilac, zakupac — koji se kuca iznova.

Tri pod-featura (po prioritetu):

1. **Sačuvani kontakti** (Starter+) ✅ — `contacts` tabela + `contactFieldMap`, ista logika kao `companies`. U produkciji.
2. **Katalog usluga/artikala** (Pro+) ✅ (10. jul 2026., migracija `20260710000001` primenjena na produkciju) — `catalog_items` tabela, "+ Iz kataloga..." dropdown u `FakturaStavkeField` (deljen između faktura/ponuda-za-radove/otpremnica; `ponuda-klijentu` izostavljena, nema stavke uopšte). Detalji: `PROGRESS.md` (10. jul, dodatak).
3. **Sačuvani zaposleni** (Pro+) ✅ (10. jul 2026., migracija `20260710000002` primenjena na produkciju) — `employees` tabela, autofill u ugovor-o-radu/resenje-godisnji-odmor/putni-nalog. JMBG maskiran u listi + regex-validiran na API (jedino odstupanje od "bez format-validacije" konvencije). `odgovor-kandidatu` namerno izostavljen (drugi domen podataka — kandidat, ne zaposleni). Detalji: `PROGRESS.md` (10. jul, treći dodatak). **Smart Autofill trilogija (kontakti+katalog+zaposleni) sad kompletna i potpuno na produkciji.**

**How to apply:** Implementirati ovim redosledom pre nego što se kreće na Upload & Fill — bez bogatog profila auto-fill nema vrednost.

---

## 2. Upload & Fill — UKINUTO (10. jul 2026.)

Ideja bila: korisnik uploaduje tuđi obrazac (RFQ, tender, partner-obrazac SAP/DMS), aplikacija prepozna polja i auto-popuni iz profila firme. Već 4. jula pivotirano dalje od korisnika (previše grešaka čitanja na produkciji, feature frustrirao umesto da pomaže) u interni kuratorski alat za biblioteku obrazaca.

**Odluka (Milan, 10. jul): potpuno ukinuto — previše komplikovano i nepouzdano da bi vredelo dalje ulagati.** Obrisan sav mrtav UI/API kod: `components/obrasci/{ObraściClient,GuideView,SectionWizardView,PreviewView}.tsx`, `app/api/obrasci/{di-analyze,generate-filled,template-feedback}/route.ts`, `lib/documentIntelligence/{templateCache,computeFingerprint,pdfOverlay}.ts`, prateći test skriptovi (`test-full-pipeline.ts`, `test-template-cache.ts`, `test-fingerprint.ts`). Verifikovano `tsc`/`eslint` čisto posle brisanja (proverено da ništa drugo ne referencira obrisano pre brisanja — greppovano po repou).

**Zadržano** (deljena infrastruktura, i dalje aktivno koristi `scripts/curate-form.ts` za rast biblioteke obrazaca): `analyzeLayout.ts`, `extractAcroFormFields.ts`, `matchFieldLabels.ts`, `extractFlatPdfFields.ts`, `semanticMapper.ts`, `composeGuideFields.ts`, `detectSections.ts`, `transliterate.ts`, `signatureLabels.ts`, `fillLibraryForm.ts`, `pdfCoordinates.ts`, `types/obrasci.ts` (GuideField/FormSection tipovi, i dalje koristi composeGuideFields). `form_templates`/`template_feedback` Supabase tabele ostaju u bazi (nisu drop-ovane, van scope-a čišćenja).

**Why:** Mrtav kod koji liči na aktivan feature zbunjuje buduće sesije (upravo se to i desilo — memorija je i dalje govorila o njemu kao "u toku"). Biblioteka obrazaca (Faza 4, `/obrasci`, 234 obrasca) je feature koji je preživeo pivot i vredi ga dalje razvijati; Upload & Fill nije.
