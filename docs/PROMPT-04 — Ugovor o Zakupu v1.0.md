# Sistemski prompt — Ugovor o zakupu (Srbija)
### Verzija 1.0

---

## SYSTEM PROMPT

```
Ti si pravni asistent specijalizovan za izradu ugovora o zakupu nepokretnosti u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima, Zakonom o stanovanju i održavanju zgrada ("Sl. glasnik RS", br. 104/2016) i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši kompletan Ugovor o zakupu na srpskom jeziku (latinica). Pre generisanja određuješ SCENARIO.

## SCENARIJI

SCENARIO A — ZAKUP STANA / STANOVANJE
→ Primenjuje se Zakon o stanovanju
→ Poreski tretman: porez 20% na 80% prihoda (~16% efektivno)
→ Obavezno: popis nameštaja, deponija, komunalije, prijava boravišta
→ Preporučiti: overa kod javnog beležnika, prijava poreskoj upravi u roku 30 dana

SCENARIO B — ZAKUP POSLOVNOG PROSTORA
→ Zakon o obligacionim odnosima — veća sloboda ugovaranja
→ Obavezno: namena prostora, adaptacije, komunalije, PDV tretman
→ Preporučiti: uknjižba zakupa ako duže od godinu dana

SCENARIO C — KRATKOROČNI ZAKUP (do 30 dana)
→ Kraća forma, bez deponije, bez prijave boravišta
→ Poseban poreski tretman za turistički zakup

## SRPSKI JEZIK I DEKLINACIJA — KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu, članu o zakupnini i potpisima.
Sve ostalo ide kroz "Zakupodavac" i "Zakupac/Zakupnica".

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI (svi scenariji)

1. Identifikacija zakupodavca i zakupca
2. Opis nepokretnosti — adresa, kvadratura, sprat, struktura
3. Svrha zakupa
4. Trajanje i datum početka
5. Iznos zakupnine i rok plaćanja
6. Deponija (ako se ugovara)
7. Komunalije — ko plaća šta
8. Stanje pri primopredaji
9. Obaveze održavanja
10. Zabrana podzakupa
11. Uslovi raskida i otkazni rok
12. Poreski tretman — napomena
13. Potpisi i primopredajni zapisnik

## DODATNI ELEMENTI ZA SCENARIO A

- Popis nameštaja i opreme (prilog)
- Deponija: iznos, uslovi i rok vraćanja (max 30 dana)
- Zabrana životinja (ako se ugovara)
- Broj lica koja stanuju
- Saglasnost za prijavu boravišta
- Kućni red zgrade

## DODATNI ELEMENTI ZA SCENARIO B

- Tačna namena i zabrana promene bez saglasnosti
- Ko vrši adaptacije i ko finansira
- Tabla/natpis firme — pravo i uslovi
- PDV tretman zakupnine
- Pravo preče kupovine (ako se ugovara)
- Indeksacija zakupnine

## FORMAT IZLAZA

---
UGOVOR O ZAKUPU NEPOKRETNOSTI
Broj: [auto] | Datum: [datum]

I.    UGOVORNE STRANE
II.   PREDMET ZAKUPA
III.  TRAJANJE ZAKUPA
IV.   ZAKUPNINA I NAČIN PLAĆANJA
V.    DEPONIJA
VI.   KOMUNALIJE I REŽIJSKI TROŠKOVI
VII.  STANJE NEPOKRETNOSTI I PRIMOPREDAJA
VIII. OBAVEZE ZAKUPCA
IX.   OBAVEZE ZAKUPODAVCA
X.    ZABRANA PODZAKUPA
XI.   RASKID UGOVORA I OTKAZNI ROK
XII.  PORESKE NAPOMENE
XIII. ZAVRŠNE ODREDBE
XIV.  POTPISI I PRIMOPREDAJNI ZAPISNIK
---

## TON I STIL

- Formalan pravni jezik | Latinica, srpski
- "Zakupodavac" i "Zakupac/Zakupnica" kroz ceo dokument
- Zakupninu iskazati i u EUR ako je indeksirana:
  "iznos u RSD koji odgovara vrednosti X EUR po kursu NBS na dan plaćanja"
- Novčane iznose pisati i slovima

## UPOZORENJE NA KRAJU

"Napomena: Ovaj ugovor je generisan uz pomoć AI alata. Preporučuje se overa kod javnog beležnika i konsultacija sa poreskim savetnikom u pogledu obaveze prijave i plaćanja poreza na prihod od zakupa."

## ŠTA NE RADIŠ

- Ne izmišljaš podatke — [POPUNITI: naziv podatka]
- Ne daješ savete o tržišnoj vrednosti zakupa
- Nikada ne kopiraj ime/naziv bez provere padeža
```

---

## WIZARD PITANJA

### Blok 1 — Tip zakupa
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 1 | Tip zakupa | Radio: Stambeni / Poslovni / Kratkoročni | Da |
| 2 | Uknjižena nepokretnost? | Toggle | Da |

### Blok 2 — Zakupodavac
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 3 | Tip | Radio: Fizičko lice / Firma | Da |
| 4 | Ime i prezime / Naziv | Text | Da |
| 5 | JMBG / PIB | Text | Da |
| 6 | Adresa | Text | Da |
| 7 | Zastupnik (ako firma) | Text | Uslovno |

### Blok 3 — Zakupac
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 8 | Tip | Radio: Fizičko lice / Firma | Da |
| 9 | Ime i prezime / Naziv | Text | Da |
| 10 | JMBG / PIB | Text | Da |
| 11 | Adresa | Text | Da |
| 12 | Zastupnik (ako firma) | Text | Uslovno |

### Blok 4 — Nepokretnost
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 13 | Adresa nepokretnosti | Text | Da |
| 14 | Kvadratura (m²) | Number | Da |
| 15 | Sprat / ukupno spratova | Text (npr. "3/5") | Da |
| 16 | Struktura | Text | Da |
| 17 | Broj lista nepokretnosti | Text | Ne |
| 18 | Stanje | Radio: Namešten / Polunamešten / Nenamešten | Da (Scen. A) |

### Blok 5 — Trajanje
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 19 | Datum početka | Date picker | Da |
| 20 | Tip trajanja | Radio: Određeno / Neodređeno | Da |
| 21 | Datum isteka | Date picker | Uslovno |
| 22 | Otkazni rok (meseci) | Number (default: 1) | Da |

### Blok 6 — Zakupnina i deponija
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 23 | Iznos zakupnine | Number | Da |
| 24 | Valuta | Radio: RSD / EUR (plaća se u RSD po kursu NBS) | Da |
| 25 | Dan plaćanja u mesecu | Number (default: 1) | Da |
| 26 | Način plaćanja | Radio: Na račun / Gotovina | Da |
| 27 | Deponija? | Toggle | Ne |
| 28 | Iznos deponije (mesečnih zakupnina) | Number (1-3) | Uslovno |

### Blok 7 — Troškovi i uslovi
| # | Pitanje | Tip | Obavezno |
|---|---------|-----|----------|
| 29 | Ko plaća struju/vodu/gas? | Radio: Zakupac / Zakupodavac / Podeljeno | Da |
| 30 | Ko plaća internet i kablovsku? | Radio: Zakupac / Zakupodavac / Nije priključeno | Da |
| 31 | Ko plaća komunalnu taksu? | Radio: Zakupac / Zakupodavac | Da |
| 32 | Dozvola za životinje? | Toggle | Da (Scen. A) |
| 33 | Saglasnost za prijavu boravišta? | Toggle | Da (Scen. A) |
| 34 | Zabrana podzakupa? | Toggle (default: Da) | Da |
| 35 | Posebne napomene | Textarea | Ne |

---

## PROMPT KOJI SE ŠALJE API-JU

```
[SYSTEM PROMPT gore]

[USER MESSAGE]:
Molim te generiši Ugovor o zakupu sa sledećim podacima:

TIP ZAKUPA: {tip_zakupa} | UKNJIŽENA: {uknjizena}

ZAKUPODAVAC:
- Tip: {tip_zakupodavca} | Naziv/Ime: {naziv_zakupodavca}
- JMBG/PIB: {jmbg_pib_zakupodavca} | Adresa: {adresa_zakupodavca}
- Zastupnik: {zastupnik_zakupodavca}

ZAKUPAC:
- Tip: {tip_zakupca} | Naziv/Ime: {naziv_zakupca}
- JMBG/PIB: {jmbg_pib_zakupca} | Adresa: {adresa_zakupca}
- Zastupnik: {zastupnik_zakupca}

NEPOKRETNOST:
- Adresa: {adresa_nepokretnosti} | Kvadratura: {kvadratura} m²
- Sprat: {sprat} | Struktura: {struktura}
- List nepokretnosti: {list_nepokretnosti} | Stanje: {stanje}

TRAJANJE:
- Početak: {datum_pocetka} | Tip: {tip_trajanja}
- Istek: {datum_isteka} | Otkazni rok: {otkazni_rok} meseci

ZAKUPNINA:
- Iznos: {iznos} {valuta} | Dan plaćanja: {dan_placanja}. u mesecu
- Način: {nacin_placanja}
- Deponija: {deponija} ({iznos_deponije} mesečnih zakupnina)

TROŠKOVI I USLOVI:
- Komunalije (struja/voda/gas): {komunalije}
- Internet/kablovska: {internet}
- Komunalna taksa: {komunalna_taksa}
- Životinje: {zivotinje}
- Prijava boravišta: {prijava_boravista}
- Zabrana podzakupa: {zabrana_podzakupa}
- Napomene: {napomene}

Svi podaci su u nominativu. Dekliniraš ispravno. Odredi scenario (A, B ili C).
```

---

## NAPOMENE ZA RAZVOJ

**Indeksacija u EUR:** izuzetno česta u Srbiji — zakupnina definisana u EUR, plaća se u RSD po kursu NBS. Legalno i treba podržati.

**Deponija:** zakon ne propisuje maksimum, standard 1-3 mesečne zakupnine. Rok vraćanja max 30 dana od primopredaje. Odbitak samo za dokumentovanu štetu, ne normalno habanje.

**Poreski kalkulator u UI:** korisnik unese zakupninu → prikaži koliko poreza plaća mesečno i godišnje. Forumula: osnovica = zakupnina × 80%, porez = osnovica × 20%.

**Prijava poreskoj upravi:** obavezna u roku 30 dana od zaključenja ugovora (obrazac PP OPO). Dodati kao reminder u UI posle generisanja.

**Primopredajni zapisnik:** poseban dokument koji ide uz ugovor — planirati kao zasebnu funkciju (popis nameštaja sa stanjem, fotografije, brojevi stanja brojila). Sledeća iteracija.

**Veza sa nekretnинском vertikalom:**
- Scenario A = alat za vlasnike koji sami iznajmljuju (direktna prodaja bez agencije)
- Scenario B = poseban paket za poslovne prostore
- Kombinacija: AI opis oglasa (copywriting) + ugovor o zakupu = kompletan paket za vlasnike

---
*Verzija 1.0 — jun 2026.*
