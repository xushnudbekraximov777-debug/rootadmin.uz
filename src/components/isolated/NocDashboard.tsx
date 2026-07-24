import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Server, Wifi, Cpu, HardDrive, Lock } from "lucide-react";
import { supabase, SETTINGS_ID } from "../../lib/supabase";

type ToggleState = "loading" | "saving" | "idle";

type TrafficPoint = { time: string; value: number };

type AlertEntry = {
  id: string;
  level: "INFO" | "WARN" | "CRITICAL";
  source: string;
  message: string;
  time: string;
};

const MOCK_TRAFFIC: TrafficPoint[] = [
  { time: "00:00", value: 12 },
  { time: "02:00", value: 8 },
  { time: "04:00", value: 5 },
  { time: "06:00", value: 14 },
  { time: "08:00", value: 32 },
  { time: "10:00", value: 47 },
  { time: "12:00", value: 38 },
  { time: "14:00", value: 52 },
  { time: "16:00", value: 61 },
  { time: "18:00", value: 44 },
  { time: "20:00", value: 28 },
  { time: "22:00", value: 19 },
];

const MOCK_ALERTS: AlertEntry[] = [
  {
    id: "a1",
    level: "CRITICAL",
    source: "honeypot-01",
    message: "SSH brute-force detected from 185.220.101.42 — 47 attempts in 60s",
    time: "14:32:08",
  },
  {
    id: "a2",
    level: "WARN",
    source: "fail2ban",
    message: "Banned IP 45.155.205.233 after 5 failed auth on port 22",
    time: "14:28:51",
  },
  {
    id: "a3",
    level: "INFO",
    source: "nginx",
    message: "Let's Encrypt certificate renewed for rootadmin.uz",
    time: "14:15:00",
  },
  {
    id: "a4",
    level: "WARN",
    source: "honeypot-02",
    message: "Port scan detected from 193.32.162.14 — ports 21,22,80,443",
    time: "13:59:42",
  },
  {
    id: "a5",
    level: "CRITICAL",
    source: "wireguard",
    message: "Unauthorized peer handshake attempt rejected — 92.118.39.81",
    time: "13:41:17",
  },
  {
    id: "a6",
    level: "INFO",
    source: "systemd",
    message: "docker.service restarted after config reload",
    time: "13:22:03",
  },
];

const ALERT_STYLES: Record<AlertEntry["level"], string> = {
  INFO: "text-blue-400 border-blue-500/30 bg-blue-500/5",
  WARN: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
  CRITICAL: "text-red-400 border-red-500/30 bg-red-500/5",
};

export function NocDashboard() {
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [toggleState, setToggleState] = useState<ToggleState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from("settings")
        .select("matrix_enabled, maintenance_mode")
        .eq("id", SETTINGS_ID)
        .maybeSingle();

      if (err) {
        setError(err.message);
      } else if (data) {
        setMatrixEnabled(Boolean(data.matrix_enabled));
        setMaintenanceMode(Boolean(data.maintenance_mode));
      }
      setToggleState("idle");
    })();
  }, []);

  const updateSetting = async (field: "matrix_enabled" | "maintenance_mode", value: boolean) => {
    setToggleState("saving");
    setError(null);
    const { error: err } = await supabase
      .from("settings")
      .update({ [field]: value })
      .eq("id", SETTINGS_ID);

    if (err) {
      setError(err.message);
    } else {
      if (field === "matrix_enabled") setMatrixEnabled(value);
      if (field === "maintenance_mode") setMaintenanceMode(value);
    }
    setToggleState("idle");
  };

  const maxTraffic = Math.max(...MOCK_TRAFFIC.map((p) => p.value));

  return (
    <div className="min-h-screen bg-black text-emerald-400 font-mono p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 border-b border-emerald-500/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-emerald-400" />
            <div>
              <h1 className="text-lg font-bold text-emerald-300 tracking-wide">
                NOC / SOC CYBER COMMAND CENTER
              </h1>
              <p className="text-xs text-emerald-600">rootadmin.uz — security operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400">SYSTEM ONLINE</span>
            <span className="text-emerald-600">|</span>
            <span className="text-emerald-500">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ERROR: {error}
        </div>
      )}

      {/* System metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={<Cpu className="h-4 w-4" />} label="CPU LOAD" value="12%" bar={12} />
        <MetricCard icon={<HardDrive className="h-4 w-4" />} label="DISK" value="47%" bar={47} />
        <MetricCard icon={<Wifi className="h-4 w-4" />} label="NETWORK" value="ONLINE" bar={100} />
        <MetricCard icon={<Server className="h-4 w-4" />} label="UPTIME" value="42d 3h" bar={88} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Traffic chart */}
        <div className="lg:col-span-2 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-300">REAL-TIME TRAFFIC</h2>
            <span className="ml-auto text-xs text-emerald-600">req/min</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-40">
            {MOCK_TRAFFIC.map((p) => (
              <div key={p.time} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/30 to-emerald-400/80 transition-all hover:from-emerald-500/50 hover:to-emerald-300"
                  style={{ height: `${(p.value / maxTraffic) * 100}%` }}
                  title={`${p.value} req/min`}
                />
                <span className="text-[10px] text-emerald-600 hidden sm:inline">{p.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings toggles */}
        <div className="rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-300">SITE CONTROLS</h2>
          </div>

          <ToggleRow
            label="Matrix Background"
            description="Animated digital rain on public site"
            enabled={matrixEnabled}
            disabled={toggleState !== "idle"}
            onToggle={() => updateSetting("matrix_enabled", !matrixEnabled)}
          />

          <div className="my-4 h-px bg-emerald-500/10" />

          <ToggleRow
            label="Maintenance Mode"
            description="Take public site offline"
            enabled={maintenanceMode}
            disabled={toggleState !== "idle"}
            onToggle={() => updateSetting("maintenance_mode", !maintenanceMode)}
          />
        </div>
      </div>

      {/* Security alerts */}
      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-emerald-500/20">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <h2 className="text-sm font-semibold text-emerald-300">HONEYPOT SECURITY ALERTS</h2>
          <span className="ml-auto text-xs text-emerald-600">
            {MOCK_ALERTS.filter((a) => a.level === "CRITICAL").length} critical /{" "}
            {MOCK_ALERTS.filter((a) => a.level === "WARN").length} warnings
          </span>
        </div>

        <div className="divide-y divide-emerald-500/10">
          {MOCK_ALERTS.map((a) => (
            <div
              key={a.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-5 py-3 text-xs ${ALERT_STYLES[a.level]}`}
            >
              <span className="shrink-0 font-bold w-20">{a.level}</span>
              <span className="shrink-0 text-emerald-600 hidden sm:inline">{a.time}</span>
              <span className="shrink-0 text-emerald-500">{a.source}</span>
              <span className="flex-1 text-emerald-300/80">{a.message}</span>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 border-t border-emerald-500/20 text-xs text-emerald-600">
          — end of log — {MOCK_ALERTS.length} entries
        </div>
      </div>
    </div>
  );
}

function MetricCard({
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
    <div className="rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="text-emerald-400">{icon}</span>
          {label}
        </span>
        <span className="text-sm text-emerald-300">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-emerald-900/40 overflow-hidden">
        <div
          className="h-full bg-emerald-500/60 rounded-full transition-all duration-700"
          style={{ width: `${bar}%` }}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  disabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-emerald-300">{label}</p>
        <p className="text-xs text-emerald-600">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-12 items-center rounded-full border transition-colors duration-300 disabled:opacity-50 ${
          enabled
            ? "border-emerald-500/60 bg-emerald-500/20"
            : "border-red-500/60 bg-red-500/20"
        }`}
      >
        <span
          className={`inline-flex h-4 w-4 transform rounded-full transition-transform duration-300 ${
            enabled ? "translate-x-6 bg-emerald-500" : "translate-x-1 bg-red-500"
          }`}
        />
      </button>
    </div>
  );
}
