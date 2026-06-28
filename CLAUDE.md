# CLAUDE.md — AIsistent

Web platforma za generisanje poslovnih dokumenata za srpsko tržište.

- **URL:** https://aisistent.rs
- **GitHub:** https://github.com/dambus/aisistent
- **Stack:** Next.js 16, Supabase, Claude API, Vercel

## Memorija — učitaj na početku svake sesije

Fajlovi u `.ai-memory/` su cross-machine persistentna memorija — sinhronizovana putem gita.
Na početku svake sesije pročitati `.ai-memory/MEMORY.md` i relevantne memory fajlove.
Kada upisuješ novu memoriju, pisati u **oba** mesta: lokalni `~/.claude/projects/.../memory/` i `.ai-memory/` u repou.

## Dokumentacija — čitaj pre pisanja koda

| Fajl | Kada čitati |
|------|-------------|
| `docs/ARCHITECTURE.md` | Pre svake izmene strukture, API-ja ili baze |
| `docs/CONVENTIONS.md` | Pre pisanja bilo kog koda ili prompta |
| `docs/PROMPT_GUIDE.md` | Pre pisanja ili izmene prompt fajlova |
| `docs/DEVELOPER_GUIDE.md` | Pre dodavanja novog tipa dokumenta |
| `docs/BUG_TRACKER.md` | Pre fixiranja bugova — proveri da li je već prijavljeno |
| `docs/BACKLOG.md` | Pre početka nove sesije — šta je sledeće |
| `docs/STRATEGIJA.md` | Kada radiš na UX-u, tekstovima ili poziconiranju |
| `PROGRESS.md` | Log prethodnih sesija |

## Brzi pregled stack-a

- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Baza:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Anthropic Claude API (claude-sonnet-4-5)
- **PDF:** @react-pdf/renderer | **DOCX:** docx npm paket
- **Email:** Resend | **Deployment:** Vercel
- **Plaćanje:** Paddle (čeka APR registraciju)

## 20 tipova dokumenata

Ugovori (7): ugovor-o-radu, ugovor-o-delu, nda, ugovor-o-zakupu,
             ugovor-o-saradnji-zajmu, punomocje, opsti-uslovi

Komunikacija (2): poslovni-mejl, ponuda-klijentu

HR (6): oglas-za-posao, odgovor-kandidatu, preporuka,
        resenje-godisnji-odmor, pravilnik-o-radu, obavestenje-o-promeni-uslova

Marketing (3): opis-proizvoda, bio-o-nama, zapisnik-sastanak

Kalkulatori (3): kalkulator-zarade, kalkulator-pausala,
                 kalkulator-ugovora-o-delu

Faktura/Profaktura (1): faktura

Putni nalog (1): putni-nalog
