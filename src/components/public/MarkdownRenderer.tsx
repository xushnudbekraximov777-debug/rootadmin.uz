import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

type CodeBlockProps = {
  language: string;
  code: string;
};

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-base-700 bg-base-950">
      <div className="flex items-center justify-between border-b border-base-700 bg-base-900 px-3 py-1.5">
        <span className="font-mono text-[11px] text-slate-500">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:bg-base-800 hover:text-accent"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          background: "transparent",
          padding: "12px 16px",
          fontSize: "13px",
        }}
        codeTagProps={{ style: { fontFamily: "'Fira Code', 'Fira Mono', monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-accent prose-strong:text-slate-100 prose-code:text-accent prose-code:bg-base-800 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-accent prose-blockquote:text-slate-400 prose-li:text-slate-300 prose-th:text-slate-200 prose-td:text-slate-400 prose-table:border-base-700 prose-th:border-base-700 prose-td:border-base-700 prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return <CodeBlock language={match[1]} code={code} />;
            }

            if (!inline) {
              return <CodeBlock language="" code={code} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          img({ src, alt }) {
            return <img src={src as string} alt={alt || ""} className="max-w-full rounded-lg h-auto" />;
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
