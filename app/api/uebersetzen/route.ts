import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// Übersetzungs-Route für die Mitarbeiter-App: übersetzt den Unterweisungstext
// in die gewünschte Sprache (per Claude). Damit können Mitarbeiter, die schlecht
// Deutsch lesen, die Unterweisung in ihrer Sprache lesen und vorlesen lassen.
//   POST { text, zielSprache } -> { uebersetzung }
// Zugriff nur für angemeldete Nutzer (Supabase-Token), damit die (kostenpflichtige)
// KI nicht anonym missbraucht werden kann.

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const {
    data: { user },
  } = await createClient(supabaseUrl, supabaseAnonKey).auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  if (!apiKey) {
    return NextResponse.json(
      { error: "Übersetzung ist noch nicht eingerichtet (ANTHROPIC_API_KEY fehlt)." },
      { status: 503 },
    );
  }

  let text = "";
  let zielSprache = "";
  try {
    const body = await request.json();
    text = typeof body.text === "string" ? body.text.slice(0, 8000) : "";
    zielSprache = typeof body.zielSprache === "string" ? body.zielSprache.slice(0, 60) : "";
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (!text.trim() || !zielSprache.trim()) {
    return NextResponse.json({ error: "Text oder Zielsprache fehlt." }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      // temperature 0: maximal deterministisch statt kreativ -- bei einer
      // rechtlich relevanten Unterweisung soll dieselbe Anfrage immer
      // dieselbe, vorhersagbare Übersetzung liefern (weniger Spielraum,
      // versehentlich in eine andere Sprache abzudriften).
      temperature: 0,
      system:
        `Du bist ein professioneller Übersetzer für Arbeitsschutz-Unterweisungen. ` +
        `Deine EINZIGE Zielsprache für diese Anfrage ist: ${zielSprache}. Übersetze ` +
        `ausschließlich nach ${zielSprache} -- in KEINE andere Sprache, auch wenn der ` +
        `Ausgangstext Wörter aus einer anderen Sprache enthält. Übersetze den Text ` +
        `originalgetreu und vollständig. Behalte Absätze und Aufzählungen bei. ` +
        `Übersetze fachlich korrekt und gut verständlich. ` +
        `Antworte AUSSCHLIESSLICH mit der reinen Übersetzung auf ${zielSprache} -- ` +
        `ohne Vorbemerkung, ohne Anführungszeichen, ohne Erklärung, ohne den Namen der Zielsprache zu nennen.`,
      messages: [
        {
          role: "user",
          content: `Übersetze den folgenden Text vollständig nach ${zielSprache}:\n\n${text}`,
        },
      ],
    });
    const uebersetzung = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!uebersetzung) {
      return NextResponse.json({ error: "Übersetzung fehlgeschlagen." }, { status: 502 });
    }
    return NextResponse.json({ uebersetzung });
  } catch (e) {
    return NextResponse.json({ error: `Übersetzungsfehler: ${(e as Error).message.slice(0, 200)}` }, { status: 502 });
  }
}
