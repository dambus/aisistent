---
name: tasks-tips-system
description: Taskovi za sistem kontekstualnih saveta — šta je urađeno, šta sledi
metadata:
  type: project
---

## Sistem saveta — status

Commit: `1f5e6df` — jun 2026.

## Urađeno

- [x] `hooks/useTip.ts` — `useTip`, `useFirstUnseenTip`, `useTipsSettings`
- [x] `components/ui/TipCard.tsx` — `TipCard` (jedan tip) + `TipSequence` (sekvencijalno)
- [x] Saveti u WizardForm: `wizard-company-autofill`, `wizard-draft-save`
- [x] Saveti u ArchiveList: `archive-nova-verzija`, `archive-kreiraj-slican`
- [x] `TipsSettingsCard` u podešavanjima — uključi/isključi + reset

## Sledeći saveti za dodati

- [x] `profile-logo` — u CompaniesTab, samo za Pro/Business/Agency (`canUseLogo`)
- [x] `dashboard-recommended` + `dashboard-kalkulatori` — TipSequence na dashboardu
- [x] `archive-email` — u ArchiveList, treći u ARCHIVE_TIPS sekvenci

## Urađeno — nastavak

- [x] `maxDocs` uslov — tip se preskače ako korisnik ima više dokumenata od praga
- [x] `minDocs` uslov — tip se preskače ako korisnik ima manje dokumenata od praga
- [x] `archive-search` — minDocs=5, maxDocs=25
- [x] `archive-version-badge` — samo kad postoji v2+ dokument, maxDocs=20
- [x] `dashboard-kalkulatori` — TipSequence sa dashboard-recommended

## Arhitektura (za referencu)

- localStorage ključevi: `aisistent_tips_seen` (JSON niz ID-eva), `aisistent_tips_disabled` (bool)
- `TipSequence` — prikazuje prvi neviđeni tip iz prosleđene liste; svaki tip se vidi samo jednom
- `TipCard` — za mesta gde postoji tačno jedan tip (bez sekvence)
- `TipDefinition.minDocs` / `maxDocs` — prag dokumenata za prikazivanje
- Uslovni tipovi (npr. badge, company autofill) — uslovno se dodaju u niz pre prosleđivanja
- Delay: 1500ms (default) — kartica se pojavljuje tiho nakon učitavanja stranice
- Pozicija: `fixed bottom-6 right-6 z-50`, 288px širina
