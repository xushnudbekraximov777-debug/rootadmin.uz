/*
# Create cheatsheets table and kb_files storage bucket

1. New Tables
- `cheatsheets`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — title of the cheat sheet
  - `category` (text, not null) — e.g. Linux, Networking, Security, Docker
  - `description` (text, nullable) — optional short description
  - `content` (text, not null) — Markdown content
  - `tags` (text[], default empty array) — searchable tags
  - `is_private` (boolean, default true) — if true, only admins can see it; if false, public can read
  - `created_at` (timestamptz, default now())

2. Security — cheatsheets RLS
- Enable RLS on `cheatsheets`.
- Public SELECT: anon + authenticated can read rows where is_private = false.
- Admin SELECT: authenticated can read ALL rows (including private).
- Admin INSERT/UPDATE/DELETE: authenticated users have full CRUD.

3. Storage — kb_files bucket
- Insert a new public bucket named `kb_files` into `storage.buckets`.
- This bucket stores uploaded files/images for cheat sheets.

4. Security — storage.objects RLS for kb_files
- Public SELECT: anon + authenticated can read objects in kb_files.
- Admin INSERT/UPDATE/DELETE: authenticated users can manage objects in kb_files.

5. Notes
- Idempotent: table and bucket use IF NOT EXISTS; policies are dropped before creation.
- The bucket is public so uploaded files can be accessed via public URLs.
*/

-- ===== cheatsheets table =====
CREATE TABLE IF NOT EXISTS cheatsheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Linux',
  description text,
  content text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cheatsheets ENABLE ROW LEVEL SECURITY;

-- Public can read only non-private sheets
DROP POLICY IF EXISTS "public_read_cheatsheets" ON cheatsheets;
CREATE POLICY "public_read_cheatsheets" ON cheatsheets FOR SELECT
  TO anon, authenticated
  USING (is_private = false);

-- Admins can read ALL sheets (including private)
DROP POLICY IF EXISTS "admin_read_cheatsheets" ON cheatsheets;
CREATE POLICY "admin_read_cheatsheets" ON cheatsheets FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert
DROP POLICY IF EXISTS "admin_insert_cheatsheets" ON cheatsheets;
CREATE POLICY "admin_insert_cheatsheets" ON cheatsheets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can update
DROP POLICY IF EXISTS "admin_update_cheatsheets" ON cheatsheets;
CREATE POLICY "admin_update_cheatsheets" ON cheatsheets FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Admins can delete
DROP POLICY IF EXISTS "admin_delete_cheatsheets" ON cheatsheets;
CREATE POLICY "admin_delete_cheatsheets" ON cheatsheets FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS cheatsheets_category_idx ON cheatsheets (category);
CREATE INDEX IF NOT EXISTS cheatsheets_created_at_idx ON cheatsheets (created_at DESC);

-- ===== kb_files storage bucket =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('kb_files', 'kb_files', true)
ON CONFLICT (id) DO NOTHING;

-- ===== storage.objects RLS for kb_files =====
-- Public can read objects in kb_files
DROP POLICY IF EXISTS "public_read_kb_files" ON storage.objects;
CREATE POLICY "public_read_kb_files" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'kb_files');

-- Authenticated can insert objects in kb_files
DROP POLICY IF EXISTS "admin_insert_kb_files" ON storage.objects;
CREATE POLICY "admin_insert_kb_files" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kb_files');

-- Authenticated can update objects in kb_files
DROP POLICY IF EXISTS "admin_update_kb_files" ON storage.objects;
CREATE POLICY "admin_update_kb_files" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'kb_files') WITH CHECK (bucket_id = 'kb_files');

-- Authenticated can delete objects in kb_files
DROP POLICY IF EXISTS "admin_delete_kb_files" ON storage.objects;
CREATE POLICY "admin_delete_kb_files" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'kb_files');
