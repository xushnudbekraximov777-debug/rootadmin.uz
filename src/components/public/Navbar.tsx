import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Download, Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

const linkKeys = [
  { href: "#about", key: "about" },
  { href: "#experience", key: "experience" },
  { href: "#education", key: "education" },
  { href: "#skills", key: "skills" },
  { href: "#projects", key: "projects" },
  { href: "#contact", key: "contact" },
] as const;

const languages = [
  { code: "en", flag: "EN" },
  { code: "uz", flag: "UZ" },
  { code: "ru", flag: "RU" },
] as const;

export function Navbar({ logo, cvUrl, showLabManuals }: { logo: string; cvUrl: string; showLabManuals?: boolean }) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("portfolio_lang", code);
    setLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "glass border-b border-base-700" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <a href="#hero" className="font-mono text-sm font-semibold text-accent glow-text">
            {logo}
          </a>

          <div className="hidden md:flex items-center gap-6">
            {linkKeys.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-slate-400 hover:text-accent transition-colors"
              >
                {t(`nav.${l.key}`)}
              </a>
            ))}
            {showLabManuals && (
              <a
                href="/manuals"
                className="text-sm text-slate-400 hover:text-accent transition-colors"
              >
                Lab Manuals
              </a>
            )}
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {t("nav.downloadCv")}
              </a>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1.5 rounded-md border border-base-600 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:border-accent/50 hover:text-accent transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                {currentLang.flag}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 rounded-md border border-base-600 bg-base-900 py-1 shadow-lg z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLang(l.code)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors",
                        l.code === i18n.language
                          ? "text-accent bg-accent/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-base-800"
                      )}
                    >
                      {t(`language.${l.code}`)}
                      {l.code === i18n.language && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1 rounded-md border border-base-600 px-2 py-1.5 text-xs font-mono text-slate-300"
              >
                <Globe className="h-3.5 w-3.5" />
                {currentLang.flag}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-28 rounded-md border border-base-600 bg-base-900 py-1 shadow-lg z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLang(l.code)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors",
                        l.code === i18n.language
                          ? "text-accent bg-accent/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-base-800"
                      )}
                    >
                      {t(`language.${l.code}`)}
                      {l.code === i18n.language && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="text-slate-300"
              onClick={() => setOpen(!open)}
              aria-label={t("nav.menu")}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-base-700 px-4 py-4 space-y-2">
          {linkKeys.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-slate-400 hover:text-accent py-1"
            >
              {t(`nav.${l.key}`)}
            </a>
          ))}
          {showLabManuals && (
            <a
              href="/manuals"
              onClick={() => setOpen(false)}
              className="block text-sm text-slate-400 hover:text-accent py-1"
            >
              Lab Manuals
            </a>
          )}
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent"
            >
              <Download className="h-3.5 w-3.5" />
              {t("nav.downloadCv")}
            </a>
          )}
        </div>
      )}
    </motion.nav>
  );
}
