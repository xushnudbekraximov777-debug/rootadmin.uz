/*
# Create ctf_articles table for CTF Writeups & Security Notes

1. New Tables
- `ctf_articles`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — title of the writeup
  - `slug` (text, not null, unique) — URL-friendly identifier
  - `content` (text, not null) — full writeup body
  - `difficulty` (text, not null) — Easy | Medium | Hard
  - `category` (text, not null) — Web | Pwn | Crypto | Forensics | etc.
  - `tags` (text[], default empty array) — searchable tags
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `ctf_articles`.
- Public read access: anyone (anon + authenticated) can SELECT.
- Admin write access: only authenticated users can INSERT / UPDATE / DELETE.
- This matches the existing app pattern: public portfolio visitors read, logged-in admins write.

3. Indexes
- Unique index on `slug` for lookups by slug.
- Index on `created_at` desc for chronological listing.
*/

CREATE TABLE IF NOT EXISTS ctf_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Medium',
  category text NOT NULL DEFAULT 'Web',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ctf_articles ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_ctf_articles" ON ctf_articles;
CREATE POLICY "public_read_ctf_articles" ON ctf_articles FOR SELECT
  TO anon, authenticated USING (true);

-- Admin insert
DROP POLICY IF EXISTS "admin_insert_ctf_articles" ON ctf_articles;
CREATE POLICY "admin_insert_ctf_articles" ON ctf_articles FOR INSERT
  TO authenticated WITH CHECK (true);

-- Admin update
DROP POLICY IF EXISTS "admin_update_ctf_articles" ON ctf_articles;
CREATE POLICY "admin_update_ctf_articles" ON ctf_articles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Admin delete
DROP POLICY IF EXISTS "admin_delete_ctf_articles" ON ctf_articles;
CREATE POLICY "admin_delete_ctf_articles" ON ctf_articles FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS ctf_articles_slug_idx ON ctf_articles (slug);
CREATE INDEX IF NOT EXISTS ctf_articles_created_at_idx ON ctf_articles (created_at DESC);
