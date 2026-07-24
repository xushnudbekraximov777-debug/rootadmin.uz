/*
# Add matrix_enabled setting and page_views tracking table

1. Purpose
   Supports the new Matrix Rain background toggle and silent visitor tracking
   for the public portfolio site. Both features are controlled from the NOC dashboard.

2. Changes to existing tables
   - `settings`: adds `matrix_enabled` boolean column (default false).
     The existing single settings row (id = SETTINGS_ID) is updated to false
     so the site renders normally until an admin opts in.

3. New Tables
   - `page_views`
     - `id` (uuid, primary key)
     - `ip_address` (text) — best-effort visitor IP (may be null when unknown)
     - `os_browser` (text) — parsed from navigator.userAgent
     - `created_at` (timestamptz)

4. Security
   - RLS enabled on `page_views`.
   - INSERT allowed for `anon, authenticated` so the public site can log visits
     without a sign-in session.
   - SELECT/UPDATE/DELETE restricted to `authenticated` (admin dashboard only).
   - `settings` already has public read + auth write policies; the new column
     inherits those existing policies automatically — no policy changes needed.
*/

-- Add matrix_enabled to settings (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'matrix_enabled'
  ) THEN
    ALTER TABLE settings ADD COLUMN matrix_enabled boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Ensure the existing settings row has the new column set
UPDATE settings SET matrix_enabled = false WHERE matrix_enabled IS NULL;

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text DEFAULT '',
  os_browser text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Public can insert a view row (silent tracker)
DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views" ON page_views FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only authenticated admins can read/update/delete view rows
DROP POLICY IF EXISTS "auth_read_page_views" ON page_views;
CREATE POLICY "auth_read_page_views" ON page_views FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_page_views" ON page_views;
CREATE POLICY "auth_update_page_views" ON page_views FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_page_views" ON page_views;
CREATE POLICY "auth_delete_page_views" ON page_views FOR DELETE
  TO authenticated USING (true);

-- Index for dashboard ordering
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
