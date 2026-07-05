# Sačuvani zaposleni — implementaciono uputstvo

*Smart Autofill pod-feature 3 (BACKLOG). Pro+ plan. HR dokumenti: korisnik iznova kuca ime, JMBG, poziciju, datum zaposlenja.*

## Cilj

Tabela `employees` + autofill u HR wizarde: `ugovor-o-radu`, `resenje-godisnji-odmor`, `odgovor-kandidatu`, `putni-nalog` (putnik).

## ⚠️ Posebnost: osetljivi podaci

JMBG i plata su osetljivi lični podaci (ZZPL/GDPR kategorija). Pravila:
- RLS owner-only — kao contacts, ali DUPLO proveriti policies pre produkcije
- JMBG se NE prikazuje u listi zaposlenih (samo u formi za izmenu, maskiran `*********1234` u pregledu)
- Plata: čuvati samo `plata_osnova` ako je korisnik unese — polje OPCIONO, nikad obavezno
- Brisanje naloga (`app/api/profile/delete/route.ts`) mora kaskadno brisati zaposlene — `on delete cascade` na FK pokriva, ali proveriti da ruta ne radi ručno brisanje po tabelama gde bi employees falio
- U `docs/BACKLOG.md` piše "zahteva pažnju oko RLS i prikaza" — ovo je ta pažnja

## Obavezno pročitati pre početka

Isto kao 02-KATALOG-USLUGA.md (contacts pattern) + dodatno:
- `lib/utils/contactFieldMap.ts` — šablon za novi `employeeFieldMap.ts`
- `components/wizard/ContactSelectModal.tsx` — šablon za `EmployeeSelectModal`
- `lib/prompts/ugovor-o-radu.ts` — wizard step/field id-jevi za zaposlenog (da mapiranje bude tačno)

## Koraci

1. **Migracija** `add_employees.sql`: `id, user_id FK cascade, ime text not null, jmbg text, pozicija text, datum_zaposlenja date, email text, plata_osnova numeric(12,2), created_at` + RLS owner-only. Ažurirati `types/database.ts`.
2. **API**: `app/api/employees/route.ts` + `[id]/route.ts` — contacts pattern. Zod: JMBG ako je unet mora biti tačno 13 cifara (`/^\d{13}$/`), email format. Plan gating Pro+.
3. **`lib/utils/employeeFieldMap.ts`** — po uzoru na `contactFieldMap.ts`, mapiranje po tipu dokumenta:
   - `ugovor-o-radu`: ime→ime_zaposlenog, jmbg→jmbg polja itd. — TAČNE field id-jeve naći u `lib/prompts/ugovor-o-radu.ts` wizardSteps, ne pogađati
   - `resenje-godisnji-odmor`, `odgovor-kandidatu`, `putni-nalog`: isto, po polje
4. **UI**: `EmployeesTab` u profilu (kartice bez JMBG-a) + `EmployeeSelectModal` u wizardu za 4 HR tipa. WizardForm već ima pattern za Company/Contact modale — treći modal isti način.
5. **Server page** `app/(dashboard)/dokumenti/[type]/page.tsx`: fetch employees uz companies/contacts SAMO za HR tipove (ne slati podatke gde ne trebaju).

## Kriterijumi gotovosti

1. tsc čisto; 4 HR tipa autofill radi (ručno kroz wizard proveriti svaki)
2. JMBG maskiran u listi; RLS cross-user test; brisanje naloga briše zaposlene
3. Free/starter ne vide feature; BACKLOG/PROGRESS/CHANGELOG ažurirani

## Zamke

- `putni-nalog` je non-AI dokument (direktno renderovanje) — autofill ide u wizard polja isto, ali proveriti format datuma koji renderer očekuje
- Ne mešati `zastupnik` (iz companies — ko potpisuje) sa zaposlenim (o kome je dokument)
- Datum: wizard polja drže string — konzistentno sa postojećim date poljima (pogledati kako ugovor-o-radu čuva datume)
