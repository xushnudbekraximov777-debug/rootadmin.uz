import { useEffect, useRef, useState } from "react";

type Line = { text: string; type: "cmd" | "out" | "err" };

const HELP_TEXT = `Available commands:
  whoami   - short bio
  skills   - sysadmin & security skills
  projects - recent infrastructure setups
  clear    - clear terminal
  help     - show this message`;

const RESPONSES: Record<string, Line[]> = {
  whoami: [
    { text: "Raximov Xushnudbek", type: "out" },
    { text: "Role: Network Administrator & Cybersecurity Engineering Student", type: "out" },
    { text: "Location: Tashkent, Uzbekistan", type: "out" },
    { text: "Focus: routing, switching, server administration, secure infrastructure", type: "out" },
  ],
  skills: [
    { text: "Networking: VLANs, OSPF, BGP, VPN, firewall config", type: "out" },
    { text: "Systems: Ubuntu/Debian, CentOS, Nginx, Docker, systemd", type: "out" },
    { text: "Security: OpenSSL, iRedMail, fail2ban, IDS/IPS, hardening", type: "out" },
    { text: "Cloud: AWS EC2, S3, IAM, VPC peering", type: "out" },
    { text: "Scripting: Bash, Python, PowerShell", type: "out" },
  ],
  projects: [
    { text: "[1] Telegram Bot Architecture  — Python + webhook + Nginx reverse proxy", type: "out" },
    { text: "[2] iRedMail Server             — Ubuntu 22.04, Postfix, Dovecot, SPF/DKIM/DMARC", type: "out" },
    { text: "[3] AWS EC2 Deployment           — VPC, security groups, Load Balancer, auto-scaling", type: "out" },
    { text: "[4] VPN Gateway                  — WireGuard site-to-site, fail2ban, UFW", type: "out" },
  ],
  help: HELP_TEXT.split("\n").map((t) => ({ text: t, type: "out" as const })),
};

export function InteractiveTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { text: "Interactive terminal — type 'help' for commands", type: "out" },
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const newLines: Line[] = [{ text: raw, type: "cmd" }];

    if (cmd === "clear") {
      setLines([]);
      return;
    }
    if (cmd === "") {
      // no-op
    } else if (RESPONSES[cmd]) {
      newLines.push(...RESPONSES[cmd]);
    } else {
      newLines.push({ text: `command not found: ${cmd} — type 'help'`, type: "err" });
    }
    setLines((prev) => [...prev, ...newLines]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-black/70 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,0,0.08)]">
        {/* Window controls */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-500/20 bg-black/40">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 font-mono text-xs text-emerald-400/70">guest@netops: ~</span>
        </div>

        {/* Terminal body */}
        <div
          ref={bodyRef}
          onClick={() => inputRef.current?.focus()}
          className="p-4 h-80 overflow-y-auto font-mono text-sm leading-relaxed cursor-text"
        >
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.type === "cmd"
                  ? "text-emerald-400"
                  : l.type === "err"
                    ? "text-red-400"
                    : "text-emerald-300/80"
              }
            >
              {l.type === "cmd" ? `$ ${l.text}` : l.text}
            </div>
          ))}

          {/* Active input line */}
          <div className="flex items-center text-emerald-400">
            <span className="mr-2 select-none">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  runCommand(input);
                  setInput("");
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="flex-1 bg-transparent outline-none text-emerald-300 caret-emerald-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
