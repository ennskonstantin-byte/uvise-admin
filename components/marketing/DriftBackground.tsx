// Startseiten-Hintergrund: das echte "Hintergrund Loop"-Video (8s, lautlos,
// endlos) als fixer Hintergrund hinter dem gesamten Seiteninhalt, rein
// dekorativ (aria-hidden, pointer-events: none).
export function DriftBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#05060f" }}
    >
      {/* Echtes Hintergrund-Loop-Video (Original-Referenz) statt der
          CSS-Nachbildung — 8s, lautlos, endlos, komprimiert für Web. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/video/hintergrund-loop-poster.jpg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src="/video/hintergrund-loop.mp4" type="video/mp4" />
      </video>

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
