import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function AdminSettings() {
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error: err } = await supabase
        .from("site_settings")
        .select("matrix_enabled")
        .eq("id", 1)
        .single();

      if (err) {
        setError(err.message);
      } else if (data) {
        setMatrixEnabled(Boolean(data.matrix_enabled));
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const toggleMatrix = async () => {
    setSaving(true);
    setError(null);
    const newValue = !matrixEnabled;

    const { error: err } = await supabase
      .from("site_settings")
      .update({ matrix_enabled: newValue })
      .eq("id", 1);

    if (err) {
      setError(err.message);
    } else {
      setMatrixEnabled(newValue);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="font-mono text-sm text-emerald-400 animate-pulse">
          Loading security dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Security Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400 font-mono">
          $ systemctl status site-settings
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-700 bg-gray-900/60 backdrop-blur-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Matrix Rain Effect</h3>
            <p className="mt-1 text-xs text-slate-400">
              Toggle the animated Matrix digital rain background on the public site.
            </p>
          </div>

          <button
            onClick={toggleMatrix}
            disabled={saving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full border transition-colors duration-300 disabled:opacity-50 ${
              matrixEnabled
                ? "border-emerald-500/60 bg-emerald-500/20"
                : "border-red-500/60 bg-red-500/20"
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full transition-transform duration-300 ${
                matrixEnabled
                  ? "translate-x-7 bg-emerald-500"
                  : "translate-x-1 bg-red-500"
              }`}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 font-mono text-xs">
          <span
            className={`h-2 w-2 rounded-full ${matrixEnabled ? "bg-emerald-500" : "bg-red-500"}`}
          />
          <span className={matrixEnabled ? "text-emerald-400" : "text-red-400"}>
            {matrixEnabled ? "ACTIVE" : "INACTIVE"}
          </span>
          {saving && <span className="text-slate-500">— saving...</span>}
        </div>
      </div>
    </div>
  );
}
