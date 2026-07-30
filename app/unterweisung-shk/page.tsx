import type { Metadata } from "next";
import { UnterweisungShk } from "@/components/marketing/UnterweisungShk";

const TITEL = "Unterweisung SHK: Heißarbeiten, Gas, Absturz, Pflicht";
const BESCHREIBUNG =
  "Unterweisung im SHK-Handwerk: Heißarbeiten mit Erlaubnisschein, Arbeiten an Gasanlagen, Absturz auf Dächern, Asbestrisiko und BGHM-Pflichten erklärt.";

// Eigene, SEO-optimierte Landingpage für Sanitär-, Heizungs- und
// Klimatechnik-Betriebe — Ziel-Keywords "Unterweisung SHK", "Unterweisung
// Sanitär Heizung Klima", "Arbeitsschutz SHK". Gleiches Design-System wie
// /unterweisung-handwerk, eigener, branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: ["Unterweisung SHK", "Unterweisung Sanitär Heizung Klima", "Arbeitsschutz SHK"],
  alternates: { canonical: "https://www.uvise.de/unterweisung-shk" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-shk",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung im SHK-Handwerk",
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
    q: "Was ist ein Erlaubnisschein für feuergefährliche Arbeiten?",
    a: "Ein schriftliches Dokument, das vor Löt-, Schweiß- oder anderen Heißarbeiten außerhalb fest eingerichteter Bereiche die Schutzmaßnahmen festhält — etwa das Entfernen brennbarer Stoffe und eine Brandwache. Es ist Teil der Unterweisung zu Heißarbeiten und sollte bei jedem Einsatz erneut ausgefüllt werden.",
  },
  {
    q: "Muss vor Arbeiten an Gasanlagen gesondert unterwiesen werden?",
    a: "Ja. Arbeiten an gasführenden Leitungen bergen Explosions- und Vergiftungsgefahr und erfordern eine spezifische Qualifikation sowie eine Unterweisung zu den betriebsspezifischen Absperr- und Prüfschritten, zusätzlich zur allgemeinen jährlichen Unterweisung.",
  },
  {
    q: "Worauf muss ich bei Asbest im Altbau achten?",
    a: "Vor Arbeiten in älteren Gebäuden (Baujahr meist vor 1993) sollte geprüft werden, ob asbesthaltige Materialien wie alte Dichtungen oder Rohrisolierungen betroffen sein können. Werden Beschäftigte mit solchen Tätigkeiten beauftragt, ist eine gesonderte Unterweisung zu den Gefahren und Schutzmaßnahmen nach Gefahrstoffrecht erforderlich.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für SHK-Betriebe zuständig?",
    a: "Je nach Tätigkeitsschwerpunkt meist die BGHM (Berufsgenossenschaft Holz und Metall), bei stark baustellenbezogenen Tätigkeiten in der Gebäudetechnik teils auch die BG BAU.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-shk/#webpage",
      url: "https://www.uvise.de/unterweisung-shk",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-shk/#faq",
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
      <UnterweisungShk faq={FAQ} />
    </>
  );
}
