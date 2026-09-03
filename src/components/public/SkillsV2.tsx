import { motion } from "framer-motion";
import { Cpu, Shield, Server, Wrench } from "lucide-react";
import type { Skill } from "../../lib/types";

const categoryIcons: Record<string, React.ReactNode> = {
  "Routing & Switching": <Cpu className="h-5 w-5" />,
  "Network Security": <Shield className="h-5 w-5" />,
  "Server Administration": <Server className="h-5 w-5" />,
  Tools: <Wrench className="h-5 w-5" />,
};

export function SkillsV2({ skills }: { skills: Skill[] }) {
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-accent">
          <Cpu className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">Skills</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
      </div>

      {/* Bento-box grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
        {categories.map((cat, ci) => {
          const catSkills = skills.filter((s) => s.category === cat);
          const isWide = ci % 3 === 0;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: ci * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group relative rounded-2xl border border-accent/15 p-6 transition-all hover:border-accent/40 ${isWide ? "sm:col-span-2 lg:col-span-1" : ""}`}
              style={{ background: "rgba(var(--accent) / 0.02)", backdropFilter: "blur(16px)" }}
            >
              {/* Holographic corner accents */}
              <div className="absolute top-0 left-0 h-6 w-6 border-l border-t border-accent/30 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-r border-b border-accent/30 rounded-br-2xl" />

              <div className="mb-4 flex items-center gap-2 text-accent">
                {categoryIcons[cat] ?? <Cpu className="h-5 w-5" />}
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">{cat}</h3>
              </div>

              {/* Skill chips */}
              <div className="flex flex-wrap gap-2">
                {catSkills.map((s, i) => (
                  <motion.span
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="group/chip relative rounded-lg border border-accent/20 px-3 py-1.5 text-xs font-mono text-slate-300 transition-all hover:border-accent/60 hover:text-accent cursor-default"
                    style={{ background: "rgba(var(--accent) / 0.04)" }}
                  >
                    {s.name}
                    <span className="absolute -bottom-px left-0 right-0 h-px bg-accent/50 rounded-full origin-left scale-x-0 group-hover/chip:scale-x-100 transition-transform" />
                  </motion.span>
                ))}
              </div>

              {/* Proficiency bars */}
              {catSkills.length > 0 && (
                <div className="mt-5 space-y-2.5">
                  {catSkills.slice(0, 4).map((s) => (
                    <div key={s.id}>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>{s.name}</span>
                        <span className="font-mono text-accent/70">{s.proficiency}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-base-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.proficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: "rgba(var(--accent) / 0.5)", boxShadow: "0 0 8px rgba(var(--accent) / 0.3)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
