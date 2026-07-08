# Faza 4 — Biblioteka obrazaca (pivot)

## Status: Draft za review pre implementacije
## Vlasnik: Milan / AIsistent
## Datum: 2026-07-04
## Prethodni dokumenti: FAZA1_PREPOZNAVANJE_OBRAZACA.md, FAZA2_AUTOFILL_OVERLAY.md, FAZA3_WIZARD_TEMPLATE_BAZA_1.md

---

## 1. Kontekst i odluka o pivotu

Faze 1–3 su izgradile pipeline za automatsko prepoznavanje i popunjavanje **proizvoljnih** uploadovanih obrazaca (Azure DI → geometrijsko uparivanje → Claude semantičko mapiranje → GuideView/wizard → overlay). Validacija na realnim obrascima (jul 2026) pokazala je da je stopa greške strukturna, ne popravljiva:

- PPDG-1S: 198 polja, ~9 auto-popunjenih; PPI-2: 0 auto-popunjenih
- Cela kategorija polja ("caption bez podvlake/tabele") nevidljiva pipeline-u
- Nondeterminizam mappera (isto polje mapirano u jednom runu, u drugom ne)
- Wizard sa 190 manual polja je gora forma za popunjavanje od samog PDF-a

**Ključni uvid:** kod zvaničnih obrazaca važi asimetrija poverenja — jedno pogrešno upisano polje košta korisnika više nego što deset tačnih uštedi, jer onda mora sve da proverava, a provera ~200 polja traje koliko i popunjavanje.

**Odluka (Milan, 4. jul 2026):** vrednost se premesta sa "AI čita bilo koji obrazac" na **kuriranu biblioteku zvaničnih obrazaca**:
- Bitni, zvanični obrasci (objavljeni na sajtovima javnih ustanova) dostupni na jednom mestu
- Pre-filled isključivo **zelenim, sigurnim podacima iz profila** (naziv, PIB, MB, adresa...)
- Download kao **editabilan PDF** — korisnik ostatak popunjava ručno u Adobe-u ili drugom softveru, van aplikacije (nije naša odgovornost)
- Mapiranje po obrascu se verifikuje **jednom, ručno** — greška prestaje da bude ponašanje modela i postaje popravljiv podatak

Faza 1–3 kod se NE briše: pipeline postaje **interni alat kuratora** (prvi predlog mapiranja za nov obrazac), `form_templates` mehanika i overlay engine se direktno koriste.

---

## 2. Šta se menja u odnosu na Faze 1–3

| | Pre (Upload & Fill) | Posle (Biblioteka) |
|---|---|---|
| Izvor obrasca | korisnik uploaduje bilo šta | kurirana lista zvaničnih obrazaca |
| Mapiranje | runtime (DI + Claude po uploadu) | jednom, pri kuraciji, ručno verifikovano |
| Trošak po korišćenju | ~$0.05 + 30-60s čekanja | 0 API poziva, <2s |
| Popunjavanje ostatka | in-app wizard (19 sekcija...) | ručno u Adobe/Reader (editabilan PDF) |
| Odgovornost za tačnost | nejasna (mi predlažemo 200 polja) | jasna: mi samo zeleni profil, ostalo korisnik |
| Upload & Fill flow | glavni feature na /obrasci | sklonjen iz navigacije (kod ostaje, interni alat) |

---

## 3. Korisnički flow

```
/obrasci  →  Biblioteka: lista po kategorijama (Poreska, APR, CROSO, lokalna samouprava...)
                │
                ▼
         Kartica obrasca: naziv, kratak opis "kada ti treba", izvor (link), datum provere
                │
                ▼
    [Preuzmi popunjeno mojim podacima]     [Preuzmi prazan obrazac]
                │
                ▼
    Editabilan PDF sa upisanim zelenim podacima iz profila
    (AcroForm polja ostaju ŽIVA — bez flatten; korisnik nastavlja u Adobe-u)
```

- Bez uploada, bez analize, bez wizarda, bez preview-potvrde. Jedan klik.
- Ako profil nema neku vrednost (npr. nema `maticni_broj`) — to polje se preskače, ostaje prazno.
- Kratka napomena pre downloada (jednom, dismissable): "Upisali smo podatke iz vašeg profila. Ostala polja popunite ručno — za tačnost i kompletnost obrasca odgovoran je podnosilac."

---

## 4. Model podataka

Nova tabela — **odvojena** od `form_templates` (keš je auto-generisan po fingerprint-u; biblioteka je ručno kurirana i publikovana; mešanje invarijanti bi bilo izvor grešaka):

```sql
create table library_forms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- URL + SEO: "ppdg-1s", "opd", "eko-taksa-obrazac-1"
  title text not null,                -- "ППДГ-1С — Пореска пријава за аконтационо..."
  short_name text not null,           -- "PPDG-1S"
  category text not null,             -- 'poreska' | 'apr' | 'croso' | 'lokalna' | 'ostalo'
  description text,                   -- "kada ti treba" — markdown, i SEO sadržaj
  source_institution text not null,   -- "Poreska uprava RS"
  source_url text not null,           -- zvanična stranica sa koje je obrazac preuzet
  file_ref text not null,             -- prazan original PDF u Storage bucket-u 'obrasci-library'
  source_type text not null check (source_type in ('acroform','flat')),
  script text not null default 'cyrillic' check (script in ('cyrillic','latin')),  -- pismo obrasca, određeno pri kuraciji (na download nema DI poziva za detekciju)
  page_count int not null,
  fields jsonb not null,              -- SAMO verifikovana zelena polja (format ispod)
  published boolean not null default false,
  verified_at timestamptz not null,   -- "proveren: datum" — prikazuje se korisniku
  outdated_reports int not null default 0,  -- dugme "obrazac je zastareo?"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

RLS: **anon/authenticated čitaju samo `published = true`** (lista je javna — SEO/akvizicija); insert/update isključivo service-role.

### 4.1 Format `fields` — samo verifikovano, nikad vrednosti

```jsonc
// AcroForm — polje se puni preko form API-ja po imenu:
{ "kind": "acroform", "fieldName": "T11", "profileKey": "pib" }

// Flat — koordinate uhvaćene JEDNOM pri kuraciji (DI inči), na download NEMA DI poziva:
{ "kind": "flat", "page": 1, "x": 2.31, "y": 3.05, "w": 1.8, "h": 0.25, "profileKey": "maticni_broj" }
```

Pravila:
- U `fields` ulaze **isključivo** polja koja je kurator ručno potvrdio (zelena). Sve ostalo ne postoji za fill engine.
- `profileKey` ∈ postojećih 13 ključeva iz `semanticMapper.ts` (PROFILE_KEYS).
- **Nikad se ne čuvaju vrednosti** — samo struktura/mapiranje (isti princip kao `form_templates`).
- Potpis polja se nikad ne mapiraju (postojeći `isSignatureField` guard važi i za kuratora).

---

## 5. Fill engine (download)

Na download se **ne poziva ni DI ni Claude** — sve potrebno je u `library_forms.fields`:

- **AcroForm**: postojeći `fillAcroFormFields` tok (setFontSize(9) → setText → updateFieldAppearances) ali **BEZ `form.flatten()`** — polja ostaju živa i korisnik nastavlja da kuca u Adobe/Reader-u. Ovo je jedina suštinska izmena postojećeg engine-a.
- **Flat**: postojeći overlay upis teksta na sačuvane koordinate (`diToPdfCoords` + Roboto embed + `fitText`). Upisani tekst nije naknadno editabilan, ali korisnik svoja preostala polja dodaje kroz Fill & Sign (radi i u besplatnom Adobe Reader-u) — prihvatljivo jer mi upisujemo samo verifikovana polja.
- Transliteracija: postojeći `toDocumentScript()` (sa `isNonTransliterable` guard-om za email/website).
- Prazan download = original iz Storage, bez ikakve obrade.

API: `GET /api/obrasci/library/[slug]/download?filled=1` — auth + plan check za `filled=1`; prazan original po odluci o gating-u (otvoreno pitanje 15.2).

---

## 6. Kuracija — kako obrazac ulazi u biblioteku

MVP je **CLI alat** (admin UI kasnije, van obima):

```
1. Kurator (Milan) skine zvaničan PDF sa sajta institucije
2. scripts/curate-form.ts <pdf> — provuče obrazac kroz POSTOJEĆI pipeline
   (analyzeLayout + extractAcroFormFields/extractFlatPdfFields + matchFieldLabels
    + mapFieldsToProfile) i ispiše PREDLOG mapiranja u JSON fajl:
    [{ fieldName/koordinate, label, predloženi profileKey, confidence }]
3. Kurator ručno pregleda JSON: briše pogrešna, ispravlja, dodaje promašena
   (uz vizuelnu proveru — pymupdf render sa označenim poljima)
4. scripts/curate-form.ts <pdf> --publish <edited.json> — testni fill sa mock profilom,
   render za vizuelnu kontrolu, pa upis u library_forms (published=false) + upload PDF-a u Storage
5. Kurator popuni title/slug/category/description/source_url, pregleda na stranici, published=true
```

Pipeline Faza 1–3 ovde radi tačno ono u čemu je dobar: **prvi predlog** koji čovek ispravi — umesto finalni output koji korisnik trpi.

### 6.1 Pravila kvalifikacije obrasca (dopuna 5. jul, iz prve kuracije)

1. **Samo AcroForm obrasci.** Flat PDF posle našeg overlay-a korisnik ne može da popunjava u Adobe Reader-u kako reklamiramo — publish ih odbija. (Prvi kuriran obrazac, OPD, bio je flat i uklonjen je iz biblioteke zbog ovoga.)
2. **Meta tekst (title, opis, institucija) isključivo latinicom** — sajt je latiničан, pravilo bez izuzetka. Publish auto-transliteruje. Sam PDF ostaje na svom pismu.
3. **Proveriti kako se obrazac stvarno podnosi.** Neki obrasci se podnose isključivo elektronski kroz portal (npr. PPDG-1S kroz ePorezi od 2017) — pre-filled PDF tada ima ograničenu/nikakvu vrednost i kurator odlučuje da li uopšte ulazi. Treće strane objavljuju "elektronske" PDF verzije zvaničnih obrazaca — izvor mora biti zvanična institucija.

**Buduće proširenje (backlog):** flat → AcroForm konverzija pri kuraciji — pdf-lib može da DODA text polja na koordinate praznih ćelija, čime bilo koji flat obrazac postaje editabilan. Time bi se pravilo 1 relaksiralo. Van obima MVP-a.

---

## 7. UI

### 7.1 `/obrasci` — biblioteka (zamenjuje upload kao primarni sadržaj)
- Grid/lista kartica po kategorijama, pretraga po nazivu
- Kartica: short_name, title, institucija, "proveren: datum", dugmad za download
- Upload & Fill se sklanja iz navigacije; ruta/kod ostaju (interni alat + eventualna "beta" odluka kasnije)

### 7.2 `/obrasci/[slug]` — stranica obrasca (SEO)
- Pun opis ("kada ti treba", ko podnosi, kome se predaje, rok), izvor, datum provere
- Dugmad: popunjeno / prazno; za neulogovane CTA ka registraciji
- Javno dostupna (lista je akvizicioni kanal, kao blog) — sadržaj description polja piše se jednom pri kuraciji

### 7.3 Feedback
- "Obrazac je zastareo ili ima grešku?" dugme → inkrement `outdated_reports` (+ opciono GitHub issue kroz postojeći n8n tok) — bez automatske reakcije, kurator odlučuje

---

## 8. Održavanje aktuelnosti

Jedini pravi operativni rizik: institucije menjaju obrasce.
- `source_url` + `verified_at` vidljivi korisniku ("proveren: 4. jul 2026.")
- `outdated_reports` iz korisničkog feedbacka
- Periodična ručna provera izvora (kasnije: n8n nadzor izvora — van obima MVP-a)
- Nova verzija obrasca = nova kuracija (korak 6), `verified_at` se ažurira

---

## 9. Redosled implementacije

### Korak 1 — Migracija + Storage + fill engine bez flatten-a (izolovano)
`library_forms` tabela, `obrasci-library` bucket, `fillLibraryForm()` (AcroForm bez flatten + flat sa sačuvanim koordinatama).
🛑 **STOP** — ručno napravljen test red (PPDG-1S sa 5-6 ručno mapiranih polja), download, otvoriti u Adobe-u: zeleni podaci upisani + polja i dalje editabilna.

### Korak 2 — Kuratorski CLI
`scripts/curate-form.ts` (predlog → ručna korekcija → testni fill + render → publish).
🛑 **STOP** — proces od nule na OPD-o: pokazati Milanu predlog JSON, korigovan JSON i finalni render.

### Korak 3 — Biblioteka UI
`/obrasci` lista + `/obrasci/[slug]` + download endpoint sa plan gating-om.
🛑 **STOP** — screenshot liste i stranice obrasca, end-to-end download na produkciji.

### Korak 4 — Seed inicijalnog kataloga
10–15 obrazaca (predlog: PPDG-1S, OPD, Obrazac 1 eko taksa, M-A, PPI-2, JRPPS, Dodatak 15, 3040 + Milanov izbor APR/lokalna). Za svaki: kuracija + description + source_url.
🛑 **STOP** — Milan pregleda ceo katalog pre `published=true`.

### Korak 5 — Sklanjanje Upload & Fill iz navigacije + disclaimer + feedback dugme

---

## 10. Definicija "gotovo" za Fazu 4

- [ ] `library_forms` + Storage bucket + RLS (javno čitanje samo published)
- [ ] Fill engine: AcroForm bez flatten (polja editabilna posle downloada), flat sa koordinatama iz baze, 0 API poziva na download
- [ ] Kuratorski CLI radi ceo ciklus (predlog → korekcija → testni render → publish)
- [ ] `/obrasci` biblioteka + `/obrasci/[slug]` SEO stranice
- [ ] Min 10 obrazaca kurirano i publikovano
- [ ] Disclaimer o odgovornosti + "obrazac je zastareo?" feedback
- [ ] Upload & Fill sklonjen iz navigacije, kod netaknut

---

## 11. Šta NE raditi

- Ne raditi `flatten()` na AcroForm download-u — editabilnost je poenta featura
- Ne upisivati ništa što kurator nije ručno verifikovao (nema "runtime AI dopune")
- Ne pozivati DI/Claude pri download-u — sve iz baze
- Ne čuvati korisničke vrednosti u `library_forms` — samo struktura/mapiranje
- Ne brisati Faza 1–3 kod — pipeline je kuratorski alat
- Ne graditi admin UI za kuraciju u MVP-u — CLI je dovoljan dok katalog ne poraste
- Ne publikovati obrazac bez `source_url` i ručne vizuelne provere testnog fill-a
- Ne publikovati flat obrasce (samo AcroForm — vidi 6.1) ni ćirilični meta tekst (sajt je latiničан)
- Ne publikovati obrazac koji se podnosi isključivo elektronski kroz portal bez izričite odluke kuratora

---

## 12. Odluke (Milan, 5. jul 2026.)

1. **Plan gating**: potvrđeno — lista i stranice obrazaca javne (SEO), prazan original javan/besplatan nalog, "popunjeno mojim podacima" od Starter naviše.
2. **Upload & Fill**: potpuno sakriti (kod ostaje, interni alat).
3. **Inicijalna lista**: bez prioritizacije — jedna zajednička biblioteka za sve, korisnik traži po potrebi ("srpska birokratija je čudna i neobjašnjiva stvar, može sve da zatreba"). Kurator puni bitnim zvaničnim obrascima kojim redom stigne.
4. **Kategorije**: 6 predloženih dovoljno za početak, menjaće se po potrebi.
5. **Naming u UI**: **"Obrasci"**.
