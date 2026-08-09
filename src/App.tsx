import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { PublicSite } from "./pages/PublicSite";
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-accent animate-pulse">authenticating...</div>;
  if (!session) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
