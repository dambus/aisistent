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

## Tekući razvoj
- Pregledom GitHub issues (n8n-generated od user feedbacka) određujemo prioritete
