# Marketing pipeline — kako radi danas

**Klasa dokumenta:** STANJE (prepisuje se u celini, ne dopisuje)
**Poslednja provera:** 2026-09-04
**Nadređeni izvor:** n8n workflow `QeNEPp3XlJlm6uBB` i Supabase projekat `dgsuspjxegciwlzqpzxn`

> Ako se ovaj dokument razlikuje od workflow-a ili baze — **workflow i baza su tačni**.
> Dokument opisuje kako sistem radi, ne kako bi trebalo da radi. Šta se objavljuje i kada:
> `PLAN-OBJAVA.md`. Jezik i copy pravila: `BREND-PRAVILA.md`.

---

## 1. Sastavni delovi

| Deo | Šta radi |
|---|---|
| **n8n** (`QeNEPp3XlJlm6uBB`) | orkestracija, dva raspoređena okidača |
| **Supabase** (`dgsuspjxegciwlzqpzxn`) | `content_items` (teme), `blog_posts` (blog), pogled `v_cetvrtak_kandidati` |
| **Edge funkcija** `render-instagram-poster` | deterministički renderuje Instagram poster iz tekstualnih polja |
| **Anthropic** | `claude-sonnet-4-5-20250929` na svim čvorovima za generisanje i lekturu |
| **Zernio** | povezani nalozi za Instagram i LinkedIn; pipeline pravi **isključivo draft** |
| **Telegram** | obaveštenja; ID razgovora je konfigurisan u samim čvorovima |

Kredencijali u n8n-u: `Supabase account`, `Anthropic account`, `Telegram account`,
`zernio account`. Postoji i `fal.ai account`, ali se više ne koristi — vidi sekciju 6.

**Ništa se ne objavljuje automatski.** Svaki izlaz je draft; objava je uvek ručna.

---

## 2. Ponedeljak 09:00 — blog + prva objava

Okidač: `Schedule Trigger`

```
Get many rows            content_items, status=pending, najstarija, limit 1
  → Code in JavaScript   sastavlja prompt za blog
  → Message a model      generiše blog (marker format <<<SADRZAJ>>>)
  → Code in JavaScript1  parsira header JSON + sadržaj
  → QA Prompt
  → Message a model QA   lektura: ispravlja, ne samo prijavljuje
  → Parse QA             + deterministička provera homoglifa
       ├─→ Create a row        blog_posts, published = false
       │     → Update a row    content_items: blog_post_id, status=done, qa_flags
       │     → Code in JavaScript2   prompt za LinkedIn
       │     → Message a model1
       │     → Send a text message   Telegram: QA sažetak + LinkedIn tekst
       │
       └─→ Instagram Prompt
             → Message model IG    caption + polja za grafiku
             → Parse IG            + homoglifi
             → Render Poster       Edge funkcija → { url }
             → Zernio Presign → Download Image → Upload to Zernio
             → Zernio List Accounts → Find IG Account
             → Zernio Create Post  DRAFT
             → Update Instagram Row
             → Send IG Telegram
```

Blog se uvek pravi kao **draft** (`published = false`) i objavljuje se ručno u `/admin/blog`.

---

## 3. Četvrtak 09:00 — drugi ugao na istu temu

Okidač: `Schedule Trigger - Thu`

Ova grana **ne uzima novu temu iz backloga**. Čita poslednju temu koju je ponedeljak obradio
i čiji je blog objavljen.

```
Get Pending Row (Thu)    pogled v_cetvrtak_kandidati, blog_created_at.desc, limit 1
                         alwaysOutputData = true (inače prazan rezultat zaustavi granu)
  → Provera uslova (Thu) postavlja nastavi = true/false i razlog
  → Ima li teme? (Thu)
       ├─ false →  Send Skip Telegram (Thu)     kraj, nijedna objava
       └─ true  →  LinkedIn Prompt (Thu)
                    → Message model LinkedIn (Thu)
                    → Parse LinkedIn (Thu)       + homoglifi
                    → Instagram Prompt (Thu)
                    → Message model IG (Thu)
                    → Parse IG (Thu)
                    → QA Prompt (Thu)
                    → Message model QA (Thu)     skraćena lektura
                    → Parse QA (Thu)             + homoglifi (drugi prolaz)
                         ├─→ Send LinkedIn Telegram (Thu)
                         └─→ Render Poster (Thu)
                               → Zernio Presign (Thu) → Download → Upload
                               → List Accounts → Find IG Account
                               → Zernio Create Post (Thu)   DRAFT
                               → Update Content Item (Thu)
                               → Send IG Telegram (Thu)
```

### Uslov i razlozi preskakanja

`Provera uslova (Thu)` razlikuje dva slučaja i oba javlja na Telegram:

- **nema neobrađenih tema** — ponedeljak nije napravio nov blog, ili je četvrtak sve obradio
- **blog draft nije objavljen** — kandidat postoji, ali je `published = false`, pa objava ne sme
  da ga referencira

Preskakanje nije greška. Grana se tada ne izvršava dalje i ne pravi ništa.

### Zašto QA prolazi kroz tri izlaza odjednom

Jedan poziv modelu pokriva polja za grafiku, Instagram caption i LinkedIn tekst — kratki su i iz
iste teme. Polja za grafiku su najosetljivija jer idu direktno na sliku; ispravka posle
renderovanja zahteva ponovni render, ponovni otpremanje i ponovnu objavu.

Homoglifi se proveraju **dvaput** — pre QA u `Parse LinkedIn (Thu)` i posle QA u `Parse QA (Thu)`.
Drugi prolaz postoji zato što je QA takođe jezički model i sam može ubaciti ćirilično slovo.

`Send LinkedIn Telegram (Thu)` je namerno **posle** QA. Ranije je bio pre, pa je stizao
nelektorisan tekst.

---

## 4. Renderovanje postera

Edge funkcija: `POST https://dgsuspjxegciwlzqpzxn.supabase.co/functions/v1/render-instagram-poster`

Ulaz (JSON): `cluster`, `headline` (niz od dva reda), `steps` (niz od tri), `disclaimer`, `cta`,
`footer`. Ponedeljak dodatno šalje `label` i `background: 'gradient'`.

Izlaz: `{ url }` — slika koja se preuzima i otprema na Zernio.

Render je **deterministički**. Tekst se ne generiše modelom slike, pa nema nečitljivih natpisa.
Zbog toga je jezička provera pre renderovanja jedina zaštita — sve što uđe, izađe doslovno.

---

## 5. Podaci

**`content_items`** — teme i njihov trag kroz kanale: `keyword`, `naslov`, `alat`, `cluster`,
`format`, `status` (`pending` / `done`), `blog_post_id`, `qa_flags`, `instagram_caption`,
`instagram_image_prompt`, `instagram_image_url`, `linkedin_copy`.

**`blog_posts`** — `slug`, `title`, `description`, `content_md`, `date`, `published`.

**`v_cetvrtak_kandidati`** — pogled: teme sa `blog_post_id` i bez `linkedin_copy`, spojene sa
`blog_posts` radi `published`, `slug`, `title` i `blog_created_at`. Namerno **ne** filtrira po
`published`, da bi grana mogla da razlikuje razlog preskakanja.

Sortirati po `blog_created_at`, **ne** po `created_at`. `created_at` je datum nastanka teme, a
većina tema deli isti datum iz početnog punjenja backloga.

Stanje 2026-09-04: 19 tema `pending`, 17 `done`; 17 objavljenih blogova, 4 drafta; 234 obrasca
u `library_forms`.

---

## 6. Mrtav kod i poznata odstupanja

**fal.ai grana je isključena.** Čvorovi `fal.ai Submit`, `Poll Wait`, `fal.ai Check Status`,
`Fal Completed?` i `fal.ai Get Result` imaju `disabled: true` i nisu povezani. Generisanje slike
modelom (prvo `flux/dev`, zatim `bytedance/seedream/v5/pro`) zamenjeno je determinističkim
renderom, jer difuzioni modeli ne umeju pouzdano da ispišu tekst na srpskom. n8n prijavljuje
`DISCONNECTED_NODE` za `fal.ai Submit` — očekivano.

**`Parse IG` (ponedeljak) i dalje gradi `image_prompt`** za fal.ai i upisuje ga u
`instagram_image_prompt`. Bezopasno, ali zbunjuje pri čitanju.

**`Parse IG` (ponedeljak) generiše `badge`**, a `Render Poster` ga ne prosleđuje Edge funkciji.

**Ponedeljak i četvrtak ne šalju iste parametre rendereru** — ponedeljak šalje `label` i
`background`, četvrtak ne.

**Ponedeljkov LinkedIn tekst sadrži link ka blogu koji je u tom trenutku draft.** Rešeno
upozorenjem u Telegram poruci, ne strukturno — ponedeljak generiše pre nego što ti objaviš blog.
Četvrtak je zaštićen strukturno, jer uslov zahteva objavljen blog.

**Izmene četvrtkove grane od 2026-09-04 nisu još testirane uživo.** Prvi run treba pokrenuti
ručno preko `Schedule Trigger - Thu` i proveriti obe putanje (uspeh i preskakanje).

---

## 7. Šta ostaje ručno

Objava bloga, objava na Instagramu (Zernio Drafts), objava na LinkedInu (copy/paste iz Telegrama),
reelovi u celini, dopunjavanje backloga tema.
