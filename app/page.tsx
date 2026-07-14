import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing/MarketingHome";
import { FAQ } from "@/components/marketing/faqData";

const BESCHREIBUNG =
  "uVise digitalisiert Mitarbeiter-Unterweisungen und Qualifikationen: Erinnerungen, rechtssichere Unterschriften und Vorlesefunktion in 41 Sprachen.";

// Eigene Metadaten für die öffentliche Startseite (statt des generischen
// "uVise Admin"-Titels aus dem Root-Layout) — wichtig für Google-Suche
// und die Vorschau, wenn der Link z.B. in WhatsApp/Slack geteilt wird.
export const metadata: Metadata = {
  title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
  description: BESCHREIBUNG,
  // Meta-Keywords werden von Google zwar kaum noch gewichtet, schaden aber
  // nicht und helfen manchen kleineren Suchmaschinen.
  keywords: [
    "Unterweisungssoftware",
    "digitale Unterweisung",
    "Online-Unterweisung",
    "Unterweisung dokumentieren",
    "Unterweisungsnachweis",
    "Unterweisungsmanagement",
    "Arbeitsschutzunterweisung",
    "Sicherheitsunterweisung",
    "Mitarbeiterunterweisung App",
    "Unterweisung Software Handwerk",
    "Qualifikationen verwalten",
    "rechtssichere Unterschrift",
    "Unterweisung mehrsprachig",
    "Unterweisung vorlesen",
    "DGUV Unterweisung",
    "ArbSchG Unterweisung",
  ],
  alternates: {
    canonical: "https://www.uvise.de",
  },
  openGraph: {
    title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
    description: BESCHREIBUNG,
    url: "https://www.uvise.de",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "uVise — Digitale Unterweisungen, Nachweise & Erinnerungen",
    description: BESCHREIBUNG,
  },
};

// Strukturierte Daten (JSON-LD): Google versteht damit, dass uVise eine
// Software mit Preisen ist, wer dahintersteht und welche FAQ es gibt — die
// Grundlage für hübsche Such-Ergebnisse (z.B. aufklappbare Fragen).
const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.uvise.de/#organization",
      name: "uVise",
      url: "https://www.uvise.de",
      logo: "https://www.uvise.de/icon.png",
      email: "info@ennsmedia.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rossinistraße 11",
        postalCode: "93133",
        addressLocality: "Burglengenfeld",
        addressCountry: "DE",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.uvise.de/#website",
      url: "https://www.uvise.de",
      name: "uVise",
      inLanguage: "de-DE",
      publisher: { "@id": "https://www.uvise.de/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "uVise",
      description: BESCHREIBUNG,
      url: "https://www.uvise.de",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      inLanguage: "de-DE",
      publisher: { "@id": "https://www.uvise.de/#organization" },
      featureList: [
        "Digitale Unterweisungen und Nachweise",
        "Rechtssichere Unterschrift nach eIDAS-Grundsätzen",
        "Automatische Erinnerungen an Fristen",
        "Qualifikationen verwalten",
        "Vorlesefunktion und Übersetzung in 41 Sprachen",
      ],
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "19",
          priceCurrency: "EUR",
          description: "bis 5 Mitarbeiter, pro Monat",
        },
        {
          "@type": "Offer",
          name: "Team",
          price: "29",
          priceCurrency: "EUR",
          description: "bis 15 Mitarbeiter, pro Monat",
        },
        {
          "@type": "Offer",
          name: "Betrieb",
          price: "49",
          priceCurrency: "EUR",
          description: "bis 30 Mitarbeiter, pro Monat",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/#faq",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }}
      />
      <MarketingHome />
    </>
  );
}
