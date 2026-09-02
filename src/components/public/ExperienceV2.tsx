import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Award, Calendar } from "lucide-react";
import type { Experience, Education, Certification } from "../../lib/types";
import { formatDateRange } from "../../lib/utils";

export function ExperienceV2({
  experiences,
  education,
  certifications,
}: {
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
}) {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Experience */}
        <div id="about">
          <SectionHeaderV2 icon={<Briefcase className="h-5 w-5" />} title="Experience" />
          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-xl border border-base-800 p-5 transition-all hover:border-accent/30"
                style={{ background: "rgba(255 255 255 / 0.02)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-slate-100">{exp.role}</h3>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-accent">
                    <Calendar className="h-3 w-3" />
                    {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                  </span>
                </div>
                <p className="text-sm text-accent/80 font-mono mb-2">{exp.company}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{exp.description}</p>
              </motion.div>
            ))}
            {experiences.length === 0 && <EmptyV2 text="No experience entries yet." />}
          </div>
        </div>

        {/* Education + Certs */}
        <div id="education">
          <SectionHeaderV2 icon={<GraduationCap className="h-5 w-5" />} title="Education" />
          <div className="space-y-4">
            {education.map((ed, i) => (
              <motion.div
                key={ed.id}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-base-800 p-5 transition-all hover:border-accent/30"
                style={{ background: "rgba(255 255 255 / 0.02)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-slate-100">{ed.degree}</h3>
                  <span className="font-mono text-xs text-accent">
                    {ed.start_year} — {ed.end_year || "Present"}
                  </span>
                </div>
                <p className="text-sm text-accent/80 font-mono">{ed.institution}</p>
                {ed.field && <p className="text-sm text-slate-500 mt-1 font-mono">{ed.field}</p>}
                {ed.description && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{ed.description}</p>
                )}
              </motion.div>
            ))}
            {education.length === 0 && <EmptyV2 text="No education entries yet." />}
          </div>

          <div className="mt-10">
            <SectionHeaderV2 icon={<Award className="h-5 w-5" />} title="Certifications" />
            <div className="grid sm:grid-cols-2 gap-3">
              {certifications.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  whileHover={{ y: -3 }}
                  className="rounded-lg border border-base-800 p-4 transition-all hover:border-accent/30"
                  style={{ background: "rgba(255 255 255 / 0.02)", backdropFilter: "blur(12px)" }}
                >
                  <h3 className="text-sm font-semibold text-slate-100">
                    {c.name}
                    {c.credential_url && (
                      <a
                        href={c.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs text-accent hover:underline"
                      >
                        verify
                      </a>
                    )}
                  </h3>
                  {c.issuer && <p className="text-xs text-slate-500 mt-1">{c.issuer}</p>}
                  <span className="mt-1 inline-block font-mono text-xs text-accent">{c.year}</span>
                </motion.div>
              ))}
            </div>
            {certifications.length === 0 && <EmptyV2 text="No certifications yet." />}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeaderV2({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="text-accent">{icon}</span>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-700 to-transparent" />
    </div>
  );
}

function EmptyV2({ text }: { text: string }) {
  return <p className="text-sm text-slate-600 font-mono">// {text}</p>;
}
