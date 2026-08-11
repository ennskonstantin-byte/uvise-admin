import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// [E3] Rechnungen automatisch erstellen: Stripe generiert bei jedem
// Abrechnungszyklus einer Subscription bereits automatisch eine Rechnung
// (inkl. PDF) -- eine eigene Rechnungserzeugung/-ablage ist nicht nötig.
// Diese Route öffnet stattdessen Stripes gehostetes Customer Billing Portal,
// das alle bisherigen Rechnungen mit PDF-Download sowie die Zahlungsmethode
// zeigt. Läuft serverseitig, damit der Stripe-Key nie im Browser landet.
//
// WICHTIG (einmalige Einstellung im Stripe-Dashboard): Customer Portal unter
// Settings -> Billing -> Customer portal aktivieren/konfigurieren, sonst
// schlägt stripe.billingPortal.sessions.create() fehl.
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
    return NextResponse.json({ error: "Nur Beauftragte können Rechnungen einsehen." }, { status: 403 });
  }

  const { data: company } = await db
    .from("companies")
    .select("stripe_customer_id")
    .eq("id", employee.company_id)
    .single();
  if (!company?.stripe_customer_id) {
    return NextResponse.json({ error: "Noch kein Stripe-Kunde -- erst ein Abo abschließen." }, { status: 404 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const origin = request.headers.get("origin") ?? "https://www.uvise.de";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${origin}/einstellungen`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("billing-portal: Session konnte nicht erstellt werden", err);
    return NextResponse.json({ error: "Rechnungsübersicht konnte nicht geöffnet werden." }, { status: 500 });
  }
}
