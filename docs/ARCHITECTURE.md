# AIsistent — Arhitektura

## Struktura projekta

```
app/
  admin/
    page.tsx          — pregled (stat kartice, poslednji dokumenti)
    korisnici/        — lista svih korisnika
    dokumenti/        — lista i statistika dokumenata
    layout.tsx        — admin header + double-check is_admin
  (auth)/
    login/              — stranica za prijavu
    register/           — stranica za registraciju
  (dashboard)/
    dashboard/          — početna sa pozdravom i alatima
    dokumenti/[type]/   — wizard po tipu dokumenta
    arhiva/             — lista dokumenata korisnika
    profil/             — lični podaci + moje firme
    podesavanja/        — lozinka, odjava, brisanje naloga
    alati/
      kalkulator-zarade/
      kalkulator-pausala/
      kalkulator-ugovora-o-delu/
  api/
    generate/           — Claude API poziv (POST)
    export/
      pdf/              — generisanje PDF-a (POST)
      docx/             — generisanje DOCX-a (POST)
    companies/          — CRUD za sačuvane firme
    documents/[id]/     — DELETE dokumenata iz arhive
    profile/            — set-name, delete naloga
    send-document/      — slanje dokumenta emailom (Resend)
  page.tsx              — Landing page

lib/
  prompts/              — 17 TypeScript fajlova, jedan po tipu
  pdf/
    markdownParser.ts   — Markdown → PDF blokovi (parseMarkdown)
    AisistentDocument.tsx — React PDF template + buildSigData()
    docxBuilder.ts      — DOCX builder, mora biti sinhronizovan sa PDF
  supabase/
    client.ts           — browser client
    server.ts           — server component client
    admin.ts            — admin client (service role)
  utils/
    vocative.ts         — srpski vokativ iz nominativa
    documentTypes.ts    — TYPE_LABELS mapa (human-readable nazivi)
    companyFieldMap.ts  — mapiranje company → wizard polja po tipu
    genderDetect.ts     — detekcija roda iz prvog imena

components/
  dashboard/
    Sidebar.tsx         — navigacija sa kategorijama
    GreetingHeader.tsx  — pozdrav + plan info
    RecentDocuments.tsx — poslednji dokumenti na home
    ArchiveList.tsx     — lista + search + filter u arhivi
    DashboardShell.tsx  — layout wrapper
    WelcomeModal.tsx    — onboarding modal
  wizard/
    WizardForm.tsx      — multi-step forma
    DocumentPreview.tsx — preview generisanog dokumenta
    ReminderBox.tsx     — podsetnici uz dokument
    CompanySelectModal.tsx — modal za izbor firme
    FieldHelper.tsx     — helper tekst uz polja
    SendEmailModal.tsx  — modal za slanje emailom

data/
  reminders.ts          — podsetnici po tipu dokumenta

types/
  wizard.ts             — TypeScript interfejsi za sve tipove
  database.ts           — Supabase tabele tipovi

docs/                   — projektna dokumentacija
```

## Baza podataka (Supabase)

```sql
profiles (
  id uuid PRIMARY KEY,          -- = auth.users.id
  plan text DEFAULT 'free',     -- 'free' | 'starter' | 'pro' | 'business'
  documents_this_month int,     -- brojač, resetuje se 1. u mesecu
  display_name text,
  stripe_customer_id text,
  created_at timestamptz
)

documents (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  type text,                    -- 'ugovor-o-radu' itd.
  title text,
  input_data jsonb,             -- wizard polja
  generated_text text,          -- Claude output
  is_free boolean,
  created_at timestamptz
)

companies (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  naziv text,
  pib text,
  maticni_broj text,
  adresa text,
  grad text,
  zastupnik text,
  funkcija_zastupnika text,
  email text,
  telefon text,
  is_default boolean,
  created_at timestamptz
)

subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid,
  stripe_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz
)
```

RLS je uključen na svim tabelama — korisnik vidi samo svoje podatke.

## Tok generisanja dokumenta

```
1. Korisnik popunjava WizardForm (client component)
2. Submit → POST /api/generate
3. route.ts:
   a. Autentifikacija (Supabase)
   b. Provera plan limita (documents_this_month)
   c. Zod validacija input podataka
   d. buildUserMessage() iz odgovarajućeg prompta
   e. Claude API poziv (claude-sonnet-4-5)
   f. Čuvanje u documents tabeli
   g. Inkrement documents_this_month
4. DocumentPreview prikazuje generisani tekst
5. Export → POST /api/export/pdf ili /api/export/docx
   a. Dohvata dokument iz baze
   b. parseMarkdown() → blokovi
   c. Renderovanje (AisistentDocument ili docxBuilder)
   d. Vraća blob
```

## Plan limiti

| Plan | Dokumenti/mesec | PDF | DOCX | Cena |
|------|----------------|-----|------|------|
| free | 1 | sa oznakom | ❌ | besplatno |
| starter | 20 | ✅ | ❌ | ~1.080 RSD |
| pro | neograničeno | ✅ | ✅ | ~3.000 RSD |
| business | neograničeno | ✅ | ✅ | ~7.200 RSD |

Limit check: `profiles.documents_this_month >= limit` u `/api/generate/route.ts`

## Monetizacija

- **Paddle** — payment gateway (čeka APR registraciju preduzetnika)
- **Stripe** — nije podržan direktno za Srbiju
- Za sada: faktura + bankovni transfer za B2B klijente

## Email (Resend)

- From: `noreply@aisistent.rs` (domen verifikovan)
- Sandbox je bio `onboarding@resend.dev` — ne koristiti
- Implementacija: `lib/resend.ts` + `app/api/send-document/route.ts`

## Deployment

- **Vercel** — produkcija na `aisistent.rs` (production branch: `master`)
- `main` branch ne postoji / nije production — sve ide na `master`
- Preview deployovi idu na Vercel preview URL-ove

---
*jun 2026.*
