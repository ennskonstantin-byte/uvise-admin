import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isOwnerEmail } from "@/lib/owner";

// Liefert die Besucherstatistik der öffentlichen Website — nur für den
// Betreiber (Login-Adresse muss in OWNER_EMAILS stehen). Aggregiert wird
// serverseitig, die rohen Zeilen verlassen den Server nie.
export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const authedDb = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
  } = await authedDb.auth.getUser(accessToken);
  if (!user || !isOwnerEmail(user.email)) {
    return NextResponse.json({ error: "Nur für den Betreiber verfügbar." }, { status: 403 });
  }

  const db = createClient(supabaseUrl, serviceKey);
  const jahrZurueck = new Date();
  jahrZurueck.setFullYear(jahrZurueck.getFullYear() - 1);

  // Bewusst maximal 1 Jahr zurück laden und im Server aggregieren — bei sehr
  // vielen Aufrufen später auf SQL-Aggregation (RPC) umstellen.
  const { data: rows, error } = await db
    .from("page_views")
    .select("created_at, path, referrer, visitor_hash")
    .gte("created_at", jahrZurueck.toISOString())
    .order("created_at", { ascending: true })
    .limit(100000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const proTag = new Map<string, { aufrufe: number; besucher: Set<string> }>();
  const proMonat = new Map<string, { aufrufe: number; besucher: Set<string> }>();
  const herkunft = new Map<string, number>();
  const seiten = new Map<string, number>();

  for (const r of rows ?? []) {
    const tag = r.created_at.slice(0, 10);
    const monat = r.created_at.slice(0, 7);
    if (!proTag.has(tag)) proTag.set(tag, { aufrufe: 0, besucher: new Set() });
    if (!proMonat.has(monat)) proMonat.set(monat, { aufrufe: 0, besucher: new Set() });
    proTag.get(tag)!.aufrufe++;
    proTag.get(tag)!.besucher.add(r.visitor_hash);
    proMonat.get(monat)!.aufrufe++;
    proMonat.get(monat)!.besucher.add(r.visitor_hash);
    if (r.referrer) herkunft.set(r.referrer, (herkunft.get(r.referrer) ?? 0) + 1);
    seiten.set(r.path, (seiten.get(r.path) ?? 0) + 1);
  }

  // Letzte 30 Tage lückenlos (auch Tage mit 0 Aufrufen anzeigen)
  const tage: { datum: string; aufrufe: number; besucher: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const eintrag = proTag.get(key);
    tage.push({ datum: key, aufrufe: eintrag?.aufrufe ?? 0, besucher: eintrag?.besucher.size ?? 0 });
  }

  // Letzte 12 Monate lückenlos
  const monate: { monat: string; aufrufe: number; besucher: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const eintrag = proMonat.get(key);
    monate.push({ monat: key, aufrufe: eintrag?.aufrufe ?? 0, besucher: eintrag?.besucher.size ?? 0 });
  }

  const topHerkunft = [...herkunft.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topSeiten = [...seiten.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const gesamtJahr = rows?.length ?? 0;
  const heute = tage[tage.length - 1];

  return NextResponse.json({
    heute,
    gesamtJahr,
    tage,
    monate,
    topHerkunft: topHerkunft.map(([domain, aufrufe]) => ({ domain, aufrufe })),
    topSeiten: topSeiten.map(([path, aufrufe]) => ({ path, aufrufe })),
  });
}
