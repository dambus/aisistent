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
**Sledeći zadatak:** Korak 4b — PDF formatiranje (Markdown parser)

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

## Aktivni zadaci

### ⏳ Korak 4b — PDF formatiranje (SLEDEĆE)
**Problem:** Claude API vraća Markdown, PDF prikazuje raw sintaksu
**Rešenje:** Markdown parser + tipografija u AisistentDocument.tsx

Šta treba uraditi:
- [ ] Kreirati `lib/pdf/markdownParser.ts`
- [ ] Ažurirati `lib/pdf/AisistentDocument.tsx` sa parserom i tipografijom
- [ ] Testirati sa stvarnim dokumentom

---

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
- PDF prikazuje raw Markdown → fixes se u Koraku 4b
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
│   │   └── docxBuilder.ts
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