import { Button, Group, Modal, Text } from "@mantine/core";

interface ForceParkModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  plate: string;
}

export function ForceParkModal({
  opened,
  onClose,
  onConfirm,
  loading,
  plate,
}: ForceParkModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Fahrzeug einparken">
      <Text mb="md">
        Fahrzeug {plate} wird sicher eingeparkt (falls es gerade in der Welt
        steht, wird es entfernt). Der Besitzer kann es danach an jeder
        soe_garage-Zone wieder abholen. Fortfahren?
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button color="orange" onClick={onConfirm} loading={loading}>
          Einparken
        </Button>
      </Group>
    </Modal>
  );
}
