import { Button, Group, Modal, Text } from "@mantine/core";

interface DeleteItemModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  itemLabel: string;
  count: number;
}

export function DeleteItemModal({
  opened,
  onClose,
  onConfirm,
  loading,
  itemLabel,
  count,
}: DeleteItemModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Item löschen">
      <Text mb="md">
        {itemLabel} (x{count}) wird unwiderruflich aus dem Inventar entfernt.
        Fortfahren?
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Löschen
        </Button>
      </Group>
    </Modal>
  );
}
