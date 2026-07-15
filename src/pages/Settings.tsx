import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";
import type { RoleMapping, SpawnTarget, Tier } from "../lib/api";

export function Settings() {
  const { apiClient, session } = useAuth();
  const queryClient = useQueryClient();

  const spawnTargetQuery = useQuery({
    queryKey: ["settings", "spawn-target"],
    queryFn: () => apiClient!.getSpawnTarget(),
    enabled: !!apiClient,
  });

  const rolesQuery = useQuery({
    queryKey: ["settings", "roles"],
    queryFn: () => apiClient!.getRoles(),
    enabled: !!apiClient,
  });

  const [target, setTarget] = useState<SpawnTarget>({ x: 0, y: 0, z: 72, w: 0 });
  const [roles, setRoles] = useState<RoleMapping[]>([]);

  useEffect(() => {
    if (spawnTargetQuery.data) setTarget(spawnTargetQuery.data);
  }, [spawnTargetQuery.data]);

  useEffect(() => {
    if (rolesQuery.data) setRoles(rolesQuery.data.roles);
  }, [rolesQuery.data]);

  const saveTargetMutation = useMutation({
    mutationFn: () => apiClient!.updateSpawnTarget(target),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Spawn-Ziel gespeichert." });
      queryClient.invalidateQueries({ queryKey: ["settings", "spawn-target"] });
    },
    onError: (err) =>
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      }),
  });

  const saveRolesMutation = useMutation({
    mutationFn: () => apiClient!.updateRoles(roles),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Rollen gespeichert." });
      queryClient.invalidateQueries({ queryKey: ["settings", "roles"] });
    },
    onError: (err) =>
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      }),
  });

  if (session && session.tier !== "owner") {
    return <Navigate to="/search" replace />;
  }

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        <Title order={3} mb="md">
          Einstellungen
        </Title>

        <Title order={5} mb="sm">
          Spawn-Reset-Ziel
        </Title>
        <Group mb="xl">
          <NumberInput
            label="X"
            value={target.x}
            onChange={(v) => setTarget({ ...target, x: Number(v) || 0 })}
            decimalScale={2}
          />
          <NumberInput
            label="Y"
            value={target.y}
            onChange={(v) => setTarget({ ...target, y: Number(v) || 0 })}
            decimalScale={2}
          />
          <NumberInput
            label="Z"
            value={target.z}
            onChange={(v) => setTarget({ ...target, z: Number(v) || 0 })}
            decimalScale={2}
          />
          <NumberInput
            label="Heading"
            value={target.w}
            onChange={(v) => setTarget({ ...target, w: Number(v) || 0 })}
            decimalScale={2}
          />
          <Button
            onClick={() => saveTargetMutation.mutate()}
            loading={saveTargetMutation.isPending}
            mt={24}
          >
            Speichern
          </Button>
        </Group>

        <Title order={5} mb="sm">
          Discord-Rollen-Rechte
        </Title>
        <Text size="sm" c="dimmed" mb="sm">
          Der Discord-Server-Owner hat immer Owner-Rechte, unabhängig von dieser Liste.
        </Text>
        <Table mb="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Discord-Rollen-ID</Table.Th>
              <Table.Th>Label</Table.Th>
              <Table.Th>Rechte</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {roles.map((role, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  <TextInput
                    value={role.discordRoleId}
                    onChange={(e) => {
                      const next = [...roles];
                      next[idx] = { ...role, discordRoleId: e.currentTarget.value };
                      setRoles(next);
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={role.label ?? ""}
                    onChange={(e) => {
                      const next = [...roles];
                      next[idx] = { ...role, label: e.currentTarget.value };
                      setRoles(next);
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Select
                    value={role.tier}
                    data={[
                      { value: "supporter", label: "Supporter" },
                      { value: "owner", label: "Owner" },
                    ]}
                    onChange={(v) => {
                      const next = [...roles];
                      next[idx] = { ...role, tier: (v as Tier) ?? "supporter" };
                      setRoles(next);
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => setRoles(roles.filter((_, i) => i !== idx))}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Stack gap="sm">
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() =>
              setRoles([...roles, { discordRoleId: "", tier: "supporter", label: "" }])
            }
          >
            Rolle hinzufügen
          </Button>
          <Button
            onClick={() => saveRolesMutation.mutate()}
            loading={saveRolesMutation.isPending}
          >
            Rollen speichern
          </Button>
        </Stack>
      </Container>
    </>
  );
}
