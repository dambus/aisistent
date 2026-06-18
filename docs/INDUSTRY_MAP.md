# INDUSTRY_MAP.md — Delatnosti i prioriteti alata na dashboardu

## Prioriteti

- 🔴 **Featured** — istaknuto na dashboardu, prikazuje se prvo
- 🟡 **Secondary** — dostupno, nije u fokusu
- ⚫ **Hidden** — nije prikazano na dashboardu (uvek dostupno kroz "svi alati")

## Važno za implementaciju

- Hidden ne znači zaključano — svaki alat je uvek dostupan kroz sidebar ili "svi alati" sekciju
- Delatnost se čuva u `profiles.industry` koloni (dodati u Supabase migraciju)
- Struktura mora biti skalabilna — nova delatnost = novi unos u config mapi, bez izmene komponenti
- NE dirati postojeće wizard komponente, prompt fajlove, PDF/DOCX rendere
- Dashboard reorder je čisto presentacioni sloj — ne utiče na generisanje

## Delatnosti i mapiranje

### 1. Preduzetnik / Opšte (default)
Koristi se kada korisnik ne izabere delatnost ili nije siguran.

| Prioritet | Alati |
|---|---|
| 🔴 Featured | faktura, poslovni-mejl, ponuda-klijentu, ugovor-o-delu, opis-proizvoda |
| 🟡 Secondary | bio-o-nama, nda, putni-nalog, kalkulator-pausala, kalkulator-ugovora-o-delu |
| ⚫ Hidden | sve ostalo |

### 2. Trgovina i prodaja

| Prioritet | Alati |
|---|---|
| 🔴 Featured | faktura, otpremnica, ponuda-klijentu, opis-proizvoda, poslovni-mejl |
| 🟡 Secondary | bio-o-nama, putni-nalog, ugovor-o-saradnji, nda, opsti-uslovi |
| ⚫ Hidden | sve ostalo |

### 3. Usluge i zanatstvo

| Prioritet | Alati |
|---|---|
| 🔴 Featured | opis-proizvoda, bio-o-nama, ponuda-klijentu, faktura, poslovni-mejl |
| 🟡 Secondary | ugovor-o-delu, punomocje, putni-nalog, kalkulator-ugovora-o-delu, ponuda-za-radove |
| ⚫ Hidden | sve ostalo |

### 4. Građevina i izvođači radova

| Prioritet | Alati |
|---|---|
| 🔴 Featured | ponuda-za-radove, faktura, ugovor-o-delu, otpremnica, kalkulator-ugovora-o-delu |
| 🟡 Secondary | ugovor-o-saradnji, poslovni-mejl, bio-o-nama, opis-proizvoda, oglas-za-posao, putni-nalog, nda, ponuda-klijentu |
| ⚫ Hidden | sve ostalo |

### 5. Računovodstvo i finansije

| Prioritet | Alati |
|---|---|
| 🔴 Featured | kalkulator-zarade, kalkulator-pausala, kalkulator-ugovora-o-delu, ugovor-o-radu, ugovor-o-delu, poslovni-mejl |
| 🟡 Secondary | ugovor-o-saradnji, nda, punomocje, faktura, resenje-godisnji-odmor, pravilnik-o-radu, opsti-uslovi |
| ⚫ Hidden | sve ostalo |

### 6. Marketing i PR

| Prioritet | Alati |
|---|---|
| 🔴 Featured | poslovni-mejl, opis-proizvoda, bio-o-nama, ponuda-klijentu, faktura |
| 🟡 Secondary | oglas-za-posao, odgovor-kandidatu, preporuka, zapisnik-sastanak, ugovor-o-delu, nda, punomocje, putni-nalog, ugovor-o-saradnji, kalkulator-ugovora-o-delu |
| ⚫ Hidden | sve ostalo |

### 7. HR i regrutacija

| Prioritet | Alati |
|---|---|
| 🔴 Featured | oglas-za-posao, odgovor-kandidatu, preporuka, resenje-godisnji-odmor, pravilnik-o-radu, poslovni-mejl |
| 🟡 Secondary | ugovor-o-radu, ugovor-o-delu, nda, faktura, opis-proizvoda, bio-o-nama, zapisnik-sastanak, kalkulator-zarade |
| ⚫ Hidden | sve ostalo |

### 8. Freelancer / Konsultant

| Prioritet | Alati |
|---|---|
| 🔴 Featured | ugovor-o-delu, nda, ponuda-klijentu, poslovni-mejl, faktura, kalkulator-ugovora-o-delu |
| 🟡 Secondary | opsti-uslovi, opis-proizvoda, bio-o-nama, ugovor-o-saradnji, kalkulator-pausala, putni-nalog |
| ⚫ Hidden | sve ostalo |

### 9. Zdravlje i lepota

| Prioritet | Alati |
|---|---|
| 🔴 Featured | opis-proizvoda, bio-o-nama, ponuda-klijentu, faktura, poslovni-mejl |
| 🟡 Secondary | ugovor-o-delu, nda, opsti-uslovi, kalkulator-ugovora-o-delu, putni-nalog, oglas-za-posao |
| ⚫ Hidden | sve ostalo |

### 10. Ugostiteljstvo i turizam

| Prioritet | Alati |
|---|---|
| 🔴 Featured | faktura, opis-proizvoda, poslovni-mejl, ponuda-klijentu, bio-o-nama |
| 🟡 Secondary | otpremnica, putni-nalog, ugovor-o-delu, oglas-za-posao, opsti-uslovi |
| ⚫ Hidden | sve ostalo |

## Dodavanje nove delatnosti (skalabilnost)

1. Dodati novi unos u `INDUSTRY_CONFIG` mapu u `lib/industryConfig.ts`
2. Dodati novi string u `industry` enum u Supabase migraciji
3. Dodati opciju u onboarding UI
4. Nije potrebno menjati dashboard komponentu ako je config-driven
