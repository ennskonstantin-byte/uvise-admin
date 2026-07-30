import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Gefahrstoffunterweisung: Pflicht, Betriebsanweisung, Ablauf";
const BESCHREIBUNG =
  "Gefahrstoffunterweisung nach § 14 GefStoffV: mündlich, stoffbezogen, vor erstmaliger Tätigkeit – Pflicht, Betriebsanweisung und Ablauf erklärt.";

// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Gefahrstoffunterweisung",
    "Gefahrstoffunterweisung Pflicht",
    "Betriebsanweisung Gefahrstoffe",
    "Gefahrstoffunterweisung wie oft",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/gefahrstoffunterweisung" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/gefahrstoffunterweisung",
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
    q: "Ist eine Gefahrstoffunterweisung Pflicht?",
    a: "Ja. § 14 Gefahrstoffverordnung (GefStoffV) verpflichtet jeden Arbeitgeber, Beschäftigte, die mit Gefahrstoffen umgehen, vor der erstmaligen Tätigkeit und danach mindestens jährlich zu unterweisen – zusätzlich zur allgemeinen Unterweisungspflicht nach § 12 ArbSchG.",
  },
  {
    q: "Muss die Gefahrstoffunterweisung mündlich erfolgen?",
    a: "Ja. Anders als bei der allgemeinen Unterweisung schreibt § 14 GefStoffV ausdrücklich eine mündliche Unterweisung vor, arbeitsplatz- und stoffbezogen. Ergänzende schriftliche Unterlagen wie die Betriebsanweisung sind sinnvoll, ersetzen das persönliche Gespräch aber nicht.",
  },
  {
    q: "Was ist der Unterschied zwischen Betriebsanweisung und Gefahrstoffunterweisung?",
    a: "Die Betriebsanweisung ist das schriftliche Dokument nach § 14 GefStoffV, das Gefahren, Schutzmaßnahmen und Verhalten im Notfall für einen bestimmten Stoff oder Arbeitsbereich festhält. Die Gefahrstoffunterweisung ist das mündliche Gespräch, in dem der Inhalt der Betriebsanweisung den Beschäftigten vermittelt und verständlich gemacht wird.",
  },
  {
    q: "Wie oft muss die Gefahrstoffunterweisung wiederholt werden?",
    a: "Mindestens einmal jährlich, zusätzlich sofort bei neuen Gefahrstoffen, geänderten Schutzmaßnahmen oder nach einem Vorfall. Vor der erstmaligen Tätigkeit mit einem Gefahrstoff ist eine Unterweisung in jedem Fall Pflicht, unabhängig vom letzten Turnus.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/gefahrstoffunterweisung",
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

export default function GefahrstoffunterweisungPage() {
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

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10 leading-7 text-foreground/85">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-3">
            Ratgeber Arbeitsschutz
          </p>
          <h1 className="text-3xl font-semibold text-foreground mb-4 leading-tight">
            Gefahrstoffunterweisung: Pflicht, Betriebsanweisung und Ablauf
          </h1>
          <p className="text-foreground/70 mb-8">
            Reiniger, Lacke, Kraftstoffe, Klebstoffe – Gefahrstoffe stecken in mehr Arbeitsplätzen,
            als man denkt. Wer damit umgeht, muss darüber unterwiesen werden – und zwar strenger als
            bei einer normalen Sicherheitsunterweisung. Hier steht, was die Gefahrstoffverordnung
            konkret verlangt und wie die Unterweisung in der Praxis abläuft.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was ist eine Gefahrstoffunterweisung?
          </h2>
          <p className="mb-4">
            Die Gefahrstoffunterweisung ist die spezielle Unterweisung für Beschäftigte, die mit
            Gefahrstoffen – also Stoffen oder Gemischen mit gefährlichen Eigenschaften wie
            ätzend, reizend, brennbar oder gesundheitsschädlich – arbeiten. Sie ergänzt die
            allgemeine Unterweisungspflicht, die in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/sicherheitsunterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              Sicherheitsunterweisung: Pflicht, Inhalte und Ablauf
            </Link>{" "}
            beschrieben ist, um stoffspezifische Anforderungen.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Rechtliche Grundlage
          </h2>
          <p className="mb-4">
            Maßgeblich ist{" "}
            <a
              href="https://www.gesetze-im-internet.de/gefstoffv_2010/__14.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 14 Gefahrstoffverordnung (GefStoffV)
            </a>
            . Er verlangt mehr als die allgemeine Unterweisungspflicht nach § 12 ArbSchG und § 4{" "}
            <Link
              href="/ratgeber/dguv-vorschrift-1-unterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Vorschrift 1
            </Link>
            : Die Unterweisung muss <strong>mündlich</strong> erfolgen, sich auf den konkreten
            Arbeitsplatz und die tatsächlich verwendeten Stoffe beziehen und findet{" "}
            <strong>vor der erstmaligen Tätigkeit</strong> mit einem Gefahrstoff sowie danach{" "}
            <strong>mindestens jährlich</strong> statt.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Zusammenhang mit der Betriebsanweisung
          </h2>
          <p className="mb-4">
            § 14 GefStoffV verlangt außerdem eine schriftliche <strong>Betriebsanweisung</strong> für
            jeden verwendeten Gefahrstoff bzw. Arbeitsbereich – üblicherweise als Aushang am
            Arbeitsplatz. Sie beschreibt Gefahren, Schutzmaßnahmen, Verhalten im Gefahrfall und
            Erste-Hilfe-Maßnahmen für den jeweiligen Stoff. Die Betriebsanweisung ersetzt die
            mündliche Unterweisung nicht, sondern ist deren schriftliche Grundlage: In der
            Unterweisung wird der Inhalt der Betriebsanweisung erklärt und auf Verständnisfragen
            eingegangen.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Typische Inhalte
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Gefahren der am Arbeitsplatz tatsächlich verwendeten Stoffe</li>
            <li>Kennzeichnung und Sicherheitsdatenblätter der Gefahrstoffe</li>
            <li>Technische und organisatorische Schutzmaßnahmen</li>
            <li>Persönliche Schutzausrüstung (PSA) und ihre richtige Anwendung</li>
            <li>Verhalten bei Unfällen, Verschütten oder Hautkontakt</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Ablauf und Dokumentation
          </h2>
          <p className="mb-4">
            In der Praxis läuft die Gefahrstoffunterweisung meist so ab: Betriebsanweisung für den
            jeweiligen Stoff erstellen oder aktualisieren, die Beschäftigten mündlich unterweisen –
            arbeitsplatzbezogen, nicht als allgemeiner Vortrag – und die Unterweisung anschließend
            dokumentieren. Der Nachweis sollte Datum, Stoff bzw. Arbeitsbereich, unterweisende
            Person sowie Namen und Unterschriften der Teilnehmer enthalten. Eine fertige Struktur
            zum Kopieren gibt es in unserer{" "}
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
              uVise erinnert automatisch an die jährliche Frist der Gefahrstoffunterweisung, sammelt
              die Unterschrift jedes Mitarbeiters rechtssicher mit Zeitstempel und legt den Nachweis
              unveränderbar im Archiv ab – startklar für die nächste Kontrolle durch die
              Berufsgenossenschaft.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Das persönliche, mündliche Gespräch zur Gefahrstoffunterweisung führst du
              selbst – uVise sorgt dafür, dass Fristen eingehalten, Unterschriften eingeholt und
              Nachweise sicher aufbewahrt werden.
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
            Maßgeblich ist § 14 GefStoffV sowie die für deinen Betrieb zuständige
            Berufsgenossenschaft oder Unfallkasse.
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
