import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Erstunterweisung neuer Mitarbeiter: Ablauf + Checkliste (2026)";
const BESCHREIBUNG =
  "Wann muss der Neue unterwiesen werden, was gehört rein und was passiert, wenn am ersten Tag etwas schiefgeht? Ablauf, Checkliste zum Abhaken und die häufigsten Fehler bei der Erstunterweisung.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Erstunterweisung",
    "Erstunterweisung neue Mitarbeiter",
    "Unterweisung neuer Mitarbeiter",
    "Erstunterweisung Checkliste",
    "Unterweisung Einstellung",
    "Sicherheitsunterweisung neuer Mitarbeiter",
    "Erstunterweisung Inhalt",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/erstunterweisung-neue-mitarbeiter" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/erstunterweisung-neue-mitarbeiter",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Wann muss die Erstunterweisung stattfinden?",
    a: "Vor Aufnahme der Tätigkeit. § 12 Abs. 1 ArbSchG nennt ausdrücklich die Einstellung als Anlass. Der Mitarbeiter darf also nicht erst arbeiten und in der zweiten Woche unterwiesen werden.",
  },
  {
    q: "Darf der Vorarbeiter die Erstunterweisung machen?",
    a: "Ja. Der Arbeitgeber ist verantwortlich, kann die Durchführung aber an geeignete Personen übertragen – etwa Vorarbeiter, Meister oder Sicherheitsbeauftragte. Verantwortlich bleibt der Arbeitgeber.",
  },
  {
    q: "Wie lange dauert eine Erstunterweisung?",
    a: "Es gibt keine vorgeschriebene Dauer. Entscheidend ist, dass alle relevanten Gefährdungen des Arbeitsplatzes behandelt und verstanden wurden. Bei einem Büroarbeitsplatz ist das schneller erledigt als in der Produktion.",
  },
  {
    q: "Muss die Erstunterweisung dokumentiert werden?",
    a: "Ja. Die Unterweisung muss dokumentiert werden (§ 4 DGUV Vorschrift 1). Der Nachweis sollte Datum, Thema, Inhalt, unterweisende Person und die Unterschrift des Mitarbeiters enthalten.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/erstunterweisung-neue-mitarbeiter",
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

export default function ErstunterweisungPage() {
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
            Erstunterweisung neuer Mitarbeiter
          </h1>
          <p className="text-foreground/70 mb-8">
            Der Neue steht um sieben auf dem Hof. Es fehlt Personal, die Schicht läuft, also:
            Sicherheitsschuhe an und los – „den Papierkram machen wir nächste Woche". Genau dieser
            Satz kostet Betriebe jedes Jahr richtig Geld. Hier steht, wie du es in 20 Minuten sauber
            hinbekommst.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wann: vorher. Nicht später.
          </h2>
          <p className="mb-4">
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 Abs. 1 Arbeitsschutzgesetz
            </a>{" "}
            nennt die <strong>Einstellung</strong> ausdrücklich als Anlass. Das heißt: Die
            Unterweisung gehört <strong>vor</strong> die erste Tätigkeit – nicht ans Ende der ersten
            Woche, wenn gerade mal Zeit ist.
          </p>
          <p className="mb-4">
            Der Grund ist banal: Neue verunglücken deutlich häufiger als eingearbeitete Kollegen. Sie
            kennen die Abläufe nicht, wollen sich beweisen und fragen seltener nach. Die erste Woche
            ist die gefährlichste – ausgerechnet die, in der viele Betriebe die Unterweisung
            schieben.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Checkliste: Was in die Erstunterweisung gehört
          </h2>
          <p className="mb-3">
            Ausgangspunkt ist immer die Gefährdungsbeurteilung des Arbeitsplatzes. Diese Punkte
            gehören fast überall dazu:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Der konkrete Arbeitsplatz</strong> – welche Gefährdungen gibt es hier, an
              dieser Maschine, in dieser Halle?
            </li>
            <li>
              <strong>Verhalten im Notfall</strong> – Fluchtwege, Sammelplatz, Notruf, wo hängt der
              Feuerlöscher.
            </li>
            <li>
              <strong>Erste Hilfe</strong> – wer ist Ersthelfer, wo ist der Verbandkasten, wo das
              Verbandbuch.
            </li>
            <li>
              <strong>Persönliche Schutzausrüstung</strong> – was ist Pflicht, wo gibt es sie, wie
              wird sie getragen und geprüft.
            </li>
            <li>
              <strong>Maschinen und Arbeitsmittel</strong> – Bedienung, Not-Aus, was verboten ist.
            </li>
            <li>
              <strong>Gefahrstoffe</strong> – falls vorhanden: Kennzeichnung, Sicherheitsdatenblatt,
              Schutzmaßnahmen.
            </li>
            <li>
              <strong>Meldewege</strong> – wem meldet er Mängel, Unfälle, Beinaheunfälle.
            </li>
            <li>
              <strong>Verkehrswege</strong> – Stapler, Lieferverkehr, wo man nicht laufen darf.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Die drei häufigsten Fehler
          </h2>
          <p className="mb-3">
            <strong>1. Alles auf einmal.</strong> Zwei Stunden Vortrag am ersten Tag, dazu
            Arbeitsvertrag, Spind, neue Gesichter. Davon bleibt nichts hängen. Besser: das
            Lebenswichtige vor Arbeitsbeginn, den Rest in den ersten Tagen – dokumentiert versteht
            sich.
          </p>
          <p className="mb-3">
            <strong>2. Der Zettel ohne Gespräch.</strong> „Lies das und unterschreib." Damit hast du
            eine Unterschrift, aber keine Unterweisung. Unterweisen heißt reden, zeigen, nachfragen.
          </p>
          <p className="mb-4">
            <strong>3. Die Sprachfalle.</strong> Wenn der Neue kaum Deutsch spricht, ist eine
            deutsche Unterweisung wertlos – und im Ernstfall ein Eigentor. Mehr dazu im Ratgeber{" "}
            <Link
              href="/ratgeber/unterweisung-fremdsprachige-mitarbeiter"
              className="text-blue-500 underline underline-offset-4"
            >
              Unterweisung für fremdsprachige Mitarbeiter
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Und danach? Nicht vergessen
          </h2>
          <p className="mb-4">
            Nach der Erstunterweisung läuft für diesen Mitarbeiter die Uhr: Die nächste
            Wiederholung ist spätestens in einem Jahr fällig – bei unter 18-Jährigen schon in sechs
            Monaten. Genau das geht im Alltag unter, weil es niemandem auffällt. Alle Fristen stehen
            im Ratgeber{" "}
            <Link
              href="/ratgeber/unterweisung-fristen"
              className="text-blue-500 underline underline-offset-4"
            >
              Wie oft muss unterwiesen werden?
            </Link>
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Neuer Mitarbeiter, ein Klick
            </h2>
            <p className="mb-4">
              In uVise legst du den Neuen an, weist ihm sein Unterweisungs-Paket zu – und er
              bekommt es aufs Handy. Er liest (oder hört es sich in seiner Sprache vorlesen),
              bestätigt und unterschreibt. Der Nachweis liegt sofort unveränderbar im Archiv, und die
              Jahresfrist läuft ab da automatisch mit.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die Inhalte deiner Unterweisung bringst du selbst mit – uVise schreibt keine
              fertigen Unterweisungs-Texte, sondern übernimmt Verwaltung, Fristen und Nachweis.
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
