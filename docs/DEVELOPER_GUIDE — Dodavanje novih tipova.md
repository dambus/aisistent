# AIsistent — Developer Guide
### Kako dodati novi tip dokumenta

---

## Checklist — novi tip dokumenta

Svaki put kada dodaješ novi alat/dokument,
prođi kroz SVAKU stavku ove liste.

### 1. lib/prompts/[naziv].ts
- [ ] systemPrompt — sadrži ## JEZIČKI STANDARD
- [ ] systemPrompt — sadrži ## SRPSKI JEZIK I DEKLINACIJA
- [ ] systemPrompt — sadrži ## ŠTA NE RADIŠ sa:
  - [ ] Zabrana auto-generisanja datuma u zaglavlju
  - [ ] Zabrana auto-generisanja datuma potpisivanja
  - [ ] Zabrana SCENARIO A/B/C u tekstu (ako relevantno)
  - [ ] Zabrana PRILOZI sekcije (ako relevantno)
  - [ ] Zabrana duplog disclaimera
- [ ] systemPrompt — sadrži ## OPCIONI ELEMENTI (ako relevantno)
- [ ] buildUserMessage() — završava rečenicom o nominativu
- [ ] buildUserMessage() — sadrži broj_ugovora logiku
- [ ] wizardSteps — SVA polja imaju coverage:
  - [ ] text/textarea → placeholder (format: "npr. ...")
  - [ ] number → helperText sa jedinicom i opsegom
  - [ ] radio/dropdown → tooltip koji objašnjava opcije
  - [ ] toggle → helperText ili tooltip
  - [ ] date → helperText

### 2. types/wizard.ts
- [ ] Dodat novi FormData interfejs
- [ ] broj_ugovora?: string (ako dokument ima broj)

### 3. app/api/generate/route.ts
- [ ] Dodat case za novi tip
- [ ] Zod schema ažurirana

### 3b. app/(dashboard)/dokumenti/[type]/ ← ČESTO SE ZABORAVLJA
- [ ] Dodat u SUPPORTED_TYPES u page.tsx
- [ ] Dodat entry u documentMeta u WizardPageClient.tsx

### 4. lib/utils/companyFieldMap.ts ← ČESTO SE ZABORAVLJA
- [ ] Dodat entry za novi tip
- [ ] Mapirana sva relevantna polja
- [ ] Posebni slučajevi dokumentovani kao komentar

### 5. lib/pdf/AisistentDocument.tsx
- [ ] buildSigData() ima case za novi tip
- [ ] Labele bez kose crte
- [ ] Da li dokument treba potpis?
  - Dve strane → buildSigData() sa levo/desno labelama
  - Jedna strana → buildSigData() samo levo (rightLabel: '', rightOrg: '', rightPerson: '')
  - Bez potpisa → buildSigData() vraća null + ŠTA NE RADIŠ zabrana u promptu
- [ ] Ako nema potpise → return null

### 6. lib/pdf/docxBuilder.ts
- [ ] Sinhronizovano sa AisistentDocument.tsx

### 7. data/reminders.ts
- [ ] Dodat relevantan podsetnik
- [ ] Podsetnik mora biti:
  - [ ] Specifičan za taj tip dokumenta
  - [ ] Akciono orijentisan (šta korisnik treba da uradi)
  - [ ] `type: 'warning'` za pravne/poreske obaveze
  - [ ] `type: 'info'` za savete i preporuke
  - [ ] `learnMoreUrl` postaviti kada postoji relevantna stranica u aplikaciji
        (npr. `/alati/kalkulator-zarade` za ugovor o radu)

### 8. components/dashboard/Sidebar.tsx
- [ ] Novi alat u odgovarajućoj kategoriji

### 9. app/(dashboard)/dashboard/page.tsx
- [ ] Novi alat u gridu

### 10. app/page.tsx
- [ ] Novi alat na landing page-u

### 11. lib/utils/documentTypes.ts
- [ ] Dodat human-readable naziv

---

## Trenutna mapiranja u companyFieldMap (jun 2026.)

ugovor-o-radu:
  naziv → naziv_firme
  pib → pib
  maticni_broj → maticni_broj
  adresa → adresa_firme
  zastupnik → zastupnik
  funkcija_zastupnika → funkcija

ugovor-o-delu:
  naziv → naziv_narucioca
  pib → pib_narucioca
  adresa → adresa_narucioca
  zastupnik → zastupnik_narucioca

nda:
  naziv → naziv_strane_1
  pib → pib_strane_1
  adresa → adresa_strane_1
  zastupnik → zastupnik_strane_1

ugovor-o-zakupu:
  naziv → naziv_zakupodavca
  pib → jmbg_pib_zakupodavca
  adresa → adresa_zakupodavca
  zastupnik → zastupnik_zakupodavca

ugovor-o-saradnji:
  naziv → naziv_1
  pib → id_1
  adresa → adresa_1
  zastupnik → zastupnik_1

punomocje:
  naziv → naziv_vlastodavca
  pib → jmbg_pib_vlastodavca
  adresa → adresa_vlastodavca

ponuda-klijentu:
  naziv → ponudjac_naziv
  pib → ponudjac_pib
  adresa → ponudjac_adresa
  zastupnik → kontakt_osoba

poslovni-mejl:
  naziv → posiljalac_firma
  (nema PIB, adresu ni zastupnika)

oglas-za-posao:
  naziv → naziv_firme
  adresa → grad (POSEBAN SLUČAJ: samo grad!)

opsti-uslovi:
  naziv → naziv_firme
  pib → pib
  adresa → adresa

---

## Tipovi po potpisu

DOKUMENTI SA POTPISOM (dve strane):
  ugovor-o-radu, ugovor-o-delu, nda,
  ugovor-o-zakupu, ugovor-o-saradnji-zajmu,
  punomocje, ponuda-klijentu

DOKUMENTI SA POTPISOM (jedna strana):
  pravilnik-o-radu, resenje-godisnji-odmor,
  preporuka

DOKUMENTI BEZ POTPISA (buildSigData vraća null):
  poslovni-mejl, oglas-za-posao, opsti-uslovi,
  odgovor-kandidatu, opis-proizvoda, bio-o-nama,
  zapisnik-sastanak

---

## Konvencije

DATUMI:
- Zaglavlje: uvek ___________ (prazno)
- Datum potpisivanja: uvek ___________ (prazno)
- Jedini auto-datum: datum stupanja na snagu iz wizarda

ROD U POTPISIMA:
- Ugovor o radu: rod po imenu kroz telo dokumenta
- Svi ostali: neutralni muški oblik, bez kose crte

BROJ DOKUMENTA:
- Uvek opciono (required: false)
- Ako prazno → ne generiše red Broj: u zaglavlju

OPCIONI ELEMENTI:
- Zakonski obavezni: uvek generisati
- Neobavezni: toggle u Napredne opcije bloku

PDF/DOCX:
- Svaka promena u AisistentDocument.tsx → ista u docxBuilder.ts

---

## Česte greške

Modal bez popunjavanja polja
→ companyFieldMap nema entry za tip dokumenta

Datum se auto-generiše
→ System prompt nema pravilo za datume u ŠTA NE RADIŠ

Ćirilična slova u PDF-u
→ Text nije prošao kroz sanitizeText() u markdownParser.ts

Kosa crta u potpisu
→ buildSigData() nije ažuriran u oba fajla (PDF i DOCX)

Placeholder nedostaje
→ Wizard audit: pokrenuti WIZARD_AUDIT task

Dupli naslov (AI generiše naslov koji PDF već prikazuje)
→ ŠTA NE RADIŠ zabrana u promptu: "Ne generiši naslov dokumenta kao prvi red."

Potpisi na dokumentima koji ih ne zahtevaju
→ buildSigData() mora vraćati null za taj tip + ŠTA NE RADIŠ zabrana u promptu

Skraćen tekst na kraju dokumenta
→ Regex u markdownParser.ts i docxBuilder.ts seče na POTPISI — proveri da regex
  bude striktan: /^#{0,3}\s*POTPISI\s*$/i (samo section headeri, ne mid-sentence reč)

Step prikazuje pogrešan sadržaj
→ showIf logika nedostaje u wizardSteps

Wizard se ne učitava (404)
→ WizardPageClient.tsx ima odvojenu documentMeta mapu koja nije ažurirana
→ Dodati type u documentMeta u WizardPageClient.tsx I u SUPPORTED_TYPES u page.tsx

---
*jun 2026. — ažurirati pri svakom novom tipu dokumenta*
