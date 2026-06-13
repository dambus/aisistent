# 002 — Payment gateway

**Datum:** jun 2026.
**Status:** Na čekanju (čeka APR registraciju)

## Odluka
Koristimo **Paddle** umesto Stripe-a.

## Zašto ne Stripe
Srbija nije podržana kao zemlja za Stripe merchants.
Srpske firme ne mogu primati uplate direktno kroz Stripe.

## Zašto Paddle
- Podržava Srbiju
- Merchant of Record model — Paddle preuzima poreske obaveze
- Jednostavna integracija

## Status
Čeka fizičku posetu APR-u i registraciju preduzetničke radnje.
Dok se ne reši, B2B klijenti plaćaju fakturom + bankovnim transferom.

## Kada preispitati
Ako Stripe doda podršku za Srbiju, ili ako se pojavi bolji MoR.
