import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const TITEL = "Erste-Hilfe-Unterweisung und Ersthelfer im Betrieb";
const BESCHREIBUNG =
  "Erste-Hilfe-Unterweisung & Ersthelfer im Betrieb: Pflicht nach DGUV Vorschrift 1, benötigte Anzahl Ersthelfer, Auffrischung alle 2 Jahre und Dokumentation.";

// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Erste-Hilfe-Unterweisung",
    "Ersthelfer Pflicht Betrieb",
    "Erste Hilfe Unterweisung wie oft",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/erste-hilfe-unterweisung" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/erste-hilfe-unterweisung",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITEL,
    description: BESCHREIBUNG,
  },
};

const FAQ = [
  {
    q: "Muss jeder Mitarbeiter eine Erste-Hilfe-Ausbildung haben?",
    a: "Nein. Alle Beschäftigten müssen im Rahmen der allgemeinen Unterweisung über Erste-Hilfe-Einrichtungen und die betrieblichen Ersthelfer informiert werden – eine vollständige Erste-Hilfe-Ausbildung ist aber nur für die benannten Ersthelfer selbst vorgeschrieben.",
  },
  {
    q: "Wie viele Ersthelfer braucht mein Betrieb?",
    a: "Nach § 26 DGUV Vorschrift 1 gilt als Faustregel: In Verwaltungs- und Handelsbetrieben mit mindestens 2 anwesenden Beschäftigten müssen 5 % Ersthelfer sein, in sonstigen Betrieben (z. B. Produktion, Handwerk) 10 %. Bei kleinen Betrieben reicht oft auch ein Ersthelfer, sofern die Quote erfüllt ist.",
  },
  {
    q: "Wie oft muss die Ersthelfer-Ausbildung aufgefrischt werden?",
    a: "Alle zwei Jahre, durch eine Fortbildung im Umfang von neun Unterrichtseinheiten. Ohne rechtzeitige Auffrischung verliert die Qualifikation ihre Gültigkeit und der Betrieb hat rechnerisch keinen ausgebildeten Ersthelfer mehr.",
  },
  {
    q: "Was gehört noch zur betrieblichen Ersten Hilfe außer den Ersthelfern?",
    a: "Ausreichend und leicht zugängliches Erste-Hilfe-Material (Verbandkasten), ein gut sichtbarer Aushang mit den Notrufnummern und den Namen der Ersthelfer sowie ein funktionierendes Verbandbuch, in dem jede Erste-Hilfe-Leistung dokumentiert wird.",
  },
];

const strukturierteDaten = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: TITEL,
      description: BESCHREIBUNG,
      inLanguage: "de-DE",
      author: { "@type": "Organization", name: "uVise" },
      publisher: {
        "@type": "Organization",
        name: "uVise",
        logo: { "@type": "ImageObject", url: "https://www.uvise.de/icon.png" },
      },
      mainEntityOfPage: "https://www.uvise.de/ratgeber/erste-hilfe-unterweisung",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function ErsteHilfeUnterweisungPage() {
  return (
    <div className="min-h-screen bg-page-bg px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }}
      />
      <article className="mx-auto max-w-2xl">
        <Link href="/" className="flex items-center gap-3 mb-8 w-fit">
          <LogoMark size={40} />
          <span className="text-lg font-semibold">uVise</span>
        </Link>

        <Breadcrumbs
          items={[
            { label: "Startseite", href: "/" },
            { label: "Ratgeber", href: "/ratgeber" },
            { label: "Erste-Hilfe-Unterweisung und Ersthelfer im Betrieb" },
          ]}
        />

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10 leading-7 text-foreground/85">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-3">
            Ratgeber Arbeitsschutz
          </p>
          <h1 className="text-3xl font-semibold text-foreground mb-4 leading-tight">
            Erste-Hilfe-Unterweisung und Ersthelfer im Betrieb
          </h1>
          <p className="text-foreground/70 mb-8">
            Ein Schnittwunde, ein Sturz, ein Kreislaufkollaps – bis der Rettungsdienst eintrifft,
            zählen die ersten Minuten. Damit dann jemand weiß, was zu tun ist, schreibt der
            Gesetzgeber sowohl eine allgemeine Erste-Hilfe-Unterweisung als auch ausgebildete
            Ersthelfer im Betrieb vor. Hier steht, was den Unterschied macht und wie viele
            Ersthelfer du wirklich brauchst.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Erste-Hilfe-Unterweisung vs. Ersthelfer-Ausbildung
          </h2>
          <p className="mb-4">
            Beide Begriffe werden oft vermischt, meinen aber unterschiedliche Dinge. Die{" "}
            <strong>allgemeine Erste-Hilfe-Unterweisung</strong> richtet sich an alle Beschäftigten:
            Sie erfahren, wo das Verbandmaterial liegt, wer die Ersthelfer im Betrieb sind und wie
            ein Notruf abgesetzt wird. Sie ist Teil der normalen Unterweisungspflicht – mehr dazu in
            unserem Ratgeber{" "}
            <Link
              href="/ratgeber/sicherheitsunterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              Sicherheitsunterweisung: Pflicht, Inhalte und Ablauf
            </Link>
            . Die <strong>Ersthelfer-Ausbildung</strong> dagegen ist eine mehrstündige praktische
            Schulung für die Beschäftigten, die im Ernstfall aktiv Erste Hilfe leisten sollen –
            Wiederbelebung, Wundversorgung, stabile Seitenlage inklusive.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Rechtliche Grundlage
          </h2>
          <p className="mb-4">
            Die betriebliche Erste Hilfe ist in den{" "}
            <a
              href="https://publikationen.dguv.de/regelwerk/dguv-vorschriften/2909/dguv-vorschrift-1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              §§ 24 bis 26 DGUV Vorschrift 1
            </a>{" "}
            geregelt – der allgemeinen Unfallverhütungsvorschrift, die auch die
            Unterweisungspflicht nach § 4 begründet (dazu mehr in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/dguv-vorschrift-1-unterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Vorschrift 1: Unterweisungspflicht einfach erklärt
            </Link>
            ). § 24 verpflichtet zu Erste-Hilfe-Material und -Einrichtungen, § 25 zur Meldung und
            Dokumentation von Erste-Hilfe-Leistungen, § 26 zur Zahl und Ausbildung der Ersthelfer.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wie viele Ersthelfer braucht mein Betrieb?
          </h2>
          <p className="mb-3">
            § 26 DGUV Vorschrift 1 gibt zwei Faustregeln vor, je nach Betriebsart:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Verwaltungs- und Handelsbetriebe</strong> mit mindestens 2 anwesenden
              Beschäftigten: mindestens <strong>5 %</strong> Ersthelfer.
            </li>
            <li>
              <strong>Sonstige Betriebe</strong> (z. B. Produktion, Handwerk, Bau): mindestens{" "}
              <strong>10 %</strong> Ersthelfer.
            </li>
          </ul>
          <p className="mb-4">
            Bereits bei kleinen Betrieben mit nur wenigen Beschäftigten reicht rechnerisch oft ein
            einziger Ersthelfer aus – wichtig ist, dass er auch bei Urlaub oder Krankheit erreichbar
            bleibt, weshalb viele Betriebe vorsichtshalber mehr als das Minimum ausbilden.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Auffrischung, Material und Dokumentation
          </h2>
          <p className="mb-4">
            Die Ersthelfer-Qualifikation muss <strong>alle zwei Jahre</strong> durch eine
            Fortbildung aufgefrischt werden, sonst gilt sie als abgelaufen. Zusätzlich braucht jeder
            Betrieb ausreichendes, leicht erreichbares Erste-Hilfe-Material, einen gut sichtbaren
            Aushang mit Notrufnummern und den Namen der Ersthelfer sowie ein Verbandbuch, in dem
            jede Erste-Hilfe-Leistung dokumentiert wird. Eine passende Struktur für den allgemeinen
            Unterweisungsnachweis gibt es in unserer{" "}
            <Link
              href="/ratgeber/unterweisung-vorlage"
              className="text-blue-500 underline underline-offset-4"
            >
              kostenlosen Unterweisung-Vorlage
            </Link>
            .
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Wie uVise dabei hilft</h2>
            <p className="mb-4">
              uVise erinnert automatisch an die Auffrischung der Ersthelfer-Ausbildung und an die
              jährliche Erste-Hilfe-Unterweisung aller Beschäftigten, sammelt die Unterschrift jedes
              Mitarbeiters rechtssicher mit Zeitstempel und legt den Nachweis unveränderbar im
              Archiv ab.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die praktische Erste-Hilfe-Ausbildung deiner Ersthelfer führt weiterhin eine
              zugelassene Ausbildungsstelle durch – uVise sorgt dafür, dass Fristen im Blick bleiben
              und die allgemeine Unterweisung sauber dokumentiert ist.
            </p>
            <Link
              href="/login?mode=register"
              className="inline-block rounded-full px-6 py-3 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              7 Tage kostenlos testen
            </Link>
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-10 mb-3">Häufige Fragen</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="text-foreground/80">{item.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-foreground/50">
            Dieser Ratgeber dient der allgemeinen Information und ist keine Rechtsberatung.
            Maßgeblich sind die §§ 24 bis 26 DGUV Vorschrift 1 sowie die für deinen Betrieb
            zuständige Berufsgenossenschaft oder Unfallkasse.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 mt-6 text-sm text-foreground/60">
          <Link href="/ratgeber" className="hover:text-foreground underline-offset-4 hover:underline">
            ← Alle Ratgeber
          </Link>
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            Startseite
          </Link>
          <Link href="/impressum" className="hover:text-foreground underline-offset-4 hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground underline-offset-4 hover:underline">
            Datenschutz
          </Link>
        </nav>
      </article>
    </div>
  );
}
