# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 11. avgust 2026.
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: dva paralelna traka — marketing content pipeline (n8n, aktivan) + deklinacija rollout (pauziran)

### Trak A — Marketing content pipeline (n8n + Supabase + fal.ai + Zernio), 10-11. avgust

Faza 2 automatizacije bloga/LinkedIn/Instagram-a. Puni log: `docs/handover/2026-08-10-marketing-content-pipeline.md` (**untracked u gitu do ove sesije**).

**Urađeno (živo, van ovog repoa — n8n workflow `QeNEPp3XlJlm6uBB` + Supabase projekat `aisistent`):**
- Nova Supabase tabela `content_items` (zamenjuje `blog_keywords`), 25 novih tema dodato u backlog (30 pending, 6 done).
- QA korak sad **direktno ispravlja** tekst (gramatika/pravopis/anglicizmi/homoglifi), ne samo prijavljuje — LinkedIn prompt repointovan da čita ispravljenu verziju.
- Marker-based response format (`<<<SADRZAJ>>>` i sl.) umesto JSON-escaping — eliminisan povremeni JSON parse crash na dugom tekstu.
- Instagram grana: fal.ai image generacija + Zernio draft publish. Model promenjen sa `flux/dev` (necitljiv tekst na slici) na `bytedance/seedream/v5/pro/text-to-image` — potvrđeno vizuelno identično Milanovim ručno objavljenim postovima.
- End-to-end uživo potvrđeno: izvršenje #179 (pun lanac), #189/#190 (QA auto-fix + marker format).

**NIJE urađeno:**
- Formalna potvrda da je "još jedan pun test sa produženim Seedream wait-om" ponovljen posle poslednje izmene (vidi handover, sekcija "Sledeće").
- Reddit kanal ostaje blokiran (Responsible Builder Policy registracija).

### Trak B — Gramatička regresija (deklinacija), 7. avgust — pauzirano, nije zaboravljeno

Zadatak 0-2 gotovi i pushovani (commits `3e2e473`, `b08a16a`, `620befc`). Nepromenjeno od prošle sesije:
- Deterministički `lib/declension/decline()` modul + 98/98 regresioni test (`npm run test:declension-module`).
- Pilot tool-use integracija SAMO u `ugovor-o-radu` (`app/api/generate/route.ts`).
- Rollout na preostalih 19 tipova dokumenta **NIJE** rađen ove sesije (10-11. avgust) — fokus je bio na marketing pipeline-u.
- Zadatak 3 iz `CLAUDE_CODE_BRIEF_gramatika.md` (referentni dokument + checklist pre objave) i dalje nije započet.

## Sledeći korak

1. Marketing pipeline: ponoviti pun end-to-end test sa Seedream modelom da se potvrdi ceo lanac posle poslednje izmene wait-a.
2. Deklinacija: nastaviti rollout `lib/declension/` na preostalih 19 tipova dokumenta (helper već generički, vidi `docs/BACKLOG.md`) — ILI Zadatak 3 (referentni dokument + checklist), koji god Milan prioritetizuje.
3. Milan pregleda deklinacioni pilot uživo/na produkciji (i dalje nije rađeno — testirano samo skriptom van HTTP rute).

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Marketing content pipeline Faza 2** (10-11. avgust) — vidi Trak A iznad. Provera: n8n izvršenja #179, #189, #190 (status success), Zernio draft-ovi kreirani, `content_items` tabela u Supabase ažurna.
- **Deklinacioni modul + regresioni testovi** (7. avgust) — vidi Trak B iznad. Provera: `npm run test:declension-module` (98/98, ~150ms), `npx tsc --noEmit -p tsconfig.json` čisto.
- **Test samostalnosti (kviz + Pregled ugovora prošireno)** (18. jul) — `grep -n "test-samostalnosti" lib/config/tools.ts` (3 pogotka), `grep -n "test_samostalnosti" app/api/review-contract/route.ts`.

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
