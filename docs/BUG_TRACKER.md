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

---

## 🔴 Kritični bugovi (neupotrebljiv dokument)

| ID | Opis | Tip | Uzrok |
|----|------|-----|-------|
| **BUG-016** | Neresolvovani placeholder `[ne uključuje / uključuje]` u tekstu | Ugovor o zakupu | Prompt — wizard ne prosleđuje PDV status zakupodavca u prompt |
| **BUG-024** | Dupli blok potpisa — prompt generiše potpis, renderer dodaje drugi | Punomoćje | Prompt generiše potpis sekciju u tekstu, a `buildSigData` dodaje još jedan |
| **BUG-025** | PIB/JMBG umesto imena ispod linija potpisa | Punomoćje | `buildSigData` za punomoćje mapira pogrešna polja (PIB umesto zastupnik) |

---

## 🟠 Sistemski bugovi (prisutni u svim ili većini dokumenata)

| ID | Opis | Prisutan u | Uzrok |
|----|------|-----------|-------|
| **SYS-01** | Poslednji član bez teksta — naslov postoji, tekst nedostaje | Svih 7 tipova | `markdownParser.ts` seče tekst pre kraja dokumenta; regex `/^#{0,3}\s*POTPISI\s*$/i` ili slično preseca prerano |
| **SYS-02** | Orphan headings — naslov sekcije ostaje na dnu stranice, tekst prelazi na sledeću | 4/7 tipova | `wrap={false}` u `AisistentDocument.tsx` ne funkcioniše konzistentno za sve formate naslova |
| **SYS-03** | Iznosi slovima spojeni ili sa typo-om ("dvestadvadesethiljada", "petstoniljada") | 3/7 tipova | Prompt nema eksplicitno pravilo za pisanje iznosa slovima razdvojeno |
| **SYS-04** | AI pogrešno računa ili izmišlja datume (npr. rok isteka NDA) | NDA + potencijalno ostali | Prompt dozvoljava AI-u da samostalno računa datume umesto da ostavi prazno |

---

## 🟡 Bugovi specifični za tip dokumenta

### Ugovor o radu
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-001** | Modal za izbor firme ne popunjava polje "Naziv firme / poslodavca" | `companyFieldMap.ts` — mapping postoji ali wizard polje se možda zove drugačije |
| **BUG-004** | "četrdeset" — pravopisna greška u iznosima i tekstu (treba "četrdeset") | Greška u promptu |
| **BUG-005** | Orphan headings na kraju stranice (Član 10, 16, 20, 22, 28) | Vidi SYS-02 |
| **BUG-006** | "stodvadeset hiljada" spojeno umesto razdvojeno | Vidi SYS-03 |
| **BUG-037** | Član 31 — višeći naslov bez teksta, prisutan i u DOCX uprkos SYS-01 fixu | `markdownParser` trailing cleanup ne pokriva DOCX builder na isti način |
| **BUG-039** | Član 1 dupira podatke iz uvodne formule — redundantno u standardnoj srpskoj praksi | Prompt generiše i uvodnu formulu i Član 1 sa identičnim podacima o stranama |
| **BUG-040** | DOCX potpisi — M.P. red nedostaje ispod Petar Nikolić | `docxBuilder.ts` — M.P. uslov nije se aktivirao |
| **BUG-041** | DOCX potpisi — nedovoljno razmaka pre tabele potpisa (zbijeno uz "Mesto i datum potpisivanja") | `docxBuilder.ts` — nedostaje spacing before na tabeli potpisa |
| **BUG-042** | DOCX naslovi poglavlja su plavi umesto crni — nedoslednost sa PDF-om i neprikladno za pravne dokumente | `docxBuilder.ts` — h2 stil koristi color koji nije crn |

### Ugovor o delu
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-007** | Dupli naslov "UGOVOR O DELU" — jednom kao naslov, jednom inline u uvodnoj formuli | Prompt ne zabranjuje ponavljanje naslova u uvodnoj formuli |
| **BUG-008** | Iznos slovima ne odgovara iznosu ciframa (225.000 ispisano kao "dvestadvadesethiljada") | Vidi SYS-03; AI pogrešno izračunava i pogrešno piše |
| **BUG-009** | Potpis Izvođača bez imena zastupnika kada je Izvođač firma | `buildSigData` ne generiše zastupnika za drugu stranu u ugovoru o delu |
| **BUG-010** | Član 19. viseći naslov | Vidi SYS-01 |

### NDA (Sporazum o poverljivosti)
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-011** | "dvadesetčetiri" spojeno umesto "dvadeset četiri" | Vidi SYS-03 |
| **BUG-012** | Pogrešan datum isteka sporazuma — AI izračunao 15. jun 2026. za 24-mesečni sporazum potpisan u junu 2026. | Vidi SYS-04; AI ne sme da računa datume |
| **BUG-013** | "nedelotvorn" — nedostaje nastavak, treba "nedelotvornom" | Greška u AI generisanju, klasa gramatičkih grešaka |
| **BUG-014** | Član 25. viseći naslov | Vidi SYS-01 |

### Ugovor o zakupu
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-015** | "petstoniljada" — typo ("niljada" umesto "hiljada") + spojeno pisanje | Vidi SYS-03 |
| **BUG-016** | `[ne uključuje / uključuje]` — neresolvovani template placeholder za PDV | **KRITIČAN** — vidi tabelu iznad |
| **BUG-017** | Typo iz wizard inputa reprodukovan bez korekcije ("tenički" umesto "tehnički") | AI ne koriguje typo-ove u unetim podacima — očekivano ponašanje, ali vredi napomenuti |
| **BUG-018** | Član 29. i Član 36. viseći naslovi | Vidi SYS-01 |
| **BUG-019** | Nedosledan bold/normal za naslove članova — u zakupu su regular weight, u ostalim dokumentima bold | Nedoslednost u promptu ili parseru |

### Ugovor o saradnji
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-021** | Član 32. viseći naslov | Vidi SYS-01 |
| **BUG-022** | "četrdeset procenata" — proveriti pravopis | Vidi BUG-004 |

### Punomoćje
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-024** | Dupli blok potpisa | **KRITIČAN** — vidi tabelu iznad |
| **BUG-025** | PIB/JMBG umesto imena ispod potpisa | **KRITIČAN** — vidi tabelu iznad |
| **BUG-026** | "uz pisanu obaveštenje" — rod se ne slaže, treba "pisano obaveštenje" | Greška u promptu |
| **BUG-027** | Dupli/trojni disclaimer — inline u tekstu + footer = 3 napomene | Prompt generiše disclaimer koji se duplira sa standardnim footer disclaimerom |

### Faktura / Profaktura
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-032** | PDF: dijakritici nedostaju u label stringovima ("ROK PLACANJA", "PODACI ZA PLACANJE", "Racun:", "obracunat") | `fakturaRenderer.tsx` — fix iz prethodnog prompta nije potpuno primenjen, `sanitizeText()` ne pokriva sve hardkodovane labele |
| **BUG-033** | DOCX: PIB primaoca ne prikazuje se u dokumentu iako je unesen | `docx/route.ts` — primalac_pib polje se ne renderuje u DOCX builder-u |
| **BUG-034** | Faktura poslata emailom stiže kao JSON u PDF prilogu umesto generisane fakture | `app/api/send-document/route.ts` — email ruta koristi standardni PDF renderer koji ne prepoznaje faktura tip, šalje raw JSON umesto FakturaPDF komponente |

### Wizard / UI
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-035** | Responsivnost — različiti wizard tipovi su različitih širina i izlaze van viewport-a na mobilnim uređajima (potreban zoom out) | Wizard koraci nemaju konzistentne max-width i overflow constraints; tabela stavki u faktura wizardu posebno problematična na uskim ekranima |

### Opšti uslovi i Politika privatnosti
| ID | Opis | Uzrok |
|----|------|-------|
| **BUG-028** | AI generiše i Opšte uslove i Politiku privatnosti u jednom PDF-u (11 strana) | Proveriti da li je ovo željeno ponašanje (wizard toggle) ili bug |
| **BUG-029** | "11. ZAVRŠNE NAPOMENE" viseći naslov | Vidi SYS-01 |
| **BUG-030** | Dupli disclaimer (inline + footer) | Vidi BUG-027 |
| **BUG-031** | "offce@sigma.rs" — slovo "i" nedostaje u "office" kroz ceo dokument | Verovatno korisnički input typo koji AI nije korigovao |

---

## Plan fixeva

### Faza 1 — Kritični (odmah)
1. **SYS-01** — fix `markdownParser.ts` regex koji seče tekst
2. **BUG-024 + BUG-025** — fix punomoćje: ukloniti potpis iz prompta, ispraviti `buildSigData`
3. **BUG-016** — fix PDV placeholder u ugovoru o zakupu

### Faza 2 — Sistemski
4. **SYS-02** — orphan headings u `AisistentDocument.tsx`
5. **SYS-03** — dodati pravilo za pisanje iznosa slovima u sve promptove
6. **SYS-04** — zabrana računanja datuma u svim promptovima (dodati u ŠTA NE RADIŠ)

### Faza 3 — Po tipu dokumenta
7. **BUG-001** — companyFieldMap za ugovor o radu
8. **BUG-007** — dupli naslov u ugovoru o delu
9. **BUG-009** — potpis druge strane u ugovoru o delu
10. **BUG-027/030** — dupli disclaimer u punomoćju i opštim uslovima

---

## Nove ideje za tipove dokumenata (backlog)
- **Putni nalog** — obavezan za korišćenje službenih vozila
- *(ostale ideje u docs/BACKLOG.md)*

---
*Kreirano: jun 2026. — ažurirati pri svakom novom nalasku ili fiksiranom bugu*
