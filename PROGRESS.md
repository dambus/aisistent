PROGRESS.md — Task Tracker.md
# AIsistent — Progress & Task Tracker

## Pravila
- Ovaj fajl se ažurira na kraju SVAKE Claude Code sesije
- Nikada ne brišemo završene korake — samo ih označavamo sa ✅
- Novi fajlovi se uvek dodaju u listu ispod
- Git commit ovaj fajl nakon svake sesije

---

## Status projekta
**Trenutna faza:** MVP razvoj  
**Poslednja sesija:** jun 2026.  
**Sledeći zadatak:** Korak 5 — Stripe integracija  
**Poslednja sesija:** Korak C1/C2 završen — 4 nova tipa dokumenta integrisana

---

## Završeni koraci

### ✅ Korak 1 — Supabase setup
- SQL migracija sa tabelama: profiles, documents, subscriptions
- RLS politike za sve tabele
- Trigger: auto-kreiranje profila pri registraciji
- Supabase klijenti: browser, server, admin
- TypeScript tipovi za sve tabele

**Fajlovi:**
- `supabase/migrations/20260603000001_initial_schema.sql`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- `types/database.ts`

---

### ✅ Korak 2 — Auth flow
- Login stranica sa Supabase signInWithPassword
- Register stranica sa email potvrdom
- Auth layout sa AIsistent logom
- Middleware (proxy.ts) — zaštita /dashboard ruta
- Logout komponenta
- Mapa Supabase grešaka → srpski jezik

**Fajlovi:**
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `proxy.ts`
- `components/auth/logout-button.tsx`
- `lib/supabase/errors.ts`

---

### ✅ Korak 3 — Wizard UI + Claude API integracija
- Sistemski prompt za Ugovor o radu (v1.1 sa deklinacijom)
- Generički wizard koji radi za sve tipove ugovora
- Claude API integracija — /api/generate endpoint
- Auth + plan limit provera (free: 1 dokument/mesec)
- Rate limiting (max 10 poziva/sat po korisniku)
- Document preview sa generisanim tekstom
- Dashboard layout sa navigacijom
- Upgrade modal za free korisnike

**Fajlovi:**
- `lib/prompts/ugovor-o-radu.ts`
- `types/wizard.ts`
- `app/api/generate/route.ts`
- `app/(dashboard)/dokumenti/[type]/page.tsx`
- `app/(dashboard)/layout.tsx`
- `components/wizard/DocumentPreview.tsx`
- `components/upgrade-modal.tsx`

---

### ✅ Korak 4 — PDF i DOCX export
- PDF generisanje sa @react-pdf/renderer (serverless kompatibilno)
- Dijagonalni watermark za free plan (potvrđen u PDF stream-u)
- DOCX generisanje sa docx paketom
- Plan check: DOCX samo za Starter+ (free dobija 403)
- Export dugmad sa loading state i srpskim greškama
- maxDuration = 60s na oba export route-a

**Napomena:** PDF prikazuje raw Markdown (zvezdice, crtice, hashtagovi)
umesto formatiranog teksta — fixes se u Koraku 4b.

**Fajlovi:**
- `lib/pdf/AisistentDocument.tsx`
- `lib/pdf/docxBuilder.ts`
- `app/api/export/pdf/route.ts`
- `app/api/export/docx/route.ts`
- `components/wizard/DocumentPreview.tsx` (ažuriran)

---

### ✅ Korak 4b — PDF formatiranje
- Markdown parser koji prepoznaje: # h1, ## h2, **bold**, *italic*, - bullet, ---, prazne redove
- Fallback detekcija rimskih sekcija bez ## prefiksa (I. II. III...)
- Tipografija: Times-Roman 11pt body, Times-Bold 16pt h1 (centrirano), 12pt h2
- Inline bold/italic koristi Times-Bold / Times-Italic / Times-BoldItalic (PDF ugrađeni fontovi)
- Margine: 71pt (~2.5cm) sa svih strana
- Razmak između sekcija: 12pt marginTop na h2

**Fajlovi:**
- `lib/pdf/markdownParser.ts` (novo)
- `lib/pdf/AisistentDocument.tsx` (ažurirano)

---

### ✅ Korak 4c — PDF ispravke
- **Srpska slova**: Registrovani Roboto TTF fontovi (Regular/Bold/Italic/BoldItalic) koji podržavaju Latin Extended — zamenjeni svi Times-Roman i Helvetica
- **Watermark**: Zamenjeno 8 horizontalnih redova sa jednim dijagonalnim tekstom (rotate -45deg, 48pt, #d1d5db, 30% opacity)
- **Datum**: Zamijenjen `toLocaleDateString('sr-RS')` sa manualnim srpskim nizom meseci — pouzdano bez ICU podataka
- **Footer**: Zamenjen `<View fixed>` sa `<View fixed render={() => ...}>` — sprečava dvostruko renderovanje u toku teksta

**Fajlovi:**
- `public/fonts/Roboto-Regular.ttf` (novo)
- `public/fonts/Roboto-Bold.ttf` (novo)
- `public/fonts/Roboto-Italic.ttf` (novo)
- `public/fonts/Roboto-BoldItalic.ttf` (novo)
- `lib/pdf/AisistentDocument.tsx` (ažurirano)

---

### ✅ Korak 4d — Finalne PDF ispravke
1. **Margine/header**: paddingTop 1.5cm (43pt), header kompaktovan u jedan red (logo + datum, flexDirection: row)
2. **Separatori**: `---` u Markdown outputu → spacer umesto vizuelne linije; separator blok renderuje se kao plain spacing
3. **Broj ugovora**: novo opciono polje u wizard (Blok 1 — Poslodavac), placeholder "npr. 001/2026"; ako prazno → `[POPUNITI: broj ugovora]`
4. **Terminologija**: sistemski prompt — pravilo o isključivoj upotrebi "Zaposleni/Zaposlena" i "Poslodavac" van definišućih delova
5. **Orphan naslovi**: `renderBlocks()` grupiše svaki h2 sa sledećim paragrafom u `<View wrap={false}>` — naslov ne može ostati sam na kraju stranice
6. **Watermark redizajn**: uklonjena dijagonala; besplatna verzija dobija mali tekst "BESPLATNA VERZIJA" (8pt, #CCCCCC) ispod disclaimera u footeru
7. **Sekcija potpisa**: dva stupca (`flexDirection: row`) u PDF-u; markdownParser detektuje ` | ` separator → `signature_row` blok; sistemski prompt definiše obavezan format potpisa
8. **Dupli disclaimer**: uklonjena UPOZORENJE sekcija iz sistemskog prompta; dodato u ŠTA NE RADIŠ — "ne dodaješ VAŽNE NAPOMENE ZA POSLODAVCA"
9. **fi-ligatura**: ZWNJ (U+200C) umetnut između f+i i f+l u `parseInline()` — sprečava OpenType ligature bez vizuelne promene

**Fajlovi:**
- `lib/pdf/AisistentDocument.tsx` (ažurirano)
- `lib/pdf/markdownParser.ts` (ažurirano — signature_row, ZWNJ, separator→spacer)
- `lib/prompts/ugovor-o-radu.ts` (ažurirano — broj_ugovora, terminologija, potpis format, uklonjen disclaimer)
- `types/wizard.ts` (ažurirano — broj_ugovora?: string)

---

### ✅ Korak 4f — Finalne tri ispravke
1. **fi-ligatura**: Instrukcija u `buildUserMessage()` — Claude izbegava "fi-" reči kada postoji srpski ekvivalent (novčani/određeni/telesni); ZWNJ ostaje kao sekundarni fallback
2. **Potpisi**: `parseMarkdown()` se zaustavlja kada naiđe na `/POTPISI/i` u liniji; `SignatureSection` komponenta renderuje hardkodovane dva stupca iz `inputData` (firma, zastupnik, funkcija, ime_prezime, mesto_rada); pipe `|` logika uklonjena iz parsera; PDF route sada šalje `input_data` kao `inputData` prop; sistemski prompt instruiše da se XII ne generiše
3. **Zarada terminologija**: u TON I STIL dodat primer "Zaposleni/Zaposlena ima pravo na osnovnu bruto zaradu od..." — bez punog imena

**Fajlovi:**
- `lib/pdf/markdownParser.ts` (uklonjen signature_row, dodat stop-at-POTPISI)
- `lib/pdf/AisistentDocument.tsx` (nova SignatureSection komponenta, inputData prop)
- `app/api/export/pdf/route.ts` (dodato input_data u select, prosleđeno kao inputData)
- `lib/prompts/ugovor-o-radu.ts` (fi-instrukcija, zarada pravilo, uklonjen | format)

---

### ✅ Korak 4g — Ispravke sekcije potpisa
1. **Naslov**: uklonjen h2 "POTPISI I PEČATI", zamenjen sa "Ugovor potpisuju:" (Roboto 11pt, siva boja); sistemski prompt eksplicitno zabranjuje POTPISI sekciju pod bilo kojim rimskim brojem
2. **Grupisanje**: poslednji blok dokumenta i `SignatureSection` su u zajedničkom `<View wrap={false}>` — nikad razdvojeni prelaskom stranice

**Fajlovi:**
- `lib/pdf/AisistentDocument.tsx` (sigIntro stil, lastNode grupisanje)
- `lib/prompts/ugovor-o-radu.ts` (pojačana zabrana POTPISI sekcije)

---

### ✅ Korak C1 — Codex: 4 nova prompt fajla i tipovi
- `ugovor-o-delu.ts` — scenario A/B/C za poreske tretmane, wizard 6 koraka
- `nda.ts` — jednostrani i dvostrani NDA, izuzeci, ugovorna kazna
- `ugovor-o-zakupu.ts` — stambeni/poslovni/kratkoročni, deponija, komunalije
- `ugovor-o-saradnji-zajmu.ts` — poslovna saradnja ili zajam, kamata

**Fajlovi:**
- `lib/prompts/ugovor-o-delu.ts`
- `lib/prompts/nda.ts`
- `lib/prompts/ugovor-o-zakupu.ts`
- `lib/prompts/ugovor-o-saradnji-zajmu.ts`
- `types/wizard.ts` (prošireno — 4 nova interfejsa, WizardFormData union)
- `app/api/generate/route.ts` (svih 5 tipova sa Zod shemama)

---

### ✅ Korak C2 — Integracija i ispravke novih tipova
- **Ispravke promptova**: uklonjen dupli disclaimer (UPOZORENJE NA KRAJU) iz sva 4 prompta; POTPISI sekcija označena kao "ne generiši"
- **SignatureSection**: generička implementacija za svih 5 tipova (`buildSigData` switch) — ispravni nazivi strana za svaki tip dokumenta
- **PDF route**: prosleđuje `documentType` za ispravan potpis
- **Wizard routing**: `dokumenti/[type]/page.tsx` pokriva svih 5 tipova, `notFound()` za nepostojeće
- **Dashboard kartice**: 5 kartica za svaki tip dokumenta; arhiva lista prikazuje tip dokumenta

**Fajlovi:**
- `lib/pdf/AisistentDocument.tsx` (generička SignatureSection, documentType prop)
- `app/api/export/pdf/route.ts` (documentType prop)
- `app/(dashboard)/dokumenti/[type]/page.tsx` (svih 5 tipova)
- `app/(dashboard)/dashboard/page.tsx` (kartice + tip u arhivi)

---

## Aktivni zadaci

### ⏳ Korak 5 — Stripe integracija
- [ ] `lib/stripe/config.ts` — planovi i price IDs
- [ ] `app/api/stripe/checkout/route.ts`
- [ ] `app/api/stripe/portal/route.ts`
- [ ] `app/api/webhooks/stripe/route.ts`
- [ ] `app/cenovnik/page.tsx`
- [ ] `components/upgrade-modal.tsx` (ažurirati sa Stripe linkom)

---

### ⏳ Korak 6 — Landing page
- [ ] Hero sekcija
- [ ] Kako funkcioniše (3 koraka)
- [ ] Tipovi ugovora
- [ ] Cenovnik sekcija
- [ ] CTA

---

### ⏳ Korak 7 — Dashboard arhiva
- [ ] Lista svih dokumenata korisnika
- [ ] Filter po tipu i datumu
- [ ] Ponovni export iz arhive

---

### ⏳ Korak 8 — Deploy na Vercel
- [ ] Supabase cloud setup
- [ ] Environment varijable na Vercel
- [ ] Custom domena aisistent.rs
- [ ] Stripe webhook URL ažuriranje

---

## Poznati problemi / Tech dug
- Email verifikacija ne radi lokalno → isključiti u development modu
- Lokalni Supabase ne deli podatke između računara → rešava se deployom

---

## Struktura projekta (trenutno stanje)

```
aisistent/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── dokumenti/[type]/page.tsx
│   └── api/
│       ├── generate/route.ts
│       └── export/
│           ├── pdf/route.ts
│           └── docx/route.ts
├── components/
│   ├── auth/logout-button.tsx
│   ├── wizard/DocumentPreview.tsx
│   └── upgrade-modal.tsx
├── lib/
│   ├── prompts/ugovor-o-radu.ts
│   ├── pdf/
│   │   ├── AisistentDocument.tsx
│   │   ├── markdownParser.ts
│   │   └── docxBuilder.ts
├── public/
│   └── fonts/
│       ├── Roboto-Regular.ttf
│       ├── Roboto-Bold.ttf
│       ├── Roboto-Italic.ttf
│       └── Roboto-BoldItalic.ttf
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       ├── admin.ts
│       └── errors.ts
├── supabase/migrations/
│   └── 20260603000001_initial_schema.sql
├── types/
│   ├── database.ts
│   └── wizard.ts
├── proxy.ts
├── CLAUDE.md
└── PROGRESS.md
```

---

## Napomene za razvoj
- Lokalni Supabase: `supabase start` pre pokretanja projekta
- Dev server: `npm run dev`
- Supabase Studio: `http://127.0.0.1:54323`
- Inbucket (fake email): `http://127.0.0.1:54324`
- Email confirmations isključiti u development modu