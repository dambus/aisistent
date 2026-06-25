---
name: reference-github-issues
description: "GitHub issues workflow — n8n kreira issues od user feedbacka pri ocenjivanju dokumenata, rešavamo ih po prioritetu"
metadata: 
  node_type: memory
  type: reference
---

GitHub issues na dambus/aisistent su automatski generisani od strane n8n-a kada korisnici ocenjuju dokumente u arhivi.

Workflow: korisnik oceni dokument → n8n uhvati event → kreira GitHub issue sa labelom `feedback` i `prompt-improvement`.

Za pregled issues koristiti:
`"C:\Program Files\GitHub CLI\gh.exe" issue list --repo dambus/aisistent --limit 50 --state open`

Prioritet je naveden u naslovu issue-a (visok/nizak prioritet). Rešavamo ih kako pristižu, bez sprint planiranja.
