import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { ARTIKEL } from "./artikel";

const TITEL = "Ratgeber Arbeitsschutz: Unterweisungen richtig machen | uVise";
const BESCHREIBUNG =
  "Verständliche Ratgeber zu Unterweisungen im Arbeitsschutz: Pflichten und Fristen, kostenlose Vorlage, fremdsprachige Mitarbeiter und was eine digitale Unterweisung rechtssicher macht.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  alternates: { canonical: "https://www.uvise.de/ratgeber" },
  openGraph: {
    title: TITEL,
    description: BESCHREIBUNG,
    url: "https://www.uvise.de/ratgeber",
    siteName: "uVise",
    locale: "de_DE",
    type: "website",
  },
};

export default function RatgeberIndexPage() {
  return (
    <div className="min-h-screen bg-page-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="flex items-center gap-3 mb-8 w-fit">
          <LogoMark size={40} />
          <span className="text-lg font-semibold">uVise</span>
        </Link>

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10 text-foreground/85">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/50 mb-3">
            Ratgeber Arbeitsschutz
          </p>
          <h1 className="text-3xl font-semibold text-foreground mb-4 leading-tight">
            Unterweisungen richtig machen
          </h1>
          <p className="text-foreground/70 mb-8 leading-7">
            Arbeitsschutz ist kein Hexenwerk – aber die Regeln stehen verstreut in Gesetzen, die
            niemand freiwillig liest. Hier stehen sie in normalem Deutsch, mit den Paragrafen zum
            Nachschlagen und Tipps aus der Praxis.
          </p>

          <div className="space-y-4">
            {ARTIKEL.map((a) => (
              <Link
                key={a.slug}
                href={`/ratgeber/${a.slug}`}
                className="block rounded-2xl border border-border bg-page-bg p-5 transition-colors hover:border-foreground/30"
              >
                <h2 className="text-lg font-semibold text-foreground mb-1">{a.titel}</h2>
                <p className="text-sm text-foreground/70 leading-6 mb-2">{a.text}</p>
                <span className="text-xs text-foreground/50">{a.dauer} Lesezeit</span>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-page-bg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unterweisungen ohne Zettelwirtschaft
            </h2>
            <p className="mb-4 leading-7">
              uVise verwaltet deine Unterweisungen digital: zuweisen, automatisch an Fristen
              erinnern, auf dem Handy unterschreiben lassen – und der Nachweis liegt unveränderbar
              im Archiv. Mitarbeiter können sich jede Unterweisung in 41 Sprachen vorlesen lassen.
            </p>
            <Link
              href="/login?mode=register"
              className="inline-block rounded-full px-6 py-3 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              7 Tage kostenlos testen
            </Link>
          </div>

          <p className="mt-8 text-xs text-foreground/50">
            Die Ratgeber dienen der allgemeinen Information und sind keine Rechtsberatung. Maßgeblich
            sind die jeweils geltenden Gesetze und die für deinen Betrieb zuständige
            Berufsgenossenschaft.
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
      </div>
    </div>
  );
}
