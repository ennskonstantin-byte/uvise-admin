"use client";

import { useState } from "react";
import { useEscapeClose } from "@/lib/useEscapeClose";

// [N-06] Ersetzt native window.confirm()/window.prompt()-Dialoge — die waren
// nicht stylebar, teils schlecht lesbar und im Preview-iframe fehlerhaft.
export function ConfirmModal({
  title,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  danger = false,
  requireTypedText,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireTypedText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const canConfirm = !requireTypedText || typed === requireTypedText;

  async function handleConfirm() {
    if (!canConfirm || busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <p className="text-sm text-foreground/75 whitespace-pre-line mb-5">{message}</p>

        {requireTypedText && (
          <div className="mb-5">
            <p className="text-xs text-foreground/65 mb-2">
              Tippe <span className="font-semibold">{requireTypedText}</span> (in Großbuchstaben), um fortzufahren.
            </p>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="text-sm text-foreground/65 hover:text-foreground px-4 py-2 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || busy}
            className={`text-sm font-medium rounded-full px-5 py-2.5 disabled:opacity-40 ${
              danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
