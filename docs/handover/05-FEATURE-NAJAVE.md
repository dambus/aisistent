# Najava novih feature-a korisnicima — implementaciono uputstvo

**STATUS: ✅ IMPLEMENTIRANO** (potvrđeno 12. jul 2026.) — TipCard-ovi su live za kontakte, katalog usluga i sačuvane zaposlene (`ContactsTab.tsx`, `CatalogTab.tsx`, `EmployeesTab.tsx`, `WizardForm.tsx`, `ArchiveList.tsx`, `CompaniesTab.tsx`, dashboard). Uputstvo ispod ostaje kao referenca za pattern kod budućih feature-a.

*BACKLOG stavka zatvorena. Isti pattern koristiti za svaki budući feature (npr. biblioteka obrazaca).*

## Cilj (minimalna verzija iz BACKLOG-a)

1. TipCard "Novo — Sačuvajte kupce i partnere" u `/profil` uz ContactsTab
2. TipCard u wizardu za tipove koji podržavaju kontakte (faktura, nda, ugovor-o-delu, ugovor-o-zakupu, ugovor-o-saradnji-zajmu, ponuda-klijentu)

## Postojeća infrastruktura — koristiti, ne graditi novo

- `components/ui/TipCard.tsx` — postoji
- `hooks/useTip.ts` — postoji (dismissal logika)
- `components/dashboard/TipsSettingsCard.tsx` — postoji (podešavanje saveta)
- `.ai-memory/tasks_tips_system.md` — istorija tips sistema, pročitati

## Koraci

1. Pročitati `hooks/useTip.ts` da se vidi kako se tip registruje i pamti dismissal (localStorage ključ po tip id-u — proveriti tačan mehanizam)
2. Dodati tip za kontakte u profil (`app/(dashboard)/profil/page.tsx` ili unutar ContactsTab ako je tamo pattern) — tekst: kratko, srpski, bez anglicizama, sa akcijom "Dodaj prvi kontakt"
3. Wizard tip: u `WizardForm` ili `WizardPageClient`, prikazati samo za tipove iz `contactFieldMap` (postojaće lista podržanih tipova — importovati, ne hardkodovati duplikat)
4. Dismissal: jednom odbačeno = ne prikazuje se više (useTip pattern)

## Šire (posle minimalne verzije, poseban zadatak)

- "Šta je novo" sekcija/modal na dashboardu — jedan izvor: `data/whats-new.ts` lista {datum, naslov, opis, link}; badge na sidebar-u kad ima nepročitano. Jednostavno, bez baze — localStorage za "pročitano do datuma".
- Biblioteka obrazaca zaslužuje najavu na dashboardu — link ka `/obrasci` (javna stranica!) sa "Novo: preuzmite APR obrasce popunjene vašim podacima".
- Email najave (Resend postoji u projektu) — tek kad ima šta veliko; ne spamovati.

## Kriterijumi gotovosti

TipCard vidljiv na oba mesta, dismissal radi, ne prikazuje se korisnicima koji VEĆ imaju kontakte (proveriti `contacts.length > 0` → ne prikazuj), tsc čisto, tekstovi na srpskom u duhu `docs/UI_TEKSTOVI.md`.
