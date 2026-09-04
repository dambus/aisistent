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

---

## 2026-09-04 — Banner "test tržišta" na dashboardu (samo free korisnici)

**Šta se promenilo:** Novi `MarketTestBanner` prikazan na vrhu `/dashboard`, samo kad je `plan === 'free'`. Tekst: *"Trenutno smo u fazi testiranja tržišta — svi planovi su privremeno besplatni na korišćenje u okviru limita. Kad krenemo sa naplatom, korisnici prijavljeni na listu čekanja dobijaju poseban popust."*

**Zašto (za marketing poruke):** Isti razlog kao onboarding rečenica iznad — postojećim free korisnicima (10-15 naloga) ovo daje razlog da se prijave na waitlist SADA, dok je najveća vrednost (rani popust) na stolu, umesto da free plan deluje kao trajno stanje bez razloga za akciju.

**Predlog za oglase:** Ova formulacija ("test tržišta", "rani popust za listu čekanja") treba da bude konzistentna sa onim što piše i u samom oglasu i na landing stranici — ne izmišljati novi ton na svakom mestu.

---

## 2026-09-04 — Waitlist copy: "čekamo naplatu" → "javi interesovanje"

**Šta se promenilo:** Na `/`, `/upgrade` i u `WaitlistModal` komponenti, dugmad za Starter/Pro planove više ne kažu "Izaberite Starter/Pro" (zvuči kao checkout) nego **"Javi mi se kad bude dostupno"**. Modal naslov promenjen sa "Plaćanje stiže uskoro" na "Zainteresovani ste za [Plan] plan?", tekst modala i dalje nudi 20% popust prvi mesec, dugme za slanje sad kaže "Javi mi kad bude dostupno" umesto "Obavesti me". Funkcionalnost (`/api/waitlist`) nepromenjena.

**Zašto (za marketing poruke):** Stara formulacija je zvučala kao da korisnik nešto kupuje pa ga zaustavi poruka "čekaj, plaćanje još ne radi" — što je frustrirajuće. Nova formulacija čini waitlist prijavu niskorizičnim, informativnim činom (i to je upravo pokazatelj namere platiti koji nam treba), a ne odustajanjem pred nedostupnim checkout-om.

**Predlog za oglase:** Ne pominjati konkretne cene planova u top-of-funnel oglasima dok se ne pokrene naplata — oglas vodi na besplatan alat (10 dokumenata/mesec), a waitlist CTA se pojavljuje tek unutar app-a, mekano, ne agresivno. Ako se u oglasu ipak pominje "Pro plan", koristiti "javi nam se za rani pristup" umesto "kupi/izaberi".

---

## 2026-09-04 — Ispravka: instagram-launch-pack-2026-08-03.html i dalje je tvrdio "3 dokumenta besplatno"

**Šta se promenilo:** `docs/marketing/instagram-launch-pack-2026-08-03.html` (stari, već iskorišćeni launch pack iz avgusta) je na 4 mesta pisao "Prva 3 dokumenta (mesečno) besplatno" — zaostatak od pre promene limita na 10. Ispravljeno svuda na "10 dokumenata mesečno besplatno". Naslov/H1 "Prva 3 posta" nije dirano — to broji Instagram objave, ne dokumente.

**Zašto:** `BREND-PRAVILA.md` sekcija 3 već je ovo označio kao zastarelu tvrdnju koja se ne sme koristiti. Ako se ovaj pack ikad ponovo iskoristi kao referenca za nov copy, brojevi su sad tačni.

**Dopuna (isti dan, Milanov zahtev "sve mora biti usklađeno"):** isti fajl je na 3 mesta pisao i "22+ alata"/"22+ tipa(ova) dokumenata" — takođe zastarelo. Ispravljeno: "22+ alata" (naslovna kartica, meša ugovore/fakture/HR/kalkulatore) → **27 alata**; "22+ tipa dokumenata — ugovori, fakture, HR, kalkulatori" (isti razlog, lista meša tipove dokumenata i kalkulatore) → **27 alata**; "22+ tipova dokumenata" (lista samo prava dokumenta: fakture, NDA, rešenja, punomoćja) → **22 tipa dokumenata** (i gramatički ispravljeno "tipova"→"tipa", broj 22 traži genitiv jednine). `BREND-PRAVILA.md` sekcija 9 ažurirana da odražava da je ovo rešeno.

---

## 2026-09-04 — Bedž "Najpopularnije" uklonjen sa Pro plana (kontradiktoran dok naplata ne radi)

**Šta se promenilo:** Bedž na Pro kartici, `/` i `/upgrade`, promenjen sa "Najpopularnije" na "Preporučeno". Boja/pozicija nepromenjeni.

**Zašto (za marketing poruke):** Planovi su waitlist-only — niko još ne može da kupi ništa, pa "najpopularnije" tvrdi prodajni podatak koji ne postoji. Milan je primetio kontradikciju. Dodato kao nova zabranjena formulacija u `BREND-PRAVILA.md` sekciju 4 — nijedan oglas ne sme tvrditi da je nešto "najpopularnije", "najtraženije" ili slično o planu dok naplata ne krene. Kad naplata proradi i budu postojali stvarni podaci o izboru plana, "Najpopularnije" se može vratiti — ali samo ako je tada istinito.
