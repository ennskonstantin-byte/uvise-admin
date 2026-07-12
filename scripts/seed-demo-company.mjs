// Legt eine isolierte Demo-Firma ("uVise Demo GmbH") mit Fake-Mitarbeitern,
// Unterweisungen und Qualifikationen an — für die eingebettete Live-Vorschau
// von Chef-App/Mitarbeiter-App auf der Marketing-Website.
//
// Läuft komplett über den normalen Registrierungs-Weg (anon key + echte
// Auth-Accounts, keine Service-Role nötig) — genau wie eine echte
// Selbstregistrierung, nur automatisiert.
//
// Ausführen:  node scripts/seed-demo-company.mjs
// Braucht .env.local mit NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.
//
// WICHTIG: Kann nur EINMAL erfolgreich durchlaufen (E-Mails sind danach
// vergeben). Bei erneutem Bedarf zuerst die Demo-Accounts in Supabase
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
const MA_EMAIL = "demo.mitarbeiter@uvise-vorschau.de";
const MA_PASSWORD = "UviseDemo2026!";

function heute(plusTage) {
  const d = new Date();
  d.setDate(d.getDate() + plusTage);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const chefClient = createClient(URL_, ANON);

  console.log("1/8 Chef-Account anlegen …");
  const { data: signUpData, error: signUpErr } = await chefClient.auth.signUp({
    email: CHEF_EMAIL,
    password: CHEF_PASSWORD,
  });
  if (signUpErr) throw signUpErr;
  if (!signUpData.session) {
    throw new Error(
      "Kein aktives Session nach signUp — ist 'Confirm email' in Supabase (Authentication -> Providers) ausgeschaltet?"
    );
  }

  console.log("2/8 Firma 'uVise Demo GmbH' anlegen …");
  const { data: companyId, error: rpcErr } = await chefClient.rpc("create_company_and_owner", {
    p_company_name: "uVise Demo GmbH",
    p_vorname: "Nina",
    p_nachname: "Beispiel",
  });
  if (rpcErr) throw rpcErr;

  console.log("3/8 Zusätzliche Kategorie 'Küche' anlegen …");
  const { data: kueche, error: catErr } = await chefClient
    .from("categories")
    .insert({ company_id: companyId, name: "Küche", icon: "🍳" })
    .select()
    .single();
  if (catErr) throw catErr;

  console.log("4/8 Mitarbeiter anlegen …");
  const employeesInput = [
    { vorname: "Lena", nachname: "Bauer", personalnummer: "P-101", kategorie: "Küche", email: MA_EMAIL },
    { vorname: "Tom", nachname: "Krüger", personalnummer: "P-102", kategorie: "Lager", email: null },
    { vorname: "Aylin", nachname: "Sarı", personalnummer: "P-103", kategorie: "Büro", email: null },
  ];
  const employees = {};
  for (const e of employeesInput) {
    const { data, error } = await chefClient
      .from("employees")
      .insert({
        company_id: companyId,
        vorname: e.vorname,
        nachname: e.nachname,
        personalnummer: e.personalnummer,
        kategorie: e.kategorie,
        email: e.email,
        ist_beauftragter: false,
      })
      .select()
      .single();
    if (error) throw error;
    employees[e.vorname] = data;
  }

  console.log("5/8 Unterweisungen anlegen …");
  const trainingsInput = [
    {
      name: "Brandschutzunterweisung",
      icon: "🔥",
      inhalt:
        "Verhalten im Brandfall: Ruhe bewahren, Fluchtwege nutzen, Sammelpunkt aufsuchen. Feuerlöscher befinden sich an jedem Ausgang. Aufzüge im Brandfall nicht benutzen.",
      ablaufdatum: heute(300),
    },
    {
      name: "Erste Hilfe am Arbeitsplatz",
      icon: "✚",
      inhalt:
        "Grundlagen der Ersten Hilfe: Absichern der Unfallstelle, Notruf 112, stabile Seitenlage, Verbandskasten-Standorte im Betrieb.",
      ablaufdatum: heute(10),
    },
    {
      name: "Elektrische Arbeitsmittel",
      icon: "⚡",
      inhalt:
        "Vor jeder Nutzung Sichtprüfung auf Beschädigungen. Defekte Geräte sofort aus dem Verkehr ziehen und melden. Prüffristen nach DGUV V3 beachten.",
      ablaufdatum: heute(180),
    },
  ];
  const trainings = [];
  for (const t of trainingsInput) {
    const { data, error } = await chefClient
      .from("trainings")
      .insert({ company_id: companyId, name: t.name, typ: "online", icon: t.icon, inhalt: t.inhalt, ablaufdatum: t.ablaufdatum })
      .select()
      .single();
    if (error) throw error;
    trainings.push(data);
  }

  console.log("6/8 Qualifikationen anlegen …");
  await chefClient.from("qualifications").insert([
    { employee_id: employees["Lena"].id, name: "Ersthelfer", ablaufdatum: heute(20), status: "laeuft_ab" },
    { employee_id: employees["Tom"].id, name: "Staplerschein", ablaufdatum: heute(400), status: "gueltig" },
  ]);

  console.log("7/8 Unterweisungen zuweisen (Lena: 1 signiert, Rest offen) …");
  for (const emp of Object.values(employees)) {
    for (const t of trainings) {
      const isLenaFirstTraining = emp.vorname === "Lena" && t === trainings[0];
      await chefClient.from("employee_trainings").insert({
        employee_id: emp.id,
        training_id: t.id,
        status: isLenaFirstTraining ? "signiert" : "offen",
        signiert_am: isLenaFirstTraining ? new Date().toISOString() : null,
        geraet: isLenaFirstTraining ? "iOS 18.2" : null,
      });
    }
  }

  await chefClient.auth.signOut();

  console.log("8/8 Mitarbeiter-Login verknüpfen …");
  const maClient = createClient(URL_, ANON);
  const { data: maSignUp, error: maSignUpErr } = await maClient.auth.signUp({
    email: MA_EMAIL,
    password: MA_PASSWORD,
  });
  if (maSignUpErr) throw maSignUpErr;
  if (!maSignUp.session) throw new Error("Kein aktives Session für Mitarbeiter-Account.");
  const { error: claimErr } = await maClient.rpc("claim_employee_by_email");
  if (claimErr) throw claimErr;

  console.log("\nFertig! Demo-Zugänge:");
  console.log(`  Chef:       ${CHEF_EMAIL} / ${CHEF_PASSWORD}`);
  console.log(`  Mitarbeiter: ${MA_EMAIL} / ${MA_PASSWORD}`);
}

main().catch((err) => {
  console.error("\nFehler:", err.message ?? err);
  process.exit(1);
});
