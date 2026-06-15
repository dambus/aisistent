# AIsistent — Feature Backlog

## ✅ Završeno (jun 2026.)
- Brendiranje firme — logo korisnika na PDF/DOCX dokumentima
- Email slanje dokumenata (Resend) — noreply@aisistent.rs
- Blur preview za free korisnike
- Brisanje dokumenata iz arhive
- Kompaktni akcioni red u arhivi (dropdown)
- Arhiva — debounce search + marketing filter + kompletna TYPE_CATEGORY mapa
- Fakture i profakture — wizard, PDF, DOCX, preview
- shadcn/ui Faza 1 — ScrollArea (sidebar), Select (arhiva filter)
- Domen aisistent.rs — Vercel, DNS, SSL
- Nova dokumentaciona struktura (ARCHITECTURE, CONVENTIONS, PROMPT_GUIDE, decisions/)
- Proof-reading i zakonski audit svih 17 tipova dokumenata
  (Zakon o radu, ZOO, ZASP, ZZPL/GDPR, ZPP)
- Wizard audit — placeholder/helper/tooltip pokrivenost
- lib/utils/rod.ts — detekcija roda zastupnika
- Sistemske ispravke: placeholder detekcija, rendering bugovi,
  fallback-ovi za sve tipove

## 🔴 Bugovi (iz BUG_TRACKER.md)
Videti docs/BUG_TRACKER.md za kompletnu listu.
Aktivni bugovi: BUG-032, BUG-033 (faktura PDF/DOCX sitnice)

## 🟡 Visok prioritet (sledeće):
- **Fix BUG-032 i BUG-033** — dijakritici u faktura PDF-u, PIB primaoca u DOCX-u
- **Payment gateway (Paddle)** — čeka APR registraciju preduzetnika

## 🟢 Srednji prioritet:
- **APR API integracija (PIB lookup)** — korisnik unese PIB, aplikacija
  automatski popuni naziv firme, adresu, zastupnika. Veliki UX win za B2B.
  Proveriti dostupnost APR API-ja i uslove korišćenja.
- **shadcn/ui Faza 2** — Switch (toggle polja), Tooltip, Dialog/AlertDialog
- **Admin panel (osnovna verzija)** — zaštićena /admin ruta, pregled
  korisnika/dokumenata/planova, audit akcija za proveru promptova
- **Kalkulator paušalnog poreza** — kada budemo imali tačnu formulu

## 🔵 Nizak prioritet / Buduće ideje:
- **Ponuda za radove** — novi tip sa dinamičkom tabelom stavki
  (vodoinstalateri, majstori). Zahteva novi UI pattern.
- **Putni nalog** — obavezan dokument za korišćenje službenih vozila
- **Otpremnica** — komercijalni dokument za isporuku robe
- **Porudžbenica** — narudžbina robe ili usluga
- **Trebovanje** — interni zahtev za materijal
- **Dokumentacija o naplati preko administrativne zabrane**
- **SEF integracija** — slanje fakture na Sistem elektronskih faktura
- **Regionalno širenje** — HR, BiH, MK (posebni prompt setovi)
- **API za partnere**
- **Affiliate program**
- **Verzionisanje dokumenata**
- **Timski nalozi** (Business plan)

## Odbačeno / Na čekanju
- Stripe direktno — Srbija nije podržana, koristimo Paddle
- Fiskalizacija — odložena, fokus na B2B bez kase
- ~~Fakture čekaju payment gateway~~ — REVIDIRANO: implementirano jun 2026.

## Napomene
- Payment gateway čeka fizičku posetu APR i registraciju preduzetničke radnje
- shadcn/ui migracija: postepena, videti docs/decisions/003-shadcn-migracija.md
- Proof-reading: raditi po jedan tip, početi sa najpopularnijim

---
*Ažurirano: jun 2026.*

---
