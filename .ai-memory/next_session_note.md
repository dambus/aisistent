---
name: next-session-note
description: Poruka za sledeću sesiju — gde smo stali 2. jul 2026., šta je sledeće
metadata:
  type: project
---

## Gde smo stali (2. jul 2026., kraj sesije)

Preview iframe + telefon UX hint implementirani i na produkciji. Korak 8 validacija urađena na 3 nova obrasca.

**Poslednji commit:** `a8e5d46` — preview iframe, telefon composite hint, novi E2E test script

## Šta je sledeće

### 1. Backlog — "caption bez podvlake/tabele" detekcija (novo, iz Korak 8 validacije)
Otkriveno testiranjem PK2-o-z1.pdf i "zahtev za pristup informacijama": zaglavlja tipa PIB/adresa/ime koriste layout "natpis ispod/pored praznog prostora" bez podvučene linije i bez tabele — `extractFlatPdfFields.ts` ovo uopšte ne detektuje (prepoznaje samo table-cell/selection-mark/underscore-tekst). Ta polja se ne pojave ni u manual listi GuideView-a, korisnik ih ne vidi. Korisnik je odlučio da se ovo za sada samo zabeleži, ne implementira odmah — pipeline dobro pokriva strukturirane obrasce (tabela/AcroForm).

Kad se vrati na ovo: potrebna nova heuristika u `extractFlatPdfFields.ts` — npr. prazan vertikalni prostor iznad samostalnog kratkog natpisa (često u zagradama, npr. "(ПИБ)", "(адреса)") tretirati kao implicitno polje. Rizik: false positive detekcije na običnom tekstu, treba pažljivo kalibrisati sa `run-calibration-test.mjs`.

Dodatno zapaženo: forme sa checkboxovima zbijenim u jedan pasus (više `:unselected:` u istom paragraph-u) ne dobijaju labele — same-line matching prezahtevan za taj layout.

### 2. 5B slobodne linije (originalni scope, i dalje čeka)
`extractFlatPdfFields` već detektuje `sourceType: 'underline'` (tekstualne "___" linije), ali `pdfOverlay.ts` nema `fillFreeLines`. Ovo je uži i lakši slučaj od gore pomenutog gap-a — čeka test dokument koji STVARNO koristi underscore-tekst (nijedan od 3 testirana obrasca ga nije imao).

### 3. Ostali backlog
- Adresa split (ulica+broj iz jedne vrednosti) — u backlogu
- Bolji error handling u UI za korak 7 (razlikovati DI timeout vs overlay greška)

## Novi alat — scripts/test-full-pipeline.ts
E2E test bez UI/auth: `npx tsx --tsconfig tsconfig.json scripts/test-full-pipeline.ts <pdf-path>`. Provlači PDF kroz stvarne produkcijske module (analyzeLayout, extractAcroFormFields/extractFlatPdfFields, matchFieldLabels, mapFieldsToProfile sa pravim Claude pozivom, composite/hint post-processing identičan di-analyze/route.ts, fillAcroFormFields/fillTableCells) i snima popunjeni PDF u `scripts/output/`. Koristi mock Company objekat (Testna Firma d.o.o.). Koristan za brzu iteraciju bez potrebe za deploy/auth kad stigne novi test obrazac.

Napomena: `pdftoppm` (poppler) NIJE instaliran na ovoj mašini — Read tool ne može da renderuje PDF stranice kao slike. Vizuelna provera ide preko teksta (labele + mapirane vrednosti ispisane u konzoli), ne preko pixel-perfect pregleda.

## Tehnički kontekst (i dalje važi)

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
