"use client";

import { useEffect } from "react";

// Merkt sich den Partner-Code aus dem Werbe-Link (?ref=CODE) und zählt den
// Klick. Der Code bleibt im localStorage, bis sich die Firma registriert —
// dann wird sie dem Partner zugeordnet (siehe AuthGate).
export function AffiliateRef() {
  useEffect(() => {
    try {
      const code = new URLSearchParams(window.location.search).get("ref");
      if (!code) return;
      const bereitsGezaehlt = localStorage.getItem("uvise-ref") === code;
      localStorage.setItem("uvise-ref", code);
      if (!bereitsGezaehlt) {
        fetch("/api/affiliate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aktion: "klick", code }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Affiliate-Zählung darf die Seite nie stören.
    }
  }, []);

  return null;
}
