import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Send, FolderGit2, ArrowRight } from "lucide-react";
import type { Profile } from "../../lib/types";

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden pt-16"
    >
      {/* scanline */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-accent/5 to-transparent animate-scan" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-mono text-accent mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {profile.status}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-100 leading-tight"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-lg sm:text-xl text-accent font-mono"
        >
          {profile.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-2xl mx-auto text-slate-400 leading-relaxed"
        >
          {profile.bio}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500 flex-wrap"
        >
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-accent" />
            {profile.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-accent" />
            {profile.email}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-accent" />
            {profile.phone}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-4 flex-wrap"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/25 hover:shadow-accent transition-all"
          >
            <FolderGit2 className="h-4 w-4" />
            View Projects
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-md border border-base-600 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-accent/50 hover:text-accent transition-all"
          >
            <Send className="h-4 w-4" />
            Contact Me
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-4 text-sm"
        >
          <a
            href={`https://t.me/${profile.telegram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-accent transition-colors font-mono"
          >
            {profile.telegram}
          </a>
          <span className="text-base-600">|</span>
          <a
            href={`mailto:${profile.email}`}
            className="text-slate-500 hover:text-accent transition-colors font-mono"
          >
            Email
          </a>
          <span className="text-base-600">|</span>
          <a
            href={`tel:${profile.phone.replace(/\s|\(|\)/g, "")}`}
            className="text-slate-500 hover:text-accent transition-colors font-mono"
          >
            {profile.phone}
          </a>
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 hover:text-accent transition-colors"
      >
        <ArrowRight className="h-5 w-5 rotate-90 animate-bounce" />
      </a>
    </section>
  );
}
