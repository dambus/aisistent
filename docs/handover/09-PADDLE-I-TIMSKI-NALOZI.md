# Paddle naplata + Timski nalozi — pripremno uputstvo

*Oba BLOKIRANA na APR registraciju firme. Ovo je priprema da implementacija krene odmah po odblokiranju.*

## Paddle

### Zašto Paddle (docs/decisions/002-payment-gateway.md)
Merchant of record — Paddle rešava PDV/poreze, ne treba LLC u inostranstvu. Radi sa srpskim preduzetnikom.

### Preduslov checklist (uraditi kad firma postoji)
1. Paddle seller account (paddle.com) — verifikacija firme traje dane/nedelje, pokrenuti ODMAH po registraciji
2. Politika privatnosti + Uslovi korišćenja — Paddle ih ZAHTEVA na sajtu pre odobrenja (BACKLOG visok prioritet; pisati po ZZPL/GDPR, treba sedište/PIB/rukovalac podataka)
3. Cene: postoje na landing-u (`components/landing/PricingSection.tsx`) — potvrditi RSD/EUR strategiju (Paddle naplaćuje u EUR/USD za međunarodne kartice; za srpske korisnike razmisliti o prikazu u RSD sa naplatom u EUR)

### Implementacioni plan (kad se odblokira)
1. **Paddle Billing (v2 API, ne Classic)** — proizvodi: starter/pro/agency mesečno (+ godišnje?)
2. `app/upgrade/UpgradeClient.tsx` — trenutno postoji stranica; integrisati Paddle.js checkout overlay (client-side token, price id po planu)
3. **Webhook ruta** `app/api/webhooks/paddle/route.ts`:
   - verifikovati potpis (Paddle-Signature header)!
   - `subscription.created/updated` → upsert u `subscriptions` tabelu (KOLONE VEĆ POSTOJE: stripe_subscription_id preimenovati ili koristiti generički — migracija `rename column` ili nova paddle_subscription_id) + update `profiles.plan`
   - `subscription.canceled` → downgrade na free NA KRAJU perioda (current_period_end), ne odmah
4. **Testiranje**: Paddle sandbox environment — cela petlja subscribe→webhook→plan change→cancel pre produkcije
5. Admin panel već ima ručni set-plan (`app/api/admin/set-plan`) — zadržati kao override, ali logovati kada se koristi

### Zamke
- `profiles.plan` je izvor istine za gating u CELOJ app — webhook MORA biti pouzdan; dodati i scheduled recheck (dnevni cron: uporedi subscriptions.status sa profiles.plan, ispravi drift)
- Ne brisati postojeći free flow — korisnik bez subscription reda = free
- Webhook idempotencija: Paddle šalje retry-e — upsert po subscription id, ne insert

## Timski nalozi (posle Paddle-a — naplata po sedištu zavisi od njega)

### Arhitektura (odluka iz BACKLOG-a: workspace model)
1. Migracije: `workspaces (id, name, owner_id, plan)`, `workspace_members (workspace_id, user_id, role: owner|member, invited_at, accepted_at)`
2. **Najveća izmena**: vlasništvo podataka se pomera sa `user_id` na `workspace_id` — `documents`, `companies`, `contacts`, `catalog_items`... Opcije:
   - (a) migracija kolona `workspace_id` na sve tabele + RLS preko members join-a — ČISTO ali velika migracija
   - (b) lični workspace za svakog (user_id = workspace za solo korisnike) — postepen prelaz
   Preporuka: (b), sa auto-kreiranim ličnim workspace-om; solo korisnici ništa ne primete
3. RLS postaje: `exists (select 1 from workspace_members where workspace_id = X and user_id = auth.uid())` — SVE postojeće policies se menjaju; ovo je najrizičniji deo, testirati cross-user izolaciju temeljno
4. Invite flow: email (Resend postoji) + accept stranica; role check u API rutama
5. Naplata: Paddle quantity-based (per seat) ili flat agency plan sa max N članova — odluka sa Milanom

### Redosled
Paddle prvo i stabilno NEKOLIKO NEDELJA, pa tek onda timski nalozi. RLS promene + naplata istovremeno = previše rizika.
