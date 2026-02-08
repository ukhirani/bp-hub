import { useEffect, useRef, useState } from "react";

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

const toneStyles: Record<SnackbarTone, string> = {
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export default function Snackbar({
  notice,
  onClose,
  durationMs = 6000,
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const autoCloseRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (autoCloseRef.current) {
      window.clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const startClose = () => {
    setIsVisible(false);
    if (!closeTimeoutRef.current) {
      closeTimeoutRef.current = window.setTimeout(() => {
        onClose();
      }, 220);
    }
  };

  useEffect(() => {
    clearTimers();

    if (!notice) {
      setIsVisible(false);
      return () => clearTimers();
    }

    setIsVisible(true);
    autoCloseRef.current = window.setTimeout(() => {
      startClose();
    }, durationMs);

    return () => clearTimers();
  }, [notice, durationMs]);

  if (!notice) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(90vw,360px)]">
      <div
        role="status"
        className={`rounded-md border px-4 py-3 shadow-sm transition-all duration-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        } ${toneStyles[notice.tone]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{notice.title}</div>
            <div className="text-xs opacity-90">{notice.message}</div>
          </div>
          <button
            type="button"
            aria-label="Close notification"
            onClick={startClose}
            className="text-xs opacity-70 transition hover:opacity-100"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
