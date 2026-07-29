import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// [M-17] Automatische Anonymisierung signierter Unterweisungsnachweise nach
// Ablauf der von der Firma selbst festgelegten Aufbewahrungsfrist
// (companies.aufbewahrungsfrist_monate, Migration 0059). NULL = nie
// automatisch anonymisieren (Standard, betrifft die meisten Bestandsfirmen).
// uVise legt bewusst keine pauschale Frist fest -- es gibt keine einzige
// branchenübergreifend richtige Zahl (DGUV Information 211-005 empfiehlt
// unverbindlich mind. 2 Jahre, Spezialgesetze wie Strahlenschutzverordnung
// haben eigene, branchenspezifische Fristen).
//
// Anonymisiert wird nur die Signatur selbst (signatur_bild_url, signiert_als)
// -- Trainingsinhalt, signiert_am und status bleiben als Nachweis "es wurde
// unterwiesen" erhalten, analog zum bestehenden Löschkonzept (0044/0057).
//
// [Nachtrag, Freigabe ausstehend] Kein Cron-Eintrag mehr in vercel.json --
// die Route läuft nur noch, wenn jemand sie händisch aufruft, und selbst
// dann standardmäßig als Trockenlauf. Echtes Anonymisieren erfordert
// zusätzlich zum gültigen CRON_SECRET (kein Fallback-Wert, s. Prüfung
// unten -- ohne gesetztes Secret bricht die Route mit 500 ab, es gibt kein
// `?? "..."`-Muster) den expliziten Parameter ?bestaetigt=1.

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET ist nicht gesetzt (Vercel → Settings → Environment Variables)." },
      { status: 500 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt (Vercel → Settings → Environment Variables)." },
      { status: 500 }
    );
  }

  const db = createClient(supabaseUrl, serviceKey);
  // Umgekehrtes Vorzeichen zum bisherigen ?dryRun=1: Standard ist jetzt IMMER
  // der sichere Trockenlauf, echtes Schreiben nur mit diesem einen, explizit
  // gesetzten Parameter -- zusätzlich zum bereits oben geprüften Secret.
  const bestaetigt = new URL(request.url).searchParams.get("bestaetigt") === "1";

  const { data: companies, error: companiesError } = await db
    .from("companies")
    .select("id, name, aufbewahrungsfrist_monate")
    .not("aufbewahrungsfrist_monate", "is", null)
    .eq("geloescht", false);

  if (companiesError) {
    return NextResponse.json({ error: companiesError.message }, { status: 500 });
  }

  // Reine Lesevorgänge -- dürfen den Immutability-Trigger nicht verletzen,
  // deshalb hier per direkter Query gezählt statt über die RPC.
  let geprueft = 0;
  for (const company of companies ?? []) {
    const grenze = new Date();
    grenze.setMonth(grenze.getMonth() - company.aufbewahrungsfrist_monate);

    const { data: employeeIds } = await db.from("employees").select("id").eq("company_id", company.id);
    const ids = (employeeIds ?? []).map((e) => e.id);
    if (ids.length === 0) continue;

    const { count } = await db
      .from("employee_trainings")
      .select("id", { count: "exact", head: true })
      .eq("status", "signiert")
      .in("employee_id", ids)
      .lt("signiert_am", grenze.toISOString())
      .not("signatur_bild_url", "is", null);
    geprueft += count ?? 0;
  }

  if (!bestaetigt) {
    return NextResponse.json({
      ok: true,
      trockenlauf: true,
      firmenMitFrist: (companies ?? []).length,
      geprueft,
      anonymisiert: 0,
      fehler: [],
    });
  }

  // Ab hier nur noch mit ?bestaetigt=1 erreichbar. Das eigentliche Schreiben
  // läuft über die RPC (0060) -- die einzige Stelle, die den
  // Immutability-Trigger aus 0013 legitim umgehen darf.
  const { data: ergebnis, error: rpcError } = await db.rpc("anonymize_expired_nachweise");
  if (rpcError) {
    return NextResponse.json({ ok: false, trockenlauf: false, geprueft, anonymisiert: 0, fehler: [rpcError.message] }, { status: 500 });
  }

  const anonymisiert = (ergebnis ?? []).reduce((sum: number, row: { anzahl: number }) => sum + row.anzahl, 0);

  return NextResponse.json({
    ok: true,
    trockenlauf: false,
    firmenMitFrist: (companies ?? []).length,
    geprueft,
    anonymisiert,
    fehler: [],
  });
}
