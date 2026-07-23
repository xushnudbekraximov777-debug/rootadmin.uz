import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Cpu } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Skill } from "../../lib/types";
import { SKILL_CATEGORIES } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Select, Label } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";

const emptySkill: Omit<Skill, "id" | "created_at"> = {
  name: "",
  category: SKILL_CATEGORIES[0],
  proficiency: 80,
  icon: "",
  sort_order: 0,
};

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<typeof emptySkill>(emptySkill);

  const load = async () => {
    const { data } = await supabase.from("skills").select("*").order("sort_order", { ascending: true });
    setSkills((data as Skill[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptySkill, sort_order: skills.length });
    setOpen(true);
  };

  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, proficiency: s.proficiency, icon: s.icon, sort_order: s.sort_order });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name) return;
    if (editing) {
      await supabase.from("skills").update(form).eq("id", editing.id);
    } else {
      await supabase.from("skills").insert(form);
    }
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Skills Manager</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{s.name}</p>
                    <Badge variant="outline" className="mt-1">{s.category}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="text-slate-500 hover:text-accent">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(s.id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Proficiency</span>
                  <span className="font-mono text-accent">{s.proficiency}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-base-700 overflow-hidden">
                  <div className="h-full bg-accent/60 rounded-full" style={{ width: `${s.proficiency}%` }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <Cpu className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No skills yet. Add one to get started.</p>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. OSPF" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Proficiency: {form.proficiency}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.proficiency}
              onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
          <div>
            <Label>Icon (identifier)</Label>
            <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. router" />
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
