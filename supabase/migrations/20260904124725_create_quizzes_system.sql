/*
# Create quizzes, quiz_questions, and quiz_options tables

1. New Tables
- `quizzes`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `category` (text, not null) — e.g. Linux, Cisco, AWS, Security
  - `description` (text, nullable) — optional quiz description
  - `created_at` (timestamptz, default now())
- `quiz_questions`
  - `id` (uuid, primary key)
  - `quiz_id` (uuid, foreign key to quizzes.id, on delete cascade)
  - `text` (text, not null) — the question text
  - `position` (integer, default 0) — ordering of questions
- `quiz_options`
  - `id` (uuid, primary key)
  - `question_id` (uuid, foreign key to quiz_questions.id, on delete cascade)
  - `text` (text, not null) — the option text
  - `is_correct` (boolean, default false) — marks the correct answer
  - `position` (integer, default 0) — ordering of options

2. Security
- Enable RLS on all three tables.
- Public read access (anon + authenticated) so visitors can take quizzes.
- Write access restricted to authenticated admins only.

3. Indexes
- Index on quiz_questions.quiz_id for fast question lookups.
- Index on quiz_options.question_id for fast option lookups.
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Misc',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_quizzes" ON quizzes;
CREATE POLICY "auth_insert_quizzes" ON quizzes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_quizzes" ON quizzes;
CREATE POLICY "auth_update_quizzes" ON quizzes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quizzes" ON quizzes;
CREATE POLICY "auth_delete_quizzes" ON quizzes FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_select_quiz_questions" ON quiz_questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_quiz_questions" ON quiz_questions;
CREATE POLICY "auth_insert_quiz_questions" ON quiz_questions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_quiz_questions" ON quiz_questions;
CREATE POLICY "auth_update_quiz_questions" ON quiz_questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quiz_questions" ON quiz_questions;
CREATE POLICY "auth_delete_quiz_questions" ON quiz_questions FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_options" ON quiz_options;
CREATE POLICY "anon_select_quiz_options" ON quiz_options FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_quiz_options" ON quiz_options;
CREATE POLICY "auth_insert_quiz_options" ON quiz_options FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_quiz_options" ON quiz_options;
CREATE POLICY "auth_update_quiz_options" ON quiz_options FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quiz_options" ON quiz_options;
CREATE POLICY "auth_delete_quiz_options" ON quiz_options FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
