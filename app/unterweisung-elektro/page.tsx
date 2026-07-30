import type { Metadata } from "next";
import { UnterweisungElektro } from "@/components/marketing/UnterweisungElektro";

const TITEL = "Unterweisung Elektro: EUP, Elektrofachkraft, Regeln";
const BESCHREIBUNG =
  "Unterweisung im Elektrohandwerk: Unterschied EUP/Elektrofachkraft, die 5 Sicherheitsregeln und Prüfpflichten nach DGUV Vorschrift 3 einfach erklärt.";

// Eigene, SEO-optimierte Landingpage für das Elektrohandwerk — Ziel-Keywords
// "Unterweisung Elektro", "Unterweisung Elektrofachkraft", "Arbeitsschutz
// Elektrohandwerk". Gleiches Design-System wie /unterweisung-handwerk, eigener,
// branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung Elektro",
    "Unterweisung Elektrofachkraft",
    "Arbeitsschutz Elektrohandwerk",
  ],
  alternates: { canonical: "https://www.uvise.de/unterweisung-elektro" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-elektro",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung im Elektrohandwerk",
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
    q: "Was ist der Unterschied zwischen Elektrofachkraft und elektrotechnisch unterwiesener Person (EUP)?",
    a: "Die Elektrofachkraft (EFK) hat eine elektrotechnische Ausbildung und darf elektrische Anlagen eigenständig beurteilen, prüfen und instand setzen. Die elektrotechnisch unterwiesene Person (EUP) wurde von einer Elektrofachkraft über ihre konkrete Tätigkeit unterwiesen und darf nur einfache, genau festgelegte Arbeiten unter Anleitung ausführen — keine eigenständige Beurteilung von Gefahren.",
  },
  {
    q: "Muss eine EUP jährlich unterwiesen werden?",
    a: "Ja. Wie jede Unterweisung nach § 4 DGUV Vorschrift 1 muss auch die Unterweisung zur elektrotechnisch unterwiesenen Person mindestens einmal jährlich wiederholt werden, zusätzlich bei neuen Tätigkeiten oder Arbeitsmitteln.",
  },
  {
    q: "Was sind die 5 Sicherheitsregeln?",
    a: "Freischalten, gegen Wiedereinschalten sichern, Spannungsfreiheit feststellen, Erden und Kurzschließen sowie benachbarte, unter Spannung stehende Teile abdecken oder abschranken. Sie gelten bei Arbeiten an elektrischen Anlagen als Grundvoraussetzung für sicheres Arbeiten.",
  },
  {
    q: "Wie oft müssen ortsveränderliche elektrische Betriebsmittel geprüft werden?",
    a: "Nach DGUV Vorschrift 3 richtet sich die Prüffrist nach der Fehlerquote vorheriger Prüfungen und den Einsatzbedingungen — auf Baustellen üblicherweise häufiger als im Büro. Der Prüfer legt die konkrete Frist im Betrieb fest.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-elektro/#webpage",
      url: "https://www.uvise.de/unterweisung-elektro",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-elektro/#faq",
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
      <UnterweisungElektro faq={FAQ} />
    </>
  );
}
