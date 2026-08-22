"use client";

import { useEffect, useRef, useState } from "react";

// Feste Referenzgröße des preview-web-Exports (Desktop-Dashboard). Die
// iframe wird immer in dieser Größe gerendert und per CSS-Transform auf die
// tatsächliche Containerbreite herunterskaliert — dadurch bleibt das Layout
// auf jeder Bildschirmgröße exakt wie am Rechner, ohne Beschneidung oder
// horizontale Überbreite (kein responsives Reflow der Demo-Seite nötig).
const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

// Browser-Rahmen um die eingebettete Vorschau des Web-Dashboards
// (public/preview-web/) — bewusst ohne eigene Marketingtexte, nur die
// vorhandene Produktbezeichnung "Web-Dashboard" (siehe PRODUCTS oben) als
// Beschriftung.
export function WebDashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / FRAME_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="uv-glass-panel overflow-hidden"
      style={{ ["--glow" as string]: "rgba(10,108,255,0.28)" }}
    >
      <div
        className="flex items-center gap-1.5 px-4 py-3 border-b"
        style={{ borderColor: "var(--mk-line)" }}
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#E5484D" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#F5B301" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#17B26A" }} />
      </div>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: FRAME_HEIGHT * scale }}
      >
        <iframe
          src="/preview-web/index.html"
          title="Vorschau des uVise Web-Dashboards: Mitarbeiter, Unterweisungen und Qualifikationen verwalten"
          className="border-none bg-background"
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
