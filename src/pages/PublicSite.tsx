import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePortfolioData } from "../lib/usePortfolioData";
import { applyAccent } from "../lib/utils";
import { Navbar } from "../components/public/Navbar";
import { Hero } from "../components/public/Hero";
import { ExperienceSection } from "../components/public/Experience";
import { SkillsSection } from "../components/public/Skills";
import { ProjectsSection } from "../components/public/Projects";
import { TerminalWidget } from "../components/public/Terminal";
import { ContactSection } from "../components/public/Contact";
import { Footer } from "../components/public/Footer";
import { MatrixRain } from "../components/isolated/MatrixRain";
import { VisitorTracker } from "../components/isolated/VisitorTracker";
import { InteractiveTerminal } from "../components/isolated/InteractiveTerminal";
import { InfraProjectsGrid } from "../components/isolated/InfraProjectsGrid";
import { CTFArticlesSection } from "../components/public/CTFArticlesSection";
import { CheatSheetsSection } from "../components/public/CheatSheetsSection";

export function PublicSite() {
  const { t } = useTranslation();
  const { profile, experiences, education, certifications, skills, projects, settings, loading } =
    usePortfolioData();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (settings?.accent_color) applyAccent(settings.accent_color);
  }, [settings?.accent_color]);

  useEffect(() => {
    if (settings?.seo_title) document.title = settings.seo_title;
  }, [settings?.seo_title]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-accent animate-pulse">{t("site.booting")}</div>
      </div>
    );
  }

  if (settings?.maintenance_mode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-mono text-2xl text-accent mb-2">{t("site.maintenance")}</div>
          <p className="text-slate-500">{t("site.maintenanceMsg")}</p>
          <a href="/admin" className="mt-6 inline-block text-xs text-slate-700 hover:text-accent">
            {t("footer.adminLogin")}
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-500 font-mono">{t("site.noProfile")}</p>
        </div>
      </div>
    );
  }

  const logoText = `<${profile.name.replace(/\s/g, "")} />`;
  const matrixEnabled = Boolean(settings?.matrix_enabled);

  return (
    <div className="min-h-screen relative">
      <VisitorTracker />
      {matrixEnabled && <MatrixRain brightness={settings?.matrix_brightness ?? 100} />}
      <div className="relative z-0">
        <Navbar logo={logoText} cvUrl={profile.cv_url || settings?.resume_url || ""} />
        <Hero profile={profile} />
        <ExperienceSection
          experiences={experiences}
          education={education}
          certifications={certifications}
        />
        <SkillsSection skills={skills} />
        <ProjectsSection projects={projects} />

        {/* Real-world infrastructure projects */}
        <InfraProjectsGrid />

        {/* CTF writeups & security notes */}
        <CTFArticlesSection />

        {/* Knowledge base & cheat sheets */}
        <CheatSheetsSection />

        {/* Interactive terminal */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-100">
              Interactive <span className="text-accent">Terminal</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Type a command to explore. Try <span className="font-mono text-accent">whoami</span>,{" "}
              <span className="font-mono text-accent">skills</span>, or{" "}
              <span className="font-mono text-accent">projects</span>.
            </p>
          </div>
          <InteractiveTerminal />
        </section>

        <TerminalWidget />

        <ContactSection email={profile.email} />
        <Footer logo={logoText} />
      </div>
    </div>
  );
}
