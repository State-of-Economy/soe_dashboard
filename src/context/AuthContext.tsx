import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { ApiClient, type DiscordUser, type Tier } from "../lib/api";
import { useServerConfig } from "./ServerConfigContext";

interface Session {
  token: string;
  tier: Tier;
  discordUser: DiscordUser;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
  apiClient: ApiClient | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { serverUrl, loading: serverConfigLoading } = useServerConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serverConfigLoading) return;

    (async () => {
      if (!serverUrl) {
        setLoading(false);
        return;
      }

      const token = await invoke<string | null>("get_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const client = new ApiClient(serverUrl, token);
        const me = await client.authMe();
        setSession({ token, tier: me.tier, discordUser: me.discordUser });
      } catch {
        await invoke("clear_token");
      } finally {
        setLoading(false);
      }
    })();
  }, [serverUrl, serverConfigLoading]);

  const login = async (newSession: Session) => {
    await invoke("store_token", { token: newSession.token });
    setSession(newSession);
  };

  const logout = async () => {
    if (session && serverUrl) {
      try {
        await new ApiClient(serverUrl, session.token).authLogout();
      } catch {
        // Server evtl. nicht erreichbar - lokal trotzdem ausloggen
      }
    }
    await invoke("clear_token");
    setSession(null);
  };

  const apiClient =
    session && serverUrl ? new ApiClient(serverUrl, session.token) : null;

  return (
    <AuthContext.Provider
      value={{ session, loading, login, logout, apiClient }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
  }
  return ctx;
}
