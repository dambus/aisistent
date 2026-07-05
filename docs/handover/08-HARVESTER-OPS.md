# Harvester — novi izvori i n8n automatizacija

*Operativno uputstvo za širenje biblioteke obrazaca. Stanje 5. jul: 1 izvor (APR privredna društva), 8 objavljenih obrazaca, ~40 kandidata u redu.*

## Tok (podsetnik)

```
sources.json (dodaj izvor) → harvest-sources.ts (skini+klasifikuj+diff)
→ batch-curate.ts (propose + Claude meta draft za sve nekurirane)
→ RUČNI pregled JSON-ova → curate-form.ts publish → vizuelna kontrola → go-live
→ curatedSlug upisati u harvest-state.json (da changed detektuje re-kuraciju)
```

`batch-curate.ts` NE upisuje curatedSlug — to se radi tek posle go-live, ručno ili malim skriptom (vidi sesiju 5. jul u PROGRESS).

## Novi izvori za dodati (istraženo, sa napomenama)

| Izvor | URL | Napomena |
|-------|-----|----------|
| APR preduzetnici | apr.gov.rs — registri/preduzetnici | Nav je dinamičan (JS) — plain fetch možda ne vidi linkove; ako harvester nađe 0 PDF-ova, otvoriti stranicu u browseru i ručno naći direktan URL liste obrazaca, ili proširiti harvester da prati podstranice |
| Poreska uprava | purs.gov.rs — poreske-prijave-i-obrasci (fizicka-lica / preduzetnici / pravna-lica — 3 podstranice = 3 izvora) | VAŽNO: mnogi obrasci su e-only (podnose se kroz ePorezi) — PDF verzija tada NEMA vrednost; proveriti za svaki pre kuracije (spec pravilo) |
| RFZO | rfzo.rs/index.php/obrasci | category: 'rzzo' |
| PIO fond | pio.rs/sr/obrasci/republicki-fond | category: 'ostalo' (nema pio kategorije — ili dodati u CHECK constraint migracijom + CATEGORY_LABELS u lib/libraryForms.ts + CATEGORIES u curate-form.ts) |
| ZSO | zso.gov.rs/obrasci.htm | starija stranica, verovatno flat obrasci — očekivati malo kandidata dok flat→AcroForm (07) ne proradi |
| CROSO | croso.gov.rs | category 'croso' postoji; M-A i slični obrasci — proveriti AcroForm status |

Dodavanje = novi red u `scripts/curation/sources.json` (id, institution, category, url). NIŠTA u kodu, osim ako kategorija ne postoji (vidi PIO red).

`batch-curate.ts` ima `CATEGORY_BY_SOURCE` mapu i hardkodovan `source_institution` 'APR' — **pri dodavanju izvora proširiti oba** (mapa institution po sourceId).

## n8n cron (imamo n8n infra od blog workflow-a)

Cilj: nedeljna provera izmena obrazaca bez ručnog pokretanja.

1. n8n workflow: cron (npr. ponedeljak 06:00) → Execute Command node: `npx tsx --tsconfig tsconfig.json scripts/harvest-sources.ts` u repo folderu (n8n mora biti na mašini sa repo-om, ili SSH node)
2. Parsirati stdout rezime (`Novi AcroForm kandidati: N`, `Izmenjeni: M`) — regex nad izlazom
3. Ako N+M > 0 → notifikacija (email preko postojećeg Resend patterna ili Telegram — šta god n8n već koristi za blog)
4. **Poseban alarm za `⚠️ KURIRAN` linije** — to znači da je institucija promenila VEĆ OBJAVLJEN obrazac → re-kuracija hitna (korisnici skidaju zastarelu verziju!)
5. commit `harvest-state.json` posle run-a (n8n git node ili ručno) — inače sledeći run ponovo prijavljuje isto

Alternativa bez n8n-a: GitHub Actions scheduled workflow — checkout, run harvester, ako ima diff u harvest-state → otvori GitHub issue (repo već ima n8n→issues tok za feedback, konzistentno).

## Održavanje

- `harvest-state.json` raste — ne čistiti, istorija je feature (firstSeen/lastSeen)
- PDF-ovi u `scripts/harvest/` su .gitignore — na novoj mašini prvo pokrenuti harvester da ih skine
- Ako institucija promeni URL stranice → izvor tiho prestane da radi (`stranica nedostupna` u rezimeu) — n8n notifikacija treba da uključi i errors count
