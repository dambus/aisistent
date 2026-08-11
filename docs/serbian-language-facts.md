# Srpske jezičke i zakonske činjenice — referenca za javni sadržaj

*Zadatak 3 iz `CLAUDE_CODE_BRIEF_gramatika.md`. Cilj: svaka brojčana/činjenična tvrdnja o jeziku
ili zakonu u marketingu/blogu/društvenim mrežama mora se proveriti naspram OVOG dokumenta pre
objave, ne generisati "iz glave" modela.*

*Kad se doda nova provera ovde, dodaj i checklist stavku ispod ako menja obim provere.*

---

## Jezičke činjenice

### Broj padeža

Srpski jezik ima **sedam** padeža: **nominativ, genitiv, dativ, akuzativ, vokativ, instrumental,
lokativ**.

> ⚠️ Poznata regresija (avgust 2026.): marketing sadržaj je dva puta nezavisno tvrdio "šest
> padeža" — jednom u `docs/marketing/instagram-launch-pack-2026-08-03.html` (ispravljeno 3.
> avgust, commit `6c3af2e`), drugi put u `docs/marketing/social-content-pack-2026-07-13.html`
> (ispravljeno 11. avgust, ova sesija — nije uhvaćeno u prvom prolazu jer je proverena samo
> Instagram grana, ne i stariji content pack). Ovo je razlog zašto checklist ispod eksplicitno
> traži pretragu SVIH fajlova u `docs/marketing/` i `content/blog/`, ne samo najnovijeg.

### Deklinacija u proizvodu

Proizvod tvrdi da deklinuje **imena, firme i novčane iznose** kroz relevantne padeže u pravnim
dokumentima (deterministički modul: `lib/declension/`, pilot samo u `ugovor-o-radu`, rollout na
ostale tipove dokumenta u toku — vidi `.ai-memory/STATE.md`). Ne tvrditi da je rollout kompletan
dok nije (proveri STATE.md pre objave bilo kog teksta koji implicira "svi dokumenti").

---

## Zakonske reference koje proizvod pominje

Pravilo: **javni sadržaj sme pomenuti NAZIV zakona bez broja člana** (to je uvek bezbedno ako je
naziv tačan). Sme pomenuti **konkretan broj člana SAMO** ako je taj broj proveren protiv
zvaničnog izvora (paragraf.rs, propisi.net, ili Službeni glasnik) u istoj sesiji kad se sadržaj
piše — ne iz sećanja modela, ne iz starijeg sadržaja bez datuma provere.

| Zakon | Skraćenica u sadržaju | Napomena |
|---|---|---|
| Zakon o radu | ZOR (retko skraćeno u marketingu — obično pun naziv) | Osnova za `ugovor-o-radu`, HR dokumenta. Konkretni članovi NISU generalno verifikovani za javni sadržaj — vidi incident ispod. |
| Zakon o obligacionim odnosima | ZOO | Osnova za `ugovor-o-delu`, `nda`, `ugovor-o-zakupu`, `ugovor-o-saradnji-zajmu`, `opsti-uslovi`. |
| Zakon o autorskim i srodnim pravima | ZASP | Pominje se u kontekstu autorskog prava (`lib/knowledge/autorsko-pravo.ts`). |
| Zakon o zaštiti poslovne tajne | — | "Sl. glasnik RS", br. 72/2011 — pominjano u `content/blog/nda-sporazum-srbija.md`. Broj glasnika nije reverifikovan ovom sesijom (nisko-rizično, nije brojčana tvrdnja o samom pravu). |

### Incident: pogrešan broj člana (11. avgust 2026.)

`content/blog/ugovor-o-delu-vs-ugovor-o-radu.md` je tvrdio "Zakon o radu u članu 31." za princip
prekvalifikacije prikrivenog radnog odnosa (ugovor o delu koji se faktički ponaša kao radni
odnos → tretira se kao radni odnos). Web provera (avgust 2026.) pokazala je da je **član 31**
Zakona o radu o obavezi poslodavca da upozna novog zaposlenog sa procesom rada — nevezano za
temu. Tačan broj člana za princip prekvalifikacije nije pouzdano potvrđen u ovoj sesiji (nije
jedan jasan član — kombinacija je opštih odredbi + prakse inspekcije rada). **Fix:** broj člana
uklonjen iz teksta, princip ostaje (tačan), bez lažne preciznosti. Ako se ubuduće doda konkretan
broj člana, mora se prvo proveriti direktno na paragraf.rs ili zvaničnom Službenom glasniku.

---

## Checklist pre objave javnog sadržaja

Primeniti na SVAKI tekst koji ide u `docs/marketing/`, `content/blog/`, landing page copy, ili se
šalje kroz marketing content pipeline (n8n) pre nego što izađe javno:

1. **Broj padeža** — ako se pominje broj, mora biti "sedam", nikad "šest". Grep pre objave:
   `padež|padeza|padeža` po celom fajlu koji se objavljuje.
2. **Obim deklinacije** — ako tekst implicira da su SVI tipovi dokumenta pokriveni determinističkom
   deklinacijom, proveri `.ai-memory/STATE.md` da li je rollout zaista završen (trenutno NIJE —
   pilot samo `ugovor-o-radu`).
3. **Naziv zakona** — proveri da je pun/skraćeni naziv tačan (tabela iznad). Bez broja člana
   ako nije sveže verifikovan.
4. **Broj člana zakona** — ako je tekst navodi, mora imati proverljiv izvor (link ili napomena
   "verifikovano [datum] na paragraf.rs") u istoj sesiji pisanja. Bez izvora → ukloni broj,
   zadrži princip uopšteno.
5. **Cena/pretplata** — dokument bez firme (APR registracija u toku, vidi `docs/BACKLOG.md`) —
   javni sadržaj ne sme pominjati konkretne cene dok ovo nije rešeno (QA korak u n8n pipeline-u
   ovo već hvata automatski za blog/LinkedIn/Instagram — vidi
   `docs/handover/2026-08-10-marketing-content-pipeline.md`).
6. **Pretraga starih fajlova, ne samo novog** — pre objave nove teme, jednom mesečno (ili kad se
   nađe slična greška) pokrenuti grep gore navedenih obrazaca kroz CEO `docs/marketing/` i
   `content/blog/`, ne samo fajl koji se trenutno piše. Ovaj incident (dva odvojena "šest padeža"
   u dva različita fajla, otkrivena tek mesec dana razmaka) je razlog za ovo pravilo.

---

## Primenjeno unazad (11. avgust 2026.)

Checklist primenjen retroaktivno na postojeći `docs/marketing/` i `content/blog/`:

- `docs/marketing/social-content-pack-2026-07-13.html:442` — "šest padeža" → "sedam padeža"
  (commit u istoj sesiji kao ovaj dokument).
- `content/blog/ugovor-o-delu-vs-ugovor-o-radu.md:48` — uklonjen neproverljiv "član 31." citat
  (commit u istoj sesiji kao ovaj dokument).
- `docs/marketing/instagram-launch-pack-2026-08-03.html` — već ispravno (fiksirano 3. avgust).
- `content/blog/nda-sporazum-srbija.md` — broj Službenog glasnika nije reverifikovan (nizak
  rizik, nije numerička tvrdnja o samom zakonu — ostavljeno kako jeste).
