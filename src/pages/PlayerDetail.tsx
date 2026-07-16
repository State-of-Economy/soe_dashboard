import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";
import { ResetSpawnModal } from "../components/ResetSpawnModal";
import { ForceParkModal } from "../components/ForceParkModal";
import { DeleteItemModal } from "../components/DeleteItemModal";
import { KickModal } from "../components/KickModal";
import { BanModal } from "../components/BanModal";
import type { InventoryItem, NoteType } from "../lib/api";

export function PlayerDetail() {
  const { citizenid = "" } = useParams();
  const { apiClient, session } = useAuth();
  const queryClient = useQueryClient();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [parkTarget, setParkTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [noteType, setNoteType] = useState<NoteType>("note");
  const [noteText, setNoteText] = useState("");
  const [kickModalOpen, setKickModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);

  const playerQuery = useQuery({
    queryKey: ["player", citizenid],
    queryFn: () => apiClient!.getPlayer(citizenid),
    enabled: !!apiClient,
  });

  const vehiclesQuery = useQuery({
    queryKey: ["player", citizenid, "vehicles"],
    queryFn: () => apiClient!.getPlayerVehicles(citizenid),
    enabled: !!apiClient,
  });

  const inventoryQuery = useQuery({
    queryKey: ["player", citizenid, "inventory"],
    queryFn: () => apiClient!.getPlayerInventory(citizenid),
    enabled: !!apiClient,
  });

  const notesQuery = useQuery({
    queryKey: ["player", citizenid, "notes"],
    queryFn: () => apiClient!.getPlayerNotes(citizenid),
    enabled: !!apiClient,
  });

  const resetSpawnMutation = useMutation({
    mutationFn: () => apiClient!.resetSpawn(citizenid),
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Spawn-Punkt wurde zurückgesetzt.",
      });
      setResetModalOpen(false);
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const forceParkMutation = useMutation({
    mutationFn: (plate: string) => apiClient!.forcePark(plate),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Fahrzeug eingeparkt." });
      setParkTarget(null);
      queryClient.invalidateQueries({
        queryKey: ["player", citizenid, "vehicles"],
      });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (slot: number) => apiClient!.deleteInventoryItem(citizenid, slot),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Item gelöscht." });
      setDeleteTarget(null);
      queryClient.invalidateQueries({
        queryKey: ["player", citizenid, "inventory"],
      });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const kickMutation = useMutation({
    mutationFn: ({ reason, evidenceLink }: { reason: string; evidenceLink: string }) =>
      apiClient!.kickPlayer(citizenid, reason, evidenceLink),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Spieler gekickt." });
      setKickModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["player", citizenid] });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const banMutation = useMutation({
    mutationFn: ({
      reason,
      evidenceLink,
      durationHours,
    }: {
      reason: string;
      evidenceLink: string;
      durationHours: number | null;
    }) => apiClient!.banPlayer(citizenid, reason, evidenceLink, durationHours),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Spieler gebannt." });
      setBanModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["player", citizenid] });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: () => apiClient!.addPlayerNote(citizenid, noteType, noteText),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Eintrag gespeichert." });
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["player", citizenid, "notes"] });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => apiClient!.deletePlayerNote(citizenid, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player", citizenid, "notes"] });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const player = playerQuery.data;

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        {playerQuery.isLoading && <Text>Lade...</Text>}
        {playerQuery.error && (
          <Text c="red">Spieler nicht gefunden.</Text>
        )}

        {player && (
          <>
            <Group justify="space-between" mb="md">
              <div>
                <Title order={3}>
                  {player.charinfo.firstname} {player.charinfo.lastname}
                </Title>
                <Text c="dimmed" size="sm">
                  {player.citizenid} &middot; {player.name}
                </Text>
              </div>
              <Group>
                <Badge color={player.online ? "green" : "gray"}>
                  {player.online ? "Online" : "Offline"}
                </Badge>
                <Button
                  color="orange"
                  variant="light"
                  onClick={() => setResetModalOpen(true)}
                >
                  Spawn-Punkt zurücksetzen
                </Button>
                <Button
                  color="orange"
                  variant="light"
                  disabled={!player.online}
                  onClick={() => setKickModalOpen(true)}
                >
                  Kicken
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => setBanModalOpen(true)}
                >
                  Bannen
                </Button>
              </Group>
            </Group>

            <SimpleGrid cols={3} mb="xl">
              <Card withBorder padding="md">
                <Text size="xs" c="dimmed" tt="uppercase">
                  Bargeld
                </Text>
                <Text size="xl" fw={700}>
                  ${player.money.cash ?? 0}
                </Text>
              </Card>
              <Card withBorder padding="md">
                <Text size="xs" c="dimmed" tt="uppercase">
                  Bank
                </Text>
                <Text size="xl" fw={700}>
                  ${player.money.bank ?? 0}
                </Text>
              </Card>
              <Card withBorder padding="md">
                <Text size="xs" c="dimmed" tt="uppercase">
                  Telefon
                </Text>
                <Text size="xl" fw={700}>
                  {player.charinfo.phone ?? "-"}
                </Text>
              </Card>
            </SimpleGrid>

            <Title order={4} mb="sm">
              Fahrzeuge
            </Title>
            {vehiclesQuery.data && vehiclesQuery.data.vehicles.length === 0 && (
              <Text c="dimmed" mb="xl">
                Keine Fahrzeuge.
              </Text>
            )}
            {vehiclesQuery.data && vehiclesQuery.data.vehicles.length > 0 && (
              <Table striped mb="xl">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fahrzeug</Table.Th>
                    <Table.Th>Kennzeichen</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {vehiclesQuery.data.vehicles.map((v) => (
                    <Table.Tr key={v.plate}>
                      <Table.Td>{v.vehicle}</Table.Td>
                      <Table.Td>{v.plate}</Table.Td>
                      <Table.Td>
                        <Badge color={v.state === 1 ? "gray" : "green"}>
                          {v.state === 1 ? "Geparkt" : "Draussen"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          variant="light"
                          color="orange"
                          disabled={v.state === 1}
                          onClick={() => setParkTarget(v.plate)}
                        >
                          Einparken
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}

            <Title order={4} mb="sm">
              Inventar
            </Title>
            {inventoryQuery.isLoading && <Text c="dimmed">Lade Inventar...</Text>}
            {inventoryQuery.data && inventoryQuery.data.items.length === 0 && (
              <Text c="dimmed">Inventar ist leer.</Text>
            )}
            {inventoryQuery.data && inventoryQuery.data.items.length > 0 && (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Anzahl</Table.Th>
                    <Table.Th>Slot</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {inventoryQuery.data.items.map((item) => (
                    <Table.Tr key={item.slot}>
                      <Table.Td>{item.label}</Table.Td>
                      <Table.Td>{item.count}</Table.Td>
                      <Table.Td>{item.slot}</Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}

            <Title order={4} mb="sm">
              Notizen &amp; Verwarnungen
            </Title>
            <Stack gap="xs" mb="md">
              <Group align="flex-end">
                <Select
                  label="Typ"
                  value={noteType}
                  onChange={(v) => setNoteType((v as NoteType) ?? "note")}
                  data={[
                    { value: "note", label: "Notiz" },
                    { value: "warning", label: "Verwarnung" },
                  ]}
                  w={160}
                />
                <Textarea
                  label="Eintrag"
                  placeholder="z.B. Grund, Kontext, Beweis-Link..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.currentTarget.value)}
                  style={{ flex: 1 }}
                  autosize
                  minRows={1}
                />
                <Button
                  onClick={() => addNoteMutation.mutate()}
                  loading={addNoteMutation.isPending}
                  disabled={!noteText.trim()}
                >
                  Eintragen
                </Button>
              </Group>
            </Stack>

            {notesQuery.data && notesQuery.data.notes.length === 0 && (
              <Text c="dimmed">Noch keine Einträge.</Text>
            )}
            {notesQuery.data && notesQuery.data.notes.length > 0 && (
              <Stack gap="xs">
                {notesQuery.data.notes.map((note) => (
                  <Card key={note.id} withBorder padding="sm">
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Group gap="xs" mb={4}>
                          <Badge color={note.type === "warning" ? "red" : "blue"}>
                            {note.type === "warning" ? "Verwarnung" : "Notiz"}
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {note.createdByTag} &middot;{" "}
                            {new Date(note.createdAt).toLocaleString("de-DE")}
                          </Text>
                        </Group>
                        <Text size="sm">{note.text}</Text>
                      </div>
                      {session?.tier === "owner" && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        )}

        <ResetSpawnModal
          opened={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          onConfirm={() => resetSpawnMutation.mutate()}
          loading={resetSpawnMutation.isPending}
          playerName={
            player
              ? `${player.charinfo.firstname ?? ""} ${player.charinfo.lastname ?? ""}`.trim() ||
                player.name
              : ""
          }
        />
        <ForceParkModal
          opened={!!parkTarget}
          onClose={() => setParkTarget(null)}
          onConfirm={() => parkTarget && forceParkMutation.mutate(parkTarget)}
          loading={forceParkMutation.isPending}
          plate={parkTarget ?? ""}
        />
        <DeleteItemModal
          opened={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deleteItemMutation.mutate(deleteTarget.slot)}
          loading={deleteItemMutation.isPending}
          itemLabel={deleteTarget?.label ?? ""}
          count={deleteTarget?.count ?? 0}
        />
        <KickModal
          opened={kickModalOpen}
          onClose={() => setKickModalOpen(false)}
          onConfirm={(reason, evidenceLink) =>
            kickMutation.mutate({ reason, evidenceLink })
          }
          loading={kickMutation.isPending}
          playerName={
            player
              ? `${player.charinfo.firstname ?? ""} ${player.charinfo.lastname ?? ""}`.trim() ||
                player.name
              : ""
          }
        />
        <BanModal
          opened={banModalOpen}
          onClose={() => setBanModalOpen(false)}
          onConfirm={(reason, evidenceLink, durationHours) =>
            banMutation.mutate({ reason, evidenceLink, durationHours })
          }
          loading={banMutation.isPending}
          playerName={
            player
              ? `${player.charinfo.firstname ?? ""} ${player.charinfo.lastname ?? ""}`.trim() ||
                player.name
              : ""
          }
        />
      </Container>
    </>
  );
}
