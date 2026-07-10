-- Katalog usluga/artikala (Pro+) — sačuvane stavke za fakturu/ponudu-za-radove/otpremnicu
-- Primena lokalno: supabase db push
-- Primena cloud: SQL Editor u Supabase dashboardu
-- NE pokretati automatski

CREATE TABLE public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  naziv text NOT NULL,
  opis text,
  jedinica text NOT NULL DEFAULT 'kom',
  cena_bez_pdv numeric(12,2) NOT NULL DEFAULT 0,
  pdv_stopa numeric(5,2) NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX catalog_items_user_id_idx ON public.catalog_items(user_id);

-- RLS
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_items: owner read"
  ON public.catalog_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "catalog_items: owner insert"
  ON public.catalog_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "catalog_items: owner update"
  ON public.catalog_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "catalog_items: owner delete"
  ON public.catalog_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "catalog_items: service role all"
  ON public.catalog_items FOR ALL
  USING (auth.role() = 'service_role');
