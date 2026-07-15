import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Container,
  Group,
  SegmentedControl,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { AppHeader } from "../components/AppHeader";

type SearchMode = "citizenid" | "name";

export function PlayerSearch() {
  const { apiClient } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<SearchMode>("name");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<{
    mode: SearchMode;
    value: string;
  } | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["players", "search", submittedQuery],
    queryFn: async () => {
      if (!apiClient || !submittedQuery) return { results: [] };
      return submittedQuery.mode === "citizenid"
        ? apiClient.searchPlayersByCitizenId(submittedQuery.value)
        : apiClient.searchPlayersByName(submittedQuery.value);
    },
    enabled: !!submittedQuery && !!apiClient,
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    setSubmittedQuery({ mode, value: query.trim() });
  };

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
            loading={isFetching}
          >
            Suchen
          </Button>
        </Group>

        {error && (
          <Text c="red" size="sm" mb="md">
            {error instanceof Error ? error.message : "Fehler bei der Suche"}
          </Text>
        )}

        {data && data.results.length === 0 && submittedQuery && (
          <Text c="dimmed">Keine Treffer.</Text>
        )}

        {data && data.results.length > 0 && (
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
              {data.results.map((p) => (
                <Table.Tr
                  key={p.citizenid}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/player/${p.citizenid}`)}
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
        )}
      </Container>
    </>
  );
}
