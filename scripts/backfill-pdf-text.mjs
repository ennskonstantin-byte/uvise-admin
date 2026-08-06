// [Cluster 9] Einmaliger Backfill: extrahiert pdf_text für ALLE bestehenden
// PDF-Unterweisungen, bei denen er noch fehlt (pdf_path gesetzt, pdf_text NULL).
//
// Hintergrund: Der native Chef-Client hat die Textextraktion früher nie
// angestoßen (jetzt behoben). Alle vor dem Fix per App hochgeladenen PDFs haben
// deshalb noch keinen pdf_text — die MA-App zeigt bei ihnen „kein Text
// beigefügt" und kann sie nicht vorlesen. Dieses Skript holt das nachträglich
// für den Bestand nach. Neue Uploads brauchen es nicht.
//
// Ausführen (im Ordner sicherakte-admin):
//   node scripts/backfill-pdf-text.mjs           # echte Ausführung
//   node scripts/backfill-pdf-text.mjs --dry-run # nur anzeigen, nichts schreiben
//
// Braucht .env.local mit:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (läuft mit Service-Role, um firmenübergreifend
//                                alle Bestands-PDFs zu erreichen — RLS umgehen)
//
// Sicher/idempotent: schreibt NUR Zeilen mit pdf_text IS NULL. Ein zweiter Lauf
// überspringt bereits gefüllte Einträge. Gescannte PDFs ohne Textebene bleiben
// bewusst leer (gleiche Regel wie /api/pdf-text: < 20 Zeichen => nicht speichern).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_ZEICHEN = 100_000;
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnv() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Fehlt: NEXT_PUBLIC_SUPABASE_URL und/oder SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: rows, error } = await db
    .from("trainings")
    .select("id, name, pdf_path")
    .not("pdf_path", "is", null)
    .is("pdf_text", null);
  if (error) {
    console.error("Abfrage fehlgeschlagen:", error.message);
    process.exit(1);
  }

  console.log(`${rows.length} PDF-Unterweisung(en) ohne pdf_text gefunden.${DRY_RUN ? " (DRY-RUN)" : ""}`);
  let ok = 0;
  let leer = 0;
  let fehler = 0;

  for (const t of rows) {
    let pdf = null;
    try {
      const { data: datei, error: ladeFehler } = await db.storage
        .from("training-documents")
        .download(t.pdf_path);
      if (ladeFehler || !datei) {
        console.warn(`  ⚠ ${t.name} (${t.id}): Download fehlgeschlagen — ${ladeFehler?.message ?? "keine Datei"}`);
        fehler++;
        continue;
      }
      const bytes = new Uint8Array(await datei.arrayBuffer());
      pdf = await getDocumentProxy(bytes);
      const ergebnis = await extractText(pdf, { mergePages: true });
      const text = (ergebnis.text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_ZEICHEN);

      if (text.length < 20) {
        console.log(`  – ${t.name}: kein verwertbarer Text (vermutlich Scan), übersprungen.`);
        leer++;
        continue;
      }
      if (DRY_RUN) {
        console.log(`  ✓ ${t.name}: ${text.length} Zeichen (würde gespeichert)`);
        ok++;
        continue;
      }
      const { error: schreibFehler } = await db
        .from("trainings")
        .update({ pdf_text: text })
        .eq("id", t.id)
        .is("pdf_text", null); // Nie einen inzwischen gefüllten Wert überschreiben.
      if (schreibFehler) {
        console.warn(`  ⚠ ${t.name}: Speichern fehlgeschlagen — ${schreibFehler.message}`);
        fehler++;
        continue;
      }
      console.log(`  ✓ ${t.name}: ${text.length} Zeichen gespeichert.`);
      ok++;
    } catch (err) {
      console.warn(`  ⚠ ${t.name} (${t.id}): Extraktion fehlgeschlagen — ${err instanceof Error ? err.message : String(err)}`);
      fehler++;
    } finally {
      await pdf?.cleanup().catch(() => {});
    }
  }

  console.log(`\nFertig: ${ok} extrahiert, ${leer} ohne Textebene (Scan), ${fehler} Fehler.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
