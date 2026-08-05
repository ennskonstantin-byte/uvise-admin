import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushNotifications } from "@/lib/expoPush";

// Verschickt Push-Nachrichten an Mitarbeiter*innen einer Firma (neue
// Zuweisung, neue Rückfrage, neue Antwort). Läuft serverseitig mit dem
// Service-Role-Key, weil ein normaler Mitarbeiter laut RLS nicht die
// push_tokens-Zeile von Kolleg*innen lesen darf (nur Beauftragte dürfen
// das) — hier wird stattdessen geprüft, dass Aufrufer*in und alle
// Ziel-Mitarbeiter zur selben Firma gehören, bevor irgendetwas verschickt
// wird.
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht vollständig konfiguriert." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  if (!accessToken) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { employeeIds, notifyBeauftragte, title, body } = await request.json();
  const hasIds = Array.isArray(employeeIds) && employeeIds.length > 0;
  if ((!hasIds && !notifyBeauftragte) || !title || !body) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Aufrufer*in per eigenem Zugriffstoken identifizieren.
  const authedDb = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user },
  } = await authedDb.auth.getUser(accessToken);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const db = createClient(supabaseUrl, serviceKey);

  const { data: caller } = await db
    .from("employees")
    .select("company_id")
    .eq("auth_user_id", user.id)
    .single();
  if (!caller) {
    return NextResponse.json({ error: "Kein Mitarbeiter-Profil gefunden." }, { status: 404 });
  }

  // Entweder gezielt an bestimmte Kolleg*innen ODER an alle Beauftragten der
  // eigenen Firma (z.B. neue Rückfrage — die/der fragende MA kennt deren
  // Mitarbeiter-ID nicht und darf sie laut RLS auch nicht selbst nachschlagen).
  // Zwei Schritte statt eines Joins: push_tokens hängt am Auth-Konto
  // (user_id), nicht am fachlichen Mitarbeiter-Datensatz — genau deshalb
  // gibt es zwischen employees und push_tokens keine FK-Beziehung, über die
  // PostgREST automatisch verschachteln könnte (s. Migration 0064).
  // [Fix-Cluster 8, Punkt 5] Aufrufer*in nie selbst benachrichtigen -- ohne
  // diesen Ausschluss bekam eine fragende Person, die zufällig SELBST
  // Beauftragte*r ist (z.B. eine Führungskraft, die auch als Mitarbeiter*in
  // in der App signiert), ihre eigene "Neue Rückfrage"-Push-Meldung, weil
  // sie in der eigenen Zielliste (ist_beauftragter = true) mit auftauchte.
  let query = db
    .from("employees")
    .select("auth_user_id")
    .eq("company_id", caller.company_id)
    .neq("auth_user_id", user.id);
  query = notifyBeauftragte ? query.eq("ist_beauftragter", true) : query.in("id", employeeIds);
  const { data: targets } = await query;

  const userIds = (targets ?? []).map((t) => t.auth_user_id).filter((id): id is string => !!id);
  const { data: tokenRows } = userIds.length
    ? await db.from("push_tokens").select("token").in("user_id", userIds)
    : { data: [] };

  const tokens = (tokenRows ?? []).map((t) => t.token);
  const gueltigeTokens = tokens.filter((t): t is string => !!t && t.startsWith("ExponentPushToken"));
  await sendPushNotifications(tokens, title, body);

  return NextResponse.json({ ok: true, empfaenger: gueltigeTokens.length });
}
