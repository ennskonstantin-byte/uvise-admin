"use client";

import { useCallback, useEffect, useState } from "react";

// Kleine, wiederverwendbare Kurzmeldung unten am Bildschirmrand.
// Verwendung:
//   const { showToast, ToastView } = useToast();
//   ...<button onClick={() => showToast("Text")}>…</button>
//   ...<ToastView /> irgendwo im JSX
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const ToastView = useCallback(() => {
    if (!message) return null;
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm px-4">
        <div className="rounded-2xl bg-foreground text-background px-5 py-3 text-sm shadow-lg text-center">
          {message}
        </div>
      </div>
    );
  }, [message]);

  return { showToast, ToastView };
}
