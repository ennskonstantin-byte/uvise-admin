import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Unterweisung für fremdsprachige Mitarbeiter: Was das Gesetz wirklich verlangt (2026)";
const BESCHREIBUNG =
  "Muss die Unterweisung übersetzt werden? Was gilt bei Mitarbeitern, die kaum Deutsch sprechen? Rechtslage (ArbSchG, BetrSichV, GefStoffV), typische Fehler und praktische Wege, wie du es sauber löst.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung fremdsprachige Mitarbeiter",
    "Unterweisung ausländische Mitarbeiter",
    "Unterweisung übersetzen",
    "Unterweisung verständliche Sprache",
    "Sicherheitsunterweisung Fremdsprache",
    "Unterweisung Muttersprache Pflicht",
    "Arbeitsschutz Sprachbarriere",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/unterweisung-fremdsprachige-mitarbeiter" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/unterweisung-fremdsprachige-mitarbeiter",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Muss ich die Unterweisung in die Muttersprache übersetzen?",
    a: "Das Gesetz schreibt keine bestimmte Sprache vor – es verlangt, dass der Mitarbeiter die Unterweisung versteht. Für Arbeitsmittel (§ 12 BetrSichV) und Gefahrstoffe (§ 14 GefStoffV) steht sogar ausdrücklich, dass sie in einer für die Beschäftigten verständlichen Form und Sprache erfolgen muss. Versteht jemand kein Deutsch, musst du also übersetzen, dolmetschen oder anders sicherstellen, dass er es verstanden hat.",
  },
  {
    q: "Reicht es, wenn ein Kollege übersetzt?",
    a: "Als Notlösung ja, aber es ist heikel: Du musst nachweisen können, dass korrekt übersetzt wurde. Der Kollege ist kein Dolmetscher, haftet nicht und lässt im Zweifel Details weg. Besser ist eine dokumentierte Übersetzung des Inhalts, die der Mitarbeiter selbst nachlesen oder anhören kann.",
  },
  {
    q: "Was passiert, wenn ein Mitarbeiter die Unterweisung nicht verstanden hat?",
    a: "Rechtlich gilt die Unterweisung dann als nicht ordnungsgemäß durchgeführt – auch wenn eine Unterschrift vorliegt. Passiert ein Unfall, steht der Arbeitgeber in der Verantwortung: Bußgeld, Ärger mit der Berufsgenossenschaft und im schlimmsten Fall persönliche Haftung.",
  },
  {
    q: "Ist eine Unterschrift ein Beweis, dass er es verstanden hat?",
    a: "Nein. Eine Unterschrift belegt nur, dass jemand etwas unterschrieben hat. Wenn erkennbar war, dass der Mitarbeiter kaum Deutsch spricht, hilft dir die Unterschrift wenig. Entscheidend ist, dass du die Verständlichkeit ernsthaft sichergestellt und dokumentiert hast.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/unterweisung-fremdsprachige-mitarbeiter",
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

export default function FremdsprachigeMitarbeiterPage() {
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
            Unterweisung für fremdsprachige Mitarbeiter
          </h1>
          <p className="text-foreground/70 mb-8">
            Der neue Kollege nickt bei jedem Satz. Er unterschreibt sofort, ohne zu fragen. Und du
            weißt eigentlich genau: Verstanden hat er davon höchstens die Hälfte. Genau an dieser
            Stelle wird aus einer Formsache ein echtes Haftungsrisiko – hier steht, was rechtlich
            wirklich gilt und wie du es ohne großen Aufwand sauber löst.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Das Missverständnis: „Unterschrieben ist unterwiesen"
          </h2>
          <p className="mb-4">
            Die Unterschrift ist kein Beweis für Verstehen. Sie ist ein Beweis dafür, dass jemand
            einen Stift in der Hand hatte. Wenn im Betrieb jeder weiß, dass ein Mitarbeiter kaum
            Deutsch spricht, hilft dir seine Unterschrift unter einem deutschen Text im Ernstfall
            wenig – im Gegenteil, sie kann wie ein Feigenblatt wirken.
          </p>
          <p className="mb-4">
            Der Maßstab ist nicht „Habe ich unterwiesen?", sondern <strong>„Konnte er es
            verstehen?"</strong>
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was das Gesetz verlangt
          </h2>
          <p className="mb-4">
            Die Grundpflicht steht in{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 Arbeitsschutzgesetz (ArbSchG)
            </a>
            : Du musst „ausreichend und angemessen" unterweisen. „Angemessen" heißt auch: so, dass
            der Mensch vor dir es tatsächlich aufnehmen kann.
          </p>
          <p className="mb-3">
            An zwei Stellen wird der Gesetzgeber sogar ausdrücklich deutlich – dort steht die Sprache
            wörtlich drin:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <a
                href="https://www.gesetze-im-internet.de/betrsichv_2015/__12.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline underline-offset-4"
              >
                § 12 Betriebssicherheitsverordnung (BetrSichV)
              </a>{" "}
              – Unterweisung zu Arbeitsmitteln: „in einer für die Beschäftigten verständlichen Form
              und Sprache".
            </li>
            <li>
              <a
                href="https://www.gesetze-im-internet.de/gefstoffv_2010/__14.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline underline-offset-4"
              >
                § 14 Gefahrstoffverordnung (GefStoffV)
              </a>{" "}
              – Unterweisung zu Gefahrstoffen: ebenfalls „in für die Beschäftigten verständlicher
              Form und Sprache".
            </li>
          </ul>
          <p className="mb-4">
            Es gibt also keine Pflicht, alles ins Rumänische zu übersetzen. Es gibt die Pflicht,
            verstanden zu werden. Ob du das über Übersetzung, Dolmetscher oder Bilder löst, bleibt
            dir überlassen – nur wegdiskutieren kannst du es nicht.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was schiefgehen kann
          </h2>
          <p className="mb-4">
            Solange nichts passiert, fällt es niemandem auf. Der Ärger beginnt nach einem Unfall –
            und dann wird rückwärts geprüft:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Die Berufsgenossenschaft fragt, wie die Unterweisung abgelaufen ist.</li>
            <li>
              Stellt sich heraus, dass der Verunglückte den Text nie verstehen konnte, gilt die
              Unterweisung als nicht ordnungsgemäß.
            </li>
            <li>
              Folge: Bußgeld, Regressforderungen – und bei grober Pflichtverletzung persönliche
              Haftung des Verantwortlichen.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Vier Wege, die in der Praxis funktionieren
          </h2>
          <p className="mb-3">
            <strong>1. Den Text übersetzen.</strong> Der sauberste Weg. Wichtig: Die Übersetzung
            gehört zum Nachweis dazu – heb sie mit auf, damit du später zeigen kannst, was der
            Mitarbeiter tatsächlich gelesen hat.
          </p>
          <p className="mb-3">
            <strong>2. Vorlesen lassen.</strong> Viele Beschäftigte lesen ihre eigene Sprache
            schlechter, als sie sie sprechen – gerade bei Menschen, die wenig zur Schule gegangen
            sind. Gehört wird oft mehr verstanden als gelesen.
          </p>
          <p className="mb-3">
            <strong>3. Bilder und Zeichen.</strong> Ein durchgestrichener Gabelstapler-Bereich
            versteht jeder, in jeder Sprache. Piktogramme ersetzen keine Unterweisung, aber sie
            tragen sie.
          </p>
          <p className="mb-4">
            <strong>4. Verständnis wirklich prüfen.</strong> Nicht „Alles klar?" fragen – darauf
            sagen alle Ja. Besser: zeigen lassen. „Mach mir mal vor, wie du den Not-Aus drückst."
            Wer es vormachen kann, hat es verstanden.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was in den Nachweis gehört
          </h2>
          <p className="mb-3">
            Wenn Sprache eine Rolle spielt, sollte dein Unterweisungsnachweis mehr enthalten als bei
            deutschen Muttersprachlern:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Datum, Thema und Inhalt der Unterweisung</li>
            <li>Name des Mitarbeiters und der unterweisenden Person</li>
            <li>
              <strong>In welcher Sprache</strong> unterwiesen wurde – und wie (Übersetzung,
              Dolmetscher, Vorlesen)
            </li>
            <li>Unterschrift des Mitarbeiters</li>
          </ul>
          <p className="mb-4">
            Dieser eine Zusatz – die Sprache – ist im Streitfall Gold wert. Er zeigt, dass du dir
            Gedanken gemacht hast, statt nur einen Zettel herumzureichen.
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Wie uVise dir das abnimmt
            </h2>
            <p className="mb-4">
              In uVise wählt der Mitarbeiter selbst seine Sprache – aus <strong>41 Sprachen</strong>.
              Die Unterweisung wird ihm übersetzt <strong>und vorgelesen</strong>, bevor er
              unterschreibt. Anschließend liegt der Nachweis mit Zeitstempel, Gerät und
              fälschungssicherem Siegel im Archiv – digital, sofort auffindbar.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die Inhalte deiner Unterweisung bringst du selbst mit – uVise schreibt keine
              fertigen Unterweisungs-Texte, sondern sorgt dafür, dass sie ankommen und
              nachweisbar sind.
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
