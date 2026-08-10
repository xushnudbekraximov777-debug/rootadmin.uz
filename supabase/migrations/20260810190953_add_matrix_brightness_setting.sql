/*
# Add matrix_brightness column to settings table

1. Modified Tables
- `settings`
  - Added `matrix_brightness` (integer, not null, default 100)
  - Controls the opacity/brightness of the Matrix rain background effect
  - Range: 10–100 (enforced in the UI slider; database stores the raw integer)

2. Security
- No RLS policy changes — the settings table already has appropriate policies.

3. Notes
- Idempotent: uses a DO $$ ... END $$ block to check before adding.
- Default of 100 means existing deployments keep full brightness.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'matrix_brightness'
  ) THEN
    ALTER TABLE settings ADD COLUMN matrix_brightness integer NOT NULL DEFAULT 100;
  END IF;
END $$;
