import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { isOwnerEmail } from "@/lib/owner";

// Betreiber-Route für die Partner-Verwaltung:
//   GET  -> alle Partner inkl. Klicks und geworbenen Firmen
//   POST {aktion:"anlegen", name, email?, budgetEuro?}
//   POST {aktion:"aendern", id, budgetEuro?, aktiv?}

async function betreiberPruefen(request: Request): Promise<{ db: SupabaseClient } | NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const authedDb = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
  } = await authedDb.auth.getUser(accessToken);
  if (!user || !isOwnerEmail(user.email)) {
    return NextResponse.json({ error: "Nur für den Betreiber verfügbar." }, { status: 403 });
  }
  return { db: createClient(supabaseUrl, serviceKey) };
}

export async function GET(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;

  const [{ data: partner }, { data: clicks }, { data: firmen }] = await Promise.all([
    auth.db.from("affiliate_partners").select("*").order("created_at", { ascending: false }),
    auth.db.from("affiliate_clicks").select("partner_id"),
    auth.db.from("companies").select("ref_code").not("ref_code", "is", null).eq("geloescht", false),
  ]);

  const klicksProPartner = new Map<string, number>();
  for (const c of clicks ?? []) {
    klicksProPartner.set(c.partner_id, (klicksProPartner.get(c.partner_id) ?? 0) + 1);
  }
  const firmenProCode = new Map<string, number>();
  for (const f of firmen ?? []) {
    firmenProCode.set(f.ref_code, (firmenProCode.get(f.ref_code) ?? 0) + 1);
  }

  return NextResponse.json({
    partner: (partner ?? []).map((p) => ({
      ...p,
      klicks: klicksProPartner.get(p.id) ?? 0,
      geworbeneFirmen: firmenProCode.get(p.code) ?? 0,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;
  const db = auth.db;

  const body = await request.json();

  if (body.aktion === "anlegen") {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
    if (!name) return NextResponse.json({ error: "Name fehlt." }, { status: 400 });
    const email = typeof body.email === "string" && body.email.includes("@") ? body.email.trim().slice(0, 200) : null;
    const budgetCents = Math.max(0, Math.round((parseFloat(body.budgetEuro) || 0) * 100));

    // Kurzer Link-Code + langer geheimer Zugangs-Schlüssel.
    const code = randomBytes(4).toString("hex").slice(0, 6);
    const schluessel = randomBytes(24).toString("hex");

    const { data, error } = await db
      .from("affiliate_partners")
      .insert({ name, email, code, schluessel, budget_cents: budgetCents })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ partner: data });
  }

  if (body.aktion === "aendern") {
    if (!body.id) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    const update: Record<string, unknown> = {};
    if (body.budgetEuro !== undefined) {
      update.budget_cents = Math.max(0, Math.round((parseFloat(body.budgetEuro) || 0) * 100));
    }
    if (typeof body.aktiv === "boolean") update.aktiv = body.aktiv;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nichts zu ändern." }, { status: 400 });
    }
    const { error } = await db.from("affiliate_partners").update(update).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
