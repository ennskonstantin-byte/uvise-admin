// Startseiten-Hintergrund: dunkler Grund mit langsam driftenden Glow-Blobs
// und schwebenden Glas-Kärtchen. Nachbau der Design-Referenz
// "Hintergrund Loop" (8-Sekunden-Loop-Szene) — hier auf eine ruhigere Dauer
// gestreckt, damit sie über eine ganze Seite hinweg nicht unruhig wirkt.
// Läuft fest hinter dem gesamten Seiteninhalt (position: fixed), rein
// dekorativ (aria-hidden, pointer-events: none).
import { Check, FileText, Zap } from "lucide-react";

type CardSpec = {
  icon: "check" | "zap" | "file";
  label?: string;
  top: string;
  left: string;
  size: "chip" | "card";
  drift: "a" | "b" | "c";
  delay: string;
};

// Fest positioniert (position: fixed) über die ganze Seite hinweg, unabhängig
// vom Scroll-Stand — beschriftete Karten deshalb NUR in den obersten
// Bildschirm-Ecken (dort ist auf jeder Sektion durchgehend Platz, über der
// Topbar-Zone hinaus). Überall sonst nur stille Icon-Chips ohne Text, damit
// nie ein Kärtchen-Label mit echter Überschrift/Fließtext/Buttons kollidiert.
const CARDS: CardSpec[] = [
  { icon: "zap", label: "Elektro Unterweisung", top: "5%", left: "2%", size: "card", drift: "a", delay: "0s" },
  { icon: "file", label: "Betriebsanweisung", top: "4%", left: "74%", size: "card", drift: "b", delay: "-4s" },
  { icon: "zap", top: "16%", left: "90%", size: "chip", drift: "c", delay: "-9s" },
  { icon: "check", top: "82%", left: "94%", size: "chip", drift: "a", delay: "-14s" },
  { icon: "check", top: "94%", left: "46%", size: "chip", drift: "b", delay: "-6s" },
  { icon: "file", top: "12%", left: "42%", size: "chip", drift: "c", delay: "-11s" },
  { icon: "check", top: "90%", left: "2%", size: "chip", drift: "a", delay: "-17s" },
  { icon: "zap", top: "96%", left: "72%", size: "chip", drift: "b", delay: "-2s" },
  { icon: "zap", top: "34%", left: "95%", size: "chip", drift: "c", delay: "-8s" },
  { icon: "check", top: "8%", left: "58%", size: "chip", drift: "a", delay: "-13s" },
  { icon: "file", top: "65%", left: "1%", size: "chip", drift: "b", delay: "-19s" },
  { icon: "zap", top: "75%", left: "96%", size: "chip", drift: "c", delay: "-5s" },
];

const ICONS = { check: Check, zap: Zap, file: FileText };

function Card({ spec }: { spec: CardSpec }) {
  const Icon = ICONS[spec.icon];
  const isChip = spec.size === "chip";
  const driftClass =
    spec.drift === "a" ? "uv-drift-card-a" : spec.drift === "b" ? "uv-drift-card-b" : "uv-drift-card-c";
  const iconGlass =
    spec.icon === "check"
      ? { bg: "rgba(23,178,106,0.14)", color: "#7bd9ab" }
      : { bg: "rgba(23,193,254,0.14)", color: "#7cc9f5" };

  return (
    <div
      className={driftClass}
      style={{
        position: "absolute",
        top: spec.top,
        left: spec.left,
        animationDelay: spec.delay,
        width: isChip ? 44 : 200,
        padding: isChip ? 0 : "14px 16px",
        height: isChip ? 44 : undefined,
        display: "flex",
        alignItems: isChip ? "center" : undefined,
        justifyContent: isChip ? "center" : undefined,
        borderRadius: isChip ? 13 : 15,
        background: "linear-gradient(150deg, rgba(226,234,255,0.035) 0%, rgba(190,206,242,0.008) 100%)",
        border: "1px solid rgba(196,214,255,0.05)",
        boxShadow: "0 16px 40px rgba(4,8,20,0.4), inset 0 1px 0 rgba(226,238,255,0.04)",
      }}
    >
      <div
        style={{
          width: isChip ? 22 : 26,
          height: isChip ? 22 : 26,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: iconGlass.bg,
          flexShrink: 0,
        }}
      >
        <Icon size={isChip ? 12 : 14} color={iconGlass.color} strokeWidth={2.2} />
      </div>
      {!isChip && spec.label && (
        <div style={{ marginLeft: 10, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              fontWeight: 500,
              color: "rgba(226,234,250,0.38)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {spec.label}
          </p>
          <div style={{ marginTop: 8, height: 3, width: "70%", borderRadius: 2, background: "rgba(216,228,252,0.08)" }} />
        </div>
      )}
    </div>
  );
}

export function DriftBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#05060f" }}
    >
      {/* Basis-Verlauf + feines Raster, wie in der Design-Referenz */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 100% at 30% 25%, #101a30 0%, #0a1020 45%, #05060f 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          backgroundImage:
            "linear-gradient(to right, rgba(150,180,240,0.035) 1px, transparent 1px), linear-gradient(rgba(150,180,240,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(85% 75% at 45% 40%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(85% 75% at 45% 40%, #000 0%, transparent 100%)",
        }}
      />

      {/* Weiche Glow-Blobs, driften langsam */}
      <div
        className="uv-drift-blob-a"
        style={{
          position: "absolute",
          left: "-6%",
          top: "-8%",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,104,214,0.42) 0%, rgba(56,104,214,0.14) 42%, rgba(56,104,214,0) 72%)",
          filter: "blur(48px)",
        }}
      />
      <div
        className="uv-drift-blob-b"
        style={{
          position: "absolute",
          left: "38%",
          top: "16%",
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(40,88,190,0.36) 0%, rgba(40,88,190,0.12) 42%, rgba(40,88,190,0) 72%)",
          filter: "blur(48px)",
          animationDelay: "-10s",
        }}
      />
      <div
        className="uv-drift-blob-a"
        style={{
          position: "absolute",
          left: "22%",
          top: "40%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(104,74,196,0.26) 0%, rgba(104,74,196,0.09) 42%, rgba(104,74,196,0) 72%)",
          filter: "blur(48px)",
          animationDelay: "-18s",
        }}
      />
      <div
        className="uv-drift-blob-b"
        style={{
          position: "absolute",
          left: "58%",
          top: "-4%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(46,86,170,0.22) 0%, rgba(46,86,170,0.07) 42%, rgba(46,86,170,0) 72%)",
          filter: "blur(48px)",
          animationDelay: "-24s",
        }}
      />

      {/* Schwebende Glas-Kärtchen — leicht weichgezeichnet, damit sie klar als
          Hintergrund-Atmosphäre lesbar bleiben und nicht mit echtem
          Seiteninhalt konkurrieren. */}
      <div style={{ position: "absolute", inset: 0, filter: "blur(0.5px)" }}>
        {CARDS.map((c, i) => (
          <Card key={i} spec={c} />
        ))}
      </div>

      {/* Vignette: dunkelt Rand UND mittlere Lesespalte zusätzlich ab, damit
          Überschrift/Fließtext auf jeder Sektion genug Kontrast behalten. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(115% 95% at 50% 35%, rgba(0,0,0,0) 40%, rgba(3,6,14,0.6) 100%), linear-gradient(180deg, rgba(3,6,14,0.15) 0%, rgba(3,6,14,0.35) 45%, rgba(3,6,14,0.15) 100%)",
        }}
      />
    </div>
  );
}
