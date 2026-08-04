import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
