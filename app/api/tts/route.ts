import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vorlese-Route (Text-to-Speech) für die Mitarbeiter-App über Google Cloud
// Text-to-Speech. Liefert natürliche Stimmen für alle unterstützten Sprachen.
//   POST { text, sprache }  (sprache = z.B. "de-DE")  -> { audio: base64-MP3 }
// Nur für angemeldete Nutzer. Ohne GOOGLE_TTS_API_KEY antwortet die Route mit
// 503 — die App fällt dann automatisch auf die Gerätestimme (expo-speech) zurück.

// Bevorzugte, natürliche Stimmen je Sprache. Fällt eine davon aus (nicht
// verfügbar), wird ohne festen Namen erneut versucht (Google wählt selbst).
const VOICES: Record<string, string> = {
  "de-DE": "de-DE-Neural2-C",
  "en-US": "en-US-Neural2-F",
  "tr-TR": "tr-TR-Wavenet-A",
  "ru-RU": "ru-RU-Wavenet-C",
  "uk-UA": "uk-UA-Wavenet-A",
  "pl-PL": "pl-PL-Wavenet-A",
  "ar-XA": "ar-XA-Wavenet-A",
  "ro-RO": "ro-RO-Wavenet-A",
};

// Ein paar Sprachcodes der App weichen von Google ab.
function googleLanguageCode(sprache: string): string {
  const map: Record<string, string> = { "ar-SA": "ar-XA" };
  return map[sprache] || sprache;
}

async function synth(apiKey: string, text: string, languageCode: string, name?: string) {
  const body: Record<string, unknown> = {
    input: { text },
    voice: name ? { languageCode, name } : { languageCode, ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
  };
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  const json = (await res.json()) as { audioContent?: string; error?: { message?: string } };
  return { ok: res.ok && !!json.audioContent, json };
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
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
    // Kein Schlüssel -> App nutzt die Gerätestimme.
    return NextResponse.json({ error: "Cloud-Stimme nicht eingerichtet." }, { status: 503 });
  }

  let text = "";
  let sprache = "de-DE";
  try {
    const body = await request.json();
    text = typeof body.text === "string" ? body.text.slice(0, 5000) : "";
    sprache = typeof body.sprache === "string" && body.sprache ? body.sprache : "de-DE";
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (!text.trim()) return NextResponse.json({ error: "Kein Text." }, { status: 400 });

  const languageCode = googleLanguageCode(sprache);
  try {
    // Erst mit bevorzugter Stimme, bei Fehler ohne festen Namen erneut.
    let ergebnis = await synth(apiKey, text, languageCode, VOICES[languageCode]);
    if (!ergebnis.ok) ergebnis = await synth(apiKey, text, languageCode);
    if (!ergebnis.ok) {
      const msg = ergebnis.json.error?.message || "Sprachausgabe fehlgeschlagen.";
      return NextResponse.json({ error: `Google: ${msg}` }, { status: 502 });
    }
    return NextResponse.json({ audio: ergebnis.json.audioContent });
  } catch {
    return NextResponse.json({ error: "Verbindung zu Google fehlgeschlagen." }, { status: 502 });
  }
}
