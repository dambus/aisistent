# Handover — Marketing Content Pipeline (Faza 2)

_Predloženo mesto u repou: `docs/handover/2026-08-10-marketing-content-pipeline.md`_

Kontekst i puna arhitektura: `aisistent-content-pipeline-arhitektura-avgust2026.md` (Claude.ai projekat "AIsistent social media and marketing management"). Ovaj fajl je log konkretnih izmena, ne dizajn dokument.

---


## QA korak sada direktno ispravlja tekst + marker-based parsing (11. avgust 2026.)

### 1. QA/editor korak — ispravlja umesto da samo prijavljuje

Do sada je `QA Prompt → Message a model QA → Parse QA` samo vraćao listu grešaka (`qa_flags`) koje je Milan ručno ispravljao u Supabase-u pre objave. Pošto se pokazalo da QA vrlo pouzdano hvata gramatiku/pravopis/anglicizme (potvrđeno na više realnih Telegram primera), promenjena je uloga koraka iz "prijavi" u "ispravi direktno":

- `QA Prompt` sada traži od modela da **direktno ispravi** tekst (gramatika, pravopis, činjenice o proizvodu/jeziku, pominjanje cene, anglicizmi) i vrati ispravljenu verziju + listu šta je promenio.
- `Parse QA` koristi ispravljenu verziju kao finalni tekst (homoglyph safety net i dalje radi preko nje, jer se pokazalo da model ne hvata pouzdano sopstvenu grešku te vrste).
- Uveden `needs_human_review` — za probleme koje model ne može sam pouzdano da reši (npr. tema van fokusa) — ostaje kao jak Telegram alert; sve ostalo je samo FYI obaveštenje o tome šta je automatski ispravljeno.
- `Code in JavaScript2` (LinkedIn prompt builder) je repointovan da koristi ispravljen naslov/izvod iz `Parse QA` umesto originala pre QA-a (bio je propust — LinkedIn je do sad generisan iz neispravljene verzije).
- Telegram poruka (`Send a text message`) sada prikazuje `qa_summary_text` — konkretno šta je ispravljeno / šta traži pažnju, umesto liste za ručno kucanje.

**Testirano uživo:** izvršenje #189 — QA je pronašao i ispravio 5 stvari (zapeta, homoglyph slovo, slaganje po padežu, tipfeler, pogrešna crtica), `needs_review` prazan, sve upisano u `blog_posts`/`content_items`, Telegram poruka stigla ispravno.

### 2. Root-cause fix za povremeni JSON parse crash

Prilikom testiranja (izvršenje #188) otkriven je poznat tip greške: `Code in JavaScript1` je pukao sa `SyntaxError: Expected ',' or '}' after property value` — model je u dugačkom sadržaju ostavio neispravno eskejpovan navodnik/red, što razbija `JSON.parse`. Umesto da se to samo hvata kao greška, promenjen je **format odgovora modela** na sva tri mesta gde se generiše duži slobodan tekst:

- **Blog generacija** (`Code in JavaScript` prompt / `Code in JavaScript1` parser)
- **QA/editor korak** (`QA Prompt` / `Parse QA`)
- **Instagram caption** (`Instagram Prompt` / `Parse IG`)

Umesto da model sam JSON-escape-uje ceo članak/caption u istom odgovoru (rizično — jedan zaboravljen navodnik ili sirovi enter i sve puca), format je sada hibridni: samo kratka polja (slug/naslov/izvod, QA liste promena, IG `graphic` polja) ostaju JSON na prvoj liniji odgovora, a veliki tekst (sadržaj/caption) ide posle jasnog markera (`<<<SADRZAJ>>>`, `<<<NASLOV>>>`/`<<<IZVOD>>>`/`<<<SADRZAJ>>>` za QA, `<<<CAPTION>>>` za IG) kao običan string bez ikakvog escaping-a — cela klasa greške je eliminisana, ne samo simptom. Header JSON i dalje ima try/catch fallback (izvlačenje `{...}` bloka) kao dodatna zaštita.

**Testirano uživo:** izvršenje #190 — pun pipeline (blog + QA + LinkedIn + Instagram) prošao bez greške na novom formatu, tema "Rok plaćanja na fakturi — šta kaže zakon u Srbiji" (`content_items` id `1269e22b-1406-41a3-9fc9-d46117c68315`). QA je ispravio 2 anglicizma, Instagram draft kreiran u Zernio-u. **Napomena:** ovo je pravi backlog topic, ne scratch test — čeka Milanov pregled u `/admin/blog` i Zernio dashboard-u kao i svaki drugi draft.

---

## Retry — Instagram grafika za "Razlika između ugovora o radu i ugovora o delu" (10. avgust 2026., isti dan)

Blog i LinkedIn deo za ovu temu su već bili gotovi i QA-čisti iz izvršenja #184 (`blog_post_id c6cf1c37-3e1f-42eb-b115-25616163f82b`) — samo je Instagram grana ranije padala na starom `flux/dev` modelu i fiksnom čekanju. Umesto da se ceo pipeline ponovo pokrene (i potroši nova blog/LinkedIn generacija), napravljen je izolovan scratch workflow **samo za Instagram granu**, sa već ispravljenim modelom (Seedream) i polling petljom:

- Workflow `SWT9lVbrYJyxrzY5` ("RETRY - Instagram only") — Manual Trigger → Code node sa hardkodovanim `title`/`excerpt`/`keyword_id` (`b4450b5c-01fd-40e2-a789-42dd8a825388`) → identična Instagram grana kopirana iz glavnog workflow-a (`Instagram Prompt → Message a model IG → Parse IG → fal.ai Submit [Seedream] → Poll Wait → fal.ai Check Status → Fal Completed? → fal.ai Get Result → Zernio Presign → Download Image → Upload to Zernio → Zernio List Accounts → Find IG Account → Zernio Create Post → Update Instagram Row → Send IG Telegram`)
- Izvršenje #185 — **uspešno**, trajalo ~2 min 23s (Seedream generacija + jedan krug polling-a). Bez homoglyph flagova (`ig_flags: []`).
- Zernio draft kreiran (`status: "draft"`, čeka odobrenje u dashboard-u), slika: `https://media.zernio.com/temp/1786354050294_gfa1gc3c_aisistent-ig-1786354049970.jpg`
- `content_items` red `b4450b5c-...` ažuriran sa `instagram_caption`, `instagram_image_prompt`, `instagram_image_url` (status ostaje `done`, blog/LinkedIn kolone nisu dirane)
- Scratch workflow arhiviran nakon uspešnog runa (isti pattern kao dosadašnji test workflow-i)

**Zaključak:** obrazac "izolovan retry samo za granu koja je pala, ne ceo pipeline" se pokazao efikasnim — nema trošenja backlog teme niti nepotrebne blog/LinkedIn regeneracije.

---

## Šta je urađeno — nastavak (10. avgust 2026., isti dan)

### 3. Instagram automatizacija (fal.ai + Zernio) — n8n workflow `QeNEPp3XlJlm6uBB`

Novi paralelni tok, grana se od `Parse QA` (isti sadržaj kao blog/LinkedIn, ne novi topic):

`Parse QA → Instagram Prompt → Message a model IG → Parse IG → fal.ai Submit → Wait 20s → fal.ai Get Result → Zernio Presign → Download Image → Upload to Zernio → Zernio List Accounts → Find IG Account → Zernio Create Post → Update Instagram Row → Send IG Telegram`

- `Instagram Prompt` / `Message a model IG` / `Parse IG` — generišu caption (srpski, CTA "Link u bio") i image prompt (dark green/gold letterhead stil) iz istog blog naslova/opisa
- `fal.ai Submit` (`fal-ai/flux/dev`, 1080×1350, jpeg) → `Wait 20s` → `fal.ai Get Result` — **napomena:** fiksno čekanje, ne pravi polling; ako fal.ai ikad treba duže od 20s, run puca. Prvo mesto za ojačati ako bude nestabilno.
- `Zernio Presign` → `Download Image` → `Upload to Zernio` — prati zvanični Zernio media upload flow (presign → PUT → publicUrl)
- `Zernio List Accounts` → `Find IG Account` — dinamički nalazi `accountId` za povezan Instagram nalog (`@aisistent.rs`), ne hardkodovan
- `Zernio Create Post` — **kreira DRAFT** (bez `scheduledFor`/`publishNow`) — ništa se ne objavljuje automatski, čeka pregled u Zernio dashboard-u
- `Update Instagram Row` — upisuje `instagram_caption`, `instagram_image_prompt`, `instagram_image_url` u `content_items`
- `Send IG Telegram` — posebna Telegram poruka sa caption-om i linkom ka slici

**Kredencijali (n8n):** `fal.ai account` i `zernio account` (oba `httpHeaderAuth`), dodao ih Milan ručno, vezani na 5 HTTP Request čvorova preko `setNodeCredential`.

**Testirano:** `test_workflow` izvršenje #172, status `success`, sva logika (`Parse IG`, `Find IG Account`) proverena. **Nije testirano uživo** — HTTP/kredencirani čvorovi su pinovani u test-modu, znači fal.ai generacija i Zernio pozivi nikad nisu stvarno izvršeni. Pre prvog produkcijskog runa vredi odraditi jedan pravi test (troši fal.ai kredit).

---

## Šta je urađeno (10. avgust 2026.)

### 1. Supabase (`dgsuspjxegciwlzqpzxn` / projekat `aisistent`)

- Nova tabela `content_items` — zamenjuje `blog_keywords` kao izvor za sve kanale (blog, LinkedIn, kasnije Instagram/Reddit). Puna šema u arhitekturnom dokumentu, sekcija 1.
- `blog_keywords` (11 redova) prenet u `content_items` sa **istim id-jevima** (zbog `blog_post_id` FK veza) — stara tabela nije obrisana, ostaje kao arhiva.
- Ubačeno 25 novih tema u `content_items`, status `pending`, `channels = {blog,linkedin,instagram}` — pokrivaju alate koje Faza 1 nije dirala (HR, ugovori, kalkulatori, komercijalni dokumenti).
- **Trenutno stanje queue-a:** 30 `pending`, 6 `done`.

Migracije (`apply_migration`): `create_content_items_table`, `seed_content_items_backlog`.

### 2. n8n workflow `Blog+linkedin sceduled objave` (ID `QeNEPp3XlJlm6uBB`)

- Čvorovi `Get many rows` i `Update a row`: `tableId` promenjen sa `blog_keywords` na `content_items`.
- Dodat QA/urednik korak — 3 nova čvora ubačena između generisanja bloga i upisa u `blog_posts`:
  - `QA Prompt` (Code) — sastavlja prompt za proveru
  - `Message a model QA` (Anthropic) — proverava gramatiku, činjenice (npr. tačan broj padeža = 7) i da nema pominjanja cene/pretplate (nema pravnog lica još)
  - `Parse QA` (Code) — parsira odgovor u `qa_ok` / `qa_flags`
- `Update a row` sada upisuje i `qa_flags` u `content_items` (kao JSON string).
- `Send a text message` (Telegram) sada prikazuje QA upozorenja na vrhu poruke, pre blog/LinkedIn drafta.
- Novi tok: `Code in JavaScript1 → QA Prompt → Message a model QA → Parse QA → Create a row → Update a row → Code in JavaScript2 → Message a model1 → Send a text message`

**Testirano:** `test_workflow` izvršenje #171, status `success`. Napomena — n8n test-mod pinuje kredencirane čvorove (Supabase/Telegram), pa se njihovi expression-i ne izvršavaju uživo u testu; provereno da koriste isti obrazac referenci (`$('Node').first().json...`) kao već postojeći, radni delovi workflow-a.

### Poznata kozmetička napomena

Validator prijavljuje "Missing discriminator resource" na sva 4 Anthropic/Telegram čvora (postojala su 3 i pre ovih izmena) — workflow radi ispravno, nije uzrokovano ovim izmenama.

---

## Šta je urađeno — pravi (live) test i 2 bugfixa (10. avgust 2026., isti dan)

Pokrenuta 2 prava izvršenja (ne dry-test) preko `execute_workflow`, executionMode `manual`:

- **Izvršenje #173:** blog+LinkedIn grana je prošla uživo do kraja — pravi post kreiran, QA je uhvatio 3 stvarne greške (pravopis, interpunkcija, ponavljanje), pravi Telegram poslat. Instagram grana pukla na `fal.ai Submit` — `jsonBody` je bio tekstualni template, pukao je čim je Claude-generisan caption sadržao znak `"`.
  - **Fix:** `fal.ai Submit` i `Zernio Create Post` jsonBody prebačen sa string-templatea na n8n object-expression (`={{ {...} }}`) — JSON se sad ispravno serijalizuje bez obzira na navodnike/specijalne karaktere u tekstu.
  - **Uzgredno otkriveno:** Instagram caption i image_prompt su sadržali pojedinačna ćirilična slova pomešana u latiničnom tekstu (homoglifi — npr. "primаoca", vizuelno identično ali ćirilica). Blog grana je bila čista (QA prompt je pokriva), Instagram grana nije imala nikakvu proveru.
  - **Fix:** dodat deterministički homoglyph-fix (regex/mapa, ne LLM poziv) u `Parse QA` (blog: title/excerpt/content) i `Parse IG` (caption/image_prompt) — auto-ispravlja i dodaje flag ako je nešto ispravljeno, prikazuje se u oba Telegram upozorenja.
- **Izvršenje #174** (posle fix-a): JSON body greška otklonjena, `ig_flags` prazan (čisto). Nova greška: `fal.ai Submit` → **401 "Cannot access application fal-ai/flux — Authentication is required"**. Ovo je na strani fal.ai naloga/kredencijala (format Header Value ili nalog nema pristup/billing za flux/dev model), ne n8n konfiguracija. **Blokirano na Milanu da proveri fal.ai credential/nalog.**

**Cena testiranja:** 2 teme iz backloga potrošene (28 preostalo), blog+LinkedIn grana potvrđena da radi uživo end-to-end sa QA guardrail-om. Instagram grana još nije uspešno završila pravi run.

---

## Šta je urađeno — pun end-to-end test uspešan (10. avgust 2026., isti dan)

Root cause za fal.ai 401 je bio pokvaren/pogrešno kopiran API kljuc (ne billing — nalog je imao kredita od pocetka). Posle novog kljuca uz ispravan `Key ` prefiks, testirano izolovano (privremeni test workflow-ovi, van glavnog pipeline-a, obrisani posle):

- **fal.ai:** izolovan poziv uspešan (`status: IN_QUEUE`)
- **Zernio:** izolovan poziv uspešan — `List Accounts` vraća oba povezana naloga (Instagram `aisistent.rs`, LinkedIn `AIsistent`), `Presign` vraća validan `uploadUrl`/`publicUrl`

**Izvršenje #179 — pun pravi run cele pipeline, uspešan end-to-end:**

- Blog: "Razlika između ugovora o radu i ugovora o delu" — kreiran (published: false)
- QA je uhvatio 3 stvarna problema na ovom postu, uključujući **pominjanje konkretne cene ("80.000 dinara")** u primeru — tačno guardrail koji je i pravljen zbog odsustva pravnog lica, potvrđen na živom slučaju
- Instagram: caption + image_prompt čisti (`ig_flags: []`), fal.ai je generisao sliku, upload na Zernio uspeo
- Zernio: **draft uspešno sačuvan** (`status: "draft"`, `"Draft saved successfully"`) — ništa objavljeno, čeka pregled u dashboard-u

**Zaključak:** Instagram automatizacija (fal.ai + Zernio) je potvrđena kao radna, end-to-end, uz oba guardrail-a (QA na blogu, homoglyph-fix na oba kanala) dokazano funkcionalna na pravim generacijama.

---

## Šta je urađeno — kriticna izmena modela (fal-ai/flux/dev → Seedream 5 Pro) (10. avgust 2026., isti dan)

Prvi pravi post iz pipeline-a (izvrsenje #179, "Ugovor o radu ili ugovor o delu") je imao potpuno neispravan tekst na Instagram grafici ("Ubgor o radu, illi :: ubure delu", "aisistent.rs" → "ASISNNIIS"). Root cause: `fal-ai/flux/dev` je pogresan izbor modela za tekst-u-slici — nije to sto je i vec eksplicitno navedeno u arhitekturnom dokumentu kao poznato ogranicenje difuzionih modela.

Milan je vec 3x rucno objavio postove (istog dizajna) koristeci **`bytedance/seedream/v5/pro/text-to-image`** (Seedream 5.0 Pro — "native text u 14 jezika, precizni gusti layout-i"), ne flux/dev. Dva kruga popravke:

1. **Prvi pokusaj (i dalje pogresan model):** restrukturiran prompt da LLM vraca kratke odvojene tekstualne komponente (label/badge/2 reda naslova/3 koraka/disclaimer/cta) umesto slobodnog opisa, sastavljene u kodu u strukturiran prompt. I dalje na flux/dev-u — veliki naslov je renderovan skoro savrseno, ali sitniji tekst (lista koraka, disclaimer, brend) je i dalje bio necitljiv, cak i model izmislio nepostojeci 4. korak. **Zakljucak:** ovo NIJE bio problem prompta, vec modela.
2. **Ispravka:** `fal.ai Submit` prebacen na `bytedance/seedream/v5/pro/text-to-image`, `image_size` promenjen sa `{width,height}` objekta na string enum `"portrait_4_3"` (kako Seedream ocekuje). `Parse IG` prompt template prepisan da bude **bukvalna replika** Milanovog vec 3x dokazanog prompta (identican redosled i formulacija, ubaceni samo tekstualni podaci).
3. **Seedream je sporiji od flux/dev-a** (~85s vs ~10-15s) — `Wait` cvor produzen sa 20s na 100s (preimenovan u `Wait 100s (Seedream)`), inace puca sa "Request is still in progress".

**Izolovan test posle popravke (van glavnog pipeline-a, temom "Faktura za inostranstvo"):** slika identicna po kvalitetu Milanovim vec objavljenim postovima — sav tekst tacan i citljiv (naslov, 3 koraka, disclaimer, brend). Milan potvrdio: "fantasticno".

**Napomena:** ovo je otkriveno TEK na pravom Zernio draft-u (izvrsenje #179) — dry-test i cak i izolovani auth-testovi ne mogu da uhvate kvalitet generisanog sadrzaja, samo da li se poziv uopste izvrsi. Vizuelna provera od strane Milana pre svakog draft-a ostaje neophodna, cak i sa ispravnim modelom.

---

## Sledeće (nije još urađeno)

- Pokrenuti jos jedan pravi end-to-end test cele pipeline sa Seedream modelom da se potvrdi ceo lanac (fal.ai → Zernio draft) sa produzenim wait-om
- Reddit ostaje van auto-publish toka (vidi arhitekturni dokument, sekcija 4) — registracija blokirana na Responsible Builder Policy

---

_Ažurirati ovaj fajl (ne novi fajl) posle svake dalje izmene pipeline-a — dodati novu datiranu sekciju na vrh "Šta je urađeno"._
