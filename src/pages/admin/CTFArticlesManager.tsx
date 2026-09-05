import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Flag, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { CtfArticle } from "../../lib/types";
import { CTF_DIFFICULTIES, CTF_CATEGORIES } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label, Select } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { MarkdownHelper } from "../../components/admin/MarkdownHelper";

type FormState = Omit<CtfArticle, "id" | "created_at">;

const empty: FormState = {
  title: "",
  slug: "",
  content: "",
  difficulty: "Medium",
  category: "Web",
  tags: [],
};

const DIFFICULTY_VARIANT: Record<string, "success" | "warning" | "error"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "error",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CTFArticlesManager() {
  const [items, setItems] = useState<CtfArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CtfArticle | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [tagInput, setTagInput] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("ctf_articles")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as CtfArticle[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setTagInput("");
    setSlugEdited(false);
    setOpen(true);
  };

  const openEdit = (a: CtfArticle) => {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      content: a.content,
      difficulty: a.difficulty,
      category: a.category,
      tags: a.tags ?? [],
    });
    setTagInput("");
    setSlugEdited(true);
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
    if (!form.title || !form.content) return;
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    if (editing) {
      await supabase.from("ctf_articles").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("ctf_articles").insert(payload);
    }
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("ctf_articles").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">CTF Writeups & Security Notes</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Writeup
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a) => (
          <Card key={a.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-sm font-semibold text-slate-100">{a.title}</h3>
                <Badge variant={DIFFICULTY_VARIANT[a.difficulty] ?? "outline"}>{a.difficulty}</Badge>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="default">{a.category}</Badge>
                <span className="font-mono text-[10px] text-slate-600">/{a.slug}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{a.content}</p>
              {a.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.tags.map((t) => (
                    <span key={t} className="rounded border border-base-600 bg-base-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-1 justify-end">
                <button onClick={() => openEdit(a)} className="text-slate-500 hover:text-accent">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(a.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <Flag className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No writeups yet. Click "Add Writeup" to create one.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-xl">
        <DialogTitle>{editing ? "Edit Writeup" : "Add Writeup"}</DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm({ ...form, title, slug: slugEdited ? form.slug : slugify(title) });
              }}
            />
          </div>
          <div>
            <Label>Slug (URL path)</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm({ ...form, slug: e.target.value });
              }}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {CTF_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CTF_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Content (Markdown)</Label>
              <MarkdownHelper />
            </div>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="Write your CTF writeup in Markdown..." className="font-mono text-sm" />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag and press Enter"
              />
              <Button variant="outline" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
                    {t}
                    <button onClick={() => removeTag(t)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
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
