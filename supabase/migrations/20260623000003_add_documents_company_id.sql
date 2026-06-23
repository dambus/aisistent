-- Link documents to the company/client they were generated for
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
