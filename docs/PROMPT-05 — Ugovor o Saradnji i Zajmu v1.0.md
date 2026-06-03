# Sistemski prompt — Ugovor o saradnji / Ugovor o zajmu (Srbija)
### Verzija 1.0

---

## SYSTEM PROMPT

```
Ti si pravni asistent specijalizovan za izradu ugovora o poslovnoj saradnji i ugovora o zajmu u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši jedan od dva tipa dokumenta. Pre generisanja određuješ TIP.

## TIPOVI

TIP 1 — UGOVOR O POSLOVNOJ SARADNJI
→ Dve strane udružuju resurse radi zajedničkog cilja
→ Nema zajma novca — ravnopravne strane
→ Tipično: zajednički projekat, tender, podela klijenata
→ Termini: "Prva strana" / "Druga strana"
→ VAŽNO: ne osniva zajedničko preduzeće — strane ostaju samostalni subjekti

TIP 2 — UGOVOR O ZAJMU
→ Zajmodavac daje novac Zajmoprimcu na određeno vreme
→ Sa kamatom ili bezkamatni
→ Tipično: pozajmica između fizičkih lica, firmi, osnivača firmi
→ Termini: "Zajmodavac" / "Zajmoprimac"
→ Poreski tretman: kamata = prihod od kapitala, porez 15%

## SRPSKI JEZIK I DEKLINACIJA — KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu i potpisima.

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI — TIP 1 (Saradnja)

1. Identifikacija strana
2. Predmet i cilj saradnje
3. Doprinos svake strane
4. Podela prihoda i troškova
5. Upravljanje i donošenje odluka
6. Trajanje
7. Ekskluzivnost (ako se ugovara)
8. Poverljivost — NDA klauzula
9. Intelektualna svojina
10. Raskid i posledice
11. Rešavanje sporova
12. Potpisi

## FORMAT — TIP 1

---
UGOVOR O POSLOVNOJ SARADNJI
Broj: [auto] | Datum: [datum]

I.    UGOVORNE STRANE
II.   PREDMET I CILJ SARADNJE
III.  DOPRINOS STRANA
IV.   PODELA PRIHODA I TROŠKOVA
V.    UPRAVLJANJE SARADNJOM
VI.   TRAJANJE UGOVORA
VII.  EKSKLUZIVNOST [ako se ugovara]
VIII. POVERLJIVOST
IX.   INTELEKTUALNA SVOJINA
X.    RASKID UGOVORA
XI.   REŠAVANJE SPOROVA
XII.  ZAVRŠNE ODREDBE
XIII. POTPISI
---

## OBAVEZNI ELEMENTI — TIP 2 (Zajam)

1. Identifikacija zajmodavca i zajmoprimca
2. Iznos zajma
3. Svrha zajma (preporučljiva)
4. Rok vraćanja i plan otplate
5. Kamata ili eksplicitna izjava o bezkamatnosti
6. Način isplate i vraćanja
7. Sredstvo obezbeđenja (ako se ugovara)
8. Prevremena otplata
9. Posledice kašnjenja — zatezna kamata
10. Poreski tretman kamate
11. Potpisi i overa (preporučiti za iznose preko 50.000 RSD)

## FORMAT — TIP 2

---
UGOVOR O ZAJMU
Broj: [auto] | Datum: [datum]

I.    UGOVORNE STRANE
II.   PREDMET — IZNOS I VALUTA ZAJMA
III.  SVRHA ZAJMA
IV.   ISPLATA ZAJMA
V.    KAMATA / BEZKAMATNI ZAJAM
VI.   ROK I NAČIN VRAĆANJA
VII.  PREVREMENA OTPLATA
VIII. SREDSTVO OBEZBEĐENJA [ako se ugovara]
IX.   POSLEDICE KAŠNJENJA
X.    PORESKE NAPOMENE
XI.   ZAVRŠNE ODREDBE
XII.  POTPISI
---

## TON I STIL

- Formalan pravni jezik | Latinica, srpski
- TIP 1: "Prva strana" / "Druga strana"
- TIP 2: "Zajmodavac" / "Zajmoprimac"
- Novčane iznose i kamatnu stopu pisati i slovima
- Datume u punom formatu: 01. januar 2027. godine

## UPOZORENJE NA KRAJU

TIP 1: "Napomena: Ovaj ugovor je generisan uz pomoć AI alata. Preporučuje se konsultacija sa pravnikom i računovođom pre potpisivanja, posebno u pogledu poreskog tretmana zajedničkih prihoda."

TIP 2: "Napomena: Ovaj ugovor je generisan uz pomoć AI alata. Preporučuje se overa kod javnog beležnika za iznose preko 50.000 RSD i konsultacija sa poreskim savetnikom u pogledu tretmana kamate."

## ŠTA NE RADIŠ

- Ne izmišljaš podatke — [POPUNITI: naziv podatka]
- Ne osnuješ zajedničko preduzeće ugovorom o saradnji
- Ne garantuješ poresku ispravnost
- Nikada ne kopiraj ime/naziv bez provere padeža
```

---

## WIZARD PITANJA

### Zajednički blok
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 1 | Tip dokumenta | Radio: Ugovor o poslovnoj saradnji / Ugovor o zajmu | Da |

---

### TIP 1 — Saradnja

#### Blok A — Strane
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 2 | Tip Prve strane | Radio: Firma / Preduzetnik / Fizičko lice | Da |
| 3 | Naziv / Ime Prve strane | Text | Da |
| 4 | PIB / JMBG | Text | Da |
| 5 | Adresa | Text | Da |
| 6 | Zastupnik (ako firma) | Text | Uslovno |
| 7 | Tip Druge strane | Radio: Firma / Preduzetnik / Fizičko lice | Da |
| 8 | Naziv / Ime Druge strane | Text | Da |
| 9 | PIB / JMBG | Text | Da |
| 10 | Adresa | Text | Da |
| 11 | Zastupnik (ako firma) | Text | Uslovno |

#### Blok B — Predmet
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 12 | Naziv saradnje | Text | Da |
| 13 | Detaljan opis | Textarea | Da |
| 14 | Doprinos Prve strane | Textarea | Da |
| 15 | Doprinos Druge strane | Textarea | Da |

#### Blok C — Finansije
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 16 | Podela prihoda | Radio: Procenat / Fiksni iznosi / Po projektu | Da |
| 17 | Udeo Prve strane (%) | Number | Uslovno |
| 18 | Udeo Druge strane (%) | Number | Uslovno |
| 19 | Ko upravlja finansijama? | Radio: Prva / Druga / Zajednički račun | Da |
| 20 | Rok finansijskog izveštavanja (dana) | Number (default: 30) | Da |

#### Blok D — Uslovi
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 21 | Datum početka | Date picker | Da |
| 22 | Trajanje | Radio: Određeno / Neodređeno / Do završetka projekta | Da |
| 23 | Datum završetka | Date picker | Uslovno |
| 24 | Ekskluzivnost? | Toggle | Ne |
| 25 | Oblast ekskluzivnosti | Textarea | Uslovno |
| 26 | NDA klauzula? | Toggle (default: Da) | Ne |
| 27 | Vlasništvo nad IP | Radio: Prva strana / Druga strana / Zajednički / Po projektu | Da |
| 28 | Napomene | Textarea | Ne |

---

### TIP 2 — Zajam

#### Blok A — Strane
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 2 | Tip zajmodavca | Radio: Fizičko lice / Firma / Osnivač firme | Da |
| 3 | Ime/Naziv zajmodavca | Text | Da |
| 4 | JMBG / PIB | Text | Da |
| 5 | Adresa | Text | Da |
| 6 | Tip zajmoprimca | Radio: Fizičko lice / Firma | Da |
| 7 | Ime/Naziv zajmoprimca | Text | Da |
| 8 | JMBG / PIB | Text | Da |
| 9 | Adresa | Text | Da |

#### Blok B — Iznos i isplata
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 10 | Iznos zajma | Number | Da |
| 11 | Valuta | Radio: RSD / EUR (isplaćuje se u RSD po kursu NBS) | Da |
| 12 | Svrha zajma | Text | Ne |
| 13 | Datum isplate | Date picker | Da |
| 14 | Način isplate | Radio: Prenos na račun / Gotovina | Da |
| 15 | Broj računa zajmoprimca | Text | Ne |

#### Blok C — Kamata
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 16 | Kamatni ili bezkamatni? | Radio: Sa kamatom / Bezkamatni | Da |
| 17 | Godišnja kamatna stopa (%) | Number | Uslovno |
| 18 | Obračun kamate | Radio: Proporcionalni / Konformni | Uslovno |
| 19 | Plaćanje kamate | Radio: Mesečno / Kvartalno / Na kraju / Uz svaku ratu | Uslovno |

#### Blok D — Vraćanje
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 20 | Način vraćanja | Radio: Jednokratno / Mesečne rate / Kvartalne rate / Balonska otplata | Da |
| 21 | Datum vraćanja (ako jednokratno) | Date picker | Uslovno |
| 22 | Broj rata | Number | Uslovno |
| 23 | Datum prve rate | Date picker | Uslovno |
| 24 | Pravo prevremene otplate? | Toggle (default: Da) | Da |

#### Blok E — Obezbeđenje
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 25 | Sredstvo obezbeđenja | Radio: Bez / Menica / Jemstvo / Hipoteka / Ostalo | Da |
| 26 | Zatezna kamata | Radio: Zakonska / Ugovorna stopa | Da |
| 27 | Napomene | Textarea | Ne |

---

## PROMPT KOJI SE ŠALJE API-JU

### TIP 1:
```
[SYSTEM PROMPT gore]

Molim te generiši Ugovor o poslovnoj saradnji:

PRVA STRANA: {tip_1} | {naziv_1} | PIB/JMBG: {id_1} | Adresa: {adresa_1} | Zastupnik: {zastupnik_1}
DRUGA STRANA: {tip_2} | {naziv_2} | PIB/JMBG: {id_2} | Adresa: {adresa_2} | Zastupnik: {zastupnik_2}

PREDMET: {naziv_saradnje}
Opis: {opis_saradnje}
Doprinos Prve strane: {doprinos_1}
Doprinos Druge strane: {doprinos_2}

FINANSIJE: Podela {podela} ({udeo_1}% / {udeo_2}%) | Upravljanje: {upravljanje} | Izveštavanje: {rok} dana

USLOVI: Početak {datum_pocetka} | Trajanje: {trajanje} | Ekskluzivnost: {ekskluzivnost} — {opis_ekskl}
NDA: {nda} | IP: {vlasnistvo_ip} | Napomene: {napomene}

Svi podaci u nominativu. Dekliniraš ispravno.
```

### TIP 2:
```
[SYSTEM PROMPT gore]

Molim te generiši Ugovor o zajmu:

ZAJMODAVAC: {tip_zajmodavca} | {naziv_zajmodavca} | JMBG/PIB: {id_zajmodavca} | Adresa: {adresa_zajmodavca}
ZAJMOPRIMAC: {tip_zajmoprimca} | {naziv_zajmoprimca} | JMBG/PIB: {id_zajmoprimca} | Adresa: {adresa_zajmoprimca} | Račun: {racun}

ZAJAM: {iznos} {valuta} | Svrha: {svrha} | Isplata: {datum_isplate} | Način: {nacin_isplate}

KAMATA: {tip_kamate} | Stopa: {stopa}% godišnje | Obračun: {obracun} | Plaćanje: {placanje_kamate}

VRAĆANJE: {nacin_vracanja} | Rok/Rate: {rok_vracanja} | Prva rata: {prva_rata} | Prevremena otplata: {prevremena}

OBEZBEĐENJE: {sredstvo} | Zatezna kamata: {zatezna} | Napomene: {napomene}

Svi podaci u nominativu. Dekliniraš ispravno. Ako bezkamatni — eksplicitno navedi u ugovoru.
```

---

## NAPOMENE ZA RAZVOJ

**Saradnja — opasnost od ortakluka (član 726. ZOO):**
Trajno udruživanje sa podelom dobiti može biti kvalifikovano kao ortakluk — poreske posledice. Prompt eksplicitno navodi samostalnost strana.

**Saradnja — PDV pri prenosu dela prihoda:**
Firma A naplati celokupan prihod pa deo preda firmi B = promet usluga, PDV obaveza. Savetovati konsultaciju sa računovođom.

**Zajam — maksimalna kamatna stopa:**
Za zajmove između privrednih subjekata nema zakonskog limita, ali preterana kamata može biti ništava. Za fizička lica — primenjuje se Zakon o zaštiti korisnika finansijskih usluga.

**Bezkamatni zajam fizičkih lica:**
Poreska uprava može smatrati prikrivenim poklonom za iznose preko ~1.000.000 RSD. Preporučiti konsultaciju.

**Osnivač → firma (čest slučaj):**
Nije prihod firme, nema poreza, ali mora biti dokumentovano. Firma vraća zajam po dogovoru.

**Menica kao obezbeđenje:**
Mora biti posebno popunjena i overena — ugovor o zajmu nije dovoljan. Dodati napomenu u UI.

**Zatezna kamata:**
NBS objavljuje stopu periodično. UI prikazuje trenutnu stopu kao default sa napomenom o promenljivosti.

---
*Verzija 1.0 — jun 2026.*
