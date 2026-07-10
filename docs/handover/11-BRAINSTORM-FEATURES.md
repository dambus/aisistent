# Brainstorm novih feature-a — 5. jul 2026.

*Širok brainstorm (uključuje i ideje van trenutnog pozicioniranja) na osnovu poznavanja celog proizvoda, koda i srpskog SMB konteksta. Svaka ideja: opis, vrednost, preduslovi, rizici, kompleksnost (S/M/L/XL). Nijedna nije obavezujuća — ovo je meni za razradu.*

**Kako čitati prioritete:** ⭐ = po mojoj proceni najbolji odnos vrednost/trud za trenutnu fazu proizvoda (pre naplate: sve što gradi retenciju i SEO funnel je vrednije od novih premium feature-a).

---

## A. Retencija i navika (razlog da se korisnik VRAĆA)

### A1. ⭐ Podsetnik na poslovne rokove
**Opis:** kalendar zakonskih rokova personalizovan po profilu (pravna forma, PDV status, paušal/knjige): PDV prijava, akontacije poreza, završni račun, doprinosi paušalca... Email podsetnik (Resend postoji) + dashboard widget "sledeći rok za 5 dana".
**Vrednost:** pretvara alat "po potrebi" u alat "svake nedelje" — najjači retention mehanizam na listi; niko od domaćih konkurenata ovo ne radi dobro za male firme.
**Preduslovi:** kurirana tabela rokova (ručno održavanje! rokovi se menjaju), `industry`/pravna forma/PDV iz profila.
**Rizici:** pogrešan datum roka = ljut korisnik sa kaznom — treba disclaimer i pažljivo održavanje; rokovi zavise od detalja koje profil možda nema.
**Kompleksnost:** M (tabela rokova + matching + email cron).

### A2. ⭐ KPO knjiga za paušalce
**Opis:** knjiga o ostvarenom prometu — zakonska obaveza svakog paušalca, danas je vode u Excel-u. Unos prihoda (ili auto iz izdatih faktura!), izvoz u propisanom formatu.
**Vrednost:** paušalci su najveći segment srpskog preduzetništva; KPO + faktura + kalkulator paušala = kompletan paušalac-paket na jednom mestu. Jak razlog za Starter pretplatu.
**Preduslovi:** nijedan tehnički; format KPO je propisan (proveriti aktuelni pravilnik).
**Rizici:** mali — format je jednostavna tabela; paziti na zakonske izmene formata.
**Kompleksnost:** M (tabela + CRUD + veza sa fakturama + izvoz PDF/Excel).

### A3. Praćenje statusa faktura (plaćeno/neplaćeno)
**Opis:** faktura dobija status (poslata/plaćena/kasni); dashboard "neplaćeno ukupno: X RSD"; filter u arhivi.
**Vrednost:** prirodna nadogradnja fakture; otvara vrata za A4.
**Preduslovi:** kolona na documents ili posebna tabela invoice_meta.
**Kompleksnost:** S.

### A4. Opomena za neplaćeno (novi tip dokumenta + automatika)
**Opis:** iz neplaćene fakture jedan klik → generisana opomena (postoji pravni format: opomena pred utuženje). Kasnije: automatski draft kad faktura kasni 30 dana.
**Vrednost:** rešava stvaran bol (naplata je top problem SMB-a); jedinstveno.
**Preduslovi:** A3.
**Kompleksnost:** S posle A3 (novi prompt modul po postojećem šablonu).

### A5. Korisnički šabloni dokumenata
**Opis:** korisnik sačuva svoju konfiguraciju wizarda ("moj standardni ugovor o delu") i sledeći put krene od nje. Postoji "kreiraj sličan" (?copy=) — ovo je korak dalje: imenovani šabloni.
**Vrednost:** ubrzava ponavljajuće dokumente; mala nadogradnja postojećeg.
**Kompleksnost:** S (tabela user_templates ili flag na documents + UI lista).

---

## B. Biblioteka obrazaca — nadogradnje

### B1. ⭐ "Koji obrazac mi treba?" vodič
**Opis:** interaktivni vodič na /obrasci: 2-3 pitanja (šta hoćeš da uradiš? ko si?) → tačan obrazac + uputstvo. Može i kao deo chatbota kad on nastane.
**Vrednost:** obrasci imaju birokratska imena (JRPPS, Dodatak 19...) — korisnik ne zna ŠTA mu treba; vodič je diferencijacija vs. sajt institucije.
**Preduslovi:** dovoljno obrazaca u biblioteci (30+) da vodič ima smisla.
**Kompleksnost:** S (statično drvo odluka) do M (Claude-powered).

### B2. Uputstvo za popunjavanje po obrascu
**Opis:** na /obrasci/[slug] sekcija "kako se popunjava" — polje po polje objašnjenje, čest razlog odbijanja prijave, taksa/naknada iznos i račun za uplatu.
**Vrednost:** SEO zlato (long-tail upiti "kako popuniti X") + realna korist; sadržaj generisati Claude-om pa kurirati ručno.
**Kompleksnost:** S po obrascu (kolona `guide_md` u library_forms + render).

### B3. Obrazac + prateća dokumenta bundle
**Opis:** uz obrazac ide checklist priloga (videli smo: svaki APR Dodatak ima "priložena dokumentacija" listu) — mi je već IMAMO u ekstraktovanim poljima! Prikazati je kao checklist na stranici obrasca, sa linkovima ka dokumentima koje MI generišemo (odluka o promeni... = naši budući tipovi).
**Vrednost:** povezuje biblioteku sa generatorom — obrazac vodi ka premium dokumentu. Monetizacioni most koji trenutno ne postoji.
**Kompleksnost:** M (kuracija checklista + mapiranje na naše tipove).

### B4. Poslovni scenariji ("Zapošljavam radnika")
**Opis:** vodič-stranice koje spajaju sve: scenario → koraci → obrasci iz biblioteke + naši dokumenti + rokovi. Primeri: zapošljavanje, promena sedišta, zatvaranje preduzetnika, prelazak paušal→knjige.
**Vrednost:** top-of-funnel SEO + pozicioniranje "sve na jednom mestu"; prirodna nadogradnja B3.
**Kompleksnost:** M (CMS-lite pattern kao blog + kuriran sadržaj).

---

## C. Dokumenti i generisanje — nadogradnje

### C1. ⭐ Dvojezični dokumenti (srpski/engleski)
**Opis:** ugovor generisan dvokolonski ili naizmenično srpski/engleski — čest zahtev IT preduzetnika sa stranim klijentima (NDA, ugovor o saradnji, opšti uslovi).
**Vrednost:** IT paušalci su platežno najsposobniji segment; konkurencija (strani template sajtovi) nema srpsku stranu, domaći nemaju englesku.
**Preduslovi:** prompt izmene (Claude generiše oba), PDF/DOCX layout za dvojezično (dvokolonski layout je netrivijalan u react-pdf — realnije: sekcija po sekcija naizmenično).
**Rizici:** prevod pravnog teksta — disclaimer da je srpska verzija merodavna.
**Kompleksnost:** M-L.

### C2. Pregled tuđeg ugovora (Contract review)
**Opis:** korisnik uploaduje ugovor koji je DOBIO, Claude analizira: rizične klauzule, šta fali, na šta da pazi pre potpisa. Izlaz: strukturisan izveštaj, ne izmene.
**Vrednost:** ogromna — strah od potpisivanja je univerzalan; komplementarno generisanju (mi pišemo naše + čitamo tuđe).
**Rizici:** NAJVEĆI pravni rizik na listi — "AI mi rekao da je ugovor OK" → šteta. Obavezno: jak disclaimer, izveštaj formulisan kao "pitanja za vašeg advokata", ne "ovo je bezbedno". Pro+ only.
**Kompleksnost:** M (upload postoji u obrasci flow-u, PDF text ekstrakcija postoji, novi prompt + izveštaj UI).

### C3. Slanje na potpis drugoj strani
**Opis:** dokument → link drugoj strani → ona pregleda, komentariše, "prihvatam" klik (nije kvalifikovani e-potpis, ali jeste trag saglasnosti); kasnije: integracija kvalifikovanog potpisa.
**Vrednost:** zatvara petlju (danas: generiši → ručno mejluj → štampaj/potpisuj); email slanje već postoji.
**Rizici:** pravna snaga "klik prihvatanja" ograničena — komunicirati pošteno; kvalifikovani e-potpis u Srbiji = komplikovane integracije (Halcom, eID) — to je XL, ne raditi prvo.
**Kompleksnost:** M (public token link + accept log) / XL (pravi e-potpis).

### C4. Novi tipovi dokumenata (kandidati po tražnji)
Osnivački akt d.o.o. (top-of-funnel! ljudi PRE firme), odluka o raspodeli dobiti, ugovor o pozajmici osnivača (čest kod d.o.o.), rešenje o službenom putu (veže se na putni nalog), otkaz ugovora o radu (osetljivo — pravni audit!), ugovor o autorskom delu (honorarci). Svaki = postojeći šablon procesa (prompt modul + wizard + fieldMap + docs), `docs/DEVELOPER_GUIDE`.
**Kompleksnost:** S po tipu.

---

## D. Growth / funnel

### D1. ⭐ SEO nadgradnja /obrasci stranica ✅ (10. jul 2026., implementirano)
**Opis:** schema.org markup (HowTo/FAQPage) na /obrasci/[slug], FAQ sekcija po obrascu, interno linkovanje obrazac↔kalkulator. Obrasci su prirodni SEO magnet (ljudi guglaju tačna imena obrazaca!).
**Implementirano:** `BreadcrumbList`+`HowTo`+`FAQPage` JSON-LD (izvedeno iz postojećih polja `LibraryFormMeta`, bez nove DB kolone), vidljiva FAQ sekcija (4 generička pitanja: autofill, zvaničnost, gde se predaje, broj strana), lagana keyword-mapa za interno linkovanje ka kalkulatorima/generatorima (zarad→kalkulator-zarade, paušal→kalkulator-pausala, M-4/M-8/zaposlen→ugovor-o-radu, otpremn→otpremnica). Kategorije obrazaca su institucionalne (poreska/apr/croso/lokalna/ostalo), ne tematske — tematsko linkovanje ka blogu bi tražilo novu kolonu za tagovanje, odloženo za sledeću rundu ako se pokaže vrednim. Testirano uživo (curl na dev serveru, JSON-LD i FAQ potvrđeni na `akciza-ee-i-kpg`, keyword link potvrđen na `m-4-pio`). `tsc`/`eslint` čisto.
**Vrednost:** besplatan organski funnel; biblioteka je javna — svaki obrazac je landing page.
**Kompleksnost:** S.

### D2. Još kalkulatora (SEO magneti)
Otpremnina, porodiljsko/trudničko naknada, bolovanje, porez na zakup, neoporezivi iznosi (godišnje se menjaju — održavanje!). Postojeći pattern: `app/kalkulator-*/page.tsx` + ToolLandingPage.
**Kompleksnost:** S po kalkulatoru; rizik: tačnost formula, godišnje ažuriranje.

### D3. Referral program
**Opis:** preporuči → oba dobiju mesec gratis. POSLE Paddle-a (treba naplata da bi popust imao smisla).
**Kompleksnost:** M.

### D4. Praćenje izmena zakona → obaveštenje korisnicima
**Opis:** kad se izmeni ZOR/PDV/paušal uredba, korisnici sa relevantnim dokumentima dobiju obaveštenje ("proverite ugovore, izmenjen čl. X"). Izvor: Službeni glasnik praćenje (n8n scraping?) + ručna kuracija.
**Vrednost:** trust + retencija + razlog za email koji nije spam.
**Rizici:** zahteva stalnu pravnu pažnju — poluautomatski proces, nikad pun automat.
**Kompleksnost:** M tehnički, trajan editorial trošak.

---

## E. Van trenutnog pozicioniranja (moonshots — zapisano da se ne zaboravi)

### E1. Regionalna ekspanzija (CG, BiH, HR)
Jezik blizak, pravni sistemi RAZLIČITI — svaki dokument treba pravni audit po jurisdikciji; HR = EU (veće tržište, GDPR/eIDAS...). Realno tek uz pravnog partnera po zemlji. **XL.**

### E2. White-label za računovođe
Računovodstvene agencije upravljaju dokumentima SVOJIH klijenata pod svojim brendom. Nadogradnja agency plana + timskih naloga; potencijalno najveći B2B kanal (jedna agencija = 50-200 malih firmi). Tek posle timskih naloga. **L.**

### E3. Marketplace pravnih šablona
Advokati objavljuju premium šablone, rev-share. Menja prirodu proizvoda (platforma vs. alat) — daleka budućnost. **XL.**

### E4. "Osnivanje firme" end-to-end
Vodič + svi dokumenti + svi obrasci za osnivanje (JRPPS imamo u kandidatima!) — hvata korisnike PRE nego što postanu preduzetnici. Delimično izvodljivo odmah (sadržaj + obrasci), potpuno tek uz APR API. **M sadržajno.**

---

## Predlog redosleda (moje viđenje, Milan odlučuje)

1. **Sad (pre naplate):** D1 (SEO obrasci — jeftino, funnel), A2 (KPO — paušalac paket), B2/B3 (obrasci uputstva + bundle), C4 osnivački akt
2. **Uz naplatu (Paddle):** A1 (rokovi — retention za pretplatu), A3+A4 (fakture status + opomena), katalog usluga (već u handover 02)
3. **Posle stabilne naplate:** C1 (dvojezični), C2 (review — pravno osetljivo, pažljivo), chatbot MVP (handover 06)
4. **Dugoročno:** C3, E2, D4, ostalo iz E
