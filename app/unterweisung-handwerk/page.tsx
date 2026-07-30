import type { Metadata } from "next";
import { UnterweisungHandwerk } from "@/components/marketing/UnterweisungHandwerk";

const TITEL = "Unterweisung im Handwerk – einfach & digital | uVise";
const BESCHREIBUNG =
  "Unterweisung im Handwerk: digital, einfach, ohne IT-Abteilung. App auf jedem Handy, rechtssicher dokumentiert, ab 19€/Monat. 7 Tage kostenlos testen.";

// Eigene, SEO-optimierte Landingpage für die Ziel-Keywords "Unterweisung
// Handwerk", "Arbeitsschutz Handwerk", "Sicherheitsunterweisung Handwerk" und
// "digitale Unterweisung Handwerksbetrieb". Gleiches Design-System wie die
// Startseite und /unterweisung-mehrsprachig, eigener Inhalt.
export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung Handwerk",
    "Arbeitsschutz Handwerk",
    "Sicherheitsunterweisung Handwerk",
    "digitale Unterweisung Handwerksbetrieb",
    "Unterweisungssoftware Handwerk",
  ],
  alternates: {
    canonical: "https://www.uvise.de/unterweisung-handwerk",
  },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-handwerk",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung im Handwerk, einfach & digital",
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
    q: "Sind Unterweisungen im Handwerk Pflicht?",
    a: "Ja. Nach § 12 Arbeitsschutzgesetz (ArbSchG) und § 4 DGUV Vorschrift 1 muss jeder Arbeitgeber seine Beschäftigten regelmäßig über Sicherheit und Gesundheitsschutz bei der Arbeit unterweisen — unabhängig von der Betriebsgröße. Das gilt für Handwerksbetriebe genauso wie für jeden anderen Betrieb.",
  },
  {
    q: "Wie oft muss ich unterweisen?",
    a: "Mindestens einmal jährlich, zusätzlich vor der ersten Tätigkeit (Erstunterweisung), bei neuen Gefährdungen, nach Unfällen oder bei Änderungen von Arbeitsmitteln und Abläufen. Details und Fristen findest du in unserer Unterweisung-Vorlage.",
  },
  {
    q: "Brauchen meine Mitarbeiter ein Firmen-Handy?",
    a: "Nein. Die uVise-Mitarbeiter-App läuft auf dem privaten Smartphone jedes Mitarbeiters — ein zusätzliches Firmen-Gerät ist nicht nötig.",
  },
  {
    q: "Lohnt sich uVise auch für einen kleinen Betrieb mit wenigen Mitarbeitern?",
    a: "Ja, uVise ist gezielt für kleine Betriebe mit 1 bis 30 Mitarbeitern gebaut, mit Paketen ab 19 € im Monat — ohne Einrichtungsgebühr und ohne IT-Abteilung, die es betreuen müsste.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-handwerk/#webpage",
      url: "https://www.uvise.de/unterweisung-handwerk",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-handwerk/#faq",
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
      <UnterweisungHandwerk faq={FAQ} />
    </>
  );
}
