"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  BellRing,
  Smartphone,
  MessageCircleQuestion,
  FileDown,
  Moon,
  Sun,
  Users,
  Languages,
  Check,
  Menu,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Switch } from "@/components/Switch";
import { useAppData } from "@/lib/store";
import { PLANS } from "@/lib/types";
import { Reveal } from "@/components/marketing/Reveal";
import { VorlesenDemo } from "@/components/marketing/VorlesenDemo";
import { AppPreview } from "@/components/marketing/AppPreview";
import { SUPPORT_EMAIL } from "@/lib/legal";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Rechtssichere Signatur",
    text: "Unterweisungen werden nach eIDAS-Grundsätzen digital unterschrieben — Zeitstempel, Gerät und Unterschrift unveränderlich gespeichert.",
  },
  {
    icon: BellRing,
    title: "Automatische Erinnerungen",
    text: "Läuft eine Qualifikation oder Unterweisung bald ab, bekommen Chef und Mitarbeiter rechtzeitig eine E-Mail.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Rückfragen in Echtzeit",
    text: "Unklarheiten direkt aus der Unterweisung heraus klären — die Antwort kommt sofort auf dem Handy an.",
  },
  {
    icon: Users,
    title: "Ampel-System",
    text: "Auf einen Blick sehen, wer offene Punkte hat — sortiert nach Kategorie, Abteilung oder Standort.",
  },
  {
    icon: FileDown,
    title: "Export für Prüfungen",
    text: "Nachweise und Qualifikationen als CSV oder gebündeltes ZIP-Backup — startklar für die Berufsgenossenschaft.",
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

const FAQ = [
  {
    q: "Ist uVise DSGVO-konform und rechtssicher?",
    a: "Ja. Mitarbeiterdaten werden auf Servern in der EU gespeichert, jede Unterschrift ist nach eIDAS-Grundsätzen mit Zeitstempel und Gerätekennung versehen und lässt sich nachträglich nicht mehr verändern. Details findest du in unserer Datenschutzerklärung.",
  },
  {
    q: "Brauchen meine Mitarbeiter ein Firmen-Handy?",
    a: "Nein. Die Mitarbeiter-App läuft auf dem eigenen Smartphone jedes Mitarbeiters — ein Firmen-Laptop oder -Handy ist nicht nötig.",
  },
  {
    q: "In wie vielen Sprachen können Unterweisungen vorgelesen werden?",
    a: "Jede Unterweisung kann in 41 Sprachen vorgelesen und übersetzt werden, darunter Türkisch, Ukrainisch, Arabisch und Polnisch — so verstehen auch Mitarbeiter mit wenig Deutschkenntnissen den Inhalt, bevor sie unterschreiben.",
  },
  {
    q: "Kann ich uVise jederzeit kündigen?",
    a: "Ja, im Monatsabo ist uVise jederzeit zum Ende des laufenden Monats kündbar, ohne Mindestlaufzeit. Alternativ gibt es ein Jahresabo mit 20% Rabatt.",
  },
  {
    q: "Was passiert nach der 7-tägigen Testphase?",
    a: "Du testest 7 Tage kostenlos und ohne Kreditkarte. Erst danach entscheidest du dich für ein kostenpflichtiges Paket — ohne automatische Kündigungsfalle im Hintergrund.",
  },
  {
    q: "Ersetzt uVise die gesetzliche Pflicht zur Unterweisung?",
    a: "uVise ersetzt nicht die inhaltliche Durchführung der Unterweisung, sondern digitalisiert Planung, Fristen, Nachweise und Unterschriften dafür — verpflichtend bleibt weiterhin, dass der Arbeitgeber seine Mitarbeiter nach dem Arbeitsschutzgesetz und den DGUV-Vorschriften unterweist.",
    link: { label: "Arbeitsschutzgesetz (ArbSchG) im Volltext", href: "https://www.gesetze-im-internet.de/arbschg/" },
  },
];

const PRODUCTS = [
  {
    tag: "Für Beauftragte & Chefs",
    title: "Web-Dashboard",
    text: "Mitarbeiter anlegen, Unterweisungen verteilen, Qualifikationen im Blick behalten — genau das, was du gerade ansiehst.",
  },
  {
    tag: "Für Beauftragte & Chefs",
    title: "Chef-App fürs Handy",
    text: "Dieselbe Verwaltung wie das Dashboard, aber unterwegs — z.B. direkt in der Werkstatt oder auf der Baustelle.",
  },
  {
    tag: "Für dein Team",
    title: "Mitarbeiter-App",
    text: "Unterweisungen ansehen, vorlesen lassen, unterschreiben, Rückfragen stellen — komplett von unterwegs, ohne Papier.",
  },
];

export function MarketingHome() {
  const { session, loading } = useAppData();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [billing, setBilling] = useState<"monatlich" | "jaehrlich">("monatlich");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Hell/Dunkel — dieselbe Umschaltung wie im Chef-Dashboard (Sidebar.tsx)
  // und in den beiden Apps, damit die Wahl konsistent auf der ganzen
  // Domain gilt (gleicher localStorage-Schlüssel "uvise-theme").
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  function toggleTheme(nextDark: boolean) {
    setDark(nextDark);
    const mode = nextDark ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    localStorage.setItem("uvise-theme", mode);
  }
  // Barrierefreiheit: wer in den Systemeinstellungen Animationen reduziert
  // hat, bekommt keine schwebenden Blobs/Reveal-Bewegungen — nur ein
  // einfaches Einblenden ohne Bewegung.
  const reduceMotion = useReducedMotion();

  // Wer schon eingeloggt ist, landet direkt im Dashboard statt auf der
  // Marketing-Seite (die trotzdem kurz sichtbar sein kann, während die
  // Sitzung im Hintergrund geprüft wird).
  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  return (
    <div className="min-h-screen bg-page-bg overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-display text-lg font-semibold tracking-tight">uVise</span>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm text-foreground/70">
            <a href="#ausprobieren" className="whitespace-nowrap hover:text-foreground">Live ausprobieren</a>
            <a href="#vorlesen" className="whitespace-nowrap hover:text-foreground">Vorlesen & Übersetzen</a>
            <a href="#funktionen" className="whitespace-nowrap hover:text-foreground">Funktionen</a>
            <a href="#preise" className="whitespace-nowrap hover:text-foreground">Preise</a>
            <a href="#faq" className="whitespace-nowrap hover:text-foreground">FAQ</a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => toggleTheme(!dark)}
              className="h-9 w-9 flex items-center justify-center rounded-full border border-border text-foreground/70 hover:text-foreground"
              aria-label={dark ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/login"
              className="btn-feedback whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground border border-border"
            >
              Anmelden
            </Link>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="btn-feedback whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              Kostenlos testen
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full border border-border"
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Immer im DOM (nicht bedingt gemountet) und rein über CSS-Transitions
          ein-/ausgeklappt — robuster als framer-motion für ein fixed-position
          Element. Als Geschwister-Element außerhalb des Headers, weil dessen
          "backdrop-blur" sonst zum containing block für "position: fixed"
          wird und das Menü dadurch am Header statt am ganzen Bildschirm klebt. */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[78%] max-w-xs bg-background shadow-2xl px-6 py-5 flex flex-col rounded-r-3xl transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-lg tracking-tight">uVise</span>
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-border"
            aria-label="Menü schließen"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <a href="#ausprobieren" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-surface">
            Live ausprobieren
          </a>
          <a href="#vorlesen" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-surface">
            Vorlesen & Übersetzen
          </a>
          <a href="#funktionen" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-surface">
            Funktionen
          </a>
          <a href="#preise" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-surface">
            Preise
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-surface">
            FAQ
          </a>
        </nav>

        <div className="mt-auto flex items-center justify-between rounded-xl bg-surface px-4 py-3 mb-3">
          <span className="text-sm text-foreground/80">
            {dark ? "🌙 Dunkles Design" : "☀️ Helles Design"}
          </span>
          <Switch checked={dark} onChange={toggleTheme} label="Dunkles Design umschalten" />
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="text-center rounded-full px-4 py-2.5 text-sm font-medium border border-border"
          >
            Anmelden
          </Link>
          <Link
            href="/login?mode=register"
              rel="nofollow"
            className="text-center rounded-full px-4 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            Kostenlos testen
          </Link>
        </div>
      </div>

      <main id="top">
        {/* Hero — startet direkt mit der klickbaren Live-Vorschau statt einem Fake-Mockup */}
        <section id="ausprobieren" className="scroll-mt-16 relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-32 -left-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
              style={{ background: "var(--accent-gradient)" }}
              animate={reduceMotion ? {} : { y: [0, 24, 0], x: [0, 16, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-40 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
              style={{ background: "var(--accent-gradient)" }}
              animate={reduceMotion ? {} : { y: [0, -20, 0], x: [0, -14, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground/70 mb-6">
                🇩🇪 Gemacht für deutsche Betriebe
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] mb-5">
                Digitale Unterweisungen & Nachweise,
                <br />
                die sich von selbst erledigen.
              </h1>
              <p className="text-lg text-foreground/65 mb-8 max-w-md">
                Die digitale Unterweisungs-Software kümmert sich selbst um Fristen, Erinnerungen
                und rechtssichere Unterschriften — mehrsprachig und ohne Papierkram.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login?mode=register"
              rel="nofollow"
                  className="btn-feedback rounded-full px-6 py-3 text-sm font-medium text-white"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  7 Tage kostenlos testen
                </Link>
              </div>
              <p className="text-xs text-foreground/50 mt-4">
                Keine Kreditkarte nötig · jederzeit kündbar
              </p>
            </motion.div>

            {/* Echte, klickbare App-Vorschau statt eines Fake-Mockups */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <AppPreview />
            </motion.div>
          </div>
        </section>

        {/* Vorlesen & Übersetzen — zentrales Feature, eigener Bereich */}
        <section id="vorlesen" className="scroll-mt-16 border-t border-border/60 bg-background py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground/70 mb-5">
                <Languages size={14} /> Verstanden wird jeder
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4 leading-tight">
                Vorlesen & Übersetzen —
                <br />
                für jedes Team im Betrieb.
              </h2>
              <p className="text-foreground/65 mb-6 max-w-md">
                Nicht jeder liest gern lange Texte, nicht jeder spricht perfekt Deutsch. Mitarbeiter
                können sich jede Unterweisung in 41 Sprachen vorlesen lassen — verständlich,
                bevor unterschrieben wird.
              </p>
              <ul className="space-y-3">
                {[
                  "41 Sprachen zur Auswahl, inkl. Türkisch, Ukrainisch, Arabisch, Polnisch",
                  "Text wird laut vorgelesen — mit natürlicher Systemstimme",
                  "Erst nach vollständigem Lesen oder Vorlesen wird die Unterschrift freigeschaltet",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm">
                    <Check size={16} className="shrink-0 mt-0.5 text-accent-blue" />
                    <span className="text-foreground/75">{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <VorlesenDemo />
            </Reveal>
          </div>
        </section>

        {/* Funktionen */}
        <section id="funktionen" className="scroll-mt-16 border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <h2 className="font-display text-3xl font-semibold mb-3">Alles, was eine Unterweisung braucht</h2>
              <p className="text-foreground/65">
                Von der Erinnerung bis zur rechtssicheren Unterschrift — konzipiert für den Alltag im
                Betrieb, nicht für die IT-Abteilung.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 4) * 0.06}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-3xl border border-border p-6 bg-surface/40"
                  >
                    <div
                      className="h-11 w-11 rounded-2xl flex items-center justify-center mb-4 text-white"
                      style={{ background: "var(--accent-gradient)" }}
                    >
                      <f.icon size={20} />
                    </div>
                    <h3 className="font-medium mb-1.5">{f.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{f.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Die App / Produkte */}
        <section id="app" className="scroll-mt-16 border-t border-border/60 bg-background py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <h2 className="font-display text-3xl font-semibold mb-3">Ein System, drei Oberflächen</h2>
              <p className="text-foreground/65">
                Chefs verwalten am Rechner oder unterwegs auf dem Handy — Mitarbeiter erledigen alles in
                ihrer eigenen App.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {PRODUCTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-3xl p-7 text-white"
                    style={{ background: "linear-gradient(180deg, var(--sidebar-from), var(--sidebar-to))" }}
                  >
                    <span className="inline-block text-[11px] uppercase tracking-wide text-white/50 mb-4">
                      {p.tag}
                    </span>
                    <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{p.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Preise */}
        <section id="preise" className="scroll-mt-16 border-t border-border/60 bg-background py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="max-w-xl mb-8">
              <h2 className="font-display text-3xl font-semibold mb-3">Ein Preis pro Team-Größe</h2>
              <p className="text-foreground/65">
                7 Tage kostenlos testen, danach monatlich kündbar. Keine Einrichtungsgebühr.
              </p>
            </Reveal>
            <Reveal className="mb-8">
              <div className="inline-flex rounded-full border border-border p-1 text-sm">
                <button
                  onClick={() => setBilling("monatlich")}
                  className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                    billing === "monatlich" ? "text-white" : "text-foreground/60"
                  }`}
                  style={billing === "monatlich" ? { background: "var(--accent-gradient)" } : undefined}
                >
                  Monatlich
                </button>
                <button
                  onClick={() => setBilling("jaehrlich")}
                  className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                    billing === "jaehrlich" ? "text-white" : "text-foreground/60"
                  }`}
                  style={billing === "jaehrlich" ? { background: "var(--accent-gradient)" } : undefined}
                >
                  Jährlich <span className="opacity-80">· 20% sparen</span>
                </button>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => {
                const featured = i === 1;
                return (
                  <Reveal key={plan.name} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className={`h-full rounded-3xl p-7 border ${
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
                        {billing === "monatlich" ? (
                          <>
                            <span className="text-4xl font-bold">{plan.preis}€</span>
                            <span className={`text-sm ${featured ? "text-white/70" : "text-foreground/55"}`}>
                              {" "}
                              /Monat
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-4xl font-bold">{plan.preisJaehrlich}€</span>
                            <span className={`text-sm ${featured ? "text-white/70" : "text-foreground/55"}`}>
                              {" "}
                              /Jahr
                            </span>
                          </>
                        )}
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
              rel="nofollow"
                        className={`btn-feedback block text-center rounded-full px-5 py-2.5 text-sm font-medium ${
                          featured ? "bg-white text-foreground" : "text-white"
                        }`}
                        style={featured ? undefined : { background: "var(--accent-gradient)" }}
                      >
                        Jetzt starten
                      </Link>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Häufige Fragen */}
        <section id="faq" className="scroll-mt-16 border-t border-border/60 py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal className="mb-10">
              <h2 className="font-display text-3xl font-semibold mb-3">Häufige Fragen</h2>
              <p className="text-foreground/65">Was uVise-Kunden uns am häufigsten fragen.</p>
            </Reveal>
            <div className="space-y-3">
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 0.04}>
                    <div className="rounded-2xl border border-border overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                        aria-expanded={open}
                      >
                        <span className="font-medium">{item.q}</span>
                        <span className="text-foreground/50 text-xl leading-none">{open ? "−" : "+"}</span>
                      </button>
                      <p
                        className={`px-5 text-sm text-foreground/65 ${
                          open ? "pb-4" : "sr-only"
                        }`}
                      >
                        {item.a}
                        {"link" in item && item.link && (
                          <>
                            {" "}
                            <a
                              href={item.link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-blue hover:underline"
                            >
                              {item.link.label}
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Abschluss-CTA */}
        <section className="border-t border-border/60 py-20">
          <Reveal className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <h2 className="font-display text-3xl font-semibold mb-4">Bereit, das Ordner-Chaos zu beenden?</h2>
            <p className="text-foreground/65 mb-8">
              In wenigen Minuten eingerichtet — leg direkt los, keine Kreditkarte nötig.
            </p>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="btn-feedback inline-block rounded-full px-7 py-3.5 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              Firma kostenlos anlegen
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <span className="font-display text-sm font-semibold">uVise</span>
          </div>
          <nav aria-label="Rechtliches" className="flex gap-5 text-xs text-foreground/60">
            <Link href="/kontakt" className="hover:text-foreground">Kontakt</Link>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=uVise%20Support`} className="hover:text-foreground">Support</a>
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
