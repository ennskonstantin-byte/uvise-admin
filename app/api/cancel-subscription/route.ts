import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { earliestCancellationDate } from "@/lib/contractTerm";

// [E1/E2] Ordentliche Kündigung des Abos. Läuft serverseitig (Stripe-Key nie
// im Browser) und erzwingt die 12-Monats-Mindestlaufzeit: die Kündigung wird
// IMMER angenommen, wirksam wird sie aber erst zum berechneten, nächst-
// möglichen Laufzeitende (lib/contractTerm.ts) -- kommt sie zu spät für das
// laufende Laufzeitende (weniger als 3 Monate Vorlauf), erst zum übernächsten.
// Das entspricht "Kündigung zum nächstmöglichen Zeitpunkt", nicht einem
// harten Ablehnen. §314 BGB (außerordentliche Kündigung) läuft nicht über
// diese Route, sondern weiterhin über den Support.
//
// POST {aktion: "kuendigen"}  -> setzt cancel_at auf den berechneten Termin
// POST {aktion: "widerrufen"} -> nimmt eine noch nicht wirksame Kündigung zurück
export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Stripe/Supabase ist serverseitig nicht konfiguriert." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  if (!accessToken) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { aktion } = await request.json();
  if (aktion !== "kuendigen" && aktion !== "widerrufen") {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const db = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
  } = await db.auth.getUser(accessToken);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { data: employee } = await db
    .from("employees")
    .select("company_id, ist_beauftragter")
    .eq("auth_user_id", user.id)
    .single();
  if (!employee?.ist_beauftragter) {
    return NextResponse.json({ error: "Nur Beauftragte können das Abo kündigen." }, { status: 403 });
  }

  const { data: company } = await db
    .from("companies")
    .select("id, stripe_subscription_id, contract_started_at, subscription_status")
    .eq("id", employee.company_id)
    .single();
  if (!company?.stripe_subscription_id) {
    return NextResponse.json({ error: "Kein aktives Abo gefunden." }, { status: 404 });
  }
  if (!company.contract_started_at) {
    // Sollte nicht vorkommen (wird beim ersten Checkout gesetzt) -- ohne
    // Vertragsstart lässt sich keine rechtssichere Laufzeit berechnen.
    return NextResponse.json({ error: "Vertragsbeginn unbekannt. Bitte Support kontaktieren." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);

  if (aktion === "kuendigen") {
    const effectiveDate = earliestCancellationDate(new Date(company.contract_started_at));
    await stripe.subscriptions.update(company.stripe_subscription_id, {
      cancel_at: Math.floor(effectiveDate.getTime() / 1000),
    });
    const { error } = await db
      .from("companies")
      .update({ cancel_at: effectiveDate.toISOString() })
      .eq("id", company.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cancelAt: effectiveDate.toISOString() });
  }

  // aktion === "widerrufen"
  await stripe.subscriptions.update(company.stripe_subscription_id, { cancel_at: null });
  const { error } = await db.from("companies").update({ cancel_at: null }).eq("id", company.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
