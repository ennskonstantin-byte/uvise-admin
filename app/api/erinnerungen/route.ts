import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, RESEND_FROM } from "@/lib/resend";

// Wöchentliche Erinnerungs-Mail an alle Beauftragten je Firma:
// - Qualifikationen, die in ≤30 Tagen ablaufen oder überfällig sind
// - Unterweisungs-Vorlagen, die in ≤30 Tagen ablaufen oder überfällig sind
// - noch nicht signierte (offene) Unterweisungen je Mitarbeiter
//
// Wird von Vercel Cron aufgerufen (siehe vercel.json, montags 06:00 UTC).
// Vercel schickt automatisch "Authorization: Bearer <CRON_SECRET>" mit,
// sobald die Env-Var CRON_SECRET gesetzt ist. Ohne gültigen Secret läuft
// die Route nicht — sonst könnte jeder von außen Mail-Versand auslösen.

const TAGE_VORWARNUNG = 30;

type Eintrag = { text: string; ueberfaellig: boolean };

function tageBis(datum: string): number {
  return Math.floor((new Date(datum).getTime() - Date.now()) / 86_400_000);
}

function formatDatum(datum: string): string {
  return new Date(datum).toLocaleDateString("de-DE");
}

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

  // Service-Role-Client: liest firmenübergreifend (RLS greift hier bewusst
  // nicht — läuft nur serverseitig im Cron, der Key liegt nie im Browser).
  const db = createClient(supabaseUrl, serviceKey);

  const [{ data: companies }, { data: employees }, { data: trainings }, { data: quals }, { data: ets }] =
    await Promise.all([
      db.from("companies").select("id, name"),
      db.from("employees").select("id, company_id, vorname, nachname, email, ist_beauftragter, archiviert"),
      db.from("trainings").select("id, company_id, name, ablaufdatum"),
      db.from("qualifications").select("employee_id, name, ablaufdatum"),
      db.from("employee_trainings").select("employee_id, status"),
    ]);

  let mailsVerschickt = 0;
  const fehler: string[] = [];

  for (const company of companies ?? []) {
    const firmenMitarbeiter = (employees ?? []).filter(
      (e) => e.company_id === company.id && !e.archiviert
    );
    const empfaenger = firmenMitarbeiter
      .filter((e) => e.ist_beauftragter && e.email)
      .map((e) => e.email as string);
    if (empfaenger.length === 0) continue;

    const eintraege: Eintrag[] = [];

    // Ablaufende Qualifikationen der (aktiven) Mitarbeiter dieser Firma
    for (const q of quals ?? []) {
      const e = firmenMitarbeiter.find((m) => m.id === q.employee_id);
      if (!e || !q.ablaufdatum) continue;
      const tage = tageBis(q.ablaufdatum);
      if (tage <= TAGE_VORWARNUNG) {
        eintraege.push({
          text:
            tage < 0
              ? `Qualifikation „${q.name}" von ${e.vorname} ${e.nachname} ist seit ${formatDatum(q.ablaufdatum)} überfällig`
              : `Qualifikation „${q.name}" von ${e.vorname} ${e.nachname} läuft am ${formatDatum(q.ablaufdatum)} ab (${tage} Tag${tage === 1 ? "" : "e"})`,
          ueberfaellig: tage < 0,
        });
      }
    }

    // Ablaufende Unterweisungs-Vorlagen der Firma
    for (const t of (trainings ?? []).filter((t) => t.company_id === company.id)) {
      if (!t.ablaufdatum) continue;
      const tage = tageBis(t.ablaufdatum);
      if (tage <= TAGE_VORWARNUNG) {
        eintraege.push({
          text:
            tage < 0
              ? `Unterweisung „${t.name}" ist seit ${formatDatum(t.ablaufdatum)} abgelaufen — Inhalt prüfen/erneuern`
              : `Unterweisung „${t.name}" läuft am ${formatDatum(t.ablaufdatum)} ab (${tage} Tag${tage === 1 ? "" : "e"})`,
          ueberfaellig: tage < 0,
        });
      }
    }

    // Offene (nicht signierte) Unterweisungen je Mitarbeiter
    for (const e of firmenMitarbeiter) {
      const offen = (ets ?? []).filter((et) => et.employee_id === e.id && et.status === "offen").length;
      if (offen > 0) {
        eintraege.push({
          text: `${e.vorname} ${e.nachname} hat ${offen} Unterweisung${offen === 1 ? "" : "en"} noch nicht signiert`,
          ueberfaellig: false,
        });
      }
    }

    if (eintraege.length === 0) continue;

    // Überfälliges zuerst
    eintraege.sort((a, b) => Number(b.ueberfaellig) - Number(a.ueberfaellig));

    const liste = eintraege
      .map(
        (e) =>
          `<li style="margin-bottom:6px;${e.ueberfaellig ? "color:#dc2626;font-weight:600;" : ""}">${e.text}</li>`
      )
      .join("");

    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: empfaenger,
      subject: `uVise — ${eintraege.length} offene Punkt${eintraege.length === 1 ? "" : "e"} bei ${company.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 560px;">
          <h2 style="color:#2563eb;">uVise — Wochenübersicht</h2>
          <p>Hallo, hier die offenen Punkte für <strong>${company.name}</strong>:</p>
          <ul style="padding-left:20px;">${liste}</ul>
          <p style="color:#71717a; font-size: 13px; margin-top: 20px;">
            Diese Erinnerung kommt einmal pro Woche automatisch, solange es offene Punkte gibt.
          </p>
        </div>
      `,
    });

    if (error) fehler.push(`${company.name}: ${error.message}`);
    else mailsVerschickt++;
  }

  return NextResponse.json({
    ok: fehler.length === 0,
    mailsVerschickt,
    fehler,
  });
}
