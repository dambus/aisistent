# STATE — trenutno stanje projekta

*Ovo je JEDINI fajl koji treba pročitati na početku sesije. Sve ostalo (PROGRESS.md, BACKLOG.md, handover/, .ai-memory/*) čita se SAMO preko pointera ispod, kad zatreba detalj — ne unapred.*

**Poslednja izmena:** 13. jul 2026. (popodne) — mašina: kućna
**Overwrite, ne append.** Svaka sesija prepisuje ovaj fajl pre zatvaranja (vidi checklist na dnu).

---

## Status: dogfooding baza znanja pauzirana, sesija skrenula na marketing — cenovnik/dashboard/changelog fixevi + social content pack

**Deo 1 (jutro): baza znanja rollout** — 10/22 modula gotovo (vidi commit `18eb556` i unazad). Dogovorno zaustavljeno, prelazak na marketing.

**Deo 2 (popodne): marketing audit + fix.** Milan tražio proveru da li su feature-i pravilno oglašeni (landing/tipcards/novosti) + par social postova. Explore agent uradio audit — glavni nalaz: **Pregled ugovora** (najnoviji AI feature, Pro+) bio praktično nevidljiv svuda. Popravljeno (commit `caedaa9`):
- Cenovnik (`app/page.tsx` `getPricing()`): Pro/Agency kartice sad navode Pregled ugovora i Smart Autofill kao razlog za nadogradnju.
- Dashboard: nov `TipSequence` unos `dashboard-pregled-ugovora`.
- Changelog bell (`lib/changelog.ts`): 2 nova unosa (Pregled ugovora, Smart Autofill).
- `/obrasci/[slug]` keyword cross-link: 3 nova para (punomoćje, zakup, NDA).
- 6 ugovornih landing stranica dobile link ka `/pregled-ugovora` u `relatedLinks` (mehanizam već postojao — audit agent je pogrešno prijavio da ne postoji, provereno i ispravljeno pre fix-a).

**Social content pack:** 4 posta (LinkedIn + Instagram varijante + grafika) za Pregled ugovora, Biblioteku obrazaca, srpske padeže (diferencijacija od ChatGPT-a), Smart Autofill. Sačuvano u repo-u: `docs/marketing/social-content-pack-2026-07-13.html` (self-contained HTML, otvoriti u browseru, dugme "Kopiraj" po tekstu, grafike 4:5 spremne za screenshot). Fal.ai NIJE dostupan kao alat u ovoj sesiji — grafike napravljene kao HTML/CSS karte (brend zelena + rust akcenat, "službeni formular" motiv), ne kroz eksterni image generator.

**NIJE commitovano/pushovano jos** — ovo je zadnji korak pre kraja sesije, radi se odmah posle ovog STATE.md upisa.

## Sledeći korak

1. Milan pregleda `docs/marketing/social-content-pack-2026-07-13.html`, odluči da li menja ton/tekst/broj postova pre objave na LinkedIn/Instagram.
2. Nastavak baze znanja rollout-a na preostalih ~12 non-legal modula (SAMO ako se odluči — dogovoreno da nije prioritet, van dogovorenog obima da se koriste marketing/copywriting skillovi za njih).
3. Vizuelna provera C2 upload UI-a (drag&drop) uživo u browseru — i dalje nije urađena (prenosi se iz više prethodnih sesija).
4. Chatbot MVP (`docs/handover/06-CHATBOT-MVP.md`) i C1 dvojezični ugovori — dogovoreno da idu POSLE stabilne naplate (Paddle), ne sad.

## Gotovo i verifikovano (poslednje 1-2 sesije)

- **Marketing audit fix** — vidi Status iznad. Provera: `grep -n "Pregled ugovora" app/page.tsx` (cenovnik), `grep -n "dashboard-pregled-ugovora" "app/(dashboard)/dashboard/page.tsx"`, `grep -c "id:" lib/changelog.ts` (6 unosa).
- **Social content pack** — `docs/marketing/social-content-pack-2026-07-13.html` postoji i otvara se u browseru (self-contained, bez zavisnosti).
- **Baza znanja rollout na 10/22 modula** (jutrošnji deo sesije) — `grep -l "KNOWLEDGE_TOPICS" lib/prompts/*.ts` vraća 7 fajlova. Detalji: `docs/BUG_TRACKER.md` "dogfooding krug 3".
- **BUG-046 do BUG-050 + SYS-05 rešeni** (jutrošnji deo) — zabrana konkurencije bez naknade (NDA/ugovor-o-delu/pravilnik-o-radu), tip_prihoda + 4 polja tiho brisana u ugovor-o-delu, sistemski Zod gap na 7 modula.

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
| Social content pack | `docs/marketing/social-content-pack-2026-07-13.html` |
| Detaljna istorija po temi | `.ai-memory/project_*.md` — samo ako STATE.md ne pokriva dovoljno |

---

## Checklist za kraj sesije (uraditi PRE zatvaranja, ne posle)

1. Prepiši sekcije "Status" / "Gotovo i verifikovano" / "Sledeći korak" iznad — overwrite, ne dodavanje na staro.
2. Svaka nova stavka u "Gotovo i verifikovano" MORA imati proverljiv trag (komanda ili grep), ne samo tvrdnju.
3. Ako je nešto veliko urađeno, dopiši kratak unos u `PROGRESS.md` (istorija) — ali STATE.md ostaje sažet, ne dupliraj prozu ovde.
4. Commit i push — sledeća sesija (druga mašina) čita ovo pre bilo čega drugog.
