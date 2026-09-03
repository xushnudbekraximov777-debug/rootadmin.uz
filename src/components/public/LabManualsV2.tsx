import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { LabManual } from "../../lib/types";

const categoryColors: Record<string, { border: string; glow: string; text: string }> = {
  Linux: { border: "rgba(34 211 238 / 0.4)", glow: "rgba(34 211 238 / 0.08)", text: "text-cyan-400" },
  Cisco: { border: "rgba(251 191 36 / 0.4)", glow: "rgba(251 191 36 / 0.08)", text: "text-amber-400" },
  AWS: { border: "rgba(251 146 60 / 0.4)", glow: "rgba(251 146 60 / 0.08)", text: "text-orange-400" },
  Security: { border: "rgba(239 68 68 / 0.4)", glow: "rgba(239 68 68 / 0.08)", text: "text-red-400" },
  Networking: { border: "rgba(34 255 136 / 0.4)", glow: "rgba(34 255 136 / 0.08)", text: "text-green-400" },
  Docker: { border: "rgba(96 165 250 / 0.4)", glow: "rgba(96 165 250 / 0.08)", text: "text-blue-400" },
  Databases: { border: "rgba(168 85 247 / 0.4)", glow: "rgba(168 85 247 / 0.08)", text: "text-purple-400" },
  "Shell Scripting": { border: "rgba(34 211 238 / 0.4)", glow: "rgba(34 211 238 / 0.08)", text: "text-cyan-400" },
  Misc: { border: "rgba(148 163 184 / 0.3)", glow: "rgba(148 163 184 / 0.06)", text: "text-slate-400" },
};

function getCatColor(cat: string) {
  return categoryColors[cat] ?? categoryColors.Misc;
}

export function LabManualsV2() {
  const [manuals, setManuals] = useState<LabManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("lab_manuals").select("*").order("created_at", { ascending: false });
      setManuals((data as LabManual[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = ["All", ...Array.from(new Set(manuals.map((m) => m.category)))];
  const filtered = activeCat === "All" ? manuals : manuals.filter((m) => m.category === activeCat);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
        <div className="font-mono text-accent animate-pulse">Loading manuals...</div>
      </section>
    );
  }

  return (
    <section id="manuals" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-accent">
          <FlaskConical className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">Lab Manuals & Tutorials</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-mono transition-all ${
              activeCat === cat
                ? "border-accent/40 text-accent"
                : "border-base-700 text-slate-500 hover:border-accent/20 hover:text-slate-300"
            }`}
            style={activeCat === cat ? { background: "rgba(var(--accent) / 0.06)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento-box grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
        {filtered.map((m, i) => {
          const colors = getCatColor(m.category);
          const isWide = i % 5 === 0;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className={`group relative rounded-2xl border p-6 transition-all overflow-hidden ${isWide ? "sm:col-span-2 lg:col-span-1" : ""}`}
              style={{ borderColor: colors.border, background: colors.glow, backdropFilter: "blur(16px)" }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 h-6 w-6 border-l border-t rounded-tl-2xl" style={{ borderColor: colors.border }} />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-r border-b rounded-br-2xl" style={{ borderColor: colors.border }} />

              <div className="relative flex items-start justify-between mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                  style={{ borderColor: colors.border, background: colors.glow }}
                >
                  <BookOpen className={`h-5 w-5 ${colors.text}`} />
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-mono"
                  style={{ color: colors.text, borderColor: colors.border, borderWidth: 1 }}
                >
                  {m.category}
                </span>
              </div>

              <h3 className="relative text-base font-semibold text-slate-100 mb-2">{m.title}</h3>
              <p className="relative text-sm text-slate-500 leading-relaxed line-clamp-2">
                {m.content.replace(/[#*`>\-]/g, "").substring(0, 140)}
              </p>

              <Link
                to={`/manuals/${m.slug}`}
                className="relative mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-accent transition-colors"
              >
                Read Manual
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No manuals found in this category.</p>
        </div>
      )}
    </section>
  );
}
