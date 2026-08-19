# www kanonikalizacija — 19. avgust 2026

Izvor: `docs/handover/2026-08-19-SEO fixes.md`, PROMPT 1 (najveći prioritet).

## Problem

GSC izveštaj (16.06–16.08.2026): 92 URL-a indeksirana duplo — `https://www.aisistent.rs/...` i
`https://aisistent.rs/...` kao odvojene stranice. www varijanta jača (210 stranica, 162 klika,
5106 impresija) naspram non-www (100 stranica, 27 klika, 1007 impresija) → **www.aisistent.rs
je sada kanonički domen.**

## Šta je promenjeno

1. **`next.config.ts`** — dodat `redirects()` sa `has: [{ type: 'host', value: 'aisistent.rs' }]`
   → 308 permanent redirect na `https://www.aisistent.rs/:path*`, path i query string očuvani.
   Ovo je app-level rešenje (nije middleware/proxy.ts, nije Vercel dashboard) — radi nezavisno od
   hostinga, testirano lokalno curl-om sa `Host:` headerom.
2. **`app/sitemap.ts`** — `BASE` konstanta promenjena na `https://www.aisistent.rs` (sve rute u
   sitemap-u sada www).
3. **`app/robots.ts`** — `sitemap:` polje pokazuje na `https://www.aisistent.rs/sitemap.xml`.
4. **22 `page.tsx` fajla** (svi tipovi dokumenata + `/`, `/pregled-ugovora`,
   `/test-samostalnosti`, dinamički `/obrasci/[slug]` i `/blog/[slug]`) — dodat
   `alternates: { canonical: '<www URL>' }` u metadata export, pored postojećeg
   `openGraph.url` (koji je takođe prebačen na www). Ovo je "odbrana u dubinu" — canonical tag
   radi nezavisno od redirect-a, čak i ako neko direktno linkuje non-www URL.
5. **27 fajlova ukupno, 31 zamena** `https://aisistent.rs` → `https://www.aisistent.rs`:
   svi `page.tsx` OG/canonical URL-ovi, `app/layout.tsx` (metadataBase + JSON-LD `url`),
   `app/api/send-document/route.ts` i `app/api/waitlist/route.ts` (linkovi u mejl footeru).
   `mailto:info@aisistent.rs` adrese namerno NETAKNUTE (email domen, ne www pitanje).

## Šta NIJE dirano

- `proxy.ts` (Next 16 middleware ekvivalent) — nije dirano, redirect je rešen na nivou
  `next.config.ts`, čist route matcher, nema kolizije sa postojećim auth redirect logikom.
- Sadržaj stranica (H1, telo teksta) — van obima ovog prompta.

## Verifikacija (ova sesija)

- `npx tsc --noEmit -p tsconfig.json` — čisto.
- `npx eslint <izmenjeni fajlovi>` — 5 grešaka/5 upozorenja, sve **potvrđeno pre-existing**
  (`git stash` + isti eslint poziv na master pre izmene → identičnih 5 grešaka na istim linijama).
- Lokalni dev server (`npm run dev`, Next 16.2.7), testirano `curl -H "Host: ..."`:
  - `Host: aisistent.rs` → `308`, `Location: https://www.aisistent.rs/<ista-ruta>` (testirano
    root, `/obrasci/pio-obrazac-m`, `/blog/profaktura-ili-faktura-kada-se-sta-salje?utm_source=test`
    — query string očuvan).
  - `Host: www.aisistent.rs` → `200`, nema redirect loop-a.
  - `/sitemap.xml` i `/robots.txt` — svi URL-ovi www.
  - `<link rel="canonical">` renderuje ispravno na statičkim i dinamičkim rutama
    (`/ugovor-o-radu`, `/obrasci/pio-obrazac-m`, `/blog/...`).

## NIJE urađeno / treba Milan

1. **Google Search Console** — proveriti/potvrditi preferred domain property za
   `www.aisistent.rs` (GSC danas nema "preferred domain" polje kao nekad, ali proveriti da je
   www property tip Domain ili URL-prefix ispravno podešen) i **ponovo poslati sitemap** nakon
   deploy-a.
2. **Vercel dashboard → Settings → Domains** — opciono, dodatna proverа: postaviti
   `www.aisistent.rs` kao primary domain (Vercel inače automatski radi redirect na primary domain
   na edge nivou, brže od app-level redirect-a). Nisam imao pristup Vercel CLI sesiji (token
   nevalidan, `vercel whoami` failed) da ovo uradim automatski — nije blokirajuće jer
   `next.config.ts` redirect radi nezavisno, ali edge-level je brži/jeftiniji za veliki broj hitova.
3. **Live test posle deploy-a** — `curl -I https://aisistent.rs/<bilo-koja-ruta>` protiv
   produkcije, potvrditi 308 pre nego što se izveštaj smatra rešenim.

## Sledeći promptovi u istom handover fajlu (nisu rađeni ove sesije)

- PROMPT 2 — CTR optimizacija (title/meta description) za 8 stranica.
- PROMPT 3 — audit kanibalizacije "ugovor o delu"/"ugovor o radu".
