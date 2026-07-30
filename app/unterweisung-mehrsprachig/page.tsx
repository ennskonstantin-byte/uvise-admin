import type { Metadata } from "next";
import { UnterweisungMehrsprachig } from "@/components/marketing/UnterweisungMehrsprachig";

const TITEL = "Unterweisung mehrsprachig – ausländische Mitarbeiter | uVise";
const BESCHREIBUNG =
  "Unterweisung mehrsprachig für ausländische Mitarbeiter: Pflicht nach ArbSchG & DGUV Vorschrift 1. uVise übersetzt & liest in 41 Sprachen vor – kostenlos testen.";

// Eigene, SEO-optimierte Landingpage für die Ziel-Keywords "Unterweisung
// mehrsprachig", "Unterweisung ausländische Mitarbeiter", "Unterweisung in
// Muttersprache" und "Unterweisung fremdsprachige Mitarbeiter". Gleiches
// Design-System wie die Startseite (components/marketing/MarketingHome.tsx),
// eigener Inhalt.
//
// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung mehrsprachig",
    "Unterweisung ausländische Mitarbeiter",
    "Unterweisung in Muttersprache",
    "Unterweisung fremdsprachige Mitarbeiter",
    "Unterweisung übersetzen",
    "Unterweisung Sprachbarriere",
  ],
  alternates: {
    canonical: "https://www.uvise.de/unterweisung-mehrsprachig",
  },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-mehrsprachig",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung mehrsprachig für ausländische Mitarbeiter",
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
    q: "Muss ich in der Muttersprache unterweisen?",
    a: "Das Gesetz schreibt keine bestimmte Sprache vor. § 12 ArbSchG und § 4 DGUV Vorschrift 1 verlangen aber, dass die Unterweisung „in einer für die Beschäftigten verständlichen Form und Sprache\" erfolgt. Versteht ein Mitarbeiter kaum Deutsch, musst du also übersetzen, vorlesen lassen oder anders sicherstellen, dass der Inhalt ankommt — die Muttersprache ist dafür meist der zuverlässigste Weg.",
  },
  {
    q: "In welchen Sprachen ist uVise verfügbar?",
    a: "Jede Unterweisung kann in 41 Sprachen übersetzt und vorgelesen werden, darunter Türkisch, Ukrainisch, Arabisch, Polnisch und Rumänisch. Der Mitarbeiter wählt seine Sprache selbst in der App.",
  },
  {
    q: "Reicht eine Unterschrift als Nachweis, dass er es verstanden hat?",
    a: "Nein. Eine Unterschrift belegt nur, dass jemand unterschrieben hat, nicht dass er den Inhalt verstanden hat. War erkennbar, dass die Deutschkenntnisse dafür nicht ausreichen, hilft die Unterschrift im Ernstfall wenig. Deshalb schaltet uVise die Unterschrift erst frei, nachdem der Text vollständig gelesen oder vorgelesen wurde.",
  },
  {
    q: "Brauche ich zusätzlich einen Dolmetscher?",
    a: "In der Regel nicht. Für die meisten Betriebe reicht die automatische Übersetzung und Vorlesefunktion von uVise aus, um die gesetzlich geforderte Verständlichkeit herzustellen und nachweisbar zu dokumentieren. Bei sehr komplexen Inhalten (z. B. Gefahrstoffe mit vielen Fachbegriffen) kann ein Dolmetscher ergänzend sinnvoll sein.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-mehrsprachig/#webpage",
      url: "https://www.uvise.de/unterweisung-mehrsprachig",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-mehrsprachig/#faq",
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
      <UnterweisungMehrsprachig faq={FAQ} />
    </>
  );
}
