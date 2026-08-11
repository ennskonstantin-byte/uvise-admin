import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// [F3] Startet/setzt fort das Stripe-Connect-Express-Onboarding eines
// Partners (Identitätsprüfung + Bankverbindung für Auszahlungen). Wie bei
// partner-ansicht: Zugriff über den langen geheimen Schlüssel, kein Login.
export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecretKey || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }

  const { schluessel } = await request.json().catch(() => ({}));
  if (typeof schluessel !== "string" || schluessel.length < 20) {
    return NextResponse.json({ error: "Ungültiger Zugangslink." }, { status: 403 });
  }

  const db = createClient(supabaseUrl, serviceKey);
  const { data: partner } = await db
    .from("affiliate_partners")
    .select("id, name, email, stripe_connect_account_id")
    .eq("schluessel", schluessel)
    .single();
  if (!partner) {
    return NextResponse.json({ error: "Ungültiger Zugangslink." }, { status: 403 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const origin = request.headers.get("origin") ?? "https://www.uvise.de";

  try {
    let accountId = partner.stripe_connect_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "DE",
        email: partner.email ?? undefined,
        business_type: "individual",
        capabilities: { transfers: { requested: true } },
      });
      accountId = account.id;
      const { error } = await db
        .from("affiliate_partners")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", partner.id);
      if (error) throw error;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/partner?schluessel=${encodeURIComponent(schluessel)}`,
      return_url: `${origin}/partner?schluessel=${encodeURIComponent(schluessel)}`,
      type: "account_onboarding",
    });
    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("partner-connect-onboarding: fehlgeschlagen", err);
    return NextResponse.json({ error: "Onboarding konnte nicht gestartet werden." }, { status: 500 });
  }
}
