# Zadatak: Osiguranje gramatičke ispravnosti srpskog jezika u aisistent.rs

## Kontekst

Proizvod reklamira deklinaciju kroz svih 7 padeža srpskog jezika kao ključnu diferencijaciju
u odnosu na generičke AI alate (Zakon o radu, ZOO dokumenti). Otkrivena je greška u marketing
sadržaju koja pokazuje da trenutno ne postoji sistematska provera gramatičke i činjenične
ispravnosti — ni u core pipeline-u za generisanje dokumenata, ni u sadržaju koji izlazi javno.

Ovo je posao u tri nezavisna dela. Radi ih ovim redom — svaki je samostalno koristan i ne čeka
sledeći.

---

## Zadatak 0 — Audit pre bilo kakvog pisanja koda

Pre nego što se bilo šta menja, mapiraj trenutno stanje:

1. Pronađi u kodu tačno mesto/mesta gde se generiše finalni tekst dokumenta (prompt template,
   LLM poziv, post-processing).
2. Utvrdi da li se deklinacija imena/firmi/iznosa radi (a) isključivo kroz LLM slobodnom
   generacijom, (b) kroz neki postojeći rule-based korak, ili (c) mešovito.
3. Proveri da li postoji ikakav automatski test koji proverava izlazni tekst na gramatičku
   ispravnost. Ako ne postoji — to potvrđuje da je Zadatak 1 prioritet.
4. Kratko rezimiraj nalaze pre nego što nastaviš na sledeće zadatke.

---

## Zadatak 1 — Regresioni test set za deklinaciju (najviši prioritet)

Cilj: uhvatiti svaku regresiju (promena prompta, modela, refaktor) pre nego što ode u produkciju.

1. Napravi test fixture sa 50–100 realnih primera: kombinacija (ime i prezime osobe, naziv
   firme, novčani iznos) × (svih 7 padeža koji se realno koriste u dokumentima — najčešće
   nominativ, genitiv, dativ, akuzativ, instrumental).
   - Uključi teške slučajeve: strana imena, imena na suglasnik i na -a, ženska i muška imena,
     firme sa kvotiranim nazivom ("DOO Vetar"), imena sa dijakritikom (Đ, Š, Č, Ć, Ž).
   - Svaki red fixture-a: ulazni oblik, padež, očekivani ispravan oblik.
2. Napiši automatski test koji generiše dokument (ili samo relevantnu rečenicu/frazu) za svaki
   red i uporedi sa očekivanim oblikom.
3. Uključi ovaj test u CI (ili bar u pre-commit/pre-deploy skriptu) tako da se pokreće pri
   svakoj izmeni prompta ili modela.
4. Ako trenutni pipeline nema jasnu tačku za "generiši samo ovu frazu" (izoluj deklinaciju od
   ostatka dokumenta) — to je znak da treba refaktorisati generisanje tako da deklinacija bude
   izdvojiv, testabilan korak (vidi Zadatak 2).

Definicija gotovog: test set postoji, pokreće se automatski, i namerno unesena greška
(npr. ručno pokvaren padež u promptu) mora da obori test.

---

## Zadatak 2 — Deterministički modul za deklinaciju vlastitih imenica

Cilj: ukloniti nagađanje LLM-a iz najrizičnijeg dela (ime osobe/firme/iznos u pravnom
dokumentu) i zameniti ga testabilnom funkcijom.

1. Implementiraj funkciju/modul (jezik prati stack projekta — TypeScript ili Python) sa
   signaturom u smislu `decline(word: string, gender: Gender, case: Case): string`.
2. Osnova: pravilni nastavci po padežu za muška, ženska i srednja imena/prezimena prema
   tipu završetka (suglasnik, -a, -o/-e, itd.) — ovo pokriva veliku većinu slučajeva
   pravilno.
3. Rečnik izuzetaka za nepravilne/česte slučajeve koji ne prate pravilo (dopunjuje se kako se
   otkrivaju u produkciji — svaka prijavljena greška iz Zadatka 1 postaje novi red u rečniku
   izuzetaka ili novo pravilo).
4. Kao referenca za pravila i proveru pokrivenosti — ne kao obavezna runtime zavisnost:
   - **CLASSLA-Stanza** — https://github.com/clarinsi/classla (Python, pip install classla) —
     morfosintaksička analiza i lematizacija za srpski.
   - **srLex** — https://www.clarin.si/repository/xmlui/handle/11356/1233 — inflekcioni
     leksikon srpskog (~169k lema, ~6.9M oblika), dostupan i kao web servis/API.
   - **reldi-tagger** — https://github.com/clarinsi/reldi-tagger — lakši tagger/lematizator
     za srpski/hrvatski/slovenački, pogodan za self-hosting.
   - Napomena: ovi resursi pokrivaju rečnik jezika, ne nužno retka lična imena — zato je
     rečnik izuzetaka u modulu i dalje neophodan.
5. Izmeni pipeline generisanja dokumenta tako da LLM ne generiše deklinovani oblik direktno,
   nego poziva ovaj modul (function calling / tool use) za svako ime, firmu i iznos koji se
   deklinuje, i sastavlja finalni tekst oko tih već ispravnih oblika.
6. Pokreni Zadatak 1 test set protiv novog modula — mora proći 100%, ne "uglavnom".

Definicija gotovog: modul postoji, ima sopstvene unit testove, integrisan je u pipeline
generisanja, i test set iz Zadatka 1 prolazi.

---

## Zadatak 3 — Provera pre objave javnog sadržaja (marketing, blog, društvene mreže)

Cilj: sprečiti da bilo koji tekst koji tvrdi činjenicu o jeziku ili zakonu ("sedam padeža",
naziv i broj člana zakona, itd.) izađe javno bez provere.

1. Napravi kratak referentni dokument (npr. `docs/serbian-language-facts.md` ili slično) sa
   fiksnim, proverenim činjenicama koje se često pominju u sadržaju: broj i nazivi padeža,
   ključne odredbe Zakona o radu/ZOO na koje se firma poziva. Ovaj dokument se uključuje u
   svaki prompt koji generiše javni sadržaj o proizvodu.
2. Definiši checklist koji se mora proći pre objave bilo kog javnog teksta (post, blog, opis
   proizvoda): svaka brojčana/činjenična tvrdnja o jeziku ili zakonu mora biti eksplicitno
   proverena naspram dokumenta iz koraka 1, ne generisana "iz glave" modela.
3. Opciono, ali preporučeno: napravi Claude Code/Claude skill ("srpski-lektor" ili slično) koji
   automatski skenira draft javnog teksta i flaguje brojeve/tvrdnje o jeziku i zakonu za ručnu
   proveru pre objave.

Definicija gotovog: referentni dokument postoji, checklist je definisan i primenjen bar jednom
unazad (na već objavljeni sadržaj, da se uhvate postojeće greške), skill je opciono dodat.

---

## Redosled rada

Audit (Zadatak 0) → Zadatak 1 (test set) → Zadatak 2 (deklinacioni modul) → Zadatak 3
(provera javnog sadržaja). Zadatak 1 i 3 se mogu raditi paralelno ako ima kapaciteta —
Zadatak 2 zavisi od nalaza Zadatka 0/1.
