import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing/MarketingHome";

// Eigene Metadaten für die öffentliche Startseite (statt des generischen
// "uVise Admin"-Titels aus dem Root-Layout) — wichtig für Google-Suche
// und die Vorschau, wenn der Link z.B. in WhatsApp/Slack geteilt wird.
export const metadata: Metadata = {
  title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
  description:
    "uVise digitalisiert Mitarbeiter-Unterweisungen und Qualifikationen: automatische Erinnerungen, rechtssichere Unterschriften und Vorlesefunktion in 41 Sprachen.",
  alternates: {
    canonical: "https://uvise.de",
  },
  openGraph: {
    title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
    description:
      "Digitalisiert Mitarbeiter-Unterweisungen und Qualifikationen: automatische Erinnerungen, rechtssichere Unterschriften und Vorlesefunktion in 41 Sprachen.",
    url: "https://uvise.de",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
    description:
      "Digitalisiert Mitarbeiter-Unterweisungen und Qualifikationen: automatische Erinnerungen, rechtssichere Unterschriften und Vorlesefunktion in 41 Sprachen.",
  },
};

export default function Page() {
  return <MarketingHome />;
}
