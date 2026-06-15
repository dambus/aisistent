# AIsistent — Konvencije

Sva pravila koja važe kroz ceo projekat. Čitaj pre pisanja koda ili prompta.

---

## Kod

- **TypeScript svuda** — bez `any` tipova
- **Server Components** po defaultu — Client samo kada je neophodno (`useState`, event handlers)
- **Claude API ključ** SAMO serverside — nikad u client komponentama
- **Rate limiting:** max 10 poziva/sat po korisniku (u `/api/generate`)
- **Supabase RLS** na svim tabelama — uvek
- **Mobile-first UI** — Tailwind klase najpre za mali ekran

---

## Jezičke konvencije

- **Srpska latinica** uvek — bez ćirilice u generisanim dokumentima
- **`sanitizeText()`** — obavezan za svaki tekst koji ide u PDF (uklanja ćirilična slova)
- **Bez anglicizama** u UI tekstovima — "preuzmi" ne "download", "prijava" ne "login"
- **Vokativ** — `vocative.ts` za oslovljavanje korisnika

---

## Wizard polja

### Toggle polja
```typescript
// UVEK defaultValue: false — nikad null, nikad undefined
{ id: 'neka_opcija', type: 'toggle', defaultValue: false }

// U Zod shemi:
neka_opcija: z.boolean().default(false)
```

### Datumi
- **Zaglavlje dokumenta:** uvek prazno `___________`
- **Datum potpisivanja:** uvek prazno `___________`
- **Jedini auto-datum:** datum stupanja na snagu koji korisnik eksplicitno unese
- **AI ne sme da računa datume** — ako datum nije prosleđen, ostavlja `___________`

### Iznosi slovima
```
✅ ISPRAVNO: "sto dvadeset hiljada", "petsto hiljada", "dva miliona"
❌ POGREŠNO: "stodvadeset hiljada", "petstoniljada", "dvamiliona"
```
Svaka reč posebno. Iznos slovima mora tačno odgovarati iznosu ciframa.

### Broj ugovora
- Uvek opciono polje (`required: false`)
- Ako prazno → ne generiše se red "Broj:" u zaglavlju

### Placeholder tekstovi
- Text/textarea polja: uvek `placeholder: 'npr. ...'`
- Number polja: `helperText` sa jedinicom i opsegom
- Radio/dropdown: `tooltip` koji objašnjava opcije
- Toggle: `helperText` ili `tooltip`
- Date: `helperText`

### Rod zastupnika
Koristiti `lib/utils/rod.ts` za automatsku detekciju roda iz prvog imena.
Nikad ne hardkodovati muški ili ženski rod — uvek koristiti helper.

### Zakonska usklađenost
Svaki prompt koji generiše pravni dokument mora biti usklađen sa:
- Zakon o obligacionim odnosima (ZOO) — ugovori
- Zakon o radu (ZOR) — ugovor o radu
- Zakon o autorskim i srodnim pravima (ZASP) — ugovor o delu
- Zakon o zaštiti podataka o ličnosti (ZZPL) / GDPR — opšti uslovi
- Zakon o parničnom postupku (ZPP) — nadležnost suda

---

## PDF i DOCX

### Sinhronizacija
**Svaka promena u `AisistentDocument.tsx` mora biti primenjena i u `docxBuilder.ts`.**
Ovo je kritično — PDF i DOCX moraju biti identični.

### Potpisi po tipu dokumenta

**Dve strane (levo/desno):**
ugovor-o-radu, ugovor-o-delu, nda, ugovor-o-zakupu,
ugovor-o-saradnji-zajmu, punomocje, ponuda-klijentu

**Jedna strana (samo levo):**
pravilnik-o-radu, resenje-godisnji-odmor, preporuka

**Bez potpisa (`buildSigData` vraća `null`):**
poslovni-mejl, oglas-za-posao, opsti-uslovi,
odgovor-kandidatu, opis-proizvoda, bio-o-nama, zapisnik-sastanak

### Rod u potpisima
- Ugovor o radu: rod po imenu (kroz ceo dokument)
- Svi ostali: neutralni muški oblik, bez kose crte

### Labele u potpisima
- Bez kose crte: "Direktor" ne "Direktor/ica"

---

## Disclaimer

Svaki dokument mora imati tačno **jedan** disclaimer — u footeru PDF-a.

```
"Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao
polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja.
aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta."
```

**AI prompt NE SME da generiše disclaimer u telu dokumenta.**
Footer renderer ga dodaje automatski.

---

## companyFieldMap

Kada se doda novi tip dokumenta, mora se dodati entry u `lib/utils/companyFieldMap.ts`.
Vrednosti moraju odgovarati tačnim `id`-ovima wizard polja iz prompta.

```typescript
// ISPRAVNO — id mora biti isti kao wizard polje
'ugovor-o-radu': {
  naziv: 'firma',       // wizard polje id: 'firma'
  pib: 'pib',           // wizard polje id: 'pib'
  maticni_broj: 'mb',   // wizard polje id: 'mb'
}

// POGREŠNO — 'naziv_firme' ne postoji u wizard steps
'ugovor-o-radu': {
  naziv: 'naziv_firme', // BUG — ovo neće popuniti ništa
}
```

---

## Reminders

Svaki tip dokumenta ima reminder u `data/reminders.ts`:
- `type: 'warning'` — za pravne/poreske obaveze
- `type: 'info'` — za savete i preporuke
- `learnMoreUrl` — kada postoji relevantna stranica u aplikaciji

---

## Git i deployment

- Production branch: **`master`**
- Sve se pusha na `master` — Vercel automatski deployuje
- Commit poruke: `feat:`, `fix:`, `docs:`, `refactor:`
- Svaki task završava sa: build check → commit → push → izveštaj

---
*jun 2026. — ažurirati pri svakoj novoj konvenciji*
