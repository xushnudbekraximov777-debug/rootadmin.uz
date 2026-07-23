import { motion } from "framer-motion";
import { Github, ExternalLink, FolderGit2 } from "lucide-react";
import type { Project } from "../../lib/types";
import { Badge } from "../ui/badge";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
      <div className="mb-10 flex items-center gap-2">
        <span className="text-accent">
          <FolderGit2 className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-600 to-transparent" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass rounded-xl p-5 flex flex-col group"
          >
            <div className="flex items-start justify-between mb-3">
              <FolderGit2 className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors" />
              <Badge variant={p.status === "active" ? "default" : "outline"}>{p.status}</Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">{p.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed flex-1">{p.description}</p>

            {p.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-base-600 bg-base-850 px-2 py-0.5 text-[10px] font-mono text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-base-700">
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  Code
                </a>
              )}
              {p.live_url && (
                <a
                  href={p.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Demo
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {projects.length === 0 && (
        <p className="text-sm text-slate-600 font-mono">// No projects added yet.</p>
      )}
    </section>
  );
}
