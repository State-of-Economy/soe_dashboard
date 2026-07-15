export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

// Bei jedem Release hier oben einen neuen Eintrag ergänzen (Version muss zu
// src-tauri/tauri.conf.json + src-tauri/Cargo.toml + package.json passen).
export const changelog: ChangelogEntry[] = [
  {
    version: "0.1.3",
    date: "2026-07-15",
    notes: [
      "Alle Spieler-Liste (online zuerst) unter der Suche, seitenweise durchblätterbar",
      "Spieler-Inventar auf der Detailseite sichtbar, Items können direkt gelöscht werden",
      "Discord-Log-Kanal: jede Supporter-Aktion (Spawn-Reset, Einparken, Item löschen, Einstellungsänderung) wird zusätzlich in einen konfigurierbaren Discord-Kanal gepostet (Einstellungen, Owner)",
    ],
  },
  {
    version: "0.1.2",
    date: "2026-07-15",
    notes: [
      "Neue Startseite mit Kurzanleitung und Patch Notes (dieser Screen hier)",
      "Eigene, ins App-Design passende Titelleiste statt der grauen Windows-Standardleiste",
      "Updates werden beim Start jetzt automatisch geladen und installiert (kein Klick mehr nötig)",
    ],
  },
  {
    version: "0.1.1",
    date: "2026-07-15",
    notes: [
      "Fix: Login blieb nach Neustart der App nicht gespeichert (Windows Credential Manager wurde nicht korrekt genutzt)",
      "SoE-Logo als App-Icon, im Login-Screen und im Header",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-07-15",
    notes: [
      "Erste Version: Discord-Login mit Rollen-Rechten, Spieler-Suche (Name/CitizenID), Spieler-Details, Reset-Spawn, Fahrzeug-Einparken, Einstellungen (Owner)",
    ],
  },
];
