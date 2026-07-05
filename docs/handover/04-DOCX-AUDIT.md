# DOCX formatiranje — audit i fix uputstvo

*BACKLOG srednji prioritet, prijavljeno 26. jun na NDA primeru. DOCX izlaz zaostaje za PDF-om.*

## Prijavljeni problemi (polazna tačka)

1. Fali "POVERLJIVO" watermark/oznaka u zaglavlju (PDF je ima za NDA)
2. Viseći naslovi — `Član X.` ostane sam na dnu strane
3. Sekcija potpisa — tabela/raspored nekonzistentan sa PDF-om

## Pristup

**Prvo audit, pa fix.** Ne popravljati NDA izolovano — problem je verovatno sistemski u `lib/pdf/docxBuilder.ts`.

### Korak 1: Audit svih tipova

Za svaki od ~20 AI tipova + faktura/putni-nalog/otpremnica/ponuda-za-radove:
1. Generisati dokument (fixture podaci postoje u `scripts/fixtures/` za 6 tipova; za ostale kroz UI ili napraviti fixture)
2. Export PDF i DOCX istog dokumenta
3. Uporediti: header/footer, watermark free plana, naslovi, potpisi, tabele (faktura!), margine
4. Beležiti razlike u tabelu u ovom fajlu (dopisati ispod)

DOCX otvarati u pravom Word-u ili LibreOffice — ne samo preview, prelomi strana se razlikuju.

### Korak 2: Sistemski fixevi u `lib/pdf/docxBuilder.ts`

- **Viseći naslovi**: `docx` paket podržava `keepNext: true` na Paragraph — postaviti na sve heading blokove (h1/h2/h3 iz blok modela). To lepi naslov za sledeći pasus.
- **POVERLJIVO oznaka**: PDF je renderuje po documentType — naći tu logiku u `AisistentDocument.tsx`, replicirati u docxBuilder header (Word watermark je komplikovan; prihvatljivo: uokviren tekst u header-u).
- **Potpis tabela**: uporediti `buildSigData` output rendering — PDF koristi dvokolonski layout; DOCX tabela treba ista dva bloka (levo/desno potpisnik, linija za potpis, ime ispod). Ako je do tada urađen 01-TECH-DEBT stavka 4 (deljeni buildSigData), koristiti ga.
- **Free plan watermark**: proveriti da li DOCX uopšte označava besplatnu verziju kao PDF ("BESPLATNA VERZIJA") — ako ne, dodati u header/footer.

### Korak 3: Regresija

Posle fixeva ponovo generisati bar: nda, ugovor-o-radu, faktura, putni-nalog, opsti-uslovi (najduži dokument — prelomi strana). Vizuelno uporediti sa PDF verzijom.

## Zamke

- `docx` paket: dimenzije su u twips/half-points — ne prepisivati pt vrednosti iz react-pdf direktno
- Roboto font: DOCX ne embeduje fontove kao PDF — font se deklariše po imenu; na mašini bez Roboto pada na default. Prihvatljivo, ali proveriti da dijakritika (č/ć/š/đ/ž) radi u default fontu
- Ne dirati blok parser (`markdownParser.ts`) — on je zajednički sa PDF-om; fixevi idu SAMO u docxBuilder rendering
- DOCX export je Starter+ (`DOCX_PLANS` u `app/api/export/docx/route.ts`) — testirati sa starter nalogom

## Rezultati audita (dopisati tokom rada)

| Tip | Problem | Status |
|-----|---------|--------|
| nda | watermark, viseći naslovi, potpisi | prijavljeno 26.6, nefixovano |
| ... | | |
