import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FlaskConical, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabase";
import type { LabManual } from "../../lib/types";

const HUD_BG = "#050B14";

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-accent/20" style={{ background: "rgba(0 0 0 / 0.4)", backdropFilter: "blur(8px)" }}>
      {/* Terminal-style header bar */}
      <div className="flex items-center justify-between border-b border-accent/15 px-4 py-2" style={{ background: "rgba(var(--accent) / 0.04)" }}>
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-accent/60" />
          <span className="font-mono text-[11px] text-slate-500">{language || "bash"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-accent/20 px-2.5 py-1 text-[11px] font-mono text-slate-400 transition-all hover:border-accent/50 hover:text-accent hover:shadow-accent"
          style={{ background: "rgba(var(--accent) / 0.04)" }}
        >
          {copied ? (
            <span className="text-emerald-400">Copied!</span>
          ) : (
            <>
              <span className="text-accent">$</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed text-slate-300" style={{ background: "rgba(0 0 0 / 0.3)" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ManualReaderV2() {
  const { slug } = useParams<{ slug: string }>();
  const [manual, setManual] = useState<LabManual | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lab_manuals")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (data) {
        setManual(data as LabManual);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: HUD_BG }}>
        <div className="font-mono text-accent animate-pulse">Loading manual...</div>
      </div>
    );
  }

  if (notFound || !manual) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: HUD_BG }}>
        <div className="text-center">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 text-slate-700" />
          <p className="font-mono text-slate-500 mb-4">Manual not found.</p>
          <Link to="/manuals" className="text-sm text-accent hover:underline">
            Back to Manuals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: HUD_BG }}>
      {/* Navbar spacer */}
      <div className="h-16" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-4 sm:px-6 py-12"
      >
        {/* Back link */}
        <Link
          to="/manuals"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Manuals
        </Link>

        {/* Holographic header card */}
        <div
          className="relative rounded-2xl border border-accent/20 p-8 mb-8"
          style={{ background: "rgba(var(--accent) / 0.03)", backdropFilter: "blur(16px)" }}
        >
          <div className="absolute top-0 left-0 h-10 w-10 border-l border-t border-accent/40 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 h-10 w-10 border-r border-b border-accent/40 rounded-br-2xl" />

          <span
            className="inline-block rounded-full border border-accent/30 px-3 py-1 text-[10px] font-mono text-accent mb-4"
            style={{ background: "rgba(var(--accent) / 0.06)" }}
          >
            {manual.category}
          </span>
          <h1 className="text-3xl font-bold text-slate-100 leading-tight">{manual.title}</h1>
          <p className="mt-3 text-xs font-mono text-slate-600">
            Published {new Date(manual.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Markdown content */}
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-accent/10 prose-h2:pb-2 prose-p:text-slate-300 prose-a:text-accent prose-strong:text-slate-100 prose-code:text-accent prose-code:bg-base-800 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-accent prose-blockquote:text-slate-400 prose-li:text-slate-300 prose-th:text-slate-200 prose-td:text-slate-400 prose-table:border-base-700 prose-th:border-base-700 prose-td:border-base-700 prose-img:rounded-lg prose-img:max-w-full prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const code = String(children).replace(/\n$/, "");

                if (!inline && (match || code.includes("\n"))) {
                  return <CodeBlock language={match ? match[1] : ""} code={code} />;
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              a({ href, children }) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {children}
                  </a>
                );
              },
            }}
          >
            {manual.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}
