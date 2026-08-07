# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 7. avgust 2026. — mašina: kućna
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: gramatička regresija (deklinacija) — Zadatak 0-2 gotovi (pilot obim), commit+push urađen

Povod: Milan otkrio da Instagram launch pack tvrdi "šest padeža" umesto sedam — u postu koji baš deklinaciju reklamira kao diferencijaciju naspram ChatGPT-a. Doneo `CLAUDE_CODE_BRIEF_gramatika.md` (root repoa) sa 3 zadatka. Detaljan opis: `PROGRESS.md` unos "7. avgust 2026."

**Urađeno i pushovano (commits `3e2e473`, `b08a16a`):**
- Marketing fix: "šest" → "sedam" padeža u `docs/marketing/instagram-launch-pack-2026-08-03.html`.
- Zadatak 0 (audit): pipeline (`app/api/generate/route.ts`) je oslanjao punu deklinaciju isključivo na slobodnu LLM generaciju, nula automatskih testova gramatike. Postojao samo vokativ (`lib/utils/vokativ.ts`) + detekcija roda kao pomoćni slojevi.
- Zadatak 1: `tests/fixtures/declension-fixture.ts` (98 primera) + `tests/declension.test.ts` (pravi Claude API, `npm run test:declension`, ~7-9s, košta). Potvrđeno da hvata regresiju.
- Zadatak 2: `lib/declension/` — deterministički `decline()` modul (imena/firme/iznosi, rečnik izuzetaka). `tests/declension-module.test.ts` — isti fixture 100%, besplatno, ~150ms (`npm run test:declension-module`). Pilot integracija (tool-use loop, `lib/declension/tool.ts`) ugrađena u `route.ts` SAMO za `ugovor-o-radu`, verifikovana uživo protiv pravog API-ja.

**NIJE urađeno:**
- Rollout integracije na preostalih 19 tipova dokumenta (i dalje slobodna LLM generacija bez determinizma za njih).
- Zadatak 3 iz brief-a (referentni dokument + checklist za proveru javnog sadržaja pre objave) — nije ni započeto.
- Repo i dalje nema CI ni pre-commit hook (namerna odluka — testovi se pokreću ručno za sada).

## Sledeći korak

1. Nastaviti rollout `lib/declension/` tool-use integracije na preostalih 19 tipova dokumenta (helper je već generički, vidi `docs/BACKLOG.md`).
2. Zadatak 3 — referentni dokument sa proverenim jezičkim/zakonskim činjenicama + checklist pre objave javnog sadržaja.
3. Milan pregleda kod uživo/na produkciji (ova sesija je tool-use loop testirala samo skriptom van HTTP rute, ne kroz stvarni wizard flow u browseru).
4. Test samostalnosti (18. jul) i marketing audit (13. jul) — stariji završeni radovi, već na produkciji, ništa aktivno.

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Deklinacioni modul + regresioni testovi** (7. avgust) — vidi Status iznad. Provera: `npm run test:declension-module` (98/98, ~150ms), `npx tsc --noEmit -p tsconfig.json` čisto.
- **Test samostalnosti (kviz + Pregled ugovora prošireno)** (18. jul) — `grep -n "test-samostalnosti" lib/config/tools.ts` (3 pogotka), `grep -n "test_samostalnosti" app/api/review-contract/route.ts`.
- **Marketing audit fix + social content pack** (13. jul) — cenovnik/dashboard/changelog/cross-link ažurirani za Pregled ugovora i Smart Autofill.

## Poznati blokeri (ne diraj dok se ne otključaju)

- **Paddle payment gateway** — čeka APR registraciju preduzetnika. Detalji: `docs/BACKLOG.md:48-50`
- **Politika privatnosti/Uslovi korišćenja** — čeka otvaranje firme u APR. Detalji: `docs/BACKLOG.md:51-54`
- **APR API/PIB lookup** — čeka ugovor sa APR. Detalji: `docs/BACKLOG.md:62-63`

## Pointeri za detalje (čitati SAMO po potrebi, ne unapred)

| Šta | Gde |
|---|---|
| Gramatički brief (3 zadatka) | `CLAUDE_CODE_BRIEF_gramatika.md` (root repoa) |
| Deklinacioni modul | `lib/declension/` — `decline(tekst, rod, padez, {type})` |
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
