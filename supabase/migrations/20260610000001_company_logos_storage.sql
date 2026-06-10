-- Storage bucket za logo firme
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  false,
  2097152,
  ARRAY['image/png','image/jpeg','image/svg+xml','image/webp']
) ON CONFLICT DO NOTHING;

-- RLS politike
CREATE POLICY "company logos: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "company logos: owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "company logos: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "company logos: service role"
  ON storage.objects FOR ALL
  USING (auth.role() = 'service_role');

-- Dodaj logo_url kolonu na companies tabelu
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
