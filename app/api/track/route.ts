import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

// Zählt einen Seitenaufruf der öffentlichen Website — ohne Cookie und ohne
// IP-Speicherung. Der Besucher wird nur als Tages-Hash abgelegt: aus IP +
// Browser-Kennung + Tagesdatum + Server-Geheimnis. Damit lassen sich
// eindeutige Besucher pro Tag zählen, aber niemand über Tage hinweg verfolgen.
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.CRON_SECRET ?? "uvise";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let path = "/";
  let referrer: string | null = null;
  try {
    const body = await request.json();
    if (typeof body.path === "string" && body.path.length <= 200) path = body.path;
    if (typeof body.referrer === "string" && body.referrer.length > 0) {
      // Nur die Domain der Herkunft speichern, keine vollständigen URLs
      try {
        referrer = new URL(body.referrer).hostname.slice(0, 100) || null;
      } catch {
        referrer = null;
      }
    }
  } catch {
    // Ohne lesbaren Body einfach als Aufruf der Startseite zählen.
  }

  // Eigene Aufrufe zwischen den uVise-Seiten nicht als "Herkunft" werten.
  if (referrer && (referrer === "uvise.de" || referrer.endsWith(".uvise.de"))) {
    referrer = null;
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ua = request.headers.get("user-agent") ?? "";
  const tag = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash("sha256").update(`${ip}|${ua}|${tag}|${secret}`).digest("hex");

  const db = createClient(supabaseUrl, serviceKey);
  await db.from("page_views").insert({ path, referrer, visitor_hash: visitorHash });

  return NextResponse.json({ ok: true });
}
