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
- WICHTIGSTE REGEL — Wortwitz: Jeder Beitrag MUSS einen echten sprachlichen Kniff haben: ein Wortspiel, eine überraschende Wendung, eine freche Pointe oder einen ironischen Kontrast. Der erste Satz ist ein Haken, der sofort sitzt und zum Schmunzeln bringt. Lieber frech und pointiert als brav und korrekt. Trotzdem nie albern, platt, kalauerig oder gezwungen — der Witz muss sitzen, nicht bemüht wirken.
- Deutsch, per "du", locker, Augenzwinkern.
- SEHR kurz: 1-3 knackige Sätze. Komm direkt auf den Punkt — kein Aufwärmen, kein Marketing-Blabla, kein langer Sermon.
- Ein konkretes Alltagsproblem oder ein klarer Nutzen, greifbar — nicht abstrakt über "Digitalisierung".
- Danach EINE eigene Zeile mit nur 2-3 passenden Hashtags.
- Keine erfundenen Zahlen oder Kundenstimmen, höchstens 1 Emoji, keine übertriebenen Versprechen.
- Zum Schluss ein ganz knapper Hinweis auf uvise.de (7 Tage kostenlos testen) — kurz halten.

So klingt der Ton — pointiert, mit Kniff (nur Stil-Beispiele, NICHT wörtlich übernehmen):
- "Zettelwirtschaft war gestern. Unterschrift aufs Handy — fertig."
- "Fristen im Kopf behalten? Überlass das Kopfrechnen lieber uns."
- "Der Ordner 'Unterweisungen 2019' vermisst dich nicht. Wir auch nicht."
- "Die Betriebsprüfung kommt bestimmt. Deine Nachweise ab jetzt auch."
- "Erste Hilfe kann jeder. An die Frist denken – das ist die Kunst."

Wenn du mehrere Beiträge schreibst, nutzt jeder einen ANDEREN Kniff — nicht mehrmals dasselbe Muster.`;

type Entwurf = { inhalt: string; bild_titel: string | null };

// Erzeugt über Claude `anzahl` Beitragsentwürfe (jeweils Text + kurzer Bild-Titel).
async function erzeugeEntwuerfe(
  apiKey: string,
  plattform: string,
  thema: string,
  anzahl: number
): Promise<Entwurf[]> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    // Marketing-Texte brauchen echten Wortwitz/Augenzwinkern — das kann das
    // kleine Haiku-Modell kaum, deshalb hier das stärkste Modell (Opus 4.8).
    // Der Chatbot bleibt bewusst auf Haiku (dort zählt Tempo/Kosten, nicht Witz).
    model: "claude-opus-4-8",
    max_tokens: Math.min(1500 + anzahl * 350, 20000),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Schreibe ${anzahl} unterschiedliche Beitragsentwürfe für ${plattform === "beide" ? "Facebook und Instagram" : plattform}. Thema: ${thema}.
Antworte NUR mit einem JSON-Array aus Objekten, ohne Erklärung und ohne Markdown-Codeblock. Jedes Objekt hat genau zwei Felder:
{"beitrag": "<der komplette Beitragstext inkl. Hashtags>", "titel": "<sehr kurzer, knackiger Bild-Titel: max. 6 Wörter, ca. 40 Zeichen, ohne Hashtags, ohne Emojis, bringt den Kern auf den Punkt>"}`,
      },
    ],
  });
  const antwort = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  try {
    const ohneFence = antwort.replace(/^```(json)?/mi, "").replace(/```$/m, "").trim();
    // Falls das Modell doch etwas Text um das JSON schreibt: nur den Array-Teil
    // (von der ersten "[" bis zur letzten "]") herausschneiden und auswerten.
    const start = ohneFence.indexOf("[");
    const ende = ohneFence.lastIndexOf("]");
    const roh = start !== -1 && ende > start ? ohneFence.slice(start, ende + 1) : ohneFence;
    const parsed = JSON.parse(roh);
    if (Array.isArray(parsed)) {
      return parsed
        .map((e): Entwurf | null => {
          if (e && typeof e === "object" && typeof e.beitrag === "string" && e.beitrag.trim()) {
            const titel = typeof e.titel === "string" && e.titel.trim() ? e.titel.trim().slice(0, 80) : null;
            return { inhalt: e.beitrag.trim(), bild_titel: titel };
          }
          if (typeof e === "string" && e.trim()) return { inhalt: e.trim(), bild_titel: null };
          return null;
        })
        .filter((e): e is Entwurf => e !== null);
    }
  } catch {
    // Fällt unten auf den Roh-Text zurück.
  }
  return antwort.trim() ? [{ inhalt: antwort.trim(), bild_titel: null }] : [];
}

export async function POST(request: Request) {
  const auth = await betreiberPruefen(request);
  if (auth instanceof NextResponse) return auth;
  const db = auth.db;

  const body = await request.json();

  const KEIN_KEY = "Der KI-Textgenerator ist noch nicht eingerichtet. API-Key auf console.anthropic.com erzeugen und als ANTHROPIC_API_KEY bei Vercel eintragen.";

  if (body.aktion === "generieren") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: KEIN_KEY }, { status: 503 });
    const thema = typeof body.thema === "string" && body.thema.trim() ? body.thema.trim().slice(0, 500) : "freies Thema rund um Unterweisungen im Betrieb";
    const plattform = ["facebook", "instagram", "beide"].includes(body.plattform) ? body.plattform : "beide";
    const anzahl = Math.min(Math.max(parseInt(body.anzahl, 10) || 3, 1), 5);

    let entwuerfe: Entwurf[];
    try {
      entwuerfe = await erzeugeEntwuerfe(apiKey, plattform, thema, anzahl);
    } catch (e) {
      return NextResponse.json({ error: `KI-Fehler: ${(e as Error).message.slice(0, 300)}` }, { status: 502 });
    }
    if (entwuerfe.length === 0) {
      return NextResponse.json({ error: "Die KI hat keine verwertbaren Entwürfe geliefert — bitte erneut versuchen." }, { status: 502 });
    }
    const { data, error } = await db
      .from("social_posts")
      .insert(entwuerfe.map((e) => ({ plattform, thema, inhalt: e.inhalt, bild_titel: e.bild_titel, status: "entwurf" })))
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
  }

  if (body.aktion === "kampagne-erzeugen") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: KEIN_KEY }, { status: 503 });
    const start = typeof body.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.start) ? body.start : null;
    const schritt = Math.min(Math.max(parseInt(body.schritt, 10) || 1, 1), 30);
    const anzahl = Math.min(Math.max(parseInt(body.anzahl, 10) || 7, 1), 31);
    const plattform = ["facebook", "instagram", "beide"].includes(body.plattform) ? body.plattform : "beide";
    const thema = typeof body.thema === "string" && body.thema.trim() ? body.thema.trim().slice(0, 500) : "freies Thema rund um Unterweisungen im Betrieb";
    if (!start) return NextResponse.json({ error: "Ungültiges Startdatum." }, { status: 400 });

    let entwuerfe: Entwurf[];
    try {
      entwuerfe = await erzeugeEntwuerfe(apiKey, plattform, thema, anzahl);
    } catch (e) {
      return NextResponse.json({ error: `KI-Fehler: ${(e as Error).message.slice(0, 300)}` }, { status: 502 });
    }
    if (entwuerfe.length === 0) {
      return NextResponse.json({ error: "Die KI hat keine verwertbaren Entwürfe geliefert — bitte erneut versuchen." }, { status: 502 });
    }
    const rows = entwuerfe.map((e, i) => {
      const d = new Date(start + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + i * schritt);
      return {
        plattform,
        thema,
        inhalt: e.inhalt,
        bild_titel: e.bild_titel,
        status: "freigegeben",
        geplant_am: d.toISOString().slice(0, 10),
      };
    });
    const { data, error } = await db.from("social_posts").insert(rows).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
  }

  if (body.aktion === "neu-generieren") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: KEIN_KEY }, { status: 503 });
    if (!body.id) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    const { data: vorhanden, error: e0 } = await db
      .from("social_posts")
      .select("plattform, thema")
      .eq("id", body.id)
      .single();
    if (e0 || !vorhanden) return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });

    let entwuerfe: Entwurf[];
    try {
      entwuerfe = await erzeugeEntwuerfe(
        apiKey,
        vorhanden.plattform,
        vorhanden.thema || "freies Thema rund um Unterweisungen im Betrieb",
        1
      );
    } catch (e) {
      return NextResponse.json({ error: `KI-Fehler: ${(e as Error).message.slice(0, 300)}` }, { status: 502 });
    }
    if (entwuerfe.length === 0) {
      return NextResponse.json({ error: "Die KI hat keinen Text geliefert — bitte erneut versuchen." }, { status: 502 });
    }
    const { error } = await db
      .from("social_posts")
      .update({ inhalt: entwuerfe[0].inhalt, bild_titel: entwuerfe[0].bild_titel })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
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

  if (body.aktion === "plan-setzen") {
    const datum =
      body.datum === null
        ? null
        : typeof body.datum === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.datum)
        ? body.datum
        : undefined;
    if (!body.id || datum === undefined) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    const { error } = await db.from("social_posts").update({ geplant_am: datum }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.aktion === "plan-verteilen") {
    const start = typeof body.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.start) ? body.start : null;
    const schritt = Math.min(Math.max(parseInt(body.schritt, 10) || 1, 1), 30);
    if (!start) return NextResponse.json({ error: "Ungültiges Startdatum." }, { status: 400 });
    const { data, error: e1 } = await db
      .from("social_posts")
      .select("id")
      .eq("status", "freigegeben")
      .order("created_at", { ascending: true });
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    const liste = data ?? [];
    for (let i = 0; i < liste.length; i++) {
      const d = new Date(start + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + i * schritt);
      const iso = d.toISOString().slice(0, 10);
      const { error } = await db.from("social_posts").update({ geplant_am: iso }).eq("id", liste[i].id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, anzahl: liste.length });
  }

  if (body.aktion === "loeschen") {
    if (!body.id) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    const { error } = await db.from("social_posts").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.aktion === "alle-loeschen") {
    // Veröffentlichte Beiträge bleiben erhalten (Galerie) — nur Entwürfe,
    // Freigegebene und Verworfene werden entfernt.
    const { error } = await db.from("social_posts").delete().neq("status", "veroeffentlicht");
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
