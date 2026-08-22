import type { NextConfig } from "next";
import { assertDemoModeNotInProductionBuild } from "./lib/demoMode";

// [v3 — P1-6] Läuft beim Start JEDES Builds/Serverstarts: bricht einen
// Produktions-Build mit NEXT_PUBLIC_DEMO_MODE=true hart ab (Exit != 0),
// sofern er nicht ausdrücklich per UVISE_ALLOW_DEMO_BUILD=1 als
// Vorschau-Export gekennzeichnet ist — Details in lib/demoMode.ts.
assertDemoModeNotInProductionBuild();

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Die Einstiegs-Seiten der eingebetteten App-Builds dürfen NIE aus dem
      // Browser-Speicher kommen — Safari (v.a. iPhone) hielt sonst tagelang
      // alte Demo-/App-Test-Versionen fest und alle Fixes wirkten "immer noch
      // kaputt". Die JS-Bundles selbst haben Hash-Namen und dürfen ewig
      // gecacht werden (neuer Build = neuer Dateiname).
      {
        source: "/app-test/index.html",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/app-test",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/preview-chef/index.html",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/preview-ma/index.html",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      // [v2c, 18.08.26] Zugangsdatenfreie Vorschau des authentifizierten
      // Web-Bereichs (public/preview-web/) — gleiche Cache-Regel wie oben:
      // die Einstiegs-HTML nie aus dem Browser-Speicher, die gehashten
      // _next/static-Chunks dürfen ewig gecacht werden.
      {
        source: "/preview-web/:page.html",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
