# AIsistent — Bug Tracker
### Konsolidovani izveštaj grešaka po tipovima dokumenata
*jun 2026. — na osnovu pregleda svih 7 ugovornih tipova*

---

## ✅ Rešeni bugovi (jun 2026.)

| ID | Commit | Opis |
|----|--------|------|
| SYS-01 | ce35593 | Trailing heading cleanup u markdownParser + docxBuilder + svih 17 promptova |
| BUG-024/025 | f9f5f41 | Dupli potpis i PIB umesto imena u punomoćju |
| BUG-016 | bcb498c | PDV placeholder u ugovoru o zakupu — pametna logika |
| SYS-03 | db3be4a | Iznosi slovima razdvojeno u svim ugovornim promptovima |
| SYS-04 | db3be4a | Zabrana računanja datuma u svim ugovornim promptovima |
| BUG-001 | 843e1b6 | companyFieldMap ugovor-o-radu naziv i mb |
| BUG-007 | 1e84af0 | Dupli naslov u ugovoru o delu |
| BUG-009 | 1e84af0 | Potpis izvođača bez zastupnika u ugovoru o delu |
| BUG-027/030 | 7bebef8 | Dupli disclaimer u punomoćju i opštim uslovima |
| BUG-032 | 00c1029 | Faktura PDF dijakritici u labelama — već bilo očišćeno |
| BUG-033 | 00c1029 | Faktura DOCX PIB primaoca — fix praznog string uslova |
| BUG-037 | bac926d | Višeći naslov u DOCX — rešeno DOCX reformatiranjem |
| DOCX-FORMAT | bac926d | DOCX: prored 1.5→1.15, spacing poglavlja, potpisi u tabeli 3 kolone |
| BUG-040 | ece4f1b | DOCX M.P. red — robusniji hasMP uslov |
| BUG-041 | ece4f1b | DOCX razmak pre tabele potpisa |
| BUG-042 | ece4f1b | DOCX naslovi crni umesto plavi |
| BUG-034 | fda446b | Faktura email — FakturaPDF renderer umesto raw JSON |
| BUG-035 | d7502c8 | Responsivnost wizard — overflow-x-hidden, faktura stavke kartica layout na mobilnom |
| BUG-037 | a6222c6 | DOCX trailing heading cleanup — usklađen regex i while petlja |
| BUG-039 | 4aba87e | Ugovor o radu — Član 1 više ne dupira uvodnu formulu |
| AUDIT-01 | proof-reading sesija | Zakonska usklađenost — svih 17 promptova auditovano i ispravljeno |
| AUDIT-02 | proof-reading sesija | Wizard audit — placeholder/helper/tooltip pokrivenost popunjena |
| AUDIT-03 | proof-reading sesija | Rod zastupnika — lib/utils/rod.ts implementiran |
| AUDIT-04 | proof-reading sesija | Placeholder detekcija — globalno na svim promptovima |
| AUDIT-05 | proof-reading sesija | Rendering bugovi — pravilnik potpis, punomoćje duplikat |

---

## 🟠 Sistemski bugovi (aktivni)

| ID | Opis | Prisutan u | Uzrok |
|----|------|-----------|-------|
| **SYS-02** | Orphan headings — naslov sekcije ostaje na dnu stranice, tekst prelazi na sledeću | 4/7 tipova | `wrap={false}` u `AisistentDocument.tsx` ne funkcioniše konzistentno za sve formate naslova |

---

## 🟡 Bugovi specifični za tip dokumenta

### Ugovor o radu
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-004** | "četrdeset" — pravopisna greška u iznosima i tekstu (treba "četrdeset") | Greška u promptu |
| **BUG-005** | Orphan headings na kraju stranice (Član 10, 16, 20, 22, 28) | Vidi SYS-02 |

### NDA (Sporazum o poverljivosti)
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-013** | "nedelotvorn" — nedostaje nastavak, treba "nedelotvornom" | Klasa gramatičkih grešaka u AI generisanju — može se pojaviti i u drugim tipovima |

### Ugovor o zakupu
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-019** | Nedosledan bold/normal za naslove članova — u zakupu su regular weight, u ostalim dokumentima bold | Nedoslednost u promptu ili parseru |

### Punomoćje
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-026** | "uz pisanu obaveštenje" — rod se ne slaže, treba "pisano obaveštenje" | Greška u promptu |

### Opšti uslovi i Politika privatnosti
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-028** | AI generiše i Opšte uslove i Politiku privatnosti u jednom PDF-u (11 strana) | Proveriti da li je ovo željeno ponašanje (wizard toggle) ili bug |

---

## Rešeni bugovi (jul 2026, nastavak)

| ID | Opis |
|----|------|
| BUG-043 | Ugovor o radu — `naknada_zabrana` (naknada za zabranu konkurencije) faliо u Zod šemi `app/api/generate/route.ts` (`ugovorORaduSchema`) — polje se tiho brisalo pre `buildUserMessage`, uvek generisano `[POPUNITI: naknada za zabranu konkurencije]` bez obzira šta korisnik unese u wizard-u. Otkriveno pregledom ugovora kroz C2 (pregled ugovora) feature na sopstvenom test-generisanom dokumentu. |
| BUG-044 | Ugovor o radu — klauzula o privremenom premeštaju zaposlenog bila neograničena ("u slučaju potrebe poslovanja", bez roka) — Zakon o radu ograničava na konkretne slučajeve + max 60 radnih dana. Popravljeno u `lib/prompts/ugovor-o-radu.ts` (pravilo dodato). Otkriveno C2 analizom. |
| BUG-045 | Ugovor o radu — klauzula o čuvanju poslovne tajne nije imala izuzetke (šta NIJE poslovna tajna) — jednostrano preširoka definicija. Popravljeno dodavanjem obaveznog stava o izuzecima. Otkriveno C2 analizom. |
| ✓ | Ugovor o radu — hibridni rad nije imao konkretan broj dana u kancelariji (uvek "u skladu sa internim aktima"), jer wizard nije ni prikupljao taj podatak. Dodato novo opciono wizard polje `dana_kancelarija` (samo kad `nacin_rada === 'Hibridno'`) — koristi se u generisanoj klauzuli kad je uneto. |

## Rešeni bugovi (jul 2026, dogfooding krug 3 — rollout na preostale module)

Nastavak dogfooding pattern-a sa ugovor-o-radu (baza znanja + samoprovera) na preostale module. Usput otkriven sistemski problem: Zod šeme u `app/api/generate/route.ts` se ručno održavaju odvojeno od `types/wizard.ts` interfejsa, pa je lako da polje postoji u tipu/wizard-u a nedostaje iz šeme — takvo polje se tiho briše pre `buildUserMessage` (isti mehanizam kao BUG-043).

| ID | Commit | Opis |
|----|--------|------|
| BUG-046 | 09357b7 | NDA — zabrana konkurencije nije imala polje za naknadu niti pravilo u promptu (bez naknade klauzula rizično neizvršiva). Dodato `naknada_zabrana` (tip, Zod šema, wizard, prompt pravilo). NDA takođe nije koristio `ugovorna-kazna` knowledge topic iako ima `kazna` polje — dodato. |
| BUG-047 (kritičan) | 4b253f7 | Ugovor o delu — Zod šema (`ugovorODeluSchema`) tiho brisala 5 polja: `tip_prihoda` (poreski tretman autorsko delo vs. ugovor o delu — različit zakonski član!), `broj_lk_narucioca`, `ugovorna_kazna`, `iznos_kazne_dnevno`, `garantni_rok`. Najozbiljniji: ako je korisnik birao "Autorsko delo", ugovor je uvek tiho generisan sa pogrešnim zakonskim članom (čl. 85 umesto čl. 52-55 ZPDG). |
| BUG-048 | 4b253f7 | Ugovor o delu — `zabrana` (zabrana konkurencije) toggle bez ijednog pratećeg polja (trajanje, naknada, geografsko/delatnostno ograničenje) niti pravila u promptu. Dodato sve četiri polja + pravilo, isti pattern kao BUG-046. |
| SYS-05 (sistemska provera) | 5e667f5 | Automatizovana skripta (types/wizard.ts interfejsi vs. Zod šeme) otkrila još gapova van gornjih: `ugovor-o-radu` (referentni pilot!) — `otkazni_rok_zaposleni`, `otkazni_rok_poslodavac`, `klauzula_izmene_zarade` falili iz šeme, otkazni rok se tiho uvek vraćao na default 15/30 dana bez obzira šta korisnik unese; `nda`/`ugovor-o-zakupu`/`ugovor-o-saradnji-zajmu`/`punomocje` — `broj_ugovora`; `poslovni-mejl` — `teme_sa_sastanka`; `odgovor-kandidatu` — `feedback_pozitivno`, `feedback_razlog`, `ostaje_u_bazi`. Skripta sad potvrđuje CLEAN na svih 21 tipova. |
| BUG-049 | 584c15f | Ugovor o zakupu — "Svrha zakupa" (obavezni element) i "namena prostora" (Scenario B) pominju se u promptu ali nijedno wizard polje ih nije prikupljalo. Dodato `namena_zakupa` (required). |
| BUG-050 | c2600a9 | Pravilnik o radu — `zabrana_konkurencije` toggle bez ijedne instrukcije za LLM (isti obrazac kao BUG-046/048). Dodato pravilo: Pravilnik reguliše opštu politiku (ne fiksan iznos za sve zaposlene), svaka pojedinačna klauzula u ugovoru o radu mora imati naknadu po čl. 161 st. 2 ZOR. |

Baza znanja (`lib/knowledge/`) sad importovana i u: `nda`, `ugovor-o-delu`, `ugovor-o-zakupu`, `ugovor-o-saradnji-zajmu`, `punomocje`, `pravilnik-o-radu` (uz `ugovor-o-radu` iz prethodnog kruga). `opsti-uslovi` i `resenje-godisnji-odmor`/`obavestenje-o-promeni-uslova` dobili samo samoprovera sekciju (nema odgovarajući knowledge topic ili je sadržaj već specifičan/kompletan).

## Plan fixeva

### Aktivni (po prioritetu)
1. **SYS-02** — orphan headings u `AisistentDocument.tsx`
2. **BUG-019** — nedosledan bold naslova u zakupu
3. **BUG-026** — rod agreemant u punomoćju
4. **BUG-004** — pravopis "četrdeset" u promptu za ugovor o radu
5. **BUG-028** — razjasniti da li je dual PDF u opštim uslovima feature ili bug

---

## Nove ideje za tipove dokumenata (backlog)
- *(ideje u docs/BACKLOG.md)*

---
*Kreirano: jun 2026. — ažurirati pri svakom novom nalasku ili fiksiranom bugu*
