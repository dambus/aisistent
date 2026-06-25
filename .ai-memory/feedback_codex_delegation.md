---
name: feedback-codex-delegation
description: Kada i kako delegirati zadatke Codex MCP agentu
metadata: 
  node_type: memory
  type: feedback
---

Codex MCP server je integrisan u Claude Code (scope: user, dostupan svuda). Pravilo delegiranja:

- Claude autonomno procenjuje kada je zadatak prikladan za Codex (rutinska refaktorisanja, boilerplate, formatiranje, generisanje bez složene logike)
- Milan eksplicitno navodi kada želi da Codex odradi nešto konkretno
- Nema potrebe da se pita za dozvolu pre svakog delegiranja

**Why:** Milan želi da štedi Claude kapacitet za kompleksne zadatke sa logikom, a Codex koristi za "fizikalisanje".

**How to apply:** Za jednostavne, dobro definisane zadatke (dodavanje tipa, renaming, pisanje test skeleta, trivijalni CRUD) → delegiraj Codexu. Za arhitekturu, logiku, debugging, UI odluke → Claude zadržava.
