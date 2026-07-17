import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Wie oft muss unterwiesen werden? Alle Fristen auf einen Blick (2026)";
const BESCHREIBUNG =
  "Jährlich, halbjährlich oder sofort? Alle Unterweisungs-Fristen im Arbeitsschutz mit Paragrafen: jährliche Wiederholung, Jugendliche, Gefahrstoffe, neue Mitarbeiter und anlassbezogene Unterweisungen.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung wie oft",
    "Unterweisung Fristen",
    "jährliche Unterweisung",
    "Unterweisung Intervall",
    "Unterweisung Jugendliche halbjährlich",
    "Unterweisung Gefahrstoffe Frist",
    "Wiederholungsunterweisung",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/unterweisung-fristen" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/unterweisung-fristen",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Wie oft muss ich meine Mitarbeiter unterweisen?",
    a: "Mindestens einmal pro Jahr (§ 4 Abs. 1 DGUV Vorschrift 1). Dazu kommen anlassbezogene Unterweisungen: bei Einstellung, neuer Tätigkeit, neuen Maschinen oder Stoffen, geänderten Abläufen und nach einem Unfall.",
  },
  {
    q: "Gilt für Jugendliche eine andere Frist?",
    a: "Ja. Beschäftigte unter 18 Jahren müssen mindestens halbjährlich unterwiesen werden (§ 29 Jugendarbeitsschutzgesetz) – also doppelt so oft wie Erwachsene.",
  },
  {
    q: "Muss ich exakt nach 12 Monaten unterweisen?",
    a: "Die Vorschrift sagt mindestens einmal jährlich. In der Praxis rechnet man ab dem Datum der letzten Unterweisung. Wer bis zum 12. Monat wartet und dann verrutscht, ist über der Frist – deshalb planen viele Betriebe die Wiederholung nach 11 Monaten ein.",
  },
  {
    q: "Zählt eine Unterweisung für alle Themen gleichzeitig?",
    a: "Nein. Die Unterweisung muss auf den Arbeitsplatz und die konkreten Gefährdungen ausgerichtet sein. Ein Lagerarbeiter braucht andere Inhalte als jemand im Büro. Für Gefahrstoffe gilt zusätzlich eine eigene jährliche Pflicht (§ 14 GefStoffV).",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/unterweisung-fristen",
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

export default function UnterweisungFristenPage() {
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
            Wie oft muss unterwiesen werden?
          </h1>
          <p className="text-foreground/70 mb-8">
            Einmal im Jahr – das weiß jeder. Der Ärger entsteht bei allem, was daneben liegt: der
            Azubi, der neue Gabelstapler, der Kollege, der seit gestern in der Lackiererei
            aushilft. Hier stehen alle Fristen, die dich wirklich betreffen.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Die kurze Antwort</h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Alle Beschäftigten: mindestens 1× pro Jahr</strong> – § 4 Abs. 1 DGUV
              Vorschrift 1.
            </li>
            <li>
              <strong>Unter 18 Jahren: mindestens alle 6 Monate</strong> –{" "}
              <a
                href="https://www.gesetze-im-internet.de/jarbschg/__29.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline underline-offset-4"
              >
                § 29 Jugendarbeitsschutzgesetz
              </a>
              .
            </li>
            <li>
              <strong>Gefahrstoffe: zusätzlich 1× pro Jahr</strong>, arbeitsplatzbezogen –{" "}
              <a
                href="https://www.gesetze-im-internet.de/gefstoffv_2010/__14.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline underline-offset-4"
              >
                § 14 Gefahrstoffverordnung
              </a>
              .
            </li>
            <li>
              <strong>Anlassbezogen: sofort</strong> – dazu unten mehr.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Die jährliche Wiederholung – und der Denkfehler dabei
          </h2>
          <p className="mb-4">
            „Einmal jährlich" heißt nicht „irgendwann im Kalenderjahr". Gerechnet wird ab der
            letzten Unterweisung. Wer im November 2025 unterwiesen hat, ist im Dezember 2026 zu
            spät – auch wenn beides „einmal im Jahr" war.
          </p>
          <p className="mb-4">
            Deshalb der Praxistipp, der dir Ärger spart: <strong>Plane die Wiederholung nach
            11 Monaten.</strong> Dann hast du einen Monat Puffer für Urlaub, Krankheit und den
            Kollegen, der nie greifbar ist.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Anlassbezogen: Diese Momente lösen sofort eine Unterweisung aus
          </h2>
          <p className="mb-3">
            Unabhängig vom Jahresrhythmus musst du unterweisen, wenn sich etwas ändert. Die
            wichtigsten Auslöser:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Neue Mitarbeiter</strong> – vor Aufnahme der Tätigkeit, nicht „in der ersten
              Woche mal".
            </li>
            <li>
              <strong>Neue Tätigkeit oder Versetzung</strong> – wer vom Lager an die Maschine
              wechselt, braucht eine neue Unterweisung.
            </li>
            <li>
              <strong>Neue Arbeitsmittel</strong> – neue Maschine, neues Werkzeug, neue Software mit
              Sicherheitsrelevanz.
            </li>
            <li>
              <strong>Neue Gefahrstoffe</strong> oder geänderte Sicherheitsdatenblätter.
            </li>
            <li>
              <strong>Nach einem Unfall oder Beinaheunfall</strong> – das ist der Moment, in dem
              Unterweisung tatsächlich mal jemand ernst nimmt.
            </li>
            <li>
              <strong>Geänderte Abläufe</strong> – neue Fluchtwege, Umbau, neuer Sammelplatz.
            </li>
            <li>
              <strong>Nach längerer Abwesenheit</strong> – z. B. nach Elternzeit oder langer
              Krankheit. Keine feste Frist im Gesetz, aber gelebte Praxis und im Zweifel dein
              Vorteil.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Sonderfälle, die gern übersehen werden
          </h2>
          <p className="mb-3">
            <strong>Leiharbeitnehmer.</strong> Unterwiesen wird da, wo gearbeitet wird: Der
            <em> Entleiher</em> – also dein Betrieb – muss unterweisen, nicht die Zeitarbeitsfirma.
          </p>
          <p className="mb-3">
            <strong>Praktikanten und Aushilfen.</strong> Auch bei zwei Wochen Ferienjob gilt die
            volle Pflicht. Bei unter 18-Jährigen zusätzlich der Halbjahres-Rhythmus.
          </p>
          <p className="mb-4">
            <strong>Fremdfirmen auf deinem Gelände.</strong> Sie unterweisen ihre eigenen Leute –
            aber du musst über die Gefahren <em>bei dir</em> informieren (Koordinierungspflicht,
            § 8 ArbSchG).
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Nicht verwechseln: Unterweisung ≠ Qualifikation
          </h2>
          <p className="mb-4">
            Ersthelfer, Brandschutzhelfer, Staplerschein: Das sind <strong>Qualifikationen</strong>{" "}
            mit eigenen Fortbildungs-Rhythmen (Ersthelfer z. B. alle zwei Jahre). Die laufen neben
            den Unterweisungen her – und werden im Alltag am häufigsten vergessen, weil sie in
            keinem Jahresplan stehen.
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Fristen im Kopf behalten? Muss nicht sein
            </h2>
            <p className="mb-4">
              Genau hier scheitert es in der Praxis: nicht am Wissen, sondern am Erinnern. uVise
              rechnet die Fristen für jeden Mitarbeiter mit, meldet sich rechtzeitig von selbst –
              und zeigt dir auf einen Blick, wer dran ist. Auch Qualifikationen wie Ersthelfer oder
              Staplerschein mit eigenem Ablaufdatum.
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
            Dieser Ratgeber dient der allgemeinen Information und ist keine Rechtsberatung. Maßgeblich
            sind die jeweils geltenden Gesetze und die für deinen Betrieb zuständige Berufsgenossenschaft.
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
