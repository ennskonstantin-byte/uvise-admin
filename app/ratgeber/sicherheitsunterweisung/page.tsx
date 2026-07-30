import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButtons } from "@/components/ShareButtons";

const TITEL = "Sicherheitsunterweisung: Pflicht, Inhalte, Ablauf";
const BESCHREIBUNG =
  "Sicherheitsunterweisung: gesetzliche Pflicht nach § 12 ArbSchG & DGUV Vorschrift 1, typische Inhalte, Fristen, Ablauf und Dokumentation einfach erklärt.";

// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Sicherheitsunterweisung",
    "Sicherheitsunterweisung Mitarbeiter",
    "Sicherheitsunterweisung Pflicht",
    "Sicherheitsunterweisung Vorlage",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/sicherheitsunterweisung" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/sicherheitsunterweisung",
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
    q: "Was ist eine Sicherheitsunterweisung?",
    a: "„Sicherheitsunterweisung“ ist der im Alltag gebräuchliche Sammelbegriff für die gesetzlich vorgeschriebene Unterweisung nach § 12 Arbeitsschutzgesetz (ArbSchG) und § 4 DGUV Vorschrift 1. Gemeint ist dasselbe: Beschäftigte werden über Gefahren an ihrem Arbeitsplatz und das sichere Verhalten informiert – unabhängig davon, ob im Betrieb von „Unterweisung“ oder „Sicherheitsunterweisung“ gesprochen wird.",
  },
  {
    q: "Ist eine Sicherheitsunterweisung Pflicht?",
    a: "Ja. Jeder Arbeitgeber muss seine Beschäftigten nach § 12 ArbSchG „ausreichend und angemessen“ unterweisen. Konkretisiert wird das durch § 4 DGUV Vorschrift 1: mindestens einmal jährlich, zusätzlich anlassbezogen bei Neueinstellung, neuer Tätigkeit oder nach einem Unfall.",
  },
  {
    q: "Was gehört inhaltlich in eine Sicherheitsunterweisung?",
    a: "Das hängt vom Arbeitsplatz ab: typisch sind Brandschutz und Fluchtwege, Erste Hilfe, der Umgang mit Maschinen und Arbeitsmitteln, Gefahrstoffe sowie das Verhalten in Notfällen. Welche Themen konkret Pflicht sind, ergibt sich aus der Gefährdungsbeurteilung des Betriebs.",
  },
  {
    q: "Muss ich eine Sicherheitsunterweisung schriftlich dokumentieren?",
    a: "Eine gesetzliche Formvorschrift gibt es nicht, § 4 DGUV Vorschrift 1 verlangt aber, dass die Unterweisung dokumentiert wird. Üblich und im Streitfall entscheidend ist ein Nachweis mit Datum, Thema, teilnehmenden Personen und deren Unterschrift.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/sicherheitsunterweisung",
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

export default function SicherheitsunterweisungPage() {
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
            { label: "Sicherheitsunterweisung: Pflicht, Inhalte und Ablauf" },
          ]}
        />

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10 leading-7 text-foreground/85">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-3">
            Ratgeber Arbeitsschutz
          </p>
          <h1 className="text-3xl font-semibold text-foreground mb-4 leading-tight">
            Sicherheitsunterweisung: Pflicht, Inhalte und Ablauf
          </h1>
          <p className="text-foreground/70 mb-8">
            „Sicherheitsunterweisung“ steht auf fast jedem Nachweisformular, im Gesetz taucht der
            Begriff aber gar nicht auf. Hier steht, was genau gemeint ist, welche gesetzliche
            Grundlage dahintersteckt, was inhaltlich reingehört und wie du den Ablauf sauber
            dokumentierst.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was ist eine Sicherheitsunterweisung?
          </h2>
          <p className="mb-4">
            „Sicherheitsunterweisung“ ist kein eigener Rechtsbegriff, sondern der im Betriebsalltag
            gebräuchliche Sammelbegriff für die gesetzlich vorgeschriebene Unterweisung im
            Arbeitsschutz. Gemeint ist damit dasselbe wie mit „Unterweisung“ oder
            „Arbeitsschutzunterweisung“: Beschäftigte werden über die Gefahren an ihrem Arbeitsplatz
            und das sichere Verhalten dabei informiert – bevor sie der Gefahr ausgesetzt sind, nicht
            danach.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Rechtliche Grundlage
          </h2>
          <p className="mb-4">
            Die Pflicht ergibt sich aus{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 Arbeitsschutzgesetz (ArbSchG)
            </a>
            : Arbeitgeber müssen ihre Beschäftigten „ausreichend und angemessen“ unterweisen.
            Konkretisiert wird das für nahezu jeden Betrieb durch § 4 DGUV Vorschrift 1 – mit
            konkreten Fristen und der Pflicht zur Dokumentation. Die Einzelheiten dazu haben wir in
            einem eigenen Ratgeber zusammengefasst:{" "}
            <Link
              href="/ratgeber/dguv-vorschrift-1-unterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Vorschrift 1: Unterweisungspflicht einfach erklärt
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wer muss unterweisen, wer wird unterwiesen?
          </h2>
          <p className="mb-4">
            Verantwortlich ist der Arbeitgeber – in der Praxis unterweist häufig eine fachkundige
            Person, z. B. der Betriebsinhaber, eine Führungskraft oder die Fachkraft für
            Arbeitssicherheit. Unterwiesen werden müssen alle Beschäftigten, die der jeweiligen
            Gefährdung ausgesetzt sind: fest angestellte Mitarbeiter genauso wie Aushilfen,
            Auszubildende, Praktikanten und – je nach Vertragsgestaltung – auch Leiharbeitnehmer und
            Fremdfirmen-Personal auf dem eigenen Betriebsgelände.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wie oft muss unterwiesen werden?
          </h2>
          <p className="mb-4">
            Mindestens einmal jährlich, zusätzlich anlassbezogen bei Neueinstellung, vor einer neuen
            Tätigkeit, bei neuen Arbeitsmitteln oder Gefahrstoffen, nach Veränderungen im
            Arbeitsablauf und nach einem Unfall. Für Jugendliche unter 18 Jahren gilt eine kürzere,
            halbjährliche Frist. Alle Fristen und Anlässe im Detail stehen in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/unterweisung-fristen"
              className="text-blue-500 underline underline-offset-4"
            >
              Wie oft muss unterwiesen werden?
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Typische Inhalte einer Sicherheitsunterweisung
          </h2>
          <p className="mb-3">
            Welche Themen konkret Pflicht sind, ergibt sich aus der Gefährdungsbeurteilung des
            Betriebs. Häufig wiederkehrende Inhalte sind:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Brandschutz und Fluchtwege</li>
            <li>Erste Hilfe und Verhalten im Notfall</li>
            <li>Umgang mit Maschinen und Arbeitsmitteln</li>
            <li>Gefahrstoffe und persönliche Schutzausrüstung</li>
            <li>Verhalten auf Baustellen bzw. im jeweiligen Arbeitsbereich</li>
            <li>Meldewege bei Beinahe-Unfällen und Mängeln</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Ablauf in der Praxis und Dokumentation
          </h2>
          <p className="mb-4">
            In der Praxis läuft eine Sicherheitsunterweisung meist in drei Schritten ab: Thema und
            Teilnehmerkreis festlegen (orientiert an der Gefährdungsbeurteilung), die Unterweisung
            durchführen – mündlich, mit Unterlagen oder digital – und den Nachweis dokumentieren. Der
            Nachweis sollte mindestens Datum, Thema, Namen der unterweisenden Person sowie aller
            teilnehmenden Beschäftigten und deren Unterschrift enthalten. Eine fertige Struktur zum
            Kopieren gibt es in unserer{" "}
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
              uVise erinnert automatisch an die jährliche Frist und an anlassbezogene
              Sicherheitsunterweisungen, sammelt die Unterschrift jedes Mitarbeiters rechtssicher mit
              Zeitstempel und legt den Nachweis unveränderbar im Archiv ab. Mitarbeiter können sich
              jede Unterweisung zusätzlich in 41 Sprachen vorlesen lassen – auch bei gemischten
              Teams bleibt so nachweisbar, dass sie verstanden wurde.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die Inhalte deiner Sicherheitsunterweisung bringst du selbst mit – uVise sorgt
              dafür, dass Fristen eingehalten, Unterschriften eingeholt und Nachweise sicher
              aufbewahrt werden.
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
            Maßgeblich sind ArbSchG, DGUV Vorschrift 1 sowie die für deinen Betrieb zuständige
            Berufsgenossenschaft oder Unfallkasse.
          </p>
        </div>

        <ShareButtons url="https://www.uvise.de/ratgeber/sicherheitsunterweisung" title={TITEL} />

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
