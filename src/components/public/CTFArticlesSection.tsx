import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import type { CtfArticle } from "../../lib/types";
import { CTF_CATEGORIES, CTF_DIFFICULTIES } from "../../lib/types";
import { Badge } from "../../components/ui/badge";

const DIFFICULTY_VARIANT: Record<string, "success" | "warning" | "error"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "error",
};

export function CTFArticlesSection() {
  const [articles, setArticles] = useState<CtfArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ctf_articles")
        .select("*")
        .order("created_at", { ascending: false });
      setArticles((data as CtfArticle[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (selectedCategory !== "All" && a.category !== selectedCategory) return false;
      if (selectedDifficulty !== "All" && a.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [articles, selectedCategory, selectedDifficulty]);

  const categories = useMemo(() => {
    const used = new Set(articles.map((a) => a.category));
    return CTF_CATEGORIES.filter((c) => used.has(c));
  }, [articles]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="font-mono text-accent animate-pulse">loading writeups...</div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">
          CTF Write-ups <span className="text-accent">&amp;</span> Security Notes
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-mono">$ cat /var/log/ctf_writeups.log</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" active={selectedCategory === "All"} onClick={() => setSelectedCategory("All")} />
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={selectedCategory === c}
              onClick={() => setSelectedCategory(selectedCategory === c ? "All" : c)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All Levels" active={selectedDifficulty === "All"} onClick={() => setSelectedDifficulty("All")} />
          {CTF_DIFFICULTIES.map((d) => (
            <FilterChip
              key={d}
              label={d}
              active={selectedDifficulty === d}
              onClick={() => setSelectedDifficulty(selectedDifficulty === d ? "All" : d)}
            />
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <article
            key={a.id}
            className="group rounded-xl border border-base-700 bg-base-900/50 p-5 transition-all hover:border-accent/40 hover:bg-base-900"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <Badge variant="default">{a.category}</Badge>
              <Badge variant={DIFFICULTY_VARIANT[a.difficulty] ?? "outline"}>{a.difficulty}</Badge>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-slate-100 group-hover:text-accent transition-colors">
              {a.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">{a.content}</p>
            {a.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-base-600 bg-base-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 font-mono text-[10px] text-slate-600">
              {new Date(a.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center font-mono text-sm text-slate-600">
          // No writeups match the selected filters.
        </div>
      )}
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-base-600 text-slate-400 hover:border-base-500 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
