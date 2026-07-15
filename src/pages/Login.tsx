import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconBrandDiscord, IconAlertCircle } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useServerConfig } from "../context/ServerConfigContext";
import { useAuth } from "../context/AuthContext";
import { ApiClient } from "../lib/api";

export function Login() {
  const { serverUrl, discordClientId, setConfig, loading } =
    useServerConfig();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [urlInput, setUrlInput] = useState(serverUrl ?? "");
  const [clientIdInput, setClientIdInput] = useState(discordClientId ?? "");
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  if (loading) return null;

  const needsSetup = !serverUrl || !discordClientId;

  const handleSaveConfig = async () => {
    setTestError(null);
    setTesting(true);
    try {
      const normalized = urlInput.trim().replace(/\/+$/, "");
      await new ApiClient(normalized, null).health();
      await setConfig(normalized, clientIdInput);
    } catch (err) {
      setTestError(
        err instanceof Error
          ? `Server nicht erreichbar unter dieser URL: ${err.message}`
          : "Server nicht erreichbar unter dieser URL.",
      );
    } finally {
      setTesting(false);
    }
  };

  const handleDiscordLogin = async () => {
    if (!serverUrl || !discordClientId) return;
    setLoginError(null);
    setLoggingIn(true);

    try {
      const redirectUri = await invoke<string>("get_redirect_uri");
      const authUrl = new URL("https://discord.com/api/oauth2/authorize");
      authUrl.searchParams.set("client_id", discordClientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "identify");

      const codePromise = invoke<string>("wait_for_oauth_callback");
      await openUrl(authUrl.toString());
      const code = await codePromise;

      const exchange = await new ApiClient(serverUrl, null).authExchange(
        code,
        redirectUri,
      );

      await login({
        token: exchange.token,
        tier: exchange.tier,
        discordUser: exchange.discordUser,
      });

      navigate("/search", { replace: true });
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Login fehlgeschlagen.",
      );
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper withBorder shadow="md" p="xl" radius="md" w={420}>
        <Stack gap="md">
          <div>
            <Title order={2}>SoE Supporter Dashboard</Title>
            <Text c="dimmed" size="sm">
              {needsSetup
                ? "Einmalige Einrichtung"
                : "Mit Discord anmelden, um fortzufahren"}
            </Text>
          </div>

          {needsSetup ? (
            <Stack gap="sm">
              <TextInput
                label="Server-URL"
                description="Basis-URL der soe_supportdesk-API, z.B. http://dein-server:30120/soe_supportdesk/api"
                placeholder="http://127.0.0.1:30120/soe_supportdesk/api"
                value={urlInput}
                onChange={(e) => setUrlInput(e.currentTarget.value)}
              />
              <TextInput
                label="Discord Client-ID"
                description="Aus dem Discord Developer Portal (OAuth2 -> General)"
                placeholder="123456789012345678"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.currentTarget.value)}
              />
              {testError && (
                <Alert
                  color="red"
                  icon={<IconAlertCircle size={16} />}
                  title="Fehler"
                >
                  {testError}
                </Alert>
              )}
              <Button
                onClick={handleSaveConfig}
                loading={testing}
                disabled={!urlInput.trim() || !clientIdInput.trim()}
              >
                Verbindung testen & speichern
              </Button>
            </Stack>
          ) : (
            <Stack gap="sm">
              {loginError && (
                <Alert
                  color="red"
                  icon={<IconAlertCircle size={16} />}
                  title="Login fehlgeschlagen"
                >
                  {loginError}
                </Alert>
              )}
              <Button
                leftSection={<IconBrandDiscord size={18} />}
                onClick={handleDiscordLogin}
                loading={loggingIn}
                color="indigo"
              >
                Mit Discord anmelden
              </Button>
              <Divider label="oder" labelPosition="center" />
              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  setUrlInput(serverUrl ?? "");
                  setClientIdInput(discordClientId ?? "");
                  setConfig("", "");
                }}
              >
                Server-Einstellungen ändern
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
