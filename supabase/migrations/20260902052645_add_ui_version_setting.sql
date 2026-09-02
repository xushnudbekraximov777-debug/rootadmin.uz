-- Add ui_version column to settings table
-- Allows toggling between 'legacy' and 'modern' public UI
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ui_version text DEFAULT 'legacy';

-- Backfill existing row to 'legacy' if NULL
UPDATE settings SET ui_version = 'legacy' WHERE ui_version IS NULL;
