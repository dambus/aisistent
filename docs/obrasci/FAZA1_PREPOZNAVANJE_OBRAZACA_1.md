# Faza 1 — Pouzdano prepoznavanje i mapiranje obrazaca (Guide mode)

## Status: Draft za review pre implementacije
## Vlasnik: Milan / AIsistent
## Datum: 2026-06-30

---

## 1. Cilj faze

Izgraditi pouzdan pipeline koji za bilo koji upload-ovan obrazac (AcroForm PDF, flat PDF, DOCX) prepoznaje strukturu, mapira polja na profil korisnika, i prikazuje **guide** — jasno uputstvo gde šta treba upisati — bez generisanja novog dokumenta i bez izmene originala.

**Ova faza NE uključuje** automatsko upisivanje vrednosti u flat PDF (overlay teksta preko dokumenta). To je namerno izostavljeno — vidi sekciju 8.

### Zašto guide mode prvo, ne auto-fill

Tokom istraživanja (jun 2026) testirano je da li se Claude može osloniti na semantičko "znanje" o poznatim obrascima (npr. PPDG-1S) za mapiranje AcroForm polja (T1, T2...) na značenje, bez stvarne geometrijske ekstrakcije. Test je pokazao da je ovaj pristup **nepouzdan na način koji se ne vidi**: od 4 nasumično proverena polja, jedno je bilo potpuno pogrešno (T1 mapiran kao "PIB", a geometrijski je dokazano da je polje "Организациона јединица" — interno polje poreske uprave), dva su bila međusobno zamenjena (T7/T9 — ulica i opština zamenjeni), a jedno je bilo tačno pukim slučajem.

Zaključak: semantičko mapiranje **bez** stvarne ekstrakcije teksta i koordinata iz konkretnog fajla nije prihvatljivo kao izvor istine. Ova faza gradi pipeline koji se oslanja isključivo na stvarno izvučene podatke iz dokumenta koji korisnik upload-uje.

---

## 2. Obim (Scope)

| Tip dokumenta | Status u ovoj fazi |
|---|---|
| AcroForm PDF (interaktivna polja) | ✅ U obimu — geometrijsko mapiranje, guide mode |
| Flat PDF (skeniran/štampan, bez polja) | ✅ U obimu — DI tabele + paragraph labele, guide mode |
| DOCX sa `{{placeholder}}` | ⚪️ Van obima — već postoji i radi (postojeća funkcionalnost, ne dira se) |
| DOCX bez placeholdera (slobodan tekst sa prazninama) | ⚪️ Van obima — zaseban budući zadatak, zahteva sopstveni test pre specifikacije |
| Auto-fill / overlay teksta na flat PDF | ⚪️ Van obima — Faza 2/3, videti sekciju 8 |

---

## 3. Arhitektura — pregled pipeline-a

```
Upload (PDF)
    │
    ├─→ [A] Da li PDF ima AcroForm polja?
    │       │
    │      DA → grana AcroForm (sekcija 5)
    │      NE → grana Flat PDF (sekcija 6)
    │
    ▼
Azure Document Intelligence — Layout model
(OCR + koordinate + tabele + paragraphs + selection marks)
    │
    ▼
Geometrijsko mapiranje (label ↔ polje/prazan prostor)
    │
    ▼
Claude — semantičko povezivanje (label → profil korisnika)
    │
    ▼
Guide UI — prikaz korisniku: "ovde upiši X" sa vizuelnom referencom
```

---

## 4. Azure Document Intelligence — setup

**Status: Resurs već kreiran** (`aisistent-docintel` ili slično ime, region West Europe, F0/free tier za sada).

### 4.1 Šta treba uraditi u ovoj fazi

- [x] **Odlučeno: prelazak na S0 (plaćeni tier) odmah**, ne čekamo produkciju. Razlog: F0 ima hard limit od 2 strane po dokumentu, a PPDG-1S (4 strane) dokazuje da je to realno ograničenje, ne hipotetičko. Razvoj sa realnim uslovima od početka. Pokriveno postojećim Microsoft test kreditom ($200), trošak po stranici zanemarljiv.
- [ ] Milan generiše Azure API ključ i endpoint URL iz portala, dodaje u `.env` aplikacije (`AZURE_DOC_INTEL_ENDPOINT`, `AZURE_DOC_INTEL_KEY`) — **ovo je korak gde je potrebno Milanovo direktno učešće**, Claude Code ne može sam da pristupi Azure portalu.
- [ ] Definisati koji model koristimo: **`prebuilt-layout`** (potvrđeno testom — daje OCR, koordinate, tabele, paragraphs, selection marks). Ne koristiti `prebuilt-document` ili Form Parser ekvivalent (skuplji, manje predvidiv za nepoznate obrasce).

### 4.2 Modul za pozivanje API-ja

Napraviti `lib/documentIntelligence/analyzeLayout.ts` (ili odgovarajući naziv po konvenciji projekta):

- Input: PDF buffer/path
- Output: parsovan JSON odgovor (sačuvati raw response radi debug-a tokom razvoja)
- Error handling: timeout, rate limit, dokument > 2 strane na F0 tier-u (vratiti jasnu grešku, ne tihi pad)

---

## 5. Grana A — AcroForm PDF

### 5.1 Ekstrakcija AcroForm polja

Skripta `inspect-acroform.mjs` (već postoji, ažurirana sa `page` poljem) treba da postane deo aplikacionog koda (ne samo dev skripta). Za svako polje vraća:

```json
{
  "T1": { "type": "TextField", "page": 1, "x": 171.1, "y": 763.8, "w": 93.3, "h": 15.2 }
}
```

**Bitno:** `page` mora biti tačan (1-indexed) — bez njega geometrijsko poklapanje sa DI rezultatom nije pouzdano (potvrđeno tokom testiranja, ranija verzija skripte je netačno pretpostavljala broj strana).

### 5.2 Geometrijsko poklapanje (label ↔ AcroForm polje)

Algoritam (potvrđen testom na PPDG-1S):

1. Konvertovati AcroForm koordinate (PDF pts, donji-levi koordinatni početak) u DI koordinatni sistem (inči, gornji-levi početak):
   ```
   x_di = x_pt / 72
   y_di = (page_height_pt - (y_pt + h_pt/2)) / 72   // vertikalni centar polja
   ```
2. Za svako polje, tražiti DI paragraph na **istoj stranici**, **istoj horizontalnoj liniji** (razlika vertikalnih centara < ~0.12 inča — prag treba fino podesiti tokom testiranja na više obrazaca), čija je desna ivica **levo od ili na** levoj ivici polja.
3. Od kandidata koji zadovoljavaju uslov, uzeti najbližeg (najmanja horizontalna distanca).
4. Ako ne postoji kandidat na istoj liniji, probati "iznad" heuristiku (label iznad polja, slična horizontalna pozicija) — koristiti kao fallback, ne primarni signal.
5. **Ako ni jedan kandidat ne zadovoljava razuman prag pouzdanosti (npr. distanca > X inča) — polje se označava kao `label: null, confidence: "low"`** i ne ulazi u automatski guide bez ljudske/Claude provere niže pouzdanosti (videti 5.4).

### 5.3 Semantičko mapiranje (Claude)

Tek nakon što imamo par `(geometrijski pronađena labela, polje)`, Claude dobija **listu stvarno pronađenih parova** (ne sirova imena T1/T2) i radi:

- Mapiranje labele na semantički ključ (`"Порески идентификациони број" → pib`)
- Mapiranje semantičkog ključa na vrednost iz profila korisnika (`profile.pib`)
- Detekciju polja koja se **ne popunjavaju od strane korisnika** (npr. "Организациона јединица" — interno polje uprave) — ova polja se isključuju iz guide-a ili posebno označavaju

**Eksplicitna instrukcija u promptu:** Claude ne sme da koristi opšte znanje o tome "kako obično izgleda obrazac X" da popuni nedostajuća/nejasna mapiranja. Ako geometrijski par nema jasnu labelu (`label: null`), polje ide u "nesigurno, ne prikazuj auto-predlog" kategoriju, ostaje vidljivo u guide-u kao "nepoznato polje — proverite ručno", a NIKAD se ne popunjava nagađanjem.

### 5.4 Prag pouzdanosti

Definisati jasan prag (npr. zasnovan na geometrijskoj distanci + DI confidence score za reč/paragraf) koji deli polja u:

- **Visoka pouzdanost** → prikazuje se kao predlog u guide-u, korisnik može prihvatiti/izmeniti
- **Niska pouzdanost / nema mapiranja** → prikazuje se kao "nepoznato polje" bez predloga, korisnik popunjava ručno na osnovu vizuelnog uvida u original

Tačne brojčane vrednosti pragova treba podesiti empirijski — testirati na 5-10 različitih obrazaca pre fiksiranja praga.

---

### 5.5 Kalibracioni harness (obavezan deo Faze 1)

Pragovi pouzdanosti definisani u 5.4 (relativna margina, DI confidence cutoff) **ne mogu se pouzdano fiksirati unapred** na osnovu samo 2 testirana obrasca (eko-taksa, PPDG-1S). Državni i poslovni obrasci nemaju jedinstven layout — vrednosti praga će se realno menjati kako test set raste. Cilj ovog harness-a je da to kalibrisanje bude **sistematizovano i ponovljivo**, bez ručnog testiranja na produkciji i bez ručnog čačkanja kroz kod za svaki novi dokument.

**Ključno razgraničenje:** Sistem nikad sam ne zaključuje da je neko mapiranje tačno na osnovu statistike. Mora postojati ljudska potvrda (ground truth) pre nego što se ta potvrda koristi za rekalkulaciju praga — automatizujemo proces sakupljanja i preračunavanja, ne samu odluku o tačnosti.

Tri skripte, jasno odvojene odgovornosti:

**1. `run-calibration-test.mjs <pdf-path>`**
- Pokreće ceo pipeline (DI ekstrakcija → AcroForm/tabela ekstrakcija → geometrijsko poklapanje) za dati dokument
- Za svako polje izlaz sadrži: pronađenu labelu, marginu do drugog najbližeg kandidata, DI confidence score, izračunat predloženi nivo pouzdanosti
- Output: čitljiv JSON/CSV + vizuelni overlay (slično DI Studio prikazu) radi brze vizuelne provere bez otvaranja originalnog PDF-a posebno

**2. `record-ground-truth.mjs <calibration-output>`**
- Omogućava unos potvrde (tačno/netačno) za svako polje iz prethodnog koraka
- Potvrde se akumuliraju u centralni dataset fajl (`calibration-data.jsonl`) — jedan red po testiranom polju, raste kroz vreme sa svakim novim obrascem

**3. `recalculate-thresholds.mjs`**
- Čita ceo akumulirani `calibration-data.jsonl`
- Na osnovu stvarne distribucije tačnih vs netačnih mapiranja predlaže nove vrednosti za prag (margina, DI confidence cutoff)
- **Predlaže izmenu, ne menja konstante u kodu automatski** — promena praga direktno utiče na pouzdanost predloga koje vidi korisnik, pa zaslužuje kratak pregled pre ulaska u kod

**Tok rada:** Milan servira novi test dokument → `run-calibration-test.mjs` → vizuelna provera i unos potvrda kroz `record-ground-truth.mjs` → akumulacija u `calibration-data.jsonl` → povremeno `recalculate-thresholds.mjs` kad se nakupi dovoljno novih podataka → ručna primena predloženih konstanti u kod nakon pregleda.



### 6.1 Ekstrakcija

Isti DI Layout poziv kao za AcroForm granu — nema posebne razlike u API pozivu, razlika je samo u tome što nema AcroForm strukture za poklapanje, pa se cela struktura izvlači iz DI rezultata.

### 6.2 Detekcija praznog prostora za unos

DI rezultat sadrži dva tipa korisnih signala:

1. **Tabele sa praznim ćelijama** (potvrđeno testom na eko-taksa obrascu) — DI vraća `rowIndex`/`columnIndex` parove gde labela u jednoj koloni ima praznu ćeliju (`content: ""`) u susednoj koloni, sa svojim bounding box-om. Ovo je **pouzdan, strukturiran signal** — koristiti kao primarni mehanizam.
2. **Linije/podvlake van tabela** (npr. `"____________"` kao tekstualni sadržaj) — DI ovo prepoznaje kao tekst, ne kao strukturiranu prazninu. Tretirati kao **niži prioritet/niža pouzdanost** signal u ovoj fazi — dovoljno je da guide kaže "upišite X u označeni red", bez potrebe da se precizno determiniše granica praznog prostora (to postaje bitno tek u Fazi 2/3 za auto-fill overlay).
3. **Selection marks (checkbox-ovi)** — DI vraća `:selected:`/`:unselected:` status. Koristiti za guide instrukcije tipa "označite opciju X".

### 6.3 Semantičko mapiranje

Isti princip kao u 5.3 — Claude dobija stvarno izvučene labele i tabelarne parove, mapira na profil, bez oslanjanja na opšte znanje o obrascu.

---

## 7. Guide UI (izlaz pipeline-a)

Van detaljnog UI dizajna u ovom spec-u (to je poseban zadatak za frontend), funkcionalni zahtevi za podatke koje pipeline mora da isporuči UI sloju:

```json
{
  "fields": [
    {
      "label": "Порески идентификациони број (лични број) - ЈМБГ",
      "page": 1,
      "boundingBox": { "x": ..., "y": ..., "w": ..., "h": ... },
      "suggestedValue": "123456789",
      "confidence": "high",
      "sourceField": "T_jmbg_001"
    },
    {
      "label": null,
      "page": 1,
      "boundingBox": { ... },
      "suggestedValue": null,
      "confidence": "low",
      "sourceField": "T14"
    }
  ]
}
```

UI treba da prikaže original dokumenta (sliku stranice) sa markiranim poljima — visoka pouzdanost vizuelno drugačije obeležena (npr. zelena kontura sa predlogom) od niske pouzdanosti (žuta/siva kontura, "proverite ručno").

---

## 8. Van obima ove faze (kratak pregled budućih faza — NE razrađivati ovde)

- **Faza 2:** Auto-fill (overlay teksta) za DI-detektovane tabelarne strukture sa jasnim bounding box-om praznih ćelija (najniži rizik slučaj, eko-taksa tip obrazaca).
- **Faza 3:** Auto-fill za linijske/slobodne prazne prostore van tabela, uz konzervativne heuristike i obavezan preview pre finalnog izvoza.
- **Zaseban zadatak (nije numerisana faza):** DOCX bez placeholdera — zahteva svoj test pre specifikacije.
- **Razmatranje:** Da li flat PDF i AcroForm dele dovoljno koda da opravdaju zajednički modul, ili ostaju odvojeni — proceniti nakon implementacije Faze 1.

---

## 9. Definicija "gotovo" za Fazu 1

- [ ] Azure Document Intelligence (S0 tier) povezan i konfigurisan u aplikaciji
- [ ] AcroForm grana: ekstrakcija polja sa page brojem, geometrijsko poklapanje sa DI labelama, prag pouzdanosti definisan i primenjen
- [ ] Kalibracioni harness implementiran (`run-calibration-test.mjs`, `record-ground-truth.mjs`, `recalculate-thresholds.mjs`) i isproban na bar 2 obrasca
- [ ] Flat PDF grana: DI tabele i paragraphs korišćeni za guide, selection marks podržani
- [ ] Claude semantičko mapiranje radi isključivo nad stvarno ekstrahovanim parovima (label, polje) — bez oslanjanja na opšte znanje o obrascu (testirati eksplicitno na bar jednom obrascu koji Claude sigurno ne "zna")
- [ ] Testirano na minimum 5 različitih obrazaca (mešavina AcroForm i flat PDF, državni i interni dokumenti) sa ručnom verifikacijom tačnosti mapiranja
- [ ] Guide UI prikazuje polja sa jasnom razlikom visoka/niska pouzdanost
- [ ] Dokumentovan prag pouzdanosti i kako je određen

---

## 10. Odluke (status: zatvoreno)

1. **Azure tier: S0, odmah.** Pokriveno postojećim $200 Microsoft test kreditom.
2. **Test set obrazaca: u pripremi (Milan nabavlja).** Mora pokriti, pored eko-takse i PPDG-1S (kontrolni primeri):
   - Bar 1 obrazac koji **sigurno nije poznat/čest** (interni dokument agencije/firme, ili veštački napravljen test-obrazac) — kritično za potvrdu da Claude ne koristi opšte znanje umesto stvarne ekstrakcije
   - Bar 1 pravi skeniran dokument (slika niskog kvaliteta, ne digitalno generisan PDF) — test OCR-a na lošijem inputu
   - Bar 1 obrazac sa checkbox/selection mark poljima kao glavnim sadržajem
   - **Implementacija ne čeka kompletan test set** — Claude Code može početi sa arhitekturom (Azure modul, AcroForm ekstrakcija, geometrijsko poklapanje) koristeći eko-taksu i PPDG-1S, dok Milan paralelno priprema ostatak seta za finalnu validaciju pred "definicija gotovo" (sekcija 9).
3. **Guide UI: ostaje na `/obrasci`.** Ovaj pipeline postaje novi, pouzdaniji "motor" iza postojeće rute (trenutno označene kao privremeno nedostupna u repou). UI komponente se po potrebi prepravljaju, ruta i arhitektonska odluka (deli auth/DB sa AIsistentom) se ne menjaju.
