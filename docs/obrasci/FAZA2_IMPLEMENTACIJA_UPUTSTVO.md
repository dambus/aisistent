# Uputstvo za implementaciju — Faza 2 (za Claude Code)

Prati ovo uputstvo zajedno sa `FAZA2_AUTOFILL_OVERLAY.md`. Faza 1 pipeline ostaje nepromenjen — sve izmene su additivne, ništa se ne refaktoriše bez eksplicitnog odobrenja.

---

## Pravila rada (važe za ceo zadatak)

1. **Radi u koracima iz sekcije "Redosled implementacije" niže, jedan po jedan.** Ne piši overlay kod dok koordinatna konverzija nije vizuelno potvrđena. Ne piši download endpoint dok preview nije potvrđen.

2. **Svaki STOP checkpoint mora uključivati screenshot ili PDF fajl — ne samo tabelu brojeva.** Faza 2 je vizuelna po prirodi; numerički ispravan rezultat koji izgleda pogrešno u dokumentu nije ispravan.

3. **Nikad ne hardkoduj koordinate za specifičan obrazac kao workaround.** Ako overlay ne pogodi pravo mesto na nekom dokumentu, stani i prijavi — ne ispravljaj ručnim pomakom koji radi samo za taj jedan fajl.

4. **Potpis polja su uvek `manual`, bez izuzetka.** Prepoznaj ih po labelama: `потпис`, `одговорно лице`, `директор`, `ovlašćeno lice`, `potpis`, `lice ovlašćeno` i slično. Nikad ne upisuj vrednost u ova polja automatski, čak i ako postoji vrednost u profilu.

5. **Originalni PDF se briše iz Supabase Storage tek nakon uspešnog generisanja kopije** — ne pre, ne ako generisanje nije prošlo bez greške.

6. **Faza 1 pipeline se ne modifikuje.** Ako primetiš da nešto u Fazi 1 treba da se promeni da bi Faza 2 radila, stani i prijavi pre nego što napraviš izmenu.

---

## Redosled implementacije

### Korak 1 — Bug #3 fix (duplikati) i verifikacija Bug #2

Implementiraj post-processing korak za duplikate (detalji u sekciji 2.1 speca).

Verifikuj da Bug #2 (lines vs paragraphs merge) ne pravi probleme u kontekstu overlay-a — pokreni `run-calibration-test.mjs` na PPDG-1S i proveri da T2 sada ima ispravnu labelu (ne naslov sekcije).

🛑 **STOP — pokaži Milanu:**
- Da duplikat Телефон više nije duplikat u guide-u (jedan zelen/narandžast, drugi manual)
- Da T2 ima ispravnu labelu u calibration outputu

---

### Korak 2 — Font embed i transliteracija (izolovano, pre overlay-a)

Ovo mora biti rešeno kao **prvi korak**, ne kao naknadno poboljšanje. Bez ćiriličnog fonta, overlay na srpskim dokumentima ne može biti validan.

1. Implementiraj `lib/documentIntelligence/transliterate.ts`:
   - `latinToCyrillic(text: string): string`
   - `cyrillicToLatin(text: string): string`
   - `detectScript(text: string): 'cyrillic' | 'latin'` — broji slova, >50% ćirilica = ćirilični dokument

2. Embed-uj **Noto Sans** (ili Noto Serif) u overlay generator:
   - Preuzeti `.ttf` fajl koji pokriva ćirilicu
   - Embed-ovati jednom po dokumentu, ne po polju
   - Standardni `pdf-lib` fontovi (`StandardFonts`) ne podržavaju ćirilicu — ne koristiti ih za overlay tekst

🛑 **STOP — pokaži Milanu:**
- Test transliteracije na par primera (latinica → ćirilica i obratno)
- Kratki PDF sa jednom stranicom gde je ispisano "Тест текст / Test tekst" Noto Sans fontom — da vizuelno potvrdimo da ćirilica izlazi čitljivo i bez `???`

---

### Korak 3 — Koordinatna konverzija (izolovano, bez upisivanja)

Pre nego što se išta upiše u PDF, verifikuj da konverzija koordinata radi tačno.

Implementiraj `lib/documentIntelligence/pdfCoordinates.ts` sa funkcijom:
```typescript
function diToPldfCoords(
  bbox: { x: number; y: number; w: number; h: number }, // DI inči
  pageHeight: number // pdf-lib page height u pt
): { x: number; y: number; w: number; h: number } // pdf-lib pt, Y od dna
```

Formula:
```
x_pt = bbox.x * 72
y_pt = pageHeight - (bbox.y + bbox.h) * 72   // Y invertovanje
w_pt = bbox.w * 72
h_pt = bbox.h * 72
```

**Test:** Napravi debug skriptu koja za eko-taksa obrazac:
1. Uzme DI bounding box prve prazne ćelije tabele (red 0, kolona 1 — pored "ПИБ")
2. Konvertuje u pdf-lib koordinate
3. Nacrta **crveni pravougaonik** (bez teksta) na tim koordinatama u kopiji PDF-a
4. Sačuva kao `debug-bbox.pdf`

🛑 **STOP — pošalji Milanu `debug-bbox.pdf`.** Crveni pravougaonik mora biti vizuelno tačno na mestu prazne ćelije pored "ПИБ" labele — ne pomeren, ne skaliran pogrešno. Tek nakon vizuelne potvrde ide se na Korak 4.

---

### Korak 4 — Overlay generator, Korak A (tabele)

Tek nakon potvrde koordinatne konverzije iz Koraka 3.

Implementiraj `lib/documentIntelligence/pdfOverlay.ts`:
- Funkcija `fillTableCells(pdfDoc, confirmedFields, diResult, script)`
- Za svako `high`/`low` polje sa `suggestedValue` koje potiče iz DI tabelarne strukture
- Primeni transliteraciju na `suggestedValue` prema detektovanom `script`
- Upiši tekst unutar bounding box-a prazne ćelije (leva ivica + 2pt padding, vertikalni centar)
- Font size: `min(cellHeight * 0.6, 10)`, minimum 6pt
- Overflow: smanji font do 6pt, pa skrati tekst sa "…"

**Test:** Pokreni na eko-taksa obrascu sa test vrednostima iz profila (PIB, naziv, adresa). Sačuvaj kao `eko-taksa-filled.pdf`.

🛑 **STOP — pošalji Milanu `eko-taksa-filled.pdf`.** Proveriti:
- Da li su vrednosti vizuelno unutar odgovarajućih ćelija
- Da li ćirilica izgleda čitljivo
- Da li tekst nije pomeren, preklapa labelu, ili izlazi van ćelije

---

### Korak 5 — Overlay generator, Korak B (slobodne linije)

Dva pod-slučaja, implementiraj odvojeno:

**5A — AcroForm polja na flat PDF izgledu:** Koordinate dolaze direktno iz pdf-lib AcroForm ekstrakcije (x, y, w, h u pt) — nema konverzije, upisati direktno.

**5B — Čiste slobodne linije bez AcroForm strukture:**
- Detektovati `"____"` pattern u DI content-u ili horizontalne linije u `figures`
- Tekst pozicionirati **iznad linije** za 2-3pt
- Primeni iste font/overflow pravila kao Korak A

**Datum poseban slučaj:**
- Prepoznati po labeli (`датум`, `дана`, `године`, `period od`, `до`)
- Formatirati kao `DD.MM.YYYY.`
- Ako su tri odvojena polja (dan/mesec/godina) — razdvojiti vrednost

**Potpis poseban slučaj:**
- Prepoznati po labeli (`потпис`, `одговорно лице`, `директор`, `ovlašćeno lice`)
- **Nikad ne upisivati** — `state: 'manual'`, preskočiti u overlay generatoru

🛑 **STOP — pošalji Milanu PDF sa slobodnim linijama popunjen (npr. PK2-o-z1.pdf sa test vrednostima).** Proveriti datum format, da potpis polja ostaju prazna, i da tekst leži na liniji a ne ispod ili iznad nje.

---

### Korak 6 — Preview UI

Implementiraj `di-preview` stage u `ObraściClient.tsx`.

`PreviewView` komponenta mora prikazati:
- Renderovani PDF (browser `<iframe>` sa blob URL, ili slika po stranici)
- Editabilnu listu svih polja sa `suggestedValue` — korisnik može da izmeni vrednost ili isključi polje
- Posebnu sekciju za `manual` polja — lista vrednosti koje korisnik treba sam da upiše (nisu u PDF-u, samo kao podsetnik)
- Dugme "Preuzmi popunjeni obrazac" — **disabled** dok korisnik ne scrolluje do kraja liste ili eksplicitno potvrdi ("Pregledao/la sam i potvrđujem")

Dodati "Popuni automatski" dugme u postojeći `GuideView` koji vodi na `di-preview` stage.

🛑 **STOP — pokaži Milanu screenshot preview-a na PPDG-1S ili eko-taksi.** Proveriti da su sve tri sekcije (predlozi, manual podsetnici, dugme) vizuelno jasne i upotrebljive.

---

### Korak 7 — `/api/obrasci/generate-filled` endpoint

Implementiraj endpoint (detalji u sekciji 8.1 speca).

Flow:
1. Prima `{ documentId, confirmedFields }` — finalne vrednosti nakon preview-a
2. Preuzima originalni PDF iz Supabase Storage
3. Pokreće `fillTableCells` + `fillFreeLines` iz `pdfOverlay.ts`
4. Vraća popunjeni PDF kao binary response
5. Briše originalni fajl iz Supabase Storage **tek nakon uspešnog slanja response-a**

Error handling:
- Ako overlay generisanje ne uspe: ne briši originalni, vrati grešku sa jasnom porukom
- Ako Supabase brisanje ne uspe: logovati grešku ali ne fail-ovati response (korisnik je već dobio fajl)

🛑 **STOP — end-to-end test:** Upload eko-taksa → guide → preview → potvrda → download. Otvori preuzeti PDF i vizuelno potvrdi da su vrednosti tačno na mestu.

---

### Korak 8 — Validacija na 3+ obrasca

Pokreni end-to-end flow na minimum 3 obrasca koje Milan dostavi (mešavina tabelarnih i sa slobodnim linijama). Za svaki:
- Pokreni `run-calibration-test.mjs` i upiši ground truth pre auto-fill testa
- Vizuelno verifikuj popunjeni PDF
- Zabeleži sve edge case-ove koji nisu pokriven algoritmom

---

## Šta NE raditi u ovoj fazi

- Ne modifikovati Faza 1 pipeline bez eksplicitnog odobrenja
- Ne hardkodovati koordinate za specifičan obrazac
- Ne preskočiti Korak 2 (font embed) i koristiti `StandardFonts` za ćirilični tekst
- Ne implementovati download pre nego što preview radi
- Ne upisivati vrednost u potpis polja ni pod kojim uslovima
- Ne brisati originalni PDF pre uspešnog generisanja kopije
- Ne implementovati AcroForm direktno popunjavanje (van obima Faze 2 — sekcija 11 speca)

---

## Ako nešto ne štima

Ako overlay tekst vizuelno nije na pravom mestu (pomeren, preklapa sadržaj, izlazi van polja), **stani pre nego što nastaviš na sledeći korak**. Koordinatna greška koja prođe u Koraku 3 pokvariće sve što dolazi posle. Prijavi Milanu koji dokument, koje polje, i koliko je pomak — sa screenshotom ili PDF fajlom.
