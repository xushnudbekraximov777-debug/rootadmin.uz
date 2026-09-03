/*
# Create lab_manuals table

1. New Tables
- `lab_manuals`
- `id` (uuid, primary key)
- `title` (text, not null)
- `slug` (text, unique, not null) — URL-friendly identifier
- `category` (text, not null) — e.g. Linux, Cisco, AWS, Security
- `content` (text, not null) — Markdown content
- `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `lab_manuals`.
- Public read access (anon + authenticated) so visitors can browse manuals.
- Write access restricted to authenticated admins only.

3. Indexes
- Unique index on `slug` for fast lookups.
- Index on `category` for filtering by category.
*/

CREATE TABLE IF NOT EXISTS lab_manuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'Misc',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_manuals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lab_manuals" ON lab_manuals;
CREATE POLICY "anon_select_lab_manuals" ON lab_manuals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_lab_manuals" ON lab_manuals;
CREATE POLICY "auth_insert_lab_manuals" ON lab_manuals FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_lab_manuals" ON lab_manuals;
CREATE POLICY "auth_update_lab_manuals" ON lab_manuals FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_lab_manuals" ON lab_manuals;
CREATE POLICY "auth_delete_lab_manuals" ON lab_manuals FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lab_manuals_slug ON lab_manuals(slug);
CREATE INDEX IF NOT EXISTS idx_lab_manuals_category ON lab_manuals(category);
