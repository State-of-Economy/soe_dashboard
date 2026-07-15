import { useEffect } from "react";
import { Navigate, Route, HashRouter, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { PlayerSearch } from "./pages/PlayerSearch";
import { PlayerDetail } from "./pages/PlayerDetail";
import { Settings } from "./pages/Settings";
import { AuditLog } from "./pages/AuditLog";
import { checkForUpdates } from "./lib/updater";
import { TitleBar } from "./components/TitleBar";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  return (
    <HashRouter>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <TitleBar />
        <div style={{ flex: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/search"
              element={
                <RequireAuth>
                  <PlayerSearch />
                </RequireAuth>
              }
            />
            <Route
              path="/player/:citizenid"
              element={
                <RequireAuth>
                  <PlayerDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/audit-log"
              element={
                <RequireAuth>
                  <AuditLog />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}
