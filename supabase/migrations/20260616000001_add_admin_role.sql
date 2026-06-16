ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- RLS: admin može da čita sve profile
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- RLS: admin može da čita sve dokumente
CREATE POLICY "documents: admin read all"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- NAPOMENA: Da biste postavili admin prava za korisnika, pokrenite:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'uuid-tvog-naloga';
