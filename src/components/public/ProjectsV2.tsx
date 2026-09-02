import { motion } from "framer-motion";
import { Github, ExternalLink, FolderGit2, ArrowUpRight } from "lucide-react";
import type { Project } from "../../lib/types";

export function ProjectsV2({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-accent">
          <FolderGit2 className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-700 to-transparent" />
      </div>

      {/* Bento-box grid: first project spans 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => {
          const isFeatured = i === 0;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group relative rounded-2xl border border-base-800 p-6 transition-all hover:border-accent/30 overflow-hidden ${isFeatured ? "sm:col-span-2 lg:col-span-2" : ""}`}
              style={{ background: "rgba(255 255 255 / 0.02)", backdropFilter: "blur(16px)" }}
            >
              {/* Glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(var(--accent) / 0.06), transparent 70%)" }}
              />

              <div className="relative flex items-start justify-between mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-base-700 transition-colors group-hover:border-accent/40"
                  style={{ background: "rgba(var(--accent) / 0.05)" }}
                >
                  <FolderGit2 className="h-6 w-6 text-accent/60 group-hover:text-accent transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono ${p.status === "active" ? "text-accent border border-accent/30" : "text-slate-500 border border-base-700"}`}
                    style={p.status === "active" ? { background: "rgba(var(--accent) / 0.08)" } : {}}
                  >
                    {p.status}
                  </span>
                </div>
              </div>

              <h3 className={`relative text-lg font-semibold text-slate-100 mb-2 ${isFeatured ? "sm:text-xl" : ""}`}>
                {p.title}
              </h3>
              <p className="relative text-sm text-slate-500 leading-relaxed mb-4">{p.description}</p>

              {p.tags.length > 0 && (
                <div className="relative flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-base-700 px-2 py-0.5 text-[10px] font-mono text-slate-400"
                      style={{ background: "rgba(255 255 255 / 0.03)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="relative flex items-center gap-4 pt-4 border-t border-base-800">
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
                {(p.github_url || p.live_url) && (
                  <a
                    href={p.live_url || p.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-xs text-slate-600 group-hover:text-accent transition-colors"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
