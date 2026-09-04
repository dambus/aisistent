# Marketing Handoff Log

Ovaj fajl je append-only dnevnik promena na proizvodu koje su relevantne za marketing poruke
(Instagram, LinkedIn, oglasi). Piše ga Claude Code sesija posle svake izmene, čita ga
Claude Desktop sesija kad priprema/ažurira oglase.

**Pravilo:** Nikad ne brisati stare unose, samo dodavati nove na dno. Svaki unos ima datum,
šta se promenilo, zašto, i konkretan predlog kako to preformulisati u oglasu.

---

## 2026-09-04 — Free limit podignut sa 3 na 10 dokumenata (+ otkrivena i ispravljena greška: homepage je pisao "1 dokument")

**Šta se promenilo:** Besplatni nalog sada dozvoljava 10 dokumenata mesečno (bilo 3, stvarno primenjeno u backend-u). Vidljivo na `/profil`, dashboard `LimitsCard`, `/upgrade` cenovniku, homepage (`/`) cenovniku, onboarding-u, meta opisu stranice (`app/layout.tsx`) i modalu za dostignut limit (`UpgradeModal`).

**Bitno za marketing:** Homepage cenovnik je do sada pisao **"1 dokument mesečno"** za free plan — dok je stvarni limit u kodu bio 3. Ako je bilo koji oglas ili landing copy vučen sa tog broja, korisnici su dolazili sa očekivanjem "1 dokument" što je gore od stvarnosti i verovatno je samo po sebi odbijalo ljude da uopšte probaju. Ovo je sad ispravljeno i usklađeno na 10 svuda.

**Zašto (za marketing poruke):** Freemium limit od 1-3 dokumenta je bio prejak — korisnici nisu stizali da realno isprobaju proizvod (npr. da naprave i ugovor i fakturu) pre nego što udare u zid. 10 je dovoljno za par kompletnih proba.

**Predlog za oglase:** Svuda gde se pominje broj besplatnih dokumenata, koristiti **"10 dokumenata besplatno mesečno"** — jača i tačnija poruka, ista suštinska cena za nas (Claude API poziv po dokumentu).

---

## 2026-09-04 — Onboarding dobio rečenicu o periodu testiranja tržišta

**Šta se promenilo:** Na `/onboarding/dobrodoslica` (zeleni info-box posle unosa podataka firme), posle rečenice o besplatnom nalogu dodata rečenica: *"Ovo je period testiranja tržišta — javi nam se šta ti nedostaje, slušamo svaki predlog."*

**Zašto (za marketing poruke):** Umesto da odsustvo naplate (Paddle još nije aktivan) deluje kao da platforma "nije gotova", framing je da je ovo namerna beta/early-access faza gde se korisnikov glas traži i ceni.

**Predlog za oglase:** Formulacije tipa "Pridruži se ranim korisnicima dok je sve besplatno" ili "Rani pristup — pomozi nam da oblikujemo alat, koristi ga besplatno" umesto generičkog "počni besplatno". Izbegavati "besplatno zauvek" — koristiti "besplatno u fazi lansiranja / rani pristup", jer se naplata uskoro uvodi i ne želimo da razočaramo rane korisnike kad krene.
