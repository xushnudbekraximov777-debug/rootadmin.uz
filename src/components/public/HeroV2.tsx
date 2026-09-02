import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Send, FolderGit2, ArrowRight, Github, Linkedin, Terminal } from "lucide-react";
import type { Profile, Settings } from "../../lib/types";

export function HeroV2({ profile, settings }: { profile: Profile; settings: Settings | null }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(var(--accent) / 0.08), transparent 60%), #070707" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(var(--accent) / 1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent) / 1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Scanline */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ y: "-20%" }}
          animate={{ y: "120%" }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-40"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(var(--accent) / 0.04), transparent)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 px-4 py-1.5 text-xs font-mono text-accent mb-8"
          style={{ background: "rgba(var(--accent) / 0.08)", backdropFilter: "blur(12px)" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {profile.status}
        </motion.div>

        {/* Name with glitch effect */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-50 leading-tight"
          style={{ textShadow: "0 0 40px rgba(var(--accent) / 0.15)" }}
        >
          {profile.name}
        </motion.h1>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-xl sm:text-2xl text-accent font-mono"
        >
          {profile.title}
        </motion.p>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-2xl mx-auto text-slate-400 leading-relaxed text-base"
        >
          {profile.bio}
        </motion.p>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap"
        >
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            {profile.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent" />
            {profile.email}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-accent" />
            {profile.phone}
          </span>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-4 flex-wrap"
        >
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-lg border border-accent/40 px-6 py-3 text-sm font-medium text-accent transition-all hover:scale-105"
            style={{ background: "rgba(var(--accent) / 0.1)", backdropFilter: "blur(12px)", boxShadow: "0 0 20px rgba(var(--accent) / 0.1)" }}
          >
            <FolderGit2 className="h-4 w-4" />
            View Projects
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-base-700 px-6 py-3 text-sm font-medium text-slate-200 transition-all hover:border-accent/50 hover:text-accent"
            style={{ background: "rgba(255 255 255 / 0.03)", backdropFilter: "blur(12px)" }}
          >
            <Send className="h-4 w-4" />
            Contact Me
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-6"
        >
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-accent transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-accent transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          <a
            href={`https://t.me/${profile.telegram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 hover:text-accent transition-colors"
          >
            <Send className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="text-slate-600 hover:text-accent transition-colors"
          >
            <Mail className="h-5 w-5" />
          </a>
        </motion.div>

        {/* Terminal hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 inline-flex items-center gap-2 text-xs font-mono text-slate-700"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>scroll down to explore</span>
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-700 hover:text-accent transition-colors"
      >
        <ArrowRight className="h-5 w-5 rotate-90 animate-bounce" />
      </a>
    </section>
  );
}
