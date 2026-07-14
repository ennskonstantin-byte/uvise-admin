"use client";

import { useEffect } from "react";

// Meldet einen Seitenaufruf an die eigene Statistik (cookielos, anonymisiert).
// Respektiert die "Do Not Track"-Einstellung des Browsers.
export function TrackPageView({ path }: { path: string }) {
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {
      // Statistik ist ein Zusatz — Fehler hier dürfen die Seite nie stören.
    });
  }, [path]);

  return null;
}
