-- Add industry column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'general';

-- Valid values: 'general', 'trade', 'services', 'construction',
-- 'accounting', 'marketing', 'hr', 'freelance', 'health', 'hospitality'
-- Default 'general' = Preduzetnik / Opšte
