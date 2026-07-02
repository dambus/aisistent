-- Faza 3 Korak 1 — keš strukture poznatih obrazaca (fingerprint -> polja/sekcije).
-- Nikad ne sadrži korisničke vrednosti (PIB, ime, adresa) — samo strukturu obrasca
-- (labele, koordinate, profileKey/state). Pristup isključivo preko service-role klijenta
-- u API rutama — RLS je uključen bez policy-ja, pa anon/authenticated ključevi nemaju pristup.

CREATE TABLE public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text UNIQUE NOT NULL,
  name text,
  page_count int NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('acroform', 'flat', 'mixed')),
  fields jsonb NOT NULL,
  sections jsonb,
  hit_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX form_templates_fingerprint_idx ON public.form_templates(fingerprint);

ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
-- Namerno bez policy-ja — samo service-role (admin klijent, server-side) ima pristup.

-- Atomičan increment za hit_count + last_seen_at, poziva se iz templateCache.ts preko rpc().
CREATE FUNCTION public.increment_form_template_hit(p_fingerprint text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.form_templates
  SET hit_count = hit_count + 1,
      last_seen_at = now()
  WHERE fingerprint = p_fingerprint;
$$;
