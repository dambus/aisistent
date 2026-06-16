## jun 2026. — Putni nalog

- Novi tip dokumenta: Putni nalog (bez AI, direktno renderovanje)
- Wizard: 4 koraka (putovanje, vozač, vozilo, firma + troškovi)
- PDF: header, tabela kretanja, troškovi badge-ovi, 3-kolone potpisi
- DOCX: tabela kretanja, potpisi
- Preview, email prilog, companyFieldMap
- Zakonska osnova: Pravilnik o putnim nalozima (Sl. glasnik RS, 90/2016)
- Dnevnica: neoporezivi iznos 3.316 RSD/dan, inostranstvo 90 EUR/dan
- Fix: Roboto font umesto Helvetica (srpski dijakritici)
- Fix: ispraviti hardkodovane srpske stringove u rendereru

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
