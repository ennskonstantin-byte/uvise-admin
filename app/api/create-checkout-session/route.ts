import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/stripeConfig";

// Erstellt eine Stripe-Checkout-Session für das gewählte Paket. Läuft
// serverseitig, damit der geheime Stripe-Key nie im Browser landet.
// Die Anfrage muss den Zugriffstoken des eingeloggten Chefs mitschicken
// (Authorization: Bearer <access_token>) — damit wird per RLS sichergestellt,
// dass nur die eigene Firma abonniert werden kann, keine fremde.
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

  const { planName, billing } = await request.json();
  if (!planName || !STRIPE_PRICE_IDS[planName] || (billing !== "monatlich" && billing !== "jaehrlich")) {
    return NextResponse.json({ error: "Ungültiges Paket." }, { status: 400 });
  }

  // Client mit dem Zugriffstoken des Nutzers — RLS sorgt dafür, dass nur die
  // eigene Firma gelesen werden kann.
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
    return NextResponse.json({ error: "Nur Beauftragte können ein Abo abschließen." }, { status: 403 });
  }

  const { data: company } = await db.from("companies").select("id, name").eq("id", employee.company_id).single();
  if (!company) {
    return NextResponse.json({ error: "Firma nicht gefunden." }, { status: 404 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const priceId = STRIPE_PRICE_IDS[planName][billing as "monatlich" | "jaehrlich"];
  const origin = request.headers.get("origin") ?? "https://www.uvise.de";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: company.id,
    metadata: { company_id: company.id, company_name: company.name, plan: planName, billing },
    success_url: `${origin}/einstellungen?abo=erfolgreich`,
    cancel_url: `${origin}/einstellungen?abo=abgebrochen`,
  });

  return NextResponse.json({ url: session.url });
}
