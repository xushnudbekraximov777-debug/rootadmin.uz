/*
# Portfolio CMS Schema (single admin, public-read data)

1. Purpose
   Full portfolio + CMS for Raximov Xushnudbek. Public site reads content dynamically;
   admin manages all content via dashboard. Auth uses Supabase email/password.

2. Tables
   - profile          : single-row hero/contact info (name, title, bio, location, status, phone, email, telegram, cv_url, social links)
   - experiences      : work history (company, role, start, end, description, current)
   - education         : university/degree entries (institution, degree, field, start, end, description)
   - certifications   : certs (name, issuer, year, credential_url)
   - skills           : technical skills (name, category, proficiency, icon)
   - projects         : portfolio projects (title, description, tags, github_url, live_url, image_url, status)
   - messages         : contact form inbox (name, email, subject, message, read, created_at)
   - settings         : site settings (accent_color, seo_title, seo_description, resume_url, maintenance_mode, open_for_freelance)
   - security_logs    : admin auth/security events (event, ip, user_agent, created_at)
   - profile_views    : simple view counter (incremented on public site load)

3. Security
   - RLS enabled on every table.
   - Public tables (profile, experiences, education, certifications, skills, projects, settings):
     SELECT to anon, authenticated; write (insert/update/delete) to authenticated only.
   - messages: INSERT to anon, authenticated (contact form); SELECT/UPDATE/DELETE to authenticated only.
   - profile_views: INSERT to anon, authenticated; SELECT to authenticated only.
   - security_logs: SELECT/INSERT to authenticated only.
*/

-- Profile (single row, id=1 convention)
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Raximov Xushnudbek',
  title text NOT NULL DEFAULT 'Network Administrator & Cybersecurity Engineering Student',
  bio text NOT NULL DEFAULT 'Network administrator and Cybersecurity Engineering student focused on routing, switching, and server administration. Passionate about building secure, resilient network infrastructure.',
  location text NOT NULL DEFAULT 'Tashkent, Uzbekistan',
  status text NOT NULL DEFAULT 'Available for Hire',
  phone text NOT NULL DEFAULT '+998 (33) 1212002',
  email text NOT NULL DEFAULT 'raximovxushnudbekn1@gmail.com',
  telegram text NOT NULL DEFAULT '@RaximovXushnudbek',
  cv_url text DEFAULT '',
  github_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Experiences
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  start_date text NOT NULL,
  end_date text DEFAULT '',
  current boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Education
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  degree text NOT NULL,
  field text NOT NULL DEFAULT '',
  start_year text NOT NULL,
  end_year text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  year text NOT NULL,
  credential_url text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  proficiency int NOT NULL DEFAULT 80,
  icon text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  github_url text DEFAULT '',
  live_url text DEFAULT '',
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Messages (contact form inbox)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Settings (single row)
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accent_color text NOT NULL DEFAULT 'cyan',
  seo_title text NOT NULL DEFAULT 'Raximov Xushnudbek — Network Administrator & Cybersecurity Engineer',
  seo_description text NOT NULL DEFAULT 'Portfolio of Raximov Xushnudbek, Network Administrator and Cybersecurity Engineering student specializing in routing, switching, and server administration.',
  resume_url text DEFAULT '',
  maintenance_mode boolean NOT NULL DEFAULT false,
  open_for_freelance boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Security logs
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  ip text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Profile views (simple counter rows)
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS everywhere
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Profile policies (public read, auth write)
DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_profile" ON profile;
CREATE POLICY "auth_insert_profile" ON profile FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_profile" ON profile;
CREATE POLICY "auth_update_profile" ON profile FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_profile" ON profile;
CREATE POLICY "auth_delete_profile" ON profile FOR DELETE TO authenticated USING (true);

-- Experiences policies
DROP POLICY IF EXISTS "public_read_experiences" ON experiences;
CREATE POLICY "public_read_experiences" ON experiences FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_experiences" ON experiences;
CREATE POLICY "auth_insert_experiences" ON experiences FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_experiences" ON experiences;
CREATE POLICY "auth_update_experiences" ON experiences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_experiences" ON experiences;
CREATE POLICY "auth_delete_experiences" ON experiences FOR DELETE TO authenticated USING (true);

-- Education policies
DROP POLICY IF EXISTS "public_read_education" ON education;
CREATE POLICY "public_read_education" ON education FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_education" ON education;
CREATE POLICY "auth_insert_education" ON education FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_education" ON education;
CREATE POLICY "auth_update_education" ON education FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_education" ON education;
CREATE POLICY "auth_delete_education" ON education FOR DELETE TO authenticated USING (true);

-- Certifications policies
DROP POLICY IF EXISTS "public_read_certifications" ON certifications;
CREATE POLICY "public_read_certifications" ON certifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_certifications" ON certifications;
CREATE POLICY "auth_insert_certifications" ON certifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_certifications" ON certifications;
CREATE POLICY "auth_update_certifications" ON certifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_certifications" ON certifications;
CREATE POLICY "auth_delete_certifications" ON certifications FOR DELETE TO authenticated USING (true);

-- Skills policies
DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills" ON skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_skills" ON skills;
CREATE POLICY "auth_insert_skills" ON skills FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_skills" ON skills;
CREATE POLICY "auth_update_skills" ON skills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_skills" ON skills;
CREATE POLICY "auth_delete_skills" ON skills FOR DELETE TO authenticated USING (true);

-- Projects policies
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- Messages policies (anon can insert, auth can read/update/delete)
DROP POLICY IF EXISTS "public_insert_messages" ON messages;
CREATE POLICY "public_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_messages" ON messages;
CREATE POLICY "auth_read_messages" ON messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_messages" ON messages;
CREATE POLICY "auth_update_messages" ON messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE TO authenticated USING (true);

-- Settings policies (public read, auth write)
DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_settings" ON settings;
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_settings" ON settings;
CREATE POLICY "auth_delete_settings" ON settings FOR DELETE TO authenticated USING (true);

-- Security logs policies (auth only)
DROP POLICY IF EXISTS "auth_read_security_logs" ON security_logs;
CREATE POLICY "auth_read_security_logs" ON security_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_security_logs" ON security_logs;
CREATE POLICY "auth_insert_security_logs" ON security_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Profile views policies (anon can insert, auth can read)
DROP POLICY IF EXISTS "public_insert_profile_views" ON profile_views;
CREATE POLICY "public_insert_profile_views" ON profile_views FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_profile_views" ON profile_views;
CREATE POLICY "auth_read_profile_views" ON profile_views FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_sort ON experiences(sort_order);
CREATE INDEX IF NOT EXISTS idx_education_sort ON education(sort_order);
CREATE INDEX IF NOT EXISTS idx_certifications_sort ON certifications(sort_order);
CREATE INDEX IF NOT EXISTS idx_skills_sort ON skills(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
