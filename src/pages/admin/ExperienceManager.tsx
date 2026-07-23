import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Experience } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";

const empty: Omit<Experience, "id" | "created_at"> = {
  company: "",
  role: "",
  start_date: "",
  end_date: "",
  current: false,
  description: "",
  sort_order: 0,
};

export function ExperienceManager() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const load = async () => {
    const { data } = await supabase.from("experiences").select("*").order("sort_order", { ascending: true });
    setItems((data as Experience[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, sort_order: items.length });
    setOpen(true);
  };

  const openEdit = (e: Experience) => {
    setEditing(e);
    setForm({ company: e.company, role: e.role, start_date: e.start_date, end_date: e.end_date, current: e.current, description: e.description, sort_order: e.sort_order });
    setOpen(true);
  };

  const save = async () => {
    if (!form.company || !form.role) return;
    if (editing) {
      await supabase.from("experiences").update(form).eq("id", editing.id);
    } else {
      await supabase.from("experiences").insert(form);
    }
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("experiences").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Experience Manager</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((e) => (
          <Card key={e.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-100">{e.role}</h3>
                    {e.current && <Badge variant="success">Current</Badge>}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{e.company}</p>
                  <p className="text-xs text-accent font-mono mt-1">
                    {e.start_date} — {e.current ? "Present" : e.end_date}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{e.description}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(e)} className="text-slate-500 hover:text-accent">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(e.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No experience yet.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Edit Experience" : "Add Experience"}</DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Company</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <Label>Role / Job Title</Label>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} placeholder="Feb 2026" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} placeholder="Present" disabled={form.current} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.current} onChange={(v) => setForm({ ...form, current: v, end_date: v ? "" : form.end_date })} />
            <span className="text-sm text-slate-300">Currently working here</span>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
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
