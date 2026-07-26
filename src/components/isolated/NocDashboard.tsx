import { useEffect, useRef, useState } from "react";
import { Activity, ShieldAlert, Server, Wifi, Cpu, HardDrive, Lock, Eye, Shield, Globe, Terminal, MapPin, Play, ShieldOff } from "lucide-react";
import { supabase, SETTINGS_ID } from "../../lib/supabase";

type ToggleState = "loading" | "saving" | "idle";
type TrafficPoint = { hour: string; count: number };
type GeoItem = { ip: string; country: string; code: string };
type SystemMetrics = {
  cpu_usage: number;
  disk_usage: number;
  ram_usage: number;
  uptime_str: string;
  banned_ips: string;
  ssl_days: string;
  nginx_up: boolean;
  ssh_up: boolean;
  geo_traffic: GeoItem[];
};

function buildTrafficPoints(rows: { created_at: string }[]): TrafficPoint[] {
  const buckets: { timeKey: string; hourLabel: string; count: number }[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setHours(d.getHours() - i, 0, 0, 0);
    const timeKey = d.toISOString().slice(0, 13);
    const hourLabel = `${String(d.getHours()).padStart(2, "0")}:00`;
    buckets.push({ timeKey, hourLabel, count: 0 });
  }

  for (const row of rows) {
    if (!row.created_at) continue;
    const rowDate = new Date(row.created_at);
    const rowKey = rowDate.toISOString().slice(0, 13);
    const bucket = buckets.find(b => b.timeKey === rowKey);
    if (bucket) {
      bucket.count++;
    }
  }

  return buckets.map(b => ({ hour: b.hourLabel, count: b.count }));
}

export function NocDashboard() {
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [toggleState, setToggleState] = useState<ToggleState>("loading");
  const [isExecuting, setIsExecuting] = useState(false);
  const [execMessage, setExecMessage] = useState<string | null>(null);
  const [actionIpMsg, setActionIpMsg] = useState<string | null>(null);

  const [traffic, setTraffic] = useState<TrafficPoint[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [auditLog, setAuditLog] = useState<string>("Loglar serverdan olinmoqda...");

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0, disk_usage: 0, ram_usage: 0, uptime_str: "—",
    banned_ips: "0", ssl_days: "0", nginx_up: true, ssh_up: true, geo_traffic: []
  });

  const rawViewsRef = useRef<{ created_at: string }[]>([]);

  const fetchMetricsAndLogs = async () => {
    try {
      const response = await fetch(`/metrics.json?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics({
          cpu_usage: data.cpu_usage || 0,
          disk_usage: data.disk_usage || 0,
          ram_usage: data.ram_usage || 0,
          uptime_str: data.uptime_str || "—",
          banned_ips: data.banned_ips || "0",
          ssl_days: data.ssl_days || "0",
          nginx_up: data.nginx_up !== undefined ? data.nginx_up : true,
          ssh_up: data.ssh_up !== undefined ? data.ssh_up : true,
          geo_traffic: data.geo_traffic || [],
        });
      }
    } catch (err) {
      console.error("metrics.json xatosi:", err);
    }

    try {
      const logResponse = await fetch(`/audit_log.txt?t=${Date.now()}`);
      if (logResponse.ok) {
        const logText = await logResponse.text();
        setAuditLog(logText);
      }
    } catch (err) {
      console.error("audit_log.txt xatosi:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: settingsData } = await supabase.from("settings").select("matrix_enabled, maintenance_mode").eq("id", SETTINGS_ID).maybeSingle();
      if (!cancelled) {
        if (settingsData) {
          setMatrixEnabled(Boolean(settingsData.matrix_enabled));
          setMaintenanceMode(Boolean(settingsData.maintenance_mode));
        }
        setToggleState("idle");
      }

      const since = new Date();
      since.setHours(since.getHours() - 12);
      const { data: viewsData } = await supabase.from("page_views").select("created_at").gte("created_at", since.toISOString()).order("created_at", { ascending: true });
      if (!cancelled && viewsData) {
        rawViewsRef.current = viewsData as { created_at: string }[];
        setTraffic(buildTrafficPoints(rawViewsRef.current));
      }

      const { count } = await supabase.from("page_views").select("id", { count: "exact", head: true });
      if (!cancelled && count !== null) setTotalViews(count);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const channel = supabase.channel("noc_page_views").on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, (payload) => {
          const newRow = payload.new as { created_at: string };
          rawViewsRef.current = [...rawViewsRef.current, newRow];
          setTraffic(buildTrafficPoints(rawViewsRef.current));
          setTotalViews((prev) => prev + 1);
        }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    fetchMetricsAndLogs();
    const interval = setInterval(fetchMetricsAndLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateSetting = async (field: "matrix_enabled" | "maintenance_mode", value: boolean) => {
    setToggleState("saving");
    const { error: err } = await supabase.from("settings").update({ [field]: value }).eq("id", SETTINGS_ID);
    if (!err) {
      if (field === "matrix_enabled") setMatrixEnabled(value);
      if (field === "maintenance_mode") setMaintenanceMode(value);
    }
    setToggleState("idle");
  };

  const handleRunMonitorNow = async () => {
    setIsExecuting(true);
    setExecMessage(null);
    try {
      const res = await fetch("/api/run-monitor", { method: "POST" });
      if (res.ok) {
        setExecMessage("Skript muvaffaqiyatli bajarildi!");
        await fetchMetricsAndLogs();
      } else {
        setExecMessage("Xatolik yuz berdi!");
      }
    } catch {
      setExecMessage("Server bilan aloqa yo'q!");
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecMessage(null), 3000);
    }
  };

  const handleIpAction = async (ip: string, action: "ban" | "unban") => {
    setActionIpMsg(`${action === "ban" ? "Bloklanmoqda" : "Bandan chiqarilmoqda"}: ${ip}...`);
    try {
      const res = await fetch(`/api/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      if (res.ok) {
        setActionIpMsg(`Muvaffaqiyatli bajarildi: ${ip}`);
        await fetchMetricsAndLogs();
      } else {
        setActionIpMsg(`Xatolik yuz berdi (${ip})`);
      }
    } catch {
      setActionIpMsg(`Server bilan aloqa yo'q!`);
    } finally {
      setTimeout(() => setActionIpMsg(null), 3500);
    }
  };

  const maxTraffic = Math.max(1, ...traffic.map((p) => p.count));

  return (
    <div className="min-h-screen bg-black text-emerald-400 font-mono p-4 sm:p-6 lg:p-8">
      <header className="mb-8 border-b border-emerald-500/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-emerald-400" />
            <div>
              <h1 className="text-lg font-bold text-emerald-300 tracking-wide">
                NOC / SOC CYBER COMMAND CENTER
              </h1>
              <p className="text-xs text-emerald-600">rootadmin.uz — live security operations</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard icon={<Cpu className="h-4 w-4" />} label="CPU LOAD" value={`${metrics.cpu_usage}%`} bar={metrics.cpu_usage} />
        <MetricCard icon={<HardDrive className="h-4 w-4" />} label="DISK" value={`${metrics.disk_usage}%`} bar={metrics.disk_usage} />
        <MetricCard icon={<Wifi className="h-4 w-4" />} label="RAM" value={`${metrics.ram_usage}%`} bar={metrics.ram_usage} />
        <MetricCard icon={<Server className="h-4 w-4" />} label="UPTIME" value={metrics.uptime_str} bar={100} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard icon={<Shield className="h-4 w-4" />} label="BANNED IPS" value={metrics.banned_ips} />
        <StatusCard icon={<Lock className="h-4 w-4" />} label="SSL EXPIRY" value={`${metrics.ssl_days} days`} />
        <ServiceCard icon={<Globe className="h-4 w-4" />} label="NGINX" isUp={metrics.nginx_up} />
        <ServiceCard icon={<Terminal className="h-4 w-4" />} label="SSH" isUp={metrics.ssh_up} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-emerald-300">REAL-TIME VISITOR TRAFFIC</h2>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-md">
              <Eye className="h-3.5 w-3.5" />
              {totalViews.toLocaleString()} total views
            </span>
          </div>
          
          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-1 border border-emerald-500/10 bg-black/40 rounded-lg">
            {traffic.map((p, idx) => {
              const heightPercent = Math.max(8, (p.count / maxTraffic) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div className="absolute -top-8 bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    {p.hour}: {p.count} visits
                  </div>
                  <span className="text-[9px] text-emerald-500 font-bold">{p.count > 0 ? p.count : ""}</span>
                  <div 
                    className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600/50 via-emerald-500/80 to-emerald-400 group-hover:to-emerald-300 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                    style={{ height: `${p.count === 0 ? 4 : heightPercent}%` }} 
                  />
                  <span className="text-[10px] text-emerald-600">{p.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-emerald-300">SITE CONTROLS</h2>
            </div>
            <ToggleRow label="Matrix Background" description="Animated digital rain" enabled={matrixEnabled} disabled={toggleState !== "idle"} onToggle={() => updateSetting("matrix_enabled", !matrixEnabled)} />
            <div className="my-4 h-px bg-emerald-500/10" />
            <ToggleRow label="Maintenance Mode" description="Take site offline" enabled={maintenanceMode} disabled={toggleState !== "idle"} onToggle={() => updateSetting("maintenance_mode", !maintenanceMode)} />
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/10">
            <button
              onClick={handleRunMonitorNow}
              disabled={isExecuting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              <Play className={`h-3.5 w-3.5 ${isExecuting ? "animate-spin" : ""}`} />
              {isExecuting ? "RUNNING MONITOR..." : "⚡ RUN MONITOR NOW"}
            </button>
            {execMessage && <p className="text-[10px] text-center text-emerald-400 mt-2">{execMessage}</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-emerald-300">REAL GEOIP RADAR & FIREWALL</h2>
            </div>
          </div>
          {actionIpMsg && <div className="mb-3 p-2 bg-emerald-950/60 border border-emerald-500/30 rounded text-[10px] text-emerald-300 text-center animate-pulse">{actionIpMsg}</div>}
          {metrics.geo_traffic.length === 0 ? (
            <div className="text-xs text-emerald-700 py-4">IP geolokatsiyalari yuklanmoqda...</div>
          ) : (
            <div className="space-y-3">
              {metrics.geo_traffic.map((g, idx) => (
                <div key={idx} className="bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded-lg text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-300 uppercase bg-emerald-900/40 px-1.5 py-0.5 rounded">{g.code || "N/A"}</span>
                      <span className="text-emerald-400 text-[11px] truncate max-w-[90px]">{g.country}</span>
                    </div>
                    <span className="text-emerald-500 font-mono text-[11px]">{g.ip}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/10">
                    <button
                      onClick={() => handleIpAction(g.ip, "ban")}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-[10px] py-1 px-2 rounded transition-all"
                      title="Serverda bu IP manzilni bloklash"
                    >
                      <ShieldAlert className="h-3 w-3" /> BAN
                    </button>
                    <button
                      onClick={() => handleIpAction(g.ip, "unban")}
                      className="flex-1 flex items-center justify-center gap-1 bg-emerald-900/30 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] py-1 px-2 rounded transition-all"
                      title="Serverda bu IP manzilni bandan chiqarish"
                    >
                      <ShieldOff className="h-3 w-3" /> UNBAN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Server Audit - Kattalashtirildi (h-80) */}
        <div className="lg:col-span-2 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-emerald-300">LIVE SERVER AUDIT (TIZIM LOGLARI)</h2>
            </div>
            <div className="bg-black border border-emerald-500/20 rounded-lg p-4 h-80 overflow-y-auto">
              <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {auditLog || 'Kutilmoqda...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, bar }: { icon: React.ReactNode; label: string; value: string; bar: number }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs text-emerald-600"><span className="text-emerald-400">{icon}</span>{label}</span>
        <span className="text-sm text-emerald-300">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-emerald-900/40 overflow-hidden">
        <div className="h-full bg-emerald-500/60 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, bar)}%` }} />
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-4 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-1"><span className="text-emerald-400">{icon}</span>{label}</div>
      <div className="text-lg font-bold text-emerald-300">{value}</div>
    </div>
  );
}

function ServiceCard({ icon, label, isUp }: { icon: React.ReactNode; label: string; isUp: boolean }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-4 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-2"><span className="text-emerald-400">{icon}</span>{label}</div>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${isUp ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
        <span className={`text-sm font-bold ${isUp ? "text-emerald-300" : "text-red-400"}`}>{isUp ? "ONLINE" : "OFFLINE"}</span>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, disabled, onToggle }: { label: string; description: string; enabled: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div><p className="text-sm text-emerald-300">{label}</p><p className="text-xs text-emerald-600">{description}</p></div>
      <button onClick={onToggle} disabled={disabled} className={`relative inline-flex h-6 w-12 items-center rounded-full border transition-colors duration-300 disabled:opacity-50 ${enabled ? "border-emerald-500/60 bg-emerald-500/20" : "border-red-500/60 bg-red-500/20"}`}><span className={`inline-flex h-4 w-4 transform rounded-full transition-transform duration-300 ${enabled ? "translate-x-6 bg-emerald-500" : "translate-x-1 bg-red-500"}`} /></button>
    </div>
  );
}
