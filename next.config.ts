import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (app/api/pdf-text) hängt intern an pdfjs-dist, das eigene
  // Worker-Dateien und dynamische require()s mitbringt. Steht nicht auf
  // Next.js' Auto-Ausschlussliste (next/dist/docs/.../serverExternalPackages.md)
  // -- ohne diesen Eintrag bündelt Next die Route-Handler-Bundling-Logik
  // hinein, was auf Vercel entweder den Build oder die Laufzeit brechen kann.
  serverExternalPackages: ["pdf-parse"],
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
    ];
  },
};

export default nextConfig;
