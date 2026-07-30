"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getConsent, onConsentChange } from "@/lib/consent";

// Global verfügbar, sobald diese Komponente das gtag.js-Snippet geladen hat
// (siehe unten) — andere Stellen im Code (z.B. AuthGate.tsx fürs "sign_up"-
// Event) greifen nur über die typeof-Guard-Abfrage darauf zu.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Lädt Google Analytics 4 (gtag.js) über next/script, damit es auf allen
// Seiten nur einmal geladen wird — und erst, wenn der Nutzer per
// CookieConsentBanner zugestimmt hat (Art. 6 Abs. 1 lit. a DSGVO, § 25
// Abs. 1 TTDSG). Ohne Zustimmung wird nichts geladen und kein Cookie gesetzt.
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [erlaubt, setErlaubt] = useState(false);

  useEffect(() => {
    setErlaubt(getConsent() === "granted");
    return onConsentChange((status) => setErlaubt(status === "granted"));
  }, []);

  if (!gaId || !erlaubt) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
