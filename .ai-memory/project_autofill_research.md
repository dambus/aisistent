---
name: project-autofill-research
description: Istraživanje dva autofill featura — sačuvani kontakti/katalog i Upload & Fill za tuđe obrasce
metadata:
  type: project
---

## 1. Sačuvani kontakti, katalog usluga, zaposleni

`companyFieldMap` već popunjava *tvoju* firmu u svim tipovima dokumenta. Praznina je **druga strana** — kupac, naručilac, zakupac — koji se kuca iznova.

Tri pod-featura (po prioritetu):

1. **Sačuvani kontakti** (Starter+) — nova `contacts` tabela + `contactFieldMap`, ista logika kao `companies`. Primenjuje se na: faktura (kupac), ugovor-o-delu (izvođač), NDA (strana 2), ugovor-o-zakupu, ponuda-klijentu, ugovor-o-saradnji.
2. **Katalog usluga/artikala** (Pro+) — nova `catalog_items` tabela, dropdown u stavkama fakture/ponude/otpremnice.
3. **Sačuvani zaposleni** (Pro+) — nova `employees` tabela, za HR dokumente. Osetljivi podaci (JMBG, plata) — pažnja oko RLS.

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

**Status (jun 2026.):** MVP izgrađen i testiran. Pauziran. Kod u repou (`app/api/obrasci/`, `components/obrasci/`), stranica nedostupna.

**Šta je otkriveno implementacijom:**
- AcroForm sa described poljem + DOCX sa placeholderima → radi dobro ✅
- Srpski državni obrasci (PPDG-1S, ekotaksa...) → T1–T189 numerički nazivi polja; keyword matching beskoristan
- Fundamentalni problem: vizuelna semantika forme je u PDF vizuelnom sloju, ne u AcroForm metapodacima
- Tri puta napred: JSON baza poznatih obrazaca (preporučen MVP), koordinatno parsiranje, Vision AI
- Vision AI (Put C) je najrobustniji ali zahteva Puppeteer van Vercel serverless

**Sledeći korak kad se nastavi:** Faza 1 — JSON mapiranje za ~30 najčešćih srpskih obrazaca.

**Why:** Diferenciator za preduzetnika koji redovno odgovara na tendere velikih kupaca ili HR koji popunjava iste anekse za zaposlene u DOCX formatu klijenta.
