# Mapa dokumentacije — šta gde ide, kada se čita, kada se piše

*Meta-dokument. Cilj: ukloniti koliziju "šta je urađeno a šta nije" između sesija/mašina. Ako dodaješ novi dokument u projekat, prvo upiši ga ovde — u suprotnom će opet nastati drift.*

## Pravilo #1: STATE.md je jedini session-start read

Sve ostalo iz tabele ispod se čita **samo preko pointera iz STATE.md ili kada je tema fajla direktno relevantna za trenutni task**. Nikad "pročitaj sve na startu".

## Tabela: fajl → svrha → kad čitati → kad pisati

| Fajl | Svrha | Kad ČITATI | Kad PISATI |
|---|---|---|---|
| **`.ai-memory/STATE.md`** | Trenutni snapshot: status, gotovo-verifikovano, sledeći korak, blokeri, pointeri | **UVEK, prvo, na startu sesije** | **UVEK, na kraju sesije** (overwrite, ne append) |
| `PROGRESS.md` | Istorijski log svih sesija, append-only, hronološki | Samo kad STATE.md ili user pokaže na konkretnu liniju/sekciju; nikad u celosti | Dopisati kratak unos kad je nešto veće završeno (ne za svaku sitnicu) |
| `docs/BACKLOG.md` | Prioritizovana lista otvorenog rada (visok/srednji/nizak) | Kad biramo sledeći task, ili kad STATE.md uputi | Kad se task završi (skini/označi ✅) ili doda novi task |
| `docs/ARCHITECTURE.md` | Struktura app-a, API, baza | Pre izmene strukture/API/baze | Kad se struktura stvarno promeni |
| `docs/CONVENTIONS.md` | Konvencije koda | Pre pisanja bilo kog koda | Kad se konvencija promeni ili doda |
| `docs/PROMPT_GUIDE.md` | Kako pisati/menjati AI prompt fajlove | Pre izmene `lib/prompts/*` | Kad se prompt pattern promeni |
| `docs/DEVELOPER_GUIDE.md` | Kako dodati novi tip dokumenta | Pre dodavanja novog tipa dokumenta | Kad se proces promeni |
| `docs/BUG_TRACKER.md` | Poznati bugovi | Pre fixiranja bug-a (proveri da li je već prijavljen) | Kad se nađe novi bug ili reši postojeći |
| `docs/handover/*` | Istorijske specifikacije feature-a (neke gotove, neke buduće) | Kad radimo na specifičnom feature-u iz liste, ili STATE.md uputi | Novi handover doc pri planiranju velikog feature-a; status header (✅/🔴) kad se završi |
| `docs/handover/11-BRAINSTORM-FEATURES.md` | Banka ideja za sledeći feature | Kad biramo šta raditi sledeće | Kad se doda nova ideja ili se odabrana ideja skine sa liste |
| `docs/STRATEGIJA.md` | UX/pozicioniranje/tekstovi | Kad radimo na UX-u/copy-ju/pozicioniranju | Kad se strategija promeni |
| `.ai-memory/MEMORY.md` | Indeks sekundarnih memorija (preference, gotcha, user profil) | Kad je tema fajla direktno relevantna (npr. radimo sa Trello-om → pogledaj `reference_trello_board.md`) | Novi red kad se doda novi memory fajl ispod |
| `.ai-memory/project_*.md` | Detaljna istorija po temi (autofill, chatbot, handover progres...) | Samo kad je ta konkretna tema u fokusu i STATE.md/BACKLOG.md ne pokrivaju dovoljno detalja | Kad tema naraste dovoljno da zaslužuje sopstveni fajl (ne za svaku sitnicu — prvo probaj STATE.md) |
| `.ai-memory/feedback_*.md`, `reference_*.md`, `user_*.md` | Trajne preference/gotchas/ko-je-ko, ne project state | Kad je relevantno za trenutni task (npr. deploy → pogledaj `feedback_vercel_playwright_deploy.md`) | Kad korisnik da eksplicitan feedback ili se otkrije nov gotcha |
| `~/.claude/projects/.../memory/` (lokalna) | Isto što i `.ai-memory/*` ali NE git-sync — po mašini | Auto-učitano od strane harness-a (MEMORY.md index) | Uvek paralelno sa `.ai-memory/` pandan — pisati u OBA mesta |
| claude-mem opservacije | Sirovi log događaja iz transkripta, auto-injektovan na startu | Kao search alat kad treba "šta se tačno desilo i kada" — NE kao izvor trenutnog stanja | Automatski, van naše kontrole |
| `CLAUDE.md` | Meta-instrukcije za Claude Code (ovaj fajl upućuje na STATE.md) | Auto-učitan na svakoj sesiji | Kad se menja sam proces/flow (retko) |

## Anti-drift pravila

1. **STATE.md ne duplira prozu** — samo činjenica + pointer. Ako osećaš potrebu da pišeš pasus u STATE.md, taj pasus ide u PROGRESS.md, a STATE.md dobija jednu liniju + link.
2. **Svaka "gotovo" stavka u STATE.md ima proverljiv trag** (grep, komanda, URL) — ne gola tvrdnja.
3. **Jedan fakat, jedno mesto.** Ako je nešto već u BACKLOG.md kao ✅, ne prepisuj isto u STATE.md — samo pointer.
4. **Kraj sesije = obavezan overwrite STATE.md**, pre commit-a. Ako se ovo preskoči, sledeća sesija (druga mašina) počinje sa zastarelim stanjem — to je tačka gde je sistem dosad pucao.
5. **Novi dokument = nov red u ovoj tabeli.** Bez izuzetka.
