import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isOwnerEmail } from "@/lib/owner";

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

const GRAPH = "https://graph.facebook.com/v21.0";

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

  const pageId = process.env.META_PAGE_ID || "61591740459257";
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageToken) {
    return NextResponse.json(
      {
        error:
          "Der Facebook-Zugang ist noch nicht eingerichtet. Bitte den Seiten-Zugriffstoken als META_PAGE_ACCESS_TOKEN bei Vercel eintragen und neu deployen.",
      },
      { status: 503 },
    );
  }

  // Mit Bild -> /photos (Bild aus öffentlicher URL), sonst -> /feed (nur Text).
  const params = new URLSearchParams({ access_token: pageToken });
  let endpoint: string;
  if (bildUrl) {
    endpoint = `${GRAPH}/${pageId}/photos`;
    params.set("url", bildUrl);
    params.set("caption", text);
  } else {
    endpoint = `${GRAPH}/${pageId}/feed`;
    params.set("message", text);
  }

  let fbJson: { id?: string; post_id?: string; error?: { message?: string } };
  try {
    const fbRes = await fetch(endpoint, { method: "POST", body: params });
    fbJson = await fbRes.json();
    if (!fbRes.ok || fbJson.error) {
      const msg = fbJson.error?.message || "Facebook hat die Veröffentlichung abgelehnt.";
      return NextResponse.json({ error: `Facebook: ${msg}` }, { status: 502 });
    }
  } catch {
    return NextResponse.json(
      { error: "Verbindung zu Facebook fehlgeschlagen. Bitte später erneut versuchen." },
      { status: 502 },
    );
  }

  const { error: updErr } = await db
    .from("social_posts")
    .update({ status: "veroeffentlicht" })
    .eq("id", id);
  if (updErr) {
    // Post ist raus, nur der Status-Vermerk klemmt — nicht als Fehler werten.
    return NextResponse.json({ ok: true, warnung: "Veröffentlicht, aber Status nicht gespeichert." });
  }

  return NextResponse.json({ ok: true, fbPostId: fbJson.post_id || fbJson.id });
}
