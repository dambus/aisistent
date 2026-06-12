Korak E: Landing page — app/page.tsx

Pročitaj PROGRESS.md i CLAUDE.md pre početka.

Napravi landing page za AIsistent (aisistent.rs) — AI generator 
pravnih dokumenata za srpske preduzetnike.

TON: Topao, lokalan, direktan. Pišemo kao da razgovaramo sa 
srpskim preduzetnikom koji nema vremena za komplikacije. 
Ne koristiti korporativni jezik. Ne koristiti anglicizme 
osim ako nema srpske reči. Sve na srpskom latinici.

TECH: Next.js App Router, Tailwind CSS, mobile-first.
Bez novih biblioteka — samo ono što već postoji u projektu.

SEKCIJE:

1. NAVIGATION (sticky)
   - Logo: "AIsistent" levo
   - Linkovi: "Kako radi" "Dokumenti" "Cenovnik" — smooth scroll
   - Dugme desno: "Prijavi se" → /login | "Moji dokumenti" → /dashboard
     (zavisi da li je korisnik ulogovan — proveri Supabase session)

2. HERO
   Headline (H1): "Pravni dokumenti za vaš biznis — za 2 minuta"
   Subheadline: "Prestanite da gubite vreme na ugovore. AIsistent 
   generiše profesionalne pravne dokumente na srpskom jeziku, 
   prilagođene vašem poslu."
   
   Dva CTA dugmeta:
   - Primarno: "Napravite prvi ugovor besplatno" → /register
   - Sekundarno: "Pogledajte primer" → scroll do #tipovi
   
   Social proof ispod dugmadi (placeholder koji se lako menja):
   "Već koriste preduzetnici, freelanceri i male firme širom Srbije"

3. KAKO RADI (id="kako-radi")
   3 koraka u redu (na mobilnom jedan ispod drugog):
   
   Korak 1 — ikonica forma
   Naslov: "Popunite kratku formu"
   Tekst: "Unesite osnovne podatke — ime, firma, uslovi. 
   Nema pravnog znanja potrebno."
   
   Korak 2 — ikonica AI/munja  
   Naslov: "AI generiše dokument"
   Tekst: "Za manje od 60 sekundi dobijate kompletan, 
   profesionalan dokument prilagođen srpskom pravu."
   
   Korak 3 — ikonica download
   Naslov: "Preuzmite i potpišite"
   Tekst: "PDF ili Word format, spreman za štampanje 
   i potpisivanje. Bez komplikacija."

4. TIPOVI DOKUMENATA (id="tipovi" id="dokumenti")
   6 kartica u gridu (2x3 na desktopu, 1x6 na mobilnom):
   
   - Ugovor o radu — "Za zapošljavanje radnika, usklađen sa 
     Zakonom o radu RS"
   - Ugovor o delu — "Za freelancere i projektnu saradnju, 
     sa poreskim napomenama"
   - NDA Sporazum — "Zaštitite poslovnu tajnu pre razgovora 
     sa partnerima"
   - Ugovor o zakupu — "Za stanove i poslovne prostore, 
     sa svim zakonskim elementima"
   - Ugovor o saradnji — "Za partnerstva i zajedničke projekte 
     između firmi"
   - Ugovor o zajmu — "Za pozajmice između fizičkih lica 
     ili firmi"
   
   Svaka kartica ima dugme "Napravi dokument" → /register
   (ako nije ulogovan) ili /dokumenti/[type] (ako je ulogovan)

5. CENOVNIK (id="cenovnik")
   4 kartice: Besplatno / Starter / Pro / Business
   
   Besplatno — €0
   "1 dokument mesečno, PDF sa oznakom"
   
   Starter — €9/mesečno
   "20 dokumenata, PDF bez oznake, arhiva"
   
   Pro — €25/mesečno  
   "Neograničeno, PDF + Word, prioritet"
   ← označi kao "Najpopularnije"
   
   Business — €60/mesečno
   "5 korisnika, API pristup, podrška"
   
   Dugme na svakoj: "Počnite besplatno" → /register
   Napomena ispod: "Bez kreditne kartice. Otkažite kad hoćete."

6. CTA SEKCIJA (footer pre pravog footera)
   Headline: "Vaš sledeći ugovor je udaljen 2 minuta"
   Dugme: "Napravite nalog besplatno" → /register
   Tekst ispod: "Besplatno za uvek — bez kreditne kartice"

7. FOOTER
   Levo: © 2026 AIsistent. Sva prava zadržana.
   Centar: linkovi — Uslovi korišćenja | Politika privatnosti
     (za sada /uslovi i /privatnost — stranice ne moraju postojati)
   Desno: "Napravljeno u Srbiji 🇷🇸"

DIZAJN NAPOMENE:
- Primarna boja: po slobodnom izboru — nešto što deluje 
  profesionalno ali toplo (ne hladno plava korporacija)
- Hero može imati suptilnu pozadinsku ilustraciju ili gradient
- Kartice dokumenta imaju hover efekat
- Cenovnik kartica "Pro" vizuelno istaknuta
- Animacije: samo suptilne, bez preterivanja
- Ikone: koristiti emoji ili Heroicons (već u projektu?)

VAŽNO:
- Sve cene u evrima (€) jer je to što planiramo
- Nigde ne pisati "AI generated" ili slično na engleskom
- Pravna napomena u footeru: mali font, siva boja
- Meta tags: title i description na srpskom

Po završetku:
- Ažuriraj PROGRESS.md (Korak E ✅)
- Commituj: git add -A && git commit -m "feat: landing page"
- Napiši da li ima nešto što zahteva tvoju odluku
  (posebno oko izbora boja i ikonice)
