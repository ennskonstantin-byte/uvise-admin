import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButtons } from "@/components/ShareButtons";

const TITEL = "DGUV Vorschrift 1: Unterweisungspflicht einfach erklärt";
const BESCHREIBUNG =
  "DGUV Vorschrift 1 verlangt eine jährliche Unterweisung – Pflicht, Fristen und Dokumentation nach § 4 einfach erklärt, inkl. Ausnahmen und typischer Fehler.";

// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "DGUV Vorschrift 1",
    "DGUV Unterweisung",
    "DGUV Vorschrift 1 Unterweisung",
    "Unterweisung Pflicht",
    "Grundsätze der Prävention",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/dguv-vorschrift-1-unterweisung" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/dguv-vorschrift-1-unterweisung",
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
    q: "Was ist die DGUV Vorschrift 1?",
    a: "Die DGUV Vorschrift 1 „Grundsätze der Prävention“ ist die zentrale Unfallverhütungsvorschrift der gesetzlichen Unfallversicherung. Sie gilt für praktisch jeden Betrieb in Deutschland und regelt u. a. die Pflichten von Unternehmern zur Organisation von Sicherheit und Gesundheitsschutz – darunter in § 4 die Pflicht zur Unterweisung der Beschäftigten.",
  },
  {
    q: "Wie oft schreibt die DGUV Vorschrift 1 eine Unterweisung vor?",
    a: "Mindestens einmal jährlich für alle Beschäftigten (§ 4 Abs. 1 DGUV Vorschrift 1). Zusätzlich muss anlassbezogen unterwiesen werden: bei der Einstellung, vor einer neuen Tätigkeit, bei neuen Arbeitsmitteln oder Gefahrstoffen, nach Veränderungen im Arbeitsablauf und nach einem Unfall.",
  },
  {
    q: "Gilt für Jugendliche eine andere Frist?",
    a: "Ja. Für Jugendliche unter 18 Jahren schreibt § 29 Jugendarbeitsschutzgesetz eine halbjährliche Unterweisung vor – doppelt so oft wie für erwachsene Beschäftigte.",
  },
  {
    q: "Muss die Unterweisung nach DGUV Vorschrift 1 dokumentiert werden?",
    a: "Ja, § 4 Abs. 1 DGUV Vorschrift 1 verlangt ausdrücklich, dass die Unterweisung dokumentiert wird. In der Praxis bedeutet das: Datum, Thema, teilnehmende Personen und deren Unterschrift sollten schriftlich oder digital festgehalten werden.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/dguv-vorschrift-1-unterweisung",
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

export default function DguvVorschrift1Page() {
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
            { label: "DGUV Vorschrift 1: Unterweisungspflicht einfach erklärt" },
          ]}
        />

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10 leading-7 text-foreground/85">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-3">
            Ratgeber Arbeitsschutz
          </p>
          <h1 className="text-3xl font-semibold text-foreground mb-4 leading-tight">
            DGUV Vorschrift 1: Unterweisungspflicht einfach erklärt
          </h1>
          <p className="text-foreground/70 mb-8">
            „DGUV Vorschrift 1" taucht in fast jeder Unterweisungs-Vorlage auf, aber kaum jemand hat
            den Text tatsächlich gelesen. Hier steht knapp und ohne Juristendeutsch, was die
            Vorschrift von deinem Betrieb verlangt – und was in der Praxis meistens schiefgeht.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was ist die DGUV Vorschrift 1?
          </h2>
          <p className="mb-4">
            Die{" "}
            <a
              href="https://publikationen.dguv.de/regelwerk/dguv-vorschriften/2909/dguv-vorschrift-1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Vorschrift 1 „Grundsätze der Prävention"
            </a>{" "}
            ist die grundlegende Unfallverhütungsvorschrift der gesetzlichen Unfallversicherung
            (Berufsgenossenschaften und Unfallkassen). Sie gilt branchenübergreifend für praktisch
            jeden Betrieb mit Beschäftigten – vom Ein-Mann-Handwerksbetrieb bis zum Konzern – und
            regelt die grundlegenden Organisationspflichten von Unternehmen im Arbeitsschutz, unter
            anderem zur Ersten Hilfe, zur Bestellung von Fachkräften und eben zur Unterweisung.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was § 4 zur Unterweisung verlangt
          </h2>
          <p className="mb-4">
            § 4 Abs. 1 DGUV Vorschrift 1 verpflichtet Unternehmer, Beschäftigte über Sicherheit und
            Gesundheitsschutz bei der Arbeit zu unterweisen – entsprechend § 12 Arbeitsschutzgesetz
            (ArbSchG). Drei Punkte daraus sind für den Alltag entscheidend:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Mindestens einmal jährlich</strong> für alle Beschäftigten, unabhängig von
              Position oder Betriebsgröße.
            </li>
            <li>
              <strong>Zusätzlich anlassbezogen</strong>: bei Neueinstellung, vor einer neuen
              Tätigkeit, bei neuen Arbeitsmitteln, Maschinen oder Gefahrstoffen, bei geänderten
              Abläufen und nach einem Unfall.
            </li>
            <li>
              <strong>In verständlicher Form und Sprache</strong>: Die Unterweisung muss so erfolgen,
              dass der jeweilige Mitarbeiter sie tatsächlich versteht – Details dazu in unserem
              Ratgeber zur{" "}
              <Link
                href="/ratgeber/unterweisung-fremdsprachige-mitarbeiter"
                className="text-blue-500 underline underline-offset-4"
              >
                Unterweisung fremdsprachiger Mitarbeiter
              </Link>
              .
            </li>
          </ul>
          <p className="mb-4">
            Alle Fristen und Anlässe im Detail – inklusive der Fälle, die im Alltag oft übersehen
            werden – stehen in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/unterweisung-fristen"
              className="text-blue-500 underline underline-offset-4"
            >
              Wie oft muss unterwiesen werden?
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Ausnahme: kürzere Fristen für Jugendliche
          </h2>
          <p className="mb-4">
            Beschäftigte unter 18 Jahren müssen nach{" "}
            <a
              href="https://www.gesetze-im-internet.de/jarbschg/__29.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 29 Jugendarbeitsschutzgesetz (JArbSchG)
            </a>{" "}
            halbjährlich unterwiesen werden – doppelt so oft wie erwachsene Beschäftigte. Wer
            Auszubildende oder Ferienjobber beschäftigt, sollte diese kürzere Frist im Blick
            behalten, da sie leicht übersehen wird.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Warum die Dokumentation entscheidend ist
          </h2>
          <p className="mb-4">
            § 4 Abs. 1 DGUV Vorschrift 1 verlangt ausdrücklich, dass die Unterweisung dokumentiert
            wird. Ohne Nachweis gilt sie im Zweifel als nicht erfolgt – auch wenn sie tatsächlich
            stattgefunden hat. Ein belastbarer Nachweis enthält mindestens:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Datum und Thema der Unterweisung</li>
            <li>Name der unterweisenden Person</li>
            <li>Namen aller teilnehmenden Beschäftigten</li>
            <li>Unterschrift jedes Teilnehmers</li>
          </ul>
          <p className="mb-4">
            Eine fertige Struktur zum Kopieren gibt es in unserer{" "}
            <Link
              href="/ratgeber/unterweisung-vorlage"
              className="text-blue-500 underline underline-offset-4"
            >
              kostenlosen Unterweisung-Vorlage
            </Link>
            . Fehlt der Nachweis bei einer Kontrolle oder nach einem Unfall, kann die Berufsgenossenschaft
            ein Bußgeld verhängen (§ 209 SGB VII) – unabhängig davon, ob tatsächlich unterwiesen wurde.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Typische Fehler in der Praxis
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Nur die Erstunterweisung, keine jährliche Wiederholung.</strong> Viele Betriebe
              unterweisen neue Mitarbeiter sauber, vergessen danach aber die jährliche Pflicht.
            </li>
            <li>
              <strong>Anlassbezogene Unterweisungen übersehen.</strong> Eine neue Maschine oder ein
              geänderter Ablauf löst sofort eine zusätzliche Unterweisungspflicht aus – unabhängig
              vom Jahresrhythmus.
            </li>
            <li>
              <strong>Unterschrift ohne Verständnis.</strong> Eine Unterschrift belegt nur, dass
              jemand unterschrieben hat, nicht dass der Inhalt verstanden wurde.
            </li>
            <li>
              <strong>Kein Nachweis, obwohl unterwiesen wurde.</strong> Ohne Dokumentation lässt sich
              die Unterweisung im Ernstfall kaum belegen.
            </li>
          </ul>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Wie uVise dabei hilft</h2>
            <p className="mb-4">
              uVise erinnert automatisch an die jährliche Frist aus § 4 DGUV Vorschrift 1 sowie an
              anlassbezogene Unterweisungen, sammelt die Unterschrift jedes Mitarbeiters rechtssicher
              mit Zeitstempel und legt den Nachweis unveränderbar im Archiv ab – startklar für die
              nächste Kontrolle durch die Berufsgenossenschaft.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die Inhalte deiner Unterweisung bringst du selbst mit – uVise sorgt dafür,
              dass Fristen eingehalten, Unterschriften eingeholt und Nachweise sicher aufbewahrt
              werden.
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
            Maßgeblich ist der Wortlaut der DGUV Vorschrift 1 sowie die für deinen Betrieb
            zuständige Berufsgenossenschaft oder Unfallkasse.
          </p>
        </div>

        <ShareButtons url="https://www.uvise.de/ratgeber/dguv-vorschrift-1-unterweisung" title={TITEL} />

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
