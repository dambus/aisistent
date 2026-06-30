# Skripte za kalibraciju — kratko uputstvo

Sve skripte se pokreću **iz korena projekta** (`D:\Development\2026\aisistent`), ne iz `scripts/` poddirektorijuma.

## Preduslovi

```env
# .env.local
AZURE_DOC_INTEL_ENDPOINT=https://....cognitiveservices.azure.com/
AZURE_DOC_INTEL_KEY=...
```

---

## 1. `run-calibration-test.mjs` — analiza PDF-a

Pokreće ceo pipeline: DI → AcroForm → geometrijsko poklapanje → JSON + HTML overlay.

```bash
node scripts/run-calibration-test.mjs <putanja-do-pdf> [--force-di]
```

**DI raw se kešira** — drugi poziv za isti fajl ne poziva Azure API (keš: `scripts/output/<label>-di-raw.json`).  
`--force-di` prisiljava novi DI poziv (korisno posle promene modela ili API verzije).

**Izlaz:**
- `scripts/output/<label>-calibration.json` — per-field podaci (labela, confidence, signali)
- `scripts/output/<label>-overlay.html` — vizuelni overlay

---

## 2. Overlay HTML — vizuelni pregled

Otvori `scripts/output/<label>-overlay.html` u browseru direktno ili preko servera (vidi korak 3).

**Boje:**
- Zelena — high confidence (margina ≥ 0.20in, DI conf ≥ 0.80)
- Narandžasta — low confidence (ima labelu ali slabi signali)
- Crvena — bez labele (nema same-line ni above kandidata)
- Plava — trenutno polje u review modu (vidi korak 3)

**Hover** nad svakim poljem prikazuje: labela, dist, relativna margina, DI confidence.

**Hash navigacija:** dodaj `#T7` na kraj URL-a da se highlight-uje i skroluje do polja T7.  
Primer: `http://localhost:7789/PPDG-1S-p-overlay.html#T7`

---

## 3. `record-ground-truth.mjs` — unos tačno/netačno

```bash
node scripts/record-ground-truth.mjs scripts/output/<label>-calibration.json
```

CLI prolazi kroz polja koja još nisu verifikovana. Tipke: `y` tačno | `n` netačno | `s` preskoči | `q` izlaz.

**Overlay server:** skripta automatski pokreće HTTP server na portu 7789.  
Za svako polje ispisuje URL — otvori jednom u browseru (idealno drugi monitor) i ostavi otvoren.  
Overlay se automatski skroluje i highlightuje trenutno polje čim navigiraš na URL.

```
[1/198]  T2  (str.1)
  Overlay:   http://localhost:7789/PPDG-1S-p-overlay.html#T2
  Labela:    "ЗА ПЕРИОД ОД ... ДО ..."
  Confidence: high  (same-line)
  > y
```

Zapisi se akumuliraju u `scripts/calibration-data.jsonl` (append-only, može se prekinuti i nastaviti).

---

## 4. `recalculate-thresholds.mjs` — predlog novih pragova

```bash
node scripts/recalculate-thresholds.mjs
```

Čita `scripts/calibration-data.jsonl`, F1-optimizuje pragove za `relativeMarginIn`, `diConfidence`, `distanceIn`.  
**Ne menja kod automatski** — ispisuje predlog koji primenjaš ručno u `matchFieldLabels.ts`.

Preporučeni minimum: **20 verifikovanih polja** pre prvih preporuka.

---

## 5. Ostale skripte (dijagnostika)

```bash
# Pregled AcroForm polja u PDF-u (ime, strana, koordinate)
node scripts/inspect-acroform.mjs <pdf>

# Sanity check ekstrakcije (T42/T43/T44 moraju biti str.1)
node scripts/test-extract-acroform.mjs

# Pokretanje overlay servera bez record-ground-truth
node scripts/serve-overlay.mjs  # http://localhost:7788/
```

---

## Tipičan radni tok

```bash
# 1. Analiziraj novi PDF (DI keš se pravi automatski)
node scripts/run-calibration-test.mjs C:\Users\milan\Downloads\PPDG-1S-p.pdf

# 2. Otvori overlay u browseru da vidiš overview
# scripts/output/PPDG-1S-p-overlay.html

# 3. Pokreni ground truth unos (overlay server se automatski startuje)
node scripts/record-ground-truth.mjs scripts/output/PPDG-1S-p-calibration.json

# 4. Nakon 20+ zapisa — provjeri predložene pragove
node scripts/recalculate-thresholds.mjs

# 5. Primeni predlog ručno u lib/documentIntelligence/matchFieldLabels.ts
# Ponovi od koraka 1 da vidiš uticaj novih pragova
```
