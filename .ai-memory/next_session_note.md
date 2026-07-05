---
name: next-session-note
description: Poruka za sledeću sesiju — Faza 4 biblioteka obrazaca LIVE (5. jul), šta je sledeće
metadata:
  type: project
---

## Gde smo stali (5. jul 2026., kraj sesije)

**Faza 4 (biblioteka obrazaca) Koraci 1-4 gotovi i POTVRĐENI NA PRODUKCIJI.** Javna `/obrasci` biblioteka live sa 3 APR obrasca (Zahtev za izvod, Prijava promene, Rezervacija naziva) — download popunjeno/prazno radi, PDF editabilan u Adobe-u. Milan verifikovao 5. jula.

Spec: `docs/obrasci/FAZA4_BIBLIOTEKA_OBRAZACA.md` (uklj. odluke sekcija 12 i pravila kuracije 6.1). Istorija: PROGRESS.md sesija 4-5. jul.

## Šta je sledeće

1. **Kuracija preostalih ~30 APR kandidata** — `scripts/harvest/apr-privredna-drustva/` ih ima 51, kurirana 3. Najbolji fit: dodaci o promenama za POSTOJEĆE firme (Dodatak 01 poslovno ime, 03 sedište, 06 zastupnici...). Tok: `curate-form.ts propose <pdf>` → edit JSON → `publish` → render check → `go-live`.
2. **Batch alat** — 30+ obrazaca × propose+opis je spor ručni posao; ideja: batch propose za sve kandidate + Claude draft opisa po obrascu (kao n8n blog workflow), Milan samo redigue.
3. **Novi izvori u `sources.json`** — APR preduzetnici stranica (nav je dinamičan, nisam našao URL — probati kroz Claude-in-Chrome), Poreska (purs.gov.rs poreske-prijave-i-obrasci: fizicka-lica/preduzetnici/pravna-lica), RFZO (rfzo.rs/index.php/obrasci), PIO (pio.rs/sr/obrasci/republicki-fond), ZSO (zso.gov.rs/obrasci.htm).
4. **n8n cron za harvester** — periodična provera izmena (imamo n8n infra od blog workflow-a); `curatedSlug` u harvest-state već diže alarm za re-kuraciju.
5. **Korak 5 spec-a**: "obrazac je zastareo?" feedback dugme (`outdated_reports` kolona postoji).
6. **Backlog**: flat→AcroForm konverzija pri kuraciji (pdf-lib createTextField na koordinate) — otključava OPD, eko taksu, M-A... spec 6.1.

## Ključna pravila kuracije (spec 6.1 — NE kršiti)

- **Samo AcroForm** — flat publish odbija (OPD lekcija)
- **Meta latinicom** — publish auto-transliteruje (sajt je latiničан, PDF ostaje na svom pismu)
- **Prefill samo za obrasce o POSTOJEĆEM subjektu** — JRPPS/osnivanje NE prefill-ovati (novi subjekt ≠ profil); polja tipa "naziv koji se rezerviše" NE puniti
- **Proveriti način podnošenja** — e-only obrasci (PPDG-1S kroz ePorezi) nemaju vrednost kao PDF
- Harvest ≠ publish — kurator uvek odobrava

## Tehnički kontekst Faze 4

- `library_forms` (published=javno čitanje) + `obrasci-library` bucket; `fields` jsonb = SAMO verifikovana mapiranja `{kind:'acroform',fieldName,profileKey}` / `{kind:'flat',page,x,y,w,h,profileKey}`, nikad vrednosti; `script` kolona za pismo
- `fillLibraryForm()` — BEZ flatten; APR polja nemaju DA entry → `setDefaultAppearance('/Helv 9 Tf 0 g')` fallback; 0 DI/Claude na download
- `curate-form.ts propose|publish|go-live`; curation JSON-ovi u `scripts/curation/*.curation.json` (u gitu)
- `harvest-sources.ts` + `sources.json` + `harvest-state.json` (sha256 change detection, curatedSlug alarm); PDF-ovi u `scripts/harvest/` (gitignore)
- semanticMapper `max_tokens: 16384` (307 polja JRPPS seklo 4096)
- Download API: `/api/obrasci/library/[slug]/download` (`?filled=1` = auth + Starter+)
- Upload & Fill: dashboard stranica OBRISANA, `/obrasci` je sada javna biblioteka; ObraściClient + DI pipeline kod ostaju (kuratorski alat + test skripte)

## Faza 1-3 nasleđe (i dalje važi za kuratorski alat)

- `composeGuideFields.ts` = jedina composite/duplikat/hint logika (route + skripte)
- `form_templates` keš radi u di-analyze (ruta više nije dostupna iz UI, ali API postoji)
- Koordinate: DI inči → pdf-lib pt Y-flip; fontkit CJS require; `toDocumentScript` + `isNonTransliterable` guard
- Test alati: `test-full-pipeline.ts --fill-manual`, `test-template-cache.ts`, `test-library-fill.ts`; pymupdf za render; Playwright za screenshotove
