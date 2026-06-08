# Wizard Audit

Audit placeholder/helper/tooltip pokrivenosti za sva wizard polja u `lib/prompts/`.

## Ukupna statistika

- Ukupno polja: 246
- Potpuno pokrivena: 42 (17.1%)
- Delimi?no: 22
- Bez i?ega: 182

## lib/prompts/ugovor-o-radu.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| sprema | dropdown | "Stepen stručne spreme" | tooltip |
| nacin_rada | radio | "Način rada" | tooltip |
| datum_pocetka | date | "Datum početka rada" | helperText |
| datum_isteka | date | "Datum isteka ugovora" | helperText |
| probni_rad_meseci | number | "Trajanje probnog rada (meseci)" | helperText |
| nacin_isplate | text | "Način isplate" | placeholder, helperText |
| dan_isplate | number | "Dan isplate u mesecu" | helperText |
| topli_obrok | number | "Topli obrok (RSD mesečno)" | helperText |
| prevoz | radio | "Naknada za prevoz" | tooltip |
| fond_sati | number | "Nedeljni fond radnih sati" | helperText |
| godisnji_odmor | number | "Broj dana godišnjeg odmora" | helperText |
| zabrana_konkurencije | toggle | "Zabrana konkurencije" | helperText or tooltip |
| trajanje_zabrane | number | "Trajanje zabrane (meseci, max 24)" | helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| adresa_firme | text | placeholder | helperText |
| broj_ugovora | text | placeholder | helperText |
| ime_prezime | text | placeholder | helperText |
| adresa_zaposlenog | text | placeholder | helperText |
| broj_lk | text | placeholder | helperText |
| pozicija | text | placeholder | helperText |
| opis | textarea | placeholder | helperText |
| mesto_rada | text | placeholder | helperText |
| raspored | text | placeholder | helperText |
| napomene | textarea | placeholder | helperText |

### Statistika:
- Ukupno polja: 36
- Potpuno pokrivena: 13 (36.1%)
- Delimi?no: 10
- Bez i?ega: 13
## lib/prompts/ugovor-o-delu.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| tip_narucioca | radio | "Tip naručioca" | tooltip |
| naziv_narucioca | text | "Naziv / Ime i prezime" | placeholder, helperText |
| pib_narucioca | text | "PIB (ako je firma/preduzetnik)" | placeholder, helperText |
| adresa_narucioca | text | "Adresa sedišta / stanovanja" | placeholder, helperText |
| zastupnik_narucioca | text | "Zastupnik - ime i funkcija (ako je firma)" | placeholder, helperText |
| naziv_izvodjaca | text | "Ime i prezime / Naziv firme" | placeholder, helperText |
| jmbg_pib_izvodjaca | text | "JMBG / PIB" | placeholder, helperText |
| adresa_izvodjaca | text | "Adresa stanovanja / sedišta" | placeholder, helperText |
| racun_izvodjaca | text | "Broj tekućeg računa za isplatu" | placeholder, helperText |
| specifikacije | textarea | "Posebni zahtevi / tehničke specifikacije" | placeholder, helperText |
| fazno | toggle | "Fazna isporuka?" | helperText or tooltip |
| opis_faza | textarea | "Opis faza i rokova" | placeholder, helperText |
| nacin_isplate | radio | "Način isplate" | tooltip |
| nda | toggle | "Klauzula poverljivosti (NDA)?" | helperText or tooltip |
| trajanje_nda | number | "Trajanje NDA (meseci)" | helperText |
| zabrana | toggle | "Zabrana konkurencije?" | helperText or tooltip |
| napomene | textarea | "Posebne napomene" | placeholder, helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| broj_ugovora | text | helperText | placeholder |
| naziv_dela | text | helperText | placeholder |
| opis_dela | textarea | helperText | placeholder |
| rezultat | text | helperText | placeholder |

### Statistika:
- Ukupno polja: 28
- Potpuno pokrivena: 7 (25.0%)
- Delimi?no: 4
- Bez i?ega: 17
## lib/prompts/nda.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| tip_strane_1 | radio | "Tip subjekta" | tooltip |
| naziv_strane_1 | text | "Naziv / Ime i prezime" | placeholder, helperText |
| pib_strane_1 | text | "PIB / JMBG" | placeholder, helperText |
| adresa_strane_1 | text | "Adresa" | placeholder, helperText |
| zastupnik_strane_1 | text | "Zastupnik (ako je firma)" | placeholder, helperText |
| tip_strane_2 | radio | "Tip subjekta" | tooltip |
| naziv_strane_2 | text | "Naziv / Ime i prezime" | placeholder, helperText |
| pib_strane_2 | text | "PIB / JMBG" | placeholder, helperText |
| adresa_strane_2 | text | "Adresa" | placeholder, helperText |
| zastupnik_strane_2 | text | "Zastupnik (ako je firma)" | placeholder, helperText |
| opis_informacija | textarea | "Dodatni opis" | placeholder, helperText |
| oznacavanje | toggle | "Označavanje dokumenata kao "Poverljivo"?" | helperText or tooltip |
| datum | date | "Datum potpisivanja" | helperText |
| trajanje_sporazuma | number | "Trajanje sporazuma (meseci)" | helperText |
| trajanje_cuvanja | number | "Obaveza čuvanja po isteku (meseci)" | helperText |
| kazna | number | "Ugovorna kazna za kršenje (RSD)" | helperText |
| trajanje_zabrane | number | "Trajanje zabrane (meseci)" | helperText |
| napomene | textarea | "Posebne napomene" | placeholder, helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| svrha | textarea | helperText | placeholder |
| oblast_informacija | textarea | placeholder | helperText |

### Statistika:
- Ukupno polja: 22
- Potpuno pokrivena: 2 (9.1%)
- Delimi?no: 2
- Bez i?ega: 18
## lib/prompts/ugovor-o-zakupu.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| tip_zakupodavca | radio | "Tip" | tooltip |
| naziv_zakupodavca | text | "Ime i prezime / Naziv" | placeholder, helperText |
| jmbg_pib_zakupodavca | text | "JMBG / PIB" | placeholder, helperText |
| adresa_zakupodavca | text | "Adresa" | placeholder, helperText |
| zastupnik_zakupodavca | text | "Zastupnik (ako je firma)" | placeholder, helperText |
| tip_zakupca | radio | "Tip" | tooltip |
| naziv_zakupca | text | "Ime i prezime / Naziv" | placeholder, helperText |
| jmbg_pib_zakupca | text | "JMBG / PIB" | placeholder, helperText |
| adresa_zakupca | text | "Adresa" | placeholder, helperText |
| zastupnik_zakupca | text | "Zastupnik (ako je firma)" | placeholder, helperText |
| adresa_nepokretnosti | text | "Adresa nepokretnosti" | placeholder, helperText |
| kvadratura | number | "Kvadratura (m²)" | helperText |
| list_nepokretnosti | text | "Broj lista nepokretnosti" | placeholder, helperText |
| stanje | radio | "Stanje" | tooltip |
| datum_pocetka | date | "Datum početka" | helperText |
| tip_trajanja | radio | "Tip trajanja" | tooltip |
| datum_isteka | date | "Datum isteka" | helperText |
| otkazni_rok | number | "Otkazni rok (meseci)" | helperText |
| iznos | number | "Iznos zakupnine" | helperText |
| dan_placanja | number | "Dan plaćanja u mesecu" | helperText |
| nacin_placanja | radio | "Način plaćanja" | tooltip |
| komunalije | radio | "Ko plaća struju/vodu/gas?" | tooltip |
| internet | radio | "Ko plaća internet i kablovsku?" | tooltip |
| prijava_boravista | toggle | "Saglasnost za prijavu boravišta?" | helperText or tooltip |
| napomene | textarea | "Posebne napomene" | placeholder, helperText |
| zabrana_zivotinja | toggle | "Klauzula o zabrani životinja" | helperText or tooltip |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| sprat | text | placeholder | helperText |
| struktura | text | helperText | placeholder |

### Statistika:
- Ukupno polja: 38
- Potpuno pokrivena: 10 (26.3%)
- Delimi?no: 2
- Bez i?ega: 26
## lib/prompts/ugovor-o-saradnji-zajmu.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| tip_1 | radio | "Tip Prve strane" | tooltip |
| naziv_1 | text | "Naziv / Ime Prve strane" | placeholder, helperText |
| id_1 | text | "PIB / JMBG Prve strane" | placeholder, helperText |
| adresa_1 | text | "Adresa Prve strane" | placeholder, helperText |
| zastupnik_1 | text | "Zastupnik Prve strane" | placeholder, helperText |
| tip_2 | radio | "Tip Druge strane" | tooltip |
| naziv_2 | text | "Naziv / Ime Druge strane" | placeholder, helperText |
| id_2 | text | "PIB / JMBG Druge strane" | placeholder, helperText |
| adresa_2 | text | "Adresa Druge strane" | placeholder, helperText |
| zastupnik_2 | text | "Zastupnik Druge strane" | placeholder, helperText |
| naziv_saradnje | text | "Naziv saradnje" | placeholder, helperText |
| opis_saradnje | textarea | "Detaljan opis" | placeholder, helperText |
| doprinos_1 | textarea | "Doprinos Prve strane" | placeholder, helperText |
| doprinos_2 | textarea | "Doprinos Druge strane" | placeholder, helperText |
| udeo_1 | number | "Udeo Prve strane (%)" | helperText |
| udeo_2 | number | "Udeo Druge strane (%)" | helperText |
| upravljanje | radio | "Ko upravlja finansijama?" | tooltip |
| rok | number | "Rok finansijskog izveštavanja (dana)" | helperText |
| datum_pocetka | date | "Datum početka" | helperText |
| trajanje | radio | "Trajanje" | tooltip |
| datum_zavrsetka | date | "Datum završetka" | helperText |
| ekskluzivnost | toggle | "Ekskluzivnost?" | helperText or tooltip |
| opis_ekskl | textarea | "Oblast ekskluzivnosti" | placeholder, helperText |
| nda | toggle | "NDA klauzula?" | helperText or tooltip |
| napomene | textarea | "Napomene" | placeholder, helperText |
| tip_zajmodavca | radio | "Tip zajmodavca" | tooltip |
| naziv_zajmodavca | text | "Ime/Naziv zajmodavca" | placeholder, helperText |
| id_zajmodavca | text | "JMBG / PIB zajmodavca" | placeholder, helperText |
| adresa_zajmodavca | text | "Adresa zajmodavca" | placeholder, helperText |
| tip_zajmoprimca | radio | "Tip zajmoprimca" | tooltip |
| naziv_zajmoprimca | text | "Ime/Naziv zajmoprimca" | placeholder, helperText |
| id_zajmoprimca | text | "JMBG / PIB zajmoprimca" | placeholder, helperText |
| adresa_zajmoprimca | text | "Adresa zajmoprimca" | placeholder, helperText |
| iznos | number | "Iznos zajma" | helperText |
| valuta | radio | "Valuta" | tooltip |
| svrha | text | "Svrha zajma" | placeholder, helperText |
| datum_isplate | date | "Datum isplate" | helperText |
| nacin_isplate | radio | "Način isplate" | tooltip |
| racun | text | "Broj računa zajmoprimca" | placeholder, helperText |
| stopa | number | "Godišnja kamatna stopa (%)" | helperText |
| obracun | radio | "Obračun kamate" | tooltip |
| placanje_kamate | radio | "Plaćanje kamate" | tooltip |
| nacin_vracanja | radio | "Način vraćanja" | tooltip |
| rok_vracanja | text | "Datum vraćanja / plan rata" | placeholder, helperText |
| prva_rata | date | "Datum prve rate" | helperText |
| prevremena | toggle | "Pravo prevremene otplate?" | helperText or tooltip |
| sredstvo | radio | "Sredstvo obezbeđenja" | tooltip |
| zatezna | radio | "Zatezna kamata" | tooltip |
| napomene | textarea | "Napomene" | placeholder, helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| - | - | - | - |

### Statistika:
- Ukupno polja: 53
- Potpuno pokrivena: 4 (7.5%)
- Delimi?no: 0
- Bez i?ega: 49
## lib/prompts/punomocje.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| tip_vlastodavca | radio | "Tip vlastodavca" | tooltip |
| naziv_vlastodavca | text | "Ime i prezime / Naziv" | placeholder, helperText |
| jmbg_pib_vlastodavca | text | "JMBG / PIB" | placeholder, helperText |
| adresa_vlastodavca | text | "Adresa" | placeholder, helperText |
| tip_punomocnika | radio | "Tip punomoćnika" | tooltip |
| naziv_punomocnika | text | "Ime i prezime / Naziv" | placeholder, helperText |
| jmbg_pib_punomocnika | text | "JMBG / PIB" | placeholder, helperText |
| adresa_punomocnika | text | "Adresa" | placeholder, helperText |
| opis_ovlascenja | textarea | "Opis ovlašćenja" | placeholder, helperText |
| trajanje | radio | "Trajanje" | tooltip |
| datum_isteka | date | "Datum isteka" | helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| - | - | - | - |

### Statistika:
- Ukupno polja: 12
- Potpuno pokrivena: 1 (8.3%)
- Delimi?no: 0
- Bez i?ega: 11
## lib/prompts/opsti-uslovi.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| naziv_firme | text | "Naziv firme" | placeholder, helperText |
| pib | text | "PIB" | placeholder, helperText |
| adresa | text | "Adresa" | placeholder, helperText |
| email | text | "Email za kontakt" | placeholder, helperText |
| url | text | "Sajt/aplikacija URL" | placeholder, helperText |
| opis_usluge | textarea | "Opis usluge" | placeholder, helperText |
| vrste_podataka | dropdown | "Koje vrste podataka?" | tooltip |
| analitika | toggle | "Koriste se analitički alati?" | helperText or tooltip |
| deli_sa_trecim_stranama | toggle | "Podaci se dele sa trećim stranama?" | helperText or tooltip |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| - | - | - | - |

### Statistika:
- Ukupno polja: 11
- Potpuno pokrivena: 2 (18.2%)
- Delimi?no: 0
- Bez i?ega: 9
## lib/prompts/poslovni-mejl.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| posiljalac_ime | text | "Ime i prezime" | placeholder, helperText |
| posiljalac_firma | text | "Naziv firme" | placeholder, helperText |
| posiljalac_pozicija | text | "Pozicija" | placeholder, helperText |
| primalac_ime | text | "Ime i prezime ili tim/odeljenje" | placeholder, helperText |
| primalac_firma | text | "Naziv firme primaoca" | placeholder, helperText |
| ton | radio | "Ton" | tooltip |
| hitno | toggle | "Da li je hitno?" | helperText or tooltip |
| predmet | text | "Predmet mejla (opciono)" | placeholder, helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| kontekst | textarea | helperText | placeholder |

### Statistika:
- Ukupno polja: 10
- Potpuno pokrivena: 1 (10.0%)
- Delimi?no: 1
- Bez i?ega: 8
## lib/prompts/oglas-za-posao.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| naziv_firme | text | "Naziv firme" | placeholder, helperText |
| grad | text | "Grad" | placeholder, helperText |
| velicina | radio | "Veličina firme" | tooltip |
| naziv_pozicije | text | "Naziv radnog mesta" | placeholder, helperText |
| tip_angazovanja | radio | "Tip angažovanja" | tooltip |
| lokacija_rada | radio | "Lokacija rada" | tooltip |
| strucna_sprema | dropdown | "Stručna sprema" | tooltip |
| iskustvo | radio | "Iskustvo" | tooltip |
| potrebne_vestine | textarea | "Potrebne veštine" | placeholder, helperText |
| prednost | textarea | "Prednost" | placeholder, helperText |
| zarada_tip | radio | "Zarada" | tooltip |
| iznos_zarade | text | "Iznos zarade" | placeholder, helperText |
| rok_prijave | date | "Rok za prijavu" | helperText |
| kako_aplicirati | textarea | "Kako aplicirati" | placeholder, helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| delatnost | textarea | helperText | placeholder |
| glavni_zadaci | textarea | helperText | placeholder |

### Statistika:
- Ukupno polja: 17
- Potpuno pokrivena: 1 (5.9%)
- Delimi?no: 2
- Bez i?ega: 14
## lib/prompts/ponuda-klijentu.ts

### Polja BEZ placeholder-a i helper-a:
| ID polja | Tip | Labela | Nedostaje |
|----------|-----|--------|-----------|
| ponudjac_naziv | text | "Naziv firme" | placeholder, helperText |
| ponudjac_pib | text | "PIB" | placeholder, helperText |
| ponudjac_adresa | text | "Adresa" | placeholder, helperText |
| kontakt_osoba | text | "Kontakt osoba" | placeholder, helperText |
| email | text | "Email" | placeholder, helperText |
| telefon | text | "Telefon" | placeholder, helperText |
| klijent_naziv | text | "Naziv firme / ime" | placeholder, helperText |
| klijent_adresa | text | "Adresa" | placeholder, helperText |
| klijent_kontakt | text | "Kontakt osoba" | placeholder, helperText |
| broj_ponude | text | "Broj ponude" | placeholder, helperText |
| datum_ponude | date | "Datum ponude" | helperText |
| predmet_ponude | text | "Predmet ponude" | placeholder, helperText |
| rok_isporuke | text | "Rok isporuke/realizacije" | placeholder, helperText |
| iznos_bez_pdv | number | "Iznos bez PDV (RSD)" | helperText |
| pdv | radio | "PDV" | tooltip |
| validnost | number | "Validnost ponude (dani)" | helperText |
| napomene | textarea | "Napomene" | placeholder, helperText |

### Polja sa DELIMI?NOM pokriveno??u:
| ID polja | Tip | Ima | Nedostaje |
|----------|-----|-----|-----------|
| opis | textarea | helperText | placeholder |

### Statistika:
- Ukupno polja: 19
- Potpuno pokrivena: 1 (5.3%)
- Delimi?no: 1
- Bez i?ega: 17
