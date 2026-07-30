import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const TITEL = "Brandschutzunterweisung: Pflicht, Inhalte, Häufigkeit";
const BESCHREIBUNG =
  "Brandschutzunterweisung: gesetzliche Pflicht nach ASR A2.2 & DGUV Vorschrift 1 – Inhalte, Häufigkeit, Brandschutzhelfer und Dokumentation erklärt.";

// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "Brandschutzunterweisung",
    "Brandschutzunterweisung Pflicht",
    "Brandschutzunterweisung Inhalte",
    "Brandschutzunterweisung wie oft",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/brandschutzunterweisung" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/brandschutzunterweisung",
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
    q: "Ist eine Brandschutzunterweisung gesetzlich Pflicht?",
    a: "Ja. Sie ist Teil der allgemeinen Unterweisungspflicht nach § 12 Arbeitsschutzgesetz (ArbSchG) und § 4 DGUV Vorschrift 1 und wird durch die Technische Regel für Arbeitsstätten ASR A2.2 „Maßnahmen gegen Brände“ konkretisiert. Jeder Arbeitgeber muss seine Beschäftigten über Brandgefahren am Arbeitsplatz und das richtige Verhalten im Brandfall informieren.",
  },
  {
    q: "Wie oft muss eine Brandschutzunterweisung stattfinden?",
    a: "Mindestens einmal jährlich für alle Beschäftigten, zusätzlich bei Neueinstellung und bei Veränderungen der Brandgefährdung (z. B. neue Räume, neue Lagerung von brennbaren Stoffen). Die Ausbildung der Brandschutzhelfer selbst wird davon unabhängig üblicherweise alle drei bis fünf Jahre aufgefrischt.",
  },
  {
    q: "Was ist der Unterschied zwischen Brandschutzunterweisung und Brandschutzhelfer-Ausbildung?",
    a: "Die Brandschutzunterweisung richtet sich an alle Beschäftigten und vermittelt Grundwissen zu Fluchtwegen, Verhalten im Brandfall und Feuerlöschern. Die Brandschutzhelfer-Ausbildung ist eine vertiefte, praktische Schulung für die Beschäftigten, die im Ernstfall aktiv beim Löschen und Evakuieren unterstützen sollen.",
  },
  {
    q: "Muss die Brandschutzunterweisung dokumentiert werden?",
    a: "Ja, wie jede Unterweisung nach § 4 DGUV Vorschrift 1. Der Nachweis sollte Datum, Inhalt, unterweisende Person sowie Namen und Unterschriften der teilnehmenden Beschäftigten enthalten.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/brandschutzunterweisung",
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

export default function BrandschutzunterweisungPage() {
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
            Brandschutzunterweisung: Pflicht, Inhalte und Häufigkeit
          </h1>
          <p className="text-foreground/70 mb-8">
            Ein Brand ist für die meisten Beschäftigten eine reine Theorie – bis er es nicht mehr
            ist. Die Brandschutzunterweisung sorgt dafür, dass im Ernstfall niemand zum ersten Mal
            überlegen muss, wo der nächste Fluchtweg ist. Hier steht, was rechtlich gilt, wie oft sie
            fällig ist und was inhaltlich reingehört.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Was ist eine Brandschutzunterweisung?
          </h2>
          <p className="mb-4">
            Die Brandschutzunterweisung ist ein eigener, themenbezogener Baustein der allgemeinen
            Sicherheitsunterweisung. Sie vermittelt allen Beschäftigten – nicht nur den
            Brandschutzhelfern – das Grundwissen, das im Brandfall über Sekunden entscheidet:
            Fluchtwege kennen, Alarmierung auslösen und sich sicher in Sicherheit bringen. Was eine
            Unterweisung ganz allgemein ausmacht, steht in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/sicherheitsunterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              Sicherheitsunterweisung: Pflicht, Inhalte und Ablauf
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Rechtliche Grundlage
          </h2>
          <p className="mb-4">
            Die Grundpflicht ergibt sich aus{" "}
            <a
              href="https://www.gesetze-im-internet.de/arbschg/__12.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 12 Arbeitsschutzgesetz (ArbSchG)
            </a>{" "}
            in Verbindung mit § 4{" "}
            <a
              href="https://publikationen.dguv.de/regelwerk/dguv-vorschriften/2909/dguv-vorschrift-1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Vorschrift 1
            </a>{" "}
            – Details dazu in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/dguv-vorschrift-1-unterweisung"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Vorschrift 1: Unterweisungspflicht einfach erklärt
            </Link>
            . Speziell für den Brandschutz konkretisiert die Technische Regel für Arbeitsstätten{" "}
            <a
              href="https://www.baua.de/DE/Angebote/Regelwerk/ASR/ASR-A2-2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              ASR A2.2 „Maßnahmen gegen Brände“
            </a>{" "}
            die Anforderungen, ergänzt durch die{" "}
            <a
              href="https://publikationen.dguv.de/regelwerk/dguv-informationen/324/betrieblicher-brandschutz-in-der-praxis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              DGUV Information 205-001 „Betrieblicher Brandschutz in der Praxis“
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Wie oft muss unterwiesen werden?
          </h2>
          <p className="mb-4">
            Mindestens einmal jährlich für alle Beschäftigten, zusätzlich anlassbezogen bei
            Neueinstellung oder wenn sich die Brandgefährdung ändert – etwa durch neue Räume, neue
            Maschinen oder eine veränderte Lagerung brennbarer Stoffe. Alle Fristen für
            Unterweisungen allgemein stehen in unserem Ratgeber{" "}
            <Link
              href="/ratgeber/unterweisung-fristen"
              className="text-blue-500 underline underline-offset-4"
            >
              Wie oft muss unterwiesen werden?
            </Link>
            . Die praktische Ausbildung der Brandschutzhelfer läuft davon unabhängig: Sie wird in der
            Regel alle drei bis fünf Jahre aufgefrischt, da hier Handhabung und Übung im Vordergrund
            stehen, nicht nur Wissen.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Typische Inhalte der Brandschutzunterweisung
          </h2>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Brandgefahren am konkreten Arbeitsplatz (z. B. Lagerung, elektrische Anlagen)</li>
            <li>Verhalten im Brandfall: Ruhe bewahren, Warnen, Fluchtweg nutzen</li>
            <li>Flucht- und Rettungswege sowie Sammelplätze</li>
            <li>Umgang mit Feuerlöschern und anderen Löschmitteln</li>
            <li>Alarmierung und Meldewege im Betrieb</li>
            <li>Aufgabe und Erkennungsmerkmale der Brandschutzhelfer</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Dokumentation
          </h2>
          <p className="mb-4">
            Wie jede Unterweisung sollte auch die Brandschutzunterweisung mit Datum, Inhalt,
            unterweisender Person sowie Namen und Unterschriften aller Teilnehmer dokumentiert
            werden. Eine fertige Struktur zum Kopieren gibt es in unserer{" "}
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
              uVise erinnert automatisch an die jährliche Frist der Brandschutzunterweisung, sammelt
              die Unterschrift jedes Mitarbeiters rechtssicher mit Zeitstempel und legt den Nachweis
              unveränderbar im Archiv ab – startklar für die nächste Kontrolle durch die
              Berufsgenossenschaft.
            </p>
            <p className="mb-4 text-sm text-foreground/70">
              Wichtig: Die Inhalte deiner Brandschutzunterweisung bringst du selbst mit – uVise sorgt
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
            Maßgeblich sind ArbSchG, DGUV Vorschrift 1, ASR A2.2 sowie die für deinen Betrieb
            zuständige Berufsgenossenschaft oder Unfallkasse.
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
