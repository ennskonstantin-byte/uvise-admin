// [v2c/v3] Vorschau-Modus des Web-Dashboards (preview-web).
//
// Bewusst OHNE Zugangsdaten: im Vorschau-Modus findet KEIN Login statt und es
// wird KEIN Supabase-Aufruf gemacht — der Store liefert stattdessen feste
// Beispieldaten (lib/demoFixtures.ts), und AuthGate lässt die Seiten ohne
// Sitzung durch. Ein früherer Entwurf mit automatischer Anmeldung über das
// bestehende Demo-Konto wurde verworfen: für einen reinen Screen-Nachweis
// braucht es keinen echten Account, und ein automatisierter Login-Vorgang
// wäre die deutlich riskantere Bauweise.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// [v3 — P1-6] Build-Zeit-Sperre.
//
// Der Vorschau-Modus hebt das Login-Gate auf. Käme er versehentlich in einen
// echten Produktions-Build, wäre das Dashboard ohne Anmeldung erreichbar.
// Diese Prüfung lässt einen solchen Build deshalb aktiv scheitern (Exit != 0)
// statt ihn still durchzulassen.
//
// Absichtlich zweistufig: `NEXT_PUBLIC_DEMO_MODE=true` allein genügt NICHT
// mehr für einen Produktions-Build — es muss zusätzlich `UVISE_ALLOW_DEMO_BUILD=1`
// gesetzt sein. Dieses zweite Flag ist bewusst OHNE `NEXT_PUBLIC_`-Präfix:
// dadurch kann es niemals ins Client-Bundle gelangen und niemand kann es aus
// dem ausgelieferten JavaScript heraus "nachträglich setzen". Nur wer den
// Vorschau-Export absichtlich baut (scripts/build-preview-web.sh), setzt es.
//
// `typeof window === "undefined"` grenzt die Prüfung auf die Build-/Server-
// Seite ein: im Browser ist das (nicht-öffentliche) Flag naturgemäß nicht
// sichtbar, dort darf die Prüfung also nicht anschlagen.
export function assertDemoModeNotInProductionBuild(): void {
  const istServerOderBuild = typeof window === "undefined";
  const istProduktionsBuild = process.env.NODE_ENV === "production";
  const ausdruecklichErlaubt = process.env.UVISE_ALLOW_DEMO_BUILD === "1";

  if (DEMO_MODE && istServerOderBuild && istProduktionsBuild && !ausdruecklichErlaubt) {
    throw new Error(
      [
        "",
        "==================================================================",
        " ABBRUCH: NEXT_PUBLIC_DEMO_MODE=true in einem Produktions-Build.",
        "==================================================================",
        "",
        " Der Vorschau-/Demo-Modus hebt das Login-Gate auf (AuthGate) und",
        " ersetzt echte Daten durch Beispieldaten. In einem ausgelieferten",
        " Build waere das Dashboard damit ohne Anmeldung erreichbar.",
        "",
        " Wenn du den Vorschau-Export absichtlich baust:",
        "   UVISE_ALLOW_DEMO_BUILD=1 NEXT_PUBLIC_DEMO_MODE=true npx next build",
        "   (bzw. einfach scripts/build-preview-web.sh benutzen)",
        "",
        " Wenn du einen echten Produktions-Build wolltest:",
        "   NEXT_PUBLIC_DEMO_MODE nicht setzen (oder auf 'false').",
        "",
      ].join("\n"),
    );
  }
}
