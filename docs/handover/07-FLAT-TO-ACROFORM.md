# Flat→AcroForm konverzija pri kuraciji — implementaciono uputstvo

*BACKLOG / FAZA4 spec sekcija 11. Otključava flat obrasce (OPD, eko taksa, M-A...) za biblioteku — danas publish odbija flat jer korisnik ne može da ih popuni u PDF čitaču.*

## Ideja

Pri kuraciji flat PDF-a, kurator (uz pipeline predlog koordinata) DODA prava AcroForm text polja na poznate koordinate praznina. Rezultat: obrazac u biblioteci JESTE AcroForm — korisnik ga popunjava u Adobe-u, naš fill radi standardno.

## Postojeći delovi koji se koriste

- `lib/documentIntelligence/extractFlatPdfFields.ts` — VEĆ nalazi kandidate praznina (prazne ćelije tabela, selection marks, underscore runs) sa bounding box-ovima; propose ih VEĆ upisuje u curation JSON kao `{kind:'flat', page, x, y, w, h}`
- `lib/documentIntelligence/pdfCoordinates.ts` — konverzija DI inči → pdf-lib pt sa Y-flip; OBAVEZNO koristiti, ne računati ručno
- `scripts/curate-form.ts` — publish trenutno ODBIJA flat (`meta.source_type !== 'acroform'` check); tu se uklapa konverzija
- pdf-lib: `form.createTextField(name)` + `field.addToPage(page, {x, y, width, height})` — dokumentovan API

## Koraci

1. **Novi korak u curate-form.ts**: komanda `convert <pdf> <curation.json>` (između propose i publish):
   - Za svako polje `kind:'flat'` sa `profileKey` upisanim ILI markerom `keepAsField: true` (kurator označi i polja bez autofill-a koja korisnik treba ručno da kuca) — kreiraj AcroForm text polje na tim koordinatama
   - Imenovanje polja: `field_<page>_<redni>` ili čitljivije iz labele (`slugify(_label)`) — konzistentno, jer publish onda mapira `kind:'acroform', fieldName` na ta imena
   - Sačuvaj kao `<ime>-converted.pdf`; curation JSON automatski prepiši: flat entries → acroform entries sa novim fieldName-ovima; `meta.source_type` → `'acroform'`
2. **Publish onda radi standardno** nad konvertovanim PDF-om — bez izmena publish logike
3. **Vizuelna kontrola OBAVEZNA**: otvoriti konvertovan PDF u pravom Adobe Reader-u (ne samo pymupdf render) — polja moraju biti klikabilna, na pravim mestima, pravih veličina

## Zamke — OZBILJNE, zato ovo nije trivijalno

- **Koordinate**: DI daje inče od GORNJEG levog ugla; pdf-lib radi u pt od DONJEG levog. `pdfCoordinates.ts` to rešava — koristi POSTOJEĆE funkcije. Bug ovde = polja na pogrešnoj polovini strane.
- **Font za ćirilicu**: kreirana polja moraju imati appearance font koji podržava ćirilicu/dijakritiku. `fillLibraryForm.ts` već rešava setDefaultAppearance za APR polja — ista logika, ali proveriti i da PRAZAN obrazac u Adobe-u prihvata ćirilični unos (Adobe koristi svoj font za unos — obično OK, testirati)
- **Underscore runs**: originalne linije `___` ostaju vizuelno ISPOD novog polja — prihvatljivo (polje je transparentno preko), ali proveriti da tekst ne izgleda precrtano; ako smeta, polje pomeriti par pt iznad linije
- **Checkbox-ovi**: selection marks bi bili `createCheckBox` — za PRVU verziju preskočiti (samo text polja), checkbox dodati kasnije
- **Veličina polja**: DI bbox ćelije može biti visok — polje visine >20pt izgleda čudno; kapirati visinu na ~14-16pt centrirano u bbox

## Prvi test kandidat

`OPD-o` — kuriran kao flat ranije (`scripts/curation/OPD-o.curation.json` postoji sa koordinatama), poznat nam je, jednostavan. Zatim eko taksa.

## Kriterijumi gotovosti

1. `convert` komanda radi na OPD-o; konvertovan PDF u Adobe-u: polja klikabilna, ćirilica radi
2. publish + go-live prolazi standardno; download popunjeno upisuje u prava polja
3. Dokumentovati u `docs/obrasci/SKRIPTE_UPUTSTVO.md` novi korak
