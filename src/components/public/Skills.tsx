import { motion } from "framer-motion";
import { Cpu, Shield, Server, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Skill } from "../../lib/types";

const categoryIcons: Record<string, React.ReactNode> = {
  "Routing & Switching": <Cpu className="h-5 w-5" />,
  "Network Security": <Shield className="h-5 w-5" />,
  "Server Administration": <Server className="h-5 w-5" />,
  Tools: <Wrench className="h-5 w-5" />,
};

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const { t } = useTranslation();
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
      <div className="mb-10 flex items-center gap-2">
        <span className="text-accent">
          <Cpu className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">{t("skills.title")}</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-600 to-transparent" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {categories.map((cat, ci) => {
          const catSkills = skills.filter((s) => s.category === cat);
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: ci * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-accent">
                {categoryIcons[cat] ?? <Cpu className="h-5 w-5" />}
                <h3 className="text-base font-semibold text-slate-100">{cat}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {catSkills.map((s, i) => (
                  <motion.span
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="group relative rounded-md border border-base-600 bg-base-850 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-accent/50 hover:text-accent transition-all cursor-default"
                  >
                    {s.name}
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent/40 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
                  </motion.span>
                ))}
              </div>
              {catSkills.length > 0 && (
                <div className="mt-4 space-y-2">
                  {catSkills.slice(0, 3).map((s) => (
                    <div key={s.id}>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{s.name}</span>
                        <span className="font-mono">{s.proficiency}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-base-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.proficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-accent/60 rounded-full"
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
