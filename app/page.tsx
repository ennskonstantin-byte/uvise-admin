import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing/MarketingHome";

// Eigene Metadaten für die öffentliche Startseite (statt des generischen
// "uVise Admin"-Titels aus dem Root-Layout) — wichtig für Google-Suche
// und die Vorschau, wenn der Link z.B. in WhatsApp/Slack geteilt wird.
export const metadata: Metadata = {
  title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
  description:
    "uVise digitalisiert Mitarbeiter-Unterweisungen und Qualifikationen: automatische Erinnerungen, rechtssichere Unterschriften und Vorlesefunktion in 41 Sprachen.",
};

export default function Page() {
  return <MarketingHome />;
}
