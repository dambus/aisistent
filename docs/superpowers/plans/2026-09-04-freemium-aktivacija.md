# Freemium Aktivacija + Marketing Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Podići free-tier limit sa 3 na 10 dokumenata, preformulisati poruke oko cenovnika/waitlist-a u "test tržišta" okvir umesto "čekamo naplatu", i voditi living log svih promena za marketing (Claude Desktop sesija koja piše oglase).

**Architecture:** Ovo je isključivo config/copy izmena u postojećem Next.js App Router kodu — nema nove infrastrukture, nema migracija baze. Jedan izvor istine za limit (`PLAN_LIMITS` u `app/api/generate/route.ts`) se menja, a sva mesta koja taj broj prikazuju korisniku (profil, LimitsCard, cenovnik na `/` i `/upgrade`, onboarding) se ručno usklađuju jer trenutno nisu izvučena u zajednički konstantu. Copy promene idu kroz postojeće komponente (`WaitlistModal`, `UpgradeClient`) bez menjanja njihovog API contract-a. Marketing log je novi markdown fajl koji se append-uje (ne overwrite) nakon svakog taska.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS. Nema test runner-a za UI/config kod u ovom repou (playwright je dependency ali nema `test` script) — verifikacija je `npx tsc --noEmit` + vizuelna provera u browseru, po konvenciji iz `.ai-memory/STATE.md`.

**Spec:** Ova plan-sesija (analiza freemium konverzije, poređenje sa pausalko.rs, benchmarci) — nema odvojenog spec fajla, kontekst je u chat istoriji ove sesije.

## Global Constraints

- Free limit ide sa **3 na 10** dokumenata mesečno — svuda gde se pojavljuje broj "3 dokumenta mesečno" u UI kodu.
- Nijedna izmena ne sme pomenuti reč "naplata kasni" ili slično — okvir je uvek "test tržišta / rani korisnik", nikad "izvinjavamo se što ne radi plaćanje".
- Waitlist ostaje isti mehanizam (`/api/waitlist`, `WaitlistModal`) — menja se samo copy, ne funkcionalnost.
- Svaki task koji menja korisnički vidljiv tekst ili ponašanje MORA se upisati u `docs/marketing/MARKETING_HANDOFF.md` kao poslednji korak tog taska — to je isporuka za Claude Desktop sesiju.
- Anonimni (bez naloga) preview dokumenta pre registracije NIJE deo ovog plana — zahteva anonymous-session arhitekturu i watermark pipeline promene preko više PDF rendererа, dovoljno veliko da treba sopstveni brainstorming/plan. Ostaje kao "Sledeći plan" stavka.

---

## Task 1: Podigni free limit sa 3 na 10 dokumenata

**Files:**
- Modify: `app/api/generate/route.ts:727` (`PLAN_LIMITS.free`)
- Modify: `app/(dashboard)/profil/page.tsx:22` (`PLAN_INFO.free`)
- Modify: `components/dashboard/LimitsCard.tsx:8` (`DOC_LIMITS.free`)
- Modify: `app/upgrade/UpgradeClient.tsx:29` (free plan feature list)
- Modify: `app/page.tsx:73` i okolne linije gde piše "3 dokumenta mesečno" u cenovnik sekciji (proveriti tačan broj linije pre izmene — grep pokazao je pojavu oko linije 73 ali za `waitlistPlan`, treba naći tačan red sa "3 dokumenta")
- Modify: `app/onboarding/dobrodoslica/page.tsx:401`

**Interfaces:**
- Consumes: ništa iz drugih taskova
- Produces: novi free limit `10` koji Task 2 koristi u banner tekstu

- [ ] **Step 1: Nađi sva mesta gde je hardkodovan broj "3" kao free limit**

```bash
grep -rn "free.*3\|3.*dokument" app/api/generate/route.ts app/\(dashboard\)/profil/page.tsx components/dashboard/LimitsCard.tsx app/upgrade/UpgradeClient.tsx app/page.tsx app/onboarding/dobrodoslica/page.tsx
```

Zapiši tačne linije pre izmene — brojevi linija u ovom planu su orijentacioni (kod se mogao pomeriti od pisanja plana).

- [ ] **Step 2: Izmeni `app/api/generate/route.ts`**

```ts
const PLAN_LIMITS: Record<string, number | null> = {
  free:    10,
  starter: 20,
  pro:     null,
  agency:  null,
}
```

- [ ] **Step 3: Izmeni `app/(dashboard)/profil/page.tsx`**

```ts
const PLAN_INFO: Record<string, { label: string; desc: string; limit: number | null }> = {
  free:    { label: 'Besplatni plan', desc: '10 dokumenata mesečno',       limit: 10   },
  starter: { label: 'Starter plan',  desc: '20 dokumenata mesečno',       limit: 20   },
  pro:     { label: 'Pro plan',       desc: 'Neograničen broj dokumenata', limit: null },
  agency:  { label: 'Agencija plan', desc: 'Neograničen broj klijenata',  limit: null },
}
```

- [ ] **Step 4: Izmeni `components/dashboard/LimitsCard.tsx`**

```ts
const DOC_LIMITS: Record<string, number | null> = {
  free:    10,
  starter: 20,
  pro:     null,
  agency:  null,
}
```

- [ ] **Step 5: Izmeni `app/upgrade/UpgradeClient.tsx` — free plan features**

```ts
{
  id: 'free',
  name: 'Besplatno',
  price: 'Besplatno',
  features: [
    [true,  '10 dokumenata mesečno'],
    [true,  'PDF sa watermarkom'],
    [false, 'Email slanje'],
    [false, 'Word (DOCX) format'],
    [false, 'Brendiranje sa logom'],
  ],
  cta: 'Trenutni plan',
},
```

- [ ] **Step 6: Izmeni odgovarajući red u `app/page.tsx` (cenovnik sekcija na homepage) i `app/onboarding/dobrodoslica/page.tsx:401`**

Isti princip — zameni tekstualno "3 dokumenta" sa "10 dokumenata" u oba fajla. U onboarding fajlu trenutna rečenica glasi (oko linije 401):

```
Sa besplatnim nalogom možeš da generišeš 3 dokumenta mesečno i preuzmeš PDF.
```

Zameni sa:

```
Sa besplatnim nalogom možeš da generišeš 10 dokumenata mesečno i preuzmeš PDF.
```

- [ ] **Step 7: Proveri da nema drugih pojava broja "3" vezanih za free limit**

```bash
grep -rn "free:\s*3\b" --include=*.ts --include=*.tsx app components lib
```

Očekivano: nula pogodaka nakon izmena (osim ako neki fajl namerno referiše nešto nevezano za limit — proveriti svaki pogodak ručno).

- [ ] **Step 8: Type-check**

```bash
npx tsc --noEmit
```

Očekivano: bez grešaka.

- [ ] **Step 9: Vizuelna provera u browseru**

Pokreni dev server (`npm run dev`), uloguj se sa test free nalogom, proveri:
- `/profil` prikazuje "10 dokumenata mesečno"
- Dashboard `LimitsCard` prikazuje "X / 10"
- `/upgrade` free kolona prikazuje "10 dokumenata mesečno"
- `/` cenovnik sekcija prikazuje "10 dokumenata mesečno"
- `/onboarding/dobrodoslica` prikazuje ažuriranu rečenicu

- [ ] **Step 10: Upiši u marketing log (vidi Task 4 za format fajla — ako Task 4 još nije urađen, kreiraj fajl sada sa ovim prvim unosom)**

Dodaj u `docs/marketing/MARKETING_HANDOFF.md`:

```markdown
## 2026-09-04 — Free limit podignut sa 3 na 10 dokumenata

**Šta se promenilo:** Besplatni nalog sada dozvoljava 10 dokumenata mesečno (bilo 3). Vidljivo na /profil, dashboardu, /upgrade cenovniku, homepage cenovniku, onboarding-u.

**Zašto (za marketing poruke):** Freemium limit od 3 dokumenta je bio prejak — korisnici nisu stizali da isprobaju proizvod pre nego što udare u zid. 10 je dovoljno da neko realno proba 2-3 tipa dokumenta.

**Predlog za oglase:** Ako se pominje broj u oglasu ("prva 3 dokumenta besplatno"), ažurirati na "10 dokumenata besplatno mesečno" — jača poruka, ista suštinski cena za nas.
```

- [ ] **Step 11: Commit**

```bash
git add app/api/generate/route.ts "app/(dashboard)/profil/page.tsx" components/dashboard/LimitsCard.tsx app/upgrade/UpgradeClient.tsx app/page.tsx app/onboarding/dobrodoslica/page.tsx docs/marketing/MARKETING_HANDOFF.md
git commit -m "feat: podigni free-tier limit sa 3 na 10 dokumenata mesečno

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DpjuvyboHFA7PKzDfi3eeu"
```

---

## Task 2: "Test tržišta" banner + onboarding reframing

**Files:**
- Create: `components/dashboard/MarketTestBanner.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx` (ubaci banner)
- Modify: `app/onboarding/dobrodoslica/page.tsx` (dodaj rečenicu o test periodu odmah posle postojeće rečenice o free nalogu)

**Interfaces:**
- Consumes: ništa (samo statičan copy)
- Produces: `MarketTestBanner` komponenta bez props-a (default export), koju Task 3 ne dira ali koja treba da postoji pre finalne vizuelne provere celog plana

- [ ] **Step 1: Pogledaj postojeći stil banner/kartica komponente radi konzistentnosti**

```bash
grep -n "TipCard" -r components/ui/TipCard.tsx
```

Pročitaj `components/ui/TipCard.tsx` da preuzmeš isti vizuelni jezik (border, padding, boje) — banner treba da izgleda kao deo istog sistema, ne kao upadljiv popup/alert.

- [ ] **Step 2: Napiši `components/dashboard/MarketTestBanner.tsx`**

```tsx
'use client'

const PRIMARY = '#1B6B4A'

export function MarketTestBanner() {
  return (
    <div
      className="mb-6 rounded-2xl border px-5 py-4 text-sm"
      style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}
    >
      <p className="text-gray-700">
        <span className="font-semibold" style={{ color: PRIMARY }}>Trenutno smo u fazi testiranja tržišta</span>
        {' '}— svi planovi su privremeno besplatni na korišćenje u okviru limita. Kad krenemo sa
        naplatom, korisnici prijavljeni na listu čekanja dobijaju poseban popust.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Ubaci banner u dashboard**

Pronađi glavni render u `app/(dashboard)/dashboard/page.tsx`, importuj i ubaci `<MarketTestBanner />` neposredno iznad glavnog sadržaja (iznad liste dokumenata / grid-a alata), samo za korisnike na `free` planu — proveri gde se `profile.plan` već čita u tom fajlu (STATE.md i ranija provera pokazuju da se profil vuče server-side) i uslovi prikaz sa `{profile.plan === 'free' && <MarketTestBanner />}`.

- [ ] **Step 4: Dodaj rečenicu u onboarding**

U `app/onboarding/dobrodoslica/page.tsx`, odmah posle rečenice iz Task 1 Step 6, dodaj:

```
Ovo je period testiranja tržišta — javi nam se šta ti nedostaje, slušamo svaki predlog.
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Vizuelna provera**

Uloguj se kao free korisnik, proveri da se banner prikazuje na dashboardu i da nestaje kad je plan drugačiji od `free` (privremeno izmeni test nalog na `starter` u bazi da provериš uslovni render, pa vrati na `free`).

- [ ] **Step 7: Upiši u marketing log**

```markdown
## 2026-09-04 — "Test tržišta" banner na dashboardu + onboarding rečenica

**Šta se promenilo:** Free korisnici sada vide poruku na dashboardu: "Trenutno smo u fazi testiranja tržišta — svi planovi su privremeno besplatni..." Onboarding dobio dodatnu rečenicu istog tona.

**Zašto (za marketing poruke):** Umesto da odsustvo naplate deluje kao da platforma "nije gotova", framing je da je ovo namerna beta/early-access faza. Ovo se treba preslikati i u oglase — izbegavati "besplatno zauvek", koristiti "besplatno u fazi lansiranja / rani pristup".

**Predlog za oglase:** Formulacije tipa "Pridruži se ranim korisnicima dok je sve besplatno" ili "Rani pristup — pomozi nam da oblikujemo alat, koristi ga besplatno" umesto generičkog "počni besplatno".
```

- [ ] **Step 8: Commit**

```bash
git add components/dashboard/MarketTestBanner.tsx "app/(dashboard)/dashboard/page.tsx" app/onboarding/dobrodoslica/page.tsx docs/marketing/MARKETING_HANDOFF.md
git commit -m "feat: dodaj 'test tržišta' banner na dashboard i onboarding

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DpjuvyboHFA7PKzDfi3eeu"
```

---

## Task 3: Waitlist copy — od "čekamo naplatu" ka "javi nam interesovanje"

**Files:**
- Modify: `components/landing/WaitlistModal.tsx`
- Modify: `app/upgrade/UpgradeClient.tsx` (dugmad "Izaberite Starter" / "Izaberite Pro")

**Interfaces:**
- Consumes: `plan: 'starter' | 'pro'` prop (nepromenjen), `/api/waitlist` endpoint (nepromenjen)
- Produces: ništa novo — samo tekst

- [ ] **Step 1: Izmeni naslov i tekst u `components/landing/WaitlistModal.tsx`**

Zameni:

```tsx
<h2 className="text-xl font-bold text-gray-900">Plaćanje stiže uskoro</h2>
<p className="mt-3 text-sm leading-relaxed text-gray-600">
  Ostavite vaš email — bićete prvi obavešteni čim aktiviramo{' '}
  <strong>{PLAN_LABELS[plan]}</strong> plan. Kao zahvalnost, prvi mesec
  dobijate uz <strong>20% popusta</strong>.
</p>
```

sa:

```tsx
<h2 className="text-xl font-bold text-gray-900">Zainteresovani ste za {PLAN_LABELS[plan]} plan?</h2>
<p className="mt-3 text-sm leading-relaxed text-gray-600">
  Ostavite email da vam javimo čim plan bude dostupan za plaćanje —
  bez obaveze. Prijavljeni na listu dobijaju <strong>20% popusta</strong> na
  prvi mesec kad krenemo.
</p>
```

I dugme:

```tsx
{loading ? 'Šaljem...' : 'Javi mi kad bude dostupno'}
```

- [ ] **Step 2: Izmeni CTA labele u `app/upgrade/UpgradeClient.tsx`**

```ts
cta: 'Javi mi se kad bude dostupno', // umesto 'Izaberite Starter'
```
```ts
cta: 'Javi mi se kad bude dostupno', // umesto 'Izaberite Pro'
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Vizuelna provera**

Otvori `/upgrade`, klikni na Starter i Pro dugmad, proveri da modal prikazuje novi naslov/tekst/dugme i da submit i dalje radi (proveri mrežni poziv na `/api/waitlist` u browser devtools).

- [ ] **Step 5: Upiši u marketing log**

```markdown
## 2026-09-04 — Waitlist copy promenjen sa "čekamo naplatu" na "javi interesovanje"

**Šta se promenilo:** Modal i dugmad za Starter/Pro planove više ne zvuče kao checkout ("Izaberite Pro") nego kao izražavanje interesovanja bez obaveze ("Javi mi se kad bude dostupno").

**Zašto (za marketing poruke):** Waitlist prijava treba da bude niskorizičan čin (dobar signal namere platiti), ne odustajanje pred cenom. Stara formulacija je zvučala kao da nešto kupuješ pa te presretne "čekaj malo".

**Predlog za oglase:** Ne pominjati konkretne cene planova u top-of-funnel oglasima dok se ne pokrene naplata — umesto toga, oglas vodi na besplatan alat, a waitlist CTA se pojavljuje tek unutar app-a (soft, ne agresivno).
```

- [ ] **Step 6: Commit**

```bash
git add components/landing/WaitlistModal.tsx app/upgrade/UpgradeClient.tsx docs/marketing/MARKETING_HANDOFF.md
git commit -m "feat: waitlist copy — 'javi interesovanje' umesto 'čekamo naplatu'

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DpjuvyboHFA7PKzDfi3eeu"
```

---

## Task 4: Marketing handoff log — inicijalizacija i format

**Files:**
- Create: `docs/marketing/MARKETING_HANDOFF.md` (ako već nije kreiran u Task 1 Step 10 — ovaj task samo dodaje header/uputstvo na vrh fajla ako fajl već postoji, ili kreira ceo fajl ako se ovaj task izvršava pre Task 1-3)

**Interfaces:**
- Consumes: ništa
- Produces: konvencija formata koju Task 1-3 (i sve buduće sesije) prate — append-only sekcije, najnovije na dnu, svaka sa "Šta se promenilo / Zašto / Predlog za oglase"

- [ ] **Step 1: Proveri da li fajl već postoji (nastao u Task 1 Step 10)**

```bash
cat docs/marketing/MARKETING_HANDOFF.md 2>/dev/null || echo "NE POSTOJI"
```

- [ ] **Step 2a: Ako NE postoji — kreiraj ga sa header-om**

```markdown
# Marketing Handoff Log

Ovaj fajl je append-only dnevnik promena na proizvodu koje su relevantne za marketing poruke
(Instagram, LinkedIn, oglasi). Piše ga Claude Code sesija posle svake izmene, čita ga
Claude Desktop sesija kad priprema/ažurira oglase.

**Pravilo:** Nikad ne brisati stare unose, samo dodavati nove na dno. Svaki unos ima datum,
šta se promenilo, zašto, i konkretan predlog kako to preformulisati u oglasu.

---
```

- [ ] **Step 2b: Ako fajl VEĆ postoji (jer je Task 1 kreirao sa svojim prvim unosom) — proveri da ima header sa gornjim uputstvom na vrhu, dodaj ga ako nedostaje, ne diraj postojeće unose ispod**

- [ ] **Step 3: Commit (samo ako je ovaj task uradio izmenu koju Task 1 nije već commit-ovao)**

```bash
git add docs/marketing/MARKETING_HANDOFF.md
git commit -m "docs: inicijalizuj marketing handoff log format

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DpjuvyboHFA7PKzDfi3eeu"
```

**Napomena za izvršioca:** Ovaj task je namerno stavljen poslednji u redosledu pisanja, ali logički mora postojati PRE Task 1 Step 10 (koji upisuje prvi unos). Ako se plan izvršava strogo redom 1→2→3→4, Task 1 Step 10 kreira fajl bez formalnog header-a — Task 4 ga onda samo dopunjuje header-om na vrhu. Ako se koristi subagent-driven-development sa paralelnim taskovima, izvrši Task 4 PRE Task 1.

---

## Sledeći plan (van ovog scope-a)

Anonimni preview jednog dokumenta bez naloga (Deo #1 iz analize) zahteva:
- Anonymous rate-limiting po IP/fingerprint-u (trenutni `checkRateLimit` u `app/api/generate/route.ts:733` je po `user.id`, ne postoji za anonimne)
- Izmenu auth provere na početku `POST` handlera (`app/api/generate/route.ts:750`) da dozvoli anonimni put sa jasno drugačijim, strožim limitom
- Watermark logiku koja već postoji za free plan (spomenuto u `app/upgrade/UpgradeClient.tsx:30` — "PDF sa watermarkom") proveriti gde je implementirana u `lib/pdf/*Renderer.tsx` i primeniti isto na anonimni put
- Conversion CTA na "sačuvaj / ukloni watermark" koji vodi na signup sa već popunjenim podacima (da se ne gubi unet rad)

Ovo je dovoljno veliko da zaslužuje sopstvenu brainstorming sesiju pre pisanja plana.
