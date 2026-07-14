import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

// Öffentliche Affiliate-Endpunkte:
//   {aktion:"klick", code}          -> Klick auf einen Partner-Link zählen (anonym)
//   {aktion:"registrierung", code}  -> nach der Firmenregistrierung die neue Firma
//                                      dem Partner zuordnen (braucht Login-Token)
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.CRON_SECRET ?? "uvise";
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  const db = createClient(supabaseUrl, serviceKey);

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().slice(0, 40) : "";
  if (!code) return NextResponse.json({ error: "Kein Code." }, { status: 400 });

  const { data: partner } = await db
    .from("affiliate_partners")
    .select("id, aktiv")
    .eq("code", code)
    .single();
  if (!partner || !partner.aktiv) {
    // Unbekannter Code: nichts zählen, aber auch keinen Fehler nach außen zeigen.
    return NextResponse.json({ ok: true });
  }

  if (body.aktion === "klick") {
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const ua = request.headers.get("user-agent") ?? "";
    const tag = new Date().toISOString().slice(0, 10);
    const visitorHash = createHash("sha256").update(`${ip}|${ua}|${tag}|${secret}`).digest("hex");
    await db.from("affiliate_clicks").insert({ partner_id: partner.id, visitor_hash: visitorHash });
    return NextResponse.json({ ok: true });
  }

  if (body.aktion === "registrierung") {
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    const authedDb = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
    } = await authedDb.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

    const { data: employee } = await db
      .from("employees")
      .select("company_id, ist_beauftragter")
      .eq("auth_user_id", user.id)
      .single();
    if (!employee?.ist_beauftragter) {
      return NextResponse.json({ error: "Kein Firmenkonto." }, { status: 403 });
    }
    // Nur setzen, wenn noch kein Partner zugeordnet ist — nachträgliches
    // Umhängen auf einen anderen Partner ist nicht möglich.
    await db
      .from("companies")
      .update({ ref_code: code })
      .eq("id", employee.company_id)
      .is("ref_code", null);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
