import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./lib/auth";
import { PublicSite } from "./pages/PublicSite";
import { PublicSiteV2 } from "./pages/PublicSiteV2";
import { supabase, SETTINGS_ID } from "./lib/supabase";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { HeroEditor } from "./pages/admin/HeroEditor";
import { SkillsManager } from "./pages/admin/SkillsManager";
import { ExperienceManager } from "./pages/admin/ExperienceManager";
import { EducationManager } from "./pages/admin/EducationManager";
import { ProjectsManager } from "./pages/admin/ProjectsManager";
import { MessagesManager } from "./pages/admin/MessagesManager";
import { SettingsManager } from "./pages/admin/SettingsManager";
import { AdminsManager } from "./pages/admin/AdminsManager";
import { InfraProjectsManager } from "./pages/admin/InfraProjectsManager";
import { CTFArticlesManager } from "./pages/admin/CTFArticlesManager";
import { CheatSheetsManager } from "./pages/admin/CheatSheetsManager";
import { LabManualsManager } from "./pages/admin/LabManualsManager";
import { QuizzesManager } from "./pages/admin/QuizzesManager";
import { LabManualsV2 } from "./components/public/LabManualsV2";
import { ManualReaderV2 } from "./components/public/ManualReaderV2";
import { QuizzesV2 } from "./components/public/QuizzesV2";
import { QuizRunnerV2 } from "./components/public/QuizRunnerV2";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-accent animate-pulse">authenticating...</div>;
  if (!session) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  const [uiVersion, setUiVersion] = useState<string>("legacy");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("ui_version")
        .eq("id", SETTINGS_ID)
        .maybeSingle();
      if (data?.ui_version) setUiVersion(data.ui_version);
    })();
  }, []);

  return (
    <Routes>
      <Route path="/" element={uiVersion === "v2_scifi" ? <PublicSiteV2 /> : <PublicSite />} />
      <Route path="/manuals" element={uiVersion === "v2_scifi" ? <LabManualsV2 /> : <PublicSite />} />
      <Route path="/manuals/:slug" element={uiVersion === "v2_scifi" ? <ManualReaderV2 /> : <PublicSite />} />
      <Route path="/quizzes" element={uiVersion === "v2_scifi" ? <QuizzesV2 /> : <PublicSite />} />
      <Route path="/quizzes/:id" element={uiVersion === "v2_scifi" ? <QuizRunnerV2 /> : <PublicSite />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/hero" replace />} />
      <Route
        path="/admin/hero"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <HeroEditor />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <SkillsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/experience"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ExperienceManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/education"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <EducationManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ProjectsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <MessagesManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <SettingsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/infra"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <InfraProjectsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/admins"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ctf"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CTFArticlesManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cheatsheets"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CheatSheetsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lab-manuals"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LabManualsManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <QuizzesManager />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
