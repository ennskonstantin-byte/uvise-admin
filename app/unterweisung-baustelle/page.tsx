import type { Metadata } from "next";
import { UnterweisungBaustelle } from "@/components/marketing/UnterweisungBaustelle";

const TITEL = "Unterweisung auf der Baustelle: Pflicht & Inhalte";
const BESCHREIBUNG =
  "Unterweisung auf der Baustelle: typische Gefährdungen (Absturz, Baumaschinen), BG-BAU-Pflichten und mehrsprachige Unterweisung – jetzt uVise testen.";

// Eigene, SEO-optimierte Landingpage für die Baubranche — Ziel-Keywords
// "Unterweisung Baustelle", "Unterweisung Bau", "Arbeitsschutz Baustelle".
// Gleiches Design-System wie /unterweisung-handwerk, eigener, branchenspezifischer
// Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: ["Unterweisung Baustelle", "Unterweisung Bau", "Arbeitsschutz Baustelle"],
  alternates: { canonical: "https://www.uvise.de/unterweisung-baustelle" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-baustelle",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung auf der Baustelle",
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
    q: "Muss auf jeder Baustelle neu unterwiesen werden?",
    a: "Ja. Zusätzlich zur jährlichen Unterweisung ist vor dem erstmaligen Betreten einer neuen Baustelle eine baustellenbezogene Unterweisung Pflicht — Fluchtwege, Gefahrenbereiche und Ansprechpartner unterscheiden sich von Baustelle zu Baustelle.",
  },
  {
    q: "Wer ist für die Unterweisung zuständig, wenn mehrere Firmen auf einer Baustelle arbeiten?",
    a: "Jeder Arbeitgeber bleibt für die Unterweisung seiner eigenen Beschäftigten verantwortlich. Bei mehreren Firmen auf einer Baustelle koordiniert zusätzlich ein Sicherheits- und Gesundheitsschutzkoordinator (SiGeKo) die Zusammenarbeit und weist auf gemeinsame Gefahren hin.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für Baubetriebe zuständig?",
    a: "In der Regel die BG BAU (Berufsgenossenschaft der Bauwirtschaft). Sie stellt auch Vorlagen und Merkblätter speziell für Unterweisungen auf dem Bau bereit.",
  },
  {
    q: "Wie unterweise ich fremdsprachige Bauarbeiter rechtssicher?",
    a: "Indem die Unterweisung in einer für den Mitarbeiter verständlichen Sprache erfolgt — durch Übersetzung, Vorlesen oder Piktogramme. uVise übersetzt und liest jede Unterweisung automatisch in 41 Sprachen vor.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-baustelle/#webpage",
      url: "https://www.uvise.de/unterweisung-baustelle",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-baustelle/#faq",
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
      <UnterweisungBaustelle faq={FAQ} />
    </>
  );
}
