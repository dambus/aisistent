---
name: user-milan
description: "Milan — product owner i developer AIsistent platforme, radi direktno u Claude Code CLI sa punim pristupom projektu"
metadata: 
  node_type: memory
  type: user
---

Milan je product owner i developer AIsistent (aisistent.rs) — srpska AI platforma za generisanje poslovnih dokumenata.

Radi direktno u Claude Code CLI — Claude ima pun pristup svim fajlovima i može slobodno čitati, pisati i izvršavati komande bez dodatnih instrukcija.

## Srpski jezik

Serbian grammar je hard requirement — Milan će korigovati lingvističke greške (npr. vokativ od "Jovan" je "Jovane"). Deterministički sistemi su preferirani nad AI-inferred deklinacijom. Koristiti `lib/utils/vocative.ts` i `lib/utils/rod.ts` — nikad oslanjati se na AI da "pogodi" pravilan oblik.

## Radne preference

- **Commit AND push zajedno** — svaki završen task mora uključiti i `git commit` i `git push`, nikad samo commit
- **Modal over stacked banners** — error UX koristi modals (shadcn Dialog), ne stacked error banners
- **Single source of truth** — key configs žive u dedicated fajlovima, ne duplikovani

## Testiranje

Manualno testiranje na produkciji: aisistent.rs (više tipova naloga).
