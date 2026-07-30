import type { Metadata } from "next";
import { UnterweisungLagerLogistik } from "@/components/marketing/UnterweisungLagerLogistik";

const TITEL = "Unterweisung Lager & Logistik: Stapler, Pflicht";
const BESCHREIBUNG =
  "Unterweisung in Lager & Logistik: Flurförderzeuge nach DGUV Vorschrift 68, Regalanlagen, Ladungssicherung und BGHW-Pflichten einfach erklärt.";

// Eigene, SEO-optimierte Landingpage für Lager- und Logistikbetriebe —
// Ziel-Keywords "Unterweisung Lager", "Gabelstapler Unterweisung",
// "Arbeitsschutz Logistik". Gleiches Design-System wie /unterweisung-handwerk,
// eigener, branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: ["Unterweisung Lager", "Gabelstapler Unterweisung", "Arbeitsschutz Logistik"],
  alternates: { canonical: "https://www.uvise.de/unterweisung-lager-logistik" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-lager-logistik",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung in Lager & Logistik",
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
    q: "Reicht der Gabelstapler-Führerschein allein aus?",
    a: "Nein. Die Fahrerlaubnis (die theoretische und praktische Ausbildung nach DGUV Grundsatz 308-001) ist die Grundqualifikation. Zusätzlich muss der Arbeitgeber jeden Fahrer schriftlich für den jeweiligen Betrieb und das jeweilige Fahrzeug beauftragen — und ihn wie jeden Beschäftigten mindestens jährlich unterweisen.",
  },
  {
    q: "Wie oft muss ein Staplerfahrer unterwiesen werden?",
    a: "Mindestens einmal jährlich, unabhängig davon, wann die ursprüngliche Ausbildung nach DGUV Grundsatz 308-001 stattgefunden hat. Zusätzlich bei neuen Fahrzeugtypen, geänderten betrieblichen Gegebenheiten oder nach einem Unfall.",
  },
  {
    q: "Müssen Regalanlagen regelmäßig geprüft werden?",
    a: "Ja. Regalanlagen sollten regelmäßig auf Beschädigungen kontrolliert werden, insbesondere nach Anfahrschäden durch Flurförderzeuge. Beschäftigte sollten unterwiesen sein, sichtbare Schäden sofort zu melden.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für Lager- und Logistikbetriebe zuständig?",
    a: "In der Regel die BGHW (Berufsgenossenschaft Handel und Warenlogistik). Sie stellt auch branchenspezifische Informationen zu Flurförderzeugen und Ladungssicherung bereit.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-lager-logistik/#webpage",
      url: "https://www.uvise.de/unterweisung-lager-logistik",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-lager-logistik/#faq",
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
      <UnterweisungLagerLogistik faq={FAQ} />
    </>
  );
}
