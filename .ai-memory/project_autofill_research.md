---
name: project-autofill-research
description: Istraživanje dva autofill featura — sačuvani kontakti/katalog i Upload & Fill za tuđe obrasce
metadata:
  type: project
---

## 1. Sačuvani kontakti, katalog usluga, zaposleni

`companyFieldMap` već popunjava *tvoju* firmu u svim tipovima dokumenta. Praznina je **druga strana** — kupac, naručilac, zakupac — koji se kuca iznova.

Tri pod-featura (po prioritetu):

1. **Sačuvani kontakti** (Starter+) ✅ — `contacts` tabela + `contactFieldMap`, ista logika kao `companies`. U produkciji.
2. **Katalog usluga/artikala** (Pro+) ✅ (10. jul 2026., implementirano — čeka `supabase db push` na produkciju) — `catalog_items` tabela, "+ Iz kataloga..." dropdown u `FakturaStavkeField` (deljen između faktura/ponuda-za-radove/otpremnica; `ponuda-klijentu` izostavljena, nema stavke uopšte). Detalji: `PROGRESS.md` (10. jul, dodatak).
3. **Sačuvani zaposleni** (Pro+) — nova `employees` tabela, za HR dokumente. Osetljivi podaci (JMBG, plata) — pažnja oko RLS. Sledeće na redu.

**How to apply:** Implementirati ovim redosledom pre nego što se kreće na Upload & Fill — bez bogatog profila auto-fill nema vrednost.

---

## 2. Upload & Fill — automatsko popunjavanje tuđih obrazaca

Korisnik uploaduje RFQ, tender ili interni obrazac partnera (SAP/DMS), aplikacija prepozna polja i auto-popuni iz profila firme.

| Tip | Pouzdanost | Pristup |
|-----|-----------|---------|
| AcroForm PDF | 95%+ | `pdf-lib` čita named fields direktno |
| DOCX sa placeholderima | 90%+ | `mammoth.js` + Claude pattern matching |
| Flat PDF | 70-80% | Claude Vision — ne ulaziti za MVP |

**Cena:** ~$0.02 po analizi. Vreme: 3-7s. Nisu faktori.

**Preduslov za vrednost:** Feature ima smisla tek kada postoje sačuvani kontakti + katalog — tada auto-fill pokriva 40-50% obrasca umesto 3-5 polja.

**MVP scope:** AcroForm PDF + DOCX, Pro/Agency plan. Ne ulaziti u flat PDF overlay ni web forme državnih portala (ePorezi, APR).

**Status (jul 2026.):** Faza 1 Korak 1–7 kompletni. Stranica aktivna u produkciji.

**Implementiran pristup — Azure DI + geometrijsko matching + Claude semantički mapper:**
- `analyzeLayout.ts` — Azure DI `prebuilt-layout`; vraća `lines`, `paragraphs`, `words`, `tables`, `selectionMarks`
- `extractAcroFormFields.ts` — AcroForm polja sa pouzdanim brojevima strana via `widget.P()`
- `matchFieldLabels.ts` — same-line matching via `lines` (ne paragraphs); confidence = relativna margina + DI word conf + solo dist
- `extractFlatPdfFields.ts` — flat PDF: prazne table-ćelije (high), selection marks (high/low), podvlake (low)
- `semanticMapper.ts` — Claude mapira (labela, polje) parove na 13 profil ključeva; null-label → automatski null bez API poziva
- `GuideView.tsx` — 3 eksplicitna stanja: high (zeleno), low (narandžasto), manual (sivo)
- `/api/obrasci/di-analyze` — orchestration endpoint, `maxDuration: 60`
- PPDG-1S: 7 polja mapirana iz profila, 191 manual (računovodstvene pozicije nisu u profilu firme)

**Sledeće (Korak 8):** Validacija na 5+ obrazaca; Tb1-Tb4 bug (numbered list desno od checkboxova).

**Why:** Diferenciator za preduzetnika koji redovno odgovara na tendere velikih kupaca ili HR koji popunjava iste anekse za zaposlene u DOCX formatu klijenta.
