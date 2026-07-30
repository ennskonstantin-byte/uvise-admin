import type { Metadata } from "next";
import { UnterweisungKfz } from "@/components/marketing/UnterweisungKfz";

const TITEL = "Unterweisung KFZ-Werkstatt: HV, Hebebühne, Pflicht";
const BESCHREIBUNG =
  "Unterweisung in der KFZ-Werkstatt: Hebebühnen, Gefahrstoffe wie Öle und Bremsflüssigkeit, Hochvolt-Qualifizierung und BGHM-Pflichten einfach erklärt.";

// Eigene, SEO-optimierte Landingpage für KFZ-Werkstätten — Ziel-Keywords
// "Unterweisung KFZ", "Unterweisung Werkstatt", "Arbeitsschutz KFZ-Werkstatt".
// Gleiches Design-System wie /unterweisung-handwerk, eigener,
// branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: ["Unterweisung KFZ", "Unterweisung Werkstatt", "Arbeitsschutz KFZ-Werkstatt"],
  alternates: { canonical: "https://www.uvise.de/unterweisung-kfz" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-kfz",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung in der KFZ-Werkstatt",
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

const FAQ = [
  {
    q: "Muss jeder Mitarbeiter an Hochvolt-Fahrzeugen unterwiesen werden?",
    a: "Nur wer tatsächlich an Fahrzeugen mit Hochvolt-Systemen (Elektro- und Hybridfahrzeuge) arbeitet, benötigt eine Qualifizierung nach DGUV Information 209-093 — je nach Tätigkeit Stufe 1 bis 3. Wer solche Fahrzeuge nur bewegt oder wäscht, ohne am HV-System zu arbeiten, braucht diese Qualifizierung nicht zwingend, sollte aber trotzdem über die grundsätzlichen Gefahren unterwiesen sein.",
  },
  {
    q: "Was ist der Unterschied zwischen den HV-Qualifizierungsstufen 1 bis 3?",
    a: "Stufe 1 vermittelt Grundwissen für Tätigkeiten ohne direkten Kontakt zu Hochvolt-Komponenten. Stufe 2 qualifiziert für Arbeiten unter Anleitung einer Fachkraft. Stufe 3 berechtigt zu eigenständigen Arbeiten an Hochvolt-Systemen, inklusive Freischalten und Prüfen auf Spannungsfreiheit.",
  },
  {
    q: "Wie oft muss in der KFZ-Werkstatt unterwiesen werden?",
    a: "Mindestens einmal jährlich für alle Beschäftigten nach § 4 DGUV Vorschrift 1, zusätzlich anlassbezogen bei neuen Arbeitsmitteln, neuen Gefahrstoffen oder nach einem Unfall.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für KFZ-Betriebe zuständig?",
    a: "In der Regel die BGHM (Berufsgenossenschaft Holz und Metall). Sie stellt auch branchenspezifische Musterbetriebe und Gefährdungsbeurteilungen für KFZ-Werkstätten bereit.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-kfz/#webpage",
      url: "https://www.uvise.de/unterweisung-kfz",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-kfz/#faq",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
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
      <UnterweisungKfz faq={FAQ} />
    </>
  );
}
