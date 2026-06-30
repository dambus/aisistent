# Uputstvo za implementaciju — Faza 1 (za Claude Code)

Prati ovo uputstvo zajedno sa `FAZA1_PREPOZNAVANJE_OBRAZACA.md`. Spec definiše šta gradimo i zašto; ovo uputstvo definiše redosled i disciplinu rada.

## Pravila rada (važe za ceo zadatak)

1. **Radi u koracima iz sekcije "Redosled implementacije" niže, jedan po jedan.** Ne preskači unapred, ne piši kod za korak 4 dok korak 2 nije potvrđen kao ispravan.
2. **Na svakom checkpoint-u (označeno 🛑 STOP), zaustavi se i prikaži rezultat Milanu pre nastavka.** Ne nastavljaj na sledeći korak bez eksplicitne potvrde, čak i ako ti se čini da je sledeći korak očigledan.
3. **Nikad ne popunjavaj nepoznato opštim znanjem.** Ako naiđeš na nešto što ne možeš da odrediš iz stvarno ekstrahovanih podataka (koordinate, OCR tekst, DI rezultat) — vrati `null`/`unknown` i jasno to označi. Ne nagađaj na osnovu toga "kako obično izgleda ovaj tip obrasca." Ovo je naučeno na teži način tokom istraživanja — videti sekciju "Zašto guide mode prvo" u specu.
4. **Svaka pretpostavka o strukturi dokumenta (broj strana, koordinatni sistem, layout) mora biti programski izvučena iz fajla, ne hardkodovana ili pretpostavljena.** Ako nešto ne možeš programski da odrediš, stani i pitaj.
5. **Loguj sirove međurezultate tokom razvoja** (DI raw response, AcroForm raw extraction, rezultat geometrijskog poklapanja pre Claude semantičkog koraka) — Milan će često tražiti da vidi sirove podatke radi provere, ne samo finalni output.

---

## Redosled implementacije

### Korak 1 — Azure Document Intelligence modul (izolovano)
- Implementiraj `lib/documentIntelligence/analyzeLayout.ts` (sekcija 4.2 speca)
- Testiraj **samo ovaj modul** na eko-taksa PDF-u, ispiši sirovi JSON odgovor
- 🛑 **STOP — pokaži Milanu da modul radi i vraća očekivanu strukturu (tabele, paragraphs) pre nastavka.**

### Korak 2 — AcroForm ekstrakcija (izolovano, bez DI)
- Ažuriraj/formalizuj `inspect-acroform.mjs` logiku kao deo aplikacionog koda — mora vraćati `page` za svaki widget (ovo je već jednom bilo pogrešno, posebno proveri da je broj stranice tačan testom na PPDG-1S, koji ima 4 strane)
- 🛑 **STOP — pokaži Milanu listu ekstrahovanih polja sa page brojevima za PPDG-1S, da potvrdi da je 198 polja raspoređeno na 4 strane kako se očekuje.**

### Korak 3 — Geometrijsko poklapanje (AcroForm grana)
- Implementiraj algoritam iz sekcije 5.2 speca (konverzija koordinata, ista linija, fallback "iznad")
- Testiraj na PPDG-1S, fokus na polja koja su VEĆ RUČNO VERIFIKOVANA tokom istraživanja: T1 (treba da nađe "Организациона јединица"), T7/T8/T9 (Општина/Место/Назив улице, tim redosledom)
- 🛑 **STOP — pokaži Milanu rezultat za ova konkretna polja. Ako se ne poklapa sa već potvrđenim nalazima, NE nastavljaj — nešto je pogrešno u implementaciji algoritma, vrati se i ispravi pre nego što testiraš na ostatku obrasca.**

### Korak 4 — Prag pouzdanosti i kalibracioni harness
- Implementiraj formulu iz sekcije 5.4 (relativna margina + DI confidence) kao startnu vrednost, jasno označenu kao privremenu
- Implementiraj sve tri skripte iz sekcije 5.5 (`run-calibration-test.mjs`, `record-ground-truth.mjs`, `recalculate-thresholds.mjs`)
- 🛑 **STOP — pokreni `run-calibration-test.mjs` na eko-taksi i PPDG-1S, pokaži Milanu output i vizuelni overlay pre nego što se smatra gotovim.**

### Korak 5 — Flat PDF grana (tabele + linije + selection marks)
- Implementiraj sekciju 6 speca, koristeći isti DI modul iz koraka 1
- Testiraj na eko-taksa obrascu (kontrolni primer, već znamo očekivan rezultat za tabele)
- 🛑 **STOP — pokaži Milanu rezultat, posebno kako su tretirane prazne ćelije tabele nasuprot linijskih praznina van tabele.**

### Korak 6 — Claude semantičko mapiranje
- Implementiraj sekciju 5.3/6.3 — Claude dobija ISKLJUČIVO stvarno ekstrahovane parove (labela, polje), nikad sirova imena tipa T1/T189 bez konteksta
- Eksplicitno testiraj da Claude ispravno odbija da popuni polje kad je `label: null` (ne sme da nagađa)
- 🛑 **STOP — pokaži Milanu primer gde je polje namerno nejasno (npr. veštački ukloni label iz test podataka) i potvrdi da sistem to tretira kao nisku pouzdanost, ne kao priliku za nagađanje.**

### Korak 7 — Guide UI integracija
- Implementiraj format podataka iz sekcije 7, poveži sa `/obrasci` rutom
- Ovo je jedini korak gde je veći deo posla frontend, ne pipeline logika

### Korak 8 — Validacija na proširenom test setu
- Kada Milan dostavi dodatne test obrasce (sekcija 10, tačka 2 speca), pokreni ceo pipeline + kalibracioni harness na svakom
- Ovo je iterativan korak — ne čekaj da Milan ima svih 5 obrazaca odjednom, obradi ih kako stižu

---

## Šta NE raditi u ovoj fazi

- Ne implementiraj auto-fill/overlay teksta na flat PDF (Faza 2/3, van obima)
- Ne diraj postojeću DOCX `{{placeholder}}` funkcionalnost
- Ne pravi novu rutu mimo `/obrasci`
- Ne fiksiraj pragove pouzdanosti kao trajne konstante bez napomene da su privremene/kalibracione

---

## Ako nešto ne štima

Ako u bilo kom koraku rezultat ne odgovara očekivanjima opisanim u specu (npr. geometrijsko poklapanje vraća nešto što vizuelno ne izgleda tačno), **ne nastavljaj dalje i ne "ispravljaj" rezultat ručnim mapiranjem ili hardkodovanjem specifičnih polja za taj jedan obrazac.** Stani, prijavi Milanu šta se desilo i koji su podaci doveli do tog rezultata. Cilj je generalizabilan pipeline, ne rešenje koje radi samo za test dokumente koje trenutno imamo.
