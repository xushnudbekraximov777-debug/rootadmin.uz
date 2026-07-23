import { Lock, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer({ logo }: { logo: string }) {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-base-800 mt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-sm text-accent glow-text">{logo}</div>
          <p className="text-xs text-slate-600 font-mono">
            {t("footer.builtWith")}
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-accent transition-colors"
          >
            <Lock className="h-3 w-3" />
            {t("footer.adminLogin")}
          </a>
        </div>
      </div>
    </footer>
  );
}
