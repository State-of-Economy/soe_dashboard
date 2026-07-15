import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ActionIcon, Group, Image, Text } from "@mantine/core";
import { IconMinus, IconSquare, IconSquares, IconX } from "@tabler/icons-react";
import soeLogo from "../assets/soe_logo.png";

const appWindow = getCurrentWindow();

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    appWindow.isMaximized().then(setMaximized);
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setMaximized);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <Group
      justify="space-between"
      pl="sm"
      pr={0}
      h={36}
      data-tauri-drag-region
      style={{
        userSelect: "none",
        borderBottom: "1px solid var(--mantine-color-default-border)",
        flexShrink: 0,
      }}
    >
      <Group gap="xs" data-tauri-drag-region style={{ pointerEvents: "none" }}>
        <Image src={soeLogo} alt="SoE Logo" w={18} h={18} />
        <Text size="sm" fw={600} c="dimmed">
          SoE Supporter Dashboard
        </Text>
      </Group>

      <Group gap={0}>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius={0}
          w={46}
          h={36}
          onClick={() => appWindow.minimize()}
        >
          <IconMinus size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius={0}
          w={46}
          h={36}
          onClick={() => appWindow.toggleMaximize()}
        >
          {maximized ? <IconSquares size={14} /> : <IconSquare size={14} />}
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          radius={0}
          w={46}
          h={36}
          onClick={() => appWindow.close()}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
