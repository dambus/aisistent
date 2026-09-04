> **ARHIVA — snimak stanja jul 2026. Ne koristiti kao izvor tekućeg stanja.**
>
> Tabela „Trenutni status kanala“ i odeljak „Odluke i principi“ kažu da je Instagram odložen za
> Fazu 2. Nalog je aktiviran **3. avgusta 2026.** i od tada radi. Opisani n8n tok (blog + LinkedIn,
> `blog_keywords`) zamenjen je: izvor tema je sada `content_items`, dodata je lektura, Instagram
> grana i drugi nedeljni raspored.
>
> Aktuelno stanje: `docs/marketing/PIPELINE.md`, `PLAN-OBJAVA.md`, `BREND-PRAVILA.md`.

# AIsistent — Marketing Kampanja Faza 1
*Sesija: jul 2026.*

---

## Šta je urađeno

### 1. Blog migracija na Supabase
- Postojeći filesystem blog (6 `.md` fajlova) migriran na Supabase `blog_posts` tabelu
- Blog je sada dinamički — novi postovi su živi odmah po insertu, bez redeployа
- `sitemap.ts` ažuriran na async
- API ruta `/api/blog/create` za n8n (zaštićena sa `BLOG_API_SECRET`)
- Admin stranica `/admin/blog` za pregled, publish/unpublish, delete

**Prava šema `blog_posts` tabele:**
```sql
id uuid, slug text, title text, description text,
content_md text, date date NOT NULL, read_time text,
keywords text[], published boolean, created_at timestamptz, updated_at timestamptz
```

---

### 2. Content strategija

**Target:** B2B paušalci i preduzetnici u Srbiji
**Fokus:** Repetitivni dokumenti (svakodnevna gnjavaža), ne jednokratni pravni dokumenti

**Top 5 alata za content:**
1. Ponuda klijentu
2. Faktura / profaktura
3. Poslovni mejl
4. Opis proizvoda/usluga
5. Ugovor o delu

**5 keyword clustera (30 tema ukupno):**
- Ponuda klijentu (8 tema)
- Faktura i profaktura (7 tema)
- Poslovni mejl (6 tema)
- Opis proizvoda/usluga (5 tema)
- Ugovor o delu (4 tema)

**12-nedeljni content kalendar** — jedan post nedeljno, formati: long-form / kratki / listicle

---

### 3. Supabase tabela `blog_keywords`
```sql
create table blog_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  naslov text,
  alat text,
  format text default 'long-form',
  status text default 'pending',  -- 'pending' | 'done' | 'skip'
  blog_post_id uuid references blog_posts(id),
  created_at timestamptz default now()
);
alter table blog_keywords enable row level security;
```
Popunjena sa 11 keyworда (Post #1 je već objavljen ručno).

---

### 4. Post #1 — objavljen ručno
**Naslov:** Kako napisati ponudu klijentu (sa primerom)
**Slug:** `kako-napisati-ponudu-klijentu`
**URL:** https://aisistent.rs/blog/kako-napisati-ponudu-klijentu
**Ton:** iskusan kolega, konkretni primer (Marko, IT freelancer), CTA ka alatu

---

### 5. n8n Workflow — Blog + LinkedIn automatizacija

**Tok:**
```
Schedule Trigger (nedeljno)
    ↓
Get many rows — Supabase, status=pending, limit=1, sort created_at ASC
    ↓
Code in JavaScript — pravi Claude prompt za blog post
    ↓
Anthropic (claude-sonnet-4-5, max 4000 tokens) — piše blog post
    ↓
Code in JavaScript1 — strip ```json fences, JSON.parse, dodaje keyword_id
    ↓
Supabase Create — insert u blog_posts (published: false, date: danas)
    ↓
Supabase Update — keyword status → done, blog_post_id → novi post ID
    ↓
Code in JavaScript2 — pravi Claude prompt za LinkedIn post
    ↓
Anthropic2 (claude-sonnet-4-5, max 500 tokens) — piše LinkedIn post
    ↓
Telegram — notifikacija sa admin linkom + LinkedIn copy/paste tekst
```

**Kritične napomene za n8n:**
- Claude često vraća JSON u ```json fences — uvek stripovati: `raw.replace(/```json|```/g, '').trim()`
- Referenciranje između nodova: koristiti tačan naziv noda npr. `$('Get many rows').first().json.id`
- Supabase `date` kolona je NOT NULL — slati `new Date().toISOString().split('T')[0]`

**Claude prompt template za blog:**
```
Ti si content writer za AIsistent.rs — srpsku AI platformu za poslovne dokumente.
Napiši blog post na temu: "{keyword}"
Predloženi naslov: "{naslov}"
Format: {format}

PRAVILA:
- Srpski jezik, latinica, bez ćirilice
- Bez anglicizama
- Ton: iskusan kolega, ne korporativni vodič
- Jedan konkretan primer (srpski kontekst)
- CTA ka https://aisistent.rs/dokumenti/{alat}
- Bez pravnih saveta — samo procedura i forma
- Disclaimer na kraju

FORMAT ODGOVORA — samo ovaj JSON, bez teksta pre ili posle:
{
  "slug": "url-friendly-bez-dijakritika",
  "title": "Naslov posta",
  "excerpt": "1-2 rečenice opisa",
  "content": "Kompletan markdown sadržaj"
}
```

**Claude prompt template za LinkedIn:**
```
Napiši kratak LinkedIn post na srpskom koji deli blog post.
Naslov: "{title}" | Opis: "{excerpt}" | Link: {url}

PRAVILA: max 150 reči, počni sa konkretnim problemom,
ton iskusan kolega, 2-3 paragrafa, link na kraju,
3-4 hashtaga (#paušalac #freelancer #malibiznis #srbija),
bez anglicizama. Vrati samo tekst posta.
```

---

### 6. LinkedIn stranica
- **URL:** https://www.linkedin.com/company/aisistent-rs/
- **Tagline:** "AI alati za poslovne dokumente — za srpske preduzetnike"
- **Tip:** Privately held
- Header dizajn: tamna pozadina, indigo akcenti

---

## Trenutni status kanala

| Kanal | Status |
|---|---|
| Blog (aisistent.rs/blog) | ✅ Aktivan, 7 postova |
| Google Search Console | ✅ Aktivan ~1 nedelja, 21 stranica indeksirana |
| n8n blog workflow | ✅ Aktivan, nedeljno |
| LinkedIn stranica | ✅ Kreirana |
| Reddit | ⏳ Čeka Responsible Builder Policy registraciju |
| Instagram | 🚫 Odložen za Fazu 2 (B2B mismatch, nema budžeta) |

---

## Odluke i principi

- **Instagram odložen** — B2B paušalci nisu u "biznis mode" na Instagramu; bez budžeta za paid ads nema smisla u Fazi 1
- **LinkedIn > Instagram** za B2B SaaS bez budžeta
- **Founder content** na ličnom LinkedIn profilu ima veći reach od company page postova
- **SEO je dugoročna igra** (3-6 meseci), Reddit/forumi daju kratkoročni traffic
- **human-in-the-loop** — n8n generiše draft, Milan odobrava pre publish-a

---

## Sledeće akcije

- [ ] Pratiti GSC — kad postovi počnu da se indeksiraju
- [ ] Reddit Responsible Builder Policy registracija → n8n monitoring workflow
- [ ] LinkedIn postovi uz svaki objavljeni blog post
- [ ] Faza 2: Instagram + paid ads kad Paddle bude aktivan

---
*jul 2026. — AIsistent Marketing Faza 1*
