---
name: next-session-note
description: Poruka za sledeću sesiju — gde smo stali 2. jul 2026. (treća sesija), šta je sledeće
metadata:
  type: project
---

## Gde smo stali (2. jul 2026., kraj treće sesije)

Faza 3 Koraci 1-4 završeni i na produkciji (rad po `docs/obrasci/FAZA3_WIZARD_TEMPLATE_BAZA_1.md` + `FAZA3_IMPLEMENTACIJA_UPUTSTVO.md`, korak-po-korak sa STOP checkpoint-ima). SectionWizardView je sad live u `/obrasci` flow-u — "Popuni sve →" dugme u GuideView vodi na sekcijski wizard, testirano end-to-end na pravim PPDG-1S podacima (198 polja, 19 sekcija).

**Poslednji commit:** `2c42ead` — Korak 4 integracija (docs commit ide posle ovog)

## Šta je sledeće — Faza 3 Korak 5, 6, 7

### Korak 5 — Template keš integracija u pipeline (sledeće)
`templateCache.ts` postoji (Korak 1) ali NIJE povezan u `di-analyze/route.ts`. Treba:
1. Izračunati fingerprint (delimičan DI poziv, samo prva strana — `computeFingerprint.ts` već radi ovo)
2. `getTemplate(fingerprint)` — HIT: učitaj `fields`+`sections` iz keša, preskoči pun DI + Claude poziv za STRUKTURU. **Pažnja:** vrednosti (suggestedValue) i dalje moraju da se popune iz TRENUTNOG profila firme, ne iz keša — keš čuva samo strukturu (labela, koordinate, profileKey), nikad korisničke vrednosti (eksplicitno zabranjeno u spec-u). To znači: čak i na cache HIT, treba re-popuniti `suggestedValue` po polju pozivom `profileValue()` iz `semanticMapper.ts` za trenutnog korisnika — Claude poziv se preskače (profileKey je već poznat iz keša), ali vrednost mora biti sveža.
3. MISS: pun pipeline kao sad, pa `saveTemplate()` — pažljivo, `fields` koje se čuvaju u `form_templates.fields` NE SMEJU sadržati `suggestedValue` (korisnički podatak) — treba ili obrisati to polje pre snimanja, ili snimati samo strukturu (label, profileKey, isInternal, id) a ne pun GuideField.
4. `incrementHitCount()` na HIT

STOP checkpoint (iz uputstva): drugi upload istog obrasca mora biti vidljivo brži, pokazati Supabase tabelu sa upisanim templateom i `hit_count` koji raste, verifikovati da output (fields+sections) iz keša identičan outputu iz punog pipeline-a.

### Korak 6 — Template feedback (radi se zajedno sa Korakom 5)
Thumbs up/down u preview stage (posle wizarda/guide-a, pre downloada). Nije obavezno. Negativan → `INSERT INTO template_feedback(fingerprint, user_id, created_at)` — **ova tabela još ne postoji, treba nova migracija** (spec pominje je u sekciji 3.5, ali Korak 1 migracija je napravila samo `form_templates`, ne i `template_feedback`). Ne triggeruje automatsku re-analizu, samo logovanje. 3+ negativna → `needs_review: true` na template (treba dodati tu kolonu ako već nije u `form_templates`).

### Korak 7 — Validacija na 3+ obrazaca
PPDG-1S (veliki, AcroForm) + Образац 1 (manji, flat) + bar jedan nov od Milana. Proveriti sekcije, auto-fill tačnost, manual unos u finalnom PDF-u.

## Backlog iz prethodnih sesija (i dalje čeka, niže prioritet od Faze 3)
- **Duplikat-upis bug** (OPD-o.pdf) — prazne ćelije u različitim redovima sa istim labelom se popunjavaju dvaput. Vidi git log za detalje, i dalje nepopravljeno.
- "Caption bez podvlake/tabele" gap — potvrđeno 4x na različitim obrascima
- 5B slobodne linije, adresa split — manji prioritet

## Faza 3 — tehnički kontekst

**WizardView imenovanje:** `components/obrasci/WizardView.tsx` = STARI Faza 1 DOCX wizard (aktivan, ne dirati). Novi Faza 3 wizard = `SectionWizardView.tsx`.

**Stage shape u ObraściClient.tsx:** `di-guide`/`di-wizard`/`di-preview` sve nose `sectionShapes: SectionShape[]` (title/page/fieldIds — struktura bez vrednosti) + `fields`/`confirmedFields: GuideField[]` (jedini izvor istine za vrednosti). `buildSections(fields, shapes)` spaja ih kad treba FormSection[] za SectionWizardView. Ne praviti drugi snapshot mehanizam — ovo postoji baš da se izbegne desinhronizacija.

**di-analyze/route.ts vraća:** `{ fields: GuideField[], sections: FormSection[] }` — sections se grade server-side dok extractedFields (sa page/yCtr) još postoje, GuideField namerno ne nosi koordinate.

**SectionWizardView bagfixevi koje ne zaboraviti ako se dira:**
- `updateValue`: state mora ići manual→low kad korisnik upiše vrednost, inače pdfOverlay i PreviewView tiho ignorišu unos
- `onBack(fields)`: mora nositi trenutne vrednosti, ne prazan callback

**Lokalni test alati:**
- `scripts/test-full-pipeline.ts --dump-json <pdf>` — generiše `{fields, sections}` JSON fixture za E2E test komponenti bez auth-a (pattern iz Koraka 4 verifikacije)
- `pymupdf` (Python, `import fitz`) za vizuelnu proveru PDF-a — `pdftoppm` nije dostupan
- Playwright (`node_modules/playwright`) za screenshot testiranje komponenti — `npx playwright` CLI radi, chromium-cli skill nije dostupan na ovoj mašini
- Dev server: proveriti da li je port 3000 slobodan pre pokretanja (`netstat -ano | grep :3000`), koristiti `taskkill //PID <pid> //F` za gašenje na Windowsu (pkill nije dostupan u Git Bash)

## Tehnički kontekst (Faza 1-2, i dalje važi)

**Koordinate:** DI inči (Y=0 vrh, raste nadole) → pdf-lib pt (Y=0 dno, raste nagore): `x=bbox.x*72`, `y=pageH-(bbox.y+bbox.h)*72`. TEXT_X_OFFSET_PT=3.

**AcroForm fill:** `fillAcroFormFields` → `setFontSize(9)` → `setText` → `updateFieldAppearances` → `form.flatten()` → `save()`.
**Flat PDF fill:** `analyzeLayout` (re-run DI) → `fillTableCells` → `save()`. Field ID: `table{tableIdx}_r{rowIdx}c{colIdx}_p{page}`.
**fontkit:** `require('fontkit')`, ne ESM import (CJS modul).
**Transliteracija:** `toDocumentScript()` ima `isNonTransliterable()` guard — email/website nikad se ne transliterišu.
