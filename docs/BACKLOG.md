# AIsistent — Feature Backlog

## Redosled implementacije

### 🔴 Bugovi (rešiti odmah pri sledećoj sesiji):
- **Ugovor o zajmu — pogrešan reminder** — `data/reminders.ts` prikazuje reminder za
  `ugovor-o-saradnji` i na zajmu. Dodati poseban ključ `ugovor-o-zajmu` sa relevantnim
  sadržajem (napomena o overi za iznose >50.000 RSD, poreskom tretmanu kamate itd.)
- **Ugovor o zajmu — pogrešan PDF naziv** — `app/api/generate/route.ts` title za zajam
  generiše "Ugovor o saradnji - ..." umesto "Ugovor o zajmu - ...". Proveriti case logiku.
- **Jezičke greške u zajam promptu** — u `lib/prompts/ugovor-o-saradnji-zajmu.ts`:
  - "BEZKAMATNI" → "BESKAMATNI"
  - "ZAJMOPRIMCA" → "ZAJMOPRIMAOCA" (proveriti u celom prompt tekstu)
  - Iznos slovima: "milionduvestohiljada" — proveriti i ispraviti logiku pisanja iznosa slovima

### 🟡 Visok prioritet (sledeće):
- **Arhiva — filter po tipu ne radi** — `TYPE_CATEGORY` mapa u `ArchiveList.tsx` ne pokriva
  sve tipove (HR tipovi, marketing, kalkulatori nisu uključeni). Dopuniti mapu i filteri.
- **Arhiva — debounce search** — dodati search input sa debounce (300ms) za pretragu
  po nazivu dokumenta
- **Sistemski audit companyFieldMap** — proći kroz svih 17 tipova i osigurati da modal
  za izbor firme uvek nudi auto-popunjavanje tamo gde ima smisla. Posebno:
  - Ugovor o zajmu: zajmodavac=Firma → popuni iz izabrane firme;
    zajmodavac=Osnivač → predloži ime zastupnika firme
  - Proveriti sve ostale tipove po checklistu iz DEVELOPER_GUIDE
- **Ugovor o zajmu — showIf logika za kamatu** — ako je odabrano "bez kamate",
  sakriti polja za zateznu kamatu ili objasniti razliku kroz helper tekst
- **Fakture i profakture** — DEBLOKIRATI (nije vezano za payment gateway).
  Faktura je samo dokument sa podacima, ne vrši se naplata kroz aplikaciju.
  Može ići u razvoj odmah po završetku bug fixova.

### 🟢 Srednji prioritet:
- **Proof-reading svih promptova** — za svaki od 17 tipova pokrenuti dedicated Claude
  sesiju koja prolazi kroz generisani dokument kao pravnik + lektor. Početi sa:
  1. Ugovor o radu
  2. Ugovor o delu
  3. NDA
  Pribaviti ili pronaći online primere standardnih srpskih ugovora za poređenje.
- **APR API integracija (PIB lookup)** — korisnik unese PIB, aplikacija automatski
  popuni naziv firme, adresu, zastupnika. Veliki UX win za B2B korisnike.
  Proveriti dostupnost APR API-ja i uslove korišćenja.
- **Kalkulator paušalnog poreza** — kada budemo imali tačnu formulu
- **Admin panel (osnovna verzija)** — zaštićena `/admin` ruta za korisnika sa
  admin flagom u profiles tabeli. Sadržaj:
  - Pregled broja korisnika, dokumenata, planova
  - "Audit" akcija koja pokreće Claude proveru svih promptova i vraća log grešaka
  - Periodicna automatizovana provera kvaliteta generisanih dokumenata

### 🔵 Nizak prioritet / Buduće ideje:
- **Ponuda za radove** — novi tip dokumenta sa dinamičkom tabelom stavki
  (vodoinstalateri, majstori, izvođači). Korisnik dodaje stavke + cene,
  aplikacija sabira, dodaje PDV, formatira u profesionalnu ponudu.
  Zahteva novi UI pattern (dinamička tabela u wizardu).
- **Dokumentacija o naplati preko administrativne zabrane** — standardizovan
  dokument, korisno za preduzetnike, dodati u tipove
- **Putni nalog** — obavezan dokument za korišćenje službenih vozila
- **Otpremnica** — komercijalni dokument za isporuku robe
- **Porudžbenica** — narudžbina robe ili usluga
- **Trebovanje** — interni zahtev za materijal
- **Blur preview za free korisnike** — implementiran, testirati i po potrebi dotjerati
- **SEF integracija** — slanje podataka fakture na Sistem elektronskih faktura
- **Regionalno širenje** — HR, BiH, MK (posebni prompt setovi)
- **API za partnere**
- **Affiliate program**
- **Verzionisanje dokumenata**
- **Timski nalozi** (Business plan)

## Odbačeno / Na čekanju
- Stripe direktno — Srbija nije podržana, koristimo Paddle
- Fiskalizacija — odložena, fokus na B2B bez kase
- ~~Fakture čekaju payment gateway~~ — REVIDIRANO: fakture su samo dokumenti,
  mogu se razviti odmah. Payment gateway je potreban samo ako se bude naplaćivalo
  kroz aplikaciju što nije u planu.
- Email from adresa: trenutno `onboarding@resend.dev` (sandbox). Kada aisistent.rs
  domen bude aktivan, verifikovati u Resend panelu i promeniti na
  `noreply@aisistent.rs` u `app/api/send-document/route.ts`

## Napomene
- Payment gateway čeka fizičku posetu APR i registraciju preduzetničke radnje
- Email slanje ide POSLE brendiranja firme jer mejl sa brendiranim dokumentom
  ima više vrednosti
- Blur preview — implementiran jun 2026, testiranje u toku
- Brisanje dokumenata iz arhive — implementirano jun 2026
- Kompaktni akcioni red u arhivi (dropdown) — implementirano jun 2026

---
*Ažurirano: jun 2026.*
