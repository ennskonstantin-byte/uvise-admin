import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Digitale Unterweisung: Ist das rechtssicher? (2026)";
const BESCHREIBUNG =
  "Darf man Unterweisungen digital durchführen und auf dem Handy unterschreiben lassen? Was das Gesetz zur Form sagt, warum keine teure E-Signatur nötig ist und was einen digitalen Nachweis wirklich belastbar macht.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "digitale Unterweisung",
    "Unterweisung digital rechtssicher",
    "Unterweisungsnachweis digital",
    "digitale Unterschrift Unterweisung",
    "Unterweisung ohne Papier",
    "elektronische Unterschrift Arbeitsschutz",
    "Unterweisung Handy unterschreiben",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/digitale-unterweisung-rechtssicher" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/digitale-unterweisung-rechtssicher",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Ist eine digitale Unterweisung überhaupt erlaubt?",
    a: "Ja. Weder das Arbeitsschutzgesetz noch die DGUV-Vorschriften schreiben Papier vor. Verlangt wird, dass unterwiesen und dokumentiert wird – nicht, auf welchem Material. Digital ist damit genauso zulässig wie ein Ordner im Regal.",
  },
  {
    q: "Brauche ich eine qualifizierte elektronische Signatur (QES)?",
    a: "Für Unterweisungsnachweise nicht. Eine QES ist für Dokumente gedacht, die gesetzlich die Schriftform verlangen – der Unterweisungsnachweis gehört nicht dazu. Er ist ein Beweismittel, und dafür zählt, wie nachvollziehbar er ist, nicht welche Signaturklasse er hat.",
  },
  {
    q: "Was macht einen digitalen Nachweis belastbar?",
    a: "Vier Dinge: eine eindeutige Person, ein Zeitstempel vom Server (nicht von der frei verstellbaren Geräteuhr), der Inhalt der Unterweisung im Original – und dass der Eintrag nachträglich nicht mehr verändert werden kann.",
  },
  {
    q: "Muss ich die alten Papier-Nachweise aufheben?",
    a: "Ja, bereits ausgestellte Nachweise bleiben so lange aufbewahrungspflichtig wie bisher. Du kannst aber ab sofort digital weiterarbeiten – ein Wechsel entwertet die alten Unterlagen nicht.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/digitale-unterweisung-rechtssicher",
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

export default function DigitaleUnterweisungPage() {
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
            Digitale Unterweisung: Ist das rechtssicher?
          </h1>
          <p className="text-foreground/70 mb-8">
            Die Frage kommt in jedem Betrieb, der vom Zettel weg will: „Und das hält vor Gericht?"
            Die kurze Antwort: Ja – wenn ein paar Dinge stimmen. Die lange Antwort steht hier,
            inklusive der Stelle, an der viele unnötig Geld ausgeben.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Kurz und knapp: Papier ist nirgends vorgeschrieben
          </h2>
          <p className="mb-4">
            Such im{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 Arbeitsschutzgesetz
            </a>{" "}
            nach dem Wort „schriftlich". Du wirst es nicht finden. Das Gesetz verlangt, dass du
            unterweist – nicht, worauf. Die DGUV Vorschrift 1 (§ 4) ergänzt: mindestens einmal
            jährlich, und die Unterweisung muss <strong>dokumentiert</strong> werden.
          </p>
          <p className="mb-4">
            Dokumentieren heißt nachweisen können. Ob dieser Nachweis in einem Leitz-Ordner liegt
            oder in einer Datenbank, ist dem Gesetz egal. Der Ordner hat sogar einen Nachteil: Er
            brennt, verschwindet beim Umzug und niemand merkt, wenn eine Seite fehlt.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Der teure Irrtum: „Ich brauche eine qualifizierte Signatur"
          </h2>
          <p className="mb-4">
            Viele hören „digitale Unterschrift" und denken sofort an teure Signatur-Dienste mit
            Ausweis-Prüfung. Für Unterweisungen ist das <strong>nicht nötig</strong>. Eine
            qualifizierte elektronische Signatur (QES) braucht man dort, wo das Gesetz die
            Schriftform verlangt – etwa bei einer Kündigung oder einem befristeten Arbeitsvertrag.
          </p>
          <p className="mb-4">
            Der Unterweisungsnachweis gehört nicht dazu. Er ist ein <strong>Beweismittel</strong>.
            Und im Zivilprozess gilt die freie Beweiswürdigung: Das Gericht schaut, wie glaubhaft
            deine Dokumentation ist – nicht, welches Signatur-Zertifikat drunterklebt. Wer hier
            monatlich für eine QES zahlt, kauft Sicherheit, die er rechtlich gar nicht braucht.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was einen digitalen Nachweis wirklich stark macht
          </h2>
          <p className="mb-3">
            Entscheidend ist nicht die Technik-Klasse, sondern ob dein Nachweis vier Fragen
            beantwortet:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Wer?</strong> Eindeutig zugeordnet zu einer Person – über einen persönlichen
              Login, nicht über einen Sammel-Account „Werkstatt".
            </li>
            <li>
              <strong>Wann?</strong> Zeitstempel <strong>vom Server</strong>. Die Uhr im Handy kann
              jeder verstellen – ein Zeitstempel vom Gerät ist damit wertlos.
            </li>
            <li>
              <strong>Worüber?</strong> Der Inhalt, den er wirklich gesehen hat, mitgespeichert.
              „Unterweisung Brandschutz" allein reicht nicht – der Text gehört dazu.
            </li>
            <li>
              <strong>Unverändert?</strong> Nach der Unterschrift darf niemand mehr etwas ändern.
              Auch du nicht. Genau das macht den Unterschied zum Word-Dokument, das man jederzeit
              nachträglich „korrigieren" könnte.
            </li>
          </ul>
          <p className="mb-4">
            Ein Nachweis, der diese vier Punkte erfüllt, ist belastbarer als die meisten
            Papierordner – denn beim Zettel kann niemand beweisen, ob die Unterschrift wirklich an
            dem Tag geleistet wurde, der oben draufsteht.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Die Prüfsumme: der Trick, den kaum jemand nutzt
          </h2>
          <p className="mb-4">
            Ein digitales Siegel (eine sogenannte Prüfsumme, z. B. SHA-256) ist ein Fingerabdruck
            über Dokument, Unterschrift, Zeitpunkt und Gerät. Ändert sich später auch nur ein
            einziges Zeichen, kommt ein völlig anderer Fingerabdruck heraus. Damit kann
            <strong> jeder unabhängig nachrechnen</strong>, dass am Nachweis nicht manipuliert wurde
            – ohne dir vertrauen zu müssen. Das kostet nichts und schlägt jede
            Beteuerung „bei uns ändert das keiner".
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Und der Datenschutz?
          </h2>
          <p className="mb-4">
            Unterweisungsdaten sind personenbezogene Daten – die Verarbeitung ist aber durch deine
            gesetzliche Nachweispflicht gedeckt (Art. 6 Abs. 1 lit. c DSGVO). Achte auf zwei Dinge:
            Die Daten sollten in der <strong>EU</strong> liegen, und es sollte nur gespeichert
            werden, was für den Nachweis nötig ist. Ein Wechsel auf digital macht den Datenschutz
            nicht schwieriger – oft sogar einfacher, weil Zugriffe protokolliert sind statt „Ordner
            steht im offenen Regal".
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              So löst uVise das
            </h2>
            <p className="mb-4">
              In uVise unterschreibt der Mitarbeiter direkt auf dem Handy. Gespeichert werden
              Zeitstempel <strong>vom Server</strong>, Gerät und der Inhalt der Unterweisung – und
              der Nachweis ist danach <strong>unveränderbar</strong>, inklusive
              <strong> SHA-256-Siegel</strong> zum Nachrechnen. Alles liegt in der EU (Irland). Der
              Chef zieht den Nachweis im Archiv als PDF – fertig.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die Inhalte deiner Unterweisung bringst du selbst mit – uVise schreibt keine
              fertigen Unterweisungs-Texte, sondern übernimmt Verwaltung, Fristen und den
              rechtssicheren Nachweis.
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
