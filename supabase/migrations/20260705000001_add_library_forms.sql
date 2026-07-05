-- Faza 4 Korak 1 — biblioteka kuriranih zvaničnih obrazaca.
-- fields jsonb sadrži SAMO ručno verifikovana zelena mapiranja (struktura, nikad vrednosti).
-- Lista je javna (SEO) — anon/authenticated čitaju samo published; pisanje isključivo service-role.

CREATE TABLE public.library_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  short_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('poreska','apr','croso','rzzo','lokalna','ostalo')),
  description text,
  source_institution text NOT NULL,
  source_url text NOT NULL,
  file_ref text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('acroform','flat')),
  -- Pismo obrasca, određeno pri kuraciji — na download nema DI poziva za detekciju
  script text NOT NULL DEFAULT 'cyrillic' CHECK (script IN ('cyrillic','latin')),
  page_count int NOT NULL,
  fields jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  verified_at timestamptz NOT NULL,
  outdated_reports int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX library_forms_category_idx ON public.library_forms(category);
CREATE INDEX library_forms_published_idx ON public.library_forms(published);

ALTER TABLE public.library_forms ENABLE ROW LEVEL SECURITY;

-- Javno čitanje samo publikovanih (lista/stranice obrazaca su SEO sadržaj)
CREATE POLICY "library forms: public read published"
  ON public.library_forms FOR SELECT
  USING (published = true);
-- Pisanje namerno bez policy-ja — samo service-role (kuratorski CLI, server-side).

-- Storage bucket za prazne originale obrazaca — privatan, download ide kroz API (service-role)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obrasci-library',
  'obrasci-library',
  false,
  10485760,
  ARRAY['application/pdf']
) ON CONFLICT DO NOTHING;
