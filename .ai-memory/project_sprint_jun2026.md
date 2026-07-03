---
name: project-sprint-jun2026
description: Aktuelno stanje jun 2026 — šta je novo, šta je blokirano
metadata: 
  node_type: memory
  type: project
---

## Kompletiran jun 2026.

- Industry-based onboarding (`/onboarding/dobrodoslica`) — tier-specific flow, `lib/industryConfig.ts`, "Preporučeno za vas" sekcija na dashboardu
- Free tier ograničenja: 3 dokumenta/mesec, watermark na PDF (pdf-lib), arhiva blokirana, email blokiran, kreiranje firme blokirano
- Vokativ sistem: `lib/data/vokativ.json` (1971 ime) + `lib/utils/vocative.ts`, deterministički lookup u 7 prompt fajlova
- Agency plan + `/klijenti` dedicated stranica (grid klijenata, brzo kreiranje, dokumenti po klijentu)
- Verzionisanje dokumenata (`version` + `root_document_id`, "Nova verzija" dugme, `?from=<id>` pre-populacija)
- Proširenje profila firme: `delatnost`, `ziro_racun`, `pdv_obveznik`, `website`; companyFieldMap za 7 tipova
- Redesign CompaniesTab — Sheet forma, avatar kartice, AlertDialog za brisanje
- Ocenjivanje dokumenata: `document_ratings` tabela, thumbs up/down u DocumentPreview i ArchiveList, n8n polling via `processed` kolona
- n8n → GitHub issues: korisnikov thumbs-down kreira issue sa labelama `feedback` + `prompt-improvement`
- "Kreiraj sličan" dugme u arhivi (`?from=id&copy=1`, novi nezavisan dokument)
- Draft save u wizardu — localStorage auto-save, banner "Nastavljate gde ste stali"
- `test:doc` skripta — `npm run test:doc <type>`, generiše PDF direktno bez UI-ja (fixture podaci)
- PDF renderer serija fixeva: orphan headings, sanitizacija inputData/companyData, determinizam sekcije potpisa, strip markdown code fences iz Claude outputa

- Contextual tips sistem: `useTip` / `useFirstUnseenTip` hooks, `TipCard` / `TipSequence` komponente, localStorage persistencija, "Isključi savete" opcija u podešavanjima
- **Blog sistem (Supabase)**: `blog_posts` + `blog_keywords` tabele; `lib/blog.ts` anon client; `remark-gfm` za tabele; force-dynamic rendering; `npm run seed:blog`
- **Blog redesign**: editorial index lista, `ReadingProgressBar`, CSS drop-cap, meta pill row
- **Admin blog panel**: `/admin/blog` — toggle published/draft, brisanje; `PATCH/DELETE /api/admin/blog`
- **n8n SEO workflow (aktivan)**: Schedule → pending keyword → Claude → INSERT blog_posts (draft) → UPDATE blog_keywords → Telegram; 11 keyword redova u `blog_keywords`

## Blokirano
- Timski nalozi — čeka Paddle aktivaciju (workspace model, invite, role)
- Paddle payment gateway — čeka APR registraciju

## Faktura — međunarodno plaćanje (jun 2026.) — KOMPLETNO

- Toggle `medjunarodno_placanje` u wizardu (Izdavalac korak); conditional polja: `valuta` (EUR/USD/GBP/CHF), `iban`, `swift_bic`, `naziv_banke`
- Wizard stavke: `valuta` label dinamički ("Cena (EUR)") — sprečava zabunu sa RSD
- PDF renderer: IBAN/SWIFT "Payment details" blok; iznosi u izabranoj valuti; bilingual PDV napomena (čl.12 st.4)
- DOCX renderer: isti blok + `sr-RS` jezička oznaka (eliminiše Word crvene crte) + email/tel izdavaoca
- Bugovi koji su nađeni uz put: Agency plan nedostajao u `DOCX_PLANS` i `LOGO_PLANS`
- Root cause fix: `fakturaSchema` u `generate/route.ts` nije imao nova polja → Zod ih je strippovao → `generated_text` nije imao IBAN/SWIFT

- **"Poboljšaj dokument" AI chat**: `ImprovePanel` Sheet komponenta u `DocumentPreview`; `POST /api/improve`; rate limit (starter: 15/dan, pro/agency: 50/dan); free blokiran (403); starter UI: 3-dot brojač po sesiji (limit 3); izmena se broji čim AI vrati odgovor (`onTextUpdated` → `textSaved(false)`); panel se može zatvoriti bez blokade; floating "Sačuvaj" dugme direktno u amber banneru u `DocumentPreview`; PDF/DOCX/email disabled dok ima nesačuvanih izmena; `PATCH /api/documents/[id]` za čuvanje
- **`/arhiva/[id]`**: dedicated stranica za svaki dokument — server fetch + pun `DocumentPreview`; breadcrumb; `GET /api/documents/[id]` vraća i `generated_text`, `title`, `is_free`; `onReset` prop opcionalan; ArchiveList ima "Otvori" ikonu (external link); `/klijenti/[id]` "Otvori →" fiksiran na `/arhiva/[id]`

## DOCX audit — jun 2026. (kompletno)
- `keepNext: true` na h2/h3; chain kroz spacere; bold-only paragrafi (Član X.) — rešeni viseći naslovi
- `sanitizeGeneratedText` u `docxBuilder.ts` sinhronizovan sa `markdownParser.ts` (12 stop uslova, važi za sve tipove)
- Stop uslovi za `za stranu koja otkriva/prima`, `za prvu/drugu stranu` (sprečava dupli potpis)
- NDA DOCX: POVERLJIVO inline sa logom u headeru (tabela bez bordera, 70/30); "Sporazum potpisuju:"
- Testirano: NDA ✅, Ugovor o radu ✅

## HR i komunikacija poboljšanja — jun 2026. (kompletno)

- **poslovni-mejl**: 3 nova tipa mejla (Follow-up posle sastanka, Uvod u novu saradnju, Zahtev za referencu ili preporuku); kondicionalno polje `teme_sa_sastanka`
- **odgovor-kandidatu**: novi tip "Feedback posle intervjua"; 3 kondicionalna polja (`feedback_pozitivno`, `feedback_razlog`, `ostaje_u_bazi` toggle)
- **oglas-za-posao**: dual output LinkedIn + Infostud u jednom API pozivu; `---LINKEDIN---` / `---INFOSTUD---` separatori; tab UI u DocumentPreview; export šalje `override_text` aktivnog taba; test skripta proširena
- **obavestenje-o-promeni-uslova**: 20. tip dokumenta; čl. 172-174 ZOR; wizard 3 koraka; sve prateće izmene (route, wizard, sidebar, dashboard, companyFieldMap, reminders, documentTypes, PDF/DOCX sig)

## Sačuvani kontakti + Agency fix — jun 2026. (kompletno, migracija primenjena)

- Nova `contacts` tabela (naziv, pib, adresa, grad, zastupnik, email, telefon, ziro_racun, tip); SQL migracija primenjena na produkciji
- Plan limiti: free=0, starter=5, pro/agency=neograničeno
- `ContactsTab` u `/profil` — Sheet forma (identičan pattern kao CompaniesTab), kartice, pretraga
- `ContactSelectModal` u wizardu — pojavljuje se posle CompanySelectModal; skip ako nema kontakata
- `contactFieldMap.ts`: mapiranje za 8 tipova (faktura, otpremnica, ponuda-za-radove, ugovor-o-delu, nda, ugovor-o-zakupu, ugovor-o-saradnji-zajmu, ponuda-klijentu)
- `buildContactFields()`, `buildCompanyAsContactFields()`, `AGENCY_BILLING_TYPES`, `CONTACT_SUPPORTED_TYPES`
- `SendEmailModal` + `send-document` API ažurirani za novi Contact model
- Agency "Klijent:" dropdown — prikazuje se samo na koraku 0; za billing tipove puni primalac/naručilac polja
- **TODO**: prezentovati korisnicima — TipCard u profilu + wizardu (u backlogu)

## /obrasci Upload & Fill — Faza 2 Koraci 1–7 KOMPLETNO (1. jul 2026.)

**End-to-end flow radi u produkciji:** Upload → DI analiza → GuideView → "Popuni automatski" → PreviewView (editabilni predlozi + manual podsetnici + checkbox + download) → `/api/obrasci/generate-filled` → PDF download.

**Novi lib fajlovi:** `pdfCoordinates.ts` (DI→pdf-lib Y-flip), `transliterate.ts` (lat↔cir, detectScript), `pdfOverlay.ts` (`fillAcroFormFields` 5A + `fillTableCells` Korak 4).

**API:** `/api/obrasci/generate-filled` — AcroForm: form API + flatten (bez DI re-run); flat: DI re-run + fillTableCells; original briše se tek posle uspešnog generisanja.

**UI:** `PreviewView` (editable lista, manual sekcija, scroll-to-confirm ili checkbox), "Popuni automatski →" u GuideView.

**Potvrđeno na produkciji (PPDG-1S):** ime/PIB/mesto ✅, ćirilica ✅, potpisi prazni ✅, font 9pt konzistentan ✅, adresa sub-komponente prazne ✅.

**Poznate limitacije:**
- Telefon: T15="063" (maxLength=3 by-design), ostala composite polja su manual — ispravan behavior
- 5B slobodne linije (datum, podvlake bez AcroForm) — implementacija pauzirana dok ne stigne test obrazac
- Adresa split (ulica+broj iz jedne vrednosti) — u backlogu

**Sledeće (Korak 8):** validacija na 3+ obrazaca mešovitog tipa.

## /obrasci — Preview iframe + telefon hint + Korak 8 validacija (2. jul 2026.)

Preview PDF u iframe (`generate-filled` prima `preview: boolean`, ne briše original, `PreviewView` prikazuje pre downloada) + telefon composite UX hint (`GuideField.hint`) — na produkciji, commit `a8e5d46`.

Korak 8 validacija na 3 nova obrasca (`scripts/test-full-pipeline.ts`, novi E2E test bez UI/auth): Образац 1.pdf radi odlično (7/9 profil polja), PK2-o-z1.pdf ispravno sve manual (finansijska tabela). **Otkriven novi gap**: forme sa zaglavljem tipa "natpis ispod/pored praznog prostora, bez podvučene linije, bez tabele" (PIB/adresa/ime) su pipeline-u potpuno nevidljive — ne pojave se ni u manual listi. Korisnik odlučio da se zabeleži u backlog, ne implementira odmah. Detalji u `next_session_note.md`.

**Nastavak iste teme (2. jul, druga sesija):** email/website transliteracija bug fix (commit `d1b9d9c`) — `toDocumentScript` je slepo transliterisao email adrese na ćirilicu, sad ima `isNonTransliterable()` guard. Korak 8 validacija na dodatnih 6 obrazaca — otkriven **noviji, ozbiljniji bug**: kad prazne ćelije u različitim redovima dele identičan label (npr. "11. Матични број"), pipeline upisuje istu vrednost DVAPUT, vizuelno razbija PDF (potvrđeno slikom). Composite-dedup u di-analyze/route.ts hvata samo isti red, ne isti label kroz redove. Zabeleženo u backlog, nije implementiran fix. Instaliran `pymupdf` lokalno za vizuelnu proveru (`pdftoppm` nije dostupan). Detalji u `next_session_note.md`.

## /obrasci Upload & Fill — Faza 1 Korak 1–7 KOMPLETNO (jul 2026.)

Stranica aktivna u produkciji. Azure DI ključevi u Vercel env vars.

**Pipeline:**
- Korak 1–4 (jun): `analyzeLayout.ts`, `extractAcroFormFields.ts`, `matchFieldLabels.ts`, kalibracioni harness
- Korak 5 (jul): `extractFlatPdfFields.ts` — flat PDF: prazne table-ćelije, selection marks, podvlake
- Korak 6 (jul): `semanticMapper.ts` — Claude mapira labele na 13 profil ključeva; null-label → null bez API poziva; STOP checkpoint prošao (PPDG-1S: 7 mapiranih, 191 manual, T1=isInternal)
- Korak 7 (jul): `GuideView` sa 3 eksplicitna stanja — high (zeleno), low (narandžasto), manual (sivo); `/api/obrasci/di-analyze` endpoint; ObraściClient ruting (PDF→DI, DOCX→stari wizard)
- Bug fix: `semanticMapper.ts` stripa markdown code block iz Claude odgovora pre `JSON.parse`

**Label matching bugfix (1. jul, sesija 2):** 3 nova patterna — commit `f2ae22f`
- Checkbox labela desno: same-line right fallback (0.5" radijus, low conf)
- Textarea vizuelno iznad: polja h>0.5" traže paragrafe sa manjim Y, do 2.0"
- Table external DI line: `extractFlatPdfFields.ts` — kad sve ćelije u redu prazne, traži DI line van tabele
- Testirano na 5 novih obrazaca: 0 bez-labele na svim parsabilnim (Dodatak_15: 4→0, JRPPS: 16→0)

**Korak 8 (sledeće):** Validacija na 5+ obrazaca — PPDG-1S, Dodatak_15, JRPPS, PPI-2, 3040. Tb1-Tb4 checkbox labele desno su pokrivene novim fix-om.

## /obrasci — Faza 3 Koraci 1-4: template keš + SectionWizardView (2. jul 2026., treća sesija)

Rad po `docs/obrasci/FAZA3_WIZARD_TEMPLATE_BAZA_1.md` + `FAZA3_IMPLEMENTACIJA_UPUTSTVO.md`, korak-po-korak sa STOP checkpoint-ima (dokumenti su prosleđeni od korisnika u ovoj sesiji).

- **Korak 1** (`7e4d288`): `form_templates` tabela (RLS bez policy, service-role only) + `increment_form_template_hit` RPC, migracija na produkciji. `computeFingerprint.ts` (sha256 na pageCount+prvih500karaktera prve strane+acroFormFieldCount), `templateCache.ts` — **još nije povezan u pipeline** (Korak 5)
- **Korak 2** (`853a8db`): `detectSections.ts` — DI role signal ili 2/3 heuristika (caps/dužina/bold). Sekcija ide Claude-u kao dodatni prompt kontekst. 19 sekcija na PPDG-1S
- **Korak 3** (`8f17f3f`, `a7f8347`): `SectionWizardView.tsx` (NE `WizardView.tsx` — taj je zauzet starim DOCX wizard-om). Mobilna nav: dropdown ne tab bar (testirano na 19 sekcija). Review pre integracije: preimenovano dugme "Generiši PDF"→"Pregledaj i preuzmi", dodata non-blocking napomena o nepregledanim sekcijama
- **Korak 4** (`2c42ead`): integracija u `ObraściClient.tsx`/`GuideView.tsx`. Dva bagfixa nađena pre-integration code review-om (korisnik tražio proveru shape-a fields↔sections): state manual→low flip kad korisnik upiše vrednost (inače se tiho gubi), onBack nosi vrednosti nazad. E2E potvrđeno na pravim PPDG-1S podacima

**Preostalo:** Korak 5 (template keš u pipeline — pažnja: keš čuva SAMO strukturu, suggestedValue mora ostati svež po korisniku čak i na cache hit), Korak 6 (template_feedback — treba nova migracija, ne postoji još), Korak 7 (validacija 3+ obrazaca). Detalji u `next_session_note.md`.

## /obrasci — Faza 3 Koraci 5-7: keš live, feedback, validacija (3. jul 2026.) — FAZA 3 KOMPLETNA

- **Korak 5** (`80feefd`): keš integrisan u `di-analyze` — fingerprint (DI prva strana) → HIT preskače pun DI + Claude (113ms vs 40s na PPDG-1S), `suggestedValue` UVEK svež iz profila trenutnog korisnika (`rehydrateFields` + eksportovan `profileValue`); MISS čuva samo strukturu. Keš greška nikad ne obara zahtev. Response nosi `fingerprint` + `cached`.
- **Korak 6** (`80feefd`): migracija `20260703000001` (template_feedback + needs_review) primenjena na produkciju (Milan, SQL editor); endpoint `/api/obrasci/template-feedback` (samo negativan, 3+ → needs_review); 👍/👎 u PreviewView.
- **Korak 7**: validacija lokalno na PPDG-1S (acroform), Обrazac 1 eko taksa (flat), PPI-2 (flat, 0 auto = ispravno — traži podatke o nepokretnosti). Nova `--fill-manual` opcija u test-full-pipeline simulira wizard unos. 2 mapper bagfixa: numeričke labele → null deterministički (sekcija navodila Claude-a da pogađa "1." → ziro_racun), prompt pravilo 8 za "Шифра" sub-komponentu delatnosti.
- **Test alat:** `scripts/test-template-cache.ts` — determinizam, leak check, HIT/MISS identičnost, hit_count, svež profil za drugi nalog.
- **ČEKA verifikaciju na produkciji** (Supabase tehnički problemi tokom sesije): dupli upload → brži drugi, hit_count, feedback tok. Detalji u `next_session_note.md`.

## Tekući razvoj
- Pregledom GitHub issues (n8n-generated od user feedbacka) određujemo prioritete
