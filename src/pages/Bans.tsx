import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Container,
  Group,
  Pagination,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconLockOpen } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";

const PAGE_SIZE = 50;
const PERMANENT_EXPIRE = 2147483647;

export function Bans() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["bans", page],
    queryFn: () => apiClient!.getBans(page, PAGE_SIZE),
    enabled: !!apiClient,
  });

  const unbanMutation = useMutation({
    mutationFn: (id: number) => apiClient!.unban(id),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Bann aufgehoben." });
      queryClient.invalidateQueries({ queryKey: ["bans"] });
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        message: err instanceof Error ? err.message : "Fehlgeschlagen",
      });
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        <Title order={3} mb="md">
          Aktive Bans
        </Title>

        {data && data.bans.length === 0 && (
          <Text c="dimmed">Keine aktiven Bans.</Text>
        )}

        {data && data.bans.length > 0 && (
          <>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Grund</Table.Th>
                  <Table.Th>Bis</Table.Th>
                  <Table.Th>Von</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.bans.map((ban) => (
                  <Table.Tr key={ban.id}>
                    <Table.Td>{ban.name}</Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2}>
                        {ban.reason}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {ban.expire === PERMANENT_EXPIRE
                        ? "Permanent"
                        : new Date(ban.expire * 1000).toLocaleString("de-DE")}
                    </Table.Td>
                    <Table.Td>{ban.bannedby}</Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="light"
                        color="green"
                        size="sm"
                        onClick={() => unbanMutation.mutate(ban.id)}
                        loading={
                          unbanMutation.isPending &&
                          unbanMutation.variables === ban.id
                        }
                      >
                        <IconLockOpen size={14} />
                      </ActionIcon>
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
