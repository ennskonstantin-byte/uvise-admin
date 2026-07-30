import type { Metadata } from "next";
import { Preise } from "@/components/marketing/Preise";
import { PLANS, ENTERPRISE_KONTAKT } from "@/lib/types";

// Startpreis aus der zentralen PLANS-Quelle statt fest kodiert — ändert sich
// die Preisstruktur (siehe lib/types.ts), zieht diese Seite automatisch nach.
const STARTPREIS = Math.min(...PLANS.map((p) => Number(p.preis)));

const TITEL = `uVise Preise: Unterweisungssoftware ab ${STARTPREIS} €/Monat`;
const BESCHREIBUNG = `Unterweisungssoftware für kleine Betriebe: Team ab ${PLANS[0]?.preis}€, Betrieb ${PLANS[1]?.preis}€, Unternehmen ${PLANS[2]?.preis}€/Monat. 7 Tage kostenlos testen, keine Kreditkarte, monatlich kündbar.`;

// Eigene, indexierbare Preis-Seite (Ziel-Keywords „uVise Preise",
// „Unterweisungssoftware Preis", „Unterweisungssoftware Kosten") — gleiches
// Muster wie die Branchen-Landingpages.
//
// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "uVise Preise",
    "Unterweisungssoftware Preis",
    "Unterweisungssoftware Kosten",
    "Unterweisung Software Kosten",
    "Preise Unterweisungssoftware",
  ],
  alternates: {
    canonical: "https://www.uvise.de/preise",
  },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/preise",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://www.uvise.de/og-banner.png",
        width: 1200,
        height: 630,
        alt: "uVise Preise — Unterweisungssoftware für kleine Betriebe",
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

// FAQ-Antworten leiten die Zahlen aus PLANS/ENTERPRISE_KONTAKT ab, statt sie
// hier ein zweites Mal fest zu kodieren.
const FAQ = [
  {
    q: "Was passiert nach der Testphase?",
    a: "Nach den 7 Tagen kostenlosem Test wählst du eines der Pakete (Team, Betrieb oder Unternehmen) und zahlst erst dann. Ohne Auswahl läuft nichts automatisch in ein kostenpflichtiges Abo — es ist keine Kreditkarte für den Test nötig.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Ja, alle Pakete sind monatlich kündbar, es gibt keine Mindestlaufzeit und keine Einrichtungsgebühr. Beim Jahresabo (20% Rabatt) läuft die gewählte Laufzeit einmal durch, danach ebenfalls monatlich kündbar.",
  },
  {
    q: "Zählt der Chef-Zugang mit?",
    a: "Nein. Der Chef-/Admin-Zugang ist in jedem Paket gratis dabei und zählt nicht in das Mitarbeiter-Limit deines Tarifs.",
  },
  {
    q: `Was, wenn wir mehr als ${ENTERPRISE_KONTAKT.ab} Mitarbeiter haben?`,
    a: `Ab ${ENTERPRISE_KONTAKT.ab} Mitarbeitern gibt es kein Selbstbedienungs-Paket mehr — sprich uns über /kontakt an, wir stellen dir ein individuelles Angebot zusammen.`,
  },
];

// Strukturierte Daten: Preise als SoftwareApplication/Offer (gleiches Muster
// wie die Startseite in app/page.tsx) + FAQPage. Kein AggregateRating, da wir
// keine echten Bewertungszahlen haben.
const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.uvise.de/preise/#webpage",
      url: "https://www.uvise.de/preise",
      name: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      isPartOf: { "@id": "https://www.uvise.de/#website" },
    },
    {
      "@type": "SoftwareApplication",
      name: "uVise",
      description: BESCHREIBUNG,
      url: "https://www.uvise.de/preise",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      inLanguage: "de-DE",
      publisher: { "@id": "https://www.uvise.de/#organization" },
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.preis,
        priceCurrency: "EUR",
        description: `${plan.limit}, pro Monat`,
        url: "https://www.uvise.de/preise",
      })),
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.uvise.de/preise/#faq",
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
      <Preise faq={FAQ} startpreis={STARTPREIS} />
    </>
  );
}
