# SUBSCRIPTION_LOGIC.md — Logika pretplata i tier-ova

## Tier-ovi i limiti

| Feature | Free | Starter | Pro | Agency |
|---|---|---|---|---|
| Generisanje | 3/mes | 20/mes | ∞ | ∞ |
| PDF izgled | AIsistent watermark, bez podataka firme | Logo + firma podaci + AIsistent footer | Logo + firma podaci, bez AIsistent traga | Isto kao Pro, per-klijent |
| Logo firme u PDF | ❌ | ✅ | ✅ | ✅ |
| DOCX export | ❌ | ✅ | ✅ | ✅ |
| Čuvanje u arhivi | ❌ | ✅ | ✅ | ✅ |
| Email slanje | ❌ | ✅ | ✅ | ✅ |
| Broj firmi | 0 | 1 | 1 | ∞ |
| Klijent modul | ❌ | ❌ | ❌ | ✅ |
| Prioritetna podrška | ❌ | ❌ | ✅ | ✅ |
| Memorandum (roadmap) | ❌ | ❌ | 🔜 | 🔜 |

## Free tier — ponašanje

- Korisnik može da generiše dokumente (limit: 3/mes) ali nikad ne dobija čist output
- PDF uvek ima AIsistent watermark
- Bez čuvanja u arhivi — dokument nestaje po zatvaranju
- Bez DOCX exporta
- Wizard pita podatke o firmi ali ih NE čuva (koriste se samo za to generisanje)
- Nema onboarding firme — 0 firmi u profilu

## PDF izgled po tier-u

- **Free:** watermark dijagonalno preko dokumenta, tekst "AIsistent — aisistent.rs", bez header/footer podataka firme
- **Starter:** header sa logom firme i nazivom, footer sa adresom i kontaktom + mali AIsistent footer ("Generisano uz pomoć AIsistent — aisistent.rs")
- **Pro:** header sa logom firme i nazivom, footer sa adresom i kontaktom, bez ikakvog AIsistent traga
- **Agency:** isto kao Pro, primenjuje se per-klijent firma
- **Memorandum (roadmap, ne implementirati sada):** Pro/Agency dobijaju themed dokument na firminom memorandumu sa bojama i fontovima firme

## Onboarding flow po tier-u

- **Free:** mini onboarding — 1 korak, bira delatnost, vidi šta može i šta ne može
- **Free → Starter:** welcome flow — "Evo šta se otključalo" + delatnost (ako nije izabrana) + firma setup
- **Free → Pro:** isto kao Starter + napomena o logo uploadu
- **Free → Agency:** Agency onboarding (postojeći, refaktorisan)
- **Starter → Pro:** kratki "Pro unlock" screen + napomena o logo uploadu
- **Bilo koji → Agency:** Agency onboarding
- Onboarding se pokreće pri prvom loginu nakon promene plana (`onboarded` flag se resetuje)

## Napomene za implementaciju

- NE dirati postojeći Agency onboarding flow na `/onboarding/agencija`
- NE dirati postojeće `PLAN_LIMITS`, `PLAN_INFO`, `PLAN_COLORS` mape — samo dodati novi onboarding sloj iznad
- Memorandum feature označiti kao `// TODO: memorandum` komentar u PDF renderer-ima, ne implementirati
- `onboarded` kolona u Supabase već postoji (migracija `20260616000002_add_onboarded.sql`)
