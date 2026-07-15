import { useEffect, useState } from "react";
import {
  Accordion,
  Badge,
  Container,
  Group,
  Image,
  List,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCar,
  IconMapPin,
  IconSearch,
  IconShieldCheck,
} from "@tabler/icons-react";
import { getVersion } from "@tauri-apps/api/app";
import { AppHeader } from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { changelog } from "../data/changelog";
import soeLogo from "../assets/soe_logo.png";

export function Home() {
  const { session } = useAuth();
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <>
      <AppHeader />
      <Container size="md" py="xl">
        <Group mb="xl">
          <Image src={soeLogo} alt="SoE Logo" w={56} h={56} />
          <div>
            <Title order={2}>Willkommen, {session?.discordUser.username}</Title>
            <Text c="dimmed" size="sm">
              SoE Supporter Dashboard {version && `· v${version}`}
            </Text>
          </div>
        </Group>

        <Title order={4} mb="sm">
          Kurzanleitung
        </Title>
        <Accordion variant="separated" mb="xl">
          <Accordion.Item value="search">
            <Accordion.Control icon={<IconSearch size={18} />}>
              Spieler suchen
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                Unter <b>Suche</b> (oben) kannst du zwischen Name (Vor-/Nachname
                des Charakters) und CitizenID umschalten. Klick auf einen
                Treffer öffnet die Detailseite mit Geld, Telefon, Job und
                Fahrzeugen.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="actions">
            <Accordion.Control icon={<IconMapPin size={18} />}>
              Aktionen: Spawn-Reset & Fahrzeug einparken
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item>
                  <b>Spawn-Punkt zurücksetzen</b>: Teleportiert den Spieler
                  sofort zum festgelegten Ziel-Punkt (falls online) und
                  setzt seinen gespeicherten Spawn dauerhaft dorthin. Für
                  Spieler, die feststecken oder verloren sind.
                </List.Item>
                <List.Item>
                  <IconCar
                    size={14}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  <b>Fahrzeug einparken</b>: Entfernt ein draußen stehendes
                  Fahrzeug sicher aus der Welt und markiert es als geparkt.
                  Der Besitzer kann es danach an jeder Garage-Zone wieder
                  abholen. Geht nicht bei besetzten/fahrenden Fahrzeugen.
                </List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="roles">
            <Accordion.Control icon={<IconShieldCheck size={18} />}>
              Rollen &amp; Rechte
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                <b>Supporter</b> kann suchen, Details ansehen und die
                Aktionen ausführen. <b>Owner</b> kann zusätzlich unter{" "}
                <b>Einstellungen</b> den Spawn-Ziel-Punkt und die
                Discord-Rollen-Zuordnung ändern. Der Discord-Server-Owner
                hat immer automatisch Owner-Rechte.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Title order={4} mb="sm">
          Patch Notes
        </Title>
        <Stack gap="sm">
          {changelog.map((entry) => (
            <Paper key={entry.version} withBorder p="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Badge variant="light">v{entry.version}</Badge>
                <Text size="xs" c="dimmed">
                  {entry.date}
                </Text>
              </Group>
              <List size="sm" spacing={4}>
                {entry.notes.map((note, i) => (
                  <List.Item key={i}>{note}</List.Item>
                ))}
              </List>
            </Paper>
          ))}
        </Stack>
      </Container>
    </>
  );
}
