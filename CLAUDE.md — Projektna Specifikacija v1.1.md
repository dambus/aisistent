# CLAUDE.md — AIsistent (aisistent.rs)

## O projektu

Web platforma koja generiše pravne dokumente, marketing sadržaj i AI alate
za srpsko i regionalno tržište, pomoću Claude API-ja.

**Domena:** aisistent.rs (primarno) | aisistent.co (region)
**Cilj:** pasivan prihod, minimalno održavanje, srpsko i regionalno tržište.

---

## Vertikale (planirana arhitektura)

```
aisistent.rs/
├── /dokumenti     ← Vertikala 1: Generator ugovora i pravnih dokumenata (MVP)
├── /sadrzaj        ← Vertikala 2: AI copywriting za balkanske firme
├── /nekretnine     ← Vertikala 3: AI opisi i dokumenti za nekretnine
└── /asistent       ← Vertikala 4: White-label chatboti (buduće)
```

MVP fokus: `/dokumenti` — sve ostalo dolazi kasnije.

---

## Tech stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Baza**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Anthropic Claude API (claude-sonnet-4-5)
- **Plaćanje**: Stripe (pretplate i jednokratne uplate)
- **PDF export**: @react-pdf/renderer (serverless kompatibilno)
- **DOCX export**: docx npm paket
- **Deployment**: Vercel
- **Email**: Resend

---

## Struktura projekta

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/        # Korisnikova arhiva dokumenata
│   │   └── dokumenti/
│   │       └── [type]/       # Wizard po tipu ugovora
│   ├── api/
│   │   ├── generate/         # Claude API poziv
│   │   ├── export/           # PDF/DOCX generisanje
│   │   └── webhooks/         # Stripe webhooks
│   └── page.tsx              # Landing page
├── components/
│   ├── wizard/               # Wizard komponente po koracima
│   ├── ui/                   # Shadcn/ui komponente
│   └── document/             # Preview i export komponente
├── lib/
│   ├── prompts/              # Sistemski promptovi po tipu ugovora
│   │   ├── ugovor-o-radu.ts
│   │   ├── ugovor-o-delu.ts
│   │   ├── nda.ts
│   │   ├── ugovor-o-zakupu.ts
│   │   └── ugovor-o-saradnji-zajmu.ts
│   ├── supabase/
│   ├── stripe/
│   └── utils/
├── types/
└── CLAUDE.md
```

---

## Tipovi ugovora (MVP — Vertikala 1)

| ID | Naziv | Status |
|----|-------|--------|
| `ugovor-o-radu` | Ugovor o radu | Prompt spreman v1.1 |
| `ugovor-o-delu` | Ugovor o delu | Prompt spreman v1.0 |
| `nda` | NDA / Sporazum o poverljivosti | Prompt spreman v1.0 |
| `ugovor-o-zakupu` | Ugovor o zakupu | Prompt spreman v1.0 |
| `ugovor-o-saradnji` | Ugovor o saradnji / zajmu | Prompt spreman v1.0 |

---

## Monetizacija

```
Besplatno:  1 dokument mesečno, PDF sa watermarkom
Starter:    €9/mes  — 10 dokumenata, PDF bez watermarke
Pro:        €25/mes — neograničeno, PDF + DOCX, arhiva
Business:   €60/mes — 5 korisnika, API pristup
```

Watermark: dijagonalni tekst "Generisano na aisistent.rs — upgradeuj na Pro",
30% opacity, serverside generisan — nije lako ukloniti.

---

## Baza podataka — Supabase tabele

```sql
profiles (
  id uuid references auth.users,
  plan text default 'free',
  documents_this_month int default 0,
  stripe_customer_id text,
  created_at timestamptz
)

documents (
  id uuid primary key,
  user_id uuid references profiles,
  type text,
  title text,
  input_data jsonb,
  generated_text text,
  created_at timestamptz,
  is_free boolean default false
)

subscriptions (
  id uuid primary key,
  user_id uuid references profiles,
  stripe_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz
)
```

---

## Pravila i konvencije

- TypeScript svuda — bez `any` tipova
- Server Components po defaultu, `use client` samo kada neophodno
- Claude API ključ SAMO serverside, nikad na frontendu
- Rate limiting na `/api/generate` — max 10 poziva/sat po korisniku
- Validacija svih inputa pre Claude API-ja (Zod šeme)
- Supabase RLS na svim tabelama — korisnik vidi SAMO svoje dokumente
- Mobile-first UI

---

## Environment varijable

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://aisistent.rs
```

---

## Ključna poslovna pravila

1. Besplatni: max 1 dokument/mesec, watermark na PDF-u
2. Svaki dokument ima pravni disclaimer na kraju
3. Deklinacija: Claude API dobija eksplicitnu instrukciju za srpske padeže
4. Jezik: srpski latinica, bez ćirilice u MVP

---

## Disclaimer na svakom dokumentu

"Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao
polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja.
aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta."

---

## Redosled razvoja (MVP)

1. [ ] Supabase setup — auth, tabele, RLS
2. [ ] Landing page
3. [ ] Auth flow
4. [ ] Wizard UI
5. [ ] Claude API integracija
6. [ ] PDF export sa watermark logikom
7. [ ] DOCX export
8. [ ] Stripe integracija
9. [ ] Dashboard — arhiva
10. [ ] Deploy na Vercel

---

## Tehničke napomene za Claude Code

- PDF: koristi @react-pdf/renderer umesto Puppeteera — kompatibilno sa Vercel serverless
- Stripe webhooks moraju biti idempotentni
- Ne koristi localStorage — sve kroz Supabase
- Buduće vertikale (/sadrzaj, /nekretnine) dele isti auth i Stripe — dizajniraj
  sa tim na umu od početka

---
*Verzija 1.1 — jun 2026. | Promene: naziv aisistent.rs, dodata arhitektura vertikala*
