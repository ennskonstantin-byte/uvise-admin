import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";

// Extrahiert den Text aus einer bereits hochgeladenen PDF-Unterweisung und
// legt ihn in trainings.pdf_text ab (Migration 0068), damit die Mitarbeiter-App
// ihn vorlesen kann. Vorher war bei PDF-Unterweisungen trainings.inhalt leer
// und der Mitarbeiter bekam "kein Text vorhanden", obwohl das PDF sichtbar war.
//
//   POST { trainingId } -> { ok: true, laenge: number }
//
// WICHTIG -- diese Route darf NIE nach außen scheitern:
// Der Aufrufer (lib/store.tsx) ruft sie NACH dem erfolgreichen Speichern der
// Unterweisung auf. Schlägt die Extraktion fehl (gescanntes PDF ohne Textebene,
// kaputte Datei, Zeitüberschreitung), bleibt pdf_text schlicht leer und die App
// zeigt weiterhin die ehrliche "kein Text"-Meldung. Ein Fehler hier darf das
// Anlegen der Unterweisung NICHT rückgängig machen -- deshalb antwortet die
// Route auch im Fehlerfall mit 200 und einem Grund im Feld "grund".
//
// Warum kein Service-Key: Es wird durchgehend mit dem Token des aufrufenden
// Nutzers gearbeitet. Damit greifen die normalen RLS- und Storage-Regeln --
// wer die Unterweisung nicht lesen darf, kommt auch hier nicht an die PDF.

// pdf-parse ist eine Node-Bibliothek (kein Edge-Runtime).
export const runtime = "nodejs";
// PDF-Parsen kann bei großen Dokumenten ein paar Sekunden dauern.
// Achtung: Auf dem Vercel-Hobby-Plan ist das Limit niedriger als hier
// angegeben -- die Route bricht dann ab, was durch den stillen Fehlschlag
// oben aber abgefangen ist (pdf_text bleibt leer).
export const maxDuration = 60;

// Obergrenze für den gespeicherten Text. Eine Unterweisung, die länger ist,
// ist zum Vorlesen ohnehin nicht mehr sinnvoll -- und schützt die Datenbank
// vor einem einzelnen 500-Seiten-Handbuch.
const MAX_ZEICHEN = 100_000;

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  // Client im Namen des Nutzers -- alle folgenden Zugriffe laufen unter dessen
  // eigenen Rechten (RLS + Storage-Policies).
  const db = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
  } = await db.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  let trainingId = "";
  try {
    const body = await request.json();
    trainingId = typeof body.trainingId === "string" ? body.trainingId : "";
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (!trainingId) return NextResponse.json({ error: "trainingId fehlt." }, { status: 400 });

  // Ab hier gilt: kein harter Fehler mehr nach außen (siehe Kopfkommentar).
  let parser: PDFParse | null = null;
  try {
    const { data: training, error: leseFehler } = await db
      .from("trainings")
      .select("id, pdf_path")
      .eq("id", trainingId)
      .single();
    // Kein Treffer heißt hier: existiert nicht ODER RLS verbietet den Zugriff.
    // Beides ist von außen nicht unterscheidbar und wird bewusst nicht verraten.
    if (leseFehler || !training?.pdf_path) {
      console.error("[pdf-text] Unterweisung oder pdf_path nicht lesbar", {
        trainingId,
        fehler: leseFehler?.message,
      });
      return NextResponse.json({ ok: false, grund: "nicht-lesbar" });
    }

    const { data: datei, error: ladeFehler } = await db.storage
      .from("training-documents")
      .download(training.pdf_path);
    if (ladeFehler || !datei) {
      console.error("[pdf-text] PDF konnte nicht aus dem Speicher geladen werden", {
        trainingId,
        pfad: training.pdf_path,
        fehler: ladeFehler?.message,
      });
      return NextResponse.json({ ok: false, grund: "download-fehlgeschlagen" });
    }

    const bytes = new Uint8Array(await datei.arrayBuffer());
    parser = new PDFParse({ data: bytes });
    const ergebnis = await parser.getText();

    // Mehrfache Leerzeichen/Zeilenumbrüche zusammenfassen: PDF-Text kommt oft
    // mit Spaltenumbrüchen aus dem Layout, die eine Vorlesestimme sonst als
    // zerhackte Pausen wiedergibt.
    const text = (ergebnis.text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_ZEICHEN);

    // Gescanntes PDF ohne Textebene: pdfjs liefert dann einen leeren oder
    // fast leeren String. Das ist kein Fehler, sondern ein gültiger Zustand --
    // pdf_text bleibt NULL und die App zeigt die ehrliche Meldung.
    if (text.length < 20) {
      console.error("[pdf-text] Keine verwertbare Textebene im PDF (vermutlich ein Scan)", {
        trainingId,
        gefundeneZeichen: text.length,
      });
      return NextResponse.json({ ok: false, grund: "kein-text-im-pdf" });
    }

    const { error: schreibFehler } = await db
      .from("trainings")
      .update({ pdf_text: text })
      .eq("id", trainingId);
    if (schreibFehler) {
      console.error("[pdf-text] pdf_text konnte nicht gespeichert werden", {
        trainingId,
        fehler: schreibFehler.message,
      });
      return NextResponse.json({ ok: false, grund: "speichern-fehlgeschlagen" });
    }

    return NextResponse.json({ ok: true, laenge: text.length });
  } catch (err) {
    console.error("[pdf-text] Textextraktion fehlgeschlagen", {
      trainingId,
      fehler: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: false, grund: "extraktion-fehlgeschlagen" });
  } finally {
    // pdfjs hält einen Worker offen -- ohne destroy() bleibt der Prozess belegt.
    await parser?.destroy().catch(() => {});
  }
}
