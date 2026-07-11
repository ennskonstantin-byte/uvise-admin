"use client";

import { useEffect } from "react";

// Barrierefreiheit: Modals/Dialoge sollen sich per Escape schließen lassen,
// nicht nur per Maus-Klick auf "Abbrechen".
export function useEscapeClose(onClose: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}
