import { useEffect } from "react";
import { useToast } from "@astryxdesign/core/Toast";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

export type SnackbarTone = "success" | "warning" | "error" | "info";

export type SnackbarNotice = {
  title: string;
  message: string;
  tone: SnackbarTone;
};

type SnackbarProps = {
  notice: SnackbarNotice | null;
  onClose: () => void;
  durationMs?: number;
};

/**
 * Shows `notice` as an Astryx toast whenever it changes. Renders nothing
 * itself: the toast lives in the app's LayerProvider viewport.
 */
export default function Snackbar({
  notice,
  onClose,
  durationMs = 6000,
}: SnackbarProps) {
  const showToast = useToast();

  useEffect(() => {
    if (!notice) return;
    showToast({
      body: (
        <VStack gap={0.5}>
          <Text type="body" weight="semibold">
            {notice.title}
          </Text>
          <Text type="supporting" color="inherit">
            {notice.message}
          </Text>
        </VStack>
      ),
      type: notice.tone === "error" ? "error" : "info",
      isAutoHide: true,
      autoHideDuration: durationMs,
      uniqueID: `${notice.tone}:${notice.title}`,
      onHide: onClose,
    });
    // onClose is a fresh closure each render; the notice is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice, durationMs, showToast]);

  return null;
}
