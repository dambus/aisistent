-- Sačuvani zaposleni (Pro+) — autofill za HR dokumente (ugovor-o-radu, resenje-godisnji-odmor, putni-nalog)
-- Primena lokalno: supabase db push
-- Primena cloud: SQL Editor u Supabase dashboardu
-- NE pokretati automatski

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ime text NOT NULL,
  jmbg text,
  pozicija text,
  datum_zaposlenja date,
  email text,
  plata_osnova numeric(12,2),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX employees_user_id_idx ON public.employees(user_id);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees: owner read"
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "employees: owner insert"
  ON public.employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "employees: owner update"
  ON public.employees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "employees: owner delete"
  ON public.employees FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "employees: service role all"
  ON public.employees FOR ALL
  USING (auth.role() = 'service_role');
