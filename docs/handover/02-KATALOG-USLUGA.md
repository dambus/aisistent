# Katalog usluga/artikala — implementaciono uputstvo

*Smart Autofill pod-feature 2 (BACKLOG). Pro+ plan. Najveći preostali autofill ROI: korisnici koji fakturišu mesečno kucaju iste stavke iznova.*

## Cilj

Korisnik jednom sačuva uslugu/artikal (naziv, cena, PDV, jedinica mere), pa u fakturi/ponudi/otpremnici bira iz dropdown-a umesto da kuca.

## Obavezno pročitati pre početka

- `docs/CONVENTIONS.md` (celo)
- `supabase/migrations/20260611000001_add_contacts.sql` — contacts je ŠABLON za ovaj feature, isti pattern
- `app/api/contacts/route.ts` + `app/api/contacts/[id]/route.ts` — CRUD šablon
- `components/dashboard/ContactsTab.tsx` — UI šablon (Sheet forma, kartice, AlertDialog brisanje)
- `components/wizard/FakturaStavkeField.tsx` — mesto integracije u wizard

## Koraci

### 1. Migracija

Nova migracija `supabase/migrations/<datum>_add_catalog_items.sql` po uzoru na contacts:
```sql
create table catalog_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  naziv text not null,
  opis text,
  jedinica text not null default 'kom',
  cena_bez_pdv numeric(12,2) not null default 0,
  pdv_stopa numeric(5,2) not null default 20,
  created_at timestamptz not null default now()
);
-- RLS: owner-only policies, prepisati pattern iz add_contacts migracije (SELECT/INSERT/UPDATE/DELETE za auth.uid() = user_id)
```
Ažurirati `types/database.ts` (Database tip + convenience interfejs `CatalogItem`).

### 2. API rute

`app/api/catalog/route.ts` (GET lista + POST kreiranje) i `app/api/catalog/[id]/route.ts` (PUT/DELETE) — kopirati strukturu contacts ruta 1:1, uključujući:
- Zod validaciju (naziv obavezan, cena >= 0, pdv_stopa jedna od 0/10/20)
- Plan gating: katalog je **Pro+** (`['pro','agency']`) — proveriti da li je do tada urađena centralizacija plan-gatinga (`lib/plans.ts`, vidi 01-TECH-DEBT.md stavka 1); ako jeste koristiti nju
- Limit broja stavki po planu: predlog pro=50, agency=neograničeno (potvrditi sa Milanom)
- Poruke o greškama na srpskom

### 3. Dashboard UI

`components/dashboard/CatalogTab.tsx` po uzoru na `ContactsTab.tsx`:
- Kartice sa naziv/cena/PDV/jedinica
- Sheet forma za dodavanje/izmenu
- AlertDialog za brisanje
- Pretraga po nazivu
Dodati tab u `app/(dashboard)/profil/page.tsx` (gde su CompaniesTab/ContactsTab), gated na Pro+ — free/starter vide tab sa upgrade porukom (pattern postoji u ContactsTab za limit).

### 4. Wizard integracija — ključni deo

U `components/wizard/FakturaStavkeField.tsx`:
- Prop `catalogItems: CatalogItem[]` (prosleđen iz WizardForm → WizardPageClient → server page koji fetch-uje katalog uz companies/contacts)
- Pored "Dodaj stavku" dugmeta dodati "Iz kataloga" dropdown/modal (Select iz shadcn, već u projektu) — izbor stavke popunjava `{ naziv, jedinica, cena_bez_pdv }` u novu stavku
- PDV stopa: FakturaStavkeField dobija `pdvStopa` kao prop na nivou CELE fakture — ako se stavka iz kataloga razlikuje, upozoriti korisnika (ili za MVP: ignorisati katalošku stopu, koristi se fakturina; zabeležiti odluku)

Isti pattern primeniti na wizard-e: `ponuda-klijentu`, `ponuda-za-radove`, `otpremnica` — proveriti kako svaki čuva stavke (ponuda-za-radove ima svoju dinamičku tabelu; otpremnica takođe). Svaki ima svoj format stavke — mapirati kataloški item na format tog dokumenta, NE menjati formate dokumenata.

### 5. Bonus (odvojen zadatak, ne raditi u prvom prolazu)

"Poslednje korišćene stavke za ovog klijenta" — zahteva vezu dokument↔kontakt↔stavke; kompleksno, preskočiti dok katalog ne zaživi.

## Kriterijumi gotovosti

1. `npx tsc --noEmit` čisto
2. Pro korisnik: kreira stavku u profilu → otvori fakturu → "Iz kataloga" → stavka upisana sa cenom → PDF ispravan
3. Free/starter korisnik: ne vidi katalog u wizardu, u profilu vidi upgrade poruku
4. RLS test: korisnik A ne vidi stavke korisnika B (probati direktan GET /api/catalog sa drugim nalogom)
5. Ažurirati `docs/BACKLOG.md` (označiti urađeno), `PROGRESS.md` (sesija log), `docs/CHANGELOG.md`

## Zamke

- Ne zaboraviti `types/database.ts` — bez toga sve tipovanje pada
- Sheet/AlertDialog/Select su već u `components/ui/` — NE instalirati ponovo
- Novčani iznosi: `toLocaleString('sr-RS', ...)` pattern iz FakturaStavkeField, ne Intl direktno
- Migraciju testirati lokalno pre produkcije (`supabase db push` na lokalni, pa produkcija)
