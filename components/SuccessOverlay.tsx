"use client";

import { Check } from "lucide-react";

// Kurze Erfolgsbestätigung, bevor sich ein Modal automatisch schließt --
// vorher schlossen manche Fenster (Verteilen, Anlegen) sofort ohne
// Rückmeldung, ob die Aktion überhaupt angekommen ist.
export function SuccessOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-background border border-border p-8 flex flex-col items-center text-center gap-3">
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center text-white"
          style={{ background: "var(--ampel-green)" }}
        >
          <Check size={26} />
        </div>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}

// Wie lange die Bestätigung sichtbar bleibt, bevor automatisch geschlossen wird.
export const SUCCESS_OVERLAY_MS = 1400;
