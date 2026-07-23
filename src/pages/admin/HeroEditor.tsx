import { useEffect, useState } from "react";
import { supabase, PROFILE_ID } from "../../lib/supabase";
import type { Profile } from "../../lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input, Textarea, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Save, CheckCircle2 } from "lucide-react";

const empty: Profile = {
  id: PROFILE_ID,
  name: "",
  title: "",
  bio: "",
  location: "",
  status: "",
  phone: "",
  email: "",
  telegram: "",
  cv_url: "",
  github_url: "",
  linkedin_url: "",
  updated_at: "",
};

export function HeroEditor() {
  const [form, setForm] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profile").select("*").eq("id", PROFILE_ID).maybeSingle();
      if (data) setForm(data as Profile);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase
      .from("profile")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", PROFILE_ID);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Hero Editor</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Status Badge</Label>
              <Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Telegram</Label>
              <Input value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
            </div>
            <div>
              <Label>GitHub URL</Label>
              <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            </div>
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
            </div>
            <div>
              <Label>CV / Resume URL</Label>
              <Input value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
