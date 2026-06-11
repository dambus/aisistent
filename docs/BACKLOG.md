# AIsistent — Feature Backlog

## Redosled implementacije

### Visok prioritet (sledeće):
- Brendiranje firme — logo korisnika na PDF/DOCX dokumentima
- Payment gateway (Paddle) — čeka APR registraciju preduzetnika
- Fakture i profakture — čeka payment gateway

### Srednji prioritet:
- Email slanje dokumenata (Resend) — posle brendiranja
- Blur preview za free korisnike
- Dashboard arhiva — delete dokumenata
- Kalkulator paušalnog poreza (kada budemo imali tačnu formulu)

### Nizak prioritet:
- SEF integracija (Faza 4)
- Regionalno širenje (HR, BiH, MK)
- API za partnere
- Affiliate program
- Verzionisanje dokumenata
- Timski nalozi (Business plan)

## Odbačeno / Na čekanju
- Stripe direktno — Srbija nije podržana, koristimo Paddle
- Fiskalizacija — odložena, fokus na B2B bez kase
- Email from adresa: trenutno `onboarding@resend.dev` (sandbox). Kada aisistent.rs domen bude aktivan,
  verifikovati u Resend panelu i promeniti na `noreply@aisistent.rs` u `app/api/send-document/route.ts`

## Napomene
- Payment gateway čeka fizičku posetu APR i registraciju
  preduzetničke radnje
- Email slanje ide POSLE brendiranja firme jer mejl
  sa brendiranim dokumentom ima više vrednosti
- Fakture idu POSLE payment gateway-a

---
*Ažurirano: jun 2026.*
