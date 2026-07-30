// Einmaliges Setup-Skript für die Preisumstellung 07/2026: legt die drei neuen
// uVise-Pakete (Team/Betrieb/Unternehmen) als NEUE Stripe-Produkte an, je mit
// einem monatlichen und einem jährlichen Preis. Rührt bestehende Produkte/
// Preise/Subscriptions NICHT an — reine Ergänzung.
// Ausführen mit: node scripts/setup-stripe-products-2026.mjs
// Braucht STRIPE_SECRET_KEY aus .env.local (Sandbox-Key reicht zum Testen).
//
// HINWEIS: Bereits einmal ausgeführt (07/2026) — die entstandenen Price-IDs
// stehen in lib/stripeConfig.ts. Erneutes Ausführen legt weitere neue
// Produkte/Preise an (keine Wiederverwendung), nur bei Bedarf erneut starten.
import Stripe from 'stripe';
import { readFileSync } from 'fs';

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const stripeKeyLine = envFile.split('\n').find((l) => l.startsWith('STRIPE_SECRET_KEY='));
const STRIPE_SECRET_KEY = stripeKeyLine?.split('=')[1]?.trim();
if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY fehlt in .env.local');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const PLANS = [
  { name: 'Team', preisMonatlichCent: 4900, preisJaehrlichCent: 47000, limit: 'bis 10 Mitarbeiter' },
  { name: 'Betrieb', preisMonatlichCent: 9900, preisJaehrlichCent: 95000, limit: 'bis 25 Mitarbeiter' },
  { name: 'Unternehmen', preisMonatlichCent: 14900, preisJaehrlichCent: 143000, limit: 'bis 50 Mitarbeiter' },
];

const result = {};

for (const plan of PLANS) {
  const product = await stripe.products.create({
    name: `uVise ${plan.name} (2026)`,
    description: `${plan.limit} — Chef-/Admin-Zugang gratis, zählt nicht ins Mitarbeiter-Limit`,
  });

  const monthly = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: plan.preisMonatlichCent,
    recurring: { interval: 'month' },
    nickname: `${plan.name} monatlich (2026)`,
  });

  const yearly = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: plan.preisJaehrlichCent,
    recurring: { interval: 'year' },
    nickname: `${plan.name} jährlich (2026)`,
  });

  result[plan.name] = { productId: product.id, monthlyPriceId: monthly.id, yearlyPriceId: yearly.id };
  console.log(`${plan.name}: Produkt ${product.id}, Monat ${monthly.id} (${plan.preisMonatlichCent / 100}€), Jahr ${yearly.id} (${plan.preisJaehrlichCent / 100}€)`);
}

console.log('\n--- Zum Einfügen in lib/stripeConfig.ts ---');
console.log(JSON.stringify(result, null, 2));
