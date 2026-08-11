# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 11. avgust 2026.
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: nezavisan QA/lektor korak za dokumente — GOTOV, uživo verifikovano, commitovano

Novi drugi LLM poziv posle generisanja dokumenta (svež kontekst, ne unutar istog poziva kao
"samoprovera") — ista slabost dokazana na paralelnom marketing pipeline-u (homoglif propušten u
istom prolazu) prenesena na core generisanje. Plan: `C:\Users\Milan\.claude\plans\shiny-gathering-horizon.md`.

**Napisano, offline i uživo verifikovano (11. avgust, ova sesija):**
- `lib/qa/review.ts` — `runQaReview()` (jedan Claude poziv, ne tool-use) + `parseQaResponse()`
  (marker-split `<<<DOKUMENT>>>`, JSON header za `fixed`/`needs_review`, fallback regex + fail-safe
  ako marker nedostaje — isti obrazac kao n8n marketing pipeline).
- `app/api/generate/route.ts` — QA poziv posle glavne generacije, blocking (await pre insert),
  fail-open na grešku (dokument se ipak isporučuje, samo flagovan). Segmentacija: `FULL_QA_TYPES`
  (10 tipova sa postojećom SAMOPROVERA sekcijom) vs "light" (ostalih 8 LLM tipova) vs skip (4
  non-LLM tipa: faktura/putni-nalog/otpremnica/ponuda-za-radove).
- `supabase/migrations/20260811000001_add_documents_qa_fields.sql` — **PRIMENJENO na produkcionu
  bazu** (`dgsuspjxegciwlzqpzxn`, preko `apply_migration`, `success: true`). Kolone `qa_fixed`,
  `qa_needs_review` (jsonb) postoje na `documents` tabeli.
- `types/database.ts`, `docs/ARCHITECTURE.md` — ažurirani da prate novu šemu.
- Testovi: `npm run test:qa-review` (5/5, novi, offline parsing testovi), `npm run
  test:declension-module` (98/98, i dalje prolazi), `npx tsc --noEmit -p tsconfig.json` čisto,
  `npx eslint app/api/generate/route.ts lib/qa/review.ts tests/qa-review.test.ts` čisto.

- **Live test potvrđen** (Milan, kroz wizard) — `ugovor-o-radu` (full QA + declension tool pilot
  zajedno), PDF pregledan: padeži tačni kroz ceo dokument (npr. žensko ime "Milena Grudović"
  ispravno deklinovano svuda — "sa Zaposlenom", "Zaposlena obavlja"...), nema homoglifa, QA i
  declension tool ne sudaraju se. Sitna kozmetička nedoslednost primećena (header "ZAPOSLENI"
  umesto "ZAPOSLENA" — fiksna labela u template-u, ne QA/declension bug) — nije blokirajuće,
  nije fixovano ove sesije (nizak prioritet, kozmetika).

**UI indikator — GOTOV (11. avgust, isti dan, Milanov zahtev posle live testa backend-a).**
`components/wizard/DocumentPreview.tsx` — kompaktan status (crveni banner za needs_review, uvek
otvoren; zeleni expandable red za fixed; tiha potvrda kad nema nalaza), provučen kroz
`WizardForm` → `WizardPageClient` iz API response-a, i kroz `app/(dashboard)/arhiva/[id]/page.tsx`
iz baze (arhivirani dokumenti). tsc/eslint čisto (eslint 3 pre-existing greške potvrđene
`git stash` diff-om, nisu uvedene ovom izmenom). **Nije lično vizuelno potvrđeno u browseru ove
sesije** — sopstveni dev server pokušaj je otkrio Milanov već pokrenut dev server (PID 40404),
nije ga dirao. Milan treba da baci pogled kad testira `light` mode.

**NIJE urađeno:**
- `light` mode (8 tipova) nije posebno live testiran ove sesije (samo `full` mode na
  `ugovor-o-radu`) — funkcionalno isti kod path, nizak rizik, ali nema uživo potvrdu. UI indikator
  takođe čeka Milanovu vizuelnu potvrdu (vidi iznad).

## Status (prethodno, i dalje tačno): gramatička regresija — Zadatak 3 gotov (jezička/zakonska referenca + checklist)

### Marketing content pipeline (n8n + Supabase + fal.ai + Zernio) — Milanova zasebna grana, VAN ovog repoa/Claude Code od 11. avgusta

Faza 2 automatizacije bloga/LinkedIn/Instagram-a, 10-11. avgust. Puni log:
`docs/handover/2026-08-10-marketing-content-pipeline.md` (commitovan). **Ovaj repo/Claude Code
više ne dira taj rad** — Milan ga nastavlja u Claude Desktop-u. Sažetak zbog konteksta:

**Urađeno (živo, van ovog repoa — n8n workflow `QeNEPp3XlJlm6uBB` + Supabase projekat `aisistent`):**
- Nova Supabase tabela `content_items` (zamenjuje `blog_keywords`), 25 novih tema dodato u backlog (30 pending, 6 done).
- QA korak sad **direktno ispravlja** tekst (gramatika/pravopis/anglicizmi/homoglifi), ne samo prijavljuje — LinkedIn prompt repointovan da čita ispravljenu verziju.
- Marker-based response format (`<<<SADRZAJ>>>` i sl.) umesto JSON-escaping — eliminisan povremeni JSON parse crash na dugom tekstu.
- Instagram grana: fal.ai image generacija + Zernio draft publish. Model promenjen sa `flux/dev` (necitljiv tekst na slici) na `bytedance/seedream/v5/pro/text-to-image` — potvrđeno vizuelno identično Milanovim ručno objavljenim postovima.
- End-to-end uživo potvrđeno: izvršenje #179 (pun lanac), #189/#190 (QA auto-fix + marker format).

**NIJE urađeno:**
- Formalna potvrda da je "još jedan pun test sa produženim Seedream wait-om" ponovljen posle poslednje izmene (vidi handover, sekcija "Sledeće").
- Reddit kanal ostaje blokiran (Responsible Builder Policy registracija).

### Gramatička regresija (deklinacija + Zadatak 3), 7-11. avgust

Zadatak 0-2 gotovi i pushovani (commits `3e2e473`, `b08a16a`, `620befc`), nepromenjeno od prošle sesije:
- Deterministički `lib/declension/decline()` modul + 98/98 regresioni test (`npm run test:declension-module`).
- Pilot tool-use integracija SAMO u `ugovor-o-radu` (`app/api/generate/route.ts`).
- Rollout na preostalih 19 tipova dokumenta i dalje NIJE rađen.

**Zadatak 3 — GOTOV (11. avgust, ova sesija).** `docs/serbian-language-facts.md` — referentni
dokument (padeži, zakonske reference po tipu) + checklist pre objave javnog sadržaja. Primenjen
retroaktivno na `docs/marketing/` i `content/blog/`, uhvatio 2 nove greške:
- `docs/marketing/social-content-pack-2026-07-13.html:442` — isti "šest padeža" bug kao BUG-051,
  drugi fajl, propušten u prvom prolazu. Ispravljeno (BUG-052).
- `content/blog/ugovor-o-delu-vs-ugovor-o-radu.md:48` — pogrešan broj člana zakona ("član 31."
  netačan za taj princip). Broj uklonjen, princip ostaje (BUG-053).
- Opcioni deo (Claude skill "srpski-lektor" za auto-sken draftova) **NIJE** rađen.

**NAPOMENA:** `docs/serbian-language-facts.md` i dalje treba ručno uključiti u n8n promptove
(Milan, van ovog repoa) da bi checklist stvarno sprečavao greške pre generisanja, ne samo posle.

## Sledeći korak

1. Milan: vizuelno potvrditi QA UI indikator (`DocumentPreview.tsx`) na svom dev serveru + live test `light` mode tipa (npr. `poslovni-mejl`) — oboje nije lično viđeno/testirano ove sesije od strane Claude Code-a.
2. Deklinacija: nastaviti rollout `lib/declension/` na preostalih 19 tipova dokumenta (helper već generički, vidi `docs/BACKLOG.md`).
3. Opciono: Claude skill "srpski-lektor" (Zadatak 3, opcioni deo) — auto-sken draftova pre objave.
4. Marketing pipeline (n8n) — van obima ovog repoa/Claude Code sesija, Milan radi zasebno.

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Nezavisan QA/lektor korak + UI indikator** (11. avgust) — vidi sekciju iznad. Provera: `npm run test:qa-review` (5/5), `npm run test:declension-module` (98/98), `npx tsc --noEmit` čisto, live PDF pregledan (ugovor-o-radu, `full` mode). Commits `3362177` (backend), `0724089` (UI).
- **Zadatak 3 — jezička/zakonska referenca + checklist** (11. avgust) — vidi sekciju iznad. Provera: `docs/serbian-language-facts.md` postoji, `docs/BUG_TRACKER.md` BUG-052/BUG-053/ZADATAK-3 unosi.
- **Deklinacioni modul + regresioni testovi** (7. avgust) — vidi sekciju iznad. Provera: `npm run test:declension-module` (98/98, ~150ms), `npx tsc --noEmit -p tsconfig.json` čisto.
- **Test samostalnosti (kviz + Pregled ugovora prošireno)** (18. jul) — `grep -n "test-samostalnosti" lib/config/tools.ts` (3 pogotka), `grep -n "test_samostalnosti" app/api/review-contract/route.ts`.
- **Marketing content pipeline Faza 2** (10-11. avgust, n8n) — Milanova posebna grana od ove sesije nadalje, log u `docs/handover/2026-08-10-marketing-content-pipeline.md`.

## Poznati blokeri (ne diraj dok se ne otključaju)

- **Paddle payment gateway** — čeka APR registraciju preduzetnika. Detalji: `docs/BACKLOG.md:48-50`
- **Politika privatnosti/Uslovi korišćenja** — čeka otvaranje firme u APR. Detalji: `docs/BACKLOG.md:51-54`
- **APR API/PIB lookup** — čeka ugovor sa APR. Detalji: `docs/BACKLOG.md:62-63`

## Pointeri za detalje (čitati SAMO po potrebi, ne unapred)

| Šta | Gde |
|---|---|
| Gramatički brief (3 zadatka) | `CLAUDE_CODE_BRIEF_gramatika.md` (root repoa) |
| Deklinacioni modul | `lib/declension/` — `decline(tekst, rod, padez, {type})` |
| Marketing content pipeline (n8n) — pun log izmena | `docs/handover/2026-08-10-marketing-content-pipeline.md` |
| Puna istorija sesija (arhiva, append-only) | `PROGRESS.md` |
| Backlog po prioritetu | `docs/BACKLOG.md` |
| Poznati bugovi | `docs/BUG_TRACKER.md` (BUG-051, SYS-06 — najnoviji) |
| Arhitektura/DB šema | `docs/ARCHITECTURE.md` |
| Konvencije koda | `docs/CONVENTIONS.md` |
| Brainstorm ideje za sledeći feature | `docs/handover/11-BRAINSTORM-FEATURES.md` |
| Chatbot MVP plan (čeka naplatu) | `docs/handover/06-CHATBOT-MVP.md` |
| Baza znanja — struktura i sadržaj | `lib/knowledge/index.ts` |
| Detaljna istorija po temi | `.ai-memory/project_*.md` — samo ako STATE.md ne pokriva dovoljno |

---

## Checklist za kraj sesije (uraditi PRE zatvaranja, ne posle)

1. Prepiši sekcije "Status" / "Gotovo i verifikovano" / "Sledeći korak" iznad — overwrite, ne dodavanje na staro.
2. Svaka nova stavka u "Gotovo i verifikovano" MORA imati proverljiv trag (komanda ili grep), ne samo tvrdnju.
3. Ako je nešto veliko urađeno, dopiši kratak unos u `PROGRESS.md` (istorija) — ali STATE.md ostaje sažet, ne dupliraj prozu ovde.
4. Commit i push — sledeća sesija (druga mašina) čita ovo pre bilo čega drugog.
