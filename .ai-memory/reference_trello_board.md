---
name: reference-trello-board
description: "Trello board za AIsistent — ID-jevi liste, kredencijali, kako se ažurira"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 587a84e8-9041-45bf-a86d-fdc733e3ceec
---

Trello board "AIsistent" (board ID `6a4b641685e747378acbddad`, URL https://trello.com/b/vnyfy9OY/aisistent) korišćen za vizuelni pregled taskova umesto CLI/markdown-a, jer je [[user_milan]] rekao da mu je teško da čita CLI/markdown stil.

**Liste (idList):**
- Backlog: `6a4b67b30b91bb376a922b86`
- U toku: `6a4b67b488b4fb35a615def9`
- Blokirano: `6a4b67b5bd938ed18b9b8b19`
- Urađeno: `6a4b67b56ae565b13c2a05bc`

**Kredencijali:** `TRELLO_KEY` i `TRELLO_TOKEN` u `.env.local` (gitignore-ovan). Token je "never expires" (`expiration=never`).

**Kako se ažurira:** Backlog markdown fajlovi (`docs/BACKLOG.md`, `docs/BUG_TRACKER.md`) ostaju izvor istine za detalje; Trello board je izveden prikaz na visokom nivou. "Urađeno" lista namerno NIJE 1:1 kopija celog "Završeno" spiska iz BACKLOG.md (bilo bi previše šuma) — samo skorašnji highlighti + pointer kartica ka markdown fajlovima za punu istoriju.

Kada se nešto završi/promeni status, ažurirati odgovarajuću Trello karticu (move između lista) uz izmenu markdown fajla — [[feedback_trello_encoding]] sadrži bitnu tehničku napomenu o tome KAKO se kartice kreiraju/ažuriraju bez korupcije teksta.
