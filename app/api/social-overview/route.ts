import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isOwnerEmail } from "@/lib/owner";
import { GRAPH, resolvePageAuth } from "@/lib/metaGraph";

// Betreiber-Route: Social-Media-Überblick fürs Dashboard.
// Liefert Follower-Zahl der Facebook-Seite sowie Likes + Kommentare, über alle
// veröffentlichten Beiträge zusammengezählt, plus die neuesten Kommentare.
//   GET -> { followers, likesGesamt, kommentareGesamt, posts, letzteKommentare }

async function betreiberPruefen(request: Request): Promise<{ db: SupabaseClient } | NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const {
    data: { user },
  } = await createClient(url, anon).auth.getUser(accessToken);
  if (!user || !isOwnerEmail(user.email)) {
    return NextResponse.json({ error: "Nur für den Betreiber verfügbar." }, { status: 403 });
  }
  return { db: createClient(url, serviceKey) };
}

type Kommentar = { name: string; text: string; datum: string };

export async function GET(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;

  const pageAuth = await resolvePageAuth();
  if ("fehler" in pageAuth) {
    // Kein Facebook-Zugang -> leere, aber gültige Antwort (Karte zeigt Hinweis).
    return NextResponse.json({ eingerichtet: false });
  }
  const { pageId, pageToken } = pageAuth;

  // Follower-/Fan-Zahl der Seite
  let followers = 0;
  try {
    const res = await fetch(
      `${GRAPH}/${pageId}?fields=followers_count,fan_count&access_token=${encodeURIComponent(pageToken)}`,
    );
    const json = (await res.json()) as { followers_count?: number; fan_count?: number };
    followers = json.followers_count ?? json.fan_count ?? 0;
  } catch {
    /* ignorieren */
  }

  // Veröffentlichte Beiträge mit Facebook-Nummer holen
  const { data: rows } = await auth.db
    .from("social_posts")
    .select("fb_post_id")
    .eq("status", "veroeffentlicht")
    .not("fb_post_id", "is", null)
    .order("veroeffentlicht_am", { ascending: false })
    .limit(25);
  const ids = (rows ?? []).map((r) => r.fb_post_id as string).filter(Boolean);

  let likesGesamt = 0;
  let kommentareGesamt = 0;
  const letzteKommentare: Kommentar[] = [];

  const felder = "reactions.summary(true).limit(0),comments.summary(true).limit(5){message,from,created_time}";
  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(
          `${GRAPH}/${encodeURIComponent(id)}?fields=${encodeURIComponent(felder)}&access_token=${encodeURIComponent(pageToken)}`,
        );
        const json = (await res.json()) as {
          reactions?: { summary?: { total_count?: number } };
          comments?: {
            summary?: { total_count?: number };
            data?: { message?: string; from?: { name?: string }; created_time?: string }[];
          };
        };
        likesGesamt += json.reactions?.summary?.total_count ?? 0;
        kommentareGesamt += json.comments?.summary?.total_count ?? 0;
        for (const k of json.comments?.data ?? []) {
          letzteKommentare.push({
            name: k.from?.name || "Facebook-Nutzer",
            text: k.message || "",
            datum: k.created_time || "",
          });
        }
      } catch {
        /* einzelnen Post überspringen */
      }
    }),
  );

  letzteKommentare.sort((a, b) => (a.datum < b.datum ? 1 : -1));

  return NextResponse.json({
    eingerichtet: true,
    followers,
    postsGesamt: ids.length,
    likesGesamt,
    kommentareGesamt,
    letzteKommentare: letzteKommentare.slice(0, 8),
  });
}
