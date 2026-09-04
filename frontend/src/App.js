import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Footer from "./components/Footer/Footer";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Projects from "./pages/Projects/Projects";
import Workflow from "./pages/Workflow/Workflow";
import Tasks from "./pages/Tasks/Tasks";
import Bugs from "./pages/Bugs/Bugs";
import Users from "./pages/Users/Users";
import KnowledgeBase from "./pages/KnowledgeBase/KnowledgeBase";
import Reports from "./pages/Reports/Reports";
import ActivityLogs from "./pages/ActivityLogs/ActivityLogs";
import AISprintAssistant from "./pages/AISprintAssistant/AISprintAssistant";
import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import { SettingsProvider } from "./context/SettingsContext";

import "./App.css";

const isAuthenticated = () =>
  !!localStorage.getItem("flowguard-access-token");

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="main-panel">
        <Navbar onMenuClick={() => setSidebarOpen((open) => !open)} />

        <main className="content-area">
          <div key={location.pathname} className="page-enter min-h-full">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

const App = () => {
  const [authState, setAuthState] = useState(isAuthenticated());

  useEffect(() => {
    const syncAuth = () => {
      setAuthState(isAuthenticated());
    };

    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleLogin = () => {
    setAuthState(true);
  };

  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>

          {/* LOGIN */}
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* PROJECTS */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* WORKFLOW */}
          <Route
            path="/workflow"
            element={
              <ProtectedRoute>
                <Layout>
                  <Workflow />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* TASKS */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* BUGS */}
          <Route
            path="/bugs"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bugs />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* USERS */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* KNOWLEDGE BASE */}
          <Route
            path="/knowledge-base"
            element={
              <ProtectedRoute>
                <Layout>
                  <KnowledgeBase />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ACTIVITY LOGS */}
          <Route
            path="/activity-logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityLogs />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* AI SPRINT ASSISTANT */}
          <Route
            path="/ai-sprint-assistant"
            element={
              <ProtectedRoute>
                <Layout>
                  <AISprintAssistant />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ROOT */}
          <Route
            path="/"
            element={
              <Navigate
                to={authState ? "/dashboard" : "/login"}
                replace
              />
            }
          />

          {/* UNKNOWN URL */}
          <Route
            path="*"
            element={
              <Navigate
                to={authState ? "/dashboard" : "/login"}
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;