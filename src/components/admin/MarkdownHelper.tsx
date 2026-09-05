import { useState } from "react";
import { BookOpen, X, Copy, Check } from "lucide-react";

function CheatItem({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-1.5">{label}</p>
      <button
        onClick={handleCopy}
        className="group relative w-full text-left rounded-lg border border-slate-800 bg-slate-800/40 p-3 transition-colors hover:border-accent/30 hover:bg-slate-800/60"
      >
        <pre className="font-mono text-[13px] text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">{code}</pre>
        <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-slate-500" />
          )}
        </span>
      </button>
    </div>
  );
}

export function MarkdownHelper() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-accent transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Markdown Help
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          onClick={() => setShowGuide(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                Markdown Cheat Sheet
              </h2>
              <button onClick={() => setShowGuide(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <CheatItem label="Heading" code={"# Heading 1\n## Heading 2\n### Heading 3"} />
              <CheatItem label="Image" code={"![Description](image_url)"} />
              <CheatItem label="Link" code={"[Click Here](url)"} />
              <CheatItem label="Inline Code" code={"`pwd`"} />
              <CheatItem label="Code Block" code={"```bash\nsudo apt update\n```"} />
              <CheatItem label="Blockquote" code={"> Important note here"} />
              <CheatItem label="Unordered List" code={"- Item 1\n- Item 2\n- Item 3"} />
              <CheatItem label="Ordered List" code={"1. Step one\n2. Step two\n3. Step three"} />
              <CheatItem label="Table" code={"| Command | Description |\n|---------|-------------|\n| ls | List files |\n| cd | Change dir |"} />
            </div>

            <p className="mt-6 text-xs text-slate-600 font-mono">
              Click any snippet to copy it to your clipboard.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
