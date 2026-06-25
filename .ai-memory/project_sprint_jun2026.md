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

## Tekući razvoj
- Pregledom GitHub issues (n8n-generated od user feedbacka) određujemo prioritete
