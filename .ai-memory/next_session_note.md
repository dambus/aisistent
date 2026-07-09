---
name: next-session-note
description: Poruka za sledeću sesiju — UI bagovi (notifikacije/navbar/CTA) SVIH 6 taskova gotovo, centralni TOOL_CONFIG uveden
metadata:
  type: project
---

## Gde smo stali (10. jul 2026. — UI bagovi: notifikacije/navbar/CTA, svih 6 taskova gotovo)

Milan prijavio 3 baga sa dev/produkcije (zvono notifikacija se seče, navbarovi nekonzistentni po stranicama, kartice nemaju/imaju pogrešan CTA tekst). Napravljena lista od 6 taskova, urađeni redom kroz dve sesije. **Svih 6 gotovo, spremno za push.**

**Task 4-6 (ova sesija, 10. jul):**

4. **Centralni `lib/config/tools.ts`** — novi `TOOL_CONFIG: Record<slug, {label, desc, icon, landingHref?, dashboardHref, ctaLabel, ctaTitle?}>` za svih 25 tipova/alata + `HOMEPAGE_CATEGORIES`/`DASHBOARD_CATEGORIES`/`CALCULATOR_SLUGS` grupisanja. Zamenio ranije 3 nezavisno duplirana izvora (`app/page.tsx` toolCategories/toolLandingPages, dashboard `TOOL_CATEGORIES`, `Sidebar.tsx` navCategories/alatiCategory) koji su se međusobno razminuli (npr. NDA opis se razlikovao homepage vs dashboard). `lib/utils/documentTypes.ts` `TYPE_LABELS` sad izveden iz istog config-a. Svih 17 `app/<slug>/page.tsx` tool-landing ruta ažurirano da čitaju `ctaLabel`/`ctaTitle` iz `TOOL_CONFIG['<slug>']` umesto hardkodovanog stringa — ubuduće se CTA menja na jednom mestu.
5. **Per-tip CTA na homepage kartice** — `app/page.tsx` "Alati" grid sad prikazuje ikonicu + specifičan CTA po tipu ("Generišite ugovor besplatno", "Izdajte fakturu besplatno"...) umesto generičkog "Napravite dokument →" za sve.
6. **CTA tekst na dashboard shortcut kartice** — `app/(dashboard)/dashboard/page.tsx` "Preporučeno za vas" + kategorije kartice dobile red sa `tool.ctaLabel` ispod opisa (zeleno na hover), ranije samo ikonica+naslov+opis bez akcionog teksta.

Testirano: `npx tsc --noEmit` čisto posle svake izmene. Homepage grid i `/otpremnica` landing vizuelno potvrđeni u browseru (Chrome MCP) — ikonice i per-tip CTA renderuju ispravno. Dashboard kartice NISU vizuelno potvrđene u browseru (zahteva login, nema test kredencijala na ovoj mašini) — potvrđeno samo statičkom analizom (ista JSX šema kao već-potvrđeni homepage grid, tsc čist).

## Prethodna sesija (9. jul 2026., popodne — task 1-3)

**Završeno ovu sesiju (committed):**

1. **ChangelogBell (zvono) panel clipping — 3 odvojena uzroka, sva 3 fiksirana:**
   - Desktop: `components/dashboard/Sidebar.tsx` root div u `SidebarContent()` imao `overflow-hidden`, sekao `absolute left-0` panel (288px) unutar 260px sidebar-a. Fix: uklonjen `overflow-hidden` (scroll već izolovan u `.sidebar-scroll` divu).
   - Mobile: panel je `left-0` fiksno, ali mobile-header zvono je na DESNOJ ivici → panel izlazio van viewporta. Fix: `ChangelogBell` dobio `align?: 'left'|'right'` prop, mobile header koristi `align="right"`.
   - Mobile hamburger drawer je renderovao DRUGU instancu zvona (duplikat) — Milan primetio posle prvog fixa. Fix: `SidebarContent` dobio `showBell` prop, Sheet/drawer instanca `showBell={false}`.

2. **Mobile hamburger meni na `/blog` i `/blog/[slug]`** — nisu imale nikakav mobile nav (linkovi nestajali ispod `md:flex`, bez zamene). Dodat postojeći `components/landing/MobileMenu.tsx` + auth check (komponenta traži `isLoggedIn`).

3. **Konsolidacija navbara — Milan izabrao 5-link (landing) standard preko 3-link (blog/tool-page).** Nova deljena `components/landing/SiteHeader.tsx` (Kako radi/Alati/Obrasci/Cenovnik/Blog + login-svestan CTA + MobileMenu), zamenjeni svi 4 inline headera (`app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/landing/ToolLandingPage.tsx`). Anchor linkovi promenjeni na `/#kako-radi` stil (leading slash, radi i van landinga).
   - **Uzgred nađen i ispravljen stariji bag:** nijedna od 17 `app/<tool-slug>/page.tsx` stranica nikad nije slala `isLoggedIn` u `ToolLandingPage` — CTA je uvek pisao "Počnite besplatno" i ulogovanim korisnicima. Rešeno u korenu: `ToolLandingPage` je sad `async function` i sam računa `isLoggedIn` (`createClient().auth.getUser()`), prop uklonjen iz `ToolLandingPageProps` — ne zavisi više od toga da 17 fajlova nešto pošalju.

**Testirano:** `npx tsc --noEmit` čisto posle svake izmene; svaki fix vizuelno proveren u Chrome-u (1440x900 desktop + 390x844 mobile emulacija, chrome-devtools MCP) — zvono na oba viewporta + drawer bez duplikata, blog hamburger sa login-svesnim CTA, tool-page 5-link navbar + "Moji dokumenti" umesto "Počnite besplatno" dok ulogovan.

**Sledeće (task 4-6, nastaviti ovim redosledom):**

4. **Centralizovati tool metadata + CTA po tipu.** `lib/utils/documentTypes.ts` (`TYPE_LABELS`) je jedini centralizovani spisak 22 tipa, samo slug→label. Tool metadata (naslov/opis/ikonica/href) duplirana na 3 mesta bez zajedničkog izvora: `app/page.tsx` (`toolCategories`+`toolLandingPages`), `app/(dashboard)/dashboard/page.tsx` (`TOOL_CATEGORIES`), `components/dashboard/Sidebar.tsx` (`navCategories`+`alatiCategory`). Plan: proširiti `TYPE_LABELS`/novi `docTypes` config poljem `ctaLabel` — obrazac već postoji kao 17 hardkodovanih `ctaLabel="..."` propova u `app/<slug>/page.tsx` (npr. "Generišite ugovor besplatno", "Napišite oglas besplatno", "Otvorite kalkulator"), samo nije centralizovan.
5. **Per-tip CTA na landing kartice** — `app/page.tsx` hardkoduje generički "Napravite dokument →" za SVE kartice bez obzira na tip (ugovor/mejl/kalkulator). Zameniti specifičnim glagolom iz configa iz taska 4 (zavisi od njega).
6. **CTA tekst na dashboard shortcut kartice** — `app/(dashboard)/dashboard/page.tsx` kartice ("Preporučeno za vas" + kategorije) nemaju NIKAKAV akcioni tekst, samo ikonica+naslov+opis (potvrđeno vizuelno tokom testiranja task 1). Dodati CTA iz istog configa.

Odluka o tekstu CTA-a: razvrstati po alatima (ne generički isti tekst svugde) — obrazac iz task 3 nalaza već postoji u 17 tool-landing fajlova, samo ga centralizovati i proširiti na landing/dashboard kartice.

## Prethodna sesija (9. jul 2026., rano jutro — TipCard/changelog gotovi, redizajn alata pauziran)

**Završeno i pušovano ovu sesiju:**
1. TipCard u profilu za sačuvane kontakte (Starter+, kad nema kontakata) — backlog stavka "prezentovati featur korisnicima" (delimično, wizard tip je već postojao od ranije).
2. TipCard/TipDefinition dobio opcioni `href`/`ctaLabel`, `TipSequence` ga prosleđuje — postojeći tipovi (kalkulatori, biblioteka obrazaca, wizard kontakti) sad imaju klikabilan CTA.
3. TipCard vizuelno doteran (zeleni akcent na levoj ivici, jači obojen shadow) — ranije se stapao sa belom pozadinom.
4. **Changelog mehanizam** — `lib/changelog.ts` (statička lista najava, ručno dodaješ red), `hooks/useChangelog.ts` (localStorage seen-state), `components/dashboard/ChangelogBell.tsx` (zvonce sa bedžem u sidebar/mobile headeru, zamenilo statičan "NOVO" bedž na `/obrasci`).

**U toku, NIJE gotovo — redizajn stranica alata (`/ugovor-o-radu`, `/otpremnica`... svih 25+ landing stranica preko deljenog `ToolLandingPage.tsx`):**

Milan je tražio audit jer stranice "deluju flat i slop". Koristio `design-taste-frontend` skill za smernice. Nalazi (i dalje važe):
- Feature kartice su imale hardkodovan ✓ krug na svih 6 kartica, ignorišući `feature.icon` prop (dead code, isti bag klase kao `whyAisistent` ranije) — **ovo je POPRAVLJENO i vredi zadržati**, svaka kartica sad prikazuje svoju emoji ikonu iz postojećeg sadržaja.
- Dodat `RevealSection` (motion/react, scroll-reveal na feature karticama) — **dobro, Milan je rekao "animacije su ok"**.
- Hero sekcija je imala prazan prostor na stranicama bez `previewSlug` — pokušano popuniti generisanom slikom (fal.ai, `flux/dev`) preko novog `scripts/gen-hero-image.mjs`. **ODBAČENO — Milan: slika "izgleda kao da je neko pucao zelenim metkom u papir i zamalo promašio".** Loš prompt/kompozicija (wax seal + floating paper na gradijent pozadini nije upalilo vizuelno). Testirano samo na `/otpremnica` (`heroImage="/images/hero/ugovori.jpg"`), NIJE rollovano na ostale stranice.

**Šta ostaje otvoreno za sledeću sesiju:**
1. **Preispitati hero vizual pravac potpuno** — ili drugačiji prompt/stil (manje "3D render metak", možda flatnija ilustracija ili real photography stil), ili odustati od generisane slike i naći drugo rešenje za prazan hero prostor (možda samo bogatiji gradijent/mesh bez foto-realističnog objekta, ili sačekati sveže ideje).
2. `feature.icon` fix + `RevealSection` motion su OK i mogu ostati/rollovati dalje kad se hero reši — ne treba ih revertovati.
3. Nisu dirane: "Prednosti" sekcija (i dalje ponovljena ✓ lista, tamna pozadina) i "Pogledajte i" grid (identične kartice) — čekaju isti tretman kad se pravac razjasni.
4. `scripts/gen-hero-image.mjs` + `@fal-ai/client` ostaju u repou (funkcionalan alat, samo loš prompt ovog puta) — FAL_AI_API_KEY već u `.env.local`.
5. Pre nastavka: odlučiti da li ide image-gen pravac uopšte, ili redizajn rešava flat-cards/motion/spacing bez foto-realističnih generisanih slika (možda dovoljno + bezbednije).

## Prethodna sesija (8. jul 2026., marketing audit posle batch 8)

Milan tražio audit (page-cro skill) da li su vredni featuri dobro reklamirani na homepage/notifikacijama/landing stranicama, s obzirom da je biblioteka obrazaca danas skočila 51→234. Nalazi i popravke:

**Popravljeno:**
- Pricing kartice (sve 4: Besplatno/Starter/Pro/Agencija) nisu pominjale biblioteku obrazaca nigde — dodat red po planu (Besplatno: "preuzimanje praznih", Starter/Pro: "automatski popunjeno", Agencija: "po izabranom klijentu"). `pricing` const → `getPricing(obrasciCount)` funkcija, broj sad dinamički kao i homepage baner.
- Homepage "Alati" grid (18 tipova) nije uključivao 3 kalkulatora (postojali samo u footeru) — dodata kategorija "🧮 Besplatni kalkulatori", `toolLandingPages` mapa proširena. Eyebrow "18 tipova dokumenata" → "21 alat i tip dokumenta".
- Dashboard `TipSequence` nije imao nijedan savet o biblioteci obrazaca (samo `dashboard-recommended` + `dashboard-kalkulatori`) — dodat `dashboard-obrasci` tip, broj dinamički (`getAllLibraryForms()` fetch dodat u dashboard page).

**Popravljeno (9. jul):**
- `whyAisistent` mrtav kod fiksiran u `ToolLandingPage.tsx` — "Prednosti" sekcija je renderovala hardkodovan generički `positioningBenefits` niz umesto per-page `whyAisistent` prop-a (`void whyAisistent` na liniji ~249). Uklonjen hardkodovani niz, sekcija sad mapira `whyAisistent` direktno — svaka landing stranica (ugovor-o-radu, nda, kalkulatori...) sad prikazuje svoj specifičan sadržaj umesto identičnog generičkog teksta na svih 18 stranica. `tsc --noEmit` čisto.
- **4 nove landing stranice** za tipove koji su postojali samo u dashboard wizard-u bez javne promotivne površine: `/otpremnica`, `/putni-nalog`, `/ponuda-za-radove`, `/obavestenje-o-promeni-uslova`. Isti `ToolLandingPage` template kao ostalih 18 (h1/intro/features/whyAisistent/faqs/relatedLinks), sadržaj izveden iz `lib/prompts/*.ts` wizard polja i zakonskog konteksta (čl. 172-174 ZOR za obaveštenje). Homepage `page.tsx`: nova kategorija "📦 Komercijalni dokumenti" u `toolCategories` + `toolLandingPages` mapa proširena; eyebrow "21 alat..." → "25 alata i tipova dokumenata" (tačan zbir posle dodavanja). `sitemap.ts` proširen sa sve 4 nove rute. Bez `previewSlug` (nema hero preview slika za ove tipove — fallback na generički placeholder, isti kao kalkulatori/poslovni-mejl). Gramatička zamka nađena i ispravljena: `ToolLandingPage`-ov default `ctaTitle` templat ("Napravite {toolLabel} za 60 sekundi") pretpostavlja da je akuzativ = nominativ — tačno za muški/srednji rod (Putni nalog, Obaveštenje...) ali ne za ženski (Otpremnica → "Napravite Otpremnicu", Ponuda za radove → "...ponudu..."); eksplicitan `ctaTitle` override dodat za ta dva (isti pattern kao kod kalkulatora). Vizuelno potvrđeno u browseru (homepage grid + otpremnica landing + "Prednosti" sekcija sa page-specific sadržajem + navigacija sa homepage grid-a na landing stranicu). `tsc --noEmit` čisto, sve rute vraćaju 200.
- **Napomena za sledeći put:** `/faktura`, `/pravilnik-o-radu`, `/resenje-godisnji-odmor` NEMAJU javne landing stranice iako su tipovi dokumenta u dashboard wizard-u — ne linkovati na njih iz `relatedLinks` (proveravano ovom sesijom, popravljeno pre commit-a). Ako se ikad dodaju njihove landing stranice, ažurirati `relatedLinks` na postojećim stranicama da ih uključe.

**Nije popravljeno (zabeleženo, van scope-a ove runde):**
- 4 tipa dokumenta (otpremnica, putni-nalog, ponuda-za-radove, obavestenje-o-promeni-uslova) postoje u dashboard wizard-u ali nemaju NIKAKVU javnu promotivnu površinu (ni homepage grid, ni landing stranicu) — niži prioritet od kalkulatora jer su dashboard-only utility dokumenti, ne SEO/acquisition alati.
- Nema changelog/announcement mehanizma za postojeće korisnike (npr. email ili in-app banner kad biblioteka naraste) — sidebar "NOVO" bedž na `/obrasci` je statičan, ne prati stvarne promene.
- `TipCard`/`TipDefinition` nema podršku za link/CTA (samo tekst) — da bi savet o biblioteci vodio direktno na `/obrasci`, treba proširiti komponentu (nije urađeno, tip ostaje čisto informativan kao i ostali).

**Napomena:** `taskkill /F /IM node.exe` gasi SVE node procese na mašini (koristio ga za gašenje dev servera posle vizuelne provere) — ubuduće ciljano gasiti samo taj proces/port, ne sve node.exe.

## Prethodna sesija (8. jul 2026., batch 8 — flat ostaci: APR/CROSO/PIO)

**Biblioteka = 234 obrasca** (bilo 214). Dovršeni svi poznati flat ostaci preko `catalog-flat-forms.ts` (proširen: `CATEGORY_BY_SOURCE`/`INSTITUTION_BY_SOURCE` mapa po sourceId, više nije hardkodovano na Poresku upravu):
- **apr-privredna-drustva** (1 od 2 preostala flat): "Zahtev za uvid u spise i izdavanje kopija dokumenata" objavljen. Drugi (`_-_.pdf`) je zapravo **Korisničko uputstvo — Digitalno potpisivanje** (dekodirano ime fajla otkrilo da nije obrazac nego uputstvo) — isključen, ne obrazac.
- **CROSO** (5 od 6 preskočenih flat): ovlašćenje FL, 3 uverenja (povraćaj poreza/doprinosa, dozvola za rad, rad u inostranstvu), zahtev za izvršitelje. Isključen: stari `ovlascenje_pl_26112013.pdf` (ne-fillable) — već imamo noviju AcroForm verziju live (`croso-ovlascenje-pravno-lice`), duplikat bez vrednosti.
- **PIO** (svih 14 relevantnih od 18 flat): kompletan M-obrazac set (M, M-4, M-4K, M-4/SP, M-4UN, M-6, M-7/PS, M-8, M-8UN, M-8/SP, M-10, M-UN, PSKP) + "Zahtev za predaju prijava M-4/M-4K/M-4SP". Isključena 4: 2 ISO politike (kvaliteta/bezbednosti) + 2 ISO sertifikata — nisu obrasci, institucionalna dokumenta.

Za PIO M-obrasce, pravi opisi (namena) izvučeni sa same stranice (pio.rs/sr/matichna-evidencija ima kratak opis pored svakog koda) umesto nagađanja iz kriptičnog imena fajla — pouzdanije za Claude meta-draft.

## Prethodna sesija (8. jul 2026., batch 7 — Poreska uprava, flat obrasci kao referentni download)

**Biblioteka = 214 obrazaca** (bilo 73). Poreska uprava (`poreska-pravna-lica` + `poreska-preduzetnici`, oba `renderJs: true` — sajt razrešava PDF linkove tek u browseru, CMS "box" shortcode ostaje kao HTML komentar u plain fetch-u) — **ceo katalog je flat, 0 AcroForm**. Od ~157 unikatnih (dedup po sha256) izbačeno 15 (common-sense filter: diplomatski/konzularni, putnički PDV povraćaj, crkva/verska zajednica, kupac (prvog) stana, "za lične potrebe nosioca prava"/"službeni nalog bez PDV/akciza" — sve diplomatska/personal-use izuzeća, ne poslovni obrasci; plus "Prijava za evidentiranje obveznika PDV" — e-only od 2020). Preostalih 142 katalogizovano i objavljeno.

**Politička promena (Milan, 8. jul):** flat obrasci sad ULAZE u biblioteku BEZ pokušaja autofill-a — čist download, napomena na sajtu "ne može se automatski popuniti". Ranije pravilo ("samo AcroForm, flat odbijen — OPD lekcija") ostaje za autofill-pokušaje (overlay-fill na flat nije editabilan u Adobe-u), ali čist referentni download je druga stvar — vrednost je da korisnik SVE obrasce nađe na jednom mestu. `curate-form.ts publish` gate promenjen: flat prolazi ako `fields` prazan (flat sa mapiranim poljima i dalje odbijen — overlay-fill se ne pokušava).

**Frontend:** `LibraryFormMeta.hasAutofill` (izvedeno iz `fields.length > 0`) — kad je false: "Preuzmi popunjeno" dugme sakriveno, "Kako radi" sekcija ima drugačiji tekst (bez pominjanja editabilnih polja), download API vraća 400 na `?filled=1` ako nema polja (odbrana i na server strani).

**Novi alat — `scripts/catalog-flat-forms.ts`:** za institucije čiji je ceo katalog flat (nema smisla trošiti DI/Claude-field-mapping po obrascu kad se svejedno ništa ne mapira) — uzima STVARAN naziv obrasca sa izvorne stranice (ne kriptično ime fajla), Claude piše samo title/short_name/description, `fields: []`, publish+go-live odmah (nema šta vizuelno proveriti). Input JSON: `{label, url, sourceId, filename, pages, type}[]`.

**Bag nađen i ispravljen (9+2 slučaja, uklj. 2 STARA iz batch 4/5 koja su promakla tada):** Claude/transliteracija ume da ostavi pokoje ćirilično (ili čak potpuno strano, npr. telugu) slovo usred latiničnog teksta (npr. "dobитke" umesto "dobitke", "zadругama" umesto "zadrugama"). **Novo pravilo:** posle svakog batch-a skenirati sve `.curation.json` meta polja (title/short_name/description) regexom za karaktere van `[a-zA-Z0-9šđčćžŠĐČĆŽ + interpunkcija]` — ne osloniti se na vizuelnu proveru, ovo se lako previdi u dužem tekstu. Ako se nađe, ispraviti I lokalni `.curation.json` I ponovo pokrenuti `publish`+`go-live` (upsert na slug, `publish` uvek postavlja `published:false` pa treba go-live ponovo).

**Harvester renderJs opcija** (trajno, `sources.json` + `harvest-sources.ts`): `"renderJs": true` na izvoru → Playwright render umesto plain fetch, za sajtove koji PDF linkove ubacuju tek JS-om (purs.gov.rs pattern). Koristi postojeći `playwright` dependency.

## Prethodna sesija (8. jul 2026., batch 6 — CROSO/PIO/RFZO/apr-preduzetnici)

**Biblioteka = 73 obrasca** (bilo 51). Dodato: CROSO ovlašćenje pravno lice (+1), APR preduzetnici (+21, svih 21 AcroForm kandidata sa te stranice). PIO izvor dodat ali doneo 0 kandidata (18 flat, čeka flat→AcroForm). RFZO izvor proban pa **potpuno izbačen** — harvest doneo samo medicinske/pacijent-facing obrasce, nisu za naše korisnike (uklonjen iz sources.json, harvest-state.json, kategorija u kodu, docs; stari OPD-o flat dev-artefakt obrisan). apr-udruzenja provereno — 0 novih (sve preklapanje sa apr-privredna-drustva).

**Preklapanje apr-preduzetnici vs apr-privredna-drustva:** 8 od 29 linkova bukvalno isti fajl (6 već publikovano, 2 flat) — nula dodatnog posla. Preostalih 21 su pravi PR-specifični obrasci (Dodatak_XX_PR, JRPPS PR Osnivanje, registracione prijave/zahtevi za preduzetnike) — svi kurirani.

**Dva trajna bugfixa u `batch-curate.ts` (ne samo za ovu rundu):**
1. Statički "www." prefiks pre input boxa (Dodatak 16 PR, isti bug kao Dodatak 31 iz batch 5) → website mapiranje se sad ručno skida kad god se ponovi.
2. Slug kolizija kad Claude izbaci PR/PS sufiks iz short_name (pogodilo dodatak-03/10/17 danas, isti bag klase kao "jrpps" kolizija iz batch 4) → **trajno fiksirano**: slug se sad izvodi i iz imena fajla (regex na `_PR_`/`_PS_` token), ne samo iz Claude draft-a. Provereno da ne duplira sufiks ako short_name već sadrži token (jrpps-pr-osnivanje-pr edge case ulovljen i fiksiran).

**JRPPS PR Osnivanje** — isto pravilo kao ostale JRPPS osnivačke forme (batch 4/5): nov subjekat, profileKey prefill ručno skinut sa svih 9 auto-mapiranih polja.

Anthropic API kredit se ispraznio nasred batch-curate rande (7 od 21 kandidata palo na "credit balance too low") — Milan dopunio, nastavljeno bez gubitka rada (batch-curate preskače već-predložene fajlove).

## Prethodna sesija (8. jul 2026., batch 4+5)

**Biblioteka = 51 obrazac** (bilo 28, +10 pa +13 — svi AcroForm kandidati iz `apr-privredna-drustva` izvora sad kurirani). Batch 4 (+10): dodatak-12/13/14/15, jrpps-akcionarsko-drustvo, jrpps-javno-preduzece, jrpps-kd, ogranak-stranog-drustva, jrpps-ortaci, predstavnistvo-stranog-drustva. Batch 5 (+13): dodatak-03/07/17a/17b/18/27/28/31, jrpps-doo, jrpps-zadruga, jrpps-zadruzni-savez, prijava-brisanja-ps, zahtev-za-pristup-informacijama. **Preostalo samo 2 flat kandidata** (bez AcroForm polja, van batch-curate.ts obuhvata — `Zahtev_za_uvid_u_spise_i_izdavanje_kopija_dokumenata.pdf` i jedan bez čitljivog imena `_-_.pdf`, treba ručno pogledati izvor pre kuracije).

**Batch 5 dodatna pravila:** `prijava-brisanja-ps` (brisanje POSTOJEĆEG subjekta iz registra) je normalan prefill kandidat — nije osnivačka forma, mapirana polja vizuelno tačna. `zahtev-za-pristup-informacijama` (ZOI zahtev) NIJE forma o privrednom subjektu — mapirana polja (`grad` iz boilerplate "У ___", `zastupnik` iz imena podnosioca) preslaba/pogrešnog konteksta, skinuta, ide kao referentni PDF.

**Bug #2 — statički "www." prefiks (Dodatak 31):** polje "Интернет адреса" ima odštampan "www." tekst odmah pre input boxa; `company.website` u profilu nema garantovan format (može već sadržati "www." ili "https://") pa je test-fill dao "www. www.testnafirma.rs". Mapiranje skinuto. **Novo pravilo: NIKAD ne mapirati `website` na polje čija je labela bukvalno "www." — profil ne garantuje bare-domain format.**

**Novo pravilo kuracije (dodati u spec 6.1): JRPPS "Registraciona prijava" forme (osnivanje NOVE firme — akcionarsko/javno preduzeće/komanditno/ortačko/DOO/zadruga, ogranak/predstavništvo stranog društva) NIKAD ne dobijaju profileKey prefill.** Auto-mapper (isti semanticMapper koji radi za amandmanske Dodatak forme) je na ovoj rundi predložio `naziv`/`maticni_broj`/`delatnost` iz sekcije "ПОСЛОВНО ИМЕ" — ali to je naziv firme koja se TEK osniva, ne postojeći profil korisnika. Prefill bi upisao pogrešan naziv u polje za novu firmu — direktno krši postojeće pravilo "prefill samo za postojeći subjekat". Svih 6 JRPPS formi ove runde objavljeno kao referentni PDF (profileKey mape ručno skinute pre publish-a). Isto pravilo važi za preostale JRPPS DOO/Zadruga/Zadružni savez u sledećoj rundi. Registraciona prijava BRISANJA subjekta je druga priča (postojeći subjekat se briše) — normalna kandidat za prefill, proveriti posebno.

**Bug nađen — label-extraction mismatch (Dodatak 13):** auto-mapper je "Место седишта:" label vezao za AcroForm polje `Text28.1.0`, ali vizuelno (pymupdf render test-fill PDF-a) vrednost je pala u susedni box "Регистарски/матични број:" — nearest-label heuristika pogodila pogrešan fizički widget kad su dva polja vertikalno blizu u dvokolonom layoutu. Mapiranje ručno skinuto (profileKey→null), redo test-fill, čisto. **Pouka: vizuelna kontrola test-fill PDF-a mora proveriti da vrednost pada u TAČAN box, ne samo da je "nešto" popunjeno — "filled=N noValue=0" izveštaj iz publish-a ne hvata ovu grešku.**

**Slug kolizija:** batch-curate.ts generiše slug iz `short_name` bez provere jedinstvenosti — "JRPPS — Akcionarsko društvo" i "JRPPS — Javno preduzeće" oba pale na slug "jrpps". Ručno ispravljeno na `jrpps-akcionarsko-drustvo` / `jrpps-javno-preduzece` pre publish-a. Vredi dodati uniqueness proveru u batch-curate.ts (tech debt, nije popravljeno).

## Prethodna sesija (7. jul 2026., batch 3)

**Biblioteka = 28 obrazaca** (bilo 18, +10 novih preko `batch-curate.ts --limit 10`, treći batch iste sesije): dodatak-06, 08, 09, 10, 11, 21, 22, 24, 25, 33. Isti tok kao prethodni batch: propose → ručni pregled JSON-a (profileKey validacija protiv PROFILE_KEYS iz semanticMapper.ts) → publish → pymupdf render provera (dodatak-06/21/22/25 imaju autofill test-fill, ostalih 6 su bez AcroForm predloga pa idu kao referentni PDF) → go-live. `curatedSlug` upisan u `harvest-state.json` za svih 10. Preostalo ~21 kandidat od originalnih 51 AcroForm.

## Prethodna sesija (7. jul 2026., batch 2) — Faza 4: biblioteka 8→18 obrazaca

**Biblioteka = 18 obrazaca** (bilo 8, kurirano + objavljeno još 10 APR kandidata preko `batch-curate.ts --limit 10` + ručni `curate-form.ts publish/go-live`): povracaj-sredstava-apr, ispravka-greske, zahtev-za-potvrdu-apr, prepis-resenja, dodatak-02-ps, dodatak-16, dodatak-20, dodatak-26, dodatak-29, dodatak-32. Vizuelno proverено (pymupdf render) pre go-live — sve čisto, bez preklapanja teksta. `curatedSlug` upisan u `harvest-state.json` za svih 10.

**Bugfix — `scripts/harvest-sources.ts`:** na svežoj mašini (`scripts/harvest/` je gitignored, prazan) harvester je poredio sha256 sa `harvest-state.json` i, ako se poklapa, mislio da je fajl "unchanged" i preskočio download — a fajl lokalno uopšte ne postoji. Sad proverava i `fs.existsSync(localPath)` pre skipa (linija ~119). Bez ovog fix-a `curate-form.ts propose` puca sa ENOENT na svakoj svežoj mašini/klonu.

**Supabase kredencijali:** `.env.local` je bio zaglavljen na `http://127.0.0.1:54321` (mrtav lokalni Docker koji se više ne koristi — projekat je 100% cloud Supabase). Milan ažurirao na pravi cloud URL (`https://dgsuspjxegciwlzqpzxn.supabase.co`) + novi `sb_secret_...` format service role ključa. Radi ispravno sa `@supabase/supabase-js@2.107.0` (i PostgREST i Storage). Ako se ponovo pojavi "Invalid API key"/"Invalid Compact JWS" — prvo proveriti da li `.env.local` slučajno pokazuje na stari/lokalni URL.

**Env var naming gotcha:** posle rotacije ključeva `.env.local` je imao `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase dashboard novi naziv za taj tip ključa) — ceo kod (`lib/supabase/client.ts`, `server.ts`, `lib/blog.ts`, `lib/libraryForms.ts`) čita `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Dev server je pucao sa "supabaseKey is required". Ako se ključevi ponovo rotiraju u Supabase dashboard-u — ime promenljive u `.env.local` MORA ostati `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ne kopirati novi naziv sa dashboarda doslovno.

**CTA fix:** `components/landing/ToolLandingPage.tsx` hero dugme je hardkodovalo "Generišite {toolLabel} besplatno" ignorišući `ctaLabel` prop — na kalkulator stranicama je pisalo "Generišite kalkulator..." (kalkulator se ne generiše). Fiksirano da koristi `ctaLabel`; dodat opcioni `ctaTitle` prop za mid-page naslov (kalkulatori sad imaju "Izračunajte odmah, besplatno" umesto "Napravite X za 60 sekundi"). Usput uočeno: `whyAisistent` prop se prosleđuje na svakoj landing stranici ali se NIGDE ne renderuje u komponenti (`void whyAisistent` — mrtav kod) — sadržaj koji svaka stranica definiše se nikad ne prikazuje korisniku. Nije popravljeno (van scope-a), vredi pogledati.

**Marketing (7. jul):** dodat promo baner na homepage (dinamički broj obrazaca), nav link "Obrasci", footer link, "NOVO" bedž u dashboard sidebar-u, napomena na `/obrasci` da se biblioteka aktivno puni.

## Prethodna sesija (5. jul 2026., kasno veče)

**⚠️ ROK: Milan gubi pristup Claude Sonnet 5 posle 7.7.2026** — zato je napisana kompletna handover dokumentacija.

Urađeno u ovoj sesiji:
1. **Biblioteka = 8 obrazaca** (kurirano 5 novih APR Dodataka: 01 poslovno ime, 04 delatnost, 05 vreme trajanja, 19 pravna forma, 30 ograničenje ovlašćenja). Novo pravilo: obrasci BEZ ijednog autofill polja se objavljuju kao referentni PDF (publish više ne odbija). Fixovan dupliran naslov (short_name = kratak tag, ne kopija title).
2. **Feedback dugme live** — "Obrazac je zastareo ili ima grešku?" na /obrasci/[slug], `POST /api/obrasci/library/[slug]/report-outdated`, inkrement `outdated_reports`, bez auth (spam zaštita zabeležena u handover 01, stavka 8).
3. **`scripts/batch-curate.ts`** — masovni propose + Claude draft meta za sve nekurirane AcroForm kandidate. Testiran, radi. ~40 kandidata čeka.
4. **`docs/handover/00-12`** — KOMPLETNA handover dokumentacija: tech debt (11 stavki), implementaciona uputstva za sav backlog, brainstorm 20+ ideja, meta-uputstvo za slabije modele. POČETNA TAČKA za svaki budući zadatak: `docs/handover/00-INDEX.md` + `12-META-UPUTSTVO.md`.
5. Codex plugin proradio (CLI instaliran, safe.directory fix) — dostupan za delegaciju.

## Šta je sledeće (Milan bira)

1. **Novi izvori:** Poreska uprava — fizička lica (niži prioritet, individualni fokus), ZSO (probati `renderJs: true`).
2. **flat→AcroForm konverzija** (backlog, veći posao) — vredi za obrasce gde BI autofill imao vrednost (npr. PPP-PD, PPDG-1S) — razdvojeno od "referentni download" odluke iz batch 7 koja rešava samo "korisnik nalazi obrazac", ne autofill.
3. n8n cron za harvester (nedeljna provera izmena bez ručnog pokretanja) — infra postoji od blog workflow-a, nije povezano za obrasce.
4. Razrada odabranih brainstorm ideja (`docs/handover/11-BRAINSTORM-FEATURES.md`) u detaljna uputstva
5. Brzi dobici iz brainstorma: SEO obrasci (D1), **KPO knjiga (A2) — obrazac već u biblioteci** (`/obrasci/pausalno-promet`, iz batch 7), rokovi podsetnik (A1)
6. **Marketing audit ostaci (8. jul):** popraviti `whyAisistent` mrtav kod u `ToolLandingPage.tsx`; razmotriti landing stranice za otpremnica/putni-nalog/ponuda-za-radove/obavestenje-o-promeni-uslova; changelog/announcement mehanizam za postojeće korisnike; link/CTA podrška u `TipCard`/`TipDefinition`.

## Ključna pravila kuracije (spec 6.1 — NE kršiti)

- AcroForm sa mapiranim poljima = autofill; flat ili obrasci bez mapiranih polja = referentni download bez autofill-a, frontend prikazuje napomenu (`hasAutofill` u `LibraryFormMeta`) — pravilo promenjeno 8. jul batch 7 (ranije flat odbijen u potpunosti)
- Flat obrazac NIKAD ne sme imati mapirana polja (profileKey) — overlay-fill na flat se ne pokušava, `curate-form.ts publish` to i dalje odbija
- Meta latinicom (publish auto-transliteruje); PDF ostaje na svom pismu
- Prefill samo za obrasce o POSTOJEĆEM subjektu; e-only obrasce (ePorezi) ne kurirati
- **JRPPS "Registraciona prijava" (osnivanje nove firme) NIKAD ne dobija profileKey prefill** — subjekat još ne postoji, prefill bi upisao pogrešan naziv (dodato 8. jul, batch 4; potvrđeno opet 8. jul batch 6 na JRPPS PR Osnivanje)
- Vizuelna kontrola test-fill PDF-a mora proveriti TAČAN box, ne samo da je polje popunjeno — label-extraction može pogoditi susedni widget (dodato 8. jul, batch 4)
- NIKAD ne mapirati `website` na polje čija je labela bukvalno "www." (statički prefiks) — profil ne garantuje bare-domain format, daje dupli "www." (dodato 8. jul, batch 5; ponovilo se batch 6 na Dodatak 16 PR)
- **Slug se izvodi i iz imena fajla (PR/PS token), ne samo iz Claude short_name draft-a** — sprečava koliziju kad Claude izbaci sufiks (trajno fiksirano u batch-curate.ts, 8. jul batch 6)
- **Posle svakog batch-a skenirati sve curation.json meta polja za stray non-Latin karaktere** (regex van `[a-zA-Z0-9šđčćžŠĐČĆŽ+interpunkcija]`) — Claude/transliteracija povremeno ostavi ćirilično/egzotično slovo usred latiničnog teksta, lako se previdi vizuelno (dodato 8. jul, batch 7 — pogodilo 11 obrazaca uklj. 2 stara iz batch 4/5)
- Novi izvor koji se preklapa sa postojećim (isti institucija, druga podstranica) često donese 0 ili malo novih kandidata — harvester automatski prepoznaje već-viđene URL-ove kao "unchanged", nema duplog rada
- Sajt koji ne vraća PDF linkove u plain fetch-u možda ih ubacuje tek JS-om (purs.gov.rs pattern) — probaj `"renderJs": true` na izvoru pre nego što zaključiš da nema kandidata
- **Dekodirati kriptično/nečitljivo ime fajla pre kuracije** (npr. `_-_.pdf`) — često je Cyrillic URL koji se izgubio pri sanitizaciji imena; NOISE_RE filter u harvester-u radi nad URL-om, ne nad dekodiranim imenom, pa uputstva/priručnici sa ćiriličnim imenom mogu proći kao "flat kandidat" (dodato 8. jul, batch 8 — "Korisničko uputstvo — Digitalno potpisivanje" umalo katalogizovano kao obrazac)
- Institucionalni dokumenti (ISO politike, sertifikati, izveštaji) nisu obrasci iako imaju 0 AcroForm polja — proveriti label pre kuracije, ne osloniti se samo na klasifikaciju flat/acroform (dodato 8. jul, batch 8 — PIO POL-001/002, Sertifikat ISMS/QMS isključeni)
- Harvest ≠ publish — kurator (Milan) uvek odobrava go-live

## Tehnički kontekst — vidi

- `docs/handover/00-INDEX.md` — mapa svega
- `.ai-memory/project_codebase_map.md` — arhitektura celog codebase-a (full read 5. jul)
- PROGRESS.md — istorija sesija
