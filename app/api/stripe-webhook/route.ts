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
          // [E1/E2] Vertragsbeginn nur beim ALLERERSTEN Checkout setzen -- ist
          // schon einer da (Re-Abo nach Kündigung o.ä.), bleibt die 12-Monats-
          // Rechnung an den ursprünglichen Vertragsstart gekoppelt und wird
          // NICHT durch einen erneuten Checkout zurückgesetzt.
          const { error: contractError } = await db
            .from("companies")
            .update({ contract_started_at: new Date().toISOString(), cancel_at: null })
            .eq("id", companyId)
            .is("contract_started_at", null);
          if (contractError) throw contractError;
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
      // [F3] Provision: 20% jeder bezahlten Rechnung einer geworbenen Firma
      // per Stripe Connect Transfer an den zuständigen Partner. Läuft über
      // JEDE Rechnung (nicht nur die erste) -- wiederkehrend, solange die
      // Firma zahlt, wie mit KE abgestimmt.
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId || !invoice.amount_paid) break;

        const { data: company } = await db
          .from("companies")
          .select("id, ref_code")
          .eq("stripe_customer_id", customerId)
          .single();
        if (!company?.ref_code) break;

        const { data: partner } = await db
          .from("affiliate_partners")
          .select("id, aktiv, stripe_connect_account_id, connect_onboarding_complete, provisions_prozent")
          .eq("code", company.ref_code)
          .single();
        if (!partner?.aktiv || !partner.stripe_connect_account_id || !partner.connect_onboarding_complete) break;

        const amountCents = Math.round((invoice.amount_paid * Number(partner.provisions_prozent)) / 100);
        if (amountCents <= 0) break;

        // Aktuelle Stripe-API-Version verknüpft Invoice/Charge nicht mehr
        // direkt (kein invoice.charge mehr) -- die PaymentIntent-ID über das
        // payments-Array auflösen, damit ein späterer Refund (charge.refunded
        // liefert charge.payment_intent) diese Provision wiederfindet.
        let paymentIntentId: string | null = null;
        try {
          const full = await stripe.invoices.retrieve(invoice.id, {
            expand: ["payments.data.payment.payment_intent"],
          });
          const payment = full.payments?.data[0]?.payment;
          if (payment?.type === "payment_intent") {
            paymentIntentId =
              typeof payment.payment_intent === "string" ? payment.payment_intent : payment.payment_intent?.id ?? null;
          }
        } catch (err) {
          console.error("stripe-webhook: PaymentIntent-Auflösung fehlgeschlagen", err);
        }

        // Zeile zuerst anlegen (unique stripe_invoice_id beansprucht die
        // Rechnung) -- schlägt das wegen Unique-Verletzung fehl, wurde diese
        // Rechnung schon einmal verarbeitet (Retry), keine Doppel-Provision.
        const { data: commission, error: commissionError } = await db
          .from("affiliate_commissions")
          .insert({
            partner_id: partner.id,
            company_id: company.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: paymentIntentId,
            amount_cents: amountCents,
          })
          .select()
          .single();
        if (commissionError) {
          if (commissionError.code === "23505") break; // bereits verarbeitet
          throw commissionError;
        }

        try {
          const transfer = await stripe.transfers.create({
            amount: amountCents,
            currency: invoice.currency,
            destination: partner.stripe_connect_account_id,
            transfer_group: invoice.id,
          });
          const { error } = await db
            .from("affiliate_commissions")
            .update({ stripe_transfer_id: transfer.id, status: "transferred" })
            .eq("id", commission.id);
          if (error) throw error;
        } catch (transferErr) {
          console.error("stripe-webhook: Provisions-Transfer fehlgeschlagen", transferErr);
          await db.from("affiliate_commissions").update({ status: "failed" }).eq("id", commission.id);
          // Kein throw: die Rechnung selbst ist bezahlt und korrekt verbucht,
          // nur die Provision ist fehlgeschlagen -- ein Retry des gesamten
          // Webhook-Events würde wegen der oben schon angelegten Zeile ohnehin
          // nichts mehr verarbeiten. Manuell im Dashboard nachverfolgen.
        }
        break;
      }
      // [F3] Rückrechnung bei Erstattung: anteilig zum erstatteten Betrag.
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (!paymentIntentId) break;

        const { data: commission } = await db
          .from("affiliate_commissions")
          .select("id, amount_cents, reversed_cents, stripe_transfer_id, status")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();
        if (!commission || commission.status !== "transferred" || !commission.stripe_transfer_id) break;

        const refundFraction = charge.amount_refunded / charge.amount;
        const reverseCents = Math.min(
          commission.amount_cents - commission.reversed_cents,
          Math.round(commission.amount_cents * refundFraction)
        );
        if (reverseCents <= 0) break;

        await stripe.transfers.createReversal(commission.stripe_transfer_id, { amount: reverseCents });
        const newReversed = commission.reversed_cents + reverseCents;
        const { error } = await db
          .from("affiliate_commissions")
          .update({
            reversed_cents: newReversed,
            status: newReversed >= commission.amount_cents ? "reversed" : "transferred",
          })
          .eq("id", commission.id);
        if (error) throw error;
        break;
      }
      // [F3] Markiert einen Partner als auszahlungsbereit, sobald Stripe das
      // Connect-Onboarding (Identität + Bankverbindung) als vollständig meldet.
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled && account.payouts_enabled) {
          const { error } = await db
            .from("affiliate_partners")
            .update({ connect_onboarding_complete: true })
            .eq("stripe_connect_account_id", account.id);
          if (error) throw error;
        }
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
