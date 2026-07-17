# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 18. jul 2026. — mašina: kućna
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: novi feature "Test samostalnosti" implementiran i verifikovan uživo, spreman za commit/push

Milan pitao za "test samostalnosti" (čl. 85 Zakona o porezu na dohodak građana) — rizik da poreska uprava tretira paušalca/frilensera sa 1-2 strana klijenta kao primarnog izvora prihoda kao nesamostalnog (prikriveno zaposlenog), sa posledicom prekvalifikacije prihoda (20% + PIO umesto paušala). Prošli plan-mode ciklus (istražen zakon + postojeći kod preko 2 Explore agenta), odlučeno da se gradi oboje:

**Deo A — besplatan javni kviz** (`app/test-samostalnosti/page.tsx` landing + `app/(dashboard)/alati/test-samostalnosti/page.tsx` dashboard, client-only, bez AI). 9 da/ne pitanja, prag ≥5/9 → rizik. Registrovan u `lib/config/tools.ts`.

**Deo B — Pregled ugovora (Pro+) proširen 4. AI sekcijom.** Novi `lib/knowledge/test-samostalnosti.ts` + `getIndependenceTestKnowledge()` u `lib/knowledge/index.ts` (namerno IZVAN `getAllKnowledgeText()`, ubačeno u prompt samo za ugovor-o-delu/saradnji). `app/api/review-contract/route.ts` — novi Korak 4 + `test_samostalnosti` JSON polje (9 kriterijuma, "da"/"ne"/"nije_moguce_utvrditi"). `ContractReviewClient.tsx` — nova `IndependenceTestSection`.

Detalji implementacije i verifikacije: `PROGRESS.md` unos "18. jul 2026. — Test samostalnosti".

**NIJE JOŠ commitovano/pushovano** — to je sledeći korak, radi se odmah posle ovog STATE.md upisa.

## Sledeći korak

1. Commit + push izmena za "Test samostalnosti" (7 fajlova: 3 nova, 4 izmenjena — vidi `git status`).
2. Milan pregleda kviz (`/test-samostalnosti`) i prošireni Pregled ugovora uživo na produkciji nakon deploy-a — verifikacija u ovoj sesiji je rađena samo na dev serveru (localhost).
3. Razmisliti da li "Test samostalnosti" treba i social content post (po uzoru na prethodni pack) — nije traženo, samo mogućnost.
4. Nastavak baze znanja rollout-a na preostalih ~12 non-legal modula — i dalje van prioriteta, nije dogovoreno da se radi.
5. Vizuelna provera C2 upload UI-a (drag&drop) uživo u browseru — i dalje prenosi se iz više prethodnih sesija, nije urađena.
6. Chatbot MVP i C1 dvojezični ugovori — i dalje POSLE stabilne naplate (Paddle).

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Test samostalnosti (kviz + Pregled ugovora prošireno)** — vidi Status iznad. Provera: `grep -n "test-samostalnosti" lib/config/tools.ts` (3 pogotka: TOOL_CONFIG, CALCULATOR_SLUGS, HOMEPAGE_CATEGORIES), `grep -n "test_samostalnosti" app/api/review-contract/route.ts`, `npx tsc --noEmit` čisto. Uživo testirano u browseru (kviz prag 5/9, upload mock ugovora kroz Pregled ugovora → ispravan JSON i render).
- **Marketing audit fix + social content pack** (13. jul) — cenovnik/dashboard/changelog/cross-link ažurirani za Pregled ugovora i Smart Autofill, `docs/marketing/social-content-pack-2026-07-13.html` postoji.
- **Baza znanja rollout na 10/22 modula** (13. jul, jutro) — `grep -l "KNOWLEDGE_TOPICS" lib/prompts/*.ts` vraća 7 fajlova. Detalji: `docs/BUG_TRACKER.md` "dogfooding krug 3".

## Poznati blokeri (ne diraj dok se ne otključaju)

- **Paddle payment gateway** — čeka APR registraciju preduzetnika. Detalji: `docs/BACKLOG.md:52-54`
- **Politika privatnosti/Uslovi korišćenja** — čeka otvaranje firme u APR. Detalji: `docs/BACKLOG.md:55-58`
- **APR API/PIB lookup** — čeka ugovor sa APR. Detalji: `docs/BACKLOG.md:70-71`

## Pointeri za detalje (čitati SAMO po potrebi, ne unapred)

| Šta | Gde |
|---|---|
| Puna istorija sesija (arhiva, append-only) | `PROGRESS.md` |
| Backlog po prioritetu | `docs/BACKLOG.md` |
| Arhitektura/DB šema | `docs/ARCHITECTURE.md` |
| Konvencije koda | `docs/CONVENTIONS.md` |
| Poznati bugovi | `docs/BUG_TRACKER.md` |
| Brainstorm ideje za sledeći feature | `docs/handover/11-BRAINSTORM-FEATURES.md` |
| Chatbot MVP plan (čeka naplatu) | `docs/handover/06-CHATBOT-MVP.md` |
| Baza znanja — struktura i sadržaj | `lib/knowledge/index.ts` |
| Test samostalnosti — zakonski kriterijumi | `lib/knowledge/test-samostalnosti.ts` |
| Social content pack | `docs/marketing/social-content-pack-2026-07-13.html` |
| Detaljna istorija po temi | `.ai-memory/project_*.md` — samo ako STATE.md ne pokriva dovoljno |

---

## Checklist za kraj sesije (uraditi PRE zatvaranja, ne posle)

1. Prepiši sekcije "Status" / "Gotovo i verifikovano" / "Sledeći korak" iznad — overwrite, ne dodavanje na staro.
2. Svaka nova stavka u "Gotovo i verifikovano" MORA imati proverljiv trag (komanda ili grep), ne samo tvrdnju.
3. Ako je nešto veliko urađeno, dopiši kratak unos u `PROGRESS.md` (istorija) — ali STATE.md ostaje sažet, ne dupliraj prozu ovde.
4. Commit i push — sledeća sesija (druga mašina) čita ovo pre bilo čega drugog.
