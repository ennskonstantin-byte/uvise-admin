import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Unterweisung vergessen – was jetzt? (2026)";
const BESCHREIBUNG =
  "Die jährliche Unterweisung ist überfällig oder ganz vergessen worden? Was du jetzt sofort tun solltest, warum Rückdatieren die schlechteste aller Ideen ist und welche Bußgelder wirklich drohen.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung vergessen",
    "Unterweisung überfällig",
    "Unterweisung nicht durchgeführt",
    "Unterweisung Bußgeld",
    "Unterweisung nachholen",
    "Arbeitsschutz Bußgeld Unterweisung",
    "Unterweisung Frist überschritten",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/unterweisung-vergessen" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/unterweisung-vergessen",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Was passiert, wenn die Unterweisung überfällig ist?",
    a: "Solange nichts passiert, meist nichts. Kritisch wird es bei einer Kontrolle oder nach einem Unfall: Dann gilt die Unterweisungspflicht als verletzt. Ein Verstoß gegen die Unfallverhütungsvorschriften kann als Ordnungswidrigkeit mit einer Geldbuße bis zu 10.000 Euro geahndet werden (§ 209 SGB VII).",
  },
  {
    q: "Darf ich den Nachweis rückdatieren?",
    a: "Nein. Rückdatieren ist eine Fälschung von Beweismitteln und macht aus einem Organisationsfehler ein persönliches Problem. Kommt es heraus, verlierst du jede Glaubwürdigkeit – auch für alle anderen Nachweise, die vielleicht korrekt waren.",
  },
  {
    q: "Was mache ich, wenn ich es heute merke?",
    a: "Sofort nachholen und mit dem heutigen, echten Datum dokumentieren. Eine verspätete, ehrlich datierte Unterweisung ist deutlich besser als gar keine – und unendlich viel besser als eine gefälschte.",
  },
  {
    q: "Haftet der Chef persönlich?",
    a: "Möglich. Passiert ein Unfall und war die Unterweisung grob fahrlässig unterlassen, kann die Berufsgenossenschaft Regress nehmen (§ 110 SGB VII). Bei vorsätzlichen Verstößen gegen behördliche Anordnungen mit Gefährdung von Leben oder Gesundheit droht sogar eine Straftat (§ 26 ArbSchG).",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/unterweisung-vergessen",
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

export default function UnterweisungVergessenPage() {
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
            Unterweisung vergessen – was jetzt?
          </h1>
          <p className="text-foreground/70 mb-8">
            Du schaust in den Ordner und stellst fest: Die letzte Unterweisung ist von vorletztem
            Jahr. Bei manchen Leuten findest du gar nichts. Erst mal: Das passiert in sehr vielen
            Betrieben. Wichtig ist nur, was du in den nächsten zehn Minuten entscheidest – denn hier
            machen die meisten den Fehler, der aus einer Schlamperei ein echtes Problem macht.
          </p>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Das Wichtigste zuerst: Nicht rückdatieren
            </h2>
            <p className="mb-0">
              Die Versuchung ist groß: Zettel ausdrucken, Datum von letztem März drauf, unterschreiben
              lassen, Ordner zu. <strong>Mach das nicht.</strong> Damit wird aus einem
              Organisationsfehler – für den es Bußgeld gibt – eine Fälschung von Beweismitteln, für
              die du persönlich geradestehst. Und Mitarbeiter erinnern sich im Zweifel sehr genau
              daran, dass da im März nichts war.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was du jetzt tun solltest – in dieser Reihenfolge
          </h2>
          <p className="mb-3">
            <strong>1. Nachholen. Heute, nicht nächsten Monat.</strong> Eine verspätete Unterweisung
            ist rechtlich unendlich viel besser als keine. Ab dem Moment, in dem du es weißt, wird
            aus „vergessen" nämlich „bewusst unterlassen" – und das ist eine ganz andere Kategorie.
          </p>
          <p className="mb-3">
            <strong>2. Ehrlich datieren.</strong> Mit dem echten Datum von heute. Ein Nachweis mit
            korrektem Datum zeigt: Der Betrieb hat den Fehler selbst gefunden und behoben. Das ist
            im Zweifel ein mildernder Umstand, kein belastender.
          </p>
          <p className="mb-3">
            <strong>3. Priorisieren.</strong> Wenn viel offen ist: erst die Leute mit den größten
            Gefährdungen (Maschinen, Stapler, Gefahrstoffe, Baustelle), dann der Rest. Und zuerst
            alle unter 18 – die haben die kürzere Frist.
          </p>
          <p className="mb-4">
            <strong>4. Ursache abstellen.</strong> Vergessen wird nicht aus Bosheit, sondern weil
            niemand erinnert. Wenn du nichts änderst, sitzt du in 12 Monaten wieder hier.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was wirklich droht (ohne Panikmache)
          </h2>
          <p className="mb-3">
            Solange nichts passiert, merkt es niemand. Gefährlich sind genau zwei Momente: die
            Kontrolle – und der Unfall.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Bußgeld:</strong> Ein Verstoß gegen die Unfallverhütungsvorschriften (dazu
              gehört die Unterweisungspflicht aus § 4 DGUV Vorschrift 1) ist eine Ordnungswidrigkeit
              – bis zu <strong>10.000 Euro</strong> (§ 209 SGB VII).
            </li>
            <li>
              <strong>Behördliche Anordnung:</strong> Die Aufsichtsbehörde kann dich zum Handeln
              verpflichten. Wer dagegen verstößt, riskiert bis zu{" "}
              <a
                href="https://www.gesetze-im-internet.de/arbschg/__25.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline underline-offset-4"
              >
                30.000 Euro (§ 25 ArbSchG)
              </a>
              .
            </li>
            <li>
              <strong>Straftat:</strong> Wer vorsätzlich gegen eine solche Anordnung verstößt und
              dadurch Leben oder Gesundheit gefährdet, macht sich strafbar –{" "}
              <a
                href="https://www.gesetze-im-internet.de/arbschg/__26.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline underline-offset-4"
              >
                § 26 ArbSchG
              </a>
              .
            </li>
            <li>
              <strong>Regress nach einem Unfall:</strong> Zahlt die Berufsgenossenschaft, kann sie
              sich das Geld bei grober Fahrlässigkeit zurückholen (§ 110 SGB VII). Das ist die
              Position, die Betriebe wirklich weh tut.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Der eigentliche Fehler ist nicht das Vergessen
          </h2>
          <p className="mb-4">
            Niemand vergisst eine Unterweisung, weil ihm Sicherheit egal ist. Man vergisst sie, weil
            sie in keinem Kalender steht, weil der Ordner im Schrank nicht piept und weil 30
            Mitarbeiter 30 verschiedene Fristen haben. Das ist kein Charakterfehler, das ist ein
            <strong> Organisationsproblem</strong> – und genau die lassen sich lösen.
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Damit es nicht wieder passiert
            </h2>
            <p className="mb-4">
              uVise rechnet jede Frist pro Mitarbeiter automatisch mit und meldet sich rechtzeitig,
              bevor etwas abläuft – per E-Mail und im Dashboard. Du siehst auf einen Blick, wer
              überfällig ist, weist die Unterweisung mit einem Klick zu, und der Mitarbeiter
              unterschreibt auf dem Handy. Der Nachweis landet unveränderbar im Archiv, mit
              korrektem Server-Zeitstempel – rückdatieren kann ihn übrigens niemand, auch du nicht.
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
