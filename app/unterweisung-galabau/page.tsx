import type { Metadata } from "next";
import { UnterweisungGalabau } from "@/components/marketing/UnterweisungGalabau";

const TITEL = "Unterweisung GaLaBau: Motorsäge, Pflicht, Ablauf";
const BESCHREIBUNG =
  "Unterweisung im GaLaBau: Motorsägen-Lehrgang, Maschinen und Anbaugeräte, UV-Belastung, Zeckengefahr, Absturz bei Baumpflege und SVLFG-Pflichten.";

// Eigene, SEO-optimierte Landingpage für den Garten- und Landschaftsbau —
// Ziel-Keywords "Unterweisung GaLaBau", "Unterweisung Garten- und
// Landschaftsbau", "Arbeitsschutz GaLaBau". Gleiches Design-System wie
// /unterweisung-handwerk, eigener, branchenspezifischer Inhalt.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung GaLaBau",
    "Unterweisung Garten- und Landschaftsbau",
    "Arbeitsschutz GaLaBau",
  ],
  alternates: { canonical: "https://www.uvise.de/unterweisung-galabau" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/unterweisung-galabau",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise — Unterweisung im Garten- und Landschaftsbau",
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
    q: "Braucht jeder Mitarbeiter einen Motorsägenlehrgang, bevor er eine Motorsäge nutzt?",
    a: "Ja. Der Umgang mit der Motorsäge zählt zu den gefährlichsten Tätigkeiten im GaLaBau und erfordert vor der ersten Nutzung einen anerkannten Motorsägenlehrgang mit theoretischem und praktischem Teil, zusätzlich zur jährlichen Unterweisung.",
  },
  {
    q: "Wie oft muss im GaLaBau unterwiesen werden?",
    a: "Mindestens einmal jährlich nach § 4 DGUV Vorschrift 1, zusätzlich anlassbezogen bei neuen Maschinen oder Anbaugeräten, vor der Baumpflege-Saison und nach besonderen Vorkommnissen.",
  },
  {
    q: "Muss ich über Zeckengefahr unterweisen?",
    a: "Bei regelmäßiger Arbeit im Grünen ist eine Unterweisung zum Schutz vor Zeckenstichen und den Anzeichen einer möglichen Infektion sinnvoll und in vielen Betrieben Teil der Gefährdungsbeurteilung — auch wenn es dafür keine eigene Spezialvorschrift gibt.",
  },
  {
    q: "Welche Berufsgenossenschaft ist für GaLaBau-Betriebe zuständig?",
    a: "In der Regel die SVLFG (Sozialversicherung für Landwirtschaft, Forsten und Gartenbau), die aus der früheren Gartenbau-Berufsgenossenschaft hervorgegangen ist. Bei Betrieben mit starkem Schwerpunkt auf klassischen Bauleistungen kann teils auch die BG BAU relevant sein.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/unterweisung-galabau/#webpage",
      url: "https://www.uvise.de/unterweisung-galabau",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/unterweisung-galabau/#faq",
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
      <UnterweisungGalabau faq={FAQ} />
    </>
  );
}
