CREATE TABLE blog_keywords (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword      TEXT        NOT NULL,
  naslov       TEXT,
  alat         TEXT,
  format       TEXT        NOT NULL DEFAULT 'long-form',
  status       TEXT        NOT NULL DEFAULT 'pending',
  blog_post_id UUID        REFERENCES blog_posts(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Samo service role pristupa — interno za n8n
ALTER TABLE blog_keywords ENABLE ROW LEVEL SECURITY;
