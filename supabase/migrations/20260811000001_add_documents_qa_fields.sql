-- Nezavisan QA/lektor korak (drugi LLM poziv posle generisanja) — rezultat po dokumentu.
-- NULL = QA nije primenjiv (faktura/putni-nalog/otpremnica/ponuda-za-radove, nema LLM prozu).
-- [] = QA je prošao, nema nalaza. Ne-prazan niz = ima sadržaja.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS qa_fixed jsonb,
  ADD COLUMN IF NOT EXISTS qa_needs_review jsonb;
