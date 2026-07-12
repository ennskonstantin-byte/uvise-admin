// RLS-Negativtests (M-3 aus dem Security-Review): meldet sich als normaler,
// nicht-beauftragter Mitarbeiter an und versucht gezielt die Dinge, die laut
// Review vorher möglich waren. JEDER Versuch MUSS fehlschlagen — schlägt
// einer NICHT fehl, ist die entsprechende Migration nicht (oder falsch)
// angewendet.
//
// Ausführen: node scripts/rls-negative-tests.mjs
// Braucht .env.local mit NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.
// Voraussetzung: Migrationen 0014–0019 wurden im Supabase SQL-Editor
// ausgeführt, BEVOR dieses Skript läuft.
//
// Nutzt den bestehenden Test-Mitarbeiter-Login der Firma "HS GMBH"
// (lena.nord@example.com) — keine neuen Konten, keine echten Kundendaten.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function loadEnv() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_ || !ANON) throw new Error("NEXT_PUBLIC_SUPABASE_URL/ANON_KEY fehlen in .env.local");

const LENA_EMAIL = "lena.nord@example.com";
const LENA_PASSWORD = "Lena1234!";

let passed = 0;
let failed = 0;

function report(label, ok, detail) {
  if (ok) {
    passed++;
    console.log(`✅ ${label}`);
  } else {
    failed++;
    console.log(`❌ ${label}${detail ? " — " + detail : ""}`);
  }
}

async function main() {
  const supabase = createClient(URL_, ANON);

  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email: LENA_EMAIL,
    password: LENA_PASSWORD,
  });
  if (signInErr) throw new Error(`Login als ${LENA_EMAIL} fehlgeschlagen: ${signInErr.message}`);

  const { data: me, error: meErr } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", signIn.user.id)
    .single();
  if (meErr) throw new Error(`Konnte eigenes Profil nicht laden: ${meErr.message}`);

  // Sicherheits-Check: Ohne die Migrationen 0014–0019 würden die folgenden
  // Tests ECHTE Schreibzugriffe erfolgreich durchführen (nicht nur fehlschlagen-
  // wie-erwartet) — inkl. eines PERMANENTEN Signierens einer echten
  // Unterweisungs-Zuweisung (Migration 0013 macht das unumkehrbar). Genau das
  // ist beim ersten Schreiben dieses Skripts versehentlich passiert (und beim
  // ersten Versuch, diesen Check nachzurüsten, noch einmal, weil der Check
  // selbst einen RPC-Aufruf mit Seiteneffekt nutzte statt rein lesend zu
  // prüfen). Deshalb jetzt bewusst ohne jeden Schreibversuch: invite_token
  // ist eine Spalte aus Migration 0016 — fehlt sie, sind die Migrationen
  // sicher noch nicht angewendet.
  const { error: columnCheckErr } = await supabase.from("employees").select("invite_token").limit(1);
  const migrationsApplied = !columnCheckErr;
  if (!migrationsApplied) {
    console.error(
      "\n❌ Migrationen 0014–0019 scheinen noch NICHT angewendet zu sein (Spalte employees.invite_token fehlt).\n" +
        "   Dieses Skript NICHT vor den Migrationen ausführen — sonst gehen die\n" +
        "   folgenden Schreibversuche tatsächlich durch (siehe Kommentar oben im Code).\n" +
        "   Erst alle Migrationen im Supabase SQL-Editor ausführen, dann erneut starten."
    );
    await supabase.auth.signOut();
    process.exit(1);
  }

  console.log(`Eingeloggt als ${me.vorname} ${me.nachname} (ist_beauftragter=${me.ist_beauftragter})\n`);

  // ---------------------------------------------------------------------
  // K-1: Selbst-Beförderung zum Beauftragten
  // ---------------------------------------------------------------------
  {
    const { error } = await supabase
      .from("employees")
      .update({ ist_beauftragter: true })
      .eq("id", me.id);
    report("K-1: Selbst-Beförderung zum Beauftragten blockiert", !!error, error ? undefined : "Update ist durchgegangen!");
  }

  // ---------------------------------------------------------------------
  // K-1: Firmenwechsel (Mandantensprung) über company_id
  // ---------------------------------------------------------------------
  {
    const { error } = await supabase
      .from("employees")
      .update({ company_id: "00000000-0000-0000-0000-000000000000" })
      .eq("id", me.id);
    report("K-1: Firmenwechsel über company_id blockiert", !!error, error ? undefined : "Update ist durchgegangen!");
  }

  // ---------------------------------------------------------------------
  // K-4: Rolle eines ANDEREN Mitarbeiters direkt setzen
  // ---------------------------------------------------------------------
  {
    const { data: others } = await supabase
      .from("employees")
      .select("id")
      .neq("id", me.id)
      .limit(1);
    if (others && others.length > 0) {
      const { error } = await supabase
        .from("employees")
        .update({ ist_beauftragter: true })
        .eq("id", others[0].id);
      report("K-4: Rolle eines Kollegen direkt setzen blockiert", !!error, error ? undefined : "Update ist durchgegangen!");
    } else {
      console.log("⚠️  K-4: kein zweiter Mitarbeiter zum Testen gefunden, übersprungen");
    }
  }

  // ---------------------------------------------------------------------
  // H-2: Eigene Unterweisung direkt (ohne RPC) auf "signiert" setzen
  // ---------------------------------------------------------------------
  {
    const { data: ownTraining } = await supabase
      .from("employee_trainings")
      .select("id, status")
      .eq("employee_id", me.id)
      .eq("status", "offen")
      .limit(1);
    if (ownTraining && ownTraining.length > 0) {
      const { error } = await supabase
        .from("employee_trainings")
        .update({ status: "signiert", signiert_am: "2020-01-01T00:00:00Z" })
        .eq("id", ownTraining[0].id);
      report("H-2: Direktes Signieren ohne RPC blockiert", !!error, error ? undefined : "Update ist durchgegangen!");
    } else {
      console.log("⚠️  H-2: keine offene Unterweisung zum Testen gefunden, übersprungen");
    }
  }

  // ---------------------------------------------------------------------
  // M-1: Eigene Rückfrage-Antwort selbst schreiben
  // ---------------------------------------------------------------------
  {
    const { data: ownQuestion } = await supabase
      .from("questions")
      .select("id")
      .eq("employee_id", me.id)
      .limit(1);
    if (ownQuestion && ownQuestion.length > 0) {
      const { error } = await supabase
        .from("questions")
        .update({ antwort: "von mir selbst beantwortet", status: "beantwortet" })
        .eq("id", ownQuestion[0].id);
      report("M-1: Eigene Antwort selbst schreiben blockiert", !!error, error ? undefined : "Update ist durchgegangen!");
    } else {
      console.log("⚠️  M-1: keine eigene Rückfrage zum Testen gefunden (harmlos, keine vorhanden), übersprungen");
    }
  }

  // ---------------------------------------------------------------------
  // K-3: Foto in fremdem Firmen-Ordner überschreiben
  // ---------------------------------------------------------------------
  {
    const fakeBytes = new Uint8Array([1, 2, 3]);
    const { error } = await supabase.storage
      .from("employee-photos")
      .upload("00000000-0000-0000-0000-000000000000/angriff.jpg", fakeBytes, { upsert: true });
    report("K-3: Schreiben in fremden Firmen-Ordner blockiert", !!error, error ? undefined : "Upload ist durchgegangen!");
  }

  // ---------------------------------------------------------------------
  // Positivkontrolle: legitime Aktionen dürfen weiterhin funktionieren
  // ---------------------------------------------------------------------
  {
    const { error } = await supabase.from("employees").select("id").eq("id", me.id).single();
    report("Positivkontrolle: eigenes Profil lesen funktioniert weiterhin", !error, error?.message);
  }
  {
    const { data: training } = await supabase.from("trainings").select("id").limit(1);
    if (training && training.length > 0) {
      const { error } = await supabase
        .from("questions")
        .insert({ employee_id: me.id, training_id: training[0].id, frage: "RLS-Test — bitte ignorieren", status: "offen" });
      report("Positivkontrolle: eigene Rückfrage stellen funktioniert weiterhin", !error, error?.message);
    }
  }

  await supabase.auth.signOut();

  console.log(`\n${passed} bestanden, ${failed} fehlgeschlagen.`);
  if (failed > 0) {
    console.log("\n⚠️  Mindestens ein Test ist NICHT wie erwartet fehlgeschlagen — die zugehörige Migration prüfen/erneut ausführen.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nFehler beim Testlauf:", err.message ?? err);
  process.exit(1);
});
