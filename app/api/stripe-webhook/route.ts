import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { PLANS } from "@/lib/types";

// Nimmt Stripe-Ereignisse entgegen (erfolgreiches Abo, Verlängerung,
// Kündigung) und schreibt den aktuellen Stand in companies. Läuft mit dem
// Service-Role-Key (umgeht RLS) — läuft ja server-zu-server ohne Nutzer-
// Sitzung. Die Signaturprüfung stellt sicher, dass die Anfrage wirklich
// von Stripe kommt und nicht gefälscht ist.
export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Stripe-Webhook ist serverseitig nicht vollständig konfiguriert." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Ungültige Signatur: ${(err as Error).message}` }, { status: 400 });
  }

  const db = createClient(supabaseUrl, serviceKey);

  // [F2] Idempotenz: Event-ID zuerst als "in Bearbeitung" beanspruchen (Primary
  // Key = event.id). Schlägt der Insert wegen Unique-Verletzung fehl, kam
  // dasselbe Event schon einmal an (Stripe garantiert weder Einmal- noch
  // Reihenfolge-Zustellung) -- dann sofort 200 zurückgeben, ohne nochmal zu
  // verarbeiten. Bei einem Verarbeitungsfehler wird die Beanspruchung wieder
  // gelöscht, damit Stripes automatischer Retry das Event erneut versuchen kann.
  const { error: claimError } = await db
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });
  if (claimError) {
    if (claimError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("stripe-webhook: Event-Dedupe fehlgeschlagen", claimError);
    return NextResponse.json({ error: "dedupe_failed" }, { status: 500 });
  }

  async function upsertFromSubscription(subscription: Stripe.Subscription, companyId?: string) {
    const item = subscription.items.data[0];
    const priceId = item?.price.id;
    const interval = item?.price.recurring?.interval; // "month" | "year"
    // Paketname aus dem Produktnamen ableiten ("uVise Starter" -> "Starter")
    const product = item?.price.product;
    let plan: string | null = null;
    if (typeof product === "string") {
      const p = await stripe.products.retrieve(product);
      plan = p.name.replace("uVise ", "");
    } else if (product && !product.deleted) {
      plan = product.name.replace("uVise ", "");
    }

    // [F1] Mitarbeiter-Limit aus derselben PLANS-Quelle wie die Preise-Seite
    // ableiten -- unbekannter/nicht zuordenbarer Produktname lässt das Limit
    // bewusst unangetastet (behält den zuletzt bekannten Wert), statt es auf
    // ein geratenes Limit zu setzen.
    const matchedPlan = PLANS.find((p) => p.name === plan);
    const updateData: Record<string, unknown> = {
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      plan,
      billing: interval === "year" ? "jaehrlich" : "monatlich",
      subscription_status: subscription.status,
      current_period_end: new Date(item.current_period_end * 1000).toISOString(),
    };
    if (matchedPlan) {
      updateData.employee_limit = matchedPlan.mitarbeiterLimit;
    }

    // [Audit-Fund SUPABASE & DATEN, 27.07.2026] error wurde bisher nicht
    // geprüft -- ein fehlgeschlagenes Update blieb unbemerkt, Stripe bekam
    // trotzdem "received: true" und wiederholte den Webhook nie. Jetzt wird
    // der Fehler nach oben gereicht, damit die Route einen Fehlerstatus
    // zurückgibt und Stripe automatisch erneut zustellt.
    const { error } =
      companyId
        ? await db.from("companies").update(updateData).eq("id", companyId)
        : await db.from("companies").update(updateData).eq("stripe_subscription_id", subscription.id);
    if (error) throw error;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.client_reference_id;
        if (companyId && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertFromSubscription(subscription, companyId);
        }
        break;
      }
      case "customer.subscription.updated": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await db
          .from("companies")
          .update({ subscription_status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        if (error) throw error;
        break;
      }
    }
  } catch (err) {
    console.error("stripe-webhook: DB-Update fehlgeschlagen", err);
    // Beanspruchung zurücknehmen, sonst hält unser eigenes Dedupe Stripes
    // Retry für genau dieses Event für immer für "schon erledigt".
    await db.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "db_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
