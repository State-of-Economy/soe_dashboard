import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Modal,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";

export function Emergency() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<
    "wipe-objects" | "wipe-vehicles" | null
  >(null);
  const [announceText, setAnnounceText] = useState("");

  const { data: lockdownData } = useQuery({
    queryKey: ["emergency", "lockdown"],
    queryFn: () => apiClient!.getLockdown(),
    enabled: !!apiClient,
    refetchInterval: 15000,
  });

  const lockdownMutation = useMutation({
    mutationFn: (active: boolean) => apiClient!.setLockdown(active),
    onSuccess: (data) => {
      notifications.show({
        color: data.active ? "red" : "green",
        message: data.active
          ? "Lockdown aktiviert — nur Owner können noch connecten."
          : "Lockdown deaktiviert.",
      });
      queryClient.invalidateQueries({ queryKey: ["emergency", "lockdown"] });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const wipeObjectsMutation = useMutation({
    mutationFn: () => apiClient!.wipeObjects(),
    onSuccess: (data) => {
      notifications.show({
        color: "green",
        message: `${data.count} Objekte entfernt.`,
      });
      setConfirmAction(null);
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const wipeVehiclesMutation = useMutation({
    mutationFn: () => apiClient!.wipeVehicles(),
    onSuccess: (data) => {
      notifications.show({
        color: "green",
        message: `${data.count} unbesetzte Fahrzeuge entfernt.`,
      });
      setConfirmAction(null);
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const announceMutation = useMutation({
    mutationFn: () => apiClient!.announce(announceText.trim()),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Ankündigung gesendet." });
      setAnnounceText("");
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const lockdownActive = lockdownData?.active ?? false;

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        <Title order={3} mb="md">
          Notfall
        </Title>

        <Paper withBorder p="md" radius="md" mb="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={600}>Server-Lockdown</Text>
            <Badge color={lockdownActive ? "red" : "gray"}>
              {lockdownActive ? "Aktiv" : "Inaktiv"}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            Solange aktiv, können nur Nutzer mit Owner-Rechten (Discord-Rolle) neu
            auf den Server connecten. Bereits verbundene Spieler bleiben online.
          </Text>
          <Switch
            label="Lockdown aktivieren"
            checked={lockdownActive}
            onChange={(e) => lockdownMutation.mutate(e.currentTarget.checked)}
            color="red"
            disabled={lockdownMutation.isPending}
          />
        </Paper>

        <Paper withBorder p="md" radius="md" mb="lg">
          <Text fw={600} mb="xs">
            Aufräumen
          </Text>
          <Text size="sm" c="dimmed" mb="sm">
            Entfernt herumliegende Objekte bzw. unbesetzte Fahrzeuge serverweit —
            für akute Lag-Probleme (z.B. durch Cheater gespawnte Props).
          </Text>
          <Group>
            <Button
              color="orange"
              variant="light"
              onClick={() => setConfirmAction("wipe-objects")}
            >
              Alle Objekte entfernen
            </Button>
            <Button
              color="orange"
              variant="light"
              onClick={() => setConfirmAction("wipe-vehicles")}
            >
              Unbesetzte Fahrzeuge entfernen
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text fw={600} mb="xs">
            Server-Ankündigung
          </Text>
          <Text size="sm" c="dimmed" mb="sm">
            Wird als Benachrichtigung bei allen aktuell online befindlichen
            Spielern eingeblendet.
          </Text>
          <Stack gap="sm">
            <Textarea
              placeholder="z.B. Server-Neustart in 5 Minuten wegen Skript-Update"
              value={announceText}
              onChange={(e) => setAnnounceText(e.currentTarget.value)}
              autosize
              minRows={2}
            />
            <Group justify="flex-end">
              <Button
                onClick={() => announceMutation.mutate()}
                loading={announceMutation.isPending}
                disabled={!announceText.trim()}
              >
                Senden
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Modal
          opened={confirmAction !== null}
          onClose={() => setConfirmAction(null)}
          title="Wirklich fortfahren?"
        >
          <Alert
            color="orange"
            icon={<IconAlertTriangle size={16} />}
            mb="md"
          >
            {confirmAction === "wipe-objects"
              ? "Alle Objekte auf der Karte werden unwiderruflich entfernt."
              : "Alle unbesetzten Fahrzeuge auf der Karte werden unwiderruflich entfernt (inkl. legitim geparkter Autos, die gerade draussen stehen)."}
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmAction(null)}>
              Abbrechen
            </Button>
            <Button
              color="orange"
              loading={
                wipeObjectsMutation.isPending || wipeVehiclesMutation.isPending
              }
              onClick={() =>
                confirmAction === "wipe-objects"
                  ? wipeObjectsMutation.mutate()
                  : wipeVehiclesMutation.mutate()
              }
            >
              Ja, entfernen
            </Button>
          </Group>
        </Modal>
      </Container>
    </>
  );
}
