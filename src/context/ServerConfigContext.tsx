import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { load, type Store } from "@tauri-apps/plugin-store";

interface ServerConfigContextValue {
  serverUrl: string | null;
  discordClientId: string | null;
  setConfig: (serverUrl: string, discordClientId: string) => Promise<void>;
  loading: boolean;
}

const ServerConfigContext = createContext<ServerConfigContextValue | null>(
  null,
);

let storePromise: Promise<Store> | null = null;
function getStore() {
  if (!storePromise) storePromise = load("config.json");
  return storePromise;
}

function normalizeUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export function ServerConfigProvider({ children }: { children: ReactNode }) {
  const [serverUrl, setServerUrlState] = useState<string | null>(null);
  const [discordClientId, setDiscordClientIdState] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const store = await getStore();
      const savedUrl = await store.get<string>("serverUrl");
      const savedClientId = await store.get<string>("discordClientId");
      setServerUrlState(savedUrl ?? null);
      setDiscordClientIdState(savedClientId ?? null);
      setLoading(false);
    })();
  }, []);

  const setConfig = async (url: string, clientId: string) => {
    const normalized = normalizeUrl(url);
    const trimmedClientId = clientId.trim();
    const store = await getStore();
    await store.set("serverUrl", normalized);
    await store.set("discordClientId", trimmedClientId);
    await store.save();
    setServerUrlState(normalized);
    setDiscordClientIdState(trimmedClientId);
  };

  return (
    <ServerConfigContext.Provider
      value={{ serverUrl, discordClientId, setConfig, loading }}
    >
      {children}
    </ServerConfigContext.Provider>
  );
}

export function useServerConfig() {
  const ctx = useContext(ServerConfigContext);
  if (!ctx) {
    throw new Error(
      "useServerConfig muss innerhalb von ServerConfigProvider verwendet werden",
    );
  }
  return ctx;
}
