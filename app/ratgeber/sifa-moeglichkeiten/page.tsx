import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButtons } from "@/components/ShareButtons";

const TITEL = "SiFa im Betrieb: Welche Möglichkeiten hast du? (2026)";
const BESCHREIBUNG =
  "Interne Fachkraft, externer Dienst oder Unternehmermodell: die drei Wege zur Fachkraft für Arbeitssicherheit im Vergleich – mit Rechtsgrundlage, Kosten-Anhaltspunkten und wann welches Modell passt.";

// ISR statt vollstatisch — siehe app/page.tsx für die ausführliche Begründung
// (Vercels 1-Jahr-Edge-Cache für vollstatische Seiten sonst zu träge nach Deploys).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  keywords: [
    "SiFa Betrieb",
    "Fachkraft für Arbeitssicherheit",
    "SiFa extern oder intern",
    "Unternehmermodell DGUV Vorschrift 2",
    "SiFa Pflicht kleine Betriebe",
    "überbetriebliche SiFa",
    "SiFa Kosten",
    "ASiG Fachkraft für Arbeitssicherheit",
  ],
  alternates: { canonical: "https://www.uvise.de/ratgeber/sifa-moeglichkeiten" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber/sifa-moeglichkeiten",
    siteName: "uVise",
    locale: "de_DE",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Muss wirklich jeder Betrieb eine SiFa haben?",
    a: "Ja, dem Grunde nach jeder Betrieb mit mindestens einem Beschäftigten – § 5 ASiG kennt keine Untergrenze. Wie viel SiFa-Zeit nötig ist und in welcher Form (intern, extern, Unternehmermodell), hängt von Betriebsgröße und Gefährdung ab und steht in der DGUV Vorschrift 2 deiner Berufsgenossenschaft.",
  },
  {
    q: "Was ist günstiger: interne oder externe SiFa?",
    a: "Für die meisten kleinen und mittleren Betriebe ist eine externe/überbetriebliche SiFa günstiger, weil du nur die tatsächlich benötigten Einsatzstunden bezahlst statt eines vollen Gehalts plus Ausbildungskosten. Ab einer gewissen Betriebsgröße oder bei hoher Gefährdung rechnet sich eine interne Fachkraft eher.",
  },
  {
    q: "Wer darf das Unternehmermodell nutzen?",
    a: "Kleine Betriebe bis zu einer Beschäftigtenzahl, die deine Berufsgenossenschaft in ihrer DGUV-Vorschrift-2-Fassung festlegt (häufig bis 50, teils weniger, teils mehr – es gibt keinen bundesweit einheitlichen Wert). Der Unternehmer muss dafür eine anerkannte Schulung absolvieren und lässt sich zusätzlich anlassbezogen extern beraten.",
  },
  {
    q: "Was passiert, wenn ich keine SiFa bestelle?",
    a: "Das ist eine Ordnungswidrigkeit nach § 209 SGB VII und kann mit Bußgeld geahndet werden. Bei einem Arbeitsunfall wiegt das zusätzlich schwer, wenn sich zeigt, dass die vorgeschriebene sicherheitstechnische Betreuung gefehlt hat – dann drohen auch Regressforderungen der Berufsgenossenschaft.",
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
      mainEntityOfPage: "https://www.uvise.de/ratgeber/sifa-moeglichkeiten",
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

export default function SifaMoeglichkeitenPage() {
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
            { label: "SiFa im Betrieb" },
          ]}
        />

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10 leading-7 text-foreground/85">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-3">
            Ratgeber Arbeitsschutz
          </p>
          <h1 className="text-3xl font-semibold text-foreground mb-4 leading-tight">
            SiFa im Betrieb: Welche Möglichkeiten hast du?
          </h1>
          <p className="text-foreground/70 mb-8">
            Jeder Betrieb braucht eine Fachkraft für Arbeitssicherheit (SiFa) – aber „braucht" heißt
            nicht „muss selbst einstellen". Es gibt drei anerkannte Wege, die Pflicht zu erfüllen, und
            welcher passt, hängt vor allem von deiner Betriebsgröße ab. Hier der Überblick, bevor du
            irgendwo unterschreibst.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Die Rechtsgrundlage in Kürze
          </h2>
          <p className="mb-4">
            Die Pflicht steht im{" "}
            <a
              href="https://www.gesetze-im-internet.de/asig/__5.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 5 Arbeitssicherheitsgesetz (ASiG)
            </a>
            : Jeder Arbeitgeber muss Fachkräfte für Arbeitssicherheit bestellen. Wie viel Betreuungs­zeit
            nötig ist und in welcher Organisationsform, konkretisiert die branchenspezifische{" "}
            <strong>DGUV Vorschrift 2</strong> deiner Berufsgenossenschaft – die Grundpflicht selbst gilt
            aber unabhängig von der Betriebsgröße, wie bei der Gefährdungsbeurteilung auch.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Die drei Modelle im Überblick
          </h2>
          <div className="rounded-2xl border border-border bg-page-bg p-5 mb-4">
            <p className="mb-0">
              <strong>1. Interne Fachkraft</strong> – eigener Mitarbeiter mit SiFa-Ausbildung. <br />
              <strong>2. Externe / überbetriebliche SiFa</strong> – Dienstleister auf Honorarbasis,
              kommt nach Bedarf ins Haus. <br />
              <strong>3. Unternehmermodell</strong> – der Chef macht es nach kurzer Schulung
              größtenteils selbst, nur für kleine Betriebe.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            1. Interne Fachkraft für Arbeitssicherheit
          </h2>
          <p className="mb-4">
            Ein eigener Mitarbeiter durchläuft die SiFa-Ausbildung (mehrere Wochen, meist berufsbegleitend
            über 1–2 Jahre verteilt) und übernimmt die sicherheitstechnische Betreuung neben oder anstelle
            seiner bisherigen Aufgaben. Lohnt sich vor allem für größere Betriebe oder Betriebe mit hoher
            Gefährdung, wo ohnehin viele Betreuungsstunden pro Jahr anfallen und jemand ständig vor Ort
            sein soll.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Vorteil:</strong> kennt den Betrieb von innen, ist jederzeit ansprechbar.
            </li>
            <li>
              <strong>Nachteil:</strong> Ausbildungskosten und -zeit, plus laufende Fortbildungspflicht.
              Fällt die Person aus (Urlaub, Krankheit, Kündigung), fehlt die Betreuung ganz.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            2. Externe / überbetriebliche SiFa
          </h2>
          <p className="mb-4">
            Ein freiberuflicher Sicherheitsingenieur oder ein überbetrieblicher Dienst (z. B. TÜV, DEKRA,
            oder ein regionaler Dienst) übernimmt die Betreuung auf Honorarbasis – meist mit einem festen
            Stundenkontingent pro Jahr, das sich an Betriebsgröße und Gefährdung orientiert. Für die
            meisten kleinen und mittleren Handwerks- und Dienstleistungsbetriebe der praktikabelste Weg,
            weil kein eigenes Fachwissen aufgebaut werden muss.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Vorteil:</strong> kein Ausbildungsaufwand, planbare Kosten, bringt Erfahrung aus
              vielen anderen Betrieben mit.
            </li>
            <li>
              <strong>Nachteil:</strong> weniger präsent im Alltag, Termine müssen koordiniert werden.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            3. Unternehmermodell (nur kleine Betriebe)
          </h2>
          <p className="mb-4">
            Für kleinere Betriebe erlauben viele Berufsgenossenschaften die{" "}
            <strong>alternative bedarfsorientierte Betreuung</strong>, umgangssprachlich
            „Unternehmermodell": Der Chef absolviert eine anerkannte Schulung (Basis- plus
            Aufbauseminar) und übernimmt die Grundbetreuung weitgehend selbst. Zusätzlich muss er sich
            bei konkretem Anlass – neue Maschine, Unfall, Umbau – extern sicherheitstechnisch beraten
            lassen. Die genaue Beschäftigtengrenze legt jede Berufsgenossenschaft in ihrer eigenen
            DGUV-Vorschrift-2-Fassung fest, deshalb lohnt ein Blick in die eigene BG-Satzung, bevor man
            fest damit plant.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong>Vorteil:</strong> günstigste Variante, keine laufenden Honorare.
            </li>
            <li>
              <strong>Nachteil:</strong> Schulungsaufwand für den Chef selbst, nur bis zu einer bestimmten
              Betriebsgröße zulässig, bei komplexer Gefährdung oft nicht ausreichend.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
            Und wenn die SiFa fehlt?
          </h2>
          <p className="mb-4">
            Das Fehlen der vorgeschriebenen sicherheitstechnischen Betreuung ist eine Ordnungswidrigkeit
            nach{" "}
            <a
              href="https://www.gesetze-im-internet.de/sgb_7/__209.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4"
            >
              § 209 SGB VII
            </a>{" "}
            und kann mit Bußgeld belegt werden. Nach einem Arbeitsunfall prüft die Berufsgenossenschaft
            das gezielt – fehlt die SiFa-Bestellung, kann das zusätzlich zu Regressforderungen führen,
            weil die vorgeschriebene fachliche Beratung schlicht nicht stattgefunden hat.
          </p>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Ehrlich abgegrenzt</h2>
            <p className="mb-4">
              <strong>uVise wählt oder ersetzt deine SiFa nicht.</strong> Ob interne Fachkraft, externer
              Dienst oder Unternehmermodell – diese Entscheidung triffst du zusammen mit deiner
              Berufsgenossenschaft, uVise kann dir keine Sicherheitsfachkraft vermitteln.
            </p>
            <p className="mb-4">
              Was uVise übernimmt, ist der Teil danach: Unterweisungen digital an die richtigen Leute
              verteilen, Fristen automatisch im Blick behalten, auf dem Handy rechtssicher unterschreiben
              lassen und jeden Nachweis unveränderbar archivieren – egal, wer bei euch die
              sicherheitstechnische Betreuung übernimmt.
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

        <ShareButtons url="https://www.uvise.de/ratgeber/sifa-moeglichkeiten" title={TITEL} />

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
