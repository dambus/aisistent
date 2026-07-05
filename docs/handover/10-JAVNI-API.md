# Javni API za generisanje dokumenata — skica (dugoročno)

*BACKLOG nizak prioritet. Pisati tek kad postoji tražnja (računovođe, agencije, integratori). Ovde skica da se ne kreće od nule.*

## Kada ima smisla

Signali: agencije traže bulk generisanje, računovodstveni softveri žele fakture/ugovore iz svog UI-ja. Bez takvih upita — ne graditi.

## Skica

1. **Auth**: API ključevi po nalogu (`api_keys` tabela: key_hash, user_id, name, last_used_at, revoked) — ključ se prikazuje JEDNOM pri kreiranju, čuva se hash (bcrypt/sha256). UI u podešavanjima, Agency plan only.
2. **Endpoints v1**:
   - `POST /api/v1/documents` `{type, data}` → validacija ISTIM Zod šemama kao wizard (razlog više za 01-TECH-DEBT stavku 7 — šeme u prompt module) → generisanje → `{id, status}`
   - `GET /api/v1/documents/:id` → meta + generated_text
   - `GET /api/v1/documents/:id/pdf` → binarno
3. **Rate limit**: strogi po ključu (Upstash iz 01-TECH-DEBT stavke 2 — API bez pravog rate limita NE puštati javno)
4. **Kvote**: API pozivi troše mesečnu kvotu dokumenata kao i UI
5. **Dokumentacija**: OpenAPI spec + primer za svaki tip; polja su srpska (naziv, pib...) — dokumentovati jasno za integratore

## Zamke

- NE izlagati interne rute (`/api/generate`) direktno — poseban v1 namespace sa svojom validacijom i error formatom (`{error: {code, message}}`, stabilni code-ovi)
- Claude trošak po pozivu — API abuse je direktan novčani gubitak; kvote + rate limit NISU opcioni
- Versioning od prvog dana (`/v1/`) — menjanje ugovora sa integratorima kasnije je bolno
