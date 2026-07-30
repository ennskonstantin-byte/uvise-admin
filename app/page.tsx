import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing/MarketingHome";
import { FAQ } from "@/components/marketing/faqData";
import { PLANS } from "@/lib/types";

const TITEL = "Unterweisungssoftware für Handwerk & kleine Betriebe – uVise";

const BESCHREIBUNG =
  "uVise: Unterweisungssoftware für Handwerk & kleine Betriebe. Digitale Unterweisung in 41 Sprachen, rechtssicher signiert. 7 Tage kostenlos testen.";

// Eigene Metadaten für die öffentliche Startseite (statt des generischen
// "uVise Admin"-Titels aus dem Root-Layout) — wichtig für Google-Suche
// und die Vorschau, wenn der Link z.B. in WhatsApp/Slack geteilt wird.
// ISR statt vollstatisch: ohne "revalidate" liefert Vercel diese Seite mit
// einem 1-Jahr-Edge-Cache aus, der nach einem Deploy erst über eine neue
// Deployment-ID oder einen manuellen Purge aktualisiert — Inhaltsänderungen
// wären also tagelang unsichtbar. Mit revalidate=3600 erneuert Vercel den
// Edge-Cache spätestens stündlich von selbst (stale-while-revalidate).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
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
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisungssoftware für Handwerk & kleine Betriebe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITEL,
    description: BESCHREIBUNG,
    images: ["https://www.uvise.de/og-banner.png"],
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
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.preis,
        priceCurrency: "EUR",
        description: `${plan.limit}, pro Monat`,
      })),
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
