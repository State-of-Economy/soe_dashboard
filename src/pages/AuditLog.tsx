import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Container,
  Group,
  Pagination,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";

const PAGE_SIZE = 50;

const ACTION_LABELS: Record<string, string> = {
  reset_spawn: "Spawn-Reset",
  force_park: "Fahrzeug eingeparkt",
  settings_update: "Einstellung geändert",
  inventory_item_delete: "Item gelöscht",
  player_note_add: "Notiz/Verwarnung",
  player_note_delete: "Notiz/Verwarnung gelöscht",
};

export function AuditLog() {
  const { apiClient, session } = useAuth();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["audit-log", page],
    queryFn: () => apiClient!.getAuditLog(page, PAGE_SIZE),
    enabled: !!apiClient,
  });

  if (session && session.tier !== "owner") {
    return <Navigate to="/search" replace />;
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        <Title order={3} mb="md">
          Aktions-Log
        </Title>

        {data && data.entries.length === 0 && (
          <Text c="dimmed">Noch keine Einträge.</Text>
        )}

        {data && data.entries.length > 0 && (
          <>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Zeit</Table.Th>
                  <Table.Th>Supporter</Table.Th>
                  <Table.Th>Aktion</Table.Th>
                  <Table.Th>Ziel</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.entries.map((entry) => (
                  <Table.Tr key={entry.id}>
                    <Table.Td>
                      <Text size="sm">
                        {new Date(entry.createdAt).toLocaleString("de-DE")}
                      </Text>
                    </Table.Td>
                    <Table.Td>{entry.actorTag}</Table.Td>
                    <Table.Td>
                      <Badge variant="light">
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {entry.targetCitizenid ?? entry.targetPlate ?? "-"}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination value={page} onChange={setPage} total={totalPages} />
              </Group>
            )}
          </>
        )}
      </Container>
    </>
  );
}
