type Article = {
  id: string;
  date: string;
  title: string;
  category: string;
  status: "Solved" | "In Progress" | "Archived";
  securityLevel: "Low" | "Medium" | "High" | "Critical";
};

const ARTICLES: Article[] = [
  {
    id: "0x01",
    date: "2026-07-18",
    title: "Buffer Overflow Exploitation in Legacy FTP Server",
    category: "Pwn",
    status: "Solved",
    securityLevel: "High",
  },
  {
    id: "0x02",
    date: "2026-07-10",
    title: "SQL Injection via Header Manipulation — OWASP Top 10",
    category: "Web",
    status: "Solved",
    securityLevel: "Medium",
  },
  {
    id: "0x03",
    date: "2026-06-28",
    title: "Active Directory Kerberoasting Attack Chain",
    category: "AD",
    status: "In Progress",
    securityLevel: "Critical",
  },
  {
    id: "0x04",
    date: "2026-06-15",
    title: "Reverse Engineering a Packed Binary with Ghidra",
    category: "RE",
    status: "Solved",
    securityLevel: "Medium",
  },
  {
    id: "0x05",
    date: "2026-05-30",
    title: "Network Traffic Analysis — Detecting C2 Beaconing",
    category: "Forensics",
    status: "Solved",
    securityLevel: "High",
  },
  {
    id: "0x06",
    date: "2026-05-12",
    title: "Privilege Escalation via SUID Binary Misconfiguration",
    category: "Linux",
    status: "Archived",
    securityLevel: "Low",
  },
];

const STATUS_STYLES: Record<Article["status"], string> = {
  Solved: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  "In Progress": "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  Archived: "text-slate-500 border-slate-600/40 bg-slate-700/20",
};

const LEVEL_STYLES: Record<Article["securityLevel"], string> = {
  Low: "text-slate-400",
  Medium: "text-blue-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};

export function CTFArticlesList() {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">
          CTF Write-ups <span className="text-emerald-400">&amp;</span> Security Articles
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-mono">
          $ cat /var/log/ctf_writeups.log
        </p>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-black/50 backdrop-blur-md overflow-hidden">
        {/* Log header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50 bg-black/40">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 font-mono text-xs text-slate-500">/var/log/ctf_writeups.log</span>
        </div>

        {/* Entries */}
        <div className="divide-y divide-slate-800/60">
          {ARTICLES.map((a) => (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3.5 font-mono text-sm hover:bg-emerald-500/5 transition-colors cursor-pointer group"
            >
              {/* Date */}
              <span className="text-slate-500 shrink-0">{a.date}</span>

              {/* ID */}
              <span className="text-emerald-400/60 shrink-0 hidden sm:inline">[{a.id}]</span>

              {/* Title + category */}
              <div className="flex-1 min-w-0">
                <span className="text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {a.title}
                </span>
                <span className="ml-2 text-xs text-slate-500">({a.category})</span>
              </div>

              {/* Status badge */}
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs border ${STATUS_STYLES[a.status]}`}
              >
                Status: {a.status}
              </span>

              {/* Security level */}
              <span className={`shrink-0 text-xs ${LEVEL_STYLES[a.securityLevel]}`}>
                Security Level: {a.securityLevel}
              </span>
            </div>
          ))}
        </div>

        {/* Log footer */}
        <div className="px-4 py-2.5 border-t border-slate-700/50 bg-black/40 font-mono text-xs text-slate-600">
          — end of log — {ARTICLES.length} entries
        </div>
      </div>
    </section>
  );
}
