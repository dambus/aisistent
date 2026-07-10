# Handover dokumentacija — pregled

*Napisano 5. jul 2026. (Claude Sonnet 5, poslednji pristup 7.7.2026). Cilj: preneti znanje o projektu budućim AI sesijama i saradnicima. Pisano da slabiji model može da implementira bez dodatnog konteksta.*

**Pre bilo kog zadatka pročitati `12-META-UPUTSTVO.md`.**

| Fajl | Sadržaj | Status |
|------|---------|--------|
| `01-TECH-DEBT.md` | 11 stavki tech debt-a sa fix predlozima + "šta NE dirati" | aktuelno |
| `02-KATALOG-USLUGA.md` | Katalog usluga/artikala (Smart Autofill 2) — Pro+ | implementirano 10. jul, čeka `supabase db push` na produkciju |
| `03-SACUVANI-ZAPOSLENI.md` | Sačuvani zaposleni (Smart Autofill 3) — Pro+, osetljivi podaci | čeka implementaciju |
| `04-DOCX-AUDIT.md` | DOCX formatiranje audit + fix (watermark, viseći naslovi, potpisi) | čeka implementaciju |
| `05-FEATURE-NAJAVE.md` | TipCard najave feature-a + "šta je novo" | čeka implementaciju |
| `06-CHATBOT-MVP.md` | Kontekstualni chatbot MVP (integrisan sa profilom) | čeka implementaciju |
| `07-FLAT-TO-ACROFORM.md` | Flat→AcroForm konverzija pri kuraciji (otključava OPD, eko taksu...) | čeka implementaciju |
| `08-HARVESTER-OPS.md` | Novi izvori obrazaca + n8n cron automatizacija | operativno uputstvo |
| `09-PADDLE-I-TIMSKI-NALOZI.md` | Naplata + timovi — BLOKIRANO na APR registraciju firme | čeka odblokiranje |
| `10-JAVNI-API.md` | Javni API skica — raditi tek uz tražnju | dugoročno |
| `11-BRAINSTORM-FEATURES.md` | 20+ ideja sa opisom/vrednošću/rizicima + predlog redosleda | meni za razradu |
| `12-META-UPUTSTVO.md` | Kako raditi sa AI modelima na projektu — protokol + zamke | trajno |

Povezano van ovog foldera:
- `docs/BACKLOG.md` — živ backlog; sekcija "[ZA RAZMATRANJE] Granularniji profil firme" (adresa/telefon sub-komponente) je detaljno analizirana tamo, nije duplirana ovde
- `.ai-memory/` — cross-machine memorija sesija (git)
- `docs/obrasci/FAZA4_BIBLIOTEKA_OBRAZACA.md` — spec biblioteke, pravila kuracije 6.1
