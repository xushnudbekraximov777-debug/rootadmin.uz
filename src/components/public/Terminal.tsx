import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TerminalSquare, Cpu, HardDrive, Wifi, Activity, Server } from "lucide-react";
import { useTranslation } from "react-i18next";

type Line = { text: string; type: "cmd" | "out" | "err" };

const bootSequence: Line[] = [
  { text: "whoami", type: "cmd" },
  { text: "raximov@netops:~$ administrator", type: "out" },
  { text: "systemctl status nginx", type: "cmd" },
  { text: "● nginx.service - active (running) since 2026-02-01", type: "out" },
  { text: "ping -c 3 8.8.8.8", type: "cmd" },
  { text: "64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=18.2 ms", type: "out" },
  { text: "64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=17.9 ms", type: "out" },
  { text: "64 bytes from 8.8.8.8: icmp_seq=3 ttl=117 time=18.1 ms", type: "out" },
  { text: "3 packets transmitted, 3 received, 0% packet loss", type: "out" },
  { text: "show interfaces status", type: "cmd" },
  { text: "Gi0/1   connected   full  1000  trunk", type: "out" },
  { text: "Gi0/2   connected   full  1000  access", type: "out" },
  { text: "uptime", type: "cmd" },
  { text: " 11:42:31 up 42 days,  3:18, load: 0.12, 0.08, 0.05", type: "out" },
];

export function TerminalWidget() {
  const { t } = useTranslation();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;
    let charIdx = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (idx >= bootSequence.length) return;
      const line = bootSequence[idx];
      if (charIdx <= line.text.length) {
        setTyping(line.text.slice(0, charIdx));
        charIdx++;
        setTimeout(tick, line.type === "cmd" ? 60 : 20);
      } else {
        setLines((prev) => [...prev, line]);
        setTyping("");
        idx++;
        charIdx = 0;
        setTimeout(tick, line.type === "cmd" ? 400 : 80);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, typing]);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
      <div className="mb-10 flex items-center gap-2">
        <span className="text-accent">
          <TerminalSquare className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">{t("terminal.title")}</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-600 to-transparent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 glass rounded-xl overflow-hidden border border-base-700"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-base-700 bg-base-900">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            <span className="ml-2 font-mono text-xs text-slate-500">raximov@netops: ~</span>
          </div>
          <div
            ref={bodyRef}
            className="p-4 h-72 overflow-y-auto font-mono text-xs leading-relaxed"
          >
            {lines.map((l, i) => (
              <div key={i} className={l.type === "cmd" ? "text-accent" : "text-slate-400"}>
                {l.type === "cmd" ? `$ ${l.text}` : l.text}
              </div>
            ))}
            {typing && (
              <div className="text-accent">
                $ {typing}
                <span className="animate-blink">▊</span>
              </div>
            )}
            {lines.length >= bootSequence.length && (
              <div className="text-accent">
                $ <span className="animate-blink">▊</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Status cards */}
        <div className="space-y-4">
          <StatusCard icon={<Cpu className="h-4 w-4" />} label={t("terminal.cpuLoad")} value="12%" bar={12} />
          <StatusCard icon={<HardDrive className="h-4 w-4" />} label={t("terminal.disk")} value="47%" bar={47} />
          <StatusCard icon={<Wifi className="h-4 w-4" />} label={t("terminal.network")} value={t("terminal.online")} bar={100} />
          <StatusCard icon={<Activity className="h-4 w-4" />} label={t("terminal.uptime")} value="42d 3h" bar={88} />
        </div>
      </div>
    </section>
  );
}

function StatusCard({
  icon,
  label,
  value,
  bar,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bar: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-accent">{icon}</span>
          {label}
        </span>
        <span className="font-mono text-sm text-accent">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-base-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${bar}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-accent/60 rounded-full"
        />
      </div>
    </motion.div>
  );
}
