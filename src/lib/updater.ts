import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { notifications } from "@mantine/notifications";

// Vollautomatisch: beim Start prüfen, bei verfügbarem Update sofort laden+installieren+neustarten,
// ohne dass ein Klick nötig ist. Fürs interne Support-Team reicht ein kurzer Status-Hinweis.
export async function checkForUpdates() {
  try {
    const update = await check();
    if (!update) return;

    notifications.show({
      id: "update-installing",
      title: `Update ${update.version} wird installiert`,
      message: "Die App startet danach automatisch neu.",
      loading: true,
      autoClose: false,
      color: "blue",
    });

    await update.downloadAndInstall();
    await relaunch();
  } catch {
    // Kein Update-Server erreichbar o.ä. - kein Blocker für die App
  }
}
