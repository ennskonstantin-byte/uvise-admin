// Einmaliges Setup-Skript: legt die drei uVise-Pakete (Starter/Team/Betrieb)
// als Stripe-Produkte an, je mit einem monatlichen und einem jährlichen Preis.
// Ausführen mit: node scripts/setup-stripe-products.mjs
// Braucht STRIPE_SECRET_KEY aus .env.local (Sandbox-Key reicht zum Testen).
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
  { name: 'Starter', preisMonatlichCent: 1900, preisJaehrlichCent: 18200, limit: 'bis 5 Mitarbeiter' },
  { name: 'Team', preisMonatlichCent: 2900, preisJaehrlichCent: 27800, limit: 'bis 15 Mitarbeiter' },
  { name: 'Betrieb', preisMonatlichCent: 4900, preisJaehrlichCent: 47000, limit: 'bis 30 Mitarbeiter' },
];

const result = {};

for (const plan of PLANS) {
  const product = await stripe.products.create({
    name: `uVise ${plan.name}`,
    description: plan.limit,
  });

  const monthly = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: plan.preisMonatlichCent,
    recurring: { interval: 'month' },
    nickname: `${plan.name} monatlich`,
  });

  const yearly = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: plan.preisJaehrlichCent,
    recurring: { interval: 'year' },
    nickname: `${plan.name} jährlich`,
  });

  result[plan.name] = { productId: product.id, monthlyPriceId: monthly.id, yearlyPriceId: yearly.id };
  console.log(`${plan.name}: Produkt ${product.id}, Monat ${monthly.id}, Jahr ${yearly.id}`);
}

console.log('\n--- Zum Einfügen in lib/stripeConfig.ts ---');
console.log(JSON.stringify(result, null, 2));
