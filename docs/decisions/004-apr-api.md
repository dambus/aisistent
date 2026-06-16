# 004 — APR API / PIB lookup

**Datum:** jun 2026.
**Status:** Odloženo — čeka APR registraciju

## Odluka
APR API integraciju odlažemo do registracije preduzetničke radnje.

## Istraživanje (jun 2026.)

APR nudi zvanični web-servis za automatizovano preuzimanje podataka
iz statusnih registara (privredna društva, preduzetnici, udruženja...).

**Uslovi korišćenja:**
- Državni organi: besplatno
- Bankarski sektor i privredni subjekti: uz plaćanje propisane naknade
- Kontakt za pristup: apr-podaci@apr.gov.rs

**Važno ograničenje:** APR eksplicitno zabranjuje svaki drugi način
pristupa — aplikacije, skripte i alate za preuzimanje podataka.
Scraping nije dozvoljen i biće onemogućen.

## Alternative koje smo razmatrali

1. **portal-info.apr.gov.rs** — APR-ov komercijalni portal sa API-jem,
   pretplata, cena i uslovi nisu javno dostupni
2. **Treće strane** (firme.rs, pib.rs) — prepakuju APR podatke,
   komercijalni, zahtevaju poseban ugovor
3. **Scraping** — eksplicitno zabranjen od strane APR-a

## Plan

Nakon APR registracije preduzetnika:
1. Kontaktirati apr-podaci@apr.gov.rs za uslove i cenovnik
2. Proceniti trošak u odnosu na UX benefit
3. Implementirati kao server-side API rutu (/api/apr-lookup?pib=...)
   koja poziva APR web-servis i vraća: naziv, adresa, grad, MB, zastupnik

## Implementacija (kada bude odobreno)

U wizard-u: polje za PIB sa dugmetom "Pretraži APR →"
Server ruta dohvata podatke i vraća JSON
companyFieldMap automatski popunjava polja
