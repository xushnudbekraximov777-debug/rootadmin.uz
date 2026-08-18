import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, BookOpen, X, Upload, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { CheatSheet } from "../../lib/types";
import { CHEATSHEET_CATEGORIES } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label, Select } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { MarkdownRenderer } from "../../components/public/MarkdownRenderer";

type FormState = Omit<CheatSheet, "id" | "created_at">;

const empty: FormState = {
  title: "",
  category: "Linux",
  description: "",
  content: "",
  tags: [],
  is_private: true,
};

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico"];

function isImage(filename: string): boolean {
  return IMAGE_EXTS.some((ext) => filename.toLowerCase().endsWith(ext));
}

export function CheatSheetsManager() {
  const [items, setItems] = useState<CheatSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CheatSheet | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("cheatsheets")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as CheatSheet[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setTagInput("");
    setPreview(false);
    setOpen(true);
  };

  const openEdit = (c: CheatSheet) => {
    setEditing(c);
    setForm({
      title: c.title,
      category: c.category,
      description: c.description ?? "",
      content: c.content,
      tags: c.tags ?? [],
      is_private: c.is_private,
    });
    setTagInput("");
    setPreview(false);
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
    if (editing) {
      await supabase.from("cheatsheets").update(form).eq("id", editing.id);
    } else {
      await supabase.from("cheatsheets").insert(form);
    }
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("cheatsheets").delete().eq("id", id);
    await load();
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setForm({ ...form, content: form.content + text });
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = form.content.substring(0, start) + text + form.content.substring(end);
    setForm({ ...form, content: newContent });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kb_files")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("kb_files").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const markdown = isImage(file.name)
        ? `\n![${file.name}](${publicUrl})\n`
        : `\n[Download ${file.name}](${publicUrl})\n`;

      insertAtCursor(markdown);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Knowledge Base & Cheat Sheets</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Cheat Sheet
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <Card key={c.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-sm font-semibold text-slate-100">{c.title}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.is_private ? (
                    <Badge variant="outline">Private</Badge>
                  ) : (
                    <Badge variant="success">Public</Badge>
                  )}
                </div>
              </div>
              <Badge variant="default">{c.category}</Badge>
              {c.description && (
                <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-600 font-mono line-clamp-2">{c.content.substring(0, 120)}...</p>
              {c.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded border border-base-600 bg-base-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-1 justify-end">
                <button onClick={() => openEdit(c)} className="text-slate-500 hover:text-accent">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(c.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No cheat sheets yet. Click "Add Cheat Sheet" to create one.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-3xl">
        <DialogTitle>{editing ? "Edit Cheat Sheet" : "Add Cheat Sheet"}</DialogTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CHEATSHEET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short summary of this cheat sheet"
            />
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Content (Markdown)</Label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(!preview)}
                  className="text-xs text-slate-400 hover:text-accent transition-colors"
                >
                  {preview ? "Edit" : "Preview"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" /> Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>
            {preview ? (
              <div className="min-h-[300px] rounded-md border border-base-600 bg-base-950 p-4 overflow-y-auto max-h-[500px]">
                <MarkdownRenderer content={form.content} />
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={14}
                placeholder={"# Title\n\nWrite your cheat sheet in Markdown...\n\n```bash\nls -la\n```"}
                className="font-mono text-sm"
              />
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-md border border-base-700 bg-base-900">
            <div>
              <p className="text-sm text-slate-200">Private</p>
              <p className="text-xs text-slate-500">If enabled, only admins can view this cheat sheet</p>
            </div>
            <Switch checked={form.is_private} onChange={(v) => setForm({ ...form, is_private: v })} />
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
