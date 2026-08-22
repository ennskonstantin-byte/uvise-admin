// Legt ein Demo-SiFa-Konto an und gibt ihm Zugriff auf die bestehende
// "uVise Demo GmbH" — Ergänzung zu seed-demo-company.mjs für die
// SiFa-Live-Vorschau (preview-sifa), die es bisher nicht gab.
//
// Läuft komplett über den normalen Registrierungs-/Freigabe-Weg (anon key +
// echte Auth-Accounts, keine Service-Role nötig) — genau wie eine echte
// SiFa-Registrierung + Chef-Freigabe, nur automatisiert.
//
// Voraussetzung: seed-demo-company.mjs wurde bereits erfolgreich ausgeführt
// (die Demo-Firma "uVise Demo GmbH" mit dem bestehenden Demo-Chef-Konto muss
// existieren).
//
// Ausführen:  node scripts/seed-demo-sifa.mjs
// Braucht .env.local mit NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.
//
// WICHTIG: Kann nur EINMAL erfolgreich durchlaufen (E-Mail ist danach
// vergeben). Bei erneutem Bedarf zuerst den Demo-SiFa-Account in Supabase
// löschen (Authentication -> Users), dann nochmal ausführen.

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

const CHEF_EMAIL = "demo.chef@uvise-vorschau.de";
const CHEF_PASSWORD = "UviseDemo2026!";
// Muss exakt zu sicherakte/lib/demoMode.ts DEMO_SIFA_EMAIL/PASSWORD passen —
// dort bereits als Platzhalter hinterlegt, hier wird das echte Konto erzeugt.
const SIFA_EMAIL = "demo.sifa@uvise-vorschau.de";
const SIFA_PASSWORD = "UviseDemo2026!";

async function main() {
  console.log("1/5 Als Demo-Chef anmelden, um den Firmen-Code zu holen …");
  const chefClient = createClient(URL_, ANON);
  const { error: chefLoginErr } = await chefClient.auth.signInWithPassword({
    email: CHEF_EMAIL,
    password: CHEF_PASSWORD,
  });
  if (chefLoginErr) {
    throw new Error(
      `Demo-Chef-Login fehlgeschlagen (${chefLoginErr.message}) — ist seed-demo-company.mjs schon gelaufen?`
    );
  }
  const { data: company, error: companyErr } = await chefClient
    .from("companies")
    .select("id, sifa_code")
    .eq("name", "uVise Demo GmbH")
    .single();
  if (companyErr) throw companyErr;
  await chefClient.auth.signOut();

  console.log("2/5 SiFa-Account anlegen …");
  const sifaClient = createClient(URL_, ANON);
  const { data: sifaSignUp, error: sifaSignUpErr } = await sifaClient.auth.signUp({
    email: SIFA_EMAIL,
    password: SIFA_PASSWORD,
  });
  if (sifaSignUpErr) throw sifaSignUpErr;
  if (!sifaSignUp.session) {
    throw new Error(
      "Kein aktives Session nach signUp — ist 'Confirm email' in Supabase (Authentication -> Providers) ausgeschaltet?"
    );
  }

  console.log("3/5 SiFa-Profil anlegen …");
  const { error: profileErr } = await sifaClient.rpc("create_sifa_profile", {
    p_vorname: "Markus",
    p_nachname: "Sicher",
  });
  if (profileErr) throw profileErr;
  const { error: onboardingErr } = await sifaClient.rpc("complete_sifa_onboarding", {
    p_firmen_schaetzung: "1-3",
  });
  if (onboardingErr) throw onboardingErr;

  console.log("4/5 Zugriff auf 'uVise Demo GmbH' anfragen …");
  const { data: grantId, error: requestErr } = await sifaClient.rpc("request_sifa_access", {
    p_sifa_code: company.sifa_code,
  });
  if (requestErr) throw requestErr;
  await sifaClient.auth.signOut();

  console.log("5/5 Als Demo-Chef anmelden und die Anfrage freigeben …");
  const chefApproveClient = createClient(URL_, ANON);
  const { error: chefLogin2Err } = await chefApproveClient.auth.signInWithPassword({
    email: CHEF_EMAIL,
    password: CHEF_PASSWORD,
  });
  if (chefLogin2Err) throw chefLogin2Err;
  const { error: approveErr } = await chefApproveClient.rpc("approve_sifa_grant", {
    p_grant_id: grantId,
  });
  if (approveErr) throw approveErr;
  await chefApproveClient.auth.signOut();

  console.log("\nFertig! Demo-SiFa-Zugang (freigegeben für 'uVise Demo GmbH'):");
  console.log(`  SiFa: ${SIFA_EMAIL} / ${SIFA_PASSWORD}`);
  console.log(
    "\nDanach funktioniert die SiFa-Live-Vorschau ohne weiteren Code-Eingriff — s. sicherakte/lib/demoMode.ts (DEMO_SIFA_EMAIL/PASSWORD) und den Launch-Eintrag 'sicherakte-web-demo-sifa'."
  );
}

main().catch((err) => {
  console.error("\nFehler:", err.message ?? err);
  process.exit(1);
});
