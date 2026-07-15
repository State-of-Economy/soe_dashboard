import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Pagination,
  SegmentedControl,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";
import type { PlayerSummary } from "../lib/api";

type SearchMode = "citizenid" | "name";

function PlayerTable({
  players,
  onSelect,
}: {
  players: PlayerSummary[];
  onSelect: (citizenid: string) => void;
}) {
  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>CitizenID</Table.Th>
          <Table.Th>Telefon</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {players.map((p) => (
          <Table.Tr
            key={p.citizenid}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(p.citizenid)}
          >
            <Table.Td>
              {p.charinfo.firstname} {p.charinfo.lastname} ({p.name})
            </Table.Td>
            <Table.Td>{p.citizenid}</Table.Td>
            <Table.Td>{p.charinfo.phone ?? "-"}</Table.Td>
            <Table.Td>
              <Badge color={p.online ? "green" : "gray"}>
                {p.online ? "Online" : "Offline"}
              </Badge>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

const PAGE_SIZE = 25;

export function PlayerSearch() {
  const { apiClient } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<SearchMode>("name");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<{
    mode: SearchMode;
    value: string;
  } | null>(null);
  const [listPage, setListPage] = useState(1);

  const goToPlayer = (citizenid: string) => navigate(`/player/${citizenid}`);

  const {
    data: searchData,
    isFetching: searchFetching,
    error: searchError,
  } = useQuery({
    queryKey: ["players", "search", submittedQuery],
    queryFn: async () => {
      if (!apiClient || !submittedQuery) return { results: [] };
      return submittedQuery.mode === "citizenid"
        ? apiClient.searchPlayersByCitizenId(submittedQuery.value)
        : apiClient.searchPlayersByName(submittedQuery.value);
    },
    enabled: !!submittedQuery && !!apiClient,
  });

  const { data: listData, isFetching: listFetching } = useQuery({
    queryKey: ["players", "list", listPage],
    queryFn: () => apiClient!.listPlayers(listPage, PAGE_SIZE),
    enabled: !!apiClient,
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    setSubmittedQuery({ mode, value: query.trim() });
  };

  const totalPages = listData
    ? Math.max(1, Math.ceil(listData.total / PAGE_SIZE))
    : 1;

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        <Title order={3} mb="md">
          Spieler suchen
        </Title>
        <Group mb="md">
          <SegmentedControl
            value={mode}
            onChange={(v) => setMode(v as SearchMode)}
            data={[
              { label: "Name", value: "name" },
              { label: "CitizenID", value: "citizenid" },
            ]}
          />
          <TextInput
            style={{ flex: 1 }}
            placeholder={
              mode === "name" ? "Vor- oder Nachname" : "z.B. ABC12345"
            }
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            leftSection={<IconSearch size={16} />}
            onClick={handleSearch}
            loading={searchFetching}
          >
            Suchen
          </Button>
        </Group>

        {searchError && (
          <Text c="red" size="sm" mb="md">
            {searchError instanceof Error
              ? searchError.message
              : "Fehler bei der Suche"}
          </Text>
        )}

        {submittedQuery && (
          <>
            {searchData && searchData.results.length === 0 && (
              <Text c="dimmed" mb="xl">
                Keine Treffer.
              </Text>
            )}
            {searchData && searchData.results.length > 0 && (
              <div style={{ marginBottom: "var(--mantine-spacing-xl)" }}>
                <PlayerTable
                  players={searchData.results}
                  onSelect={goToPlayer}
                />
              </div>
            )}
            <Divider mb="xl" label="Alle Spieler" labelPosition="center" />
          </>
        )}

        {!submittedQuery && (
          <Title order={5} mb="sm">
            Alle Spieler
          </Title>
        )}

        {listData && listData.results.length === 0 && (
          <Text c="dimmed">Keine Spieler gefunden.</Text>
        )}

        {listData && listData.results.length > 0 && (
          <>
            <PlayerTable players={listData.results} onSelect={goToPlayer} />
            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  value={listPage}
                  onChange={setListPage}
                  total={totalPages}
                  disabled={listFetching}
                />
              </Group>
            )}
          </>
        )}
      </Container>
    </>
  );
}
