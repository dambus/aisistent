# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 12. jul 2026. — mašina: kućna
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: baza znanja — faza 1 gotova, pilot potvrđen, čeka odluka o rollout-u na ostalih 16 tipova

**Baza znanja (`lib/knowledge/`) implementirana, po temi (ne po tipu dokumenta).** 9 topic-a (radni-odnosi, autorsko-pravo, ugovorna-kazna, poverljivost, zakup, zajam, punomocje, obligacije-opste, saradnja), svaki sa `pravniOsnov` + `poslednjaProvera` datum. `lib/knowledge/index.ts` — registry + `CONTRACT_TYPE_TOPICS` mapiranje tip→topic-i + `getKnowledgeForType()`/`getAllKnowledgeText()` helperi.
Stari `lib/reviewKnowledge.ts` (duplikat napravljen ranije istog dana) OBRISAN — `app/api/review-contract/route.ts` sad čita iz `lib/knowledge` preko `getAllKnowledgeText()`.
**Pilot generisanja:** `lib/prompts/ugovor-o-radu.ts` refaktorisan — hardkodovan "OBAVEZNI ELEMENTI" blok zamenjen importom `KNOWLEDGE_TOPICS['radni-odnosi']`, dodat "SAMOPROVERA PRE VRAĆANJA ODGOVORA" korak (model tiho proverava sopstveni izlaz naspram iste liste pre nego vrati odgovor — bez dodatnog API poziva).
Provera: `npx tsc --noEmit` i `eslint` čisto na sve izmenjeno/obrisano. End-to-end test generisanja ugovora o radu sa namerno unetim propustom (zabrana konkurencije bez naknade) — model je ispravno detektovao i označio `[POPUNITI: iznos naknade]` sa referencom na čl. 161 st. 2 Zakona o radu.

**Preostalo (sledeća sesija ili nastavak):**
1. Ponoviti pilot pattern na preostalih 16 `lib/prompts/*.ts` modula (jedan po jedan, ne odjednom) — zameniti hardkodovane checklist-e importom iz `lib/knowledge`, dodati samoproveru.
2. Vizuelna provera C2 upload UI-a (drag&drop) uživo u browseru — i dalje nije urađena, zahteva login kao Pro korisnik.

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Dokumentacioni/memorijski flow redizajniran** — `.ai-memory/STATE.md` (ovaj fajl) je jedini session-start read; `docs/DOCUMENTATION_MAP.md` je meta-mapa svih dokumenata (kad čitati/pisati, anti-drift pravila); `CLAUDE.md` ažuriran da upućuje na oba.
  Provera: `CLAUDE.md` sadrži "STATE.md" u sekciji "Stanje projekta".
- **DOCX vs PDF vizuelni audit** — font promenjen Times New Roman → Calibri (univerzalni sans-serif, blizu Roboto duha; puni Roboto embed nije podržan u `docx` biblioteci bez ručnog OOXML hakovanja — otvoreno za budućnost ako zatreba), AIsistent brend logo dodat kao fallback u DOCX header kad korisnik nema svoj logo. Ostali poznati DOCX bugovi (POVERLJIVO watermark, orphan headings, tabela potpisa) bili već rešeni ranije, BACKLOG.md je bio zastareo.
  Provera: `grep "Calibri" lib/pdf/docxBuilder.ts`; generisan test DOCX potvrdio Calibri u XML-u i logo u `word/media/`.
  Detalji: `docs/BACKLOG.md:64` (DOCX formatiranje stavka)
- **Migracije `catalog_items` i `employees` primenjene na produkcijsku Supabase bazu.** Katalog usluga i Sačuvani zaposleni (Pro+) rade uživo.
  Provera: `supabase migration list` treba da pokaže obe kao applied, ili SQL Editor `select * from catalog_items limit 1;` / `select * from employees limit 1;` ne baca "relation does not exist".
- **TipCard najave implementirane** za kontakte/katalog/zaposlene.
  Provera: `grep -r "TipCard" components/dashboard/` — pogodi `ContactsTab.tsx`, `CatalogTab.tsx`, `EmployeesTab.tsx`.
  Detalji: `docs/handover/05-FEATURE-NAJAVE.md:3` (status header)
- **D1 SEO nadgradnja `/obrasci`** (JSON-LD BreadcrumbList/HowTo/FAQPage, FAQ sekcije) — live, potvrđeno curl-om na produkciji.
  Detalji: `PROGRESS.md:32-38`
- **Upload & Fill feature potpuno uklonjen** (mrtav UI/API kod obrisan, ~2400 linija). Biblioteka obrazaca (Faza 4) preživela, i dalje se razvija.
  Detalji: `PROGRESS.md:36`, `docs/BACKLOG.md:151-159`

## Sledeći korak

1. Nastaviti rollout baze znanja na preostalih 16 `lib/prompts/*.ts` modula (pattern potvrđen na `ugovor-o-radu.ts` — vidi gore).
2. Vizuelna provera C2 upload UI-a uživo (drag&drop, stanja).
3. Posle toga: sledeći feature TBD. Strateška odluka ove sesije: fokus na AI-diferencirane feature (ne mehaničke/CRUD) — brand je "AIsistent", mehanika (biblioteka obrazaca, kalkulatori, CRUD tabele) ide u "održavanje, ne ekspanzija" režim. KPO knjiga za paušalce (A2) NAMERNO odbačena — konkurentska analiza pausalko.rs (1000+ korisnika, pun paušalac-ekosistem sa SEF/fiskalizacijom koju mi ne možemo lako dobiti) pokazala da bi izolovana KPO knjiga bila slaba bez tog lanca. Sledeći kandidati iz iste AI-kategorije: C1 (dvojezični ugovori), chatbot kontekstualni asistent (`docs/handover/06-*`).
Otvoreno, niži prioritet: da li ikad vredi uraditi puni Roboto font-embed u DOCX (ručni OOXML hack) — samo ako se ispostavi da Calibri nije dovoljno.

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
| Detaljna istorija po temi (kontakti/katalog/zaposleni/obrasci/chatbot) | `.ai-memory/project_*.md` — samo ako STATE.md ne pokriva dovoljno |

---

## Checklist za kraj sesije (uraditi PRE zatvaranja, ne posle)

1. Prepiši sekcije "Status" / "Gotovo i verifikovano" / "Sledeći korak" iznad — overwrite, ne dodavanje na staro.
2. Svaka nova stavka u "Gotovo i verifikovano" MORA imati proverljiv trag (komanda ili grep), ne samo tvrdnju.
3. Ako je nešto veliko urađeno, dopiši kratak unos u `PROGRESS.md` (istorija) — ali STATE.md ostaje sažet, ne dupliraj prozu ovde.
4. Commit i push — sledeća sesija (druga mašina) čita ovo pre bilo čega drugog.
