import { Lock, Terminal } from "lucide-react";

export function Footer({ logo }: { logo: string }) {
  return (
    <footer className="border-t border-base-800 mt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-sm text-accent glow-text">{logo}</div>
          <p className="text-xs text-slate-600 font-mono">
            Built with React, Supabase & a sysadmin's touch.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-accent transition-colors"
          >
            <Lock className="h-3 w-3" />
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
