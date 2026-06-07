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
**Poslednja sesija:** Faza 2 promptovi kreirani — 5 novih alata

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

### ✅ Korak D1 — Codex: docxBuilder.ts ažuriran
`docxBuilder.ts` dobio punu paritet sa PDF rendererom:
- Markdown parser (`parseMarkdown`) za block-level formatiranje
- `buildSigData` za sve tipove dokumenta (isti map kao u AisistentDocument)
- Tabela potpisa sa dva stupca (bez vidljivih bordura)
- Header: AIsistent | datum | aisistent.rs
- Footer: disclaimer + BESPLATNA VERZIJA za free plan
- `sanitizeGeneratedText` — seče na POTPISI i NAPOMENE ZA POSLODAVCA

---

### ✅ Korak D2 — DOCX export ispravke
**Pronađeni bug**: DOCX route nije prosleđivao `input_data`, `documentType` ni `isFree` ka `buildDocx` — potpisi su bili prazni za sve tipove.

**Ispravke u `app/api/export/docx/route.ts`:**
- Dodano `input_data, is_free` u Supabase select
- `buildDocx` pozvan sa `{ documentType, inputData, isFree }` opcijama

`docxBuilder.ts` nije menjao — bio je ispravan od Codexa.
TypeScript: 0 grešaka.

**Fajlovi:**
- `app/api/export/docx/route.ts` (ispravka — prosleđivanje opcija)

---

### ✅ Korak F1 — Codex: 5 novih prompt fajlova
- `punomocje.ts` — opšte/specijalno/sudsko/nepokretnosti punomoćje
- `opsti-uslovi.ts` — Opšti uslovi korišćenja + Politika privatnosti u jednom pozivu
- `poslovni-mejl.ts` — B2B poslovni mejlovi po tipu, tonu i hitnosti
- `oglas-za-posao.ts` — oglasi za posao za Infostud, LinkedIn i sajt firme
- `ponuda-klijentu.ts` — strukturirane B2B poslovne ponude

**Fajlovi:**
- `lib/prompts/punomocje.ts`
- `lib/prompts/opsti-uslovi.ts`
- `lib/prompts/poslovni-mejl.ts`
- `lib/prompts/oglas-za-posao.ts`
- `lib/prompts/ponuda-klijentu.ts`
- `types/wizard.ts` (prošireno novim data interfejsima)

TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`).

---

### ✅ Korak F2 — Integracija 5 novih alata

**Ispravke Codex rada:**
- `poslovni-mejl.ts`: dodat `predmet` (opciono) polje u wizard i `buildUserMessage()` — subject je sada posebno polje, ne deo tela mejla
- `AisistentDocument.tsx`: `buildSigData` vraća `SigData | null`; `SignatureSection` refaktorisana da prima `sig` kao prop; main render preskače potpise za mejl/oglas
- `docxBuilder.ts`: isti null pattern za `buildSigData`; `buildSignatureTable` proverava null; non-null assertion tamo gde je `signatureTable !== null` garancija

**Novi case-ovi u buildSigData (oba fajla):**
- `punomocje`: vlastodavac levo, punomoćnik desno
- `opsti-uslovi`: firma levo, desna kolona prazna
- `poslovni-mejl`: null (bez potpisa)
- `oglas-za-posao`: null (bez potpisa)
- `ponuda-klijentu`: ponuđač levo, "Za klijenta:" desno

**Ostale integracije:**
- `route.ts`: 5 novih Zod shema + 5 novih unosa u `documentConfigs`; requestSchema enum proširen
- `dokumenti/[type]/page.tsx`: svih 10 tipova pokriveno
- `dashboard/page.tsx`: kategorije (Ugovori i dokumenti / Poslovna komunikacija / HR i zapošljavanje) sa 10 kartica
- TypeScript: 0 grešaka

**Fajlovi:**
- `app/api/generate/route.ts`
- `lib/pdf/AisistentDocument.tsx`
- `lib/pdf/docxBuilder.ts`
- `app/(dashboard)/dokumenti/[type]/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `lib/prompts/poslovni-mejl.ts` (predmet polje)
- `types/wizard.ts` (predmet?: string u PoslovniMejlData)

---

### ✅ Korak F3 — Markdown tabele u PDF i DOCX exportu
- `parseMarkdown()` prepoznaje Markdown tabele, preskače separator red i grupiše uzastopne redove u `table` blok
- PDF renderer prikazuje tabele kroz `View`/`Text`, sa header pozadinom, borderima, naizmeničnim redovima i 60/40 širinom za dve kolone
- DOCX builder prikazuje tabele kroz `Table`, `TableRow` i `TableCell`, sa istim osnovnim stilom i širinama
- Bold `UKUPNO` poslednji red dobija bold tekst i istaknutiju pozadinu
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `lib/pdf/markdownParser.ts`
- `lib/pdf/AisistentDocument.tsx`
- `lib/pdf/docxBuilder.ts`

---

### ✅ Korak F4 — Landing page skeleton
- Kreiran `app/page.tsx` landing page za AIsistent.rs
- Sekcije: sticky navigacija, hero, kako radi, alati, poređenje, cenovnik, finalni CTA i footer
- Mobilni meni koristi native `details/summary`, bez client-side JavaScript-a
- Dodati statički metadata title i description
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `app/page.tsx`
- `PROGRESS.md`

---

---

### ✅ Korak G1 — Codex: landing page skeleton
- `app/page.tsx` kreiran sa svim sekcijama: Hero, Kako radi, Alati, Zašto AIsistent, Cenovnik, CTA, Footer
- Podaci za sve sekcije (steps, toolCategories, pricing) strukturirani kao konstante
- Tailwind emerald dizajn, responsive layout

**Fajlovi:**
- `app/page.tsx`

---

### ✅ Korak G2 — Landing page dizajn i auth integracija
1. **Auth integracija**: `Home()` je async Server Component; Supabase sesija se čita server-side; navigacija i CTA dugmad se adaptiraju (Moji dokumenti vs Počnite besplatno)
2. **Tool kartice**: svaki alat ima `type` slug; linkovi vode na `/dokumenti/[type]` (ulogovan) ili `/register` (nije ulogovan)
3. **Primarna boja `#1B6B4A`**: dodata u `globals.css` kao CSS varijabla; koristi se via inline styles za konzistentnost sa Tailwind v4
4. **Smooth scroll**: `html { scroll-behavior: smooth }` u globals.css
5. **OG meta tagovi**: title, description, url, locale, type — ispravni za srpsko tržište
6. **MobileMenu**: `components/landing/MobileMenu.tsx` — Client Component sa useState, hamburger ikonom, auth-aware dugmad
7. **Footer**: linkovi za login/register/cenovnik, email, "Napravljeno u Srbiji 🇷🇸"
8. **layout.tsx**: `lang="sr"`, default metadata ažuriran
9. **Dizajn**: step numbering, separator linije u kategorijama, hover animacije na karticama i dugmadima
- Build čist (`next build`), TypeScript 0 grešaka

**Fajlovi:**
- `app/page.tsx` (kompletno prepisano)
- `app/globals.css` (primary boja, smooth scroll)
- `app/layout.tsx` (lang=sr, metadata)
- `components/landing/MobileMenu.tsx` (novo)

---

---

### ✅ Korak H — Sidebar navigacija

- **`Sidebar.tsx`** — Client Component (260px fiksni panel desktop, overlay na mobilnom)
  - `usePathname()` za detekciju aktivne rute (leva bordura + svetlija pozadina)
  - `useState` + `localStorage` za pamćenje ekspandovanih kategorija između sesija
  - Smooth height transition via `max-height` CSS trick
  - 3 kolapsibilne kategorije alata + "Uskoro" (disabled stavke sa tooltip)
  - Donji deo: Arhiva / Profil / Podešavanja / Odjava
  - Mobile: hamburger top bar (48px) + slide-in overlay + backdrop
- **`layout.tsx`** — Server Component prosleđuje `plan` i `userInitials` Sidebar-u; layout zamenjuje stari top header
- **Placeholder stranice**: `/arhiva`, `/profil`, `/podesavanja`
- TypeScript: 0 grešaka, `next build` čist

**Fajlovi:**
- `components/dashboard/Sidebar.tsx` (novo)
- `app/(dashboard)/layout.tsx` (ažurirano)
- `app/(dashboard)/arhiva/page.tsx` (novo)
- `app/(dashboard)/profil/page.tsx` (novo)
- `app/(dashboard)/podesavanja/page.tsx` (novo)

---

### ✅ Korak I — Kontekstualni podsetnici posle generisanja
- Dodata mapa `documentReminders` za svih 10 tipova dokumenata/alata
- Kreiran `ReminderBox` sa info/warning stilovima i opcionim "Saznaj više" linkom
- `DocumentPreview` prikazuje podsetnik iznad export dugmadi kada postoji generisani dokument
- Wizard ruta prosleđuje `documentType` u `DocumentPreview`
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `data/reminders.ts` (novo)
- `components/wizard/ReminderBox.tsx` (novo)
- `components/wizard/DocumentPreview.tsx`
- `app/(dashboard)/dokumenti/[type]/page.tsx`

---

### ✅ Korak J — Preview Markdown i sidebar boje
- Instaliran `react-markdown`
- `DocumentPreview` renderuje generisani tekst kao Markdown umesto raw/plain teksta
- Sidebar ikone kategorija i donje navigacije koriste uniformnu sivu `#9CA3AF`; aktivna stavka ostaje zelena
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `components/wizard/DocumentPreview.tsx`
- `components/dashboard/Sidebar.tsx`
- `package.json`
- `package-lock.json`

---

### ✅ Korak K — Dashboard arhiva dokumenata
- `/arhiva` sada server-side dohvaća dokumente trenutnog korisnika iz Supabase `documents` tabele
- Dodata arhiva sa nazivom, human-readable tipom, srpskim datumom, oznakom "Besplatna verzija" i PDF/DOCX preuzimanjem
- Dodat filter: Svi tipovi / Ugovori / Komunikacija / HR
- Dodato prazno stanje sa linkom ka `/dashboard`
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `app/(dashboard)/arhiva/page.tsx`
- `components/dashboard/ArchiveList.tsx` (novo)

---

### ✅ Korak L — Supabase auth callback
- Kreirana `/auth/callback` route handler ruta za email verifikaciju i session exchange
- Register `signUp` poziv sada šalje `emailRedirectTo` na `/auth/callback`
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `app/auth/callback/route.ts` (novo)
- `app/(auth)/register/page.tsx`

---

### ✅ Korak I — Helper tekstovi i tooltipovi u wizardu

- **`types/wizard.ts`**: `WizardField` proširen sa `helperText?: string` i `tooltip?: string`
- **`components/wizard/FieldHelper.tsx`** (novo):
  - `TooltipIcon` — ⓘ dugme pored labele; hover (desktop) + click otvara popover; zatvara se click-outside i Escape; `max-w-[calc(100vw-2rem)]` sprečava overflow na mobilnom
  - `HelperText` — mali italic tekst ispod input polja (12px, text-gray-500)
- **`components/wizard/WizardForm.tsx`**: `FieldRenderer` prikazuje `TooltipIcon` pored labele i `HelperText` ispod input-a
- Svih 10 prompt fajlova ažurirano sa helperText/tooltip na ključnim poljima
- TypeScript: 0 grešaka

**Fajlovi:**
- `types/wizard.ts`
- `components/wizard/FieldHelper.tsx` (novo)
- `components/wizard/WizardForm.tsx`
- svih 10 `lib/prompts/*.ts`

---

### ✅ Korak J — PDF ispravke

1. **Footer fix (Problemi 1 i 2)**: Header promenjen u `position: 'absolute', top: 16` (sa `fixed` prop) — header više nije u toku sadržaja. Footer je već bio absolutno pozicioniran. Page `paddingTop` povećan na 60pt, `paddingBottom` na 80pt. Uklonjen `render` callback sa footer View-a (direktna deca).
2. **Orphan h2 (Problem 3)**: Logika u `renderBlocks()` bila prisutna i ispravna — nije menjana.
3. **POVERLJIVO stamp (Problem 4)**: NDA sa `oznacavanje === true` → crveni bold tekst "POVERLJIVO" u headeru (desno, 8pt, #DC2626). Pojavljuje se na svakoj stranici jer header ima `fixed` prop.
4. **Fi-ligatura (Problem 5)**: Zamenjen U+200C (ZWNJ — Roboto ga tretira kao vidljiv razmak) sa U+2060 (Word Joiner — nevidljiv, dizajniran za prevenciju ligaturi). Verifikovano `charCodeAt(0) === 0x2060`.
- TypeScript: 0 grešaka, `next build` čist

**Fajlovi:**
- `lib/pdf/AisistentDocument.tsx`
- `lib/pdf/markdownParser.ts`

---

### ✅ Korak P — Ispravke ugovor o delu i opšti uslovi

1. **Bruto/Neto logika (Problem 1)** — ugovor-o-delu.ts: SCENARIO A/B/C jasno definiše neto-only princip; Scenario A: formula za member tekst "neto naknadu + naručilac plaća porez"; buildUserMessage: avans_iznos kao konkretan iznos u RSD = X% × neto
2. **Broj ugovora (Problem 2)** — FORMAT IZLAZA već imao instrukciju; potvrđeno da je Codex to pokrio
3. **Rod u potpisima (Problem 3)** — AisistentDocument.tsx i docxBuilder.ts: `ZAPOSLENI/ZAPOSLENA:` → `ZAPOSLENI:` (ugovor-o-delu.ts bio već ispravan sa `IZVOĐAČ:` bez kose crte)
4. **Opšti uslovi datum/potpisi (Problem 4)** — već pokriveno od strane Codex-a u opsti-uslovi.ts; h3 blok dodat: markdownParser.ts (`### ` → tip 'h3'), AisistentDocument.tsx (h3 stil: 11pt bold, marginTop 8), docxBuilder.ts (HeadingLevel.HEADING_3)
5. **Datum genitiv (Problem 5)** — meseci promenjeni u genitiv (januar→januara, jun→juna...) u AisistentDocument.tsx i docxBuilder.ts
6. **Viseći naslovi (Problem 6)** — renderBlocks() logika ispravna, nema regresije

TypeScript: 0 grešaka.

---

### ✅ Korak O — Ispravke system promptova (feedback testera)

1. **SCENARIO leak (Problem 1)** — ugovor-o-zakupu.ts ŠTA NE RADIŠ: eksplicitna zabrana da SCENARIO A/B/C curi u dokument
2. **Iznosi slovima (Problem 2)** — dodato pravilo u TON I STIL svih 10 promptova: jednosmerna sintaksa bez razmaka (tristotine, dveihiljadepetsto, deset hiljada...)
3. **Komunalna taksa stambeni (Problem 3)** — buildUserMessage u zakupu: ako tip=Stambeni i komunalna_taksa nema vrednost → "Ne primenjuje se (stambeni zakup fizičkog lica)"; systemPrompt: pravilo da se ne generiše taj član
4. **Popis nameštaja (Problem 4)** — buildUserMessage: popis_namestaja=false → "Ne — stan se preuzima u viđenom stanju"; systemPrompt: instrukcija za oba slučaja
5. **PRILOZI ne idu u dokument (Problem 5)** — ugovor-o-zakupu.ts ŠTA NE RADIŠ: ne generiši PRILOZI sekciju, samo "kao u Prilogu 1"
6. **Opcioni članovi (Problem 6)** — ugovor-o-radu.ts: ## OPCIONI ELEMENTI sekcija u systemPrompt za detaljna_prava_obaveze i cuvanje_poslovne_tajne; ugovor-o-zakupu.ts: OPCIONI ELEMENTI za popis_namestaja, zabrana_zivotinja, zabrana_podzakupa, komunalna_taksa
7. **Latinica (Problem 7)** — dodato pravilo u TON I STIL ili novi ## TON I STIL blok u svih 10 promptova
8. **nacin_rada rename (Problem 8)** — `rad_od_kuce` → `nacin_rada` u: types/wizard.ts (UgovorORaduData interfejs), wizard field id, buildUserMessage()

TypeScript: 0 grešaka.

---

### ✅ Korak N — Profil i Podešavanja stranice

**Profil (`/profil`):**
- `components/dashboard/ProfileCard.tsx` — Client Component, inline edit display_name (POST /api/profile/set-name, router.refresh()), email (readonly + support tekst), "Član od"
- `app/(dashboard)/profil/page.tsx` — Server Component, dohvata profile + user email, prikazuje ProfileCard + pretplatnu karticu sa progress barom (zelena/narandžasta/crvena za <80%/≥80%/100%), dugme Nadogradite/Upravljajte

**Podešavanja (`/podesavanja`):**
- `components/dashboard/SecurityCard.tsx` — resetPasswordForEmail + global signOut({ scope: 'global' })
- `components/dashboard/DangerZone.tsx` — modal sa "OBRISI" tekstualnom potvrdom, POST /api/profile/delete, redirect na /login?deleted=true
- `app/(dashboard)/podesavanja/page.tsx` — Server Component sa tri kartice (Bezbednost, Obaveštenja placeholder, Opasna zona)

**API:**
- `app/api/profile/delete/route.ts` — briše documents, profiles, i auth.admin.deleteUser()

**Login:**
- `app/(auth)/login/page.tsx` — `DeletedNotice` komponenta u `<Suspense>` prikazuje "Vaš nalog je uspešno obrisan." ako ?deleted=true

TypeScript: 0 grešaka.

---

### ✅ Korak M — Welcome modal + Dashboard redesign

**Zadatak 1 — Ime korisnika:**
- `supabase/migrations/20260607000001_add_display_name.sql` — ALTER TABLE profiles ADD COLUMN display_name text (⚠️ ČEKA PRIMENU — vidi napomene)
- `types/database.ts` — dodat `display_name: string | null` u profiles Row/Insert/Update
- `app/api/profile/set-name/route.ts` — POST endpoint, validacija 2-50 chars, trim, auth check
- `components/dashboard/WelcomeModal.tsx` — fullscreen overlay, bez X/escape/klik-van, router.refresh() posle uspešnog čuvanja
- `components/dashboard/DashboardShell.tsx` — Client Component koji wrap-uje layout, prikazuje WelcomeModal ako `showWelcomeModal=true`
- `app/(dashboard)/layout.tsx` — dohvata `display_name`, prosleđuje `showWelcomeModal` u DashboardShell

**Zadatak 2 — Dashboard redesign:**
- `lib/utils/documentTypes.ts` — shared mapa type slug → srpski naziv (ne duplikuje se više)
- `components/dashboard/ArchiveList.tsx` — koristi import iz shared utils umesto lokalne mape
- `components/dashboard/GreetingHeader.tsx` — Client Component, time-based pozdrav (jutro/dan/veče) u useEffect, plan badge, docs ovog meseca, upozorenje za free plan
- `app/(dashboard)/dashboard/page.tsx` — kompletni redesign:
  - Sekcija "Nedavno": poslednja 3 dokumenta + prazno stanje
  - Sekcija alata po kategorijama sa poboljšanim karticama (hover border-l zelena)
  - Kategorija "🧮 Alati" sa Kalkulator zarade
  - Broji dokumente ovog meseca posebnim COUNT upitom

TypeScript: 0 grešaka.

---

### ✅ Korak L — Kalkulator zarade (neto/bruto)

- **`app/(dashboard)/alati/kalkulator-zarade/page.tsx`** — Client Component kalkulator
  - Dva taba: Bruto→Neto i Neto→Bruto (inverse formula: bruto = (neto - 2502.5) / 0.701 za bruto > 25025)
  - Stope 2026: porez 10%, PIO zaposl 14%, zdravstvo 5.15%, nezaposlenost 0.75%, poslodavac 17.4%
  - Inputi: zarada, radno vreme (puno/nepuno sa range sliderom), topli obrok (toggle+iznos), prevoz (toggle+iznos)
  - Tri kartice rezultata: "Zaposleni prima", "Odbici od bruto", "Trošak za firmu"
  - Vizuelni stacked bar (CSS, bez biblioteka) — neto zelena, porez crvena, doprinosi zaposleni narandžasta, doprinosi poslodavac žuta
  - Upozorenje ako je unos ispod minimalne bruto zarade (46.059 RSD)
  - Info box sa napomenom i datumom ažuriranja
  - Kolapsibilni FAQ sa 4 objašnjenja pojmova
- **`components/dashboard/Sidebar.tsx`** — dodata "🧮 Alati" sekcija iznad "Uskoro" sa Kalkulator zarade linkom i 2 upcoming (Kalkulator paušala, Kalkulator ugovora o delu)

TypeScript: 0 grešaka.

---

### ✅ Korak K — JMBG/PIB conditional, helper tekstovi, jezički standard

1. **JMBG/PIB conditional**: `WizardField` proširen sa `dynamicConfig` (watchField + values mapa). `WizardForm.tsx` dobio `resolveField()` koja dinamički menja label/helperText/tooltip na osnovu vrednosti drugog polja. Primenjeno na:
   - `nda.ts`: `pib_strane_1`, `pib_strane_2` (prate `tip_strane_1`/`tip_strane_2`)
   - `ugovor-o-delu.ts`: `jmbg_pib_izvodjaca` (prati `tip_izvodjaca`)
   - `ugovor-o-zakupu.ts`: `jmbg_pib_zakupodavca`, `jmbg_pib_zakupca`
   - `punomocje.ts`: `jmbg_pib_vlastodavca`, `jmbg_pib_punomocnika`
2. **Helper tekstovi**: Dodati tooltipovi za `kazna`/`zabrana` u nda.ts; `podela`/`vlasnistvo_ip`/`stopa` u saradnji-zajmu.ts; `komunalna_taksa` + novo polje `adaptacije` u zakupu.ts
3. **Jezički standard**: Dodat paragraf na početak systemPrompt-a u svih 10 prompt fajlova

**Fajlovi:**
- `types/wizard.ts` (dynamicConfig, adaptacije)
- `components/wizard/WizardForm.tsx` (resolveField)
- `lib/prompts/nda.ts`
- `lib/prompts/ugovor-o-delu.ts`
- `lib/prompts/ugovor-o-zakupu.ts`
- `lib/prompts/ugovor-o-saradnji-zajmu.ts`
- `lib/prompts/punomocje.ts`
- `lib/prompts/ugovor-o-radu.ts`
- `lib/prompts/opsti-uslovi.ts`
- `lib/prompts/poslovni-mejl.ts`
- `lib/prompts/oglas-za-posao.ts`
- `lib/prompts/ponuda-klijentu.ts`

TypeScript: 0 grešaka.

---

### ✅ Korak L — UI tekstovi: lektorske ispravke

- Landing page tekstovi usklađeni sa lektorskim komentarima
- Persiranje kroz UI poruke usklađeno na "Vi/Vas/Vam"
- `watermarke/watermaraka` zamenjeno sa `watermark-a`
- Prompt placeholder `Software Engineer` zamenjen sa `Softverski inženjer`
- Ispravljeni primeri bez dijakritike u prompt fajlovima
- Pregledni fajlovi `docs/UI_TEKSTOVI.md` i `docs/SYSTEM_PROMPTOVI.md` usklađeni sa izmenama
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `app/page.tsx`
- `app/api/export/docx/route.ts`
- `components/wizard/UpgradeModal.tsx`
- `lib/prompts/ugovor-o-radu.ts`
- `lib/prompts/oglas-za-posao.ts`
- `lib/prompts/opsti-uslovi.ts`
- `lib/prompts/ponuda-klijentu.ts`
- `lib/prompts/poslovni-mejl.ts`
- `lib/prompts/punomocje.ts`
- `docs/UI_TEKSTOVI.md`
- `docs/SYSTEM_PROMPTOVI.md`

---

### ✅ Korak M — Dashboard quick fixes

- `GreetingHeader` link "Nadogradite plan" sada vodi na landing cenovnik (`/#cenovnik`)
- Nedavni dokumenti na dashboard-u izdvojeni u `RecentDocuments` Client Component
- Dugme "PDF" u nedavnim dokumentima direktno poziva `/api/export/pdf` i preuzima blob, bez odlaska na arhivu
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `components/dashboard/GreetingHeader.tsx`
- `components/dashboard/RecentDocuments.tsx` (novo)
- `app/(dashboard)/dashboard/page.tsx`

---

### ✅ Korak N — Vokativ u dashboard pozdravu

- Dodata `toVocative(name)` funkcija za osnovnu konverziju imena iz nominativa u vokativ
- `GreetingHeader` koristi vokativ u pozdravu, npr. "Dobro jutro, Milane!"
- Testirani primeri: Milan, Petar, Stefan, Marko, Luka, Nikola, Ana, Jelena, milan
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `lib/utils/vocative.ts` (novo)
- `components/dashboard/GreetingHeader.tsx`

---

### ✅ Korak O — Dijakritika u system promptovima

- Ispravljeni prompt tekstovi bez srpskih dijakritičkih znakova u poslovnim alatima
- Generalna provera `Select-String` svedena na interne ASCII identifikatore koji se ne menjaju
- U ugovoru o zakupu korisnički/prompt tekst `deponija` zamenjen sa `depozit`; interni field id-jevi ostaju `deponija/iznos_deponije`
- TypeScript: 0 grešaka (`npx.cmd tsc --noEmit`)

**Fajlovi:**
- `lib/prompts/oglas-za-posao.ts`
- `lib/prompts/poslovni-mejl.ts`
- `lib/prompts/ponuda-klijentu.ts`
- `lib/prompts/opsti-uslovi.ts`
- `lib/prompts/punomocje.ts`
- `lib/prompts/ugovor-o-zakupu.ts`

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
- 2026-06-07: UI ispravke za Ugovor o delu i Opšte uslove pripremljene za review; Ugovor o delu koristi neto naknadu, Opšti uslovi nemaju potpise.
- 2026-06-07: UI feedback ispravke u wizard promptovima za ugovor o radu i ugovor o zakupu pripremljene za review.
- 2026-06-07: Free plan limit usklađen na 3 dokumenta mesečno u generate API-ju i upgrade modalu.
- 2026-06-07: Uvedena terminologija Bruto 1 / Bruto 2 u kalkulator zarade, prompt za ugovor o radu i kontekstualni podsetnik.

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
