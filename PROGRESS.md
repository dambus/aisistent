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

### Sledeće
- Kontaktirati računovodstvene agencije za feedback na Agency plan i /klijenti flow
- High-tier management section: dedicated views po klijentu sa timskim pregledom (kad timski nalozi budu gotovi)

---
*Poslednje ažuriranje: jun 2026.*
