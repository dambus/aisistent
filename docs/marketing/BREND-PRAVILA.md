# Brend pravila — jezik, ton i copy

**Klasa dokumenta:** STANJE (prepisuje se u celini, ne dopisuje)
**Poslednja provera:** 2026-09-04
**Nadređeni izvor:** proizvod (kod i baza) za činjenice; ovaj dokument za jezik i formulacije

> Ovo je **jedini izvor** copy pravila. n8n promptovi, landing copy i ručno pisane objave
> prepisuju se odavde i ne pišu nezavisno. Kad se pravilo menja, menja se ovde prvo, pa se
> prenosi u promptove — nikad obrnuto.

---

## 1. Jezički mandat

Gramatički i pravopisno besprekoran srpski jezik je **proizvodna karakteristika, ne stilska
preferenca**. Time se razlikujemo od opštih AI alata i to eksplicitno tvrdimo u oglasima
(„ChatGPT ne zna padeže, mi znamo"). Greška u našem oglasu ne kvari samo taj oglas — ruši
jedinu tvrdnju na kojoj pozicioniranje počiva.

Obavezno:

- **Latinica.** Nikad ćirilica, ni delimično.
- **Ispravni padeži**, posebno u deklinaciji imena, prezimena i naziva firmi.
- **Bez anglicizama.** „Slobodni saradnik" umesto „frilenser", „preuzimanje" umesto „daunloud",
  „prijava" umesto „login". Ustaljeni izuzeci: *internet*, *mejl*, *onlajn*.
- **Bez ćiriličnih homoglifa** — vizuelno identična slova (`а е о р с х у к ј і`) koja model
  povremeno ubaci u latinični tekst. Provera mora biti **deterministička** (mapa znakova),
  nikad prepuštena modelu.

### Zašto je grafika stroža od teksta

Tekst na slici prolazi kroz renderer i završava kao objavljena slika. Ispravka zahteva ponovno
renderovanje, ponovni otpremanje na Zernio i ponovnu objavu — a ako je već objavljeno, i brisanje
posta sa svom statistikom. **Svaka grana koja generiše `graphic` polja mora imati QA korak i
proveru homoglifa pre renderovanja.** Bez izuzetka.

---

## 2. Ton

**Iskusan kolega koji objašnjava**, ne korporativni vodič i ne marketinški glas.

- Kreće se od konkretnog problema koji čitalac prepoznaje, ne od najave („Novi blog post…").
- Kratke rečenice. Bez ukrasnih konstrukcija.
- Konkretan primer sa srpskim kontekstom umesto uopštene tvrdnje.
- Bez uzvika, bez „revolucionarno", „game changer", „transformiši svoje poslovanje".
- Obraćanje na „vi" u dužim formatima (blog, LinkedIn), „ti" dozvoljeno u kratkim (Instagram),
  ali **nikad pomešano u istom tekstu**.

---

## 3. Činjenice koje se smeju tvrditi

Sve što se pojavi u oglasu mora biti provereno u proizvodu na dan pisanja.

| Tvrdnja | Vrednost | Provereno |
|---|---|---|
| Besplatni nalog | **10 dokumenata mesečno** | 2026-09-04, `PLAN_LIMITS` |
| Biblioteka obrazaca | **234 objavljena obrasca** — „preko 230" | 2026-09-04, `library_forms` |
| Izvori obrazaca | APR, Poreska uprava, CROSO, PIO | 2026-09-04 |
| Tipovi dokumenata | **22** | 2026-09-04, prebrojano u aplikaciji |
| Kalkulatori | **3** | 2026-09-04, prebrojano u aplikaciji |
| Ostali alati | pregled ugovora, test samostalnosti | 2026-09-04 |
| Ukupno alata | **27** (22 + 3 + 2) | 2026-09-04 |
| Broj padeža u srpskom | **7** — česta greška modela | trajno |

Zastarelo i ne sme se koristiti: „prva 3 dokumenta besplatno", „1 dokument mesečno",
„22+ alata", „20 tipova dokumenata".

### Slaganje broja i imenice

Ovo je mesto gde najlakše proklizi greška u oglasu koji tvrdi da smo bolji od ChatGPT-a baš u
gramatici. Pravilo za srpski: broj koji se završava na **2, 3 ili 4** traži genitiv jednine
(*22 tipa*, *3 kalkulatora*, *234 obrasca*), a sve ostalo genitiv množine (*27 alata*,
*10 dokumenata*, *7 padeža*). Izuzetak su brojevi od 11 do 14, koji uvek idu sa genitivom
množine.

Dodavanje znaka „+" ne menja slaganje i uglavnom samo slabi tvrdnju — tačan broj deluje
provereno, „22+" deluje kao procena.

---

## 4. Zabranjene formulacije

**Cene, pretplata, plaćanje.** Ne pominju se nigde — AIsistent još nema registrovano pravno lice
i naplata nije aktivna. Ni konkretni iznosi, ni nazivi planova kao kupovina.

**„Besplatno zauvek".** Naplata se uvodi; ovo bi razočaralo rane korisnike u trenutku kad krene.

**Generični pravni ogradni saveti na grafici** — „konsultujte pravnika", „ovo nije pravni savet".
AIsistent nudi izradu tog dokumenta; takva napomena direktno obeshrabruje korišćenje proizvoda.
Disclaimer slot koristiti **isključivo** za proverljivu činjenicu koja gradi kredibilitet: naziv
zakona, rok u danima, novčani prag. Ako takve činjenice nema — slot ostaje prazan.

*(Napomena: informativni disclaimer na kraju blog članka je druga stvar i ostaje.)*

**Izmišljeni brojevi.** Nijedan podatak, rok ili iznos koji nije proveren.

---

## 5. Okvir „test tržišta"

Odsustvo naplate se ne izvinjava, nego se okvirava kao namerna faza ranog pristupa.

Koristiti: *„Pridruži se ranim korisnicima dok je sve besplatno"*, *„Rani pristup — pomozi nam da
oblikujemo alat"*, *„Trenutno smo u fazi testiranja tržišta"*.

Ne koristiti: *„plaćanje uskoro stiže"*, *„naplata još ne radi"*, bilo šta što zvuči kao izvinjenje
ili kao da platforma nije gotova.

Isti okvir postoji i u samom proizvodu — u onboardingu i u banneru na kontrolnoj tabli. Formulacija
u oglasu mora biti prepoznatljivo ista, da korisnik ne naiđe na drugačiji ton čim klikne.

---

## 6. Poziv na akciju

| Situacija | CTA |
|---|---|
| Blog objavljen | link ka članku |
| Blog nije objavljen | link ka alatu (`/dokumenti/{alat}`) — **bez pominjanja članka** |
| Instagram | „Link u bio" |
| Interesovanje za plan | „Javi mi se kad bude dostupno" — nikad „Izaberite Pro" |

Pravilo o nepostojećem blogu je obavezno i objašnjeno u `PLAN-OBJAVA.md`, sekcija 4.

---

## 7. Provera pre objave

Ništa se ne objavljuje automatski. Pre svake objave, ručno:

1. Pročitati naglas — greška u padežu se čuje pre nego što se vidi.
2. Proveriti svaki broj i svaki naziv zakona u tekstu.
3. Otvoriti svaki link i potvrditi da vodi na živu stranicu.
4. Pogledati sliku u punoj veličini — prelomljene reči, presečen tekst, pogrešna dijakritika.
5. Potvrditi da nema cena, „besplatno zauvek" i generičnog pravnog saveta na grafici.

Automatski QA u pipelineu je prvi filter, ne poslednji. Poslednji si ti.

---

## 8. Izvod za n8n promptove

Ovaj blok se prepisuje u promptove i ažurira kad se dokument menja.

```
JEZIK: srpski, latinica, bez ćirilice, bez anglicizama, besprekoran pravopis i padeži.
TON: iskusan kolega, kreni od konkretnog problema, kratke rečenice, bez korporativnog glasa.
ČINJENICE: besplatno 10 dokumenata mesečno; preko 230 obrazaca (APR, Poreska uprava, CROSO,
  PIO); srpski ima tačno 7 padeža. Ne izmišljaj brojeve.
ZABRANJENO: cene, iznosi, uslovi pretplate, „besplatno zauvek", generični pravni savet na
  grafici („konsultuj pravnika", „ovo nije pravni savet").
OKVIR: faza testiranja tržišta i ranog pristupa — nikad izvinjenje što naplata ne radi.
GRAFIKA: tekst ide direktno na sliku bez dalje provere — mora biti kratak i gramatički savršen.
  Disclaimer slot samo za proverljivu činjenicu (naziv zakona, rok, prag), inače prazan.
```

---

## 9. Poznata odstupanja (2026-09-04)

- **Četvrtkova grana nema QA ni proveru homoglifa** — krši sekciju 1. Ispraviti pre sledećeg
  četvrtka.
- **Ponedeljkov LinkedIn prompt ubacuje link ka neobjavljenom blogu** — krši sekciju 6.

Rešeno (4.9.2026, Claude Code): `instagram-launch-pack-2026-08-03.html` je pisao „prva 3
dokumenta besplatno" (4 mesta) i „22+ alata"/„22+ tipa(ova) dokumenata" (3 mesta) — sve
usklađeno sa sekcijom 3 (10 dokumenata, 27 alata, 22 tipa dokumenata).
