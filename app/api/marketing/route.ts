import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { isOwnerEmail } from "@/lib/owner";

// Betreiber-Route für Social-Media-Beiträge:
//   GET             -> alle Beiträge (neueste zuerst)
//   POST {aktion:"generieren", thema, plattform, anzahl} -> KI-Entwürfe über Claude (Anthropic)
//   POST {aktion:"speichern", id, inhalt}                -> Text bearbeiten
//   POST {aktion:"status", id, status}                   -> freigeben/verwerfen/zurück zu Entwurf
// Veröffentlichen zu Facebook/Instagram folgt erst mit der Meta-Anbindung.

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

export async function GET(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await auth.db
    .from("social_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

const SYSTEM_PROMPT = `Du schreibst Social-Media-Beiträge für uVise (uvise.de) — eine deutsche Software,
mit der kleine Betriebe die Arbeitsschutz-Unterweisungen und Qualifikationen ihrer
Mitarbeiter digital verwalten: Unterweisung aufs Handy schicken, Mitarbeiter liest
und signiert, Chef sieht den Nachweis — inkl. Ampelsystem für Fristen,
automatischen Erinnerungen, Vorlesen/Übersetzen für Mitarbeiter, die schlecht
Deutsch lesen. Zielgruppe: Chefs/Inhaber kleiner Betriebe (Handwerk, Produktion,
Gastro, Lager), 5-30 Mitarbeiter, wenig Zeit, kein Bürokratie-Fan.

Regeln:
- Deutsch, per "du", locker und mit Augenzwinkern — gern ein kleiner Wortwitz oder eine pointierte Zeile, aber nie albern, platt oder gezwungen.
- SEHR kurz: 1-3 knackige Sätze. Starte mit einem Haken, der sofort sitzt. Komm direkt auf den Punkt — kein Aufwärmen, kein Marketing-Blabla, kein langer Sermon.
- Ein konkretes Alltagsproblem oder ein klarer Nutzen, greifbar — nicht abstrakt über "Digitalisierung".
- Danach EINE eigene Zeile mit nur 2-3 passenden Hashtags.
- Keine erfundenen Zahlen oder Kundenstimmen, höchstens 1 Emoji, keine übertriebenen Versprechen.
- Zum Schluss ein ganz knapper Hinweis auf uvise.de (7 Tage kostenlos testen) — kurz halten.

So klingt der Ton (nur als Stil-Beispiel, NICHT wörtlich übernehmen):
- "Zettelwirtschaft war gestern. Unterschrift aufs Handy — fertig."
- "Fristen im Kopf behalten? Überlass das Kopfrechnen lieber uns."`;

export async function POST(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;
  const db = auth.db;

  const body = await request.json();

  if (body.aktion === "generieren") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Der KI-Textgenerator ist noch nicht eingerichtet. API-Key auf console.anthropic.com erzeugen und als ANTHROPIC_API_KEY bei Vercel eintragen.",
        },
        { status: 503 }
      );
    }
    const thema = typeof body.thema === "string" && body.thema.trim() ? body.thema.trim().slice(0, 500) : "freies Thema rund um Unterweisungen im Betrieb";
    const plattform = ["facebook", "instagram", "beide"].includes(body.plattform) ? body.plattform : "beide";
    const anzahl = Math.min(Math.max(parseInt(body.anzahl, 10) || 3, 1), 5);

    let antwort = "";
    try {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Schreibe ${anzahl} unterschiedliche Beitragsentwürfe für ${plattform === "beide" ? "Facebook und Instagram" : plattform}. Thema: ${thema}. Antworte NUR mit einem JSON-Array aus Strings, ein String pro Beitrag, ohne Erklärung.`,
          },
        ],
      });
      antwort = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
    } catch (e) {
      return NextResponse.json({ error: `KI-Fehler: ${(e as Error).message.slice(0, 300)}` }, { status: 502 });
    }

    let entwuerfe: string[];
    try {
      // Antwort kann in ```json ... ``` eingepackt sein — herausschälen.
      const roh = antwort.replace(/^```(json)?/m, "").replace(/```$/m, "").trim();
      const parsed = JSON.parse(roh);
      entwuerfe = Array.isArray(parsed) ? parsed.filter((e) => typeof e === "string" && e.trim()) : [];
    } catch {
      // Zur Not die ganze Antwort als einen Entwurf übernehmen.
      entwuerfe = antwort.trim() ? [antwort.trim()] : [];
    }
    if (entwuerfe.length === 0) {
      return NextResponse.json({ error: "Die KI hat keine verwertbaren Entwürfe geliefert — bitte erneut versuchen." }, { status: 502 });
    }

    const { data, error } = await db
      .from("social_posts")
      .insert(entwuerfe.map((inhalt) => ({ plattform, thema, inhalt, status: "entwurf" })))
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
  }

  if (body.aktion === "speichern") {
    if (!body.id || typeof body.inhalt !== "string" || !body.inhalt.trim()) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    const { error } = await db.from("social_posts").update({ inhalt: body.inhalt.trim() }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.aktion === "status") {
    if (!body.id || !["entwurf", "freigegeben", "verworfen"].includes(body.status)) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    const update: Record<string, unknown> = { status: body.status };
    if (body.status === "freigegeben") update.freigegeben_am = new Date().toISOString();
    const { error } = await db.from("social_posts").update(update).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.aktion === "bild-hochladen") {
    const dataUrl = typeof body.bild === "string" ? body.bild : "";
    if (!body.id || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Ungültiges Bild." }, { status: 400 });
    }
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return NextResponse.json({ error: "Ungültiges Bildformat." }, { status: 400 });
    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 6 * 1024 * 1024) {
      return NextResponse.json({ error: "Bild zu groß (max. 6 MB)." }, { status: 413 });
    }
    const ext = (contentType.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const pfad = `${body.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("marketing-bilder")
      .upload(pfad, buffer, { contentType, upsert: true });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    const { data: pub } = db.storage.from("marketing-bilder").getPublicUrl(pfad);
    const { error } = await db.from("social_posts").update({ bild_url: pub.publicUrl }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, bild_url: pub.publicUrl });
  }

  if (body.aktion === "bild-entfernen") {
    if (!body.id) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    const { error } = await db.from("social_posts").update({ bild_url: null }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
