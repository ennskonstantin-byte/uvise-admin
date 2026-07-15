import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isOwnerEmail } from "@/lib/owner";
import { GRAPH, resolvePageAuth } from "@/lib/metaGraph";

// Betreiber-Route: veröffentlicht einen Social-Post auf der uVise-Facebook-Seite
// über die Meta Graph API. Instagram folgt, sobald Metas App-Review durch ist.
//   POST { id, text, bildUrl } -> postet auf Facebook, setzt Status "veroeffentlicht"

async function betreiberPruefen(request: Request): Promise<{ db: SupabaseClient } | NextResponse> {
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
  return { db: createClient(supabaseUrl, serviceKey) };
}


export async function POST(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;
  const db = auth.db;

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : null;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const bildUrl = typeof body.bildUrl === "string" && body.bildUrl.trim() ? body.bildUrl.trim() : null;

  if (!id || !text) {
    return NextResponse.json({ error: "Beitrag oder Text fehlt." }, { status: 400 });
  }

  // Seiten-Nummer + Seiten-Token auflösen (gemeinsamer Helfer, lib/metaGraph.ts).
  const auth2 = await resolvePageAuth();
  if ("fehler" in auth2) {
    return NextResponse.json({ error: auth2.fehler }, { status: auth2.status });
  }
  const { pageId, pageToken } = auth2;

  // Ein Veröffentlichungs-Versuch an einen Graph-Endpunkt.
  type FbResult = { id?: string; post_id?: string; error?: { message?: string; code?: number } };
  async function versuch(endpoint: string, felder: Record<string, string>): Promise<{ ok: boolean; json: FbResult }> {
    const params = new URLSearchParams({ access_token: pageToken as string, ...felder });
    const res = await fetch(endpoint, { method: "POST", body: params });
    const json = (await res.json()) as FbResult;
    return { ok: res.ok && !json.error, json };
  }

  // Mit Bild zuerst /photos versuchen. Fehlt die Bild-Berechtigung
  // (z. B. pages_manage_metadata), fällt es automatisch auf einen reinen
  // Text-Beitrag (/feed) zurück, damit der Beitrag trotzdem rausgeht.
  let fbJson: FbResult;
  let ohneBild = false;
  try {
    if (bildUrl) {
      const mitBild = await versuch(`${GRAPH}/${pageId}/photos`, { url: bildUrl, caption: text });
      if (mitBild.ok) {
        fbJson = mitBild.json;
      } else {
        const textNur = await versuch(`${GRAPH}/${pageId}/feed`, { message: text });
        if (!textNur.ok) {
          const msg = textNur.json.error?.message || mitBild.json.error?.message || "Facebook hat die Veröffentlichung abgelehnt.";
          return NextResponse.json({ error: `Facebook: ${msg}` }, { status: 502 });
        }
        fbJson = textNur.json;
        ohneBild = true;
      }
    } else {
      const textNur = await versuch(`${GRAPH}/${pageId}/feed`, { message: text });
      if (!textNur.ok) {
        const msg = textNur.json.error?.message || "Facebook hat die Veröffentlichung abgelehnt.";
        return NextResponse.json({ error: `Facebook: ${msg}` }, { status: 502 });
      }
      fbJson = textNur.json;
    }
  } catch {
    return NextResponse.json(
      { error: "Verbindung zu Facebook fehlgeschlagen. Bitte später erneut versuchen." },
      { status: 502 },
    );
  }

  // Facebook-Beitragsnummer + Veröffentlichungszeitpunkt merken (für die Galerie).
  // Rückfall ohne die neuen Spalten, falls Migration 0031/0032 noch fehlt.
  const fbPostId = fbJson.post_id || fbJson.id || null;
  const jetzt = new Date().toISOString();
  let updErr = (
    await db
      .from("social_posts")
      .update({ status: "veroeffentlicht", fb_post_id: fbPostId, veroeffentlicht_am: jetzt })
      .eq("id", id)
  ).error;
  if (updErr) {
    updErr = (await db.from("social_posts").update({ status: "veroeffentlicht" }).eq("id", id)).error;
  }
  if (updErr) {
    // Post ist raus, nur der Status-Vermerk klemmt — nicht als Fehler werten.
    return NextResponse.json({ ok: true, warnung: "Veröffentlicht, aber Status nicht gespeichert." });
  }

  return NextResponse.json({
    ok: true,
    fbPostId: fbJson.post_id || fbJson.id,
    ...(ohneBild ? { warnung: "Als Text veröffentlicht — das Bild braucht noch eine zusätzliche Facebook-Berechtigung." } : {}),
  });
}
