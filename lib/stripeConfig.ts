// Stripe-Preis-IDs je Paket und Abrechnungszeitraum.
// Angelegt über scripts/setup-stripe-products.mjs (Sandbox/Test-Modus).
// WICHTIG: Beim Wechsel auf das Stripe-Live-Konto das Skript erneut mit dem
// Live-Secret-Key ausführen und die IDs hier durch die neuen ersetzen.
export const STRIPE_PRICE_IDS: Record<string, { monatlich: string; jaehrlich: string }> = {
  Starter: { monatlich: 'price_1TsgPcGTDDoDhDMbrZUOElIw', jaehrlich: 'price_1TsgPcGTDDoDhDMbuXNZ2dCT' },
  Team: { monatlich: 'price_1TsgPdGTDDoDhDMbmGiTwm3e', jaehrlich: 'price_1TsgPdGTDDoDhDMbYJOj3VP3' },
  Betrieb: { monatlich: 'price_1TsgPeGTDDoDhDMb9Msz1tl8', jaehrlich: 'price_1TsgPeGTDDoDhDMbYLxh5z0A' },
};
