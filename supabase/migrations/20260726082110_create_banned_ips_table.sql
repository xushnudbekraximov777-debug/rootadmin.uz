/*
# Create banned_ips table (NOC dashboard control plane)

## Purpose
Stores the list of currently blocked IP addresses. The NOC dashboard reads and
writes this table (ban/unban); the server-side monitoring script subscribes to
Realtime on this table and applies the actual iptables/fail2ban rules locally
on the enforcement point.

## New Table
### banned_ips
- `id` (uuid, primary key, auto-generated)
- `ip` (text, not null, unique) — the blocked IP address; unique so re-banning
  the same IP is idempotent (handled via upsert with onConflict: "ip")
- `reason` (text, default '') — optional human-readable reason for the ban
- `created_at` (timestamptz) — when the ban was recorded

## Security (RLS)
Single-tenant control-plane data, matching the app's existing pattern (the
dashboard already writes settings via the anon key). All CRUD is open to
anon + authenticated because the dashboard itself operates as anon.
- public_select_banned_ips  — SELECT anon, authenticated
- public_insert_banned_ips  — INSERT anon, authenticated
- public_update_banned_ips  — UPDATE anon, authenticated
- public_delete_banned_ips  — DELETE anon, authenticated

## Realtime
Added to the supabase_realtime publication so the dashboard receives live
INSERT/DELETE events and refreshes the ACTIVE BANNED IPS LIST instantly.
*/

CREATE TABLE IF NOT EXISTS banned_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_banned_ips" ON banned_ips;
CREATE POLICY "public_select_banned_ips" ON banned_ips FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_banned_ips" ON banned_ips;
CREATE POLICY "public_insert_banned_ips" ON banned_ips FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_banned_ips" ON banned_ips;
CREATE POLICY "public_update_banned_ips" ON banned_ips FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_banned_ips" ON banned_ips;
CREATE POLICY "public_delete_banned_ips" ON banned_ips FOR DELETE
  TO anon, authenticated USING (true);

-- Idempotent unique constraint so upserts on conflict(ip) work and duplicate
-- bans don't create duplicate rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_banned_ips_ip ON banned_ips(ip);

ALTER PUBLICATION supabase_realtime ADD TABLE banned_ips;
