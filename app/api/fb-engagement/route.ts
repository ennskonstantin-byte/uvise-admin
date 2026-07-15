import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isOwnerEmail } from "@/lib/owner";
import { GRAPH, resolvePageAuth } from "@/lib/metaGraph";

// Betreiber-Route: holt Likes + Kommentare zu veröffentlichten Facebook-Posts
// für die „Veröffentlicht"-Galerie im Marketing-Tool.
//   POST { ids: string[] }  (Facebook-Beitragsnummern, max. 20)
//   -> { [id]: { likes, kommentareAnzahl, kommentare: [{name,text,datum}], permalink } }

async function betreiberPruefen(request: Request): Promise<true | NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
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
  return true;
}

type Kommentar = { name: string; text: string; datum: string };
type Engagement = {
  likes: number;
  kommentareAnzahl: number;
  kommentare: Kommentar[];
  permalink?: string;
  fehler?: boolean;
};

export async function POST(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth !== true) return auth;

  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.filter((x: unknown): x is string => typeof x === "string" && /^[0-9_]+$/.test(x)).slice(0, 20)
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "Keine Beitragsnummern übergeben." }, { status: 400 });
  }

  const pageAuth = await resolvePageAuth();
  if ("fehler" in pageAuth) {
    return NextResponse.json({ error: pageAuth.fehler }, { status: pageAuth.status });
  }

  const felder =
    "permalink_url,reactions.summary(true).limit(0),comments.summary(true).limit(25){message,from,created_time}";

  const eintraege = await Promise.all(
    ids.map(async (id): Promise<[string, Engagement]> => {
      try {
        const res = await fetch(
          `${GRAPH}/${encodeURIComponent(id)}?fields=${encodeURIComponent(felder)}&access_token=${encodeURIComponent(pageAuth.pageToken)}`,
        );
        const json = (await res.json()) as {
          permalink_url?: string;
          reactions?: { summary?: { total_count?: number } };
          comments?: {
            summary?: { total_count?: number };
            data?: { message?: string; from?: { name?: string }; created_time?: string }[];
          };
          error?: { message?: string };
        };
        if (!res.ok || json.error) {
          return [id, { likes: 0, kommentareAnzahl: 0, kommentare: [], fehler: true }];
        }
        const kommentare: Kommentar[] = (json.comments?.data ?? []).map((k) => ({
          name: k.from?.name || "Facebook-Nutzer",
          text: k.message || "",
          datum: k.created_time || "",
        }));
        return [
          id,
          {
            likes: json.reactions?.summary?.total_count ?? 0,
            kommentareAnzahl: json.comments?.summary?.total_count ?? kommentare.length,
            kommentare,
            permalink: json.permalink_url,
          },
        ];
      } catch {
        return [id, { likes: 0, kommentareAnzahl: 0, kommentare: [], fehler: true }];
      }
    }),
  );

  return NextResponse.json({ engagement: Object.fromEntries(eintraege) });
}
