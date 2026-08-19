-- SEO: odvojena meta title/description polja, nezavisna od vidljivog H1/body sadržaja.
-- Povod: GSC izveštaj 16.06-16.08.2026, niska CTR na nekoliko obrasci/blog stranica —
-- <title> tag treba da bude precizniji/prodavniji nego H1, bez menjanja vidljivog sadržaja.
-- NULL = fallback na postojeći kod (form.title/shortName odnosno post.title).

alter table library_forms
  add column if not exists meta_title text,
  add column if not exists meta_description text;

alter table blog_posts
  add column if not exists meta_title text,
  add column if not exists meta_description text;
