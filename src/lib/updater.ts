import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { notifications } from "@mantine/notifications";

export async function checkForUpdates() {
  try {
    const update = await check();
    if (!update) return;

    notifications.show({
      id: "update-available",
      title: `Update ${update.version} verfügbar`,
      message: "Klick zum Installieren, App startet danach neu.",
      autoClose: false,
      color: "blue",
      onClick: async () => {
        notifications.update({
          id: "update-available",
          title: "Update wird installiert...",
          message: "Bitte warten.",
          loading: true,
          autoClose: false,
        });
        await update.downloadAndInstall();
        await relaunch();
      },
    });
  } catch {
    // Kein Update-Server erreichbar o.ä. - still, kein Blocker für die App
  }
}
