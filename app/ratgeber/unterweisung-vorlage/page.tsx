import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Unterweisung Vorlage: kostenloses Muster + Anleitung (2026)";
const BESCHREIBUNG =
  "Kostenlose Vorlage für die Unterweisung deiner Mitarbeiter zum Kopieren, plus Anleitung: Pflichten nach ArbSchG, wie oft unterwiesen werden muss und was in den Unterweisungsnachweis gehört.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Unterweisung Vorlage",
    "Unterweisungsnachweis Vorlage",
    "Arbeitsschutzunterweisung Vorlage",
    "Unterweisung Muster",
    "Sicherheitsunterweisung Vorlage",
    "Unterweisung dokumentieren",
    "Unterweisung Mitarbeiter Vorlage kostenlos",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/unterweisung-vorlage" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/unterweisung-vorlage",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

// Kurze FAQ für die strukturierten Daten (JSON-LD) — kann als aufklappbare
// Fragen direkt in den Google-Ergebnissen erscheinen.
const FAQ = [
  {
    q: "Wie oft muss ich meine Mitarbeiter unterweisen?",
    a: "Mindestens einmal pro Jahr (§ 4 DGUV Vorschrift 1). Bei neuen Mitarbeitern, neuen Tätigkeiten, neuen Arbeitsmitteln oder nach einem Unfall zusätzlich sofort. Jugendliche unter 18 Jahren müssen halbjährlich unterwiesen werden (§ 29 JArbSchG).",
  },
  {
    q: "Ist eine Unterweisung gesetzlich Pflicht?",
    a: "Ja. § 12 Arbeitsschutzgesetz (ArbSchG) verpflichtet jeden Arbeitgeber, seine Beschäftigten über Sicherheit und Gesundheit bei der Arbeit zu unterweisen. Die DGUV-Vorschriften konkretisieren das.",
  },
  {
    q: "Muss ich die Unterweisung schriftlich dokumentieren?",
    a: "Es gibt keine gesetzliche Formvorschrift, aber im Streitfall oder bei einer Kontrolle musst du die Unterweisung nachweisen können. Deshalb solltest du jede Unterweisung mit Datum, Thema, Teilnehmern und Unterschrift dokumentieren.",
  },
  {
    q: "Reicht eine digitale Unterschrift für den Unterweisungsnachweis?",
    a: "Eine dokumentierte, nachvollziehbare digitale Bestätigung mit Zeitstempel ist als Nachweis üblich und praktikabel. Wichtig ist, dass eindeutig belegt ist, wer wann worüber unterwiesen wurde.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/unterweisung-vorlage",
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

export default function UnterweisungVorlagePage() {
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
            Unterweisung Vorlage: kostenloses Muster + Anleitung
          </h1>
          <p className="text-foreground/70 mb-8">
            Du brauchst eine Vorlage, um die Unterweisung deiner Mitarbeiter sauber zu
            dokumentieren? Hier findest du eine kostenlose Muster-Vorlage zum Kopieren – plus eine
            verständliche Anleitung, wie oft du unterweisen musst und was rechtlich in den
            Unterweisungsnachweis gehört.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was ist eine Unterweisung?
          </h2>
          <p className="mb-4">
            Eine Unterweisung ist die Pflicht des Arbeitgebers, seine Mitarbeiter über Gefahren am
            Arbeitsplatz und das richtige, sichere Verhalten zu informieren – zum Beispiel zu
            Brandschutz, Erste Hilfe, Maschinen, Gefahrstoffen oder der Arbeit auf Baustellen. Sie
            ist Teil des Arbeitsschutzes und muss nachweisbar durchgeführt werden.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Ist die Unterweisung gesetzlich Pflicht?
          </h2>
          <p className="mb-4">
            Ja. Die zentrale Grundlage ist{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 Arbeitsschutzgesetz (ArbSchG)
            </a>
            : Jeder Arbeitgeber muss seine Beschäftigten „ausreichend und angemessen" über Sicherheit
            und Gesundheit bei der Arbeit unterweisen. Konkretisiert wird das durch § 4 der DGUV
            Vorschrift 1. Wer das nicht tut, riskiert Bußgelder und im Schadensfall die persönliche
            Haftung.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wie oft muss unterwiesen werden?
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Mindestens einmal pro Jahr</strong> für alle Beschäftigten.
            </li>
            <li>
              <strong>Halbjährlich</strong> für Jugendliche unter 18 Jahren (§ 29
              Jugendarbeitsschutzgesetz).
            </li>
            <li>
              <strong>Zusätzlich sofort</strong> bei neuen Mitarbeitern (Erstunterweisung), neuen
              Tätigkeiten oder Maschinen, geänderten Abläufen und nach einem Unfall.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was gehört in eine Unterweisungs-Vorlage?
          </h2>
          <p className="mb-3">
            Damit dein Unterweisungsnachweis im Ernstfall gültig ist, sollte er diese Angaben
            enthalten:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Name des Betriebs und der unterweisenden Person</li>
            <li>Datum der Unterweisung</li>
            <li>Thema und Inhalt der Unterweisung</li>
            <li>Namen der teilnehmenden Mitarbeiter</li>
            <li>Unterschrift jedes Teilnehmers (als Bestätigung, dass er verstanden hat)</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Kostenlose Vorlage zum Kopieren
          </h2>
          <p className="mb-3">
            Diese Muster-Vorlage kannst du markieren, kopieren und in Word oder ein anderes Dokument
            einfügen:
          </p>
          <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-page-bg p-5 text-sm text-foreground/90 mb-4 font-mono">
{`UNTERWEISUNGSNACHWEIS

Betrieb: _______________________________________
Unterweisende Person: __________________________
Datum: _______________   Ort: _________________

Thema der Unterweisung:
[ ] Brandschutz     [ ] Erste Hilfe    [ ] Gefahrstoffe
[ ] Maschinen/Geräte [ ] Baustelle     [ ] Sonstiges: ______

Behandelte Inhalte:
_______________________________________________
_______________________________________________
_______________________________________________

Mit meiner Unterschrift bestätige ich, dass ich die
Unterweisung verstanden habe und die Hinweise befolge.

Nr. | Name (Mitarbeiter)      | Unterschrift
----+-------------------------+------------------
 1  |                         |
 2  |                         |
 3  |                         |
 4  |                         |
 5  |                         |

Unterschrift unterweisende Person: ______________`}
          </pre>
          <p className="mb-4 text-sm text-foreground/60">
            Tipp: Über die Druckfunktion deines Browsers (Strg + P bzw. ⌘ + P) kannst du die Vorlage
            auch direkt als Papierbogen ausdrucken.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Häufige Fehler bei der Unterweisung
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Keine Dokumentation – im Streitfall zählt nur, was du nachweisen kannst.</li>
            <li>Unterweisung „auf Vorrat" unterschreiben lassen, ohne sie wirklich durchzuführen.</li>
            <li>Fremdsprachige Mitarbeiter unterschreiben, ohne den Inhalt verstanden zu haben.</li>
            <li>Fristen vergessen – die jährliche Wiederholung wird schnell übersehen.</li>
          </ul>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Schneller als jede Papier-Vorlage: uVise
            </h2>
            <p className="mb-4">
              Mit einer Papier-Vorlage musst du Fristen selbst im Blick behalten, Zettel abheften und
              bei einer Prüfung suchen. <strong>uVise</strong> übernimmt das digital: Unterweisungen
              zuweisen, automatische Erinnerungen an Fristen, rechtssichere Unterschrift direkt auf
              dem Handy – und Mitarbeiter können sich jede Unterweisung in 41 Sprachen vorlesen
              lassen, bevor sie unterschreiben.
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
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            ← Zur Startseite
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
