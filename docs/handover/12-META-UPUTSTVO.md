# Meta-uputstvo — kako raditi sa AI modelima na ovom projektu

*Za Milana: kako da zadaješ zadatke slabijim/budućim modelima. Za modele: obavezan protokol rada.*

## Protokol za svaki zadatak (za model)

1. **Pročitaj PRVO, po ovom redu:** `CLAUDE.md` → `.ai-memory/MEMORY.md` (+ relevantne memory fajlove) → `docs/CONVENTIONS.md` → dokument specifičan za zadatak (tabela u CLAUDE.md kaže koji)
2. **Ne pretpostavljaj strukturu** — proveri grep-om/čitanjem. Ovaj projekat ima neobične ali NAMERNE odluke (spisak u `docs/handover/01-TECH-DEBT.md` sekcija "Šta NE dirati")
3. **Posle svake izmene:** `npx tsc --noEmit -p tsconfig.json` mora biti čisto
4. **Commit odmah po celini** (feat/fix/docs/refactor prefiks, poruka na srpskom, commit+push zajedno — Milanova preferenca), ažuriraj `PROGRESS.md` na kraju sesije
5. **Verifikuj kroz stvarnu upotrebu**, ne samo build: generiši dokument, otvori PDF, klikni kroz flow. Za PDF vizuelnu proveru čitaj generisani PDF direktno (multimodalno) ili pymupdf render
6. **Kad nešto ne znaš — pitaj Milana**, ne izmišljaj. Posebno: pravna pitanja (formati obrazaca, zakonski tekstovi), plan/cene odluke, UX odluke

## Kako Milan treba da formuliše zadatke slabijem modelu

- **Jedan zadatak = jedna celina.** Ne "sredi DOCX i dodaj katalog" — dva zadatka, dve sesije ako treba.
- **Referenciraj handover fajl:** "Implementiraj katalog usluga po docs/handover/02-KATALOG-USLUGA.md" — uputstva su pisana da budu dovoljna.
- **Traži plan pre koda za sve netrivijalno:** "prvo mi reci šta ćeš menjati i gde, pa kad odobrim radi". Slabiji modeli greše najviše kad krenu odmah.
- **Traži verifikaciju eksplicitno:** "na kraju mi pokaži kako si proverio da radi" — inače će reći "gotovo" posle build-a.
- **Sumnjaj u velike diff-ove:** ako je izmena mnogo veća od očekivane, model verovatno pregazio nešto što ne razume. Traži objašnjenje svake izmenjene datoteke.
- **Nikad ne daj modelu da sam odluči o:** brisanju podataka u produkciji, izmeni RLS politika, izmeni cena/planova, go-live obrazaca bez tvoje vizuelne kontrole.

## Specifičnosti projekta koje modeli redovno promašuju

1. **Srpski jezik svuda** — UI tekstovi, error poruke, commit poruke; bez anglicizama (`docs/UI_TEKSTOVI.md`); generisani dokumenti LATINICOM (sanitizeText čisti ćirilicu)
2. **PDF i DOCX dupli renderer** — izmena u `AisistentDocument.tsx` gotovo uvek traži paralelnu u `docxBuilder.ts`
3. **Novi tip dokumenta = 6+ mesta** — `docs/DEVELOPER_GUIDE — Dodavanje novih tipova.md` ima checklist; ne preskakati companyFieldMap
4. **Plan gating je svuda i dupliran** — dok se ne uradi 01-TECH-DEBT stavka 1, promena plana = grep kroz ceo projekat (`PLAN_LIMITS|_PLANS`)
5. **Biblioteka obrazaca ≠ Upload&Fill** — biblioteka (`/obrasci`, library_forms) je kuriran, javan, bez AI na download; DI pipeline je samo kuratorski alat. Ne mešati.
6. **Kuracija ima STOP tačke** — publish nikad bez vizuelne kontrole test-fill PDF-a; go-live je Milanova odluka
7. **`master` je produkcija** — push na master = deploy na Vercel. Nema staging okruženja (stanje 5. jul). Za rizične izmene: testirati temeljno lokalno pre push-a.
8. **Windows okruženje** — skripte se pokreću kroz `npx tsx --tsconfig tsconfig.json`; child process spawn treba `shell: true`; putanje sa razmacima pod navodnicima

## Održavanje handover dokumentacije

Handover fajlovi (`docs/handover/`) su snapshot 5. jula 2026. Kad se nešto iz njih implementira: označiti u fajlu na vrhu ("✅ implementirano <datum>, vidi <commit>"), ažurirati BACKLOG. Kad realnost odstupi od uputstva — uputstvo je zastarelo, veruj kodu i ažuriraj dokument.
