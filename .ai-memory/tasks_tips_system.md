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
- [x] `dashboard-recommended` — na dashboardu, samo kad `featuredTools.length > 0`
- [x] `archive-email` — u ArchiveList, treći u ARCHIVE_TIPS sekvenci

## Arhitektura (za referencu)

- localStorage ključevi: `aisistent_tips_seen` (JSON niz ID-eva), `aisistent_tips_disabled` (bool)
- `TipSequence` — prikazuje prvi neviđeni tip iz prosleđene liste; svaki tip se vidi samo jednom
- `TipCard` — za mesta gde postoji tačno jedan tip (bez sekvence)
- Delay: 1500ms (default) — kartica se pojavljuje tiho nakon učitavanja stranice
- Pozicija: `fixed bottom-6 right-6 z-50`, 288px širina
