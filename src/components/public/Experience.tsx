import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Award } from "lucide-react";
import type { Experience, Education, Certification } from "../../lib/types";
import { formatDateRange } from "../../lib/utils";

export function ExperienceSection({
  experiences,
  education,
  certifications,
}: {
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
}) {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Experience */}
        <div id="about">
          <SectionHeader icon={<Briefcase className="h-5 w-5" />} title="Experience" />
          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <TimelineItem key={exp.id} index={i}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base font-semibold text-slate-100">{exp.role}</h3>
                  <span className="font-mono text-xs text-accent">
                    {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{exp.company}</p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
              </TimelineItem>
            ))}
            {experiences.length === 0 && <Empty text="No experience added yet." />}
          </div>
        </div>

        {/* Education + Certs */}
        <div id="education">
          <SectionHeader icon={<GraduationCap className="h-5 w-5" />} title="Education" />
          <div className="space-y-6">
            {education.map((ed, i) => (
              <TimelineItem key={ed.id} index={i}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base font-semibold text-slate-100">{ed.degree}</h3>
                  <span className="font-mono text-xs text-accent">
                    {ed.start_year} — {ed.end_year || "Present"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{ed.institution}</p>
                {ed.field && <p className="text-sm text-accent/80 mt-0.5 font-mono">{ed.field}</p>}
                {ed.description && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{ed.description}</p>
                )}
              </TimelineItem>
            ))}
            {education.length === 0 && <Empty text="No education added yet." />}
          </div>

          <div className="mt-12">
            <SectionHeader icon={<Award className="h-5 w-5" />} title="Certifications" />
            <div className="space-y-4">
              {certifications.map((c, i) => (
                <TimelineItem key={c.id} index={i} compact>
                  <div className="flex items-center justify-between flex-wrap gap-2">
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
                    <span className="font-mono text-xs text-accent">{c.year}</span>
                  </div>
                  {c.issuer && <p className="text-xs text-slate-500 mt-0.5">{c.issuer}</p>}
                </TimelineItem>
              ))}
              {certifications.length === 0 && <Empty text="No certifications added yet." />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-600 to-transparent" />
    </div>
  );
}

function TimelineItem({
  children,
  index,
  compact,
}: {
  children: React.ReactNode;
  index: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative pl-6 border-l border-base-700"
    >
      <span
        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent shadow-accent ${
compact ? "" : "animate-pulse-slow"}`}
      />
      <div className={compact ? "" : "glass rounded-lg p-4"}>{children}</div>
    </motion.div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-600 font-mono">// {text}</p>;
}
