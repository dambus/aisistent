UPDATE public.profiles
SET
  plan = 'pro',
  documents_this_month = 0
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'test@aisistent.rs'
);
