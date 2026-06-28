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
    dokumenti/[type]/   — wizard po tipu dokumenta (?from= verzionisanje, ?clientId= pre-selekcija)
    arhiva/             — lista dokumenata korisnika
    profil/             — lični podaci + moje firme/klijenti (CompaniesTab)
    klijenti/           — dedicated Agency stranica: grid klijenata sa document count [Agency only]
    klijenti/[id]/      — profil klijenta + dokumenti filtirani po company_id [Agency only]
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
    companies/          — CRUD za sačuvane firme/klijente
    companies/[id]/logo/ — upload/delete loga firme (Pro/Agency)
    documents/[id]/     — GET (sa ownership check) + DELETE dokumenata iz arhive
    profile/            — set-name, delete naloga
    send-document/      — slanje dokumenta emailom (Resend)
  page.tsx              — Landing page

lib/
  prompts/              — 20 TypeScript fajlova, jedan po tipu
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
  plan text DEFAULT 'free',     -- 'free' | 'starter' | 'pro' | 'agency'
  documents_this_month int,     -- brojač, resetuje se 1. u mesecu
  display_name text,
  stripe_customer_id text,
  is_admin boolean,
  onboarded boolean,
  industry text,                -- delatnost za onboarding personalizaciju
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
  version integer DEFAULT 1,    -- verzija dokumenta (1 = original)
  root_document_id uuid REFERENCES documents,  -- NULL za v1, ID originala za v2+
  company_id uuid REFERENCES companies,        -- klijent za kojeg je dokument napravljen (nullable)
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
  logo_url text,                -- putanja u Supabase Storage (company-logos bucket)
  delatnost text,               -- za auto-popunjavanje wizard polja
  ziro_racun text,              -- za fakture i ponude
  pdv_obveznik boolean DEFAULT false,
  website text,
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

| Plan    | Dokumenti/mes | PDF | DOCX | Logo | Firme | Arhiva | Email |
|---------|--------------|-----|------|------|-------|--------|-------|
| free    | 3 (watermark)| ✅  | ❌   | ❌   | 0     | ❌     | ❌    |
| starter | 20           | ✅  | ✅   | ❌   | 1     | ✅     | ✅    |
| pro     | neograničeno | ✅  | ✅   | ✅   | 3     | ✅     | ✅    |
| agency  | neograničeno | ✅  | ✅   | ✅   | ∞     | ✅     | ✅    |

Agency plan razlike vs Pro: "Firme" → "Klijenti" rebrand, dedicated /klijenti stranica, company_id tracking po dokumentu, inline quick-switch dropdown u wizardu.

Limit check: `profiles.documents_this_month >= limit` u `/api/generate/route.ts`
Free tier dodatno nema pristup arhivi i email slanju dokumenata.

## Blog sistem (Supabase-based)

Blog je u potpunosti baziran na Supabase — nema filesystem čitanja, novi postovi su živi bez redeployа.

### Tabele

```sql
blog_posts (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  content_md text,           -- markdown, konvertuje se u HTML pri renderovanju
  date date,
  read_time text,
  keywords text[],
  published boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
)
-- RLS: public SELECT WHERE published = true | service_role za write

blog_keywords (
  id uuid PRIMARY KEY,
  keyword text NOT NULL,
  naslov text,               -- predloženi naslov posta
  alat text,                 -- npr. 'ponuda-klijentu'
  format text DEFAULT 'long-form',  -- 'long-form' | 'kratki' | 'listicle'
  status text DEFAULT 'pending',    -- 'pending' | 'in-progress' | 'done' | 'skip'
  blog_post_id uuid REFERENCES blog_posts(id),
  created_at timestamptz
)
-- RLS: samo service_role (interno, n8n i Supabase dashboard)
```

### Renderovanje

`lib/blog.ts` — anon Supabase client (bez cookie konteksta):
- `getAllPostMeta()` — dohvata slug, title, date, description, read_time, keywords
- `getPost(slug)` — dohvata content_md + konvertuje u HTML via `remark + remark-gfm + remark-html`

Obe blog stranice imaju `export const dynamic = 'force-dynamic'` — uvek svež fetch iz baze.

### n8n Blog Automation Workflow

```
Schedule (nedeljno)
  ↓
Supabase Get many rows — SELECT * FROM blog_keywords WHERE status = 'pending' LIMIT 1
  ↓
Code — pravi Claude prompt (keyword + naslov + alat + format)
  ↓
Message a Model — Claude generiše post (vraća JSON: title, description, content_md, read_time, keywords)
  ↓
Code — parsuje JSON, strippuje markdown fences
  ↓
Supabase Create — INSERT u blog_posts (published = false → draft)
  ↓
Supabase Update — blog_keywords SET status = 'done', blog_post_id = <novi uuid>
  ↓
Telegram — notifikacija adminu sa linkom za odobravanje
```

Post se kreira kao `published = false` (draft). Admin odobrava u `/admin/blog`.

### Admin panel

`/admin/blog` — lista svih postova (published + draft):
- Toggle `published` dugme (odobravanje/vraćanje u draft)
- Brisanje posta

API: `PATCH /api/admin/blog` (toggle published), `DELETE /api/admin/blog` (brisanje).
Oba endpointa zahtevaju `is_admin = true` na profilu.

### Dodavanje posta ručno (CLI)

Za brzi upsert postojećeg markdown sadržaja:
```
npm run seed:blog           # upsertuje sve fajlove iz content/blog/*.md
```

Za batch insert keyword lista:
```
npm run seed:blog-keywords  # ako postoji scripts/seed-blog-keywords.ts
```

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
