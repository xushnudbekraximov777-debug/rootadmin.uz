import { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardList, ChevronDown, ChevronUp, Save, X, GripVertical } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Quiz, QuizQuestion, QuizOption } from "../../lib/types";
import { QUIZ_CATEGORIES } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Textarea, Label, Select } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

type QuestionDraft = {
  id: string;
  text: string;
  options: { id: string; text: string; is_correct: boolean }[];
};

type QuizDraft = {
  title: string;
  category: string;
  description: string;
  questions: QuestionDraft[];
};

let counter = 0;
function uid(): string {
  counter += 1;
  return `draft-${Date.now()}-${counter}`;
}

function emptyQuestion(): QuestionDraft {
  return {
    id: uid(),
    text: "",
    options: [
      { id: uid(), text: "", is_correct: true },
      { id: uid(), text: "", is_correct: false },
      { id: uid(), text: "", is_correct: false },
      { id: uid(), text: "", is_correct: false },
    ],
  };
}

const emptyDraft: QuizDraft = {
  title: "",
  category: "Linux",
  description: "",
  questions: [emptyQuestion()],
};

export function QuizzesManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<QuizDraft>(emptyDraft);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const showForm = editing !== null || isCreating;

  const load = async () => {
    const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
    setQuizzes((data as Quiz[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setIsCreating(true);
    setDraft({ ...emptyDraft, questions: [emptyQuestion()] });
    setExpanded(new Set([`q-0`]));
  };

  const startEdit = async (q: Quiz) => {
    setEditing(q);
    setIsCreating(false);
    setSaving(false);
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", q.id)
      .order("position", { ascending: true });

    const qRows = (questions as QuizQuestion[]) ?? [];
    const questionDrafts: QuestionDraft[] = [];

    for (const qq of qRows) {
      const { data: opts } = await supabase
        .from("quiz_options")
        .select("*")
        .eq("question_id", qq.id)
        .order("position", { ascending: true });
      const oRows = (opts as QuizOption[]) ?? [];
      questionDrafts.push({
        id: qq.id,
        text: qq.text,
        options: oRows.map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct })),
      });
    }

    if (questionDrafts.length === 0) questionDrafts.push(emptyQuestion());

    setDraft({
      title: q.title,
      category: q.category,
      description: q.description ?? "",
      questions: questionDrafts,
    });
    setExpanded(new Set([`q-0`]));
  };

  const addQuestion = () => {
    const newQ = emptyQuestion();
    setDraft({ ...draft, questions: [...draft.questions, newQ] });
    setExpanded(new Set([...expanded, `q-${draft.questions.length}`]));
  };

  const removeQuestion = (idx: number) => {
    setDraft({ ...draft, questions: draft.questions.filter((_, i) => i !== idx) });
  };

  const updateQuestionText = (idx: number, text: string) => {
    const qs = [...draft.questions];
    qs[idx] = { ...qs[idx], text };
    setDraft({ ...draft, questions: qs });
  };

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    const qs = [...draft.questions];
    const opts = [...qs[qIdx].options];
    opts[oIdx] = { ...opts[oIdx], text };
    qs[qIdx] = { ...qs[qIdx], options: opts };
    setDraft({ ...draft, questions: qs });
  };

  const setCorrect = (qIdx: number, oIdx: number) => {
    const qs = [...draft.questions];
    const opts = qs[qIdx].options.map((o, i) => ({ ...o, is_correct: i === oIdx }));
    qs[qIdx] = { ...qs[qIdx], options: opts };
    setDraft({ ...draft, questions: qs });
  };

  const toggleExpand = (key: string) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded(next);
  };

  const save = async () => {
    if (!draft.title || draft.questions.length === 0) return;
    setSaving(true);

    try {
      let quizId = editing?.id;

      if (editing) {
        await supabase.from("quizzes").update({
          title: draft.title,
          category: draft.category,
          description: draft.description || null,
        }).eq("id", editing.id);

        await supabase.from("quiz_questions").delete().eq("quiz_id", editing.id);
      } else {
        const { data: newQuiz } = await supabase.from("quizzes").insert({
          title: draft.title,
          category: draft.category,
          description: draft.description || null,
        }).select().single();
        quizId = (newQuiz as Quiz)?.id;
      }

      if (!quizId) return;

      for (let qi = 0; qi < draft.questions.length; qi++) {
        const qd = draft.questions[qi];
        if (!qd.text.trim()) continue;

        const { data: newQ } = await supabase.from("quiz_questions").insert({
          quiz_id: quizId,
          text: qd.text,
          position: qi,
        }).select().single();
        const questionId = (newQ as QuizQuestion)?.id;
        if (!questionId) continue;

        for (let oi = 0; oi < qd.options.length; oi++) {
          const od = qd.options[oi];
          if (!od.text.trim()) continue;
          await supabase.from("quiz_options").insert({
            question_id: questionId,
            text: od.text,
            is_correct: od.is_correct,
            position: oi,
          });
        }
      }

      setEditing(null);
      setIsCreating(false);
      setDraft(emptyDraft);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("quizzes").delete().eq("id", id);
    await load();
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsCreating(false);
    setDraft(emptyDraft);
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Quizzes & Skill Verification</h1>
        {!showForm && (
          <Button onClick={startNew}>
            <Plus className="h-4 w-4" /> New Quiz
          </Button>
        )}
      </div>

      {/* Quiz list */}
      {!showForm && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => (
              <Card key={q.id}>
                <CardContent>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{q.title}</h3>
                  </div>
                  <Badge variant="default">{q.category}</Badge>
                  {q.description && (
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">{q.description}</p>
                  )}
                  <div className="mt-3 flex gap-1 justify-end">
                    <button onClick={() => startEdit(q)} className="text-xs text-accent hover:underline">
                      Edit
                    </button>
                    <span className="text-slate-700">|</span>
                    <button onClick={() => remove(q.id)} className="text-xs text-red-400 hover:underline">
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {quizzes.length === 0 && (
            <div className="text-center py-20 text-slate-600">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-mono text-sm">// No quizzes yet. Click "New Quiz" to create one.</p>
            </div>
          )}
        </>
      )}

      {/* Quiz builder */}
      {showForm && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">
              {editing ? "Edit Quiz" : "New Quiz"}
            </h2>
            <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-300">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quiz metadata */}
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Quiz Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Linux Fundamentals Quiz"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  >
                    {QUIZ_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label>Description (optional)</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                  placeholder="A brief description of what this quiz covers"
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          {draft.questions.map((q, qi) => {
            const key = `q-${qi}`;
            const isOpen = expanded.has(key);
            return (
              <Card key={q.id}>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => toggleExpand(key)} className="text-slate-500 hover:text-slate-300">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <span className="text-xs font-mono text-slate-600">Q{qi + 1}</span>
                    {isOpen ? (
                      <Input
                        value={q.text}
                        onChange={(e) => updateQuestionText(qi, e.target.value)}
                        placeholder="Enter question text..."
                        className="flex-1"
                      />
                    ) : (
                      <span className="text-sm text-slate-300 flex-1 truncate">
                        {q.text || "(empty question)"}
                      </span>
                    )}
                    {draft.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qi)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="ml-8 space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={opt.id} className="flex items-center gap-3">
                          <button
                            onClick={() => setCorrect(qi, oi)}
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                              opt.is_correct
                                ? "border-emerald-500 bg-emerald-500/20"
                                : "border-base-600 hover:border-accent/50"
                            }`}
                          >
                            {opt.is_correct && <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            className="flex-1 text-sm"
                          />
                          {opt.is_correct && (
                            <Badge variant="success">Correct</Badge>
                          )}
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-600 mt-1">
                        Click the circle to mark the correct answer.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={addQuestion}>
              <Plus className="h-4 w-4" /> Add Question
            </Button>
            <Button onClick={save} disabled={saving || !draft.title}>
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Quiz"}
            </Button>
            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
