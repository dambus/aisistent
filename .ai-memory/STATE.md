# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 12. jul 2026. (veče) — mašina: kućna
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: baza znanja — pilot na ugovor-o-radu kompletan i dogovorno zaustavljen, nastavak veče/sledeća sesija

**Baza znanja (`lib/knowledge/`) implementirana, po temi.** 9 topic-a (radni-odnosi, autorsko-pravo, ugovorna-kazna, poverljivost, zakup, zajam, punomocje, obligacije-opste, saradnja). `lib/knowledge/index.ts` — registry + `CONTRACT_TYPE_TOPICS` + `getKnowledgeForType()`/`getAllKnowledgeText()`. Koristi je i C2 (`app/api/review-contract/route.ts`) i generisanje (pilot: `lib/prompts/ugovor-o-radu.ts`).

**Pilot na `ugovor-o-radu.ts` prošao kroz DVA kruga stvarnog dogfooding testa** (Milan generisao ugovor na dev serveru → pustio kroz C2 pregled → nalazi vraćeni u generator):
- Krug 1: dodata samoprovera + import baze znanja umesto hardkodovanog checklist-a → otkrio **BUG-043** (kritičan, nepovezan sa knowledge radom): `naknada_zabrana` polje falilo u Zod šemi `app/api/generate/route.ts`, tiho se brisalo, uvek `[POPUNITI]` bez obzira na wizard unos. Popravljeno.
- Krug 2 (posle fix-a): nov test otkrio 3 kvalitativna nalaza — premeštaj klauzula bez zakonskog roka (**BUG-044**, popravljeno: limit 60 radnih dana), poslovna tajna bez izuzetaka (**BUG-045**, popravljeno: dodat stav o izuzecima), hibridni rad bez konkretnog broja dana jer wizard nije ni prikupljao taj podatak (popravljeno: novo opciono polje `dana_kancelarija`).

Sve provereno: `tsc --noEmit`/`eslint` čisto na svaku izmenu, stvaran Claude API poziv posle svakog fix-a potvrdio ispravku u istom generisanom tekstu (ne samo teorijski). Sve komitovano i pushovano (`901afd9`, `ca5da05`, `ebfba5c`, `4aa584e`).

**Dogovoreno zaustavljanje ovde — Milan nastavlja veče, ne nova sesija nužno.**

## Sledeći korak

1. **Nastaviti isti dogfooding pattern** (generiši → pusti kroz C2 → vrati nalaze u prompt) na preostalih 16 `lib/prompts/*.ts` modula, jedan po jedan. `ugovor-o-radu.ts` je referentni primer kako izgleda ceo krug (baza znanja import + samoprovera + Zod schema provera + realan test).
2. Kad se rollout završi ili stane: vizuelna provera C2 upload UI-a (drag&drop) uživo u browseru — i dalje nije urađena.
3. Posle toga: sledeći feature TBD. Kandidati iz AI-diferenciranog fokusa (odluka od ranije istog dana): C1 (dvojezični ugovori), chatbot kontekstualni asistent (`docs/handover/06-*`). KPO knjiga (A2) namerno odbačena — vidi `docs/handover/11-BRAINSTORM-FEATURES.md`.

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Baza znanja `lib/knowledge/` + pilot na ugovor-o-radu** — vidi Status iznad. Provera: `ls lib/knowledge/`, `grep "KNOWLEDGE_TOPICS" lib/prompts/ugovor-o-radu.ts`.
- **BUG-043/044/045 rešeni** (naknada zabrane konkurencije, premeštaj bez limita, poslovna tajna bez izuzetaka) — `docs/BUG_TRACKER.md` "Rešeni bugovi (jul 2026, nastavak)".
- **C2 Pregled ugovora — dorađen kvalitet** (guardrail za van-domena upload, obrazložene tvrdnje, redizajniran UI). Provera: `lib/reviewKnowledge.ts` NE postoji (obrisan, zamenjen `lib/knowledge/`).
- **Dokumentacioni/memorijski flow redizajniran** — `.ai-memory/STATE.md` (ovaj fajl) jedini session-start read; `docs/DOCUMENTATION_MAP.md` meta-mapa; `CLAUDE.md` upućuje na oba.
- **DOCX vs PDF vizuelni audit** — font Calibri, AIsistent brend logo fallback u DOCX headeru. Detalji: `docs/BACKLOG.md:64`.
- **Migracije `catalog_items`/`employees` primenjene na produkciju**, TipCard najave implementirane, D1 SEO na `/obrasci` live, Upload & Fill uklonjen. Detalji: `PROGRESS.md`.

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
| Baza znanja — struktura i sadržaj | `lib/knowledge/index.ts` |
| Detaljna istorija po temi (kontakti/katalog/zaposleni/obrasci/chatbot) | `.ai-memory/project_*.md` — samo ako STATE.md ne pokriva dovoljno |

---

## Checklist za kraj sesije (uraditi PRE zatvaranja, ne posle)

1. Prepiši sekcije "Status" / "Gotovo i verifikovano" / "Sledeći korak" iznad — overwrite, ne dodavanje na staro.
2. Svaka nova stavka u "Gotovo i verifikovano" MORA imati proverljiv trag (komanda ili grep), ne samo tvrdnju.
3. Ako je nešto veliko urađeno, dopiši kratak unos u `PROGRESS.md` (istorija) — ali STATE.md ostaje sažet, ne dupliraj prozu ovde.
4. Commit i push — sledeća sesija (druga mašina) čita ovo pre bilo čega drugog.
