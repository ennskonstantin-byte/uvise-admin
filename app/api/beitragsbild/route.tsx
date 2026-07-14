import { ImageResponse } from "next/og";

// Erzeugt ein Beitragsbild: ein passendes echtes Foto (kostenlos & rechtssicher
// über Pexels) als Hintergrund, darüber ein dunkler Verlauf für Lesbarkeit und
// das uVise-Logo + der Text. Ohne PEXELS_API_KEY fällt es auf den reinen
// Marken-Verlauf (dunkel) zurück — nichts geht kaputt.
//
// Aufruf: /api/beitragsbild?text=…&format=quadrat|quer&motiv=werkstatt

// Deutsche Motiv-Auswahl -> englische Pexels-Suchbegriffe (liefern bessere Treffer).
const MOTIVE: Record<string, string> = {
  werkstatt: "mechanic workshop worker",
  lager: "warehouse worker logistics",
  baustelle: "construction worker site",
  buero: "small business office team",
  gastro: "restaurant kitchen staff working",
  team: "diverse work team meeting",
  handwerk: "craftsman carpenter working",
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Holt ein Foto von Pexels und gibt es als Data-URI zurück (zuverlässig für
// die Bild-Einbettung). Bei Fehler/ohne Key: null -> Fallback auf Verlauf.
async function holeFoto(query: string, quer: boolean, seed: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  try {
    const orient = quer ? "landscape" : "square";
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orient}&per_page=20`,
      { headers: { Authorization: key } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { photos?: Array<{ src?: Record<string, string> }> };
    const fotos = Array.isArray(data.photos) ? data.photos : [];
    if (fotos.length === 0) return null;
    // Deterministisch wählen, damit Vorschau und Download dasselbe Bild zeigen.
    const foto = fotos[hash(query + seed) % fotos.length];
    const url = (quer ? foto?.src?.landscape : foto?.src?.large2x) || foto?.src?.large || foto?.src?.original;
    if (!url) return null;
    const bildRes = await fetch(url);
    if (!bildRes.ok) return null;
    const buf = Buffer.from(await bildRes.arrayBuffer());
    const ct = bildRes.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roh = (searchParams.get("text") || "Digitale Unterweisungen, die sich von selbst erledigen.").slice(0, 200);
  const quer = searchParams.get("format") === "quer";
  const motivKey = (searchParams.get("motiv") || "").toLowerCase();
  const query = MOTIVE[motivKey] || motivKey || "craftsman small business worker";
  const size = quer ? { width: 1200, height: 630 } : { width: 1080, height: 1080 };

  const len = roh.length;
  const titelGroesse = len < 45 ? 78 : len < 90 ? 60 : len < 140 ? 48 : 40;

  const foto = await holeFoto(query, quer, roh);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {/* Hintergrund: echtes Foto oder Marken-Verlauf */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            ...(foto
              ? { backgroundImage: `url(${foto})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(150deg, #1c1130, #0a0a0f)" }),
          }}
        />
        {/* Dunkler Verlauf für Textlesbarkeit */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: foto
              ? "linear-gradient(180deg, rgba(10,8,20,0.30) 0%, rgba(10,8,20,0.55) 45%, rgba(8,6,16,0.94) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        {/* Inhalt */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: quer ? "56px 64px" : "80px",
            color: "white",
          }}
        >
          {/* Kopf: Logo + Wortmarke */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: "linear-gradient(135deg, #7c5cfc, #3b82f6, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 46,
                fontWeight: 700,
              }}
            >
              U
            </div>
            <div style={{ fontSize: 42, fontWeight: 700 }}>uVise</div>
          </div>

          {/* Botschaft */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                width: 96,
                height: 8,
                borderRadius: 999,
                marginBottom: 24,
                background: "linear-gradient(90deg, #7c5cfc, #22d3ee)",
                display: "flex",
              }}
            />
            <div style={{ fontSize: titelGroesse, fontWeight: 700, lineHeight: 1.15, maxWidth: quer ? 1000 : 900 }}>
              {roh}
            </div>
          </div>

          {/* Fuß: Domain + Zusatz */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26 }}>
            <div style={{ fontWeight: 600 }}>uvise.de</div>
            <div style={{ opacity: 0.85 }}>Rechtssicher · Mehrsprachig · Ohne Papierkram</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
