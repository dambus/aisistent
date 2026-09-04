# Plan objava — blog, Instagram, LinkedIn

**Klasa dokumenta:** STANJE (prepisuje se u celini, ne dopisuje)
**Poslednja provera:** 2026-09-04
**Nadređeni izvor:** n8n workflow `QeNEPp3XlJlm6uBB` i Supabase tabele `content_items` / `blog_posts`

> Ako se ovaj dokument razlikuje od workflow-a ili baze — **workflow i baza su tačni**, a dokument
> je zastareo i treba ga ispraviti. Dokument opisuje kako sistem radi, ne kako bi trebalo da radi.

---

## 1. Osnovno pravilo

**Jedna tema nedeljno, tri objave.** Blog je izvor; Instagram i LinkedIn su dva različita ugla
na istu temu. Nijedan kanal ne uvodi svoju temu nezavisno.

Tema živi kao jedan red u `content_items` i kroz nedelju prolazi kroz sva tri kanala.

---

## 2. Nedeljni ritam

| Dan | Šta se dešava | Ko radi |
|---|---|---|
| Ponedeljak 09:00 | Pipeline uzima najstariju `pending` temu → blog draft → QA lektura → poster + LinkedIn tekst (ugao A) | automatski |
| Utorak | Objava bloga u `/admin/blog`, zatim Instagram poster i LinkedIn tekst | ručno |
| Četvrtak 09:00 | Pipeline uzima **istu** temu → poster + LinkedIn tekst (ugao B) | automatski |
| Petak ili subota | Objava druge Instagram i LinkedIn objave | ručno |

Sve što pipeline napravi je **draft**. Ništa se ne objavljuje automatski, ni na jednom kanalu.
Telegram javlja da je nešto spremno; objava je uvek tvoja odluka.

**Blog ide prvi.** Objave upućuju na blog, pa blog mora biti živ pre njih. Zaliha draftova
(trenutno 4) služi upravo tome — objavljuje se po jedan nedeljno, unapred.

---

## 3. Zavisnost četvrtka od ponedeljka

Četvrtak **ne uzima novu temu**. Čita poslednji red iz `content_items` koji:

- ima `blog_post_id` (znači ponedeljak je prošao),
- **i** čiji je pripadajući `blog_posts.published = true`,
- **i** još nema `linkedin_copy` (znači četvrtak ga još nije obradio).

Ovo je strukturna sinhronizacija — kanali se ne mogu razići ni kad neko zaboravi korak.

### Ako uslov nije ispunjen

Četvrtak **tiho preskače**. Ne uzima zamensku temu, ne pravi objavu bez pokrića.

Telegram obaveštenje ide **uvek** kad se preskoči, sa razlogom:

- `blog draft nije objavljen` — postoji tekst, ali `published = false`
- `ponedeljak nije prošao` — nema `blog_post_id`
- `nema neobrađenih tema` — sve obrađeno

Preskočena nedelja nije greška. Bolje nijedna objava nego objava koja upućuje na prazno.

---

## 4. Pravilo referenciranja bloga

**Nijedan tekst za Instagram ili LinkedIn ne sme sadržati link ka blogu koji nije objavljen.**

Ovo važi za oba dana i mora biti provereno u kodu, ne prepušteno redosledu ručnih koraka.

- Ako je `blog_posts.published = true` → CTA sme biti link ka članku
- Ako nije → CTA je link ka alatu (`https://aisistent.rs/dokumenti/{alat}`) ili „Link u bio",
  a tekst ne sme spominjati članak, „pročitaj više", „ceo tekst na blogu" ni slično

**Poznato odstupanje (2026-09-04):** ponedeljkov čvor `Code in JavaScript2` bezuslovno
ubacuje `https://aisistent.rs/blog/{slug}` u LinkedIn prompt, dok je blog u tom trenutku uvek
`published = false`. Radi samo zato što se blog ručno objavi pre lepljenja posta. Treba ispraviti.

---

## 5. Arhetipovi objava

Razlika između dve nedeljne objave nije u temi nego u **poslu koji objava obavlja**. Ista tema,
dva različita arhetipa. Arhetip se upisuje u `content_items` radi kasnije analize.

| Arhetip | Šta radi | Renderer |
|---|---|---|
| **Postupak** | Tri koraka do gotovog dokumenta | `headline` + 3 `steps` |
| **Rok ili broj** | Konkretan zakonski rok, prag ili iznos | `disclaimer` nosi naziv zakona |
| **Pre/posle** | Pogrešna formulacija naspram ispravne | kontrast u `headline` |
| **Mit** | Raščišćavanje raširene zablude | tvrdnja + 3 razloga |
| **Greška** | „Ovo piše u većini ugovora i ne važi" | greška + posledica |

**Ponedeljak** uzima *Postupak* ili *Rok ili broj* — oba prirodno vode ka članku.
**Četvrtak** rotira kroz *Pre/posle*, *Mit* i *Grešku*.

Napomena: *Pre/posle* je jedini arhetip koji je do sada dobio deljenje („Isplatiti Ana Marković",
7. avgust). Uzorak je premali za zaključak, ali ide u istom smeru kao i očekivanje — ljudi dele
grešku koju prepoznaju kod sebe, ne rezime članka.

---

## 6. Backlog tema

Izvor je `content_items` sa `status = 'pending'`, sortirano po `created_at` rastuće.

Stanje 2026-09-04: **19 tema `pending`**, 17 `done`.

Pri jednoj temi nedeljno backlog traje do sredine januara 2027. Dopuniti kad padne ispod 8.

**Bitno:** četvrtak ne sme da troši `pending` teme. Do 4. septembra 2026. jeste — tri teme su
potrošene bez bloga (17 `done`, ali samo 14 sa `blog_post_id`). Ispravlja se pravilom iz sekcije 3.

---

## 7. Reelovi

Ostaju **potpuno ručni**. Renderer pravi statične postere i to radi dobro; video je drugi problem.
Canva je isprobana i odbačena — nekonzistentna pozadina, greške u fontovima.

Ritam: **jedan reel mesečno**, iz najjače teme tog meseca, po pravilu u *Pre/posle* formatu —
to je jedini format gde video pokazuje nešto što slika ne može, jer se vidi proizvod u radu.

Postupak izrade: vidi `REELS.md`.

---

## 8. Jezik i copy pravila

Sva pravila o jeziku, tonu i formulacijama žive u **`BREND-PRAVILA.md`**. n8n promptovi se
prepisuju odatle i ne pišu nezavisno.

Ukratko, jer je mandatorno: **gramatički i pravopisno besprekoran srpski, latinica, bez
anglicizama.** Tekst koji ide na sliku ne može se ispraviti bez ponovnog renderovanja i ponovne
objave, pa svaka grana koja generiše `graphic` polja mora imati QA i determinističku proveru
homoglifa pre renderovanja.

**Poznato odstupanje (2026-09-04):** četvrtkova grana nema ni QA korak ni `fixHomoglyphs`.
Treba ispraviti pre sledećeg četvrtka.

---

## 9. Šta nije automatizovano i ostaje ručno

- Objava bloga (`/admin/blog`)
- Objava na Instagramu (Zernio dashboard, Drafts)
- Objava na LinkedInu (copy/paste iz Telegrama)
- Reelovi u celini
- Dopunjavanje backloga tema
