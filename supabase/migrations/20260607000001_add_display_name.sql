-- Dodaje kolonu display_name u tabelu profiles
-- Pokreni: supabase db push (lokalno)
--          ili SQL editor u Supabase dashboard (cloud)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name text;
