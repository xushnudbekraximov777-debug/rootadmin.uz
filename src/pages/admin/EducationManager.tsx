import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GraduationCap, Award } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Education, Certification } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label } from "../../components/ui/input";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Tabs, useTabs } from "../../components/ui/tabs";

const emptyEdu: Omit<Education, "id" | "created_at"> = {
  institution: "",
  degree: "",
  field: "",
  start_year: "",
  end_year: "",
  description: "",
  sort_order: 0,
};

const emptyCert: Omit<Certification, "id" | "created_at"> = {
  name: "",
  issuer: "",
  year: "",
  credential_url: "",
  sort_order: 0,
};

export function EducationManager() {
  const { active, setActive } = useTabs("education");
  const [education, setEducation] = useState<Education[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [eduOpen, setEduOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [eduForm, setEduForm] = useState<typeof emptyEdu>(emptyEdu);
  const [certForm, setCertForm] = useState<typeof emptyCert>(emptyCert);

  const load = async () => {
    const [{ data: e }, { data: c }] = await Promise.all([
      supabase.from("education").select("*").order("sort_order", { ascending: true }),
      supabase.from("certifications").select("*").order("sort_order", { ascending: true }),
    ]);
    setEducation((e as Education[]) ?? []);
    setCerts((c as Certification[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveEdu = async () => {
    if (!eduForm.institution || !eduForm.degree) return;
    if (editingEdu) {
      await supabase.from("education").update(eduForm).eq("id", editingEdu.id);
    } else {
      await supabase.from("education").insert(eduForm);
    }
    setEduOpen(false);
    await load();
  };

  const saveCert = async () => {
    if (!certForm.name) return;
    if (editingCert) {
      await supabase.from("certifications").update(certForm).eq("id", editingCert.id);
    } else {
      await supabase.from("certifications").insert(certForm);
    }
    setCertOpen(false);
    await load();
  };

  const removeEdu = async (id: string) => {
    await supabase.from("education").delete().eq("id", id);
    await load();
  };

  const removeCert = async (id: string) => {
    await supabase.from("certifications").delete().eq("id", id);
    await load();
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Education & Certifications</h1>

      <Tabs
        tabs={[
          { id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" /> },
          { id: "certs", label: "Certifications", icon: <Award className="h-4 w-4" /> },
        ]}
        active={active}
        onChange={setActive}
        className="mb-6"
      />

      {active === "education" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingEdu(null); setEduForm({ ...emptyEdu, sort_order: education.length }); setEduOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Education
            </Button>
          </div>
          <div className="space-y-4">
            {education.map((e) => (
              <Card key={e.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{e.degree}</h3>
                      <p className="text-sm text-slate-400">{e.institution}</p>
                      {e.field && <p className="text-xs text-accent font-mono mt-0.5">{e.field}</p>}
                      <p className="text-xs text-slate-500 font-mono mt-1">{e.start_year} — {e.end_year || "Present"}</p>
                      {e.description && <p className="text-sm text-slate-500 mt-2">{e.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingEdu(e); setEduForm({ institution: e.institution, degree: e.degree, field: e.field, start_year: e.start_year, end_year: e.end_year, description: e.description, sort_order: e.sort_order }); setEduOpen(true); }} className="text-slate-500 hover:text-accent">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeEdu(e.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {education.length === 0 && <p className="text-slate-600 font-mono text-sm text-center py-10">// No education entries.</p>}
          </div>
        </div>
      )}

      {active === "certs" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingCert(null); setCertForm({ ...emptyCert, sort_order: certs.length }); setCertOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Certification
            </Button>
          </div>
          <div className="space-y-4">
            {certs.map((c) => (
              <Card key={c.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{c.name}</h3>
                      {c.issuer && <p className="text-sm text-slate-400">{c.issuer}</p>}
                      <p className="text-xs text-accent font-mono mt-1">{c.year}</p>
                      {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">View credential</a>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingCert(c); setCertForm({ name: c.name, issuer: c.issuer, year: c.year, credential_url: c.credential_url, sort_order: c.sort_order }); setCertOpen(true); }} className="text-slate-500 hover:text-accent">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeCert(c.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {certs.length === 0 && <p className="text-slate-600 font-mono text-sm text-center py-10">// No certifications.</p>}
          </div>
        </div>
      )}

      <Dialog open={eduOpen} onClose={() => setEduOpen(false)}>
        <DialogTitle>{editingEdu ? "Edit Education" : "Add Education"}</DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Institution</Label>
            <Input value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} />
          </div>
          <div>
            <Label>Degree</Label>
            <Input value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} />
          </div>
          <div>
            <Label>Field of Study</Label>
            <Input value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Year</Label>
              <Input value={eduForm.start_year} onChange={(e) => setEduForm({ ...eduForm, start_year: e.target.value })} placeholder="2025" />
            </div>
            <div>
              <Label>End Year</Label>
              <Input value={eduForm.end_year} onChange={(e) => setEduForm({ ...eduForm, end_year: e.target.value })} placeholder="2029" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={eduForm.description} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={eduForm.sort_order} onChange={(e) => setEduForm({ ...eduForm, sort_order: Number(e.target.value) })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveEdu} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setEduOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={certOpen} onClose={() => setCertOpen(false)}>
        <DialogTitle>{editingCert ? "Edit Certification" : "Add Certification"}</DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} placeholder="MTCNA" />
          </div>
          <div>
            <Label>Issuer</Label>
            <Input value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} placeholder="MikroTik" />
          </div>
          <div>
            <Label>Year</Label>
            <Input value={certForm.year} onChange={(e) => setCertForm({ ...certForm, year: e.target.value })} placeholder="2026" />
          </div>
          <div>
            <Label>Credential URL</Label>
            <Input value={certForm.credential_url} onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })} />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={certForm.sort_order} onChange={(e) => setCertForm({ ...certForm, sort_order: Number(e.target.value) })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveCert} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setCertOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
