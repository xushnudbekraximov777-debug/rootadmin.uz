import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, CheckCircle2, Palette, Search, FileText, Shield, KeyRound, Sparkles } from "lucide-react";
import { supabase, SETTINGS_ID } from "../../lib/supabase";
import type { Settings } from "../../lib/types";
import { ACCENT_COLORS } from "../../lib/types";
import { applyAccent } from "../../lib/utils";
import { useAuth } from "../../lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input, Textarea, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Tabs, useTabs } from "../../components/ui/tabs";

const empty: Settings = {
  id: SETTINGS_ID,
  accent_color: "cyan",
  seo_title: "",
  seo_description: "",
  resume_url: "",
  maintenance_mode: false,
  open_for_freelance: true,
  matrix_enabled: false,
  matrix_brightness: 100,
  ui_version: "legacy",
  updated_at: "",
};

export function SettingsManager() {
  const { active, setActive } = useTabs("theme");
  const [form, setForm] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  // password change
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("*").eq("id", SETTINGS_ID).maybeSingle();
      if (data) setForm(data as Settings);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").update({ ...form, updated_at: new Date().toISOString() }).eq("id", SETTINGS_ID);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const setAccent = (color: string) => {
    setForm({ ...form, accent_color: color });
    applyAccent(color);
  };

  const changePassword = async () => {
    setPassMsg("");
    if (newPass.length < 8 || !/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass)) {
      setPassMsg("Password must be 8+ chars with upper, lower, and number.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      setPassMsg(error.message);
    } else {
      setPassMsg("Password updated successfully.");
      setNewPass("");
    }
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Settings</h1>

      <Tabs
        tabs={[
          { id: "theme", label: "Theme", icon: <Palette className="h-4 w-4" /> },
          { id: "seo", label: "SEO", icon: <Search className="h-4 w-4" /> },
          { id: "resume", label: "Resume", icon: <FileText className="h-4 w-4" /> },
          { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
        ]}
        active={active}
        onChange={setActive}
        className="mb-6"
      />

      {active === "theme" && (
        <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Public UI Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-md border border-base-700 bg-base-900">
              <div>
                <p className="text-sm text-slate-200">Public UI Version</p>
                <p className="text-xs text-slate-500">Switch between the classic and futuristic 2026 cybersecurity design</p>
              </div>
              <div className="flex rounded-lg border border-base-600 bg-base-950 p-1">
                <button
                  onClick={() => setForm({ ...form, ui_version: "legacy" })}
                  className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                    form.ui_version !== "modern"
                      ? "bg-accent/15 text-accent shadow-accent"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Legacy
                </button>
                <button
                  onClick={() => setForm({ ...form, ui_version: "modern" })}
                  className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                    form.ui_version === "modern"
                      ? "bg-accent/15 text-accent shadow-accent"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Modern
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Accent Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(ACCENT_COLORS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setAccent(key)}
                  className={`rounded-lg border p-4 transition-all ${
                    form.accent_color === key
                      ? "border-accent shadow-accent"
                      : "border-base-600 hover:border-base-500"
                  }`}
                >
                  <div className="h-10 w-full rounded-md mb-2" style={{ backgroundColor: val.hex }} />
                  <p className="text-sm text-slate-200">{val.label}</p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <Label>Custom HEX Color</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={form.accent_color.startsWith("#") ? form.accent_color : ACCENT_COLORS[form.accent_color]?.hex ?? "#22d3ee"}
                  onChange={(e) => setAccent(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-base-600 bg-base-900 p-1"
                />
                <Input
                  value={form.accent_color.startsWith("#") ? form.accent_color : ""}
                  onChange={(e) => setAccent(e.target.value)}
                  placeholder="#ff003c"
                  className="font-mono"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Enter any HEX code to use a custom accent color across the site.</p>
            </div>

            <div className="mt-6 flex items-center justify-between p-4 rounded-md border border-base-700 bg-base-900">
              <div>
                <p className="text-sm text-slate-200">Matrix Background</p>
                <p className="text-xs text-slate-500">Animated digital rain effect on the public site</p>
              </div>
              <Switch checked={form.matrix_enabled} onChange={(v) => setForm({ ...form, matrix_enabled: v })} />
            </div>

            {form.matrix_enabled && (
              <div className="mt-4 p-4 rounded-md border border-base-700 bg-base-900">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-slate-200">Matrix Brightness</p>
                    <p className="text-xs text-slate-500">Controls the opacity of the digital rain effect</p>
                  </div>
                  <span className="font-mono text-sm text-accent">{form.matrix_brightness}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={form.matrix_brightness}
                  onChange={(e) => setForm({ ...form, matrix_brightness: Number(e.target.value) })}
                  className="w-full h-2 cursor-pointer appearance-none rounded-full bg-base-700 accent-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-accent [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-600">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {active === "seo" && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
                </Button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Saved
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {active === "resume" && (
        <Card>
          <CardHeader>
            <CardTitle>Resume / CV URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Resume PDF URL</Label>
                <Input value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} placeholder="https://...resume.pdf" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-md border border-base-700 bg-base-900">
                <div>
                  <p className="text-sm text-slate-200">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">Takes the public site offline</p>
                </div>
                <Switch checked={form.maintenance_mode} onChange={(v) => setForm({ ...form, maintenance_mode: v })} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-md border border-base-700 bg-base-900">
                <div>
                  <p className="text-sm text-slate-200">Open for Freelance</p>
                  <p className="text-xs text-slate-500">Show availability status</p>
                </div>
                <Switch checked={form.open_for_freelance} onChange={(v) => setForm({ ...form, open_for_freelance: v })} />
              </div>
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {active === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-accent" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" />
                </div>
                {passMsg && <p className="text-sm text-accent font-mono">{passMsg}</p>}
                <Button onClick={changePassword}>
                  <KeyRound className="h-4 w-4" /> Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Session Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Logged in as</span>
                  <span className="font-mono text-accent">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Session timeout</span>
                  <span className="font-mono text-slate-300">Expires on browser close</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
