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

## /obrasci MVP — jun 2026. (pauzirano, kod u repou)

Izgrađen kompletan upload/analyze/fill flow: AcroForm PDF, DOCX, flat PDF guide.
Stranica privremeno nedostupna (`/obrasci` prikazuje "Uskoro dostupno").

**Šta radi:** AcroForm sa described poljima (privatni poslovni obrasci), DOCX sa placeholderima, flat PDF guide sa copy dugmadima.

**Fundamentalni problem:** Srpski državni obrasci (PPDG, M4, ekotaksa) koriste numeričke nazive polja (T1–T189). Vizuelna semantika nije u metapodacima — app ne razume kontekst.

**Izabrani put — geometrijsko prepoznavanje:** Azure DI `prebuilt-layout` + geometrijsko poklapanje (polje ↔ labela) + Claude semantičko mapiranje. Korak 1–4 kompletni.

## Upload & Fill — Faza 1 pipeline (jun 2026., Korak 1–4 kompletni)

Spec: `docs/obrasci/FAZA1_PREPOZNAVANJE_OBRAZACA_1.md`  
Uputstvo za skripte: `docs/obrasci/SKRIPTE_UPUTSTVO.md`

- `analyzeLayout.ts`: Azure DI `prebuilt-layout`; `DiLayoutResult` sa `lines` (novo) + `paragraphs` + `words` + `tables`
- `extractAcroFormFields.ts`: AcroForm polja sa pouzdanim brojevima strana via `widget.P()` → `pageRefMap`
- `matchFieldLabels.ts`: same-line matching via `lines` (fix za T2/T3 — paragraphs spajaju više vizuelnih redova); confidence = relativna margina (primarna) + DI word conf (sekundarna) + apsolutna dist (solo); pragovi u konstantama, kalibrisati
- Kalibracioni harness: `run-calibration-test.mjs` (DI keš, JSON + HTML overlay), `record-ground-truth.mjs` (HTTP server :7789, URL hash highlight po polju), `recalculate-thresholds.mjs` (F1 optimizacija)
- PPDG-1S (198 polja): 119 high / 79 low sa relativnom marginom umesto grube dist formule

**Sledeći koraci:**
- Korak 5: flat PDF branch (DI tables + paragraphs, bez AcroForm; test na eko-taksa)
- Korak 6: Claude semantičko mapiranje — prima samo (labela, polje) parove, nikad T1/T189 direktno
- Korak 7: UI na `/obrasci` ruti
- Korak 8: validacija na 5+ dokumenata

## Tekući razvoj
- Pregledom GitHub issues (n8n-generated od user feedbacka) određujemo prioritete
