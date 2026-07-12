# CLAUDE.md — AIsistent

Web platforma za generisanje poslovnih dokumenata za srpsko tržište.

- **URL:** https://aisistent.rs
- **GitHub:** https://github.com/dambus/aisistent
- **Stack:** Next.js 16, Supabase, Claude API, Vercel

## Stanje projekta — pročitaj OVO PRVO na početku svake sesije

**`.ai-memory/STATE.md`** je jedini obavezan read na startu. To je sažet, prepisiv (overwrite, ne append) snapshot: šta je u toku, šta je gotovo i verifikovano, sledeći korak, poznati blokeri — sa pointerima (`fajl:linija`) na ostale dokumente za detalje.

Ne čitati unapred `PROGRESS.md`, `docs/BACKLOG.md`, `docs/handover/*` ili `.ai-memory/project_*.md` u celosti — to su arhiva/reference na koje `STATE.md` pokazuje. Otvoriti ih SAMO kad `STATE.md` eksplicitno uputi na njih ili kad je detalj stvarno potreban.

claude-mem opservacije (auto-injektovane na startu) su search-alat za "šta se tačno desilo i kada" — nisu izvor trenutnog stanja. Za trenutno stanje uvek veruj `STATE.md`, ne sirovim opservacijama.

**Na kraju svake sesije** (pre zatvaranja, ne posle): prepisati `.ai-memory/STATE.md` po checklisti na dnu tog fajla, i commit+push — sledeća sesija (druga mašina) čita ga pre bilo čega drugog.

Kada upisuješ trajniju memoriju (preference, feedback obrasce — ne project state), pisati u **oba** mesta: lokalni `~/.claude/projects/.../memory/` i `.ai-memory/` u repou.

## Dokumentacija — čitaj pre pisanja koda

Puna mapa (šta gde ide, kad se čita/piše, anti-drift pravila): `docs/DOCUMENTATION_MAP.md`

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
| `docs/CLAUDE_PLUGINS_SETUP.md` | Prenos Claude Code plugina/marketplace-a na novu mašinu |

## Brzi pregled stack-a

- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Baza:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Anthropic Claude API (claude-sonnet-4-5)
- **PDF:** @react-pdf/renderer | **DOCX:** docx npm paket
- **Email:** Resend | **Deployment:** Vercel
- **Plaćanje:** Paddle (čeka APR registraciju)

## 22 tipa dokumenta

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

Komercijalni dokumenti (2): otpremnica, ponuda-za-radove
