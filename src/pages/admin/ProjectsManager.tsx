import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderGit2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Project } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label } from "../../components/ui/input";
import { Select } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";

const empty: Omit<Project, "id" | "created_at"> = {
  title: "",
  description: "",
  tags: [],
  github_url: "",
  live_url: "",
  image_url: "",
  status: "active",
  sort_order: 0,
};

export function ProjectsManager() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [tagInput, setTagInput] = useState("");

  const load = async () => {
    const { data } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
    setItems((data as Project[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, sort_order: items.length });
    setTagInput("");
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, tags: p.tags, github_url: p.github_url, live_url: p.live_url, image_url: p.image_url, status: p.status, sort_order: p.sort_order });
    setTagInput("");
    setOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });
  };

  const save = async () => {
    if (!form.title) return;
    if (editing) {
      await supabase.from("projects").update(form).eq("id", editing.id);
    } else {
      await supabase.from("projects").insert(form);
    }
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Projects Manager</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <Card key={p.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-100">{p.title}</h3>
                <Badge variant={p.status === "active" ? "default" : "outline"}>{p.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{p.description}</p>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded border border-base-600 bg-base-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">{t}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-1 justify-end">
                <button onClick={() => openEdit(p)} className="text-slate-500 hover:text-accent"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(p.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <FolderGit2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No projects yet.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-xl">
        <DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
              />
              <Button variant="outline" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
                    {t}
                    <button onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GitHub URL</Label>
              <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            </div>
            <div>
              <Label>Live Demo URL</Label>
              <Input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
