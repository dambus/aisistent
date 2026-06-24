CREATE TABLE document_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  rating BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX document_ratings_doc_user_idx ON document_ratings(document_id, user_id);

ALTER TABLE document_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own ratings" ON document_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON document_ratings
  FOR UPDATE USING (auth.uid() = user_id);
