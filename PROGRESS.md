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
- ✅ Brendiranje firme — logo u PDF/DOCX (Pro/Business)
- ✅ Arhiva sa search i filterima
- ✅ Profil — firme, avatar inicijali, plan badge
- ✅ Podešavanja — lozinka, odjava, brisanje naloga
- ✅ Admin panel (/admin) — korisnici, dokumenti, statistika
- ✅ shadcn/ui (ScrollArea, Select, Switch, Tooltip, AlertDialog, Dialog, Sheet)
- ✅ Mobilna responsivnost
- ✅ Proof-reading i zakonski audit svih tipova
- ✅ Kompletna projektna dokumentacija (docs/)

### Aktivne sesije i izmene

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
