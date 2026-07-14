import { ImageResponse } from "next/og";

// Erzeugt ein Beitragsbild: ein passendes echtes Foto (kostenlos & rechtssicher
// über Pexels) als Hintergrund, darüber ein dunkler Verlauf für Lesbarkeit und
// das uVise-Logo + der Text. Optional (app=1) ein Handy mit einer uVise-App-
// Ansicht seitlich, die zwischen mehreren Screens wechselt.
// Ohne PEXELS_API_KEY fällt der Hintergrund auf den Marken-Verlauf zurück.
//
// Aufruf: /api/beitragsbild?text=…&format=quadrat|quer&motiv=werkstatt&app=1

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

const GRAD = "linear-gradient(135deg, #7c5cfc, #3b82f6, #22d3ee)";

// Eine Zeile in der Mini-App (Avatar + zwei Zeilen + Statuspunkt).
function zeile(farbe: string, name: string, unter: string, punkt: string) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, background: farbe, display: "flex" }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>{name}</div>
        <div style={{ fontSize: 12, color: "#71717a" }}>{unter}</div>
      </div>
      <div style={{ width: 12, height: 12, borderRadius: 999, background: punkt, display: "flex" }} />
    </div>
  );
}

// Der Inhalt des Handy-Bildschirms — drei wechselnde uVise-Ansichten.
function appScreen(kind: number) {
  const kopf = (
    <div
      style={{
        height: 58,
        background: "linear-gradient(90deg, #7c5cfc, #3b82f6)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 16,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          fontWeight: 700,
          color: "white",
        }}
      >
        U
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>uVise</div>
    </div>
  );

  let body;
  if (kind === 1) {
    // Signieren
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#18181b" }}>Unterweisung</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 9, borderRadius: 999, background: "#e4e4e7", width: "100%", display: "flex" }} />
          <div style={{ height: 9, borderRadius: 999, background: "#e4e4e7", width: "90%", display: "flex" }} />
          <div style={{ height: 9, borderRadius: 999, background: "#e4e4e7", width: "75%", display: "flex" }} />
        </div>
        <div
          style={{
            marginTop: 6,
            height: 60,
            borderRadius: 12,
            border: "2px dashed #d4d4d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontStyle: "italic",
            color: "#a1a1aa",
          }}
        >
          Unterschrift
        </div>
        <div
          style={{
            marginTop: 4,
            height: 46,
            borderRadius: 999,
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
            color: "white",
          }}
        >
          Jetzt signieren
        </div>
      </div>
    );
  } else if (kind === 2) {
    // Fristen / Ampel
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#18181b" }}>Fristen</div>
        {zeile("#dbeafe", "Ersthelfer", "läuft ab in 12 Tagen", "#f59e0b")}
        {zeile("#dcfce7", "Staplerschein", "aktuell", "#22c55e")}
        {zeile("#fee2e2", "Unterweisung", "überfällig", "#ef4444")}
        {zeile("#f3e8ff", "Brandschutz", "aktuell", "#22c55e")}
      </div>
    );
  } else {
    // Dashboard
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#18181b" }}>Dashboard</div>
        {zeile("#dbeafe", "Lena Bauer", "Produktion", "#22c55e")}
        {zeile("#fce7f3", "Tom Krüger", "Lager", "#f59e0b")}
        {zeile("#dcfce7", "Nina Beispiel", "Leitung", "#22c55e")}
        <div
          style={{
            marginTop: 4,
            height: 44,
            borderRadius: 999,
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
          }}
        >
          + Unterweisung
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f4f4f5" }}>
      {kopf}
      {body}
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roh = (searchParams.get("text") || "Digitale Unterweisungen, die sich von selbst erledigen.").slice(0, 200);
  const quer = searchParams.get("format") === "quer";
  const zeigeApp = searchParams.get("app") === "1";
  const motivKey = (searchParams.get("motiv") || "").toLowerCase();
  const query = MOTIVE[motivKey] || motivKey || "craftsman small business worker";
  const size = quer ? { width: 1200, height: 630 } : { width: 1080, height: 1080 };

  const len = roh.length;
  const titelGroesse = len < 45 ? 78 : len < 90 ? 60 : len < 140 ? 48 : 40;

  const foto = await holeFoto(query, quer, roh);

  // Handy-Maße + Screen-Auswahl (wechselt je nach Text).
  const ph = quer ? 520 : 760;
  const pw = quer ? 250 : 360;
  const screenKind = hash(roh) % 3;

  // Text schmaler halten, wenn das Handy daneben steht.
  const textBreite = zeigeApp ? (quer ? 620 : 560) : quer ? 1000 : 900;

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
        {/* Dunkler Verlauf für Lesbarkeit (bei App-Ansicht links dunkler) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: zeigeApp
              ? "linear-gradient(100deg, rgba(8,6,16,0.94) 0%, rgba(8,6,16,0.75) 42%, rgba(8,6,16,0.35) 100%)"
              : foto
              ? "linear-gradient(180deg, rgba(10,8,20,0.30) 0%, rgba(10,8,20,0.55) 45%, rgba(8,6,16,0.94) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* Handy mit uVise-App (optional) */}
        {zeigeApp && (
          <div
            style={{
              position: "absolute",
              right: -28,
              bottom: -70,
              display: "flex",
              transform: "rotate(-7deg)",
            }}
          >
            <div
              style={{
                width: pw,
                height: ph,
                borderRadius: 46,
                background: "#0b0b0f",
                border: "9px solid #1b1b22",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
              }}
            >
              {appScreen(screenKind)}
            </div>
          </div>
        )}

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
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: GRAD,
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
            <div style={{ fontSize: titelGroesse, fontWeight: 700, lineHeight: 1.15, maxWidth: textBreite }}>
              {roh}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 26 }}>
            <div style={{ fontWeight: 600 }}>uvise.de</div>
            <div style={{ opacity: 0.85 }}>Rechtssicher · Mehrsprachig · Ohne Papierkram</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
