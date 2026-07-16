import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";

interface BanModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (
    reason: string,
    evidenceLink: string,
    durationHours: number | null,
  ) => void;
  loading: boolean;
  playerName: string;
}

export function BanModal({
  opened,
  onClose,
  onConfirm,
  loading,
  playerName,
}: BanModalProps) {
  const [reason, setReason] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [durationHours, setDurationHours] = useState<number>(24);

  const handleClose = () => {
    setReason("");
    setEvidenceLink("");
    setPermanent(true);
    setDurationHours(24);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Spieler bannen">
      <Stack gap="sm">
        <Text size="sm">
          {playerName} wird gesperrt (falls online, sofort gekickt).
        </Text>
        <TextInput
          label="Grund"
          placeholder="z.B. Cheating / Exploiting"
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
        <Switch
          label="Permanent"
          checked={permanent}
          onChange={(e) => setPermanent(e.currentTarget.checked)}
        />
        {!permanent && (
          <NumberInput
            label="Dauer (Stunden)"
            value={durationHours}
            onChange={(v) => setDurationHours(Number(v) || 1)}
            min={1}
          />
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            color="red"
            loading={loading}
            disabled={!reason.trim() || !evidenceLink.trim()}
            onClick={() =>
              onConfirm(
                reason.trim(),
                evidenceLink.trim(),
                permanent ? null : durationHours,
              )
            }
          >
            Bannen
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
