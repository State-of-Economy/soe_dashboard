import { useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";

interface KickModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (reason: string, evidenceLink: string) => void;
  loading: boolean;
  playerName: string;
}

export function KickModal({
  opened,
  onClose,
  onConfirm,
  loading,
  playerName,
}: KickModalProps) {
  const [reason, setReason] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");

  const handleClose = () => {
    setReason("");
    setEvidenceLink("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Spieler kicken">
      <Stack gap="sm">
        <Text size="sm">{playerName} wird sofort vom Server geworfen.</Text>
        <TextInput
          label="Grund"
          placeholder="z.B. Regelverstoss XY"
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Beweis-Link"
          placeholder="z.B. Clip/Screenshot-URL"
          value={evidenceLink}
          onChange={(e) => setEvidenceLink(e.currentTarget.value)}
          required
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            color="orange"
            loading={loading}
            disabled={!reason.trim() || !evidenceLink.trim()}
            onClick={() => onConfirm(reason.trim(), evidenceLink.trim())}
          >
            Kicken
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
