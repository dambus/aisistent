# Faza 2 — Auto-fill overlay (direktno upisivanje u PDF)

## Status: Draft za review pre implementacije
## Vlasnik: Milan / AIsistent
## Datum: 2026-07-01
## Prethodni dokument: FAZA1_PREPOZNAVANJE_OBRAZACA.md

---

## 1. Cilj faze

Nadograditi Fazu 1 (guide mode) tako da sistem, umesto što prikazuje vrednosti za ručno kopiranje, **direktno upiše vrednosti iz profila korisnika u PDF dokument** i isporuči korisniku popunjenu kopiju spremnu za štampu/slanje.

Originalni fajl koji je korisnik upload-ovao se **ne čuva** — korisnik ga ima lokalno. Sistem generiše **novu kopiju** sa upisanim vrednostima. Originalni fajl se briše iz privremenog storage-a nakon generisanja kopije.

---

## 2. Preduslovi (završiti pre starta Faze 2)

### 2.1 Bug #3 — duplikat polja sa istom labelom (fix pre implementacije overlay-a)

**Problem:** Više AcroForm box-ova na istoj Y liniji (npr. Телефон = pozivni + lokalni broj, dva box-a) dobija istu labelu jer oba zadovoljavaju "ista linija, labela levo" uslov. Rezultat: duplikat u guide-u.

**Fix — post-processing korak u `matchFieldLabels.ts`:**

Nakon završenog matchinga, pre slanja Claude-u, grupisati polja koja dele:
- Istu labelu (string match)
- Istu stranicu
- Y razliku < `SAME_LINE_Y` prag (ista linija)

Tretman grupe:
- U guide-u i overlay-u prikazuje se **jednom**
- Vrednost iz profila ide u **prvi box grupe** (najmanji X — krajnje levo)
- Ostali box-ovi u grupi: `suggestedValue: null`, `state: 'manual'` — korisnik popunjava ručno jer ne znamo raspored (pozivni vs. lokalni, broj vs. slovo itd.)

### 2.2 Bug #2 potvrda (rešen u Fazi 1, verifikacija)

Proveriti da `lines` granularnost radi ispravno za T2 tip pre nego što se krene na overlay — merge bug koji je upisivao naslov sekcije umesto labele bi u overlay modu upisao vrednost na pogrešno mesto.

---

## 3. Arhitektura — šta se menja u odnosu na Fazu 1

Faza 1 pipeline ostaje nepromenjen do tačke `mapFieldsToProfile` — svi postojeći koraci (DI ekstrakcija, geometrijsko poklapanje, Claude semantičko mapiranje) se izvršavaju identično. Faza 2 dodaje **novi izlazni korak** koji umesto guide JSON-a generiše popunjen PDF:

```
[Faza 1 pipeline — nepromenjen]
    │
    ▼
mapFieldsToProfile → GuideField[] (visoka/niska/manual pouzdanost)
    │
    ▼  [NOVO u Fazi 2]
Korisnik pregleda i potvrđuje predloge (preview korak)
    │
    ▼
PDF overlay generator
    ├── Korak A: tabelarne strukture (DI prazne ćelije sa bounding box-om)
    └── Korak B: slobodne linije (podvučene linije van tabela)
    │
    ▼
Novi PDF fajl → download za korisnika
```

---

## 4. Detekcija pisma (ćirilica vs. latinica)

Pre upisivanja teksta, sistem mora da detektuje pismo originalnog dokumenta i da vrednosti iz profila konvertuje u odgovarajuće pismo.

**Implementacija:**
- Analizirati DI `content` string (ukupni OCR tekst dokumenta) — prebrojati ćirilična vs. latinična slova
- Ako >50% slova ćirilično → dokument je ćirilični, upisivati ćirilicom
- Ako ≤50% → latinica

**Konverzija vrednosti:**
- Podaci u profilu korisnika su verovatno mešoviti (latinica/ćirilica zavisno od toga kako su uneti)
- Napraviti `transliterate.ts` utility koji konvertuje latinicu u ćirilicu i obratno
- Primeniti na sve `suggestedValue` stringove pre upisivanja u PDF

**Font koji se koristi za overlay:**
- Koristiti `pdf-lib` standardni font koji podržava ćirilicu: **`StandardFonts` ne podržava ćirilicu** — potrebno je embed-ovati eksterni font
- Preporučen font: **Noto Sans** (open source, odlična ćirilična podrška, mala veličina fajla)
- Font se embed-uje jednom po dokumentu, ne po polju
- Vizuelna razlika od originalnog fonta je prihvatljiva (potvrđeno)

---

## 5. Korak A — Auto-fill tabelarnih struktura

### 5.1 Izvor koordinata

Za tabelarne strukture koristimo **DI bounding box praznih ćelija** — potvrđeno u Fazi 1 da DI vraća prazne ćelije kao entitete sa tačnim koordinatama (eko-taksa test, red 0: "ПИБ" | ""). Ovo je pouzdan, strukturiran signal sa jasno definisanim prostorom za upis.

### 5.2 Algoritam upisivanja

Za svaku praznu ćeliju koja ima mapirani `suggestedValue`:

1. Uzeti `boundingBox` prazne ćelije iz DI rezultata (x, y, w, h u inčima)
2. Konvertovati u PDF koordinate (pt): `x_pt = x_in * 72`, uz invertovanje Y ose (`y_pdf = page_height - (y_in + h_in) * 72`)
3. Izračunati veličinu fonta: `fontSize = min(h_pt * 0.6, 10)` — 60% visine ćelije, max 10pt da ne izlazi van granica
4. Pozicionirati tekst: leva ivica + 2pt padding, vertikalni centar ćelije
5. Upisati sa embed-ovanim Noto Sans fontom

### 5.3 Overflow handling

Ako je tekst širi od ćelije:
- Prvo pokušati smanjiti font (do min 6pt)
- Ako i dalje ne staje: **skratiti tekst i dodati "…"** — ne prelaziti u sledeću ćeliju, ne smanjivati font ispod čitljivog

---

## 6. Korak B — Auto-fill slobodnih linija

### 6.1 Identifikacija slobodnih linija za unos

DI vraća podvučene linije van tabela kao tekstualni sadržaj tipa `"____________"` (niz donjih crta) ili kao vizuelne linije (u `pages[n].lines`). Pored toga, geometrijski matcher u Fazi 1 već pronalazi labelu za svako AcroForm polje — za flat PDF bez AcroForm-a koristimo isti "above" fallback.

**Dva slučaja:**

**A) AcroForm polja na flat PDF izgledu:** Polje ima poznate koordinate iz pdf-lib ekstrakcije (x, y, w, h). Upisujemo direktno na koordinate polja — ovo je trivijalno, iste koordinate kao Korak A.

**B) Čiste slobodne linije bez AcroForm strukture:** Koristiti DI detekciju linija (`"_____"` pattern ili horizontalne linije u `figures`). Pozicija teksta: **iznad linije** za 2-3pt (tekst leži na liniji, ne ispod nje).

### 6.2 Posebni slučajevi

**Datum polja:** Prepoznati po labeli (`datum`, `дана`, `године`, `period od/do`) — formatirati vrednost kao `DD.MM.YYYY.` (srpski standard). Ako polje ima tri odvojene ćelije (dan/mesec/godina), razdvojiti vrednost.

**Potpis polja:** Labele tipa `одговорно лице`, `потпис`, `директор` — **ne upisivati automatski**, uvek ostaviti kao `state: 'manual'`. Potpis je pravno osetljiv element, ne sme se auto-popunjavati bez eksplicitne korisničke akcije.

**Mesto polja:** Labele tipa `у _____`, `место` — mapirati na `profile.grad`.

---

## 7. Preview i potvrda (obavezan korak)

Pre generisanja finalnog PDF-a, korisniku prikazati **preview popunjenog dokumenta**. Ovo je sigurnosna mreža za sve edge case-ove koji ne mogu biti uhvaćeni algoritmom.

### 7.1 Šta preview mora da sadrži

- Renderovanu sliku svake strane sa upisanim vrednostima (ili PDF embed u browseru)
- Listu svih upisanih vrednosti sa mogućnošću izmene pre finalizacije
- Jasno označena `manual` polja koja korisnik mora sam da popuni (ova polja se NE pojavljuju u PDF-u, samo u listi)
- Dugme "Preuzmi popunjeni obrazac" — aktivno tek nakon što korisnik potvrdi preview

### 7.2 Editabilnost pre preuzimanja

Korisnik mora moći da:
- Izmeni predloženu vrednost za bilo koje polje pre upisivanja
- Isključi polje iz auto-fill-a (ostavi prazno u PDF-u)
- Doda vrednost za `manual` polje (koja NE ide u PDF automatski — korisnik je i dalje popunjava ručno na papiru/u Adobe Readeru, ali je prikazana u preview listi kao podsetnik)

---

## 8. Novi API endpoint i storage flow

### 8.1 Endpoint

Novi endpoint: `/api/obrasci/generate-filled`

Flow:
1. Prima: `{ documentId, confirmedFields: GuideField[] }` — lista polja sa finalnim vrednostima koje je korisnik potvrdio u preview-u
2. Preuzima originalni PDF iz privremenog Supabase Storage
3. Pokreće overlay generator (Koraci A + B)
4. Vraća: popunjeni PDF kao binary response (`Content-Type: application/pdf`, `Content-Disposition: attachment`)
5. Briše originalni fajl iz Supabase Storage

### 8.2 Storage

- Originalni PDF: privremeni upload, briše se nakon generisanja kopije (ili nakon 1h timeout ako korisnik ne završi flow)
- Popunjeni PDF: **ne čuva se na serveru** — direktan download, nema arhiviranja (osim ako korisnik ima plan koji uključuje arhivu)
- Ovo je konzistentno sa Starter plan restrikcijama iz originalnog dokumenta

---

## 9. Izmene u UI

### 9.1 ObraściClient.tsx

Dodati novi stage u flow: `di-guide` → `di-preview` → `di-download`

- `di-guide`: postojeći GuideView (Faza 1) — ostaje kao fallback i za `manual` prikaz
- `di-preview`: novi PreviewView komponenta — prikazuje renderovani PDF sa upisanim vrednostima i editabilnu listu
- `di-download`: nakon potvrde, triggeruje `/api/obrasci/generate-filled` i pokreće browser download

### 9.2 GuideView.tsx

Dodati dugme **"Popuni automatski"** na vrhu, vidljivo samo ako postoji bar jedno `high` ili `low` polje sa `suggestedValue`. Klik vodi na `di-preview` stage.

Zadržati postojeći guide prikaz ispod — korisnik može da se vrati na guide ako ne želi auto-fill.

---

## 10. Definicija "gotovo" za Fazu 2

- [ ] Bug #3 (duplikati) rešen i verifikovan
- [ ] Bug #2 (lines vs paragraphs) verifikovan da ne pravi probleme u overlay modu
- [ ] `transliterate.ts` utility implementiran i testiran na mešovitim vrednostima
- [ ] Noto Sans (ili ekvivalent sa ćiriličnom podrškom) embed-ovan u overlay generator
- [ ] Korak A (tabele): auto-fill radi na eko-taksa obrascu, vizuelno verifikovano
- [ ] Korak B (slobodne linije): datum i mesto polja popunjena na bar 2 obrasca sa slobodnim linijama
- [ ] Potpis polja eksplicitno isključena iz auto-fill-a (uvek `manual`)
- [ ] Preview korak implementiran sa editabilnom listom
- [ ] `/api/obrasci/generate-filled` endpoint implementiran, originalni fajl se briše nakon generisanja
- [ ] Testirano end-to-end na min 3 obrasca (mešavina tabelarnih i sa slobodnim linijama)
- [ ] Verifikovano da popunjeni PDF izgleda ispravno u Adobe Reader i u browser PDF vieweru

---

## 11. Van obima Faze 2

- AcroForm auto-fill (upisivanje u interaktivna polja direktno) — AcroForm obrazac i dalje ide kroz guide mode u Fazi 1; overlay se ne primenjuje na AcroForm polja jer pdf-lib već može da ih popuni direktno, ali to je poseban zadatak koji zahteva sopstveni spec
- Arhiviranje popunjenih dokumenata — zasebna funkcionalnost, nije deo ovog pipeline-a
- Skeniran/rasterizovan PDF (M-A tip) — i dalje van opsega, zahteva OCR preprocessing
