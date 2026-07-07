---
name: next-session-note
description: Poruka za sledeću sesiju — 18 obrazaca u biblioteci (7. jul), harvester bugfix, šta je sledeće
metadata:
  type: project
---

## Gde smo stali (7. jul 2026.)

**Biblioteka = 18 obrazaca** (bilo 8, kurirano + objavljeno još 10 APR kandidata preko `batch-curate.ts --limit 10` + ručni `curate-form.ts publish/go-live`): povracaj-sredstava-apr, ispravka-greske, zahtev-za-potvrdu-apr, prepis-resenja, dodatak-02-ps, dodatak-16, dodatak-20, dodatak-26, dodatak-29, dodatak-32. Vizuelno proverено (pymupdf render) pre go-live — sve čisto, bez preklapanja teksta. `curatedSlug` upisan u `harvest-state.json` za svih 10.

**Bugfix — `scripts/harvest-sources.ts`:** na svežoj mašini (`scripts/harvest/` je gitignored, prazan) harvester je poredio sha256 sa `harvest-state.json` i, ako se poklapa, mislio da je fajl "unchanged" i preskočio download — a fajl lokalno uopšte ne postoji. Sad proverava i `fs.existsSync(localPath)` pre skipa (linija ~119). Bez ovog fix-a `curate-form.ts propose` puca sa ENOENT na svakoj svežoj mašini/klonu.

**Supabase kredencijali:** `.env.local` je bio zaglavljen na `http://127.0.0.1:54321` (mrtav lokalni Docker koji se više ne koristi — projekat je 100% cloud Supabase). Milan ažurirao na pravi cloud URL (`https://dgsuspjxegciwlzqpzxn.supabase.co`) + novi `sb_secret_...` format service role ključa. Radi ispravno sa `@supabase/supabase-js@2.107.0` (i PostgREST i Storage). Ako se ponovo pojavi "Invalid API key"/"Invalid Compact JWS" — prvo proveriti da li `.env.local` slučajno pokazuje na stari/lokalni URL.

## Prethodna sesija (5. jul 2026., kasno veče)

**⚠️ ROK: Milan gubi pristup Claude Sonnet 5 posle 7.7.2026** — zato je napisana kompletna handover dokumentacija.

Urađeno u ovoj sesiji:
1. **Biblioteka = 8 obrazaca** (kurirano 5 novih APR Dodataka: 01 poslovno ime, 04 delatnost, 05 vreme trajanja, 19 pravna forma, 30 ograničenje ovlašćenja). Novo pravilo: obrasci BEZ ijednog autofill polja se objavljuju kao referentni PDF (publish više ne odbija). Fixovan dupliran naslov (short_name = kratak tag, ne kopija title).
2. **Feedback dugme live** — "Obrazac je zastareo ili ima grešku?" na /obrasci/[slug], `POST /api/obrasci/library/[slug]/report-outdated`, inkrement `outdated_reports`, bez auth (spam zaštita zabeležena u handover 01, stavka 8).
3. **`scripts/batch-curate.ts`** — masovni propose + Claude draft meta za sve nekurirane AcroForm kandidate. Testiran, radi. ~40 kandidata čeka.
4. **`docs/handover/00-12`** — KOMPLETNA handover dokumentacija: tech debt (11 stavki), implementaciona uputstva za sav backlog, brainstorm 20+ ideja, meta-uputstvo za slabije modele. POČETNA TAČKA za svaki budući zadatak: `docs/handover/00-INDEX.md` + `12-META-UPUTSTVO.md`.
5. Codex plugin proradio (CLI instaliran, safe.directory fix) — dostupan za delegaciju.

## Šta je sledeće (Milan bira)

1. **Batch kuracija preostalih ~31 APR kandidata:** `npx tsx --tsconfig tsconfig.json scripts/batch-curate.ts --limit 10` → pregled JSON-ova → publish → vizuelna kontrola → go-live → curatedSlug u harvest-state (isti tok kao 7. jul)
2. Razrada odabranih brainstorm ideja (`docs/handover/11-BRAINSTORM-FEATURES.md`) u detaljna uputstva
3. Novi izvori obrazaca (uputstvo: `docs/handover/08-HARVESTER-OPS.md`)
4. Brzi dobici iz brainstorma: SEO obrasci (D1), KPO knjiga (A2), rokovi podsetnik (A1)

## Ključna pravila kuracije (spec 6.1 — NE kršiti)

- Samo AcroForm za autofill; obrasci bez autofill polja mogu kao referentni PDF (odluka 5. jul)
- Meta latinicom (publish auto-transliteruje); PDF ostaje na svom pismu
- Prefill samo za obrasce o POSTOJEĆEM subjektu; e-only obrasce (ePorezi) ne kurirati
- Harvest ≠ publish — kurator (Milan) uvek odobrava go-live

## Tehnički kontekst — vidi

- `docs/handover/00-INDEX.md` — mapa svega
- `.ai-memory/project_codebase_map.md` — arhitektura celog codebase-a (full read 5. jul)
- PROGRESS.md — istorija sesija
