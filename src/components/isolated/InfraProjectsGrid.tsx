import { useState } from "react";

type InfraProject = {
  title: string;
  description: string;
  tags: string[];
  icon: string;
};

const PROJECTS: InfraProject[] = [
  {
    title: "Telegram Bot Architecture",
    description:
      "Python-based bot with webhook delivery behind an Nginx reverse proxy, systemd service isolation, and rate limiting.",
    tags: ["Python", "Nginx", "Systemd", "Let's Encrypt"],
    icon: "bot",
  },
  {
    title: "iRedMail Server",
    description:
      "Full mail server on Ubuntu 22.04 with Postfix, Dovecot, SPF, DKIM, and DMARC configured for secure email delivery.",
    tags: ["Ubuntu", "Postfix", "Dovecot", "OpenSSL"],
    icon: "mail",
  },
  {
    title: "AWS EC2 Deployments",
    description:
      "Auto-scaling EC2 fleet inside a custom VPC with security groups, Application Load Balancer, and S3 backups.",
    tags: ["AWS", "EC2", "VPC", "IAM"],
    icon: "cloud",
  },
  {
    title: "WireGuard VPN Gateway",
    description:
      "Site-to-site WireGuard tunnel with fail2ban, UFW rules, and DNS leak protection for remote office access.",
    tags: ["WireGuard", "UFW", "fail2ban", "DNS"],
    icon: "shield",
  },
  {
    title: "Dockerized Web Stack",
    description:
      "Multi-container stack with Nginx proxy, Certbot auto-renewal, and isolated networks per service.",
    tags: ["Docker", "Nginx", "Certbot", "Linux"],
    icon: "container",
  },
  {
    title: "Network Monitoring Stack",
    description:
      "Prometheus + Grafana + node_exporter for real-time metrics, alerting via Telegram webhook on threshold breach.",
    tags: ["Prometheus", "Grafana", "Bash", "Alerting"],
    icon: "chart",
  },
];

const ICONS: Record<string, string> = {
  bot: "🤖",
  mail: "📧",
  cloud: "☁️",
  shield: "🛡️",
  container: "📦",
  chart: "📊",
};

export function InfraProjectsGrid() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-100">
          Real-World <span className="text-emerald-400">Infrastructure</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Production systems I've designed, deployed, and maintained.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((p, i) => (
          <div
            key={p.title}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`group relative rounded-xl p-6 bg-gray-900/50 backdrop-blur-md border transition-all duration-300 ${
              hovered === i
                ? "border-emerald-400/60 shadow-[0_0_20px_rgba(0,255,100,0.15)] -translate-y-1"
                : "border-slate-700/50"
            }`}
          >
            {/* Glow accent */}
            <div
              className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
                hovered === i ? "opacity-100" : ""
              } bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none`}
            />

            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{ICONS[p.icon]}</span>
                <h3 className="text-lg font-semibold text-slate-100">{p.title}</h3>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-4">{p.description}</p>

              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
