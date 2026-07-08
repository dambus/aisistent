---
name: next-session-note
description: Poruka za sledeću sesiju — 18 obrazaca u biblioteci (7. jul), harvester bugfix, šta je sledeće
metadata:
  type: project
---

## Gde smo stali (8. jul 2026., batch 4)

**Biblioteka = 38 obrazaca** (bilo 28, +10): dodatak-12, dodatak-13, dodatak-14, dodatak-15, jrpps-akcionarsko-drustvo, jrpps-javno-preduzece, jrpps-kd, ogranak-stranog-drustva, jrpps-ortaci, predstavnistvo-stranog-drustva. Preostalo 13 acroform + 2 flat kandidata (JRPPS DOO, JRPPS Zadruga/Zadružni savez, Registraciona prijava brisanja, Dodatak 03/07/17a/17b/18/28/27/31, zahtev za uvid u spise, zahtev za slobodan pristup informacijama).

**Novo pravilo kuracije (dodati u spec 6.1): JRPPS "Registraciona prijava" forme (osnivanje NOVE firme — akcionarsko/javno preduzeće/komanditno/ortačko/DOO/zadruga, ogranak/predstavništvo stranog društva) NIKAD ne dobijaju profileKey prefill.** Auto-mapper (isti semanticMapper koji radi za amandmanske Dodatak forme) je na ovoj rundi predložio `naziv`/`maticni_broj`/`delatnost` iz sekcije "ПОСЛОВНО ИМЕ" — ali to je naziv firme koja se TEK osniva, ne postojeći profil korisnika. Prefill bi upisao pogrešan naziv u polje za novu firmu — direktno krši postojeće pravilo "prefill samo za postojeći subjekat". Svih 6 JRPPS formi ove runde objavljeno kao referentni PDF (profileKey mape ručno skinute pre publish-a). Isto pravilo važi za preostale JRPPS DOO/Zadruga/Zadružni savez u sledećoj rundi. Registraciona prijava BRISANJA subjekta je druga priča (postojeći subjekat se briše) — normalna kandidat za prefill, proveriti posebno.

**Bug nađen — label-extraction mismatch (Dodatak 13):** auto-mapper je "Место седишта:" label vezao za AcroForm polje `Text28.1.0`, ali vizuelno (pymupdf render test-fill PDF-a) vrednost je pala u susedni box "Регистарски/матични број:" — nearest-label heuristika pogodila pogrešan fizički widget kad su dva polja vertikalno blizu u dvokolonom layoutu. Mapiranje ručno skinuto (profileKey→null), redo test-fill, čisto. **Pouka: vizuelna kontrola test-fill PDF-a mora proveriti da vrednost pada u TAČAN box, ne samo da je "nešto" popunjeno — "filled=N noValue=0" izveštaj iz publish-a ne hvata ovu grešku.**

**Slug kolizija:** batch-curate.ts generiše slug iz `short_name` bez provere jedinstvenosti — "JRPPS — Akcionarsko društvo" i "JRPPS — Javno preduzeće" oba pale na slug "jrpps". Ručno ispravljeno na `jrpps-akcionarsko-drustvo` / `jrpps-javno-preduzece` pre publish-a. Vredi dodati uniqueness proveru u batch-curate.ts (tech debt, nije popravljeno).

## Prethodna sesija (7. jul 2026., batch 3)

**Biblioteka = 28 obrazaca** (bilo 18, +10 novih preko `batch-curate.ts --limit 10`, treći batch iste sesije): dodatak-06, 08, 09, 10, 11, 21, 22, 24, 25, 33. Isti tok kao prethodni batch: propose → ručni pregled JSON-a (profileKey validacija protiv PROFILE_KEYS iz semanticMapper.ts) → publish → pymupdf render provera (dodatak-06/21/22/25 imaju autofill test-fill, ostalih 6 su bez AcroForm predloga pa idu kao referentni PDF) → go-live. `curatedSlug` upisan u `harvest-state.json` za svih 10. Preostalo ~21 kandidat od originalnih 51 AcroForm.

## Prethodna sesija (7. jul 2026., batch 2) — Faza 4: biblioteka 8→18 obrazaca

**Biblioteka = 18 obrazaca** (bilo 8, kurirano + objavljeno još 10 APR kandidata preko `batch-curate.ts --limit 10` + ručni `curate-form.ts publish/go-live`): povracaj-sredstava-apr, ispravka-greske, zahtev-za-potvrdu-apr, prepis-resenja, dodatak-02-ps, dodatak-16, dodatak-20, dodatak-26, dodatak-29, dodatak-32. Vizuelno proverено (pymupdf render) pre go-live — sve čisto, bez preklapanja teksta. `curatedSlug` upisan u `harvest-state.json` za svih 10.

**Bugfix — `scripts/harvest-sources.ts`:** na svežoj mašini (`scripts/harvest/` je gitignored, prazan) harvester je poredio sha256 sa `harvest-state.json` i, ako se poklapa, mislio da je fajl "unchanged" i preskočio download — a fajl lokalno uopšte ne postoji. Sad proverava i `fs.existsSync(localPath)` pre skipa (linija ~119). Bez ovog fix-a `curate-form.ts propose` puca sa ENOENT na svakoj svežoj mašini/klonu.

**Supabase kredencijali:** `.env.local` je bio zaglavljen na `http://127.0.0.1:54321` (mrtav lokalni Docker koji se više ne koristi — projekat je 100% cloud Supabase). Milan ažurirao na pravi cloud URL (`https://dgsuspjxegciwlzqpzxn.supabase.co`) + novi `sb_secret_...` format service role ključa. Radi ispravno sa `@supabase/supabase-js@2.107.0` (i PostgREST i Storage). Ako se ponovo pojavi "Invalid API key"/"Invalid Compact JWS" — prvo proveriti da li `.env.local` slučajno pokazuje na stari/lokalni URL.

**Env var naming gotcha:** posle rotacije ključeva `.env.local` je imao `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase dashboard novi naziv za taj tip ključa) — ceo kod (`lib/supabase/client.ts`, `server.ts`, `lib/blog.ts`, `lib/libraryForms.ts`) čita `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Dev server je pucao sa "supabaseKey is required". Ako se ključevi ponovo rotiraju u Supabase dashboard-u — ime promenljive u `.env.local` MORA ostati `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ne kopirati novi naziv sa dashboarda doslovno.

**CTA fix:** `components/landing/ToolLandingPage.tsx` hero dugme je hardkodovalo "Generišite {toolLabel} besplatno" ignorišući `ctaLabel` prop — na kalkulator stranicama je pisalo "Generišite kalkulator..." (kalkulator se ne generiše). Fiksirano da koristi `ctaLabel`; dodat opcioni `ctaTitle` prop za mid-page naslov (kalkulatori sad imaju "Izračunajte odmah, besplatno" umesto "Napravite X za 60 sekundi"). Usput uočeno: `whyAisistent` prop se prosleđuje na svakoj landing stranici ali se NIGDE ne renderuje u komponenti (`void whyAisistent` — mrtav kod) — sadržaj koji svaka stranica definiše se nikad ne prikazuje korisniku. Nije popravljeno (van scope-a), vredi pogledati.

**Marketing (7. jul):** dodat promo baner na homepage (dinamički broj obrazaca), nav link "Obrasci", footer link, "NOVO" bedž u dashboard sidebar-u, napomena na `/obrasci` da se biblioteka aktivno puni.

## Prethodna sesija (5. jul 2026., kasno veče)

**⚠️ ROK: Milan gubi pristup Claude Sonnet 5 posle 7.7.2026** — zato je napisana kompletna handover dokumentacija.

Urađeno u ovoj sesiji:
1. **Biblioteka = 8 obrazaca** (kurirano 5 novih APR Dodataka: 01 poslovno ime, 04 delatnost, 05 vreme trajanja, 19 pravna forma, 30 ograničenje ovlašćenja). Novo pravilo: obrasci BEZ ijednog autofill polja se objavljuju kao referentni PDF (publish više ne odbija). Fixovan dupliran naslov (short_name = kratak tag, ne kopija title).
2. **Feedback dugme live** — "Obrazac je zastareo ili ima grešku?" na /obrasci/[slug], `POST /api/obrasci/library/[slug]/report-outdated`, inkrement `outdated_reports`, bez auth (spam zaštita zabeležena u handover 01, stavka 8).
3. **`scripts/batch-curate.ts`** — masovni propose + Claude draft meta za sve nekurirane AcroForm kandidate. Testiran, radi. ~40 kandidata čeka.
4. **`docs/handover/00-12`** — KOMPLETNA handover dokumentacija: tech debt (11 stavki), implementaciona uputstva za sav backlog, brainstorm 20+ ideja, meta-uputstvo za slabije modele. POČETNA TAČKA za svaki budući zadatak: `docs/handover/00-INDEX.md` + `12-META-UPUTSTVO.md`.
5. Codex plugin proradio (CLI instaliran, safe.directory fix) — dostupan za delegaciju.

## Šta je sledeće (Milan bira)

1. **Batch kuracija preostalih 13 acroform + 2 flat kandidata:** `npx tsx --tsconfig tsconfig.json scripts/batch-curate.ts --limit 10` → pregled JSON-ova (profileKey + JRPPS founding-forme skinuti mape, vidi pravilo ispod) → publish → vizuelna kontrola svakog box-a → go-live → curatedSlug u harvest-state (isti tok kao 7-8. jul)
2. Razrada odabranih brainstorm ideja (`docs/handover/11-BRAINSTORM-FEATURES.md`) u detaljna uputstva
3. Novi izvori obrazaca (uputstvo: `docs/handover/08-HARVESTER-OPS.md`)
4. Brzi dobici iz brainstorma: SEO obrasci (D1), KPO knjiga (A2), rokovi podsetnik (A1)

## Ključna pravila kuracije (spec 6.1 — NE kršiti)

- Samo AcroForm za autofill; obrasci bez autofill polja mogu kao referentni PDF (odluka 5. jul)
- Meta latinicom (publish auto-transliteruje); PDF ostaje na svom pismu
- Prefill samo za obrasce o POSTOJEĆEM subjektu; e-only obrasce (ePorezi) ne kurirati
- **JRPPS "Registraciona prijava" (osnivanje nove firme) NIKAD ne dobija profileKey prefill** — subjekat još ne postoji, prefill bi upisao pogrešan naziv (dodato 8. jul, batch 4)
- Vizuelna kontrola test-fill PDF-a mora proveriti TAČAN box, ne samo da je polje popunjeno — label-extraction može pogoditi susedni widget (dodato 8. jul, batch 4)
- Harvest ≠ publish — kurator (Milan) uvek odobrava go-live

## Tehnički kontekst — vidi

- `docs/handover/00-INDEX.md` — mapa svega
- `.ai-memory/project_codebase_map.md` — arhitektura celog codebase-a (full read 5. jul)
- PROGRESS.md — istorija sesija
