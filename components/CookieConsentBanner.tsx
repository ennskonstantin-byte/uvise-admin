"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/consent";

// Cookie-Banner für die öffentlichen Seiten. Erscheint nur, solange noch
// keine Entscheidung getroffen wurde. Erst nach "Akzeptieren" darf GA4
// (components/GoogleAnalytics.tsx) laden.
export function CookieConsentBanner() {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    setSichtbar(getConsent() === null);
  }, []);

  if (!sichtbar) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einwilligung"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/80">
          Wir nutzen Google Analytics, um die Nutzung unserer Website anonymisiert auszuwerten. Das setzt Cookies und
          ist optional — deine Zustimmung kannst du jederzeit widerrufen. Details in unserer{" "}
          <a href="/datenschutz" className="underline">
            Datenschutzerklärung
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              setConsent("denied");
              setSichtbar(false);
            }}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/70"
          >
            Ablehnen
          </button>
          <button
            onClick={() => {
              setConsent("granted");
              setSichtbar(false);
            }}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
