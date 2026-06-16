ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false;

-- Postojeći korisnici dobijaju false (mogu sami pokrenuti reset u podešavanjima)
-- Novi korisnici startuju sa false, onboarding se prikazuje automatski
