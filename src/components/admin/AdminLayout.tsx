import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Cpu,
  FolderGit2,
  Mail,
  Settings,
  LogOut,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/cn";

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/hero", label: "Hero Editor", icon: User },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/education", label: "Education & Certs", icon: GraduationCap },
  { to: "/admin/skills", label: "Skills", icon: Cpu },
  { to: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { to: "/admin/messages", label: "Inbox", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex bg-base-950">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-base-800 bg-base-900/50">
        <div className="p-5 border-b border-base-800">
          <Link to="/admin/dashboard" className="font-mono text-sm font-semibold text-accent glow-text">
            &lt;RaximovAdmin /&gt;
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "text-slate-400 hover:bg-base-800 hover:text-slate-200 border border-transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-base-800 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-base-800 hover:text-slate-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </a>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-base-800 bg-base-900/50 px-4 h-14">
          <Link to="/admin/dashboard" className="font-mono text-sm font-semibold text-accent">
            &lt;Admin /&gt;
          </Link>
          <button onClick={handleSignOut} className="text-slate-400">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 px-2 py-2 border-b border-base-800 bg-base-900/30">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors",
                  active ? "bg-accent/10 text-accent" : "text-slate-400"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {user && (
              <div className="mb-6 text-xs text-slate-600 font-mono">
                logged in as {user.email}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
