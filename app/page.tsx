"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  BellRing,
  Languages,
  Smartphone,
  MessageCircleQuestion,
  FileDown,
  Moon,
  Users,
  Check,
  Menu,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useAppData } from "@/lib/store";
import { PLANS } from "@/lib/mockData";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Rechtssichere Signatur",
    text: "Unterweisungen werden nach eIDAS-Grundsätzen digital unterschrieben — Zeitstempel, Gerät und Unterschrift unveränderlich gespeichert.",
  },
  {
    icon: BellRing,
    title: "Automatische Erinnerungen",
    text: "Läuft eine Qualifikation oder Unterweisung bald ab, bekommen Chef und Mitarbeiter rechtzeitig eine E-Mail — keine Excel-Liste mehr nötig.",
  },
  {
    icon: Languages,
    title: "Mehrsprachig vorlesen",
    text: "Über 30 Sprachen zur Auswahl — Mitarbeiter können sich jede Unterweisung vorlesen lassen, bevor sie unterschreiben.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Rückfragen in Echtzeit",
    text: "Unklarheiten direkt aus der Unterweisung heraus klären — die Antwort kommt sofort auf dem Handy des Mitarbeiters an.",
  },
  {
    icon: Users,
    title: "Ampel-System",
    text: "Auf einen Blick sehen, wer offene Punkte hat — sortiert nach Kategorie, Abteilung oder Standort.",
  },
  {
    icon: FileDown,
    title: "Export für Prüfungen",
    text: "Alle Nachweise und Qualifikationen als CSV oder gebündeltes ZIP-Backup herunterladen — startklar für die Berufsgenossenschaft.",
  },
  {
    icon: Smartphone,
    title: "Eigene Mitarbeiter-App",
    text: "Kein Firmen-Laptop nötig — dein Team erledigt Unterweisungen bequem auf dem eigenen Handy.",
  },
  {
    icon: Moon,
    title: "Hell & Dunkel",
    text: "Durchdachtes Design für Büro und Werkstatt — mit vollem Dark-Mode-Support in jeder App.",
  },
];

const PRODUCTS = [
  {
    tag: "Für Beauftragte & Chefs",
    title: "Web-Dashboard",
    text: "Mitarbeiter anlegen, Unterweisungen verteilen, Qualifikationen im Blick behalten — alles vom Rechner aus, genau das, was du gerade ansiehst.",
  },
  {
    tag: "Für Beauftragte & Chefs",
    title: "Chef-App fürs Handy",
    text: "Dieselbe Verwaltung wie das Dashboard, aber unterwegs auf dem Handy — z.B. direkt in der Werkstatt oder auf der Baustelle.",
  },
  {
    tag: "Für dein Team",
    title: "Mitarbeiter-App",
    text: "Unterweisungen ansehen, vorlesen lassen, unterschreiben, Rückfragen stellen — komplett von unterwegs, ohne Papier.",
  },
];

export default function MarketingPage() {
  const { session, loading } = useAppData();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Wer schon eingeloggt ist, landet direkt im Dashboard statt auf der
  // Marketing-Seite (die trotzdem kurz sichtbar sein kann, während die
  // Sitzung im Hintergrund geprüft wird).
  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  return (
    <div className="min-h-screen bg-page-bg">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-display text-lg font-semibold tracking-tight">uVise</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm text-foreground/70">
            <a href="#funktionen" className="hover:text-foreground">Funktionen</a>
            <a href="#app" className="hover:text-foreground">Die App</a>
            <a href="#preise" className="hover:text-foreground">Preise</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="btn-feedback rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground border border-border"
            >
              Anmelden
            </Link>
            <Link
              href="/login?mode=register"
              className="btn-feedback rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              Kostenlos testen
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-full border border-border"
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background px-5 py-4 space-y-3">
            <a href="#funktionen" onClick={() => setMenuOpen(false)} className="block text-sm text-foreground/70">
              Funktionen
            </a>
            <a href="#app" onClick={() => setMenuOpen(false)} className="block text-sm text-foreground/70">
              Die App
            </a>
            <a href="#preise" onClick={() => setMenuOpen(false)} className="block text-sm text-foreground/70">
              Preise
            </a>
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1 text-center rounded-full px-4 py-2.5 text-sm font-medium border border-border"
              >
                Anmelden
              </Link>
              <Link
                href="/login?mode=register"
                className="flex-1 text-center rounded-full px-4 py-2.5 text-sm font-medium text-white"
                style={{ background: "var(--accent-gradient)" }}
              >
                Kostenlos testen
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground/70 mb-6">
              🇩🇪 Gemacht für deutsche Betriebe
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] mb-5">
              Unterweisungen & Nachweise,
              <br />
              die sich von selbst erledigen.
            </h1>
            <p className="text-lg text-foreground/65 mb-8 max-w-md">
              uVise digitalisiert Mitarbeiter-Unterweisungen, Qualifikations-Fristen und
              Unterschriften — rechtssicher, mehrsprachig und ohne Papierkram.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login?mode=register"
                className="btn-feedback rounded-full px-6 py-3 text-sm font-medium text-white"
                style={{ background: "var(--accent-gradient)" }}
              >
                7 Tage kostenlos testen
              </Link>
              <a
                href="#funktionen"
                className="btn-feedback rounded-full px-6 py-3 text-sm font-medium border border-border hover:border-foreground/30"
              >
                Funktionen ansehen
              </a>
            </div>
            <p className="text-xs text-foreground/50 mt-4">
              Keine Kreditkarte nötig · jederzeit kündbar
            </p>
          </div>

          {/* Abstraktes Dashboard-Mockup statt Screenshot */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] opacity-20 blur-3xl" style={{ background: "var(--accent-gradient)" }} />
            <div className="relative rounded-3xl border border-border/60 bg-background shadow-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="p-5 space-y-3">
                <div className="rounded-2xl p-4 text-white" style={{ background: "var(--accent-gradient)" }}>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs opacity-85">Mitarbeiter</p>
                </div>
                {[
                  { name: "Lena Bauer", meta: "Küche · 2 offen", dot: "var(--ampel-red)" },
                  { name: "Tom Krüger", meta: "Lager · alles ok", dot: "var(--ampel-green)" },
                  { name: "Aylin Sarı", meta: "Büro · alles ok", dot: "var(--ampel-green)" },
                ].map((row) => (
                  <div key={row.name} className="flex items-center gap-3 rounded-2xl border border-border/60 px-3.5 py-2.5">
                    <div className="h-8 w-8 rounded-full shrink-0" style={{ background: "var(--accent-gradient)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{row.name}</p>
                      <p className="text-xs text-foreground/55">{row.meta}</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: row.dot }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Funktionen */}
        <section id="funktionen" className="scroll-mt-16 border-t border-border/60 bg-background py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-xl mb-12">
              <h2 className="font-display text-3xl font-semibold mb-3">Alles, was eine Unterweisung braucht</h2>
              <p className="text-foreground/65">
                Von der Erinnerung bis zur rechtssicheren Unterschrift — konzipiert für den Alltag im
                Betrieb, nicht für die IT-Abteilung.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-3xl border border-border p-6 bg-surface/40">
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center mb-4 text-white"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    <f.icon size={20} />
                  </div>
                  <h3 className="font-medium mb-1.5">{f.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Die App / Produkte */}
        <section id="app" className="scroll-mt-16 border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-xl mb-12">
              <h2 className="font-display text-3xl font-semibold mb-3">Ein System, drei Oberflächen</h2>
              <p className="text-foreground/65">
                Chefs verwalten am Rechner oder unterwegs auf dem Handy — Mitarbeiter erledigen alles in
                ihrer eigenen App.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {PRODUCTS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-3xl p-7 text-white"
                  style={{ background: "linear-gradient(180deg, var(--sidebar-from), var(--sidebar-to))" }}
                >
                  <span className="inline-block text-[11px] uppercase tracking-wide text-white/50 mb-4">
                    {p.tag}
                  </span>
                  <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Preise */}
        <section id="preise" className="scroll-mt-16 border-t border-border/60 bg-background py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-xl mb-12">
              <h2 className="font-display text-3xl font-semibold mb-3">Ein Preis pro Team-Größe</h2>
              <p className="text-foreground/65">
                7 Tage kostenlos testen, danach monatlich kündbar. Keine Einrichtungsgebühr.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => {
                const featured = i === 1;
                return (
                  <div
                    key={plan.name}
                    className={`rounded-3xl p-7 border ${
                      featured
                        ? "border-transparent text-white shadow-xl md:-translate-y-2"
                        : "border-border bg-surface/40"
                    }`}
                    style={featured ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {featured && (
                      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium mb-4">
                        Am beliebtesten
                      </span>
                    )}
                    <h3 className="font-display text-xl font-semibold mb-1">{plan.name}</h3>
                    <p className={`text-sm mb-5 ${featured ? "text-white/80" : "text-foreground/60"}`}>
                      {plan.limit}
                    </p>
                    <p className="mb-6">
                      <span className="text-4xl font-bold">{plan.preis}€</span>
                      <span className={`text-sm ${featured ? "text-white/70" : "text-foreground/55"}`}>
                        {" "}
                        /Monat
                      </span>
                    </p>
                    <ul className="space-y-2.5 mb-7">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check size={16} className={`shrink-0 mt-0.5 ${featured ? "" : "text-accent-blue"}`} />
                          <span className={featured ? "text-white/90" : "text-foreground/75"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/login?mode=register"
                      className={`btn-feedback block text-center rounded-full px-5 py-2.5 text-sm font-medium ${
                        featured ? "bg-white text-foreground" : "text-white"
                      }`}
                      style={featured ? undefined : { background: "var(--accent-gradient)" }}
                    >
                      Jetzt starten
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Abschluss-CTA */}
        <section className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl font-semibold mb-4">Bereit, das Ordner-Chaos zu beenden?</h2>
            <p className="text-foreground/65 mb-8">
              In wenigen Minuten eingerichtet — leg direkt los, keine Kreditkarte nötig.
            </p>
            <Link
              href="/login?mode=register"
              className="btn-feedback inline-block rounded-full px-7 py-3.5 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              Firma kostenlos anlegen
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <span className="font-display text-sm font-semibold">uVise</span>
          </div>
          <nav aria-label="Rechtliches" className="flex gap-5 text-xs text-foreground/60">
            <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
            <Link href="/agb" className="hover:text-foreground">AGB</Link>
          </nav>
          <p className="text-xs text-foreground/45">© {new Date().getFullYear()} uVise</p>
        </div>
      </footer>
    </div>
  );
}
