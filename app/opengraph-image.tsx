import { ImageResponse } from "next/og";

export const alt = "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #12307e, #0a1233)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              background: "linear-gradient(150deg, #0a5bff, #18a8ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            U
          </div>
          <div style={{ fontSize: 64, fontWeight: 700 }}>uVise</div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, textAlign: "center", maxWidth: 900 }}>
          Digitale Unterweisungen &amp; Nachweise,
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, textAlign: "center", maxWidth: 900 }}>
          die sich von selbst erledigen.
        </div>
        <div style={{ fontSize: 26, opacity: 0.65, marginTop: 28 }}>
          Rechtssicher · Mehrsprachig · Ohne Papierkram
        </div>
      </div>
    ),
    { ...size }
  );
}
