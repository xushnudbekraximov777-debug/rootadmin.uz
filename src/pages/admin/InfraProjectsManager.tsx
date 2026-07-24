import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Server, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";

type InfraProject = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  sort_order: number;
  created_at: string;
};

type FormState = Omit<InfraProject, "id" | "created_at">;

const ICON_OPTIONS = [
  { value: "bot", label: "🤖 Bot" },
  { value: "mail", label: "📧 Mail" },
  { value: "cloud", label: "☁️ Cloud" },
  { value: "shield", label: "🛡️ Shield" },
  { value: "container", label: "📦 Container" },
  { value: "chart", label: "📊 Chart" },
  { value: "server", label: "🖥️ Server" },
  { value: "network", label: "🌐 Network" },
  { value: "database", label: "🗄️ Database" },
  { value: "lock", label: "🔒 Lock" },
];

const ICONS: Record<string, string> = Object.fromEntries(
  ICON_OPTIONS.map(({ value, label }) => [value, label.split(" ")[0]])
);

const emptyForm: FormState = {
  title: "",
  description: "",
  icon: "server",
  tags: [],
  sort_order: 0,
};

export function InfraProjectsManager() {
  const [items, setItems] = useState<InfraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InfraProject | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("infra_projects")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems((data as InfraProject[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: items.length });
    setTagInput("");
    setOpen(true);
  };

  const openEdit = (p: InfraProject) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      icon: p.icon,
      tags: [...p.tags],
      sort_order: p.sort_order,
    });
    setTagInput("");
    setOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] });
    setTagInput("");
  };

  const removeTag = (t: string) =>
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editing) {
      await supabase.from("infra_projects").update(form).eq("id", editing.id);
    } else {
      await supabase.from("infra_projects").insert(form);
    }
    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("infra_projects").delete().eq("id", id);
    await load();
  };

  if (loading)
    return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Infrastructure Projects</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <Card key={p.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ICONS[p.icon] ?? "🖥️"}</span>
                  <h3 className="text-sm font-semibold text-slate-100">{p.title}</h3>
                </div>
                <span className="text-xs text-slate-600 font-mono">#{p.sort_order}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {p.description}
              </p>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-base-600 bg-base-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-1 justify-end">
                <button
                  onClick={() => openEdit(p)}
                  className="text-slate-500 hover:text-accent"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No infrastructure projects yet.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-xl">
        <DialogTitle>
          {editing ? "Edit Infrastructure Project" : "Add Infrastructure Project"}
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. WireGuard VPN Gateway"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the infrastructure project…"
            />
          </div>
          <div>
            <Label>Icon</Label>
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full rounded-md border border-base-700 bg-base-900 px-3 py-2 text-sm text-slate-200 focus:border-accent focus:outline-none"
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(); }
                }}
                placeholder="Type a tag and press Enter"
              />
              <Button variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent"
                  >
                    {t}
                    <button onClick={() => removeTag(t)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} className="flex-1" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
