import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePortfolioData } from "../lib/usePortfolioData";
import { applyAccent } from "../lib/utils";
import { Navbar } from "../components/public/Navbar";
import { HeroV2 } from "../components/public/HeroV2";
import { ExperienceV2 } from "../components/public/ExperienceV2";
import { SkillsV2 } from "../components/public/SkillsV2";
import { ProjectsV2 } from "../components/public/ProjectsV2";
import { ContactSection } from "../components/public/Contact";
import { Footer } from "../components/public/Footer";
import { MatrixRain } from "../components/isolated/MatrixRain";
import { VisitorTracker } from "../components/isolated/VisitorTracker";
import { InfraProjectsGrid } from "../components/isolated/InfraProjectsGrid";
import { CTFArticlesSection } from "../components/public/CTFArticlesSection";
import { CheatSheetsSection } from "../components/public/CheatSheetsSection";
import { LabManualsV2 } from "../components/public/LabManualsV2";
import { QuizzesV2 } from "../components/public/QuizzesV2";

const HUD_BG = "#050B14";

export function PublicSiteV2() {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: HUD_BG }}>
        <div className="font-mono text-accent animate-pulse">{t("site.booting")}</div>
      </div>
    );
  }

  if (settings?.maintenance_mode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: HUD_BG }}>
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: HUD_BG }}>
        <div className="text-center">
          <p className="text-slate-500 font-mono">{t("site.noProfile")}</p>
        </div>
      </div>
    );
  }

  const logoText = `<${profile.name.replace(/\s/g, "")} />`;
  const matrixEnabled = Boolean(settings?.matrix_enabled);

  return (
    <div className="min-h-screen relative" style={{ background: HUD_BG }}>
      <VisitorTracker />
      {matrixEnabled && <MatrixRain brightness={settings?.matrix_brightness ?? 100} />}
      <div className="relative z-0">
        <Navbar logo={logoText} cvUrl={profile.cv_url || settings?.resume_url || ""} showLabManuals showQuizzes />
        <HeroV2 profile={profile} settings={settings} />
        <ExperienceV2
          experiences={experiences}
          education={education}
          certifications={certifications}
        />
        <SkillsV2 skills={skills} />
        <ProjectsV2 projects={projects} />

        {/* Real-world infrastructure projects */}
        <InfraProjectsGrid />

        {/* CTF writeups & security notes */}
        <CTFArticlesSection />

        {/* Knowledge base & cheat sheets */}
        <CheatSheetsSection />

        {/* Lab manuals & tutorials */}
        <LabManualsV2 />

        {/* Skill quizzes */}
        <QuizzesV2 />

        <ContactSection email={profile.email} />
        <Footer logo={logoText} />
      </div>
    </div>
  );
}
