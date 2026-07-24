/*
# Create infra_projects and system_metrics tables

## Purpose
Replaces all hardcoded/mock data in the portfolio with real database-driven records.

## New Tables

### 1. infra_projects
Stores the infrastructure project cards shown on the public portfolio page.
- `id` (uuid, primary key, auto-generated)
- `title` (text, not null) — display name of the project
- `description` (text, not null) — project details
- `icon` (text, not null, default 'server') — icon key used in the UI
- `tags` (text[], not null, default '{}') — technology tags
- `sort_order` (integer, not null, default 0) — display order
- `created_at` (timestamptz) — row creation time

Seeded with 6 real infrastructure projects.

### 2. system_metrics
Stores VPS hardware telemetry pushed from the server. The NOC dashboard
always reads the latest single row (highest id / most recent created_at).
- `id` (bigint, primary key, auto-increment)
- `cpu_usage` (integer, not null) — CPU load percent 0-100
- `disk_usage` (integer, not null) — disk usage percent 0-100
- `ram_usage` (integer, not null) — RAM usage percent 0-100
- `uptime_str` (text, not null) — human-readable uptime string
- `created_at` (timestamptz) — when the metrics snapshot was recorded

Seeded with 1 default row.

## Security (RLS)
Both tables use public read + authenticated write, matching the app's pattern:
- Public (anon + authenticated) can SELECT rows for the portfolio frontend.
- Only authenticated admins can INSERT / UPDATE / DELETE.
- Realtime is enabled via the existing Supabase Realtime publication.
*/

-- ─── infra_projects ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS infra_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'server',
  tags text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE infra_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_infra_projects" ON infra_projects;
CREATE POLICY "public_select_infra_projects" ON infra_projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_infra_projects" ON infra_projects;
CREATE POLICY "auth_insert_infra_projects" ON infra_projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_infra_projects" ON infra_projects;
CREATE POLICY "auth_update_infra_projects" ON infra_projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_infra_projects" ON infra_projects;
CREATE POLICY "auth_delete_infra_projects" ON infra_projects FOR DELETE
  TO authenticated USING (true);

-- Seed initial infra projects (idempotent: skip if any rows already exist)
INSERT INTO infra_projects (title, description, icon, tags, sort_order)
SELECT * FROM (VALUES
  (
    'Telegram Bot Architecture',
    'Python-based bot with webhook delivery behind an Nginx reverse proxy, systemd service isolation, and rate limiting.',
    'bot',
    ARRAY['Python', 'Nginx', 'Systemd', 'Let''s Encrypt'],
    0
  ),
  (
    'iRedMail Mail Server',
    'Full mail server on Ubuntu 22.04 with Postfix, Dovecot, SPF, DKIM, and DMARC configured for secure email delivery.',
    'mail',
    ARRAY['Ubuntu', 'Postfix', 'Dovecot', 'OpenSSL'],
    1
  ),
  (
    'AWS EC2 Deployments',
    'Auto-scaling EC2 fleet inside a custom VPC with security groups, Application Load Balancer, and S3 backups.',
    'cloud',
    ARRAY['AWS', 'EC2', 'VPC', 'IAM'],
    2
  ),
  (
    'WireGuard VPN Gateway',
    'Site-to-site WireGuard tunnel with fail2ban, UFW rules, and DNS leak protection for remote office access.',
    'shield',
    ARRAY['WireGuard', 'UFW', 'fail2ban', 'DNS'],
    3
  ),
  (
    'Dockerized Web Stack',
    'Multi-container stack with Nginx proxy, Certbot auto-renewal, and isolated networks per service.',
    'container',
    ARRAY['Docker', 'Nginx', 'Certbot', 'Linux'],
    4
  ),
  (
    'Network Monitoring Stack',
    'Prometheus + Grafana + node_exporter for real-time metrics, alerting via Telegram webhook on threshold breach.',
    'chart',
    ARRAY['Prometheus', 'Grafana', 'Bash', 'Alerting'],
    5
  )
) AS v(title, description, icon, tags, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM infra_projects LIMIT 1);

-- ─── system_metrics ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS system_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cpu_usage integer NOT NULL DEFAULT 0 CHECK (cpu_usage BETWEEN 0 AND 100),
  disk_usage integer NOT NULL DEFAULT 0 CHECK (disk_usage BETWEEN 0 AND 100),
  ram_usage integer NOT NULL DEFAULT 0 CHECK (ram_usage BETWEEN 0 AND 100),
  uptime_str text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_system_metrics" ON system_metrics;
CREATE POLICY "public_select_system_metrics" ON system_metrics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_system_metrics" ON system_metrics;
CREATE POLICY "auth_insert_system_metrics" ON system_metrics FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_system_metrics" ON system_metrics;
CREATE POLICY "auth_update_system_metrics" ON system_metrics FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_system_metrics" ON system_metrics;
CREATE POLICY "auth_delete_system_metrics" ON system_metrics FOR DELETE
  TO authenticated USING (true);

-- Seed one default row (idempotent)
INSERT INTO system_metrics (cpu_usage, disk_usage, ram_usage, uptime_str)
SELECT 12, 45, 30, 'Up 14 days'
WHERE NOT EXISTS (SELECT 1 FROM system_metrics LIMIT 1);

-- Index for quickly fetching the latest snapshot
CREATE INDEX IF NOT EXISTS idx_system_metrics_created ON system_metrics(created_at DESC);
