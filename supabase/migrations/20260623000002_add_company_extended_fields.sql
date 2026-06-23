-- Extend companies table with fields useful for wizard auto-population
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS delatnost text,
  ADD COLUMN IF NOT EXISTS ziro_racun text,
  ADD COLUMN IF NOT EXISTS pdv_obveznik boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS website text;
