import { Link, useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Group, Text } from "@mantine/core";
import { useAuth } from "../context/AuthContext";

export function AppHeader() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  if (!session) return null;

  const avatarUrl = session.discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${session.discordUser.id}/${session.discordUser.avatar}.png?size=64`
    : undefined;

  return (
    <Group
      justify="space-between"
      px="lg"
      py="sm"
      style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
    >
      <Group gap="lg">
        <Button variant="subtle" size="xs" component={Link} to="/">
          Startseite
        </Button>
        <Button variant="subtle" size="xs" component={Link} to="/search">
          Suche
        </Button>
        {session.tier === "owner" && (
          <Button variant="subtle" size="xs" component={Link} to="/settings">
            Einstellungen
          </Button>
        )}
      </Group>
      <Group gap="sm">
        <Badge color={session.tier === "owner" ? "grape" : "blue"}>
          {session.tier}
        </Badge>
        <Avatar src={avatarUrl} radius="xl" size="sm" />
        <Text size="sm">{session.discordUser.username}</Text>
        <Button
          variant="subtle"
          size="xs"
          color="red"
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </Button>
      </Group>
    </Group>
  );
}
