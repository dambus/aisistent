# CLAUDE.md — AIsistent projektna specifikacija

## O projektu
Web platforma za generisanje poslovnih dokumenata,
pravnih akata i AI alata za srpsko tržište.

URL: https://aisistent-topaz.vercel.app
GitHub: https://github.com/dambus/aisistent
Stack: Next.js 16, Supabase, Claude API, Vercel

## Dokumentacija projekta
Uvek pročitaj pre pisanja koda:
- docs/DEVELOPER_GUIDE.md — checklist za nove tipove
- docs/BACKLOG.md — šta je sledeće
- docs/STRATEGIJA.md — pozicioniranje i pravila
- PROGRESS.md — trenutno stanje i sesije

## Tech stack
- Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API Routes (serverless)
- Baza: Supabase (PostgreSQL + Auth + RLS)
- AI: Anthropic Claude API (claude-sonnet-4-5)
- PDF: @react-pdf/renderer
- DOCX: docx npm paket
- Deployment: Vercel
- Email: Resend (implementirati)
- Plaćanje: Paddle (čeka APR registraciju)

## Struktura projekta

app/
  (auth)/login, register
  (dashboard)/
    dashboard/          — home sa pozdravom i alati
    dokumenti/[type]/   — wizard po tipu dokumenta
    arhiva/             — lista dokumenata korisnika
    profil/             — lični podaci + moje firme
    podesavanja/        — lozinka, odjava, brisanje
    alati/
      kalkulator-zarade/
      kalkulator-pausala/
      kalkulator-ugovora-o-delu/
  api/
    generate/           — Claude API poziv
    export/pdf, docx/   — PDF i DOCX generisanje
    companies/          — CRUD za profil firme
    profile/            — set-name, delete
  page.tsx              — Landing page

lib/
  prompts/              — 17 sistemskih promptova
  pdf/
    markdownParser.ts   — Markdown → PDF blokovi
    AisistentDocument.tsx
    docxBuilder.ts
  supabase/client, server, admin
  utils/
    vocative.ts         — srpski vokativ
    documentTypes.ts    — human-readable nazivi
    companyFieldMap.ts  — mapiranje polja po tipu
    genderDetect.ts     — detekcija roda iz imena

components/
  dashboard/Sidebar, GreetingHeader, RecentDocuments,
             WelcomeModal, DashboardShell, ArchiveList
  wizard/WizardForm, DocumentPreview, ReminderBox,
         CompanySelectModal, FieldHelper

data/reminders.ts       — podsetnici za sve tipove
docs/                   — dokumentacija projekta

## Alati (17 tipova)

Ugovori i dokumenti (7):
  ugovor-o-radu, ugovor-o-delu, nda,
  ugovor-o-zakupu, ugovor-o-saradnji-zajmu,
  punomocje, opsti-uslovi

Poslovna komunikacija (2):
  poslovni-mejl, ponuda-klijentu

HR i zapošljavanje (5):
  oglas-za-posao, odgovor-kandidatu, preporuka,
  resenje-godisnji-odmor, pravilnik-o-radu

Marketing i prodaja (3):
  opis-proizvoda, bio-o-nama, zapisnik-sastanak

## Kalkulatori (3)
  kalkulator-zarade, kalkulator-pausala (info),
  kalkulator-ugovora-o-delu

## Baza podataka

profiles (id, plan, documents_this_month,
          display_name, stripe_customer_id, created_at)

documents (id, user_id, type, title, input_data,
           generated_text, is_free, created_at)

subscriptions (id, user_id, stripe_subscription_id,
               plan, status, current_period_end)

companies (id, user_id, naziv, pib, maticni_broj,
           adresa, grad, zastupnik, funkcija_zastupnika,
           email, telefon, is_default, created_at)

## Monetizacija

Besplatno: 3 dokumenta mesečno, PDF sa oznakom
Starter:   ~1.080 RSD/mes — 20 dokumenata, PDF
Pro:       ~3.000 RSD/mes — neograničeno, PDF + DOCX
Business:  ~7.200 RSD/mes — do 5 korisnika

Plan limit provjera: profiles.documents_this_month
DOCX samo za Starter+ plan.

## Ključna pravila

- TypeScript svuda, bez any tipova
- Server Components po defaultu
- Claude API ključ SAMO serverside
- Rate limiting: max 10 poziva/sat po korisniku
- Supabase RLS na svim tabelama
- Mobile-first UI
- Srpska latinica, sanitizeText() za ćirilicu
- Svi tekstovi na srpskom, bez anglicizama
- Toggle polja: defaultValue: false (uvek!)
- Datumi u zaglavlju i potpisu: uvek prazno ___
- Broj ugovora: uvek opciono polje

## Disclaimer na svakom dokumentu

"Napomena: Ovaj dokument je generisan uz pomoć
AI alata i služi kao polazna osnova. Preporučuje
se konsultacija sa pravnikom pre potpisivanja.
aisistent.rs ne preuzima odgovornost za pravnu
valjanost dokumenta."

## Environment varijable

ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://aisistent-topaz.vercel.app
