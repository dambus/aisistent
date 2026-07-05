# AIsistent — Backlog

*Ažurirano: jun 2026.*

## ✅ Završeno

### Infrastruktura
- Domen aisistent.rs — Vercel, DNS, SSL ✅
- Email noreply@aisistent.rs — Resend ✅
- Supabase produkcija — baza, RLS, migracije ✅
- Vercel deployment — production branch master ✅

### Dokumenti i generisanje
- 17 tipova AI dokumenata ✅
- Faktura / Profaktura (bez AI, direktno renderovanje) ✅
- Faktura — međunarodno plaćanje: SWIFT/IBAN/valuta u wizardu, PDF i DOCX ✅
- Putni nalog — wizard, PDF renderer, DOCX, preview, email ✅
- PDF i DOCX export za sve tipove ✅
- Email slanje dokumenata (Resend) ✅
- Blur preview za free korisnike ✅
- Brendiranje firme — logo u PDF/DOCX (Pro/Agency) ✅

### UI / UX
- Wizard sa helper tekstovima i tooltipovima ✅
- Arhiva sa search i filterima ✅
- Profil — firme, avatar inicijali, plan badge ✅
- Admin panel — pregled, korisnici, dokumenti (/admin) ✅
- Onboarding flow — 3 koraka (dobrodošlica, firma, prvi dokument) ✅
- Reset onboarding dugme u podešavanjima ✅
- Podešavanja — lozinka, odjava, brisanje naloga ✅
- shadcn/ui Faza 1 — ScrollArea, Select ✅
- shadcn/ui Faza 2 — Switch, Tooltip, AlertDialog, Dialog ✅
- shadcn/ui Faza 3 — Sheet za mobilni sidebar ✅
- Mobilna responsivnost — wizard, sidebar, faktura stavke ✅
- Tooltip fix — click-only za mobilne uređaje ✅

### Kvalitet
- Proof-reading i zakonski audit svih 17 tipova ✅
- companyFieldMap za sve tipove ✅
- Dokumentacija — ARCHITECTURE, CONVENTIONS, PROMPT_GUIDE, decisions/ ✅

---

## 🔴 Visok prioritet

- **Prezentovati nove funkcionalnosti korisnicima** — Sačuvani kontakti su u produkciji ali korisnici nisu obavešteni.
  Opcije: TipCard u `/profil` uz ContactsTab, onboarding banner u wizardu, ili email/notifikacija.
  Minimalno: TipCard "Novo — Sačuvajte kupce i partnere" u profilu + TipCard u wizardu za podržane tipove.

## 🔴 Visok prioritet — blokirano

- **Payment gateway (Paddle)** — čeka APR registraciju preduzetnika
  Kontakt: paddle.com, seller account za Srbiju
  Blokira: naplatu pretplate
- **Politika privatnosti i Uslovi korišćenja** — obavezno po ZZPL/GDPR.
  Uraditi čim bude otvorena firma u APR.
  Potrebno: sedište firme, podaci rukovaoca, Paddle status, tracking alati.
  Blokira: Paddle aktivaciju i pravnu usklađenost platforme.

---

## 🟡 Srednji prioritet

- **DOCX formatiranje — audit i fix** — Prijavljeno 26. jun 2026. na primeru NDA:
  - Nedostaje "POVERLJIVO" watermark/oznaka u zaglavlju (kao u PDF-u)
  - Viseći naslovi — `Član X.` ostaje na dnu strane bez sadržaja koji sledi
  - Sekcija potpisa izgleda čudno — tabela/raspored nije konzistentan sa PDF-om
  - Uraditi audit svih tipova dokumenta u DOCX formatu, ne samo NDA

- **APR API / PIB lookup** — ~~Istražiti~~ Blokirano: zahteva ugovor sa APR,
  dostupno samo pravnim licima. Implementirati tek nakon otvaranja firme.

---

## 🔵 Nizak prioritet / Buduće ideje

### Novi tipovi dokumenata
- Otpremnica — komercijalni dokument za isporuku robe ✅
- ~~Porudžbenica~~ — odbačeno, zastareo B2B enterprise dokument van scope-a
- ~~Trebovanje~~ — odbačeno, interni dokument za velike sisteme van scope-a
- Ponuda za radove — dinamička tabela (majstori, izvođači) ✅
- Obaveštenje o promeni uslova rada — čl. 172-174 ZOR ✅

### Napredne funkcionalnosti

#### Agency plan — Faza 2
- "Pošalji klijentu" flow ✅
- SEF integracija — ~~slanje fakture na Sistem elektronskih faktura~~
  Blokirano: zahteva registraciju pravnog lica + dozvolu MF kao informacioni posrednik
- **Verzionisanje dokumenata** ✅ — version + root_document_id, "Nova verzija" dugme, ?from= pre-populacija
- **"Poboljšaj dokument"** ✅ — AI chat za izmene, ImprovePanel Sheet, rate limit po planu, /api/improve
- **/arhiva/[id]** ✅ — dedicated stranica za svaki dokument sa svim akcijama, floating save banner
- **Proširenje profila firme** ✅ — delatnost, ziro_racun, pdv_obveznik, website; companyFieldMap za 7 tipova
- **Redesign CompaniesTab** ✅ — Sheet forma, avatar kartice, ikonska dugmad, AlertDialog, pretraga
- **Timski nalozi** — Blokiran: čeka Paddle aktivaciju. Arhitektura: workspace model, invite, role (owner/member)

#### UI — Dedicated stranica za upravljanje klijentima (Agency)
Za Agency plan: dedicated `/klijenti` stranica umesto taba u dashboardu.
- Klijenti → Dokumenti po klijentu (dedicated view)
- Skalabilno za timske naloge
- Uraditi tek kada se implementiraju timski nalozi

#### Automatsko popunjavanje formulara — Smart Autofill

**Kontekst:** `companyFieldMap` već popunjava *tvoju* firmu u wizard polju. Praznina je **druga strana** — kupac, naručilac, zakupac, izvođač — koji se kuca iznova svaki put. Ovo je najrepetitivniji bol, posebno za korisnike koji imaju isti krug od 5-10 klijenata.

**Šta korisnici ponavljaju (prema tipovima dokumenata):**

| Scenario | Ponavljanje |
|----------|-------------|
| Faktura istom kupcu svaki mesec | naziv, PIB, adresa kupca, iste stavke/usluge |
| Ponuda klijentu — isti klijent, nova ponuda | naziv, PIB, adresa primaoca |
| Ugovor o delu — isti izvođači | ime, JMBG, adresa, žiro račun izvođača |
| Ugovor o zakupu — isti zakupci | ime/naziv, JMBG/PIB, adresa zakupca |
| Putni nalog — isti zaposleni | ime, pozicija, destinacija |
| Oglas za posao — isti grad, ista delatnost | (već popunjava iz firme) |

**Tri nezavisna pod-featura:**

**1. Sačuvani kontakti/primaoci (druga strana)** — Starter+
Ekvivalent `companies` tabele ali za drugu stranu. Korisnik jednom sačuva kupca/klijenta, sledeći put klikne "Popuni iz kontakata".
- Nova tabela `contacts` (naziv, PIB/JMBG, adresa, email, telefon, tip: firma/fizičko lice)
- Nova `contactFieldMap` analogna `companyFieldMap` — mapira `contact.*` → wizard polja za drugu stranu
- UI: CompanySelectModal dobija drugi modal/tab "Odaberi primaoca"
- Dokumenti gde se primenjuje: faktura (kupac), ugovor-o-delu (izvođač), nda (strana 2), ugovor-o-zakupu (zakupac), ugovor-o-saradnji (strana 2), ponuda-klijentu (primalac), ugovor-o-saradnji-zajmu (zajmoprimac)

**2. Katalog usluga/artikala** — Pro+
Za fakture, ponude i otpremnice — najrepetitivnija stavka su iste usluge/artikli sa istim cenama.
- Nova tabela `catalog_items` (naziv, opis, cena, PDV, jedinica mere)
- Dropdown "Dodaj iz kataloga" umesto ručnog unosa stavke
- Primenjuje se na: faktura, ponuda-klijentu, ponuda-za-radove, otpremnica
- Bonus: automatski predlaže poslednje korišćene stavke za datog klijenta

**3. Sačuvani zaposleni** — Pro+
Za HR dokumente korisnik ponovo kuca ime, JMBG, poziciju, datum zaposlenja.
- Nova tabela `employees` (ime, JMBG, pozicija, datum_zaposlenja, email, plata_osnova)
- Primenjuje se na: ugovor-o-radu, resenje-godisnji-odmor, odgovor-kandidatu, putni-nalog (putnik)
- Napomena: osetljivi podaci (JMBG, plata) — zahteva pažnju oko RLS i prikaza

**Prioritet implementacije:**
1. Sačuvani kontakti (najveći ROI, najmanja kompleksnost, direktno replicira companies pattern)
2. Katalog usluga (blokira Power User retenciju — faktura/mesec je top use-case)
3. Sačuvani zaposleni (manje urgentno, ali HR korisnici imaju visoku retenciju)

**Tehničke napomene:**
- Contacts pattern je identičan Companies — isti CRUD, isti Sheet UI, iste kartice
- `contactFieldMap` treba pokriti sve tipove gde postoji "druga strana" (vid. tabelu iznad)
- Plan limite treba definisati: Starter (1-3 kontakta?), Pro (10+), Agency (∞)
- APR PIB lookup (kada se odblokira) — koristiti i za brzo punjenje contact kartice

#### Upload & Fill — automatsko popunjavanje tuđih obrazaca

**Ideja:** Korisnik uploaduje obrazac (PDF ili DOCX), aplikacija prepozna polja, auto-popuni iz profila firme, korisnik dopuni ostatak, skida popunjen dokument.

**Status (5. jul 2026.): Faza 4 biblioteka obrazaca NA PRODUKCIJI.** Javna `/obrasci` biblioteka sa 3 APR obrasca (izvod, prijava promene, rezervacija naziva), download popunjeno (Starter+) / prazno (javno), editabilan PDF bez flatten. Kuratorski CLI + harvester (APR: 51 AcroForm kandidat, sha256 change detection). Upload & Fill uklonjen iz UI, pipeline = kuratorski alat. Spec: `docs/obrasci/FAZA4_BIBLIOTEKA_OBRAZACA.md`.

**Sledeće za biblioteku:** kuracija ~30 APR kandidata (batch propose + Claude draft opisa), novi izvori (APR preduzetnici, Poreska, RFZO, PIO), n8n cron za harvester, "obrazac je zastareo?" feedback dugme (Korak 5), flat→AcroForm konverzija pri kuraciji (otključava flat obrasce).

Istorija Faza 1–4: `PROGRESS.md`; specifikacije: `docs/obrasci/FAZA1_*`, `FAZA2_*`, `FAZA3_*`, `FAZA4_*`.

**Odabran tehnički put:** Azure Document Intelligence (`prebuilt-layout`) + geometrijsko matching (labela ↔ polje po koordinatama) + Claude semantičko mapiranje (labela → profil ključ). Baza poznatih obrazaca (ručno mapiranje po obrascu) i Vision AI (screenshot + Claude Vision) razmatrani i odbačeni u ranoj fazi — DI daje strukturisan output bez potrebe za render-to-image korakom.

**Šta radi:**
- AcroForm i flat PDF → Azure DI + geometrijsko matching + Claude semantičko mapiranje → GuideView (zeleno/narandžasto/sivo) ✅
- DOCX sa placeholderima → stari Claude wizard (nezavisan flow, `WizardView.tsx`) ✅
- Preview PDF u iframe pre downloada, telefon/email transliteracija fixevi ✅
- Detekcija sekcija obrasca (naslov dela forme) + `SectionWizardView` — sekcijski wizard za ručno dopunjavanje svih polja na jednom mestu, sa "Popuni sve →" iz GuideView ✅
- `form_templates` keš povezan u `di-analyze` — cache hit preskače DI+Claude (113ms vs 40s), vrednosti uvek sveže iz trenutnog profila; template feedback (👍/👎 u preview) ✅
- Cross-row duplikat dedup — ista labela u različitim redovima se upisuje samo jednom (najširi box), fix za OPD-o duplikat-upis bug ✅

**Čeka verifikaciju na produkciji** (Supabase tehnički problemi 3. jula): dupli upload istog obrasca → drugi brži, `hit_count` raste, feedback tok.

**Poznati bagovi/gapovi (zabeleženo u backlog, niži prioritet):**
- "Caption bez podvlake/tabele" layout (PIB/adresa ispod praznog prostora bez teksta) je pipeline-u nevidljiv — potvrđeno na 4 realna obrasca
- 5B slobodne linije (underscore-tekst detekcija postoji, `fillFreeLines` overlay ne postoji još)
- Adresa split (ulica+broj iz jednog profil polja)

**Redosled implementacije:**
1. Sačuvani kontakti (druga strana) ← ✅ urađeno
2. Katalog usluga ← uraditi
3. **Upload & Fill** — AcroForm PDF + DOCX, Pro/Agency plan ← ✅ u produkciji, Faza 3 u toku

#### [ISTRAŽIVANJE] Kontekstualni asistent — chatbot za srpsko preduzetništvo

**Ideja:** AI asistent koji odgovara na pitanja o preduzetništvu i poslovanju, integrisan sa korisničkim profilom — zna firmu, plan i istoriju dokumenata, i može da predloži ili pokrene generisanje dokumenta.

**Tri moguće verzije (po vrednosti):**

| Verzija | Opis | Diferencijacija | Preporuka |
|---------|------|----------------|-----------|
| Generički bot | System prompt + Claude | Nula — ChatGPT to već radi | Ne raditi |
| RAG sa zakonima | Korpus ZOR, PDV, paušal... citira članove | Jaka, ali skupo za održavanje | Dugoročno |
| **Kontekstualni (integrisani)** | Zna profil firme + istoriju dokumenata + može da triggeruje generisanje | **Jedinstven — ChatGPT ne može** | **MVP** |

**Kontekstualni MVP workflow:**
```
Korisnik: "Kako da zaposlim prvog radnika?"
Bot: zna firmu korisnika, plan, dokumente →
     "Za zapošljavanje trebaš Ugovor o radu i M-A obrazac.
      Vidim da imaš firmu 'ABC d.o.o.' — generišemo Ugovor o radu sada?"
```

**Tehničke napomene:**
- System prompt: srpsko poslovno znanje + disclaimer + kontekst iz baze (profil firme, plan, poslednji dokumenti)
- Cena: ~$0.008-0.04 po razgovoru. 1000 korisnika × 5 pitanja/mesec ≈ $40/mes — nije faktor
- Rate limiting: Free (5 pitanja/dan), Starter+ (neograničeno)
- Intencija → shortcut ka generisanju dokumenta je ključni differentiator

**Najveći rizik — pravna odgovornost:**
Srpski zakoni (paušal, PDV pragovi, doprinosi) se menjaju redovno. Claude knowledge cutoff može biti zastareo. Pogrešan odgovor o porezu može naneti štetu korisniku.
Obavezno: jak disclaimer + pozicioniranje kao "informativno, ne pravni/poreski savet" + preporuka da se konsultuje računovođa/pravnik.

**Preduslov:** Nije tehnički blokiran ničim. Može se raditi nezavisno, ali vrednost raste sa bogatijim profilom (kontakti, katalog, zaposleni).

#### API
- Javni API za generisanje dokumenata (dugoročno)

#### [ZA RAZMATRANJE] Granularniji profil firme — adresa/telefon sub-komponente

**Kontekst (5. jul 2026., posle kuracije ~10 APR obrazaca):** dosta državnih obrazaca traži adresu i telefon razdvojene na sub-komponente (ulica, kućni broj, opština, mesto, poštanski broj / pozivni broj + broj telefona), dok `companies` tabela danas ima samo `adresa` (slobodan tekst) i `telefon` (slobodan tekst). `semanticMapper.ts` ima eksplicitna pravila (5, 6, 8) koja sub-komponente uvek mapiraju na `profileKey: null` — nikad ne pogađa deo teksta — pa se ta polja u biblioteci obrazaca trenutno NE popunjavaju automatski.

**Vrednost:** ako je split-layout čest kroz izvore (APR, verovatno i Poreska/RFZO/PIO), granularniji model direktno povećava % automatski popunjenih polja po obrascu — to je suština vrednosti biblioteke. Pre bilo kakve promene šeme, izbrojati koliko `null` mapiranja u već kuriranim obrascima su baš adresa/telefon sub-komponente (ako je mali %, verovatno ne vredi truda).

**Šta razbijanje profila povlači sa sobom (ako se radi puna šema):**
1. Migracija postojećih `companies` redova — `adresa` je slobodan tekst, rastavljanje zahteva ili da korisnici popune ponovo, ili parsiranje postojećeg teksta (nepouzdano — srpske adrese nisu strogo standardizovane, sprat/stan opciono).
2. Prompt moduli (`lib/prompts/*`) i 21 tip dokumenta danas ubacuju "u [adresa], [grad]" prirodno u prozu — treba computed "puna adresa" getter da proza i dalje zvuči normalno (duplirana logika: strukturirano za PDF popunjavanje, string za AI prozu).
3. Nove `PROFILE_KEYS` u `semanticMapper.ts` + izmena/brisanje pravila 5/6/8 + re-kuracija VEĆ objavljenih obrazaca u biblioteci (mogli bi sad popuniti polja koja su ranije bila `null`).
4. Onboarding/profil UI trenje — više polja na formi pri registraciji, za vrednost koja se ostvaruje tek kasnije.
5. Opština vs grad/mesto nisu pravno isto u Srbiji (opština je upravna jedinica) — ako se radi kako treba, nije trivijalno mapiranje 1:1 sa trenutnim grubim "grad" poljem.

**Predloženi srednji put (umesto pune šeme):** zadržati JEDNO kanonsko polje (`adresa`, `telefon`) kao izvor istine na profilu (nema dodatnog onboarding trenja), i parsirati deterministički (regex, ne LLM nagađanje) pri popunjavanju obrasca kad forma traži baš tu sub-komponentu. Ovo je drugačiji rizik od pravila "nikad ne nagađaj" iz `semanticMapper.ts` (to pravilo je o LLM-u koji pogađa NAMERU labele; ovde je parsiranje VEĆ POZNATOG korisničkog podatka, deterministički i testabilno).

**Status:** samo diskusija, ništa implementirano. Vratiti se kad se nakupi dovoljno kuriranih obrazaca da se proceni koliko je split-layout zaista čest.
