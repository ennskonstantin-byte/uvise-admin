import type { Metadata } from "next";
import { UnterweisungGastronomie } from "@/components/marketing/UnterweisungGastronomie";

const TITEL = "Unterweisung Gastronomie: Küche, Pflicht, Ablauf";
const BESCHREIBUNG =
  "Unterweisung in der Gastronomie: Küchengefahren, BGN-Pflichten, mehrsprachige Teams und die Abgrenzung zur Lebensmittelhygiene-Belehrung erklärt.";

// Eigene, SEO-optimierte Landingpage für die Gastronomie — Ziel-Keywords
// "Unterweisung Gastronomie", "Arbeitsschutz Gastronomie", "Unterweisung
// Küche". Gleiches Design-System wie /unterweisung-handwerk, eigener,
// branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: ["Unterweisung Gastronomie", "Arbeitsschutz Gastronomie", "Unterweisung Küche"],
  alternates: { canonical: "https://www.uvise.de/unterweisung-gastronomie" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-gastronomie",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung in der Gastronomie",
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
    q: "Ist die Lebensmittelhygiene-Belehrung dasselbe wie die Arbeitsschutz-Unterweisung?",
    a: "Nein. Die Belehrung nach § 43 Infektionsschutzgesetz (IfSG) durch das Gesundheitsamt betrifft die Lebensmittelhygiene und den Schutz der Gäste vor Infektionskrankheiten. Die Arbeitsschutz-Unterweisung nach § 12 ArbSchG betrifft die Sicherheit der Beschäftigten selbst — Schnittverletzungen, Verbrennungen, Rutschgefahr. Beide sind gesetzlich vorgeschrieben und ersetzen sich nicht gegenseitig.",
  },
  {
    q: "Wie oft muss im Gastronomiebetrieb unterwiesen werden?",
    a: "Die Arbeitsschutz-Unterweisung mindestens einmal jährlich, zusätzlich bei Neueinstellung und bei neuen Arbeitsmitteln wie einer neuen Küchenmaschine. Die Belehrung nach § 43 IfSG muss vor Aufnahme der Tätigkeit erfolgen und alle zwei Jahre aufgefrischt werden.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für Gastronomiebetriebe zuständig?",
    a: "In der Regel die BGN (Berufsgenossenschaft Nahrungsmittel und Gastgewerbe). Sie stellt auch branchenspezifische Informationen für Küche und Service bereit.",
  },
  {
    q: "Wie unterweise ich Aushilfen und Saisonkräfte schnell und rechtssicher?",
    a: "Mit einer digitalen Lösung wie uVise: Die Unterweisung ist in Minuten zugewiesen, wird auf dem eigenen Smartphone erledigt und automatisch dokumentiert — praktisch bei hoher Fluktuation und kurzfristigen Aushilfen.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-gastronomie/#webpage",
      url: "https://www.uvise.de/unterweisung-gastronomie",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-gastronomie/#faq",
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
      <UnterweisungGastronomie faq={FAQ} />
    </>
  );
}
