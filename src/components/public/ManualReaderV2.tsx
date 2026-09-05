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
    <div className="group relative my-6 overflow-hidden rounded-xl border border-slate-800 bg-[#02040A]">
      {/* Terminal-style header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-slate-600" />
          <span className="font-mono text-[11px] text-slate-500">{language || "bash"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-mono text-slate-400 transition-all hover:border-emerald-500/50 hover:text-emerald-400"
        >
          {copied ? (
            <span className="text-emerald-400">Copied!</span>
          ) : (
            <>
              <span className="text-slate-500">$</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
        <code className="text-emerald-400 font-mono bg-transparent p-0 block">{code}</code>
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
          <Link to="/" className="text-sm text-accent hover:underline">
            Back to Home
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
        className="mx-auto max-w-4xl px-4 sm:px-6 py-12"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
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
        <div className="max-w-4xl mx-auto text-slate-300 leading-[1.8] text-[17px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return <p className="mb-6">{children}</p>;
              },
              h1({ children }) {
                return <h1 className="text-3xl font-bold text-white mb-6 mt-10 border-b border-slate-800 pb-2">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-2xl font-bold text-white mb-4 mt-8">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-6">{children}</h3>;
              },
              ul({ children }) {
                return <ul className="list-disc list-outside ml-6 mb-6 space-y-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-outside ml-6 mb-6 space-y-2">{children}</ol>;
              },
              blockquote({ children }) {
                return <blockquote className="border-l-4 border-indigo-500 bg-indigo-500/10 p-4 my-6 rounded-r-lg italic text-slate-300">{children}</blockquote>;
              },
              table({ children }) {
                return <table className="w-full text-left border-collapse my-8 overflow-hidden rounded-lg">{children}</table>;
              },
              thead({ children }) {
                return <thead className="bg-slate-800/60 border-b border-slate-700">{children}</thead>;
              },
              th({ children }) {
                return <th className="px-4 py-3 font-semibold text-slate-200 border border-slate-700/50">{children}</th>;
              },
              td({ children }) {
                return <td className="px-4 py-3 text-slate-300 border border-slate-700/50">{children}</td>;
              },
              tr({ children }) {
                return <tr className="hover:bg-slate-800/30 transition-colors">{children}</tr>;
              },
              pre({ children }: any) {
                const codeEl = children?.props;
                const className = codeEl?.className || "";
                const match = /language-(\w+)/.exec(className);
                const code = String(codeEl?.children ?? "").replace(/\n$/, "");
                return <CodeBlock language={match ? match[1] : ""} code={code} />;
              },
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const text = String(children).replace(/\n$/, "");

                if (!inline && (match || text.includes("\n"))) {
                  return <code className="text-emerald-400 font-mono bg-transparent p-0 block">{children}</code>;
                }

                return (
                  <code className="bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-sm border border-indigo-500/30" {...props}>
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
              img({ src, alt }) {
                return <img src={src} alt={alt} className="rounded-xl shadow-lg mx-auto my-8 max-h-[500px] object-contain border border-slate-800" />;
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
