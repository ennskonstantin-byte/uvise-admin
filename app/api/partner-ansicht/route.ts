import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Partner-Selbstauskunft: über den langen geheimen Schlüssel (wirkt wie ein
// Passwort im Link) sieht ein Partner NUR die eigenen Zahlen — kein Login nötig.
export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500 });
  }

  const schluessel = new URL(request.url).searchParams.get("schluessel") ?? "";
  if (schluessel.length < 20) {
    return NextResponse.json({ error: "Ungültiger Zugangslink." }, { status: 403 });
  }

  const db = createClient(supabaseUrl, serviceKey);
  const { data: partner } = await db
    .from("affiliate_partners")
    .select(
      "id, name, code, budget_cents, aktiv, created_at, connect_onboarding_complete, provisions_prozent"
    )
    .eq("schluessel", schluessel)
    .single();
  if (!partner) {
    return NextResponse.json({ error: "Ungültiger Zugangslink." }, { status: 403 });
  }

  // [F3] Provisionsübersicht: Summe der bisher tatsächlich ausgezahlten
  // (nicht nur berechneten) Provision, abzüglich Rückrechnungen bei Refunds.
  const [{ count: klicks }, { count: firmen }, { data: commissions }] = await Promise.all([
    db.from("affiliate_clicks").select("id", { count: "exact", head: true }).eq("partner_id", partner.id),
    db.from("companies").select("id", { count: "exact", head: true }).eq("ref_code", partner.code),
    db
      .from("affiliate_commissions")
      .select("amount_cents, reversed_cents")
      .eq("partner_id", partner.id)
      .eq("status", "transferred"),
  ]);
  const provisionCents = (commissions ?? []).reduce(
    (sum, c) => sum + c.amount_cents - c.reversed_cents,
    0
  );

  return NextResponse.json({
    name: partner.name,
    code: partner.code,
    aktiv: partner.aktiv,
    seit: partner.created_at,
    budgetEuro: partner.budget_cents / 100,
    klicks: klicks ?? 0,
    geworbeneFirmen: firmen ?? 0,
    link: `https://www.uvise.de/?ref=${partner.code}`,
    provisionsProzent: partner.provisions_prozent,
    connectOnboardingComplete: partner.connect_onboarding_complete,
    provisionEuro: provisionCents / 100,
  });
}
