CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id)
    ON DELETE CASCADE,
  ime text,
  email text NOT NULL,
  firma text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT contacts_user_email_unique UNIQUE (user_id, email)
);

CREATE INDEX contacts_user_id_idx
  ON public.contacts(user_id);

ALTER TABLE public.contacts
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: owner all"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
