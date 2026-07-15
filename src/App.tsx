import { useEffect } from "react";
import { Navigate, Route, HashRouter, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { PlayerSearch } from "./pages/PlayerSearch";
import { PlayerDetail } from "./pages/PlayerDetail";
import { Settings } from "./pages/Settings";
import { checkForUpdates } from "./lib/updater";

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
      <Routes>
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </HashRouter>
  );
}
