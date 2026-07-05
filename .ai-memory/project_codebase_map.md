---
name: project-codebase-map
description: "Full architecture map of AIsistent — routing, wizard/generation pipeline, obrasci (forms library) pipeline, DB schema, Serbian-language logic"
metadata: 
  node_type: memory
  type: project
  originSessionId: 88c02279-9c65-44ec-bb1b-76a5b2cf7ee5
---

Full-codebase read completed 2026-07-05 (via /claude-mem:learn-codebase, 3 parallel Explore agents). Snapshot of architecture at that date — re-verify specifics before relying on exact file/line details, but the shapes below should be stable.

## Routing & dashboard
Next.js App Router route groups: `(auth)` login/register, `(dashboard)` protected app (redirects unauthenticated → `/login`, unonboarded → `/onboarding/*`), `admin` (guarded by `profiles.is_admin`), plus public marketing/tool pages at root (`/nda`, `/ugovor-o-*`, `/kalkulator-*`, `/blog`).
Dashboard components: `DashboardShell`/`Sidebar` wrap all pages; `CompaniesTab`/`ContactsTab` self-contained CRUD (Sheet + AlertDialog); `ArchiveList` (search/filter, PDF/DOCX export, email send, new version, duplicate, delete, thumbs up/down rating).

## Document wizard → generation pipeline
`dokumenti/[type]/page.tsx` (server) validates type, loads companies/contacts/plan, optionally hydrates from `?from=`/`?copy=` (version chain / duplicate) → `WizardPageClient` → `WizardForm` (steps/fields from `lib/prompts/*` per-type modules, conditional visibility, localStorage draft autosave, company/contact autofill via `lib/utils/companyFieldMap.ts`/`contactFieldMap.ts`) → POST `/api/generate`.

`/api/generate`: auth + in-memory rate limit (10/hr, not distributed-safe) + plan quota (free 3/mo, starter 20, pro/agency unlimited) + Zod validation per type → either Claude call (`claude-sonnet-4-5`, prompt module's `systemPrompt` + `buildUserMessage`) for prose docs, or direct JSON→PDF for structured financial docs (faktura/putni-nalog/otpremnica/ponuda-za-radove, no AI). Inserts into `documents` with `version`/`root_document_id` chaining.

Each `lib/prompts/*.ts` exports `systemPrompt`, `buildUserMessage(data)`, `wizardSteps`. Notably `ugovor-o-radu.ts` teaches Claude Serbian grammatical case rules (nominativ/genitiv/dativ/...) inline with worked examples rather than declining names in code — deliberate design choice, prompt-as-grammar-engine.

Rendering: `lib/pdf/markdownParser.ts` (markdown→Block[], strips Cyrillic leakage, cuts signature-section text Claude sometimes leaks) → `lib/pdf/AisistentDocument.tsx` (react-pdf, hardcoded `buildSigData` switch per docType) or `docxBuilder.ts` (duplicate logic for DOCX — the two must be kept in sync manually, per CONVENTIONS.md). `fakturaRenderer.tsx`/`otpremnicaRenderer.tsx`/`putniNalogRenderer.tsx`/`ponudaZaRadoveRenderer.tsx` are bespoke non-AI renderers. Free plan gets watermark (`applyWatermark.ts`) + "BESPLATNA VERZIJA" stamp.

## Obrasci (forms library) — Faza 1-4, pivoted 2026-07-04
Originally (Faza 1-3): generic "upload any PDF, we auto-fill it" pipeline — Azure Document Intelligence layout analysis (`analyzeLayout.ts`) + AcroForm/flat-field extraction (`extractAcroFormFields.ts`/`extractFlatPdfFields.ts`) + geometric label matching (`matchFieldLabels.ts`) + Claude semantic mapping to fixed `PROFILE_KEYS` (`semanticMapper.ts`) + fingerprint cache (`computeFingerprint.ts`/`templateCache.ts` → `form_templates` table).

**Pivoted** after real-world test showed unreliability (e.g. only ~9/198 fields auto-filled on PPDG-1S). Faza 4 = curated library instead: human curator runs `scripts/curate-form.ts` (runs Faza1-3 as draft proposal, curator edits JSON, test-fill, publish to `library_forms` table — verified mappings only, never user values, stored per-form). Download path (`fillLibraryForm.ts`) does zero AI/DI calls — pulls pre-verified mapping, fills AcroForm live (unflattened, still editable in Adobe) from profile data. `scripts/harvest-sources.ts` crawls institutional sites (APR first, 51 AcroForm candidates found) for new/changed forms to curate.

The interactive (non-curated) upload flow still exists in `ObraściClient` (Stage state machine: idle/uploading/analyzing/wizard/di-guide/di-wizard/di-preview/error) for AcroForm/DOCX/flat uploads, using `pdfOverlay.ts` for coordinate-based fill + `detectSections.ts`/`composeGuideFields.ts` for the section wizard UI (states: high/low/manual confidence per field, with rules to avoid autofilling composite same-line pairs or duplicate cross-row labels).

## DB schema (Supabase, RLS on everything)
`profiles` (plan, documents_this_month, is_admin, onboarded, industry) · `documents` (input_data jsonb, generated_text, version, root_document_id self-FK, company_id) · `companies` (naziv, pib, maticni_broj, zastupnik, ziro_racun, pdv_obveznik, logo_url, is_default...) · `contacts` (ime, email, firma) · `subscriptions` (stripe fields — Paddle migration pending) · `document_ratings` · `blog_posts`/`blog_keywords` · `form_templates` (Faza1-3 fingerprint cache, service-role only, no public RLS policies) · `template_feedback` (negative feedback log, service-role only) · `library_forms` (Faza 4 curated forms, public SELECT when published=true, else service-role). Storage buckets: `company-logos`, `obrasci-upload`, `obrasci-library` (private, PDF only, 10MB).

## Serbian-language-specific logic (unusual, worth remembering)
- Transliteration: full Latin↔Cyrillic tables in `lib/documentIntelligence/transliterate.ts` (+ smaller duplicate in `markdownParser.ts`), digraphs (lj/nj/dž) handled first, script auto-detected by codepoint ranges, emails/URLs excluded.
- Vocative case: `lib/utils/vokativ.ts` + `lib/data/vokativ.json` lookup, plus separate rule-based `vocative.ts` with hardcoded exceptions — used to inject correct vocative hints into prompts (e.g. employee name in `ugovor-o-radu`).
- Gender detection: two independent unreconciled implementations (`genderDetect.ts` general, `rod.ts` for legal-representative gender specifically) — each has its own exception-name sets, not unified. Know this before "fixing" one and assuming the other updates too.

## Conventions enforced (docs/CONVENTIONS.md)
Every new document type needs entries in: prompt module, `companyFieldMap.ts`, wizard steps, PDF renderer + DOCX builder kept in sync, exactly one disclaimer per doc footer (never AI-generated). Adding a new plan touches 9 specific locations. Roboto font mandatory (not Helvetica) for Cyrillic diacritics. TypeScript strict, no `any`. Production branch is `master`.

See also [[project_aisistent]], [[project_autofill_pipeline]] (if present) for prior narrower notes — this file supersedes them for architecture-level detail as of 2026-07-05.
