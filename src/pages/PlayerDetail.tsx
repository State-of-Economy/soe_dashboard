import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";
import { ResetSpawnModal } from "../components/ResetSpawnModal";
import { ForceParkModal } from "../components/ForceParkModal";

export function PlayerDetail() {
  const { citizenid = "" } = useParams();
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [parkTarget, setParkTarget] = useState<string | null>(null);

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
              <Text c="dimmed">Keine Fahrzeuge.</Text>
            )}
            {vehiclesQuery.data && vehiclesQuery.data.vehicles.length > 0 && (
              <Table striped>
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
      </Container>
    </>
  );
}
