// Stripe-Preis-IDs je Paket und Abrechnungszeitraum.
// Angelegt über scripts/setup-stripe-products-2026.mjs (Sandbox/Test-Modus,
// Preisumstellung 07/2026: Team/Betrieb/Unternehmen).
// WICHTIG: Beim Wechsel auf das Stripe-Live-Konto das Skript erneut mit dem
// Live-Secret-Key ausführen und die IDs hier durch die neuen ersetzen.
export const STRIPE_PRICE_IDS: Record<string, { monatlich: string; jaehrlich: string }> = {
  Team: { monatlich: 'price_1TyvymGTDDoDhDMbdoHNKI8F', jaehrlich: 'price_1TyvynGTDDoDhDMbMtDy07VX' },
  Betrieb: { monatlich: 'price_1TyvynGTDDoDhDMbJYYscJ9z', jaehrlich: 'price_1TyvyoGTDDoDhDMbJJ5YJ2DM' },
  Unternehmen: { monatlich: 'price_1TyvyoGTDDoDhDMbGXLPdDry', jaehrlich: 'price_1TyvyoGTDDoDhDMbmFNhdEGJ' },
};
