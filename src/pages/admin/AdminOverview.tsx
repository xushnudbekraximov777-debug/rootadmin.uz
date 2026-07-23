import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Mail, FolderGit2, Cpu, Briefcase, ToggleLeft, ToggleRight, Wrench } from "lucide-react";
import { supabase, SETTINGS_ID } from "../../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";

type Stats = {
  views: number;
  messages: number;
  unread: number;
  projects: number;
  skills: number;
  experiences: number;
  open_for_freelance: boolean;
  maintenance_mode: boolean;
};

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    views: 0,
    messages: 0,
    unread: 0,
    projects: 0,
    skills: 0,
    experiences: 0,
    open_for_freelance: true,
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ count: views }, { count: messages }, { count: unread }, { count: projects }, { count: skills }, { count: experiences }, { data: settings }] =
        await Promise.all([
          supabase.from("profile_views").select("*", { count: "exact", head: true }),
          supabase.from("messages").select("*", { count: "exact", head: true }),
          supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("skills").select("*", { count: "exact", head: true }),
          supabase.from("experiences").select("*", { count: "exact", head: true }),
          supabase.from("settings").select("*").eq("id", SETTINGS_ID).maybeSingle(),
        ]);

      setStats({
        views: views ?? 0,
        messages: messages ?? 0,
        unread: unread ?? 0,
        projects: projects ?? 0,
        skills: skills ?? 0,
        experiences: experiences ?? 0,
        open_for_freelance: settings?.open_for_freelance ?? true,
        maintenance_mode: settings?.maintenance_mode ?? false,
      });
      setLoading(false);
    })();
  }, []);

  const toggleSetting = async (key: "open_for_freelance" | "maintenance_mode", value: boolean) => {
    setStats((s) => ({ ...s, [key]: value }));
    await supabase.from("settings").update({ [key]: value, updated_at: new Date().toISOString() }).eq("id", SETTINGS_ID);
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Eye className="h-5 w-5" />} label="Portfolio Views" value={stats.views} delay={0} />
        <StatCard icon={<Mail className="h-5 w-5" />} label="Messages" value={stats.messages} delay={0.1} badge={stats.unread > 0 ? `${stats.unread} new` : undefined} />
        <StatCard icon={<FolderGit2 className="h-5 w-5" />} label="Projects" value={stats.projects} delay={0.2} />
        <StatCard icon={<Cpu className="h-5 w-5" />} label="Skills" value={stats.skills} delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                Quick Stats
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Experiences</span>
                <span className="font-mono text-accent">{stats.experiences}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projects</span>
                <span className="font-mono text-accent">{stats.projects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Skills</span>
                <span className="font-mono text-accent">{stats.skills}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unread Messages</span>
                <span className="font-mono text-accent">{stats.unread}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleRight className="h-4 w-4 text-accent" />
              Quick Toggles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">Open for Freelance</p>
                  <p className="text-xs text-slate-500">Show "Available" status on site</p>
                </div>
                <Switch checked={stats.open_for_freelance} onChange={(v) => toggleSetting("open_for_freelance", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">Take the public site offline</p>
                </div>
                <Switch checked={stats.maintenance_mode} onChange={(v) => toggleSetting("maintenance_mode", v)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-accent" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction to="/admin/hero" label="Edit Hero" />
            <QuickAction to="/admin/projects" label="Add Project" />
            <QuickAction to="/admin/skills" label="Manage Skills" />
            <QuickAction to="/admin/messages" label="View Inbox" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  delay,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  delay: number;
  badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-accent">{icon}</span>
        {badge && <Badge variant="warning">{badge}</Badge>}
      </div>
      <p className="text-2xl font-bold text-slate-100 font-mono">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </motion.div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-md border border-base-600 bg-base-850 px-4 py-3 text-sm text-slate-300 hover:border-accent/50 hover:text-accent transition-colors text-center"
    >
      {label}
    </Link>
  );
}
