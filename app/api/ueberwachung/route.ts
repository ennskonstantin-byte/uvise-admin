import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isOwnerEmail } from "@/lib/owner";

// Sammelt die Kernzahlen aus Statistik, Marketing und Partner für das
// Betreiber-Überblick-Dashboard — nur für Betreiber-Logins.
export async function GET(request: Request) {
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

  const db = createClient(supabaseUrl, serviceKey);
  const heute = new Date().toISOString().slice(0, 10);
  const vor30 = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [
    { data: viewsHeute },
    { count: aufrufe30 },
    { data: entwuerfe },
    { data: freigegeben },
    { count: partnerAnzahl },
    { count: klicksGesamt },
    { count: firmenGesamt },
    { count: firmenUeberPartner },
  ] = await Promise.all([
    db.from("page_views").select("visitor_hash").gte("created_at", heute + "T00:00:00Z"),
    db.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", vor30),
    db.from("social_posts").select("id", { count: "exact", head: false }).eq("status", "entwurf"),
    db.from("social_posts").select("id", { count: "exact", head: false }).eq("status", "freigegeben"),
    db.from("affiliate_partners").select("id", { count: "exact", head: true }),
    db.from("affiliate_clicks").select("id", { count: "exact", head: true }),
    db.from("companies").select("id", { count: "exact", head: true }),
    db.from("companies").select("id", { count: "exact", head: true }).not("ref_code", "is", null),
  ]);

  const besucherHeute = new Set((viewsHeute ?? []).map((v) => v.visitor_hash)).size;

  return NextResponse.json({
    website: {
      besucherHeute,
      aufrufeHeute: (viewsHeute ?? []).length,
      aufrufe30Tage: aufrufe30 ?? 0,
    },
    marketing: {
      offeneEntwuerfe: entwuerfe?.length ?? 0,
      freigegeben: freigegeben?.length ?? 0,
    },
    partner: {
      anzahl: partnerAnzahl ?? 0,
      klicksGesamt: klicksGesamt ?? 0,
      geworbeneFirmen: firmenUeberPartner ?? 0,
    },
    firmen: {
      gesamt: firmenGesamt ?? 0,
    },
  });
}
