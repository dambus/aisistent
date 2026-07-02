# AIsistent — Progress

## Aktuelno stanje (jun 2026.)

Projekat je u produkciji na aisistent.rs.
MVP je kompletiran. Fokus je na stabilizaciji i novim featurima.

### Stack
- Next.js 16, Supabase, Claude API (claude-sonnet-4-5), Vercel
- PDF: @react-pdf/renderer | DOCX: docx | Email: Resend
- UI: Tailwind CSS + shadcn/ui | Plaćanje: Paddle (čeka APR)

### Kompletiran MVP (jun 2026.)
- ✅ Auth (login, register, email verifikacija)
- ✅ 17 tipova AI dokumenata + Faktura/Profaktura
- ✅ Otpremnica — wizard, PDF (Roboto), DOCX, samo količine (bez cene/PDV)
- ✅ Ponuda za radove — wizard, PDF (Roboto), DOCX, stavke sa cenama, jedan potpis
- ✅ PDF i DOCX export za sve tipove
- ✅ Email slanje dokumenata (Resend, noreply@aisistent.rs)
- ✅ Brendiranje firme — logo u PDF/DOCX (Pro/Agency)
- ✅ Arhiva sa search i filterima
- ✅ Profil — firme, avatar inicijali, plan badge
- ✅ Podešavanja — lozinka, odjava, brisanje naloga
- ✅ Admin panel (/admin) — korisnici, dokumenti, statistika
- ✅ shadcn/ui (ScrollArea, Select, Switch, Tooltip, AlertDialog, Dialog, Sheet)
- ✅ Mobilna responsivnost
- ✅ Proof-reading i zakonski audit svih tipova
- ✅ Kompletna projektna dokumentacija (docs/)

### Aktivne sesije i izmene

#### 2. jul 2026. — Preview iframe, telefon hint, Korak 8 validacija

**Preview PDF u iframe pre downloada** — `generate-filled` prima `preview: boolean`; kad je `true`, ne briše original iz Storage-a i vraća `Content-Disposition: inline`. `PreviewView` generiše pregled automatski pri otvaranju (blob URL u `<iframe>`) + ručno "Osveži pregled" dugme (namerno bez auto-refresh na svaki keystroke — flat PDF pregled ponovo pokreće DI).

**Telefon composite UX hint** — `GuideField` dobio opciono `hint` polje. `di-analyze/route.ts` composite-detekcija (isti label, ista Y linija) sad prepoznaje kad je primarno polje mapirano na `telefon` i dodaje napomenu i primarnom i sekundarnom polju umesto da sekundarno tiho ostane bez objašnjenja. Prikazuje se u `GuideView` i `PreviewView`.

**Korak 8 — validacija na 3 nova obrasca** (`scripts/test-full-pipeline.ts`, novi E2E test bez UI/auth — provlači PDF kroz stvarne module: DI, matching, semanticMapper sa pravim Claude pozivom, overlay):
- **Образац 1.pdf** — radi odlično, 7/9 profil polja tačno mapirano (naziv, matični broj, PIB, delatnost, adresa, telefon, email), tabela zaposlenih ispravno manual
- **PK2-o-z1.pdf** (poreski kredit) — sve manual i ispravno je (čista tabela finansijskih izračunavanja bez profil podataka)
- **Novi otkriveni gap**: PK2 i "zahtev za pristup informacijama" obrasci imaju zaglavlja (PIB, adresa, ime) u layout-u "natpis ispod/pored praznog prostora, bez podvučene linije, bez tabele" — ovaj četvrti šablon je pipeline-u potpuno nevidljiv (extractFlatPdfFields prepoznaje samo table-cell/selection-mark/underscore-tekst). Ta polja se ne pojave ni u manual listi — korisnik ih ne vidi uopšte. Ovo je šire od originalno planiranog 5B-a (koji je pretpostavljao da underscore-detekcija već postoji). **Odluka: zabeleženo u backlog, ne implementira se odmah** — trenutni pipeline dobro pokriva strukturirane obrasce (tabela/AcroForm) kao PPDG-1S i Образац 1.
- Dodatan nalaz: "zahtev za pristup informacijama" ima 9 checkboxova zbijenih u jedan pasus — nijedan nije dobio labelu (same-line matching prezahtevan za ovaj layout)

**Commit:** `a8e5d46`

#### 30. jun 2026. — /obrasci MVP + strateška analiza

**Šta je izgrađeno (kod u repou, privremeno nedostupno):**
- `POST /api/obrasci/upload` — multipart upload u Supabase Storage bucket `obrasci-upload` (private, 10MB), detekcija tipa: docx / acroform / flat
- `POST /api/obrasci/analyze` — ekstrakcija polja iz AcroForm (pdf-lib), DOCX (mammoth), flat PDF (pdf2json + Claude); keyword matching za AcroForm bez Claude poziva
- `POST /api/obrasci/fill` — fillAcroForm (pdf-lib), fillDocx (pizzip direktna XML zamena); original se briše iz Storage nakon preuzimanja
- `ObraściClient` — state machine (idle/uploading/analyzing/wizard/guide/error), drag-and-drop upload
- `WizardView` — input polja sa zelenim "Iz profila" badge-ovima, download dugme
- `GuideView` — "Vrednosti iz profila firme" sa Copy dugmadima + "Popuniti ručno" lista + Print vodič
- `TipCard` za sačuvane kontakte — u `/profil` ContactsTab i u wizardu
- Sidebar: "Obrasci" link za paid planove

**Ključni problemi otkriveni testiranjem:**
1. Flat PDF (eko-taksa, ćirilica) — pdf2json lošo čita ćirilicu; Claude ne može matchovati polja → fix: profil polja uvek direktno iz baze, Claude samo za dodatna polja
2. AcroForm sa numeričkim poljem (PPDG-1S, T1–T189) — keyword matching ne može matchovati T1; fix: detektuje non-descriptive nazive (>50% polja) → prebacuje u guide mode
3. Fundamentalni problem ostaje: vizuelna semantika forme živi u PDF vizuelnom sloju, ne u metapodacima

**Strateška odluka — pauzirati:**
Upload & Fill je fundamentalno teži problem od početne procene. AcroForm named fields i DOCX placeholderi rade (privatni obrasci partnerskih firmi). Ali srpski državni obrasci (PPDG, ekotaksa, M4...) koriste numeričke labele — aplikacija nema kontekst za popunjavanje.

Tri tehnička puta analizirana:
- **Put A:** Baza poznatih obrazaca (JSON mapping T1→PIB za svaki obrazac) — brzo za MVP, ~30-50 formi pokriva 80% potreba
- **Put B:** PDF koordinatno parsiranje (matchovati polje sa okolnim tekstom) — kompleksno, ćirilica problematična
- **Put C:** Vision AI (render stranice → slika → Claude Vision → mapira polja) — najrobusnije, zahteva server-side PDF rendering (Puppeteer ne radi na Vercel serverless)

Stranica je privremeno nedostupna (`/obrasci` prikazuje "Uskoro dostupno").

#### 30. jun 2026. — Sačuvani kontakti + Agency wizard fix

**Sačuvani kontakti** — nova funkcionalnost za Starter/Pro/Agency planove.
- Nova `contacts` tabela (naziv, pib, adresa, grad, zastupnik, email, telefon, ziro_racun, tip)
- SQL migracija primenjena na produkciji
- Plan limiti: free=0, starter=5, pro/agency=neograničeno
- `ContactsTab` komponenta u `/profil` — Sheet forma, kartice sa edit/delete, pretraga
- `ContactSelectModal` u wizardu — pojavljuje se posle CompanySelectModal za podržane tipove dokumenta, skip ako nema kontakata
- `contactFieldMap.ts` — mapiranje contact polja na wizard polja za 8 tipova: faktura, otpremnica, ponuda-za-radove, ugovor-o-delu, nda, ugovor-o-zakupu, ugovor-o-saradnji-zajmu, ponuda-klijentu
- `buildContactFields()` — puni wizard polja iz Contact objekta
- `buildCompanyAsContactFields()` — puni "drugu stranu" iz Company objekta (za agency plan)
- `AGENCY_BILLING_TYPES` — set billing dokumenata gde agencija = izdavalac, klijent = primalac
- SendEmailModal i send-document API ažurirani za novi Contact model

**Agency wizard dropdown fix**
- Agency "Klijent:" dropdown prikazuje se samo na koraku 0 (ne na svakom koraku)
- Za billing tipove (faktura, otpremnica, ponuda-za-radove, ponuda-klijentu): prebacivanje klijenta puni primalac/naručilac polja, ne izdavalac
- Za ostale tipove (ugovori, NDA...): postojeće ponašanje (puni firmu/stranu dokumenta)

**TODO za korisnika — prezentovati nove funkcionalnosti**
- Kontakti su u produkciji ali korisnici ne znaju za njih
- Potreban tip/onboarding banner u profilu i/ili wizardu

#### 1. jul 2026. — Label matching bugfix sesija (overlay istraživanje)

**Testiranje na 5 novih obrazaca** (`C:\Users\milan\Downloads\novi obrasci\`):
- 3040-113-015 (flat), Dodatak_15_PR (acroform), JRPPS_PR Osnivanje (acroform, 10 str., 211 polja), M-A (flat sken — 0 polja, van opsega), Obrazac_PPI-2 (flat)
- Vizuelni pregled overlaya u browseru otkrio 3 klase grešaka

**Bugfix — 3 nova patterna u `matchFieldLabels.ts` i `extractFlatPdfFields.ts`:**
1. **Checkbox labela desno** — same-line right fallback (0.5" radijus, uvek low conf); pokriva checkbox + lista/tekst desno (prethodni filter tražio samo levo)
2. **Textarea vizuelno iznad** — za AcroForm polja visine >0.5": traži paragrafe sa *manjim* Y (visually above u DI koordinatama), do 2.0"; prethodni "above" fallback gledao u suprotnom smeru
3. **Table external DI line** — u `extractFlatPdfFields.ts`: kad su sve ćelije u redu prazne (tabela bez header ćelija), traži DI `line` van tabele na istoj Y liniji levo od ćelije

**Rezultat:** Bez labele 4→0 (Dodatak_15), 16→0 (JRPPS), nula bez-labele na svim parsabilnim PDF-ovima.
**Commit:** `f2ae22f` — 3 fajla, 157 insertions

**Poznate limitacije:**
- `3040-113-015` table3 r3–r9: labele su section headings 0.4" iznad grupe redova — van same-line praga, nema per-row labele u PDF-u; null label je ispravan fallback
- `M-A.pdf`: rasterizovani sken, DI nema tekst — van opsega pipeline-a

#### 1. jul 2026. — Upload & Fill Faza 1 — Korak 5–7 + produkcija

**Obrasci pipeline — Korak 5–7 kompletni, stranica aktivna u produkciji.**

- `lib/documentIntelligence/extractFlatPdfFields.ts` — ekstrakcija polja iz flat PDF-a: prazne table-ćelije (high conf), standalone selection marks (high conf ako labela levo), podvlake van tabela (low conf); isti same-line Y prag 0.12in kao AcroForm grana
- `lib/documentIntelligence/semanticMapper.ts` — Claude mapira isključivo stvarne (labela, polje) parove na 13 profil ključeva; polja bez labele nikad ne stižu do Claudea (automatski `null`); `max_tokens: 4096` za forme sa 190+ polja; stripa markdown code block iz odgovora
- `types/obrasci.ts` — `GuideField` sa eksplicitnim `state: 'high' | 'low' | 'manual'` (nikad implicitno, uvek determinsitički)
- `app/api/obrasci/di-analyze/route.ts` — novi endpoint koji orkestrira DI + geometric matching + semantic mapping; `maxDuration: 60`; PDF (acroform/flat) → `GuideField[]`
- `components/obrasci/GuideView.tsx` — tri vizuelna stanja: zeleno (Iz profila, direktno kopiraj), narandžasto (Proverite), sivo (Popunite ručno); manual polja skupljeni po default-u
- `components/obrasci/ObraściClient.tsx` — PDF → `/api/obrasci/di-analyze`; DOCX → stari Claude analyze → wizard (nepromenjen)
- `app/(dashboard)/obrasci/page.tsx` — uklonjen "Uskoro dostupno" placeholder, renderuje `ObraściClient`
- `analyzeLayout.ts` — dodat `selectionMarks: DiSelectionMark[]` iz `pages[i].selectionMarks`

**Korak 6 STOP checkpoint:** `scripts/test-semantic-mapper.mjs` demonstrira da null-label polja dobijaju `suggestedValue: null` bez Claude poziva (PPDG-1S: 7 mapiranih profil vrednosti, 191 manual, T1 isInternal = poreska uprava).

**Infrastruktura:** Azure DI ključevi dodati u Vercel production env vars. Bug fix post-deployment: Claude vraća JSON u markdown code bloku — `semanticMapper.ts` nije stripovao wrapper (JSON.parse grešio).

**Kalibracioni harness (SSE):** `run-calibration-test.mjs` dodaje EventSource listener u overlay HTML; `record-ground-truth.mjs` pokreće HTTP server na :7789 sa `/events` SSE endpoint-om koji auto-navigira overlay po polju.

#### 30. jun 2026. — Upload & Fill Faza 1 — pipeline za prepoznavanje obrazaca

**Obrasci pipeline — Korak 1–4 kompletni** (spec: `docs/obrasci/FAZA1_PREPOZNAVANJE_OBRAZACA_1.md`)

- `lib/documentIntelligence/analyzeLayout.ts` — Azure DI `prebuilt-layout` klijent, `DiLayoutResult` sa `pages`, `paragraphs`, `lines`, `tables`, `words`; `lines` dodat za same-line matching (finer granularity od paragraphs)
- `lib/documentIntelligence/extractAcroFormFields.ts` — AcroForm ekstrakcija sa pouzdanim brojevima strana (via `widget.P()` → `pageRefMap`), sanity check T42/T43/T44 = str.1
- `lib/documentIntelligence/matchFieldLabels.ts` — geometrijsko poklapanje: same-line matching via `lines` (fix: paragraphs spajaju više vizuelnih redova → pogrešan Y centar), fallback "iznad" via `paragraphs`; confidence formula: relativna margina (primarna) + DI word confidence (sekundarna) + apsolutna dist (solo tie-breaker)
- Kalibracioni harness: `run-calibration-test.mjs` (DI keš, matching, JSON + HTML overlay), `record-ground-truth.mjs` (CLI sa overlay serverom na :7789, URL sa hashem po polju), `recalculate-thresholds.mjs` (F1 optimizacija)
- Rezultati na PPDG-1S (198 polja): 119 high / 79 low pre linija-fixa; očekuje se poboljšanje za T2/T3 bug

**Bug fiksevi u ovoj sesiji:**
- T2/T3 pogrešna labela — DI spajao naslov + labelu u jedan paragraph; prebacivanje na `page.lines` rešava (yCtr individualnih linija pouzdan za 0.12in prag)
- polygon flat array format u novom SDK (`@azure-rest/ai-document-intelligence@1.1.0`) — `number[]` umesto `{x,y}[]`
- Broja strana pouzdanost — `widget.P()` → `pageRefMap` lookup umesto pretpostavljanja po Y koordinati

**UX poboljšanje — overlay highlight u record-ground-truth.mjs:**
- HTML overlay dobio `id="field-{name}"` + JS koji čita URL hash i highlight-uje polje (plavi border, sticky banner)
- `record-ground-truth.mjs` pokreće HTTP server na :7789, ispisuje `http://localhost:7789/...-overlay.html#{fieldName}` za svako polje — otvori jednom u browseru, overlay se auto-scroll-uje

#### 28. jun 2026. — HR i komunikacija poboljšanja

**poslovni-mejl** — 3 nova tipa mejla (Follow-up posle sastanka, Uvod u novu saradnju, Zahtev za referencu ili preporuku). Kondicionalno polje `teme_sa_sastanka` za Follow-up tip.

**odgovor-kandidatu** — novi tip "Feedback posle intervjua" sa 3 kondicionalna polja: `feedback_pozitivno`, `feedback_razlog`, `ostaje_u_bazi` (toggle). System prompt proširen sa sekcijom TIPOVI ODGOVORA.

**oglas-za-posao** — dual output u jednom API pozivu. Prompt generiše LinkedIn (narativ, hook, hashtags) i Infostud (struktura, bullet liste) format razdvojen `---LINKEDIN---` / `---INFOSTUD---` separatorima. `DocumentPreview` parsira i prikazuje tabove. Export šalje `override_text` aktivnog taba. Test skripta proširena: `scripts/fixtures/oglas-za-posao.ts`, validacija separatora u konzoli.

**obavestenje-o-promeni-uslova** — potpuno novi tip dokumenta (20. tip). Zakonska obaveza po čl. 172-174 ZOR. Wizard 3 koraka: firma, zaposleni, promena (tip, staro/novo stanje, datum primene, opcioni razlog i rok za izjašnjavanje). Prateće izmene: route.ts, WizardPageClient, Sidebar, dashboard, companyFieldMap, reminders, documentTypes, PDF i DOCX buildSigData.

#### 27-28. jun 2026. — DOCX audit i fix

**keepNext — viseći naslovi**
- `keepNext: true` na h2/h3 headingima
- `keepNext` chain kroz spacer blokove koji slede posle headinga/bold paragrafa
- `keepNext` na bold-only paragrafima (article headers tipa "Član X.") — detektovano po tome što su svi spans bold

**Stop uslovi — dupli potpis**
- `sanitizeGeneratedText` u `docxBuilder.ts` sinhronizovan sa `markdownParser.ts` — identičnih 12 uslova za sve tipove
- Novi stop uslovi: `za stranu koja otkriva/prima`, `za prvu/drugu/treću stranu` (Claude ih ubacuje u telo pri AI poboljšanju)

**NDA specifično**
- POVERLJIVO u DOCX headeru — logo/datum levo 70%, POVERLJIVO desno 30% (tabela bez bordera) — uslov isti kao u PDF-u (`oznacavanje === true`)
- "Sporazum potpisuju:" za NDA, "Punomoćje potpisuje:" za punomoćje (umesto "Ugovor potpisuju:")

**LimitsCard + landing page + docs**
- `LimitsCard` komponenta na dashboardu — progress bar za dokumente/mesec, statički prikaz AI izmena limita po planu
- Landing page: ažurirani "sa AIsistentom" lista, Korak 3, pricing features
- PROGRESS.md, .ai-memory, BACKLOG.md ažurirani

**Testirano na produkciji:** NDA DOCX ✅, Ugovor o radu DOCX ✅

#### 26. jun 2026. — "Poboljšaj dokument" + /arhiva/[id] + UX fixevi

**"Poboljšaj dokument" AI panel — redesign i workflow fix**
- `ImprovePanel.tsx`: potpuni redizajn — proper padding/spacing, konzistentno sa app dizajnom
- Workflow fix: izmena se broji čim AI vrati odgovor (`onTextUpdated`), ne čeka Save
- Panel se može zatvoriti u svakom trenutku bez blokade
- Ctrl+Enter shortcut za slanje instrukcije
- History primenjenih izmena sa SVG checkmark ikonama

**Floating save + guard**
- Bug fix: `onTextUpdated` sada pravilno postavlja `textSaved(false)` — Save dugme više nije uvek disabled
- Amber banner "Imate nesačuvane izmene" ima direktno "Sačuvaj" dugme (van panela)
- PDF, DOCX i email akcije su disabled dok postoje nesačuvane izmene

**`/arhiva/[id]` — dedicated stranica za svaki dokument**
- Server component: fetch dokumenta iz Supabase + profile plan
- Prikazuje pun `DocumentPreview` sa svim akcijama (poboljšaj, PDF, DOCX, email, nova verzija)
- Breadcrumb "Arhiva › Naziv dokumenta" sa verzijom badge-om
- `GET /api/documents/[id]` proširen: vraća i `generated_text`, `title`, `is_free`
- `onReset` prop na `DocumentPreview` je sada opcionalan (arhiva ne prikazuje post-gen header)

**ArchiveList — "Otvori dokument" link**
- Nova ikona (external link) u redu svake stavke → `/arhiva/[id]`

**`/klijenti/[id]` fix**
- "Otvori →" link vodi na `/arhiva/[id]` umesto `/arhiva?docId=` (koji nije radio)

#### 26. jun 2026. — Uklonjen Business plan + pricing layout fix

**Uklonjen Business plan**
- Odluka: ići direktno Free → Starter → Pro → Agencija (bez Business sloja)
- Plan nije bio lansiran (bio "Uskoro" na sajtu) — nema realnih korisnika na njemu
- Uklonjeno iz 19 fajlova: Plan type, svih PLAN_LIMITS/PLAN_LABELS/PLAN_COLORS objekata, LOGO_PLANS/DOCX_PLANS feature flagova, waitlist API-ja, WaitlistModal, admin panela, onboarding stranice
- send-document/route.ts: LOGO_PLANS `['pro', 'business']` → `['pro', 'agency']` (agency je bio izostavljen)
- DOCX error poruka: "Starter, Pro i Business" → "Starter, Pro i Agencija"

**Pricing kartica layout fix**
- Agency kartica je bila sama u drugom redu (`grid-cols-4` + 5 kartica)
- PricingSection.tsx: prva 4 plana u gridu, 5. (Agency) u centiranom flex containeru ispod sa `lg:w-1/4`

#### jun 2026. — Agency Faza 2 (kompletna)

**Korak 1 — Verzionisanje dokumenata**
- `version` i `root_document_id` kolone na documents tabeli (20260623000001)
- `root_document_id` uvek pokazuje na v1 originala (bez chain referenci)
- "Nova verzija" dugme u ArchiveList-u (purple badge za v2+, reload ikona)
- `?from=<docId>` URL pattern — server-side fetch, pre-populacija WizardForm-a
- GET `/api/documents/[id]` — novi endpoint za dohvatanje dokumenta (sa ownership check)

**Korak 2 — Proširenje profila firme**
- SQL migracija: `delatnost`, `ziro_racun`, `pdv_obveznik boolean`, `website` na companies (20260623000002)
- TypeScript Company interface + Database tipovi ažurirani
- API rute (POST + PUT) prihvataju nova polja
- `companyFieldMap.ts`: nova mapiranja za 7 tipova (faktura, ponuda-za-radove, otpremnica → žiro račun + PDV; oglas, pravilnik, bio → delatnost; opsti-uslovi → website)
- `buildCompanyFields()`: dodata podrška za boolean vrednosti (`pdv_obveznik`)

**Korak 3 — Redesign CompaniesTab**
- Sheet umesto Dialog za formu (klizi s desne strane, 520px, 6 sekcija sa separatorima)
- shadcn Switch za PDV obveznik i Podrazumevana toggleove
- shadcn AlertDialog za potvrdu brisanja (umesto browser confirm())
- Avatar kartice: inicijali (ili logo preview), PDV badge, ikonska dugmad (★ ✏ 🗑) sa Tooltip
- Pretraga: vidljiva za agency i kad >4 firme
- Logo management premešten iz kartice u Sheet (edit mode)

**Korak 4 — /klijenti dedicated stranica + document linking**
- SQL migracija: `company_id uuid REFERENCES companies ON DELETE SET NULL` na documents (20260623000003)
- Generate API: prihvata i čuva `company_id` pri kreiranju dokumenta
- WizardForm: šalje `company_id` pri submitu; prima `preselectedClientId` prop
- `?clientId=<id>` URL param za wizard — server-side pre-selekcija klijenta
- `/klijenti` — Agency-only stranica: grid klijenata sa brojem dokumenata, brzo kreiranje
- `/klijenti/[id]` — profil klijenta (svi podaci), brzo kreiranje sa ?clientId= pre-selekcijom, lista dokumenata filtrirana po company_id
- Sidebar: "Klijenti" link vidljiv samo za agency plan

**Bug fix uz fazu**
- `app/api/companies/[id]/logo/route.ts`: agency dodat u `LOGO_PLANS` (bio izostavljen)

#### jun 2026. — Delatnostni onboarding + Free tier ograničenja (Faza 3)
- Novi onboarding flow: `app/onboarding/dobrodoslica/page.tsx` — tier-specific (free: 1 korak izbor delatnosti; upgrade: 3 koraka — unlock animacija, delatnost, firma setup)
- `lib/industryConfig.ts` — single source of truth za 10 delatnosti, mapiranje alata na featured/secondary/hidden prioritet
- Dashboard "Preporučeno za vas" sekcija — featured alati po delatnosti
- Redirect logika u (dashboard)/layout.tsx: agency → /onboarding/agencija, ostali → /onboarding/dobrodoslica (ako !onboarded)
- Supabase migracija: industry kolona u profiles (20260618000001_add_industry.sql)
- shadcn dodato: Card, RadioGroup (Button već postojao)
- Free tier ograničenja:
- Limit generisanja: 3 dokumenta/mesec (sa 1)
- Watermark — `lib/pdf/applyWatermark.ts` (pdf-lib post-processing, dijagonalan, centriran preko stranice), primenjen na sve PDF exporte i email priloge
- Arhiva blokirana za free (app/(dashboard)/arhiva/page.tsx)
- Email slanje blokirano za free (app/api/send-document/route.ts, 403)
- Dodavanje firme blokirano za free (PLAN_LIMITS.free: 0), UX: modal na klik umesto greške nakon submit-a
- Bug fix: Content-Disposition header crash sa srpskim dijakritikom u filename-u → `lib/sanitizeFilename.ts`
- Vokativ sistem — zamenjen prompt-bazirani pristup determinističkom lookup tabelom: `lib/data/vokativ.json` (1969 imena) + `lib/utils/vokativ.ts` (getVokativ, getVokativHint), injektovano u 7 prompt fajlova kao hint AI modelu
- Uklonjeno: components/dashboard/OnboardingModal.tsx (mrtav kod, zamenjen novim onboarding flow-om)

#### jun 2026. — Agency plan (Faza 2 reach)
- Dodat `agency` plan u sve plan mape: PLAN_LIMITS, PLAN_INFO, PLAN_COLORS, planLabels, PLAN_SELECTOR (6 fajlova)
- Pricing stranica: novi Agency card (9.990 RSD, badge "Za računovođe", indigo boja)
- CompaniesTab: agency korisnici vide "Klijenti" umesto "Firme" (rebrand 12 stringova)
- WizardForm: inline quick-switch dropdown za agency korisnike (2+ klijenata)
- Agency onboarding: standalone full-page welcome screen na /onboarding/agencija
- Server-side redirect u (dashboard)/layout.tsx: agency + !onboarded -> /onboarding/agencija
- fix: `?? 1` fallback zamenjen sa `!== undefined` pattern u app/api/companies/route.ts i app/api/generate/route.ts
- fix: noStore() dodat u app/(dashboard)/layout.tsx i app/(dashboard)/profil/page.tsx
- fix: agency dodat u Sidebar planLabels, admin VALID_PLANS, companies API PLAN_LIMITS
- Napomena: bug `null ?? 1` uticao i na Business plan (nije mogao >1 firma) — fiksiran
- Arhitekturna napomena: onboarding stranica je van (dashboard) route grupe da bi se izbegla beskonačna redirect petlja

#### jun 2026. — Admin panel poboljšanja
- PlanSelector — dropdown za promenu plana direktno iz tabele korisnika
- ResetDocsButton — reset documents_this_month po korisniku
- /api/admin/set-plan i /api/admin/reset-docs API rute

#### jun 2026. — Admin panel
- /admin ruta sa middleware zaštitom (is_admin kolona)
- Pregled, korisnici, dokumenti stranice
- Supabase migracija: 20260616000001_add_admin_role.sql
  ⚠️ Primeniti ručno + UPDATE profiles SET is_admin=true

#### jun 2026. — Profil i podešavanja modernizacija
- Avatar inicijali iz displayName
- iOS zoom fix na input poljima
- Plan badge sa bojom
- Firma editor → shadcn Dialog modal
- SecurityCard UX poboljšanja
- DangerZone styling

#### jun 2026. — Faktura / Profaktura
- Wizard, PDF, DOCX, preview, email
- PDV logika, companyFieldMap

#### jun 2026. — Bug fixevi i audit
- DOCX: prored, naslovi crni, potpisi tabela 3 kolone
- Tooltip mobilni — click-only
- Trailing heading cleanup
- Član 1 duplikacija uklonjena
- companyFieldMap za sve tipove
- Zakonski audit svih 17 tipova

#### jun 2026. — PDF page-break, sanitizacija, test infrastruktura

**PDF page-break (viseći naslovi)**
- `AisistentDocument.tsx`: `renderBlocks()` uvek wrapuje naslove u `wrap={false}` View
- `isBoldHeading()` — detekcija bold-only paragrafa kao naslova članova (`**Član 5.**`)
- h2 anchor loop ne prekida se na bold headings (rimski naslovi + prvi član ostaju zajedno)
- h2 hvata 2 content bloka, h3/bold-heading hvata 1

**Potpisi — determinističan redosled**
- Uklonjen krhki `lastNode` mehanizam (uzimao poslednji blok i stavljao ga pre `SignatureSection`)
- Prošireni stop uslovi u `markdownParser.ts`: parser staje na `Ugovor potpisuju`, `Mesto i datum potpisivanja`, `Strane potpisuju` i sl. — Claude više ne može da ubaci signature preamble u body

**Sanitizacija ćirilice**
- `sanitizeText()` se primenjuje na Claude output *pre* čuvanja u Supabase (route.ts) — ćirilica ne ulazi u bazu
- `buildSigData()` u AisistentDocument: helper `g()` sada prolazi kroz `sanitizeText()`
- `companyData` footer vrednosti sanitizovane

**Markdown code fence stripping**
- Claude povremeno wrapuje output u ` ```markdown ``` ` — stripuje se odmah posle API odgovora u route.ts i test skripti

**Test infrastruktura**
- `npm run test:doc <tip>` — generiše PDF lokalno sa fixture podacima, bez UI i autentifikacije
- Fixtures: `ugovor-o-zakupu`, `ugovor-o-radu`, `nda`, `ugovor-o-delu`, `ugovor-o-saradnji`
- Output se automatski otvara u podrazumevanom PDF pregledaču

#### jun 2026. — UX: Kreiraj sličan + Draft save

**Kreiraj sličan dokument**
- Novo dugme u `ArchiveList` (plava copy ikona) pored "Nova verzija"
- Navigira na `?from=<id>&copy=1` — pre-populiše wizard ali ne vezuje za `root_document_id`
- Novi dokument je nezavisan (ne deo iste verzije istorije)

**Wizard draft save**
- Auto-save u `localStorage` na svaku promenu vrednosti u wizardu (`aisistent_draft_<tip>`)
- Pri povratku: automatski učitava draft i prikazuje plavi banner "Nastavljate gde ste stali"
- "Počni ispočetka" dugme u banneru — briše draft i resetuje formu
- `?from=` parametar (Nova verzija / Kreiraj sličan) uvek ima prednost nad draftom
- Draft se briše posle uspešnog generisanja dokumenta

#### jun 2026. — Blog sistem + n8n automatizacija

**Supabase blog migracija**
- `blog_posts` tabela (slug, title, description, content_md, date, read_time, keywords[], published)
- RLS: public SELECT za published postove, service_role za write
- `lib/blog.ts` — zamena filesystem čitanja Supabase anon clientom
- `remark-gfm` — podrška za Markdown tabele, strikethrough, task liste
- Obe blog stranice: `force-dynamic` — novi postovi živi bez redeployа
- `npm run seed:blog` — migracija 6 postojećih MD postova u bazu

**Blog redesign**
- Lista: editorial index format (numerisani redovi, ne kartice), featured post banner, hero sa brojačem
- Post: `ReadingProgressBar` (scroll progress, client component), CSS drop-cap, breadcrumb, meta pill row
- Numerisani "Nastavi čitanje" strip umesto kartica
- `components/blog/ReadingProgressBar.tsx` — nova komponenta

**Admin panel — Blog**
- `/admin/blog` — lista svih postova (published + draft), toggle objava, brisanje
- `PATCH/DELETE /api/admin/blog` — admin-only endpointi
- `AdminNav` — dodat Blog link

**n8n SEO blog workflow (aktivan)**
- `blog_keywords` tabela — keyword, naslov, alat, format, status (pending/done), blog_post_id FK
- n8n workflow: Schedule → GET pending keyword → Claude generiše post → INSERT blog_posts (draft) → UPDATE blog_keywords status=done → Telegram notifikacija
- Post kreira se kao `published = false`; admin odobrava u `/admin/blog`
- 11 inicijalnih keyword redova upisano

#### jun 2026. — Faktura međunarodno plaćanje + bug fixevi

**Međunarodno plaćanje (SWIFT/IBAN)**
- Toggle `medjunarodno_placanje` u Izdavalac koraku wizarda
- Conditional polja: `valuta` (EUR/USD/GBP/CHF), `iban`, `swift_bic`, `naziv_banke`
- PDF: IBAN/SWIFT blok ("Payment details / Podaci za plaćanje"), iznosi u izabranoj valuti
- DOCX: isti blok, srpska jezička oznaka (sr-RS) za eliminaciju Word spellcheck crtica
- PDV napomena bilingual za međunarodne fakture (čl. 12 st. 4 Zakona o PDV)
- Wizard stavke prikazuje valutu dinamički: "Cena (EUR)" umesto "Cena (RSD)"
- `fakturaSchema` u generate/route.ts — dodata nova polja (Zod ih je strippovao)
- `types/wizard.ts` FakturaData interface sinhronizovan
- `fmtNum()` izdvojen za količinu (bez valute), `fmt()` za novčane iznose

**Bug fixevi**
- Agency plan nije mogao da preuzme DOCX (nedostajao u `DOCX_PLANS`)
- Agency plan nije imao logo u PDF-u (nedostajao u `LOGO_PLANS` oba export route-a)
- DOCX faktura: email/telefon izdavaoca ranije nisu ispisivani

### Blokirano
- Payment gateway (Paddle) — čeka APR registraciju
- APR API / PIB lookup — čeka APR ugovor (samo pravna lica)
- SEF integracija — čeka APR registraciju + dozvolu MF
- Timski nalozi (Agency Faza 2, korak 5) — zavisi od Paddle aktivacije

#### 1. jul 2026. — Faza 2 Koraci 1–7 (overlay generator + preview UI)

**Kompletiran end-to-end flow:** Upload → Analiza → GuideView → "Popuni automatski" → PreviewView → potvrdi → download popunjenog PDF-a.

**Novi fajlovi:**
- `lib/documentIntelligence/pdfCoordinates.ts` — `diToPdfCoords()`: DI inči → pdf-lib pt (Y-flip, 72dpi). Verifikovano vizuelno (Korak 3 debug-bbox.pdf — crveni pravougaonik tačno na ПИБ ćeliji eko-takse).
- `lib/documentIntelligence/transliterate.ts` — `latinToCyrillic`, `cyrillicToLatin`, `detectScript`, `toDocumentScript`; digraph-first (lj→љ, nj→њ, dž→џ pre jednoslovnih).
- `lib/documentIntelligence/pdfOverlay.ts` — `fillAcroFormFields` (Korak 5A) + `fillTableCells` (Korak 4):
  - AcroForm: `setFontSize(9)` fiksni font, `setText`, `form.updateFieldAppearances(customFont)`, `maxLength` poštovanje sa truncate
  - Table cells: Roboto embed (Cyrillic), `diToPdfCoords`, `fitText` (shrink do 6pt, ellipsis), potpis skip
- `components/obrasci/PreviewView.tsx` — editabilna lista predloga (inline input + × toggle), manual podsetnici, checkbox potvrde, download dugme
- `app/api/obrasci/generate-filled/route.ts` — Korak 7 endpoint: AcroForm→`fillAcroFormFields`+`flatten`, flat→DI re-run+`fillTableCells`; original se briše iz Storage tek nakon uspešnog generisanja; brisanje ne fail-uje response ako ne uspe
- `types/fontkit.d.ts` — CJS deklaracija za fontkit modul

**Izmenjeni fajlovi:**
- `components/obrasci/ObraściClient.tsx` — `di-guide` nosi `fileRef`+`type`; novi `di-preview` stage
- `components/obrasci/GuideView.tsx` — "Popuni automatski →" dugme (vidljivo samo kad postoje predlozi)
- `lib/documentIntelligence/semanticMapper.ts` — Pravila 5+6: sub-komponente adrese (naziv ulice, kućni broj, sprat, stan) i parcijalni telefon (faks) → `profileKey: null`; fiksira "FRU"/"FR" truncate bug

**Test skripte (scripts/):**
- `debug-bbox.mjs` — Korak 3 vizuelna verifikacija koordinata (crveni pravougaonik)
- `test-korak4-fill.mjs` — flat PDF table cell fill test (eko-taksa)
- `test-korak5a-acroform.mjs` — AcroForm fill test (PPDG-1S)

**Potvrđeno na produkciji (PPDG-1S):**
- ✅ Ime, PIB, Mesto tačno u odgovarajućim AcroForm poljima
- ✅ Ćirilica čitljiva, Roboto font odličan
- ✅ Potpis polja prazna
- ✅ Font size konzistentan (9pt) — prethodni auto-size davao različite veličine po visini polja
- ✅ Adresa sub-komponente prazne nakon mapper fix-a (ranije davalo "FRU"/"FR")
- ⚠️ Telefon: T15="063" (maxLength=3, by-design), T16=composite secondary→manual (by-design)

**Commits:** `b879889`, `23b075f`, `5ae343a`, `17d034b`, `8df1d3b`

**Sledeće (Korak 8):** End-to-end validacija na 3+ obrazaca (mešavina AcroForm i flat). 5B slobodne linije čeka novi test obrazac. Potencijalni backlog: adresa split (ulica+broj iz jedne vrednosti profila).

### Sledeće
- Kontaktirati računovodstvene agencije za feedback na Agency plan i /klijenti flow
- High-tier management section: dedicated views po klijentu sa timskim pregledom (kad timski nalozi budu gotovi)

---
*Poslednje ažuriranje: 1. jul 2026.*
