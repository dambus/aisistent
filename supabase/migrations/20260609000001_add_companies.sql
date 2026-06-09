-- Korak R: Profil firme — companies tabela
-- Primena lokalno: supabase db push
-- Primena cloud: SQL Editor u Supabase dashboardu
-- NE pokretati automatski

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  naziv text NOT NULL,
  pib text,
  maticni_broj text,
  adresa text,
  grad text,
  zastupnik text,
  funkcija_zastupnika text,
  email text,
  telefon text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX companies_user_id_idx ON public.companies(user_id);

-- RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies: owner read"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "companies: owner insert"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "companies: owner update"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "companies: owner delete"
  ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "companies: service role all"
  ON public.companies FOR ALL
  USING (auth.role() = 'service_role');

-- Funkcija: osiguraj da samo jedna firma bude default
CREATE OR REPLACE FUNCTION public.ensure_single_default_company()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.companies
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_default_change
  AFTER INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_company();
