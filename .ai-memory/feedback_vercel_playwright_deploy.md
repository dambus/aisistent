---
name: feedback-vercel-playwright-deploy
description: Vercel build tiho puca bez greške u logu — playwright postinstall Chromium download gotcha
metadata:
  type: project
---

Vercel deploy može da stane odmah posle "Cloning completed" bez ijedne linije greške u logu — build se tiho ubije. Uzrok (potvrđeno 10. jul 2026.): `playwright` je devDependency koju koristi samo `scripts/harvest-sources.ts` lokalno (nigde se ne importuje u `app/`/`lib/`), a ima `postinstall` hook koji preuzima Chromium (~300MB). Kad Vercel build cache promaši na `npm install`, taj download može da visi/predugo traje u build sandbox-u.

**Fix:** env var `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` u Vercel dashboard-u (Project Settings → Environment Variables, sva okruženja). Vercel-only podešavanje, ne ide u repo. Posle dodavanja, redeploy prolazi čisto.

**Why:** Playwright build-vreme Chromium download nije potreban za samu deployed Next.js app — samo za lokalne dev/harvester skripte.

**How to apply:** Ako se build ikad opet tiho zaustavi posle clone-a bez greške u logu — prvo proveriti da li je ovaj env var i dalje podešen na Vercel-u (npr. posle promene projekta, novog tima, ili reseta env varova).
