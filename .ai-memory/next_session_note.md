---
name: next-session-note
description: Poruka za sledeću sesiju — gde smo stali 1. jul 2026., šta je sledeće
metadata:
  type: project
---

## Gde smo stali (1. jul 2026., kraj sesije)

Faza 2 Koraci 1–7 su kompletni i u produkciji. End-to-end flow radi.

**Poslednji commit:** `8df1d3b` — font fix (9pt) + mapper ne mapira sub-komponente adrese

**Potvrđeno na PPDG-1S (AcroForm):** ime, PIB, mesto tačno. Ćirilica OK. Potpisi prazni.

## Šta je sledeće

### 1. Korak 8 — validacija na 3+ obrazaca (prioritet)
- Korisnik treba da donese obrasce (AcroForm i flat mešavina) za testiranje
- Posebno tražiti obrazac sa slobodnim linijama za 5B implementaciju
- Pokrenuti `run-calibration-test.mjs` na svakom, vizuelno verifikovati popunjeni PDF

### 2. Poznate neispravnosti koje čekaju testiranje
- **Telefon composite** — T15="063" (maxLength=3), T16=manual. By-design, ali korisnik to ne zna. Razmisliti o boljem UX signalu u GuideView (npr. "063-_______-_______" format hint).
- **5B slobodne linije** — datum, podvlake bez AcroForm strukture. Kod za `extractFlatPdfFields` vec detektuje `sourceType: 'underline'`. Overlay u `pdfOverlay.ts` još nema `fillFreeLines`. Čeka test dokument.

### 3. Backlog koji su ostali
- Adresa split (profil ima "Fruškogorska 1" kao jedno polje, forma traži ulicu i broj odvojeno) — rešivo u mapperu ako Claude dobije hint o split logici
- Preview PDF u iframe (pokazati popunjeni PDF pre downloada) — potreban preview endpoint koji ne briše original
- Korak 7 error handling u UI — trenutno samo "Greška pri generisanju" string; bolje bi bilo razlikovati DI timeout vs overlay greška

## Tehnički kontekst

**Koordinate:**
- DI: inči, Y=0 na vrhu, raste nadole
- pdf-lib: pt (1in=72pt), Y=0 na dnu, raste nagore
- Konverzija: `x=bbox.x*72`, `y=pageH-(bbox.y+bbox.h)*72`
- TEXT_X_OFFSET_PT = 3 (DI bbox uključuje border ~1mm)

**AcroForm fill flow:**
`fillAcroFormFields` → `setFontSize(9)` → `setText` → `form.updateFieldAppearances(customFont)` → u endpoint-u: `form.flatten()` → `pdfDoc.save()`

**Flat PDF fill flow:**
`analyzeLayout(buffer)` (re-run DI) → `fillTableCells(pdfDoc, confirmedFields, diResult)` → `pdfDoc.save()`
Field ID format: `table{tableIdx}_r{rowIdx}c{colIdx}_p{page}`

**fontkit:** CJS modul, koristiti `require('fontkit')` ne `import fontkit from 'fontkit'`. U TS: `const fontkit = require('fontkit') as typeof import('fontkit')` (ima `types/fontkit.d.ts`).
