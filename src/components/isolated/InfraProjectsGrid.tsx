import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type InfraProject = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  sort_order: number;
};

const ICONS: Record<string, string> = {
  bot: "🤖",
  mail: "📧",
  cloud: "☁️",
  shield: "🛡️",
  container: "📦",
  chart: "📊",
  server: "🖥️",
  network: "🌐",
  database: "🗄️",
  lock: "🔒",
};

export function InfraProjectsGrid() {
  const [projects, setProjects] = useState<InfraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("infra_projects")
      .select("id, title, description, icon, tags, sort_order")
      .order("sort_order", { ascending: true });
    setProjects((data as InfraProject[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Live updates when admin adds/edits/deletes a project
    channelRef.current = supabase
      .channel("public_infra_projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "infra_projects" },
        () => { load(); }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <p className="font-mono text-sm text-accent animate-pulse">
          Loading infrastructure projects…
        </p>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-100">
          Real-World <span className="text-emerald-400">Infrastructure</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Production systems I've designed, deployed, and maintained.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            className={`group relative rounded-xl p-6 bg-gray-900/50 backdrop-blur-md border transition-all duration-300 ${
              hovered === p.id
                ? "border-emerald-400/60 shadow-[0_0_20px_rgba(0,255,100,0.15)] -translate-y-1"
                : "border-slate-700/50"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 ${
                hovered === p.id ? "opacity-100" : ""
              }`}
            />

            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{ICONS[p.icon] ?? "🖥️"}</span>
                <h3 className="text-lg font-semibold text-slate-100">{p.title}</h3>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-4">{p.description}</p>

              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
