import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, RESEND_FROM } from "@/lib/resend";
import { sendPushNotifications } from "@/lib/expoPush";

// Gezielte Sofort-Erinnerung für EINE Unterweisung, ausgelöst per Knopf im
// Chef-Dashboard ("Erneut erinnern" bei der Rücklaufquote) -- anders als
// die wöchentliche Sammel-Mail in app/api/erinnerungen/route.ts (Cron, geht
// an die Beauftragten), geht diese Mail/Push direkt an genau die
// Mitarbeiter*innen, die diese eine Unterweisung noch nicht signiert haben.
//
//   POST { trainingId } -> { ok: true, angeschrieben: number }

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht vollständig konfiguriert." }, { status: 500 });
  }

  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const authedDb = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user },
  } = await authedDb.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  let trainingId = "";
  try {
    const body = await request.json();
    trainingId = typeof body.trainingId === "string" ? body.trainingId : "";
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (!trainingId) return NextResponse.json({ error: "trainingId fehlt." }, { status: 400 });

  // Service-Role: braucht firmenübergreifend lesbare push_tokens/E-Mails --
  // Zugriff selbst wird unten manuell auf die eigene Firma des/der
  // Aufrufer*in eingeschränkt, statt sich auf RLS zu verlassen.
  const db = createClient(supabaseUrl, serviceKey);

  const { data: caller } = await db
    .from("employees")
    .select("company_id, ist_beauftragter")
    .eq("auth_user_id", user.id)
    .single();
  if (!caller) return NextResponse.json({ error: "Kein Mitarbeiter-Profil gefunden." }, { status: 404 });
  if (!caller.ist_beauftragter) {
    return NextResponse.json({ error: "Nur Beauftragte können erinnern." }, { status: 403 });
  }

  const { data: training } = await db
    .from("trainings")
    .select("id, name, company_id")
    .eq("id", trainingId)
    .single();
  // Firmen-Zugehörigkeit hart prüfen -- ohne diesen Vergleich könnte
  // irgendeine trainingId aus einer FREMDEN Firma erinnert werden.
  if (!training || training.company_id !== caller.company_id) {
    return NextResponse.json({ error: "Unterweisung nicht gefunden." }, { status: 404 });
  }

  const { data: offene, error: offeneFehler } = await db
    .from("employee_trainings")
    .select("employee_id")
    .eq("training_id", trainingId)
    .eq("status", "offen");
  if (offeneFehler) {
    console.error("[erinnerungen/sofort] offene Zuweisungen konnten nicht gelesen werden", {
      trainingId,
      fehler: offeneFehler.message,
    });
  }
  const employeeIds = [...new Set((offene ?? []).map((et) => et.employee_id))];
  if (employeeIds.length === 0) {
    return NextResponse.json({ ok: true, angeschrieben: 0 });
  }

  const { data: mitarbeiter } = await db
    .from("employees")
    .select("id, vorname, nachname, email, auth_user_id")
    .in("id", employeeIds);

  const authUserIds = (mitarbeiter ?? [])
    .map((m) => m.auth_user_id)
    .filter((id): id is string => !!id);
  const { data: tokenRows } = authUserIds.length
    ? await db.from("push_tokens").select("user_id, token").in("user_id", authUserIds)
    : { data: [] };
  const tokenByUserId = new Map((tokenRows ?? []).map((t) => [t.user_id, t.token]));

  const titel = "Erinnerung: Unterweisung noch offen";
  const nachricht = `„${training.name}" wartet noch auf deine Unterschrift.`;

  const tokens = (mitarbeiter ?? [])
    .map((m) => (m.auth_user_id ? tokenByUserId.get(m.auth_user_id) : undefined))
    .filter((t): t is string => !!t);
  await sendPushNotifications(tokens, titel, nachricht);

  let angeschrieben = 0;
  for (const m of mitarbeiter ?? []) {
    if (!m.email) continue;
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: m.email,
      subject: `uVise — Erinnerung: „${training.name}" noch offen`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 560px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
            <td><img src="https://www.uvise.de/logo-mark.png" width="36" height="36" alt="uVise" style="border-radius:8px; display:block;" /></td>
            <td style="padding-left:10px; font-size:20px; font-weight:700; color:#2563eb;">uVise</td>
          </tr></table>
          <p>Hallo ${m.vorname},</p>
          <p>die Unterweisung <strong>„${training.name}"</strong> wartet noch auf deine Unterschrift.
          Bitte öffne die uVise-App und schließe sie ab.</p>
        </div>
      `,
    });
    if (!error) angeschrieben++;
  }

  return NextResponse.json({ ok: true, angeschrieben });
}
