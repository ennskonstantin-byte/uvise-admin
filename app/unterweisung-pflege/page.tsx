import type { Metadata } from "next";
import { UnterweisungPflege } from "@/components/marketing/UnterweisungPflege";

const TITEL = "Unterweisung Pflege: Biostoffe, Rücken, Hautschutz";
const BESCHREIBUNG =
  "Unterweisung in der Pflege: Biostoffverordnung, Rückenschutz, Hautschutz, BGW-Pflichten und mehrsprachige Unterweisung für internationale Teams.";

// Eigene, SEO-optimierte Landingpage für Pflegedienste & -einrichtungen —
// Ziel-Keywords "Unterweisung Pflege", "Unterweisung Pflegedienst",
// "Arbeitsschutz Pflege". Gleiches Design-System wie /unterweisung-handwerk,
// eigener, branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: ["Unterweisung Pflege", "Unterweisung Pflegedienst", "Arbeitsschutz Pflege"],
  alternates: { canonical: "https://www.uvise.de/unterweisung-pflege" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-pflege",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung in der Pflege",
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
    q: "Ist die Unterweisung nach Biostoffverordnung in der Pflege Pflicht?",
    a: "Ja. § 14 Biostoffverordnung (BioStoffV) verpflichtet Arbeitgeber, Beschäftigte, die mit biologischen Arbeitsstoffen — also auch mit Krankheitserregern durch Patientenkontakt — in Berührung kommen können, vor Aufnahme der Tätigkeit und danach mindestens jährlich zu unterweisen.",
  },
  {
    q: "Wie oft muss in der Pflege unterwiesen werden?",
    a: "Mindestens einmal jährlich, zusätzlich anlassbezogen bei Neueinstellung, neuen Tätigkeiten oder nach einem Vorfall wie einer Nadelstichverletzung. Für Biostoffe gilt zusätzlich die Pflicht, vor der erstmaligen Tätigkeit zu unterweisen.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für Pflegeeinrichtungen zuständig?",
    a: "In der Regel die BGW (Berufsgenossenschaft für Gesundheitsdienst und Wohlfahrtspflege). Sie stellt auch branchenspezifische Informationen zu Rückenschutz, Hautschutz und Biostoffen bereit.",
  },
  {
    q: "Wie unterweise ich internationale Pflegekräfte rechtssicher?",
    a: "Indem die Unterweisung in einer für die jeweilige Pflegekraft verständlichen Sprache erfolgt. uVise übersetzt und liest jede Unterweisung automatisch in 41 Sprachen vor — wichtig, da viele Pflegeteams international besetzt sind.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-pflege/#webpage",
      url: "https://www.uvise.de/unterweisung-pflege",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-pflege/#faq",
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
      <UnterweisungPflege faq={FAQ} />
    </>
  );
}
