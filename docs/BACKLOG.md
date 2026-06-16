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
- PDF i DOCX export za sve tipove ✅
- Email slanje dokumenata (Resend) ✅
- Blur preview za free korisnike ✅
- Brendiranje firme — logo u PDF/DOCX (Pro/Business) ✅

### UI / UX
- Wizard sa helper tekstovima i tooltipovima ✅
- Arhiva sa search i filterima ✅
- Profil — firme, avatar inicijali, plan badge ✅
- Admin panel — pregled, korisnici, dokumenti (/admin) ✅
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

---

## 🟡 Srednji prioritet

- **APR API / PIB lookup** — korisnik unese PIB, automatski se
  popune naziv, adresa, zastupnik iz APR registra.
  Istražiti: api.apr.gov.rs dostupnost i uslove

- **shadcn Faza 3** — Sheet za mobilni sidebar (slide-in)

- **Onboarding flow** — welcome wizard za nove korisnike
  (tip biznisa, najčešći dokumenti, popunjavanje prve firme)

---

## 🔵 Nizak prioritet / Buduće ideje

### Novi tipovi dokumenata
- Putni nalog — obavezan za korišćenje službenih vozila
- Otpremnica — komercijalni dokument za isporuku robe
- Porudžbenica — narudžbina robe ili usluga
- Trebovanje — interni zahtev za materijal
- Ponuda za radove — dinamička tabela (majstori, izvođači)

### Napredne funkcionalnosti
- SEF integracija — slanje fakture na Sistem elektronskih faktura
- Verzionisanje dokumenata — čuvanje prethodnih verzija
- Timski nalozi — Business plan, više korisnika
- API
