import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

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

    const updateData = {
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      plan,
      billing: interval === "year" ? "jaehrlich" : "monatlich",
      subscription_status: subscription.status,
      current_period_end: new Date(item.current_period_end * 1000).toISOString(),
    };

    if (companyId) {
      await db.from("companies").update(updateData).eq("id", companyId);
    } else {
      await db.from("companies").update(updateData).eq("stripe_subscription_id", subscription.id);
    }
  }

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
      await db
        .from("companies")
        .update({ subscription_status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
