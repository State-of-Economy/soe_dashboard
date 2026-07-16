export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

// Bei jedem Release hier oben einen neuen Eintrag ergänzen (Version muss zu
// src-tauri/tauri.conf.json + src-tauri/Cargo.toml + package.json passen).
export const changelog: ChangelogEntry[] = [
  {
    version: "0.1.8",
    date: "2026-07-16",
    notes: [
      "Neue Notfall-Seite: Server-Lockdown (nur Owner können während dessen noch connecten), alle Objekte/unbesetzten Fahrzeuge entfernen, Server-Ankündigung an alle Online-Spieler",
    ],
  },
  {
    version: "0.1.7",
    date: "2026-07-16",
    notes: [
      "Instanz-/Routing-Bucket-Reset: Spieler, die in einer falschen Instanz feststecken (z.B. nach Disconnect in einem Haus/einer Firma), lassen sich per Knopfdruck zurück auf die Standard-Instanz setzen",
    ],
  },
  {
    version: "0.1.6",
    date: "2026-07-16",
    notes: [
      "Kick & Ban: Spieler direkt aus dem Dashboard kicken oder temporär/permanent bannen (Grund + Beweis-Link sind Pflicht)",
      "Neue Bans-Seite: Übersicht aller aktiven Bans, Bann per Klick wieder aufheben",
    ],
  },
  {
    version: "0.1.5",
    date: "2026-07-15",
    notes: [
      "Notiz-/Verwarnsystem pro Spieler (jeder Supporter kann Einträge machen, Löschen nur Owner)",
      "Aktions-Log-Seite (Owner) — alle Supporter-Aktionen im Überblick, nicht nur in Discord",
      "Versionsnummer von der Startseite in die Titelleiste verschoben",
    ],
  },
  {
    version: "0.1.4",
    date: "2026-07-15",
    notes: [
      "Fix: Auto-Update funktionierte nicht, weil das GitHub-Repo privat war (Release-Downloads brauchen dann einen Login). Repo ist jetzt öffentlich (Quellcode enthält keine Geheimnisse — Discord-Zugangsdaten liegen ausschließlich serverseitig)",
    ],
  },
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
