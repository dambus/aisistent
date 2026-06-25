CREATE TABLE blog_posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  content_md  TEXT        NOT NULL DEFAULT '',
  date        DATE        NOT NULL,
  read_time   TEXT        NOT NULL DEFAULT '',
  keywords    TEXT[]      NOT NULL DEFAULT '{}',
  published   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Svi mogu čitati objavljene postove (blog je javan)
CREATE POLICY "public_read_published" ON blog_posts
  FOR SELECT USING (published = true);
