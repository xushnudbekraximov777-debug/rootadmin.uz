import { useEffect, useRef, useState } from "react";
import { Activity, ShieldAlert, Server, Wifi, Cpu, HardDrive, Lock, Eye } from "lucide-react";
import { supabase, SETTINGS_ID } from "../../lib/supabase";

type ToggleState = "loading" | "saving" | "idle";

type TrafficPoint = { hour: string; count: number };

type SystemMetrics = {
  cpu_usage: number;
  disk_usage: number;
  ram_usage: number;
  uptime_str: string;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function buildTrafficPoints(rows: { created_at: string }[]): TrafficPoint[] {
  const buckets: Record<string, number> = {};
  // seed last 12 hours with 0
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setHours(d.getHours() - i, 0, 0, 0);
    const key = `${String(d.getHours()).padStart(2, "0")}:00`;
    buckets[key] = 0;
  }
  for (const row of rows) {
    const d = new Date(row.created_at);
    const key = `${String(d.getHours()).padStart(2, "0")}:00`;
    if (key in buckets) buckets[key]++;
  }
  return Object.entries(buckets).map(([hour, count]) => ({ hour, count }));
}

// ── component ─────────────────────────────────────────────────────────────────

export function NocDashboard() {
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [toggleState, setToggleState] = useState<ToggleState>("loading");
  const [error, setError] = useState<string | null>(null);

  const [traffic, setTraffic] = useState<TrafficPoint[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    disk_usage: 0,
    ram_usage: 0,
    uptime_str: "—",
  });

  // keep a stable ref to the raw page_view rows for incremental updates
  const rawViewsRef = useRef<{ created_at: string }[]>([]);

  // standalone so the Realtime handler can re-invoke it as a fallback
  const loadMetrics = async () => {
    const { data, error: err } = await supabase
      .from("system_metrics")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (err) {
      console.error("[NocDashboard] system_metrics fetch error:", err);
      return;
    }
    if (!data) {
      console.warn("[NocDashboard] system_metrics: no rows found");
      return;
    }
    console.log("[NocDashboard] system_metrics loaded:", data);
    setMetrics(data as SystemMetrics);
  };

  // ── initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from("settings")
        .select("matrix_enabled, maintenance_mode")
        .eq("id", SETTINGS_ID)
        .maybeSingle();

      if (!cancelled) {
        if (settingsErr) setError(settingsErr.message);
        else if (settingsData) {
          setMatrixEnabled(Boolean(settingsData.matrix_enabled));
          setMaintenanceMode(Boolean(settingsData.maintenance_mode));
        }
        setToggleState("idle");
      }

      // page_views — last 12 h
      const since = new Date();
      since.setHours(since.getHours() - 12);
      const { data: viewsData, error: viewsErr } = await supabase
        .from("page_views")
        .select("created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });

      if (viewsErr) console.error("[NocDashboard] page_views fetch error:", viewsErr);

      if (!cancelled && viewsData) {
        rawViewsRef.current = viewsData as { created_at: string }[];
        setTraffic(buildTrafficPoints(rawViewsRef.current));
      }

      // total views (all time)
      const { count, error: countErr } = await supabase
        .from("page_views")
        .select("id", { count: "exact", head: true });
      if (countErr) console.error("[NocDashboard] page_views count error:", countErr);
      if (!cancelled && count !== null) setTotalViews(count);

      // system_metrics — always fetch the absolute latest row
      if (!cancelled) await loadMetrics();
    })();

    return () => { cancelled = true; };
  }, []);

  // ── Realtime: page_views ─────────────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel("noc_page_views")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_views" },
        (payload) => {
          const newRow = payload.new as { created_at: string };
          rawViewsRef.current = [...rawViewsRef.current, newRow];
          setTraffic(buildTrafficPoints(rawViewsRef.current));
          setTotalViews((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Realtime: system_metrics ─────────────────────────────────────────────────

  useEffect(() => {
    const applyRow = (row: SystemMetrics) => {
      console.log("[NocDashboard] system_metrics realtime update:", row);
      setMetrics({
        cpu_usage: row.cpu_usage,
        disk_usage: row.disk_usage,
        ram_usage: row.ram_usage,
        uptime_str: row.uptime_str,
      });
    };

    const channel = supabase
      .channel("noc_system_metrics")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "system_metrics" },
        (payload) => applyRow(payload.new as SystemMetrics)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "system_metrics" },
        (payload) => applyRow(payload.new as SystemMetrics)
      )
      .subscribe((status) => {
        console.log("[NocDashboard] system_metrics channel status:", status);
        // If the channel connects after initial load, re-fetch to catch any
        // rows that arrived during the subscription setup window.
        if (status === "SUBSCRIBED") loadMetrics();
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── settings toggle ──────────────────────────────────────────────────────────

  const updateSetting = async (field: "matrix_enabled" | "maintenance_mode", value: boolean) => {
    setToggleState("saving");
    setError(null);
    const { error: err } = await supabase
      .from("settings")
      .update({ [field]: value })
      .eq("id", SETTINGS_ID);

    if (err) setError(err.message);
    else {
      if (field === "matrix_enabled") setMatrixEnabled(value);
      if (field === "maintenance_mode") setMaintenanceMode(value);
    }
    setToggleState("idle");
  };

  const maxTraffic = Math.max(1, ...traffic.map((p) => p.count));

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

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ERROR: {error}
        </div>
      )}

      {/* System metrics — live from system_metrics table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Cpu className="h-4 w-4" />}
          label="CPU LOAD"
          value={`${metrics.cpu_usage}%`}
          bar={metrics.cpu_usage}
        />
        <MetricCard
          icon={<HardDrive className="h-4 w-4" />}
          label="DISK"
          value={`${metrics.disk_usage}%`}
          bar={metrics.disk_usage}
        />
        <MetricCard
          icon={<Wifi className="h-4 w-4" />}
          label="RAM"
          value={`${metrics.ram_usage}%`}
          bar={metrics.ram_usage}
        />
        <MetricCard
          icon={<Server className="h-4 w-4" />}
          label="UPTIME"
          value={metrics.uptime_str}
          bar={88}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Traffic chart — real page_views grouped by hour */}
        <div className="lg:col-span-2 rounded-xl border border-emerald-500/20 bg-black/60 backdrop-blur-md p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-300">REAL-TIME VISITOR TRAFFIC</h2>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-500">
              <Eye className="h-3.5 w-3.5" />
              {totalViews.toLocaleString()} total views
            </span>
          </div>

          {traffic.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-emerald-700">
              Waiting for visitor data…
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1.5 h-40">
              {traffic.map((p) => (
                <div key={p.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full min-h-[2px] rounded-t-sm bg-gradient-to-t from-emerald-500/30 to-emerald-400/80 transition-all duration-500 hover:from-emerald-500/50 hover:to-emerald-300"
                    style={{ height: `${(p.count / maxTraffic) * 100}%` }}
                    title={`${p.count} visit${p.count !== 1 ? "s" : ""}`}
                  />
                  <span className="text-[10px] text-emerald-600 hidden sm:inline">{p.hour}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[10px] text-emerald-700">
            visits/hour · last 12h · updates live via Supabase Realtime
          </p>
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

          <div className="mt-6 pt-4 border-t border-emerald-500/10 text-xs text-emerald-600 space-y-1">
            <p>metrics source: <span className="text-emerald-500">system_metrics</span></p>
            <p>traffic source: <span className="text-emerald-500">page_views</span></p>
            <p>realtime: <span className="text-emerald-400 animate-pulse">● live</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────────

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
          style={{ width: `${Math.min(100, bar)}%` }}
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
