import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Gefährdungsbeurteilung und Unterweisung: Was hängt wie zusammen? (2026)";
const BESCHREIBUNG =
  "Die beiden werden immer zusammen genannt, aber selten erklärt. Wer braucht eine Gefährdungsbeurteilung, warum liefert sie den Inhalt der Unterweisung – und was passiert, wenn sie fehlt?";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Gefährdungsbeurteilung",
    "Gefährdungsbeurteilung Unterweisung",
    "Gefährdungsbeurteilung Pflicht",
    "Gefährdungsbeurteilung dokumentieren",
    "GBU Arbeitsschutz",
    "Gefährdungsbeurteilung kleine Betriebe",
    "Unterweisung Inhalt festlegen",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/gefaehrdungsbeurteilung-unterweisung" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/gefaehrdungsbeurteilung-unterweisung",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Ab wie vielen Mitarbeitern brauche ich eine Gefährdungsbeurteilung?",
    a: "Ab dem ersten. § 5 ArbSchG kennt keine Untergrenze. Auch die Pflicht, das Ergebnis zu dokumentieren, gilt seit 2013 unabhängig von der Betriebsgröße – die frühere Ausnahme für Kleinbetriebe ist entfallen.",
  },
  {
    q: "Was war zuerst da: Gefährdungsbeurteilung oder Unterweisung?",
    a: "Die Gefährdungsbeurteilung. Sie ermittelt, welche Gefahren es gibt und welche Schutzmaßnahmen nötig sind. Erst daraus ergibt sich, worüber du überhaupt unterweisen musst. Umgekehrt funktioniert es nicht.",
  },
  {
    q: "Muss die Gefährdungsbeurteilung regelmäßig aktualisiert werden?",
    a: "Ja, immer wenn sich etwas Relevantes ändert: neue Maschine, neuer Stoff, neuer Arbeitsplatz, Umbau – und nach Unfällen. Ändert sich die Beurteilung, muss in der Regel auch neu unterwiesen werden.",
  },
  {
    q: "Kann ich die Gefährdungsbeurteilung selbst machen?",
    a: "Grundsätzlich ja, der Arbeitgeber ist verantwortlich. Er muss sich aber fachkundig beraten lassen, wenn ihm das Wissen fehlt – üblicherweise durch die Fachkraft für Arbeitssicherheit und den Betriebsarzt. Viele Berufsgenossenschaften bieten kostenlose Branchen-Handlungshilfen an.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/gefaehrdungsbeurteilung-unterweisung",
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

export default function GefaehrdungsbeurteilungPage() {
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
            Gefährdungsbeurteilung und Unterweisung
          </h1>
          <p className="text-foreground/70 mb-8">
            Die beiden Begriffe fallen immer im Doppelpack, und meistens nickt man einfach. Dabei ist
            der Zusammenhang eigentlich simpel – und wer ihn kennt, spart sich eine Menge sinnloser
            Arbeit. Kurz gesagt: Die eine sagt dir, worüber du bei der anderen reden musst.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Der Zusammenhang in einem Satz
          </h2>
          <div className="rounded-2xl border border-border bg-page-bg p-5 mb-4">
            <p className="mb-0">
              <strong>Gefährdungsbeurteilung</strong> = Du findest heraus, was gefährlich ist und was
              du dagegen tust. <br />
              <strong>Unterweisung</strong> = Du erzählst deinen Leuten das Ergebnis.
            </p>
          </div>
          <p className="mb-4">
            Deshalb geht es nur in dieser Reihenfolge. Ohne Gefährdungsbeurteilung unterweist du ins
            Blaue – du redest über irgendwas, statt über die Gefahren, die es bei dir tatsächlich
            gibt. Genau das meint{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 ArbSchG
            </a>
            , wenn er verlangt, die Unterweisung müsse auf den Arbeitsplatz oder Aufgabenbereich
            ausgerichtet sein.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wer braucht eine Gefährdungsbeurteilung? Jeder.
          </h2>
          <p className="mb-4">
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__5.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 5 Arbeitsschutzgesetz
            </a>{" "}
            kennt keine Untergrenze. Ein Mitarbeiter reicht. Und der beliebte Satz „wir sind zu
            klein dafür" stimmt seit 2013 auch bei der Dokumentation nicht mehr: Die Ausnahme für
            Betriebe mit bis zu zehn Beschäftigten ist gestrichen –{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__6.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 6 ArbSchG
            </a>{" "}
            gilt für alle. Der Umfang darf klein sein, das Papier darf dünn sein – aber es muss
            existieren.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wie eine Gefährdungsbeurteilung praktisch abläuft
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Arbeitsbereiche festlegen</strong> – nicht jeden Menschen einzeln, sondern
              gleichartige Tätigkeiten zusammenfassen (Lager, Produktion, Büro, Montage).
            </li>
            <li>
              <strong>Gefährdungen ermitteln</strong> – mechanisch, elektrisch, Gefahrstoffe, Lärm,
              Absturz, Ergonomie, und ja: auch psychische Belastung (steht seit 2013 ausdrücklich in
              § 5).
            </li>
            <li>
              <strong>Beurteilen</strong> – wie wahrscheinlich, wie schlimm?
            </li>
            <li>
              <strong>Maßnahmen festlegen</strong> – in dieser Rangfolge: Gefahr beseitigen, dann
              technisch schützen, dann organisatorisch, und erst zum Schluss persönliche
              Schutzausrüstung.
            </li>
            <li>
              <strong>Umsetzen und prüfen</strong> – wirkt die Maßnahme wirklich?
            </li>
            <li>
              <strong>Dokumentieren</strong> – Ergebnis, Maßnahmen, Überprüfung.
            </li>
          </ul>
          <p className="mb-4">
            Du musst das nicht erfinden: Die Berufsgenossenschaften stellen für fast jede Branche
            kostenlose Handlungshilfen und Muster bereit. Das spart die Hälfte der Arbeit.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wann beides zusammen fällig wird
          </h2>
          <p className="mb-4">
            Ändert sich die Gefährdungsbeurteilung, zieht die Unterweisung fast immer nach. Neue
            Maschine? Beurteilung anpassen <em>und</em> unterweisen. Neuer Stoff im Lager? Genauso.
            Nach einem Unfall? Erst recht – da wird geprüft, ob die Beurteilung die Gefahr überhaupt
            auf dem Schirm hatte.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Und was passiert, wenn sie fehlt?
          </h2>
          <p className="mb-4">
            Die fehlende Gefährdungsbeurteilung ist der Klassiker bei Kontrollen – und nach Unfällen
            der erste Punkt, den die Berufsgenossenschaft prüft. Fehlt sie, steht praktisch fest,
            dass die Unterweisung nicht auf den Arbeitsplatz ausgerichtet sein konnte. Damit kippen
            beide Pflichten auf einmal, und die Diskussion über Bußgeld und Regress beginnt.
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ehrlich abgegrenzt</h2>
            <p className="mb-4">
              <strong>uVise macht deine Gefährdungsbeurteilung nicht.</strong> Die gehört zu deinem
              Betrieb, deinen Maschinen, deinen Abläufen – da kann dir keine Software die Arbeit
              abnehmen, und wer das verspricht, verkauft dir etwas.
            </p>
            <p className="mb-4">
              Was uVise übernimmt, ist der Teil danach: Die Inhalte, die aus deiner Beurteilung
              folgen, als Unterweisung an die richtigen Leute verteilen, Fristen im Auge behalten,
              auf dem Handy unterschreiben lassen und den Nachweis unveränderbar archivieren. Den
              Kopf brauchst du für die Beurteilung – den Papierkram machen wir.
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
