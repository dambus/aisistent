# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 13. jul 2026. — mašina: kućna
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: baza znanja rollout — 10/22 modula gotovo, dogovorno zaustavljen

**Dogfooding krug 3 završen.** Isti pattern kao pilot (ugovor-o-radu): import `lib/knowledge/` umesto hardkodovane liste obaveznih elemenata + samoprovera sekcija na kraju prompta. Primenjeno na: `nda`, `ugovor-o-delu`, `ugovor-o-zakupu`, `ugovor-o-saradnji-zajmu`, `punomocje`, `opsti-uslovi` (samo samoprovera, nema odgovarajući topic), `resenje-godisnji-odmor`, `pravilnik-o-radu`, `obavestenje-o-promeni-uslova` — plus `ugovor-o-radu` iz prethodnog kruga = **10 od 22 tipa dokumenta**.

**Usput otkriven i popravljen sistemski bag** (isti obrazac kao BUG-043): Zod šeme u `app/api/generate/route.ts` se ručno održavaju odvojeno od `types/wizard.ts` — lako je da polje postoji u tipu/wizard-u a nedostaje iz šeme, pa se tiho briše pre `buildUserMessage`. Automatizovana Node skripta (types vs. šeme) našla 7 modula sa gapovima, uključujući **referentni pilot `ugovor-o-radu`** (otkazni rok se tiho uvek vraćao na default 15/30 dana). Sve popravljeno — skripta sad CLEAN na svih 21 tipova. Detalji: `docs/BUG_TRACKER.md` "Rešeni bugovi (jul 2026, dogfooding krug 3)".

Sve provereno: `tsc --noEmit`/`eslint` čisto na svaku izmenu. Sve komitovano i pushovano (`09357b7`, `4b253f7`, `5e667f5`, `584c15f`, `0f658ae`, `3bab2b5`, `3125fdd`, `c2600a9`).

**Dogovorno zaustavljeno ovde** — preostalih ~12 modula (poslovni-mejl, oglas-za-posao, ponuda-klijentu, odgovor-kandidatu, preporuka, opis-proizvoda, bio-o-nama, zapisnik-sastanak, faktura, putni-nalog, otpremnica, ponuda-za-radove) su čisto poslovno pisanje/kalkulacija bez pravne baze znanja — odlučeno da se NE koriste marketing/copywriting skillovi za njih (van dogovorenog obima), nastavak bi bio samo samoprovera + eventualni schema audit ako se nastavi.

## Sledeći korak

1. **Novi feature** — sesija se sad okreće sledećem featureu (TBD, videti kandidate ispod). Dogfooding rollout na preostalih ~12 modula NIJE prioritet, ali može se nastaviti isti minimalni pattern (samoprovera + Zod audit) kad bude vremena.
2. Vizuelna provera C2 upload UI-a (drag&drop) uživo u browseru — i dalje nije urađena (prenosi se iz prethodnih sesija).
3. Kandidati za sledeći feature (odluka od ranije): C1 (dvojezični ugovori), chatbot kontekstualni asistent (`docs/handover/06-*`). KPO knjiga (A2) namerno odbačena.

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Baza znanja rollout na 10/22 modula** — vidi Status iznad. Provera: `grep -l "KNOWLEDGE_TOPICS" lib/prompts/*.ts` (treba 7 fajlova: ugovor-o-radu, nda, ugovor-o-delu, ugovor-o-zakupu, ugovor-o-saradnji-zajmu, punomocje, pravilnik-o-radu).
- **BUG-046 do BUG-050 + SYS-05 rešeni** — zabrana konkurencije bez naknade (NDA, ugovor-o-delu, pravilnik-o-radu), tip_prihoda i 4 druga polja tiho brisana u ugovor-o-delu šemi, sistemski Zod gap na 7 modula (uklj. ugovor-o-radu), namena_zakupa nedostajala. Detalji: `docs/BUG_TRACKER.md`.
- **Baza znanja `lib/knowledge/` + pilot na ugovor-o-radu** (prethodna sesija) — 9 topic-a, `getKnowledgeForType()`. BUG-043/044/045 rešeni.
- **C2 Pregled ugovora — dorađen kvalitet** (guardrail, obrazložene tvrdnje, redizajniran UI).
- **Migracije `catalog_items`/`employees` primenjene na produkciju**, TipCard najave implementirane, D1 SEO na `/obrasci` live.

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
