// Stripe-Preis-IDs je Paket. Angelegt über scripts/setup-stripe-products-2026.mjs
// (Sandbox/Test-Modus, Preisumstellung 07/2026: Team/Betrieb/Unternehmen).
// WICHTIG: Beim Wechsel auf das Stripe-Live-Konto das Skript erneut mit dem
// Live-Secret-Key ausführen und die IDs hier durch die neuen ersetzen.
//
// [E1/E2, Vertragsmodell-Umstellung] Kein Jahres-Vorkasse-Preis mehr -- jeder
// Vertrag läuft 12 Monate mit monatlicher Zahlung (siehe lib/contractTerm.ts),
// deshalb nur noch ein Preis pro Paket statt monatlich/jährlich.
export const STRIPE_PRICE_IDS: Record<string, string> = {
  Team: 'price_1TyvymGTDDoDhDMbdoHNKI8F',
  Betrieb: 'price_1TyvynGTDDoDhDMbJYYscJ9z',
  Unternehmen: 'price_1TyvyoGTDDoDhDMbGXLPdDry',
};
