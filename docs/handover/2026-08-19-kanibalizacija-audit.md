# Audit kanibalizacije — "ugovor o delu" / "ugovor o radu" — 19. avgust 2026

Izvor: `docs/handover/2026-08-19-SEO fixes.md`, PROMPT 3.

## Sve stranice koje ciljaju "ugovor o delu" / "ugovor o radu"

| URL | Namera pretrage | Trenutni title/H1 |
|---|---|---|
| `/ugovor-o-radu` | Transakciona — generiši dokument | H1: "Ugovor o radu — generator za poslodavce u Srbiji" |
| `/ugovor-o-delu` | Transakciona — generiši dokument | H1: "Ugovor o delu — generator za freelancere i firme" |
| `/kalkulator-ugovora-o-delu` | Transakciona — izračunaj porez/neto | H1: "Kalkulator ugovora o delu — porez i doprinosi 2026" |
| `/blog/kako-napisati-ugovor-o-radu` | Informativna — how-to za poslodavce | "Kako napisati ugovor o radu — vodič za poslodavce u Srbiji" |
| `/blog/ugovor-o-delu-vs-ugovor-o-radu` | Odlučivanje — koji ugovor izabrati | "Ugovor o delu ili ugovor o radu — šta je bolje za vaš biznis?" |
| `/blog/razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` | Odlučivanje — koji ugovor izabrati | "Razlika između ugovora o radu i ugovora o delu" |
| `/blog/ugovor-o-delu-za-pausalca-vodic-2025` | Informativna, niša — paušalac specifično | "Ugovor o delu za paušalca — kompletni vodič 2025" |
| `/blog/ugovor-o-radu-na-odredjeno-vs-neodredjeno` | Informativna — određeno vs. neodređeno trajanje | "Ugovor o radu na određeno i neodređeno vreme — šta piše u dokumentu" |

Napomena: `library_forms` (obrasci biblioteka) nema nijedan unos koji cilja ove pojmove — nema
preklapanja sa te strane.

## Preklapanje — nalaz

**Generator/kalkulator trojka (`/ugovor-o-radu`, `/ugovor-o-delu`, `/kalkulator-ugovora-o-delu`)
je već dobro diferencirana** — H1 i fokus jasno razdvajaju "generiši ugovor o radu" /
"generiši ugovor o delu" / "izračunaj porez za ugovor o delu". Ovo NIJE izvor kanibalizacije.

**Stvarna kanibalizacija: `ugovor-o-delu-vs-ugovor-o-radu` i
`razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` su gotovo duplikat sadržaja.** Provereno kroz
DB (prva 400 karaktera `content_md`): oba članka počinju identičnom strukturom
("Osnovna razlika: Ugovor o radu zasniva radni odnos... Ugovor o delu je obligacioni odnos..."),
ista dilema-postavka u uvodu, ista H2 struktura ("Osnovna razlika"). Cilja se identičan upit
("razlika ugovor o delu i ugovor o radu" / "ugovor o delu ili ugovor o radu") sa suštinski istim
sadržajem pod dva različita slug-a i title-a. Ovo direktno objašnjava zašto ni jedan ni drugi ne
rangira dobro (GSC: `/ugovor-o-delu` pozicija 70.5, indirektno i članci trpe) — Google deli signal
između dve skoro identične stranice umesto da ga koncentriše na jednu.

Ostala 3 članka (`kako-napisati-ugovor-o-radu`, `ugovor-o-delu-za-pausalca-vodic-2025`,
`ugovor-o-radu-na-odredjeno-vs-neodredjeno`) imaju jasno različitu nameru (how-to, niša-paušalac,
određeno/neodređeno) — nema preklapanja.

## Update 19. avgust (isti dan) — Milan potvrdio, merge izvršen

1. **Sadržaj spojen** — pasus "Konkretan primer" (Marko/Ana/Jovan ilustracija) iz
   `razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` prenet u `ugovor-o-delu-vs-ugovor-o-radu`
   (ubačen posle "Poreska razlika", pre "Kada koristiti ugovor o delu" — most između teorije i
   praktičnih saveta). SQL `UPDATE ... content_md = replace(...)`, potvrđeno `LIKE '%Marko%'`.
2. **`razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu`** — `published = false` u `blog_posts`
   (produkcija). Ispada iz `getAllPostMeta()`/sitemap-a i iz "Nastavi čitanje" preporuka
   automatski (obe funkcije filtriraju `published = true`).
3. **`next.config.ts`** — dodat path-based 301/308 redirect
   `/blog/razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` → `/blog/ugovor-o-delu-vs-ugovor-o-radu`
   (isti `redirects()` blok kao www redirect, bez `has:` jer je path-specific na istom domenu).
4. Grep potvrdio da nijedan fajl u kodu nije hardkodovano linkovao stari slug — nema mrtvih
   internih linkova za popravku.

**Verifikacija:** lokalni dev server, `curl -H "Host: www.aisistent.rs"`:
   - stari URL → `308`, `Location: /blog/ugovor-o-delu-vs-ugovor-o-radu`.
   - `/sitemap.xml` više ne sadrži stari slug (`grep -c` → 0).
   - keeper stranica renderuje spojeni sadržaj ("Konkretan primer", "Jovan je dizajner" prisutni).
   - `npx tsc --noEmit -p tsconfig.json` čisto.

**NIJE urađeno:** produkcijski live test posle deploy-a (isto kao ostala 2 prompta — čeka deploy).

## Predlog plana (istorijski — pre potvrde, ostavljeno radi konteksta)

**Preporuka: spoji `razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` u
`ugovor-o-delu-vs-ugovor-o-radu`** (potonji ima bolji, intent-precizniji title i CTA-orijentisan
naslov — "šta je bolje za vaš biznis" cilja i informativnu i transakcionu nameru).

Koraci (za review, ne izvršeno):
1. Proveriti ima li `razlika-izmedju...` jedinstvenih pasusa/podataka vrednih zadržavanja —
   preneti ih u `ugovor-o-delu-vs-ugovor-o-radu` pre gašenja duplikata.
2. Postaviti 301 redirect `/blog/razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` →
   `/blog/ugovor-o-delu-vs-ugovor-o-radu` (ili `published = false` u `blog_posts` + redirect u
   `next.config.ts`, isti `has: [{ type: 'host', ... }]` obrazac kao www redirect, ali po path-u).
3. Ukloniti `razlika-izmedju...` iz sitemap-a (automatski, generiše se iz `getAllPostMeta()` —
   nema ručnog koraka ako se `published = false`).

**Alternativa ako Milan smatra da su dovoljno različiti:** eksplicitno diferencirati naslove i
prve pasuse (jedan ostaje "razlika" objašnjenje, drugi postaje čisto "koji izabrati za VAŠ
biznis" — odluka/kalkulacija fokus) — ali ovo zahteva prepisivanje dela sadržaja, ne samo
title/meta, pa nije urađeno bez potvrde (van granica ovog prompta — "samo meta title/description,
NE diraj glavni sadržaj").

## Šta JESTE urađeno ove sesije (bezbedno, bez brisanja/spajanja)

Dodata 2 interna linka koja su nedostajala u `relatedLinks` — obe promene su čisto aditivne,
`npx tsc --noEmit` i `npx eslint` čisti na oba fajla:

- **`app/ugovor-o-radu/page.tsx`** — dodat link ka `/blog/kako-napisati-ugovor-o-radu` (postojao je
  samo link ka "vs" članku, nedostajao je link ka how-to vodiču iako je namera direktno relevantna
  generator-posetiocu).
- **`app/kalkulator-ugovora-o-delu/page.tsx`** — dodat link ka
  `/blog/ugovor-o-delu-za-pausalca-vodic-2025` (kalkulator korisnici su često paušalci, taj vodič
  je bio potpuno neinkovan sa alatima).

**Namerno NEdirano:** `relatedLinks` na generator/kalkulator stranicama i dalje linkuju samo na
`ugovor-o-delu-vs-ugovor-o-radu` (ne i na duplikat `razlika-izmedju...`) — nisam dodavao link
equity ka stranici koja je kandidat za spajanje/gašenje, da ne bih ulagao u sadržaj koji možda
nestaje. Blog post template (`app/blog/[slug]/page.tsx`) već ima globalnu "Nastavi čitanje" sekciju
(nasumična 3 druga posta) i "Big CTA" footer sa linkovima ka `/ugovor-o-radu` i `/ugovor-o-delu`
na SVAKOM blog postu — blog→generator linkovanje već postoji sistemski, nije trebalo dirati.

## Sledeći korak (Milan)

Odluka o spajanju/redirect-u `razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu` — čeka potvrdu.
