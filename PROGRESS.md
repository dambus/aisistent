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

### Čekaju primenu (Supabase SQL Editor)
- 20260611000001_add_contacts.sql — contacts tabela
- 20260616000001_add_admin_role.sql — is_admin kolona
- 20260616000002_add_onboarded.sql — onboarded kolona

### Blokirano
- Payment gateway (Paddle) — čeka APR registraciju
- APR API / PIB lookup — čeka APR ugovor (apr-podaci@apr.gov.rs)

### Sledeće
- Agency plan: kontaktirati 3-5 računovodstvenih agencija za feedback (da li quick-switch i klijenti rebrand odgovaraju workflow-u)
- Agency plan Faza 2: "Pošalji klijentu" dedicated flow (računovođa generiše -> direktno šalje klijentu)
- shadcn Faza 3 — Sheet za mobilni sidebar
- Onboarding flow za nove korisnike (razmatrati)

---
*Poslednje ažuriranje: jun 2026.*
