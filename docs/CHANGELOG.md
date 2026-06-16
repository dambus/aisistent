## jun 2026. — Admin panel poboljšanja

- Promena plana korisnika direktno iz /admin/korisnici (PlanSelector)
- Reset brojača dokumenata po korisniku (ResetDocsButton)
- API rute zaštićene is_admin proverom: /api/admin/set-plan, /api/admin/reset-docs

## jun 2026. — Onboarding flow

- 3-koračni modal za nove korisnike (dobrodošlica → firma → prvi dokument)
- Progress bar kroz korake
- Firma se čuva kao podrazumevana pri onboardingu
- Odabir prvog dokumenta vodi direktno u wizard
- Reset dugme u Podešavanjima → Bezbednost
- Supabase migracija: 20260616000002_add_onboarded.sql

## jun 2026. — Admin panel

- /admin ruta zaštićena middleware-om (is_admin u profiles tabeli)
- Pregled: stat kartice (korisnici, novi, dokumenti, danas, mesec)
- Korisnici: tabela sa emailom, planom, brojem dokumenata, datumom
- Dokumenti: top tipovi sa progress barom, lista poslednjih 100
- Sidebar: Admin link vidljiv samo admin korisnicima
- Supabase migracija: is_admin kolona + RLS politike
