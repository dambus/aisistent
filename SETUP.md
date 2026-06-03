# AIsistent — Setup uputstvo

Ovaj dokument pokriva sve što je potrebno da projekat radi na novom računaru od nule.

---

## Preduslovi

Instaliraj sledeće ako već nisu instalirani:

| Alat | Verzija | Link |
|------|---------|------|
| Node.js | 20+ LTS | https://nodejs.org |
| Git | bilo koja | https://git-scm.com |
| Docker Desktop | bilo koja | https://www.docker.com/products/docker-desktop |
| Supabase CLI | latest | `npm install -g supabase` |

> Docker Desktop mora biti **pokrenut** pre nego što startuješ Supabase lokalno.

---

## 1. Kloniraj repo

```bash
git clone <repo-url> aisistent
cd aisistent
npm install
```

---

## 2. Environment varijable

Napravi `.env.local` u root folderu. Vrednosti za lokalni development su uvek iste
(Supabase lokalno generiše iste demo ključeve):

```env
# Supabase — lokalni development (uvek iste vrednosti)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<vidi korak 3>
SUPABASE_SERVICE_ROLE_KEY=<vidi korak 3>

# Claude API — uzmi sa console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Stripe — uzmi sa dashboard.stripe.com (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend — uzmi sa resend.com
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Supabase lokalno

### Pokretanje

```bash
npx supabase start
```

Ovo će povući Docker image-e (prvi put traje nekoliko minuta) i ispisati:

```
API URL:        http://127.0.0.1:54321
GraphQL URL:    http://127.0.0.1:54321/graphql/v1
DB URL:         postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:     http://127.0.0.1:54323
Inbucket URL:   http://127.0.0.1:54324
anon key:       eyJ...
service_role key: eyJ...
```

Kopiraj `anon key` i `service_role key` u `.env.local`.

### Primena migracija (kreira tabele)

```bash
npx supabase migration up --local
```

Trebalo bi da vidiš:
```
Applying migration 20260603000001_initial_schema.sql...
Local database is up to date.
```

### Provera (opcionalno)

Otvori Supabase Studio u browseru: http://127.0.0.1:54323

Table Editor → trebalo bi da vidiš `profiles`, `documents`, `subscriptions`.

---

## 4. Pokretanje aplikacije

```bash
npm run dev
```

Aplikacija je dostupna na http://localhost:3000.

---

## 5. Svaki sledeći put (restart računara)

```bash
# Pokreni Docker Desktop, zatim:
npx supabase start
npm run dev
```

Baza se čuva između restartova — nema potrebe za ponovnom migracijom.

---

## 6. Gašenje Supabase-a

```bash
npx supabase stop
```

Dodaj `--no-backup` ako ne trebaš da čuvaš stanje baze:

```bash
npx supabase stop --no-backup
```

---

## Česta pitanja

**"Cannot connect to Docker"** — Docker Desktop nije pokrenut. Pokretaj ga pre `supabase start`.

**"Port 54321 already in use"** — Supabase već radi. Proveri sa `npx supabase status`.

**"migration already applied"** — Normalno. Migracija se ne primenjuje dva puta.

**Zaboravili ste ključeve?** — Uvek možete dobiti vrednosti sa `npx supabase status`.

---

## Produkcija (Vercel deploy)

1. Napravi projekat na supabase.com i poveži ga: `npx supabase link --project-ref <ref>`
2. Primeni migracije na produkciju: `npx supabase db push`
3. Na Vercel dashboard dodaj sve env varijable (produkcione vrednosti, ne lokalne)
4. `git push` → Vercel automatski deploya

---

*Poslednje ažurirano: jun 2026*
