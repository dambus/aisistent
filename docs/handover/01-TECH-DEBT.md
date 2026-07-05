# Tech Debt i poboljšanja koda — handover analiza

*Napisano 5. jul 2026. na osnovu čitanja celog codebase-a. Namenjen budućim AI sesijama i saradnicima — svaka stavka ima tačne putanje, obrazloženje i predlog rešenja. Redosled = prioritet.*

**Kako koristiti ovaj dokument:** svaka stavka je samostalan zadatak. Pre rada pročitati `docs/CONVENTIONS.md` i `docs/ARCHITECTURE.md`. Posle svake izmene: `npx tsc --noEmit -p tsconfig.json` mora proći čisto, pa commit po konvenciji (feat/fix/refactor prefiks, srpski jezik poruke).

---

## 1. Centralizovati plan-gating (duplirano na ~14 mesta) — VISOK PRIORITET

**Problem:** svaka API ruta i komponenta definiše svoju kopiju plan konstanti:
- `PLAN_LIMITS` u `app/api/contacts/route.ts:5`, `app/api/companies/route.ts:5`, `app/api/generate/route.ts:702`, `components/dashboard/ContactsTab.tsx:30`, `components/dashboard/CompaniesTab.tsx:44`
- `UPLOAD_PLANS = ['starter','pro','agency']` ponovljeno u 5 obrasci ruta (`app/api/obrasci/upload`, `fill`, `analyze`, `di-analyze`, `generate-filled`)
- `LOGO_PLANS = ['pro','agency']` u `app/api/export/pdf`, `export/docx`, `send-document`, `companies/[id]/logo`, `CompaniesTab`
- `FILLED_PLANS`, `DOCX_PLANS`, `VALID_PLANS` — još varijanti istog

`docs/CONVENTIONS.md` već dokumentuje da dodavanje plana zahteva izmene na 9 mesta — to je simptom ovog problema.

**Rizik danas:** promena cene/limita jednog plana zahteva ručno pronalaženje svih kopija; jedan promašen fajl = tiho nekonzistentno ponašanje (npr. UI dozvoli, API odbije).

**Rešenje:** novi fajl `lib/plans.ts`:
```ts
export const PLANS = ['free', 'starter', 'pro', 'agency'] as const
export type Plan = (typeof PLANS)[number]

export const PLAN_CONFIG: Record<Plan, {
  monthlyDocs: number | null      // null = neograničeno
  companies: number | null
  contacts: number | null
  improveDaily: number | null
  docxExport: boolean
  logo: boolean
  obrasciUpload: boolean
  filledLibraryDownload: boolean
}> = { ... }  // vrednosti prepisati iz postojećih ruta — proveriti svaku!

export function planAllows(plan: string, feature: keyof ...): boolean
```
Zatim zameniti svaku lokalnu konstantu importom. **Oprez:** vrednosti limita se razlikuju po ruti (free=1 company, free=3 docs...) — pažljivo prepisati iz svake rute ponaosob, ne pretpostavljati. Posle izmene ručno testirati: free nalog pokušava DOCX export (očekivano 403), starter kreira 2. firmu (očekivano odbijanje ako je limit 1)...

**Obim:** ~15 fajlova, mehanička zamena. Nizak rizik ako se vrednosti tačno prepišu.

---

## 2. In-memory rate limiting ne radi na Vercel serverless — VISOK PRIORITET

**Problem:** `app/api/generate/route.ts:701` i `app/api/improve/route.ts:14` drže `rateLimitStore = new Map<string, number[]>()` u module scope. Na Vercel-u svaka lambda instanca ima svoju mapu: pod paralelnim saobraćajem korisnik pogađa različite instance i limit se praktično ne primenjuje; na cold start se resetuje.

**Rizik:** zlonamerni korisnik može da izgeneriše neograničeno Claude poziva (trošak!). Mesečni limit dokumenata (`documents_this_month` u bazi) i dalje važi — ali pro/agency nemaju mesečni limit, pa je hourly rate limit jedina zaštita od abuse-a.

**Rešenje (izabrati jedno):**
- **(a) Supabase tabela** `rate_limit_events (user_id, route, created_at)` + upit `count where created_at > now() - interval '1 hour'`. Bez novih servisa, +1 DB poziv po zahtevu. Dovoljno za trenutnu skalu. Dodati i periodično brisanje starih redova (Supabase cron ili pg_cron).
- **(b) Upstash Redis** (`@upstash/ratelimit`) — ispravno rešenje za skalu, ali novi servis/trošak.

Preporuka: (a) sada, (b) kada dođe realan saobraćaj. Isti helper koristiti u obe rute + `report-outdated` (stavka 8).

---

## 3. `types/database.ts` ručno pisan — drift rizik — SREDNJI PRIORITET

**Problem:** ceo `Database` tip je ručno kucan, a `Company`/`Contact` interfejsi pri vrhu fajla su NEZAVISNE kopije (ne izvedeni iz `Database['public']['Tables']['companies']['Row']`). Nova migracija = tri mesta za ažuriranje (SQL, Database tip, convenience interfejs) — postojeći proces se oslanja na disciplinu.

**Rešenje:**
1. Generisati tipove: `npx supabase gen types typescript --project-id <id> > types/database.generated.ts` (ili `--local` uz pokrenut lokalni Supabase).
2. `types/database.ts` svesti na re-export + izvedene tipove: `export type Company = Database['public']['Tables']['companies']['Row']`.
3. Dodati u workflow (`docs/CONVENTIONS.md`): posle svake migracije regeneriši tipove.

**Oprez:** generisani tipovi mogu se razlikovati u detaljima od ručnih (npr. `string | null` vs `string`) — očekivati talas TS grešaka pri prelasku, rešavati jednu po jednu, NE gasiti strict.

---

## 4. PDF/DOCX renderer dupliran — `buildSigData` i sanitizacija — SREDNJI PRIORITET

**Problem:** `lib/pdf/AisistentDocument.tsx` (react-pdf) i `lib/pdf/docxBuilder.ts` (docx paket) nezavisno implementiraju: `buildSigData` switch (per-doc-type potpisnici), sanitizaciju generisanog teksta, header/footer logiku. `docs/CONVENTIONS.md` kaže "moraju se ručno držati u sinhronizaciji" — već je prijavljen DOCX bug (BACKLOG srednji prioritet: fali POVERLJIVO watermark, viseći naslovi).

**Rešenje:** izvući zajedničko u `lib/pdf/shared.ts`:
- `buildSigData(documentType, inputData)` — jedna implementacija, dva potrošača
- `sanitizeGeneratedText()` — jedna implementacija
- Blok-model već dele preko `markdownParser.ts` — dobro, ne dirati.
Renderovanje ostaje odvojeno (react-pdf vs docx API su suštinski različiti) — deli se samo ODLUČIVANJE (ko potpisuje, šta se briše iz teksta), ne rendering.

**Verifikacija:** generisati isti dokument u PDF i DOCX, uporediti potpisnike i sadržaj. Fixture-i postoje u `scripts/fixtures/`.

---

## 5. Dve gender-detect i dve vokativ implementacije — SREDNJI PRIORITET

**Problem:**
- `lib/utils/genderDetect.ts` (`detectGender`) i `lib/utils/rod.ts` (`getZastupnikRod`) — dva nezavisna detektora pola sa RAZLIČITIM exception setovima imena. Bug fix u jednom ne stiže u drugi.
- `lib/utils/vokativ.ts` (lookup nad `lib/data/vokativ.json`) i `lib/utils/vocative.ts` (rule-based sa hardcoded izuzecima) — dve vokativ implementacije.

**Rešenje:** konsolidovati u po jedan modul (`lib/utils/rod.ts` kao kanonski za pol, `lib/utils/vokativ.ts` za vokativ — lookup tabela je pouzdanija od pravila, rule-based zadržati samo kao fallback za imena van tabele). Pre brisanja: `grep` sve pozivaoce obe verzije i preusmeriti. Napisati mini test skriptu sa 20-30 imena (uključiti izuzetke iz OBA exception seta!) i proveriti da konsolidovana verzija vraća isto što i bolja od dve stare.

---

## 6. Transliteracija duplirana — NIZAK PRIORITET

**Problem:** puna implementacija u `lib/documentIntelligence/transliterate.ts`, manja nezavisna kopija u `lib/pdf/markdownParser.ts` (sanitizeText). Digraf pravila (lj/nj/dž) mogu da se raziđu.

**Rešenje:** `markdownParser.ts` da importuje iz `documentIntelligence/transliterate.ts`. Trivijalno, ali proveriti da manja kopija nema namerno drugačije ponašanje (npr. da li preskače emails/URL-ove isto).

---

## 7. `/api/generate` monolit (~800 linija) — NIZAK PRIORITET (radi, ne diraj bez razloga)

**Problem:** auth + rate limit + kvota + 20 Zod šema + Claude poziv + insert, sve u jednom fajlu. Dodavanje novog tipa dokumenta = editovanje ogromnog fajla.

**Rešenje (samo ako se već radi veliki refactor):** Zod šeme premestiti u prompt module (`lib/prompts/<tip>.ts` već ima systemPrompt/buildUserMessage/wizardSteps — prirodno mesto i za šemu). Ruta postaje: lookup modula po tipu → validate → generate. **Ne raditi ovo izolovano** — visok rizik regresije na 20+ tipova, nizak dobitak. Uraditi zajedno sa sledećim novim tipom dokumenta.

---

## 8. `report-outdated` endpoint bez zaštite od spama — NIZAK PRIORITET (nov, 5. jul)

**Problem:** `app/api/obrasci/library/[slug]/report-outdated/route.ts` je javan POST bez auth-a i bez rate limita — bilo ko može skriptom da naduva `outdated_reports`. Posledica je mala (kolona je samo signal kuratoru), ali lažni alarmi troše kuratorovo vreme.

**Rešenje:** kada se uradi stavka 2 (rate limit helper), dodati IP-based limit (npr. 3/dan po IP) na ovu rutu. Alternativa: dedupe po IP hash-u u posebnoj tabeli. Ne komplikovati preko toga.

---

## 9. `lib/libraryForms.ts` koristi `any` uz eslint-disable — NIZAK PRIORITET

**Problem:** `toMeta(row: any)` sa `eslint-disable` — krši projektnu konvenciju "bez any". Nastalo jer anon klijent nije tipiziran `Database` generikom.

**Rešenje:** `createClient<Database>(...)` (import iz `types/database.ts`) + tipizirati row kao `Pick<Database['public']['Tables']['library_forms']['Row'], ...>`. 10 minuta posla.

---

## 10. Wizard draft samo u localStorage — NIZAK PRIORITET (svesna odluka)

**Zapažanje:** draft autosave (`WizardForm`) ide u localStorage po tipu dokumenta — ne prati korisnika kroz uređaje i briše se sa browser podacima. Za sada dovoljno; ako korisnici prijave gubitak draftova, premestiti u `documents` tabelu sa `status: 'draft'` kolonom (migracija + filter u arhivi da draftovi ne zagađuju listu).

---

## 11. Sitne stvari (pokupiti usput, ne kao poseban zadatak)

- `scripts/curation/harvest-state.json` ključevi su URL-ovi sa URL-encoded ćirilicom — čitljivost loša, ali radi; ne dirati bez potrebe.
- `batch-curate.ts` poziva `curate-form.ts` kroz `execFileSync npx` sa `shell: true` (Windows) — radi, ali svaki propose plaća tsx startup (~2s). Ako batch od 40 postane spor, izvući `propose()` u deljeni modul.
- `.gitignore`-ovani `scripts/harvest/` PDF-ovi se gube između mašina — kurator mora prvo `harvest-sources.ts` na svojoj mašini. Dokumentovano u SKRIPTE_UPUTSTVO, samo podsetnik.
- Untracked fajlovi u root-u (`raw-field-labels.json`, `scripts/calibration-data.jsonl`, `scripts/extract-pdf-text.mjs`, `scripts/ppdg1s-field-map.json`) — ostaci kalibracije iz ranijih sesija; odlučiti: commit u `scripts/` ili obrisati.
- `supabase/snippets/Untitled query *.sql` — tri neimenovana snippeta u gitu; preimenovati ili obrisati.

---

## Šta NE dirati (namerno ovako)

- **Prompt moduli sa gramatikom u system promptu** (`lib/prompts/ugovor-o-radu.ts` uči Claude padežima) — neobično ali NAMERNO; deklinacija u kodu bi bila lošija. Ne "čistiti".
- **`fillLibraryForm` bez flatten** — PDF ostaje editabilan u Adobe-u, to je feature (spec Faza 4).
- **`form_templates`/`template_feedback` RLS bez policies** — namerno service-role-only tabele.
- **Dva Supabase klijenta po ruti** (session + admin) — namerni pattern: session za user-scoped, admin za cross-cutting.
- **semanticMapper pravila 5/6/8** (sub-komponente → null) — namerno konzervativna; menjati samo kroz plan u BACKLOG "granularniji profil" stavci.
