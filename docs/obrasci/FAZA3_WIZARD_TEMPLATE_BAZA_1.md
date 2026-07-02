# Faza 3 — Wizard za popunjavanje i template baza

## Status: Draft za review pre implementacije
## Vlasnik: Milan / AIsistent
## Datum: 2026-07-02
## Prethodni dokumenti: FAZA1_PREPOZNAVANJE_OBRAZACA.md, FAZA2_AUTOFILL_OVERLAY.md

---

## 1. Cilj faze

Omogućiti korisniku da završi **ceo obrazac unutar aplikacije** — ne samo auto-fill iz profila, nego i ručni unos preostalih polja kroz wizard, sa finalnim PDF-om kao outputom. Paralelno, uvesti template bazu koja kešira strukturu poznatih obrazaca i smanjuje Azure/Claude trošak za ponavljajuće dokumente.

---

## 2. Šta se menja u odnosu na Fazu 2

Faza 2 flow: Upload → DI analiza → GuideView (auto-fill preview) → download

Faza 3 flow: Upload → **template lookup** (novo) → DI analiza (ako nema keširanog templates) → GuideView → **"Popuni preostala polja" → WizardView** (novo) → preview → download

Sve Faza 2 komponente ostaju netaknute. Wizard je additivni korak posle postojećeg auto-fill preview-a.

---

## 3. Template baza

### 3.1 Svrha

Keširanjem strukture poznatih obrazaca (lista polja sa koordinatama, labelama, semantičkim ključevima i sekcijama) izbegavamo ponovljene Azure DI i Claude pozive za isti obrazac. Za 10+ obrazaca koji su već prošli pipeline, odmah se isplati.

### 3.2 Identifikacija obrasca (fingerprint)

Hash fajla ne radi — svaka kopija istog obrasca je tehnički drugačiji fajl (metadata, kompresija). Koristiti kombinovani fingerprint:

```
fingerprint = hash(
  page_count +
  first_page_ocr_content[0:500] +  // prvih 500 karaktera DI content-a prve strane
  total_acroform_field_count        // 0 za flat PDF
)
```

Ovo je otporno na metadata razlike ali osetljivo na stvarne izmene obrasca (nova verzija od strane države) — što je željeno ponašanje.

### 3.3 Supabase šema

```sql
create table form_templates (
  id uuid primary key default gen_random_uuid(),
  fingerprint text unique not null,
  name text,                    -- "PPDG-1S", auto-detektovan iz DI content-a ili korisnik potvrdi
  page_count int not null,
  source_type text not null,    -- 'acroform' | 'flat' | 'mixed'
  fields jsonb not null,        -- kompletna lista GuideField[] sa koordinatama, labelama, sekcijama
  sections jsonb,               -- detektovane sekcije (naziv, page, y_position)
  hit_count int default 0,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create index on form_templates(fingerprint);
```

`fields` jsonb čuva isti format koji pipeline već proizvodi (GuideField[]) — nema transformacije, direktno se koristi u wizard-u i overlay generatoru.

### 3.4 Lookup flow

```
Upload PDF
    │
    ▼
Izračunaj fingerprint (page count + prvi DI poziv samo za prvu stranu + AcroForm count)
    │
    ├─→ fingerprint postoji u form_templates?
    │       │
    │      DA → učitaj fields + sections iz baze, preskoči DI full analizu i Claude poziv
    │             Inkrementiraj hit_count, ažuriraj last_seen_at
    │
    │      NE → pokreni pun Faza 1+2 pipeline
    │             Sačuvaj rezultat u form_templates
    │
    ▼
Nastavi sa wizard flow-om
```

**Važno:** Fingerprint se računa delimičnim DI pozivom (samo prva strana, F0 kompatibilno) — ne punim S0 pozivom. Ovo znači da lookup košta ~$0.01 umesto $0.04 za višestranične dokumente.

### 3.5 Invalidacija

Kada korisnik završi wizard i preuzme dokument, opciono pitati: "Da li su sva polja ispravno prepoznata?" (thumbs up/down, nije obavezan odgovor). Negativan odgovor za poznati fingerprint:
- Loguje se u posebnu `template_feedback` tabelu
- Ako isti fingerprint dobije 3+ negativnih odgovora — automatski označi template kao `needs_review: true`
- Adminu (Milanu) prikazati listu u dashboard-u — ručna odluka da li re-analizirati

---

## 4. Detekcija sekcija (heuristika)

Pre wizard-a, pipeline mora da zna koje polje pripada kojoj sekciji. Ovo se dodaje kao novi korak u pipeline, posle geometrijskog poklapanja a pre Claude semantičkog mapiranja.

### 4.1 Klasifikacija naslova sekcije

Paragraf se smatra naslovom sekcije ako zadovoljava **bar 2 od 3** uslova:
- Tekst je sve caps (ili >80% caps karaktera)
- Dužina teksta < 80 karaktera (naslovi su kratki)
- DI `styles` za taj paragraf sadrži `bold: true` (ako je dostupno)

Fallback: ako nema naslova koji zadovoljavaju uslove, svrstati polja po stranici ("Страна 1", "Страна 2"...).

### 4.2 Pripisivanje polja sekciji

Za svako polje: naći najbliži naslov sekcije koji je **iznad polja** na istoj stranici (manji Y u DI koordinatnom sistemu). Ako ne postoji naslov na istoj stranici, koristiti stranicu kao sekciju.

### 4.3 Output

```typescript
interface FormSection {
  title: string;           // "1. ПОДАЦИ О ПОРЕСКОМ ОБВЕЗНИКУ:" ili "Страна 1"
  page: number;
  fields: GuideField[];    // polja koja pripadaju ovoj sekciji
}
```

---

## 5. WizardView komponenta

### 5.1 Pozicioniranje u flow-u

WizardView se pojavljuje kao novi korak posle postojećeg GuideView-a (Faza 2). U GuideView-u, pored postojećeg "Popuni automatski" dugmeta, dodati:

**"Popuni sve" dugme** — vodi na WizardView gde korisnik može da pregleda auto-fill predloge I popuni preostala manual polja, sve na jednom mestu.

### 5.2 Layout

```
┌─────────────────────────────────────────────────┐
│  Popunjavanje: PPDG-1S                    [2/7] │  ← sekcija 2 od 7
├─────────────────────────────────────────────────┤
│  1. ПОДАЦИ О ПОРЕСКОМ ОБВЕЗНИКУ          [↑][↓] │  ← sekcija nav
│ ▶ 2. ПОДАЦИ О РАДЊИ                            │  ← aktivna sekcija
│  3. ПОДАЦИ О ДЕЛАТНОСТИ                        │
│  ...                                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  PIB радње                                      │
│  ┌─────────────────────────────┐               │
│  │ 104234053          ✓ iz profila │            │  ← auto-filled, editabilno
│  └─────────────────────────────┘               │
│                                                 │
│  Матични број радње                             │
│  ┌─────────────────────────────┐               │
│  │ 12341234           ✓ iz profila │            │
│  └─────────────────────────────┘               │
│                                                 │
│  Датум уписа у регистар                         │
│  ┌─────────────────────────────┐               │
│  │                    ✎ ручно  │               │  ← prazno, manual
│  └─────────────────────────────┘               │
│                                                 │
├─────────────────────────────────────────────────┤
│  [← Prethodna]              [Sledeća sekcija →] │
├─────────────────────────────────────────────────┤
│  [Generiši PDF]  ← aktivan od prve sekcije      │
└─────────────────────────────────────────────────┘
```

### 5.3 Ponašanje polja u wizard-u

- **high/low confidence polja** — prikazuju se sa predlogom, editabilni input, korisnik može promeniti ili obrisati vrednost
- **manual polja** — prazni input sa placeholder tekstom ("Unesite vrednost") i labelom
- **isInternal polja** (npr. "Организациона јединица") — prikazuju se sa napomenom "Popunjava organ" i nisu editabilna
- **Potpis polja** — prikazuju se sa napomenom "Potpisati na štampanom dokumentu", bez input polja

### 5.4 Validacija

Nema poslovne logike ili validacije polja — ovo je eksplicitna odluka. Aplikacija ne zna šta je ispravna vrednost za "Износ обрачунатог пореза". Jedina validacija je tehnička: dužina teksta ne sme preći kapacitet overlay polja (isti overflow handling kao u Fazi 2).

### 5.5 Navigacija

- Korisnik može preskočiti sekciju i ići napred bez popunjavanja
- "Generiši PDF" dostupan u svakom trenutku — ne čeka da korisnik popuni sva polja
- Prazna manual polja ostaju prazna u finalnom PDF-u (ne upisuje se placeholder tekst)

---

## 6. Izmene u `/api/obrasci/generate-filled`

Postojeći endpoint prima `confirmedFields: GuideField[]` — ovo ostaje, samo se proširuje sa vrednostima koje je korisnik uneo u wizard-u. Nema strukturnih promena u API-ju, samo `value` polje u GuideField može biti korisnikov unos umesto auto-fill predloga.

---

## 7. Definicija "gotovo" za Fazu 3

- [ ] `form_templates` tabela kreirana u Supabase, RLS politike postavljene
- [ ] Fingerprint algoritam implementiran i testiran na poznatim obrascima (eko-taksa, PPDG-1S) — mora vraćati isti fingerprint za različite kopije istog obrasca
- [ ] Template lookup implementiran — drugi upload istog obrasca ne poziva DI full analizu
- [ ] Detekcija sekcija implementirana i testirana — PPDG-1S mora imati bar 5 prepoznatih sekcija
- [ ] WizardView implementiran sa sekcijskom navigacijom
- [ ] "Popuni sve" dugme dodato u GuideView
- [ ] Wizard → preview → download flow radi end-to-end
- [ ] Template feedback (thumbs up/down) implementiran
- [ ] Testirano na min 3 obrasca uključujući PPDG-1S (veliki, višesekcijski) i Образац 1 (manji)

---

## 8. Van obima Faze 3

- Detekcija "caption bez podvlake/tabele" šablona — backlog, čeka više test materijala
- Checkbox detekcija u zbijenim pasusima — backlog
- Admin dashboard za template review — može se dodati kao mini feature unutar ove faze ako ima vremena, nije bloker
- Adresa split (ulica+broj iz jednog profil polja) — backlog
- AcroForm direktno popunjavanje (bez overlay-a) — zasebna razmatranje
