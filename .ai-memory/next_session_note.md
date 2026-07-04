---
name: next-session-note
description: Poruka za sledeću sesiju — PIVOT na biblioteku obrazaca (4. jul), FAZA4 spec čeka review
metadata:
  type: project
---

## ⚠️ PIVOT — Biblioteka obrazaca (4. jul 2026., PRVO PROČITATI)

Milan testirao Upload & Fill na produkciji (PPDG-1, Obrazac 1, OPD-o): **keširanje radi** (produkcijski checkpoint keša time neformalno potvrđen), ali zaključak je da feature u ovom obliku nema vrednost — previše grešaka (pogrešno/nepročitana polja), zbunjujuća polja, automatsko/ručno popunjavanje kroz app frustrira umesto da pomaže.

**Nova ideja (Milanova, Claude se složio):** kurirana biblioteka bitnih zvaničnih obrazaca (sa sajtova javnih ustanova), svi na jednom mestu, pre-filled SAMO zelenim profil podacima, download kao EDITABILAN PDF (AcroForm bez flatten) — ostatak korisnik popunjava ručno u Adobe-u (nije naša odgovornost). Faza 1–3 pipeline postaje interni kuratorski alat (prvi predlog mapiranja koji čovek verifikuje); kod se NE briše; Upload & Fill se sklanja iz navigacije.

**Spec napisan: `docs/obrasci/FAZA4_BIBLIOTEKA_OBRAZACA.md` — čeka Milanov review pre implementacije.** Sadrži i otvorena pitanja (plan gating, sudbina Upload & Fill, inicijalna lista obrazaca, kategorije, naming) — proći kroz njih sa Milanom pre Koraka 1.

## Gde smo stali (3. jul 2026., kraj prethodne sesije)

Faza 3 KOMPLETNA (Koraci 1-7). Korak 5 (template keš u pipeline-u) + Korak 6 (template feedback) implementirani i pushovani (`80feefd` + bugfix commit). Korak 7 validacija odrađena LOKALNO na 3 obrasca (PPDG-1S acroform, Обrazac 1 eko taksa flat, PPI-2 flat) — sve prošlo, 2 mapper bagfixa usput.

**Migracija `20260703000001_add_template_feedback.sql` primenjena na produkciju** (Milan, ručno kroz SQL editor — supabase CLI nije ulogovan na ovoj mašini).

## ~~ČEKA VERIFIKACIJU NA PRODUKCIJI~~ → potvrđeno 4. jula (Milan: "kesiranje radi")

## Šta je sledeće

1. **Milanov review FAZA4 spec-a** + odgovori na otvorena pitanja (sekcija 12 spec-a)
2. Implementacija Faze 4 po koracima iz spec-a (Korak 1: migracija + fill bez flatten)
3. Stari pipeline gapovi ("caption bez podvlake", 5B, adresa split) — sada relevantni samo kao ograničenja KURATORSKOG alata, ne user-facing bug

## Napomena za kuratorski alat (Faza 4 Korak 2)

`scripts/test-full-pipeline.ts` + `composeGuideFields.ts` su osnova za `curate-form.ts`. Duplikat/composite/potpis guardovi važe i za kuratorske predloge.

## composeGuideFields.ts (3. jul, refaktor + duplikat fix) — bitno ako se dira pipeline

Post-processing (rawFields → composite same-line → cross-row duplikat dedup → telefon hintovi) + `groupIntoSections` IZDVOJENI u `lib/documentIntelligence/composeGuideFields.ts`. Ranije TRI kopije (di-analyze route, test-full-pipeline, test-template-cache) — sad SVE koristi ovaj modul; test skripte provlače pravi produkcijski kod. Ne vraćati logiku inline.

**Cross-row duplikat dedup** (fix za OPD-o bug): ista labela + ista strana + nije same-line composite → vrednost zadržava samo NAJŠIRI box, ostali manual + hint. Kriterijum STRUKTURNI (profileKey, ne trenutna vrednost) — namerno, da bi se odluka keširala u form_templates i važila za svakog korisnika na cache hit. `neverAutofill` set (composite sekundarna + duplikati) ide u template struct kao `confidence: null`.

## Tehnički kontekst keša (Korak 5) — bitno ako se dira

- **Keš čuva SAMO strukturu**: `TemplateFieldStruct` (id, label, profileKey, isInternal, confidence, hint) + `TemplateSectionShape` (title, page, fieldIds). NIKAD suggestedValue.
- `confidence: null` u strukturi = composite sekundarno polje — nikad se ne auto-popunjava iako profileKey može biti postavljen (čuva se radi identičnog outputa).
- Na HIT: `rehydrateFields()` (privatna u di-analyze/route.ts, KOPIJA u scripts/test-template-cache.ts — održavati sinhronizovano; route ne sme da eksportuje ne-HTTP simbole) puni vrednosti sveže preko `profileValue()` (sad eksportovan iz semanticMapper.ts).
- Template bez `sections` se tretira kao MISS.
- Greška keš sloja (fingerprint, lookup, save) NIKAD ne obara zahtev — log + pun pipeline.
- `di-analyze` response: `{ fields, sections, fingerprint, cached }`; klijent šalje i `filename` (postaje template name).
- STOP checkpoint zahteva da output iz keša bude IDENTIČAN punom pipeline-u — test to potvrđuje polje-po-polje (JSON compare).

## Mapper bagfixevi (3. jul) — ne vraćati unazad

1. **Čisto numeričke labele → null bez Claude poziva** (`/\p{L}/u` guard u mapFieldsToProfile). Razlog: sekcijski kontekst (Korak 2) navodio Claude-a da pogađa — "1." u sekciji o računu u banci → ziro_racun u pogrešnoj koloni (Место).
2. **Prompt pravilo 8**: labele koje traže samo šifru delatnosti ("Шифра") → null; "Назив и шифра претежне делатности" i dalje mapira. Razlog: ceo tekst delatnosti u kratko comb polje za šifru.

## Test alati (ova mašina, 3. jul)

- `scripts/test-template-cache.ts <pdf> [--keep]` — keš A-E faze (determinizam, leak check, HIT/MISS identičnost, hit_count, svež profil). Piše u produkcijsku bazu, briše red na kraju osim uz --keep.
- `scripts/test-full-pipeline.ts <pdf> [--fill-manual] [--dump-json]` — `--fill-manual` upisuje TEST-UNOS-N u prvih 5 manual polja sa labelom (preskače potpise), simulira wizard flip manual→low.
- Test obrasci: `C:\Users\milan\Downloads\za claude\` (PPDG-1S-p.pdf, Obrazac-1-prijava-EKO-takse.pdf) i `C:\Users\milan\Downloads\novi obrasci\` (PPI-2, 3040, JRPPS, M-A, Dodatak_15).
- `pymupdf` instaliran (`import fitz`) za render popunjenih PDF-ova.
- `.env.local` sada pokazuje na PRAVU produkcijsku Supabase (dgsuspjxegciwlzqpzxn) sa novim sb_secret_/sb_publishable_ ključevima (rotirani 3. jula; stari JWT ključevi ne važe).
- supabase CLI: projekat linkovan, ali NEMA access tokena (login je interaktivan, ne radi u sesiji) — migracije ići kroz dashboard SQL editor ili Milan `npx supabase login` u svom terminalu.

## Tehnički kontekst (Faza 1-3, i dalje važi)

**WizardView imenovanje:** `WizardView.tsx` = STARI Faza 1 DOCX wizard. Faza 3 wizard = `SectionWizardView.tsx`.

**Stage shape u ObraściClient.tsx:** `di-guide`/`di-wizard`/`di-preview` nose `sectionShapes` + `fields`/`confirmedFields` (jedini izvor istine za vrednosti) + `fingerprint`. `buildSections(fields, shapes)` spaja kad treba FormSection[].

**SectionWizardView:** `updateValue` flip manual→low kad korisnik upiše; `onBack(fields)` nosi vrednosti.

**Koordinate:** DI inči (Y=0 vrh) → pdf-lib pt (Y=0 dno): `x=bbox.x*72`, `y=pageH-(bbox.y+bbox.h)*72`. TEXT_X_OFFSET_PT=3.

**AcroForm fill:** `fillAcroFormFields` → `setFontSize(9)` → `setText` → `updateFieldAppearances` → `flatten()`. Flat: DI re-run + `fillTableCells`. **fontkit:** `require('fontkit')` (CJS). **Transliteracija:** `toDocumentScript()` ima `isNonTransliterable()` guard za email/website.
