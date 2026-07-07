---
name: feedback-trello-encoding
description: "Ne koristiti bash read/curl --data-urlencode za srpski tekst (ćčžšđ, emoji) — koristiti Node.js fetch + URLSearchParams"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 587a84e8-9041-45bf-a86d-fdc733e3ceec
---

Nikad ne slati srpski tekst (dijakritike ćčžšđ ili emoji) ka spoljnim API-jima (npr. Trello) kroz bash `read` petlju + `curl --data-urlencode "$var"` na ovoj Windows/Git-Bash mašini — tekst se korumpira (dijakritike nestaju, emoji postaju literalni "%3F%3F", "&"/"—" ostaju kao literalni percent-kodovi umesto da se dekodiraju).

**Why:** Otkriveno 6. jul 2026. pri kreiranju [[reference_trello_board]] kartica — 25 kartica je prvi put kreirano sa potpuno pokvarenim tekstom (npr. "sačuvane" → "sacuvane", 🔴 → "%3F%3F"). Uzrok je encoding lanac bash `read` builtin-a + `--data-urlencode` na ovoj mašini/terminalu, ne Trello API.

**How to apply:** Za bilo koji API poziv (Trello, ili bilo koji drugi servis) koji uključuje srpski tekst ili emoji:
1. Napisati podatke u `.json` fajl preko Write tool-a (Write tool ispravno upisuje UTF-8 bez obzira na terminal codepage)
2. Napisati mali Node.js (`.mjs`) skript koji čita JSON i šalje HTTP zahteve preko `fetch()` + `URLSearchParams` (ispravno percent-enkodira UTF-8)
3. Pokrenuti `node script.mjs` — NE praviti bash petlju sa `read`/`curl --data-urlencode "$var"` za tekst sa dijakritikama.

Takođe: izbegavati `|| curl ...` fallback nakon pipe-a u bash (npr. `curl | python3 ... || curl ...`) — exit status pipeline-a je status POSLEDNJE komande, pa ako parser (python3 i sl.) ne postoji/padne, fallback se okine i duplira zahtev (desilo se isto 6. jul 2026. — 8 duplih Trello lista od 4 namenjene).
