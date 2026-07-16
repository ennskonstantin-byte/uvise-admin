import { NextResponse } from "next/server";
import sharp from "sharp";

// Wandelt ein Bild (z. B. unser PNG-Beitragsbild oder ein hochgeladenes Foto)
// live in ein JPG um. Hintergrund: Instagram akzeptiert beim Veröffentlichen
// NUR JPG-Bilder — Facebook nimmt auch PNG. Instagram holt sich das Bild über
// die öffentliche URL dieser Route.
//   GET /api/jpg?url=<öffentliche Bild-URL>  ->  image/jpeg
//
// Läuft im Node-Runtime, weil sharp ein natives Modul ist.
export const runtime = "nodejs";

// Nur eigene Quellen erlauben (kein offener Bild-Proxy): unsere Domain und der
// Supabase-Speicher (dort liegen hochgeladene Beitragsbilder).
function quelleErlaubt(host: string): boolean {
  return (
    host === "www.uvise.de" ||
    host === "uvise.de" ||
    host.endsWith(".supabase.co")
  );
}

export async function GET(request: Request) {
  const ziel = new URL(request.url).searchParams.get("url");
  if (!ziel) {
    return NextResponse.json({ error: "Parameter 'url' fehlt." }, { status: 400 });
  }

  let quelle: URL;
  try {
    quelle = new URL(ziel);
  } catch {
    return NextResponse.json({ error: "Ungültige URL." }, { status: 400 });
  }
  if (quelle.protocol !== "https:" || !quelleErlaubt(quelle.host)) {
    return NextResponse.json({ error: "Diese Bildquelle ist nicht erlaubt." }, { status: 400 });
  }

  try {
    const res = await fetch(quelle.toString());
    if (!res.ok) {
      return NextResponse.json({ error: "Bild konnte nicht geladen werden." }, { status: 502 });
    }
    const eingang = Buffer.from(await res.arrayBuffer());
    // Transparenz auf weißen Hintergrund legen, dann als JPG ausgeben.
    const jpg = await sharp(eingang)
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90 })
      .toBuffer();

    return new NextResponse(new Uint8Array(jpg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Bild konnte nicht umgewandelt werden." }, { status: 502 });
  }
}
