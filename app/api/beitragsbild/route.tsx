import { ImageResponse } from "next/og";

// Erzeugt ein fertiges Beitragsbild in den uVise-Marken-Farben — kostenlos,
// ohne externe Bild-KI. Aufruf z.B.:
//   /api/beitragsbild?text=Arbeitsschutz%20ohne%20Papierkram&format=quadrat
// format: "quadrat" (1080x1080, Instagram) oder "quer" (1200x630, Facebook/Link).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roh = (searchParams.get("text") || "Digitale Unterweisungen, die sich von selbst erledigen.").slice(0, 200);
  const quer = searchParams.get("format") === "quer";
  const size = quer ? { width: 1200, height: 630 } : { width: 1080, height: 1080 };

  // Schriftgröße an die Textlänge anpassen, damit es nie überläuft.
  const len = roh.length;
  const titelGroesse = len < 45 ? 82 : len < 90 ? 64 : len < 140 ? 50 : 40;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: quer ? "56px 64px" : "80px 80px",
          background: "linear-gradient(150deg, #1c1130 0%, #0a0a0f 60%, #0a0a0f 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Kopf: Logo + Wortmarke */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg, #7c5cfc, #3b82f6, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
              fontWeight: 700,
            }}
          >
            U
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>uVise</div>
        </div>

        {/* Mitte: die eigentliche Botschaft */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              width: 96,
              height: 8,
              borderRadius: 999,
              marginBottom: 28,
              background: "linear-gradient(90deg, #7c5cfc, #22d3ee)",
              display: "flex",
            }}
          />
          <div style={{ fontSize: titelGroesse, fontWeight: 700, lineHeight: 1.15, maxWidth: quer ? 1000 : 900 }}>
            {roh}
          </div>
        </div>

        {/* Fuß: Domain + kurzer Zusatz */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
          <div style={{ opacity: 0.9, fontWeight: 600 }}>uvise.de</div>
          <div style={{ opacity: 0.55 }}>Rechtssicher · Mehrsprachig · Ohne Papierkram</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
