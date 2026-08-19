# CTR optimizacija (title/meta description) — 19. avgust 2026

Izvor: `docs/handover/2026-08-19-SEO fixes.md`, PROMPT 2.

## Arhitekturni nalaz (pre implementacije)

6 od 8 ciljanih stranica su DB-backed (`library_forms`/`blog_posts` preko Supabase) i **nisu
imale odvojena meta polja** — `<title>` tag je bio izveden iz istih kolona (`title`/`short_name`/
`description`) koje se prikazuju i u H1/telu stranice. Direktna izmena tih kolona bi menjala
vidljiv sadržaj, što je prompt eksplicitno zabranio ("NE diraj H1 ili glavni sadržaj").

**Milanova odluka (upitan pre izmene):** dodati odvojene `meta_title`/`meta_description` kolone,
nullable, sa fallback-om na postojeće ponašanje. Čisto rešenje, bez diranja vidljivog sadržaja.

## Šta je promenjeno

1. **Migracija `supabase/migrations/20260819000001_add_meta_seo_fields.sql`** — primenjena na
   produkciju (`dgsuspjxegciwlzqpzxn`, `apply_migration`, `success: true`). Dodaje
   `meta_title text`, `meta_description text` (nullable) na `library_forms` i `blog_posts`.
2. **`lib/libraryForms.ts`**, **`lib/blog.ts`** — `LibraryFormMeta`/`PostMeta` interfejsi
   prošireni sa `metaTitle`/`metaDescription`, select upiti dopunjeni.
3. **`app/obrasci/[slug]/page.tsx`**, **`app/blog/[slug]/page.tsx`** — `generateMetadata` sada
   koristi `form.metaTitle ?? <stari template>` / `post.metaTitle ?? <stari template>` (isto za
   description). Kad je DB polje `null`, ponašanje identično kao pre — nema regresije za ostale
   stranice koje nisu u ovom zahvatu.
4. **`app/kalkulator-pausala/page.tsx`** — title/description direktno u kodu (H1 dolazi iz
   `TOOL_CONFIG` u `lib/config/tools.ts`, potpuno odvojeno od meta — bezbedno menjati direktno,
   bez DB-a).

## Nova meta title/description (staro → novo)

| Stranica | Staro title | Novo title | Novo description |
|---|---|---|---|
| `/obrasci/croso-ovlascenje-pravno-lice` | "Ovlašćenje CROSO obrazac — preuzimanje i popunjavanje \| AIsistent" (generički, ne pominje "pravno lice") | "CROSO ovlašćenje za pravno lice — besplatan obrazac" | "Preuzmite besplatan obrazac ovlašćenja za rad na CROSO portalu za pravno lice — popunjen podacima firme ili prazan PDF, spreman za potpis." |
| `/kalkulator-pausala` | "Kalkulator paušalnog poreza Srbija 2026 \| AIsistent" | "Kalkulator paušalnog poreza 2026 — obračun po delatnosti" | "Unesite šifru delatnosti i izračunajte tačan paušalni porez i doprinose za 2026. Besplatno, bez registracije, rezultat za par sekundi." |
| `/blog/profaktura-ili-faktura-kada-se-sta-salje` | "Profaktura ili faktura — kada se šta šalje \| AIsistent Blog" | "Profaktura ili faktura? Razlika i kada se šta šalje" | "Profaktura i faktura nisu isto — imaju različite namene i pravne posledice. Objašnjavamo razliku i kada da pošaljete koju, sa primerima iz prakse." |
| `/obrasci/apr-rezervacija-naziva` | "Rezervacija naziva obrazac — preuzimanje i popunjavanje \| AIsistent" | "Rezervacija naziva firme kod APR-a — besplatan obrazac" | "Obrazac za rezervaciju poslovnog imena pre osnivanja firme ili promene naziva. Rezervacija važi 60 dana. Besplatno preuzimanje PDF-a za APR." |
| `/obrasci/samoinicijativno-prijavljivanje` | "Samoinicijativno prijavljivanje obrazac — preuzimanje i popunjavanje \| AIsistent" | "Samoinicijativno prijavljivanje poreskog duga — obrazac" | "Obrazac za dobrovoljnu prijavu neprijavljenog ili nepotpuno prijavljenog poreskog duga Poreskoj upravi, pre kontrole. Besplatan PDF za preuzimanje." |
| `/obrasci/apr-izvod-privredna-drustva` | "Zahtev za izvod obrazac — preuzimanje i popunjavanje \| AIsistent" (ne pominje "privredna društva") | "Zahtev za izvod iz APR registra — privredna društva" | "Obrazac zahteva za zvaničan izvod o registrovanim podacima privrednog društva iz APR-a — za banku, tender ili poslovnog partnera. Besplatan PDF." |
| `/obrasci/brisanje-preduzetnika` | "Brisanje preduzetnika obrazac — preuzimanje i popunjavanje \| AIsistent" | "Brisanje preduzetnika iz APR registra — obrazac prijave" | "Registraciona prijava za brisanje preduzetnika iz registra privrednih subjekata kod Agencije za privredne registre. Besplatan obrazac za preuzimanje." |
| `/obrasci/apr-prijava-promene-privredna-drustva` | "Prijava promene obrazac — preuzimanje i popunjavanje \| AIsistent" (ne pominje "privredna društva") | "Prijava promene podataka firme kod APR-a — privredna društva" | "Obrazac za prijavu promene sedišta, naziva, zastupnika ili kapitala privrednog društva APR-u, u roku od 15 dana od promene. Besplatan PDF." |

Zajednički princip: stari `<title>` je bio generički template
(`${shortName} obrazac — preuzimanje i popunjavanje`) koji je gubio ključnu odrednicu
(npr. "pravno lice", "privredna društva") prisutnu u punom `title` polju — verovatno uzrok niskog
CTR-a jer korisnik u rezultatima pretrage nije mogao da potvrdi da je to TAČNO taj obrazac koji mu
treba (npr. postoji i verzija za fizičko lice/preduzetnika).

## Verifikacija (ova sesija)

- `npx tsc --noEmit -p tsconfig.json` — čisto.
- `npx eslint lib/libraryForms.ts lib/blog.ts app/obrasci/[slug]/page.tsx app/blog/[slug]/page.tsx app/kalkulator-pausala/page.tsx` — 1 greška, **potvrđeno pre-existing** (ista kao u www-kanonikalizacija handover-u, `<a>` vs `<Link>` na liniji 118, nepromenjena ovim zahvatom).
- Lokalni dev server, curl sa `Host: www.aisistent.rs`: `<title>` i `<meta name="description">`
  potvrđeni na sve 3 uzorkovane rute (`croso-ovlascenje-pravno-lice`, `kalkulator-pausala`,
  blog post) — renderuju novi tekst iz DB/koda.
- Ostale 4 DB-backed obrasci stranice (rezervacija-naziva, samoinicijativno-prijavljivanje,
  apr-izvod, brisanje-preduzetnika, apr-prijava-promene) — vrednosti upisane u DB istim SQL
  batch-om, potvrđeno SELECT-om posle UPDATE-a, nisu pojedinačno curl-ovane (isti kod path kao
  croso primer, nizak rizik).

## NIJE urađeno

- H1 provera — nijedna od ovih stranica nema H1/naziv koji bi trebalo menjati (H1 ostaje
  isti kao pre, kako je i traženo).
- Praćenje CTR-a pre/posle — tabela iznad služi za poređenje za par nedelja u Search Console-u
  (Milanov task, van obima ove sesije).
