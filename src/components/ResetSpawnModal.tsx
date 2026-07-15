import { Button, Group, Modal, Text } from "@mantine/core";

interface ResetSpawnModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  playerName: string;
}

export function ResetSpawnModal({
  opened,
  onClose,
  onConfirm,
  loading,
  playerName,
}: ResetSpawnModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Spawn-Punkt zurücksetzen">
      <Text mb="md">
        {playerName} wird sofort zum festgelegten Ziel-Punkt teleportiert
        (falls online) und der Spawn-Punkt dauerhaft dorthin gesetzt. Fortfahren?
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button color="orange" onClick={onConfirm} loading={loading}>
          Zurücksetzen
        </Button>
      </Group>
    </Modal>
  );
}
