# AIsistent — Vodič za promptove

Centralizovana pravila za pisanje, izmenu i debugovanje prompt fajlova.
Čitaj pre svake izmene u `lib/prompts/`.

---

## Struktura prompt fajla

Svaki fajl u `lib/prompts/` mora imati:

```typescript
// 1. System prompt
export const nazivSystem = `...`

// 2. Tip podataka
export interface NazivData { ... }

// 3. buildUserMessage funkcija
export function buildNazivMessage(data: NazivData): string { ... }

// 4. wizardSteps niz
export const wizardSteps: WizardStep[] = [ ... ]
```

---

## Obavezne sekcije u system promptu

Svaki system prompt mora sadržati:

### ## JEZIČKI STANDARD
```
Generiši dokument isključivo na srpskom jeziku, latiničnim pismom.
```

### ## SRPSKI JEZIK I DEKLINACIJA
```
Sve podatke korisnik daje u NOMINATIVU. Ti ih dekliniraš prema kontekstu.
Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška na suglasnik: Petar→Petra, Milan→Milana
Ženska na -a: Ana→Ane→Ani→Anu
```

### ## ŠTA NE RADIŠ
Ovo je najvažnija sekcija. Mora sadržati:

```
- Ne generiši naslov dokumenta kao prvi red (PDF ga dodaje automatski)
- Ne generiši prazan poslednji član — svaki naslov mora imati tekst ispod
- Ne dodaješ NIKAKVU napomenu ni disclaimer — footer ih dodaje automatski
- Ne izmišljaš podatke — ako polje nije prosleđeno, ostavi ___________
- Ne računaš datume samostalno — ako datum nije dat, ostavi ___________
- Iznose slovima piši razdvojeno: "sto dvadeset hiljada" ne "stodvadeset hiljada"
- Iznos slovima mora tačno odgovarati iznosu ciframa
```

Za ugovore sa dve strane, dodati i:
```
- Ne generiši sekciju potpisa — sistem je dodaje automatski
```

---

## buildUserMessage pravila

### Nominativ na kraju
`buildUserMessage()` mora završiti rečenicom:
```
"Svi podaci su u nominativu. Molim te da sve imenice, lična imena i
nazive firme dekliniraš ispravno prema gramatičkom kontekstu."
```

### Broj ugovora logika
```typescript
const brojUgovora = data.broj_ugovora
  ? `\n- Broj ugovora: ${data.broj_ugovora}`
  : ''
```

### Datum logika
```typescript
const datumZakljucivanja = data.datum_zakljucivanja
  ? data.datum_zakljucivanja
  : '___________'
```

### Opcioni elementi
```typescript
// Uvek proveravati pre uključivanja
${data.napomene ? `\n- Napomene: ${data.napomene}` : ''}
```

---

## Bugovi koje smo već rešili — ne ponavljati

Ovi bugovi su detaljno dokumentovani u `docs/BUG_TRACKER.md`.
Svaki novi prompt mora izbegavati iste greške:

| Bug | Rešenje |
|-----|---------|
| **SYS-01** Poslednji član bez teksta | Cleanup u parseru + zabrana u ŠTA NE RADIŠ |
| **SYS-03** Iznosi slovima spojeni | Eksplicitno pravilo sa primerima u ŠTA NE RADIŠ |
| **SYS-04** AI računa datume | Zabrana u ŠTA NE RADIŠ — uvek ostaviti `___________` |
| **BUG-007** Dupli naslov | Zabrana ponavljanja naslova u uvodnoj formuli |
| **BUG-024** Dupli potpis | Zabrana generisanja potpis sekcije u tekstu |
| **BUG-027** Dupli disclaimer | Zabrana generisanja disclaimera u tekstu |
| **AUDIT-01** | Zakonska neusklađenost | Svaki prompt prošao audit po relevantnom zakonu (ZOR, ZOO, ZASP, ZZPL, GDPR) |
| **AUDIT-02** | Wizard polja bez helper teksta | Wizard audit — sva polja moraju imati placeholder ili helperText |
| **AUDIT-03** | Rod zastupnika | lib/utils/rod.ts — koristiti za detekciju roda umesto hardkodovanog |

---

## wizardSteps konvencije

```typescript
{
  id: 'naziv_polja',        // mora odgovarati companyFieldMap entry-ju
  label: 'Vidljivo ime',
  type: 'text',
  required: true,
  placeholder: 'npr. Sigma Solutions doo',  // uvek počinje sa "npr."
  helperText: 'Kratko objašnjenje',
  tooltip: 'Duže objašnjenje kada je potrebno',
}
```

### Tipovi polja i obavezni atributi

| Tip | Obavezni atributi |
|-----|-----------------|
| text/textarea | `placeholder` (format: "npr. ...") |
| number | `helperText` sa jedinicom i opsegom |
| radio/dropdown | `tooltip` koji objašnjava opcije |
| toggle | `helperText` ili `tooltip` + `defaultValue: false` |
| date | `helperText` |

### showIf logika
```typescript
// Polje se prikazuje samo kada je uslov ispunjen
showIf: { field: 'tip_polja', value: 'vrednost' }
```

---

## PDV i poreski tretman

### Zakup poslovnog prostora
- Zakupodavac u sistemu PDV-a → obaveza PDV-a 20%
- Zakupodavac van sistema PDV-a → nema PDV-a
- Zakupodavac fizičko lice/paušalac → nema PDV-a, ali zakupac plaća porez po odbitku (~16%)
- Stambeni zakup → uvek oslobođen PDV-a (Zakon o PDV, član 25)

### Ugovor o delu — poreski tretman
- Fizičko lice: naručilac obračunava porez pre isplate
  - Poreska osnovica = bruto × 80% (normiran trošak 20%)
  - Porez = osnovica × 20%
  - Doprinos PIO = osnovica × 26%
  - Doprinos zdravstvo = osnovica × 10,3%
- Preduzetnik/firma: izvođač sam plaća porez, izdaje fakturu

---

## Checklist za novi prompt fajl

Pre commita, proveri:

- [ ] System prompt ima ## JEZIČKI STANDARD
- [ ] System prompt ima ## SRPSKI JEZIK I DEKLINACIJA
- [ ] System prompt ima ## ŠTA NE RADIŠ sa svim zabranama
- [ ] buildUserMessage() završava rečenicom o nominativu
- [ ] Sva toggle polja imaju `defaultValue: false`
- [ ] Sva text polja imaju `placeholder: 'npr. ...'`
- [ ] Dodat entry u `companyFieldMap.ts` (ako dokument ima firmu)
- [ ] Dodat entry u `data/reminders.ts`
- [ ] Dodat case u `buildSigData()` u AisistentDocument.tsx
- [ ] Isti case dodat u `docxBuilder.ts`
- [ ] Dodat u `SUPPORTED_TYPES` u page.tsx
- [ ] Dodat u `documentMeta` u WizardPageClient.tsx
- [ ] Dodat human-readable naziv u `documentTypes.ts`
- [ ] Dodat u Sidebar.tsx i dashboard/page.tsx

Kompletna lista u `docs/DEVELOPER_GUIDE.md`.

---
*jun 2026. — ažurirati pri svakom novom bugu ili konvenciji*
