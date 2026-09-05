import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FlaskConical, X, Eye } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { LabManual } from "../../lib/types";
import { LAB_MANUAL_CATEGORIES } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label, Select } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { MarkdownRenderer } from "../../components/public/MarkdownRenderer";
import { MarkdownHelper } from "../../components/admin/MarkdownHelper";

type FormState = Omit<LabManual, "id" | "created_at">;

const empty: FormState = {
  title: "",
  slug: "",
  category: "Linux",
  content: "",
};

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function LabManualsManager() {
  const [items, setItems] = useState<LabManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LabManual | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [preview, setPreview] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("lab_manuals").select("*").order("created_at", { ascending: false });
    setItems((data as LabManual[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setPreview(false);
    setOpen(true);
  };

  const openEdit = (m: LabManual) => {
    setEditing(m);
    setForm({ title: m.title, slug: m.slug, category: m.category, content: m.content });
    setPreview(false);
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.content) return;
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    if (editing) {
      await supabase.from("lab_manuals").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("lab_manuals").insert(payload);
    }
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("lab_manuals").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Lab Manuals & Tutorials</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Manual
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <Card key={m.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-sm font-semibold text-slate-100">{m.title}</h3>
              </div>
              <Badge variant="default">{m.category}</Badge>
              <p className="mt-2 text-xs text-slate-600 font-mono">/{m.slug}</p>
              <p className="mt-2 text-xs text-slate-500 line-clamp-2">{m.content.substring(0, 120)}...</p>
              <div className="mt-3 flex gap-1 justify-end">
                <button onClick={() => openEdit(m)} className="text-slate-500 hover:text-accent">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(m.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No lab manuals yet. Click "Add Manual" to create one.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-3xl">
        <DialogTitle>{editing ? "Edit Lab Manual" : "Add Lab Manual"}</DialogTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {LAB_MANUAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="linux-basics"
              className="font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Content (Markdown)</Label>
              <div className="flex items-center gap-3">
                <MarkdownHelper />
                <button
                  onClick={() => setPreview(!preview)}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-accent transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
            </div>
            {preview ? (
              <div className="min-h-[300px] rounded-md border border-base-600 bg-base-950 p-4 overflow-y-auto max-h-[500px]">
                <MarkdownRenderer content={form.content} />
              </div>
            ) : (
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={14}
                placeholder={"# Lab Title\n\n## Objective\n\nWrite your guide in Markdown...\n\n```bash\nsudo apt update\n```"}
                className="font-mono text-sm"
              />
            )}
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
