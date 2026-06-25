# AIsistent — Backlog

*Ažurirano: jun 2026.*

## ✅ Završeno

### Infrastruktura
- Domen aisistent.rs — Vercel, DNS, SSL ✅
- Email noreply@aisistent.rs — Resend ✅
- Supabase produkcija — baza, RLS, migracije ✅
- Vercel deployment — production branch master ✅

### Dokumenti i generisanje
- 17 tipova AI dokumenata ✅
- Faktura / Profaktura (bez AI, direktno renderovanje) ✅
- Faktura — međunarodno plaćanje: SWIFT/IBAN/valuta u wizardu, PDF i DOCX ✅
- Putni nalog — wizard, PDF renderer, DOCX, preview, email ✅
- PDF i DOCX export za sve tipove ✅
- Email slanje dokumenata (Resend) ✅
- Blur preview za free korisnike ✅
- Brendiranje firme — logo u PDF/DOCX (Pro/Business/Agency) ✅

### UI / UX
- Wizard sa helper tekstovima i tooltipovima ✅
- Arhiva sa search i filterima ✅
- Profil — firme, avatar inicijali, plan badge ✅
- Admin panel — pregled, korisnici, dokumenti (/admin) ✅
- Onboarding flow — 3 koraka (dobrodošlica, firma, prvi dokument) ✅
- Reset onboarding dugme u podešavanjima ✅
- Podešavanja — lozinka, odjava, brisanje naloga ✅
- shadcn/ui Faza 1 — ScrollArea, Select ✅
- shadcn/ui Faza 2 — Switch, Tooltip, AlertDialog, Dialog ✅
- Mobilna responsivnost — wizard, sidebar, faktura stavke ✅
- Tooltip fix — click-only za mobilne uređaje ✅

### Kvalitet
- Proof-reading i zakonski audit svih 17 tipova ✅
- companyFieldMap za sve tipove ✅
- Dokumentacija — ARCHITECTURE, CONVENTIONS, PROMPT_GUIDE, decisions/ ✅

---

## 🔴 Visok prioritet

- **Payment gateway (Paddle)** — čeka APR registraciju preduzetnika
  Kontakt: paddle.com, seller account za Srbiju
  Blokira: naplatu pretplate
- **Politika privatnosti i Uslovi korišćenja** — obavezno po ZZPL/GDPR.
  Uraditi čim bude otvorena firma u APR.
  Potrebno: sedište firme, podaci rukovaoca, Paddle status, tracking alati.
  Blokira: Paddle aktivaciju i pravnu usklađenost platforme.

---

## 🟡 Srednji prioritet

- **APR API / PIB lookup** — ~~Istražiti~~ Blokirano: zahteva ugovor sa APR,
  dostupno samo pravnim licima. Implementirati tek nakon otvaranja firme.

- **shadcn Faza 3** — Sheet za mobilni sidebar (slide-in) ✅

---

## 🔵 Nizak prioritet / Buduće ideje

### Novi tipovi dokumenata
- Otpremnica — komercijalni dokument za isporuku robe ✅
- ~~Porudžbenica~~ — odbačeno, zastareo B2B enterprise dokument van scope-a
- ~~Trebovanje~~ — odbačeno, interni dokument za velike sisteme van scope-a
- Ponuda za radove — dinamička tabela (majstori, izvođači) ✅

### Napredne funkcionalnosti

#### Agency plan — Faza 2
- "Pošalji klijentu" flow ✅
- SEF integracija — ~~slanje fakture na Sistem elektronskih faktura~~
  Blokirano: zahteva registraciju pravnog lica + dozvolu MF kao informacioni posrednik
- **Verzionisanje dokumenata** ✅ — version + root_document_id, "Nova verzija" dugme, ?from= pre-populacija
- **Proširenje profila firme** ✅ — delatnost, ziro_racun, pdv_obveznik, website; companyFieldMap za 7 tipova
- **Redesign CompaniesTab** ✅ — Sheet forma, avatar kartice, ikonska dugmad, AlertDialog, pretraga
- **Timski nalozi** — Blokiran: čeka Paddle aktivaciju. Arhitektura: workspace model, invite, role (owner/member)

#### UI — Dedicated stranica za upravljanje klijentima (high-tier)
Za Agency/Business plan: dedicated `/klijenti` stranica umesto taba u dashboardu.
- Klijenti → Dokumenti po klijentu (dedicated view)
- Skalabilno za timske naloge
- Uraditi tek kada se implementiraju timski nalozi

#### API
- Javni API za generisanje dokumenata (dugoročno)
