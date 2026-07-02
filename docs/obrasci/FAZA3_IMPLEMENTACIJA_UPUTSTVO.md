# Uputstvo za implementaciju — Faza 3 (za Claude Code)

Prati ovo uputstvo zajedno sa `FAZA3_WIZARD_TEMPLATE_BAZA.md`. Faza 1 i Faza 2 pipeline ostaju netaknuti — sve izmene su additivne.

---

## Pravila rada

1. **Radi korak po korak, jedan po jedan.** Ne diraj GuideView niti postojeći generate-filled endpoint dok wizard nije potvrđen izolovano.
2. **Na svakom 🛑 STOP checkpoint-u, zaustavi se i prikaži Milanu rezultat pre nastavka.**
3. **Nikad ne dodaj poslovnu logiku ili validaciju u wizard.** Polja su text input — ništa više. Aplikacija ne zna šta je ispravna vrednost za računovodstvena polja.
4. **Potpis polja su uvek read-only u wizard-u**, kao i u Fazi 2. Isti uslov, ista lista labela.
5. **Template baza keširа strukturu, ne vrednosti.** Nikad ne čuvati korisničke podatke (PIB, ime, adresa) u `form_templates` tabeli.
6. **Faza 2 flow (GuideView → auto-fill → download) mora ostati funkcionalan** u svakom trenutku tokom implementacije Faze 3.

---

## Redosled implementacije

### Korak 1 — Supabase šema i template lookup (izolovano)

Kreiraj tabelu i RLS politike prema sekciji 3.3 speca.

Implementiraj `lib/documentIntelligence/templateCache.ts`:
- `getTemplate(fingerprint): FormTemplate | null`
- `saveTemplate(fingerprint, data): void`
- `incrementHitCount(fingerprint): void`

Implementiraj fingerprint algoritam (sekcija 3.4 speca):
- page_count + first 500 chars DI content + acroform field count
- Koristiti `crypto.createHash('sha256')` — ne MD5

🛑 **STOP — testiraj fingerprint na eko-taksi i PPDG-1S:**
- Upload isti PDF dva puta — da li se fingerprint poklapa?
- Upload drugačiju kopiju istog obrasca (ako postoji) — da li se fingerprint poklapa?
- Pokaži Milanu hash vrednosti i potvrdu da lookup radi pre nastavka.

---

### Korak 2 — Detekcija sekcija

Implementiraj `lib/documentIntelligence/detectSections.ts` prema sekciji 4 speca.

Heuristika za naslov sekcije (bar 2 od 3 uslova):
- Tekst >80% caps karaktera
- Dužina < 80 karaktera
- DI styles sadrži bold (ako dostupno)

Fallback: grupiranje po stranici ako nema naslova.

Dodati ovaj korak u pipeline **posle** `matchFieldLabels`, **pre** `mapFieldsToProfile` — sekcija informacija ide u Claude prompt kao kontekst.

🛑 **STOP — pokreni na PPDG-1S i pokaži Milanu listu detektovanih sekcija.** Očekivani minimum: "1. ПОДАЦИ О ПОРЕСКОМ ОБВЕЗНИКУ", "2. ПОДАЦИ О РАДЊИ", "3. ПОДАЦИ О ДЕЛАТНОСТИ" i sl. Ako fallback na stranice umesto sekcija — debug pre nastavka.

---

### Korak 3 — WizardView komponenta (izolovano, bez integracije)

Implementiraj `components/obrasci/WizardView.tsx` prema sekciji 5 speca.

Props:
```typescript
interface WizardViewProps {
  sections: FormSection[];
  onComplete: (fields: GuideField[]) => void;
  onBack: () => void;
}
```

Ponašanje:
- Sekcijska navigacija (levi panel ili tab bar zavisno od screen width)
- Progress indikator "[2/7]" u headeru
- Svako polje: label + input (text, osim isInternal i potpis polja)
- "Generiši PDF" dostupan od prve sekcije, ne čeka popunjavanje svih polja
- Prazna polja ostaju prazna u outputu — ne upisivati placeholder tekst

**Razvijaj i testiraj izolovano sa mock podacima** (npr. 3 sekcije, 5-6 polja) pre integracije sa pravim pipeline outputom.

🛑 **STOP — pokaži Milanu screenshot WizardView-a sa mock podacima.** Proveriti: sekcijska navigacija, razlika između auto-fill i manual polja, dostupnost "Generiši PDF" dugmeta.

---

### Korak 4 — Integracija wizard-a u flow

Tek nakon potvrde Koraka 3.

1. Dodaj `di-wizard` stage u `ObraściClient.tsx` (posle `di-guide`)
2. Dodaj "Popuni sve" dugme u `GuideView.tsx` koje vodi na `di-wizard` stage
3. Poveži WizardView sa pravim `FormSection[]` iz pipeline outputa
4. Na "Generiši PDF" iz wizard-a — prosledi popunjena polja na postojeći `di-preview` stage, pa `generate-filled` endpoint

**Faza 2 flow mora ostati netaknut** — "Popuni automatski" dugme i direktan put do downloada ne sme biti promenjen.

🛑 **STOP — end-to-end test na PPDG-1S:**
- Upload → GuideView (auto-fill) → "Popuni sve" → WizardView (sekcije vidljive) → popuni par manual polja → "Generiši PDF" → preview → download
- Pokaži Milanu screenshot wizard-a sa stvarnim PPDG-1S podacima i finalni PDF sa unesenim vrednostima.

---

### Korak 5 — Template keš integracija u pipeline

Tek nakon što je wizard potvrđen u Koraku 4.

Ugradi template lookup u `/api/obrasci/di-analyze`:

```
1. Izračunaj fingerprint (delimičan DI poziv — samo prva strana)
2. Provjeri form_templates
3a. HIT → učitaj fields+sections, preskoči full DI + Claude poziv
3b. MISS → pokreni pun pipeline, sačuvaj u form_templates
```

**Kritično:** Delimičan DI poziv za fingerprint mora koristiti **istu API verziju i isti model** (`prebuilt-layout`, `2024-11-30`) kao full poziv — drugačiji model može dati drugačiji OCR output i pokvaren fingerprint.

🛑 **STOP — testiraj cache hit/miss:**
- Drugi upload istog obrasca mora biti vidljivo brži (nema DI + Claude poziva)
- Pokaži Milanu Supabase tabelu sa upisanim templateom i `hit_count` koji se povećava
- Verifikuj da output (lista polja i sekcija) iz keša identičan outputu iz punog pipeline-a

---

### Korak 6 — Template feedback

Dodati thumbs up/down u preview stage (posle wizard-a, pre downloada).

- Nije obavezan odgovor — korisnik može preskočiti i preuzeti
- Negativan odgovor: INSERT u `template_feedback(fingerprint, user_id, created_at)`
- Ne triggerovati automatski re-analizu — samo logovanje

Ovo je mali korak, implementirati ga zajedno sa Korakom 5.

---

### Korak 7 — Validacija na 3+ obrasca

Pokreni end-to-end flow (upload → wizard → PDF) na:
- PPDG-1S (veliki, višesekcijski, AcroForm)
- Образац 1 (manji, flat, tabela)
- Bar jedan novi obrazac koji Milan dostavi

Za svaki: verifikuj da sekcije izgledaju smisleno, da auto-fill vrednosti su tačne, da manual polja primaju unos i pojavljuju se u finalnom PDF-u.

---

## Šta NE raditi

- Ne dodavati validaciju ili poslovnu logiku u wizard polja
- Ne menjati Faza 2 GuideView → auto-fill → download flow
- Ne čuvati korisničke vrednosti (PIB, naziv, adresa) u `form_templates` tabeli — samo struktura obrasca
- Ne pokretati full DI poziv (sve strane) za fingerprint — samo prva strana
- Ne implementovati admin dashboard za template review (van obima, backlog)

---

## Ako nešto ne štima

- Fingerprint ne daje konzistentne rezultate → debug OCR content determinizam (DI može vraćati blago različit content za isti fajl u edge case-ovima — dodati normalizaciju: trim, lowercase, ukloniti whitespace pre hash-a)
- Sekcije ne detektuju naslove → proveri da li DI vraća `styles` za bold paragraphe na konkretnom obrascu; ako ne, spusti threshold na 1 od 3 uslova
- Wizard polja nisu u pravom redosledu unutar sekcije → sortirati po `page` pa po `y` koordinati (odozgo nadole)
