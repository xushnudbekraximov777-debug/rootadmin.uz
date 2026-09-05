-- Add image_url column to quiz_questions for network topology diagrams
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS image_url text;
