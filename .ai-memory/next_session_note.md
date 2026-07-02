---
name: next-session-note
description: Poruka za sledeću sesiju — gde smo stali 2. jul 2026. (druga sesija istog dana), šta je sledeće
metadata:
  type: project
---

## Gde smo stali (2. jul 2026., kraj druge sesije)

Preview iframe, telefon UX hint, email transliteracija fix — svi na produkciji. Korak 8 validacija urađena na ukupno 9 test obrazaca (3 + 6). Dva nova nalaza čekaju u backlogu, korisnik odlučio da stane za danas.

**Poslednji commit:** `d1b9d9c` — email/website transliteracija fix (PROGRESS.md/.ai-memory commit ide posle ovog)

## Šta je sledeće — prioritet po ozbiljnosti

### 1. Duplikat-upis bug (NOVO, najozbiljniji nalaz, vizuelno potvrđen) — PRIORITET
Otkriveno na OPD-o.pdf: kad prazne ćelije u **različitim redovima** dele identičan label tekst (tipičan raspored: uska ćelija odmah pored labele "11. Матични број из регистра" + red kućica cifra-po-cifra ispod), `extractFlatPdfFields.ts` ih tretira kao dva nezavisna polja. Semantički mapper mapira OBA na isti profil ključ, i overlay upisuje istu vrednost DVAPUT — jednom skraćeno pored labele ("876543..."), jednom preko linija kućica ispod ("87654821", tekst seče granice kućica). Isto se desilo sa delatnošću. Vizuelno razbija generisani PDF — konkretan, korisniku vidljiv bug, ne samo propušteno polje.

Root cause: composite-dedup u `di-analyze/route.ts` (oko linije ~145, `compositeSecondary`/`compositePrimary`) proverava samo `Math.abs(b.yCtr - a.yCtr) < SAME_LINE_Y_IN` — isti red. Ovaj slučaj je različit red, isti label tekst — dedup ga ne hvata.

Predlog fix-a (nije implementiran, korisnik odlučio da stane): proširiti dedup da grupiše polja po identičnom `label` tekstu bez obzira na red (možda ograničeno na isti table/isti page, da se ne dedup-uje slučajno preko cele strane) — popuniti samo prvo (najbliže labeli po X/Y), ostala ostaju manual. Pažljivo — treba proveriti da ne pokvari legitimne slučajeve gde se isti label ponavlja namerno (npr. datumska polja "Д | М | Г" koja se ponavljaju za dva različita datuma su OK jer imaju različit label kontekst).

### 2. Manji nalaz — redni broj otima labelu (OA-o.pdf)
U tabelama gde prva kolona ima redni broj ("I", "II", "III"...), `labelCell` heuristika (najbliža neprazna ćelija LEVO u istom redu) uzima taj redni broj kao label za CEO ostatak reda, umesto pravog naslova kolone. Bez praktične posledice u testiranim obrascima (te tabele ionako ne mapiraju na profil), ali bi bilo pogrešno prikazana labela u manual listi GuideView-a. Niži prioritet od #1.

### 3. "Caption bez podvlake/tabele" gap (potvrđeno 4. put — zahtev-pu-o.pdf)
Isto kao u prošloj belešci: zaglavlja tipa Ime/JMBG/PIB/kontakt telefon bez podvučene linije i bez tabele su pipeline-u nevidljiva. Sad potvrđeno na 4 od ukupno 9 testiranih obrazaca (PK2, zahtev-za-pristup-informacijama, zahtev-pu-o, i delimično svaki "slobodni" zahtev-stil dokument) — ovo je čest šablon za "zahtev" tipove dokumenata, ne redak edge case. Vredi razmotriti prioritet ponovo kad se vratimo na backlog.

### 4. 5B slobodne linije (originalni scope, još čeka)
`extractFlatPdfFields` detektuje `sourceType: 'underline'`, ali `pdfOverlay.ts` nema `fillFreeLines`. Nijedan od 9 testiranih obrazaca nije imao stvarni underscore-tekst slučaj — i dalje čeka pravi test dokument.

### 5. Ostali backlog (nepromenjeno)
- Adresa split (ulica+broj iz jedne vrednosti)
- Bolji error handling u UI za korak 7 (DI timeout vs overlay greška)

## Alati za lokalno testiranje

**scripts/test-full-pipeline.ts** — E2E test bez UI/auth: `npx tsx --tsconfig tsconfig.json scripts/test-full-pipeline.ts <pdf-path>`. Provlači PDF kroz stvarne module (analyzeLayout, extractAcroFormFields/extractFlatPdfFields, matchFieldLabels, mapFieldsToProfile sa pravim Claude pozivom, composite/hint logika identična di-analyze/route.ts, fillAcroFormFields/fillTableCells). Mock Company = "Testna Firma d.o.o." Snima u `scripts/output/` (gitignored).

**pymupdf instaliran lokalno** (`pip install pymupdf`) — `pdftoppm` NIJE dostupan na ovoj mašini, pa se PDF vizuelna provera radi ovako:
```python
import fitz
doc = fitz.open('scripts/output/X-pipeline-filled.pdf')
pix = doc[0].get_pixmap(dpi=200)
pix.save('scripts/output/X.png')
```
Zatim Read tool na .png fajl. Za crop određenog regiona: `page.get_pixmap(dpi=300, clip=fitz.Rect(x0,y0,x1,y1))` gde su koordinate u PDF points (72dpi) — konvertuj piksele sa prethodnog full-page rendera preko `scale = 72/dpi_koji_si_koristio`.

**Ukupno testirano do sada:** PPDG-1S, Dodatak_15, JRPPS, PPI-2, 3040-113-015, M-A (van opsega, sken), Образац 1, PK2-o-z1, obrazac-zahtev-pristup-informacijama, BU-o, ERP-osn, OA-o, OPD-o, PB2-o, zahtev-pu-o — 15 obrazaca ukupno kroz sve sesije.

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

**Transliteracija:** `toDocumentScript()` sad ima `isNonTransliterable()` guard (regex `@` ili `http(s)://`/`www.`) — email/website nikad se ne transliterišu.
