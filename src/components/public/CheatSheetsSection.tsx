import { useEffect, useState, useMemo } from "react";
import { Search, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { CheatSheet } from "../../lib/types";
import { CHEATSHEET_CATEGORIES } from "../../lib/types";
import { Badge } from "../../components/ui/badge";
import { MarkdownRenderer } from "./MarkdownRenderer";

export function CheatSheetsSection() {
  const [sheets, setSheets] = useState<CheatSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cheatsheets")
        .select("*")
        .eq("is_private", false)
        .order("created_at", { ascending: false });
      setSheets((data as CheatSheet[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sheets.filter((s) => {
      if (selectedCategory !== "All" && s.category !== selectedCategory) return false;
      if (!q) return true;
      const inTitle = s.title.toLowerCase().includes(q);
      const inTags = s.tags.some((t) => t.toLowerCase().includes(q));
      const inDesc = s.description?.toLowerCase().includes(q) ?? false;
      const inCategory = s.category.toLowerCase().includes(q);
      return inTitle || inTags || inDesc || inCategory;
    });
  }, [sheets, search, selectedCategory]);

  const categories = useMemo(() => {
    const used = new Set(sheets.map((s) => s.category));
    return CHEATSHEET_CATEGORIES.filter((c) => used.has(c));
  }, [sheets]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="font-mono text-accent animate-pulse">loading knowledge base...</div>
      </section>
    );
  }

  if (sheets.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">
          Knowledge Base <span className="text-accent">&amp;</span> Cheat Sheets
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-mono">
          $ man /var/lib/knowledge_base
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, tags, or category..."
          className="w-full rounded-lg border border-base-700 bg-base-900 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Category filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
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

      {/* Cheat sheet cards */}
      <div className="space-y-4">
        {filtered.map((s) => {
          const expanded = expandedId === s.id;
          return (
            <article
              key={s.id}
              className="rounded-xl border border-base-700 bg-base-900/50 overflow-hidden transition-all hover:border-base-600"
            >
              {/* Header (clickable) */}
              <button
                onClick={() => setExpandedId(expanded ? null : s.id)}
                className="w-full flex items-start justify-between gap-4 p-5 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">{s.category}</Badge>
                    {s.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded border border-base-600 bg-base-850 px-1.5 py-0.5 text-[10px] font-mono text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">{s.title}</h3>
                  {s.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                  )}
                </div>
                {expanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-500 shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500 shrink-0 mt-1" />
                )}
              </button>

              {/* Expanded content */}
              {expanded && (
                <div className="border-t border-base-700 p-5 bg-base-950/50">
                  <MarkdownRenderer content={s.content} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-700" />
          <p className="font-mono text-sm text-slate-600">
            {search ? "// No cheat sheets match your search." : "// No cheat sheets in this category."}
          </p>
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
