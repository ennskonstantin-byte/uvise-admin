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
import { SignalRule } from "@/components/marketing/SignalRule";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { AmpelDots } from "@/components/marketing/AmpelDots";
import { SUPPORT_EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/legal";
import { TrackPageView } from "@/components/TrackPageView";
import { AffiliateRef } from "@/components/AffiliateRef";
import { ChatWidget } from "@/components/marketing/ChatWidget";
import { FAQ } from "@/components/marketing/faqData";

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
    // Einzige Karte mit eigenem Ampel-Symbol statt Icon-Kachel: die
    // Funktion, die dem gesamten Seiten-Leitmotiv (der Ampel-Leiste)
    // ihren Namen gibt, bekommt auch visuell die echte Ampel.
    special: "ampel" as const,
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

const PRODUCTS = [
  {
    tag: "Für Beauftragte & Chefs",
    edge: "blue" as const,
    title: "Web-Dashboard",
    text: "Mitarbeiter anlegen, Unterweisungen verteilen, Qualifikationen im Blick behalten — genau das, was du gerade ansiehst.",
  },
  {
    tag: "Für Beauftragte & Chefs",
    edge: "blue" as const,
    title: "Chef-App fürs Handy",
    text: "Dieselbe Verwaltung wie das Dashboard, aber unterwegs — z.B. direkt in der Werkstatt oder auf der Baustelle.",
  },
  {
    tag: "Für dein Team",
    edge: "green" as const,
    title: "Mitarbeiter-App",
    text: "Unterweisungen ansehen, vorlesen lassen, unterschreiben, Rückfragen stellen — komplett von unterwegs, ohne Papier.",
  },
];

// Placard-Tag: ersetzt die generische Pill-Badge-Optik durch ein
// schmales, mono-gesetztes Etikett — wie eine Kennzeichnung auf einem
// echten Werkstatt-/Baustellenschild statt eines SaaS-Chips.
function PlacardTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mk-mono inline-flex items-center gap-2 rounded-[6px] border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ borderColor: "var(--mk-line-strong)", color: "var(--mk-ink)" }}
    >
      {children}
    </span>
  );
}

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
  // hat, bekommt keine Bewegung — nur ein einfaches Einblenden.
  const reduceMotion = useReducedMotion();

  // Wer schon eingeloggt ist, landet direkt im Dashboard statt auf der
  // Marketing-Seite (die trotzdem kurz sichtbar sein kann, während die
  // Sitzung im Hintergrund geprüft wird).
  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  return (
    <div className="uv-mk min-h-screen overflow-x-hidden">
      <TrackPageView path="/" />
      <AffiliateRef />
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{ borderColor: "var(--mk-line)", background: "color-mix(in srgb, var(--mk-panel) 85%, transparent)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="mk-display text-lg font-bold tracking-tight">uVise</span>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm text-[var(--mk-ink-70)]">
            <a href="#ausprobieren" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Live ausprobieren</a>
            <a href="#vorlesen" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Vorlesen & Übersetzen</a>
            <a href="#funktionen" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Funktionen</a>
            <a href="#preise" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Preise</a>
            <a href="#faq" className="whitespace-nowrap hover:text-[var(--mk-ink)]">FAQ</a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => toggleTheme(!dark)}
              className="h-9 w-9 flex items-center justify-center rounded-[8px] border text-[var(--mk-ink-70)] hover:text-[var(--mk-ink)]"
              style={{ borderColor: "var(--mk-line)" }}
              aria-label={dark ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/login"
              className="btn-feedback whitespace-nowrap rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--mk-ink-70)] hover:text-[var(--mk-ink)] border"
              style={{ borderColor: "var(--mk-line)" }}
            >
              Anmelden
            </Link>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="btn-feedback whitespace-nowrap rounded-[10px] px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--mk-blue-strong)" }}
            >
              Kostenlos testen
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-[8px] border"
            style={{ borderColor: "var(--mk-line)" }}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <SignalRule />
      </header>

      {/* Immer im DOM (nicht bedingt gemountet) und rein über CSS-Transitions
          ein-/ausgeklappt — robuster als framer-motion für ein fixed-position
          Element. Als Geschwister-Element außerhalb des Headers, weil dessen
          "backdrop-blur" sonst zum containing block für "position: fixed"
          wird und das Menü dadurch am Header statt am ganzen Bildschirm klebt. */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
        className={`uv-mk lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`uv-mk lg:hidden fixed top-0 left-0 z-50 h-full w-[78%] max-w-xs shadow-2xl px-6 py-5 flex flex-col rounded-r-[18px] transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--mk-panel)" }}
      >
        <div className="flex items-center justify-between mb-8">
          <a href="#top" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="mk-display font-bold text-lg tracking-tight">uVise</span>
          </a>
          <button
            onClick={() => setMenuOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-[8px] border"
            style={{ borderColor: "var(--mk-line)" }}
            aria-label="Menü schließen"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <a href="#ausprobieren" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Live ausprobieren
          </a>
          <a href="#vorlesen" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Vorlesen & Übersetzen
          </a>
          <a href="#funktionen" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Funktionen
          </a>
          <a href="#preise" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Preise
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            FAQ
          </a>
        </nav>

        <div className="mt-auto flex items-center justify-between rounded-[10px] px-4 py-3 mb-3" style={{ background: "var(--mk-paper)" }}>
          <span className="text-sm text-[var(--mk-ink-70)]">
            {dark ? "🌙 Dunkles Design" : "☀️ Helles Design"}
          </span>
          <Switch checked={dark} onChange={toggleTheme} label="Dunkles Design umschalten" />
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="text-center rounded-[10px] px-4 py-2.5 text-sm font-medium border"
            style={{ borderColor: "var(--mk-line)" }}
          >
            Anmelden
          </Link>
          <Link
            href="/login?mode=register"
            rel="nofollow"
            className="text-center rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--mk-blue-strong)" }}
          >
            Kostenlos testen
          </Link>
        </div>
      </div>

      <main id="top">
        {/* Hero — startet direkt mit der klickbaren Live-Vorschau statt einem Fake-Mockup */}
        <section id="ausprobieren" className="scroll-mt-16 relative">
          {/* Warnschild-Silhouette statt Farbverlaufs-Blobs: ruhiges,
              gegenstandsbezogenes Wasserzeichen statt generischem Glow. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <svg
              className="absolute -top-16 -right-28 opacity-[0.05]"
              width="520"
              height="520"
              viewBox="0 0 100 100"
            >
              <polygon points="50,4 96,92 4,92" fill="none" stroke="var(--mk-ink)" strokeWidth="2.2" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PlacardTag>🇩🇪 Gemacht für deutsche Betriebe</PlacardTag>
              <h1 className="mk-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] mt-6 mb-5">
                Digitale Unterweisungen & Nachweise,
                <br />
                die sich von selbst erledigen.
              </h1>
              <p className="text-lg text-[var(--mk-ink-65)] mb-8 max-w-md">
                Die digitale Unterweisungs-Software für den Arbeitsschutz kümmert sich selbst um
                Fristen, Erinnerungen und rechtssichere Unterschriften — mehrsprachig und ohne
                Papierkram.
              </p>
              <div className="flex flex-wrap gap-3">
                {/* Haupt-CTA mit umlaufendem Leuchtpunkt in Warngelb —
                    Text und App-Vorschau daneben bleiben unverändert. */}
                <MovingBorderButton
                  as={Link}
                  href="/login?mode=register"
                  rel="nofollow"
                  borderRadius="10px"
                  duration={3500}
                  containerClassName="btn-feedback h-12 w-auto"
                  borderClassName="bg-[radial-gradient(var(--mk-yellow)_40%,transparent_60%)]"
                  className="px-6 text-sm font-semibold text-white border-transparent bg-[var(--mk-blue-strong)]"
                >
                  7 Tage kostenlos testen
                </MovingBorderButton>
              </div>
              <p className="text-xs text-[var(--mk-ink-50)] mt-4">
                Keine Kreditkarte nötig · jederzeit kündbar
              </p>
              <div className="mt-8 max-w-xs">
                <SignalRule animate={!reduceMotion} />
              </div>
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
        <section id="vorlesen" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center py-20">
            <Reveal>
              <PlacardTag>
                <Languages size={13} /> Verstanden wird jeder
              </PlacardTag>
              <h2 className="mk-display text-3xl sm:text-4xl font-bold mb-4 mt-5 leading-tight">
                Vorlesen & Übersetzen —
                <br />
                für jedes Team im Betrieb.
              </h2>
              <p className="text-[var(--mk-ink-65)] mb-6 max-w-md">
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
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: "var(--mk-green)" }} />
                    <span className="text-[var(--mk-ink-70)]">{t}</span>
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
        <section id="funktionen" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Alles, was eine Unterweisung braucht</h2>
              <p className="text-[var(--mk-ink-65)]">
                Sicherheitsunterweisungen, Qualifikationen und Nachweise an einem Ort — von der
                Erinnerung bis zur rechtssicheren Unterschrift. Konzipiert für Handwerk und kleine
                Betriebe, nicht für die IT-Abteilung.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 4) * 0.06}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-[14px] border p-6"
                    style={{ borderColor: "var(--mk-line)", background: "var(--mk-panel)" }}
                  >
                    {"special" in f && f.special === "ampel" ? (
                      <div className="mb-4">
                        <AmpelDots size={20} />
                      </div>
                    ) : (
                      <div
                        className="h-11 w-11 rounded-[8px] flex items-center justify-center mb-4 border"
                        style={{ borderColor: "var(--mk-line-strong)", color: "var(--mk-ink)" }}
                      >
                        {"icon" in f && <f.icon size={20} />}
                      </div>
                    )}
                    <h3 className="font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-[var(--mk-ink-60)] leading-relaxed">{f.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Die App / Produkte */}
        <section id="app" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Ein System, drei Oberflächen</h2>
              <p className="text-[var(--mk-ink-65)]">
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
                    className="h-full rounded-[14px] p-7 text-white border-t-4"
                    style={{
                      background: "#14171a",
                      borderTopColor: p.edge === "blue" ? "var(--mk-blue)" : "var(--mk-green)",
                    }}
                  >
                    <span className="mk-mono inline-block text-[11px] uppercase tracking-wide text-white/50 mb-4">
                      {p.tag}
                    </span>
                    <h3 className="mk-display text-xl font-bold mb-2">{p.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{p.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Preise */}
        <section id="preise" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
            <Reveal className="max-w-xl mb-8">
              <h2 className="mk-display text-3xl font-bold mb-3">Ein Preis pro Team-Größe</h2>
              <p className="text-[var(--mk-ink-65)]">
                7 Tage kostenlos testen, danach monatlich kündbar. Keine Einrichtungsgebühr.
              </p>
            </Reveal>
            <Reveal className="mb-8">
              <div className="inline-flex rounded-[10px] border p-1 text-sm" style={{ borderColor: "var(--mk-line)" }}>
                <button
                  onClick={() => setBilling("monatlich")}
                  className={`rounded-[8px] px-4 py-1.5 font-medium transition-colors ${
                    billing === "monatlich" ? "text-white" : "text-[var(--mk-ink-60)]"
                  }`}
                  style={billing === "monatlich" ? { background: "var(--mk-blue-strong)" } : undefined}
                >
                  Monatlich
                </button>
                <button
                  onClick={() => setBilling("jaehrlich")}
                  className={`rounded-[8px] px-4 py-1.5 font-medium transition-colors ${
                    billing === "jaehrlich" ? "text-white" : "text-[var(--mk-ink-60)]"
                  }`}
                  style={billing === "jaehrlich" ? { background: "var(--mk-blue-strong)" } : undefined}
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
                      className={`relative h-full rounded-[14px] p-7 border ${
                        featured ? "border-transparent text-white shadow-xl md:-translate-y-2" : ""
                      }`}
                      style={featured ? { background: "var(--mk-blue-strong)" } : { borderColor: "var(--mk-line)", background: "var(--mk-panel)" }}
                    >
                      {featured && (
                        <span
                          className="mk-mono absolute -top-3 left-7 inline-block rounded-[4px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                          style={{ background: "var(--mk-yellow)", color: "#14171a" }}
                        >
                          Am beliebtesten
                        </span>
                      )}
                      <h3 className="mk-display text-xl font-bold mb-1">{plan.name}</h3>
                      <p className={`text-sm mb-5 ${featured ? "text-white/80" : "text-[var(--mk-ink-60)]"}`}>
                        {plan.limit}
                      </p>
                      <p className="mb-6">
                        {billing === "monatlich" ? (
                          <>
                            <span className="text-4xl font-bold">{plan.preis}€</span>
                            <span className={`text-sm ${featured ? "text-white/70" : "text-[var(--mk-ink-55)]"}`}>
                              {" "}
                              /Monat
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-4xl font-bold">{plan.preisJaehrlich}€</span>
                            <span className={`text-sm ${featured ? "text-white/70" : "text-[var(--mk-ink-55)]"}`}>
                              {" "}
                              /Jahr
                            </span>
                          </>
                        )}
                      </p>
                      <ul className="space-y-2.5 mb-7">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check size={16} className="shrink-0 mt-0.5" style={{ color: featured ? "#ffffff" : "var(--mk-green)" }} />
                            <span className={featured ? "text-white/90" : "text-[var(--mk-ink-70)]"}>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/login?mode=register"
                        rel="nofollow"
                        className={`btn-feedback block text-center rounded-[10px] px-5 py-2.5 text-sm font-semibold ${
                          featured ? "bg-white" : "text-white"
                        }`}
                        style={featured ? { color: "var(--mk-blue-strong)" } : { background: "var(--mk-blue-strong)" }}
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
        <section id="faq" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20">
            <Reveal className="mb-10">
              <h2 className="mk-display text-3xl font-bold mb-3">Häufige Fragen</h2>
              <p className="text-[var(--mk-ink-65)]">Was uVise-Kunden uns am häufigsten fragen.</p>
            </Reveal>
            <div className="space-y-3">
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 0.04}>
                    <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: "var(--mk-line)" }}>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                        aria-expanded={open}
                      >
                        <span className="font-medium">{item.q}</span>
                        <span className="text-[var(--mk-ink-50)] text-xl leading-none">{open ? "−" : "+"}</span>
                      </button>
                      <p
                        className={`px-5 text-sm text-[var(--mk-ink-65)] ${
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
                              className="hover:underline"
                              style={{ color: "var(--mk-blue)" }}
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
        <section>
          <SignalRule />
          <Reveal className="mx-auto max-w-3xl px-5 sm:px-8 py-20 text-center">
            <h2 className="mk-display text-3xl font-bold mb-4">Bereit, das Ordner-Chaos zu beenden?</h2>
            <p className="text-[var(--mk-ink-65)] mb-8">
              In wenigen Minuten eingerichtet — leg direkt los, keine Kreditkarte nötig.
            </p>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="btn-feedback inline-block rounded-[10px] px-7 py-3.5 text-sm font-semibold text-white"
              style={{ background: "var(--mk-blue-strong)" }}
            >
              Firma kostenlos anlegen
            </Link>
          </Reveal>
        </section>
      </main>

      <footer>
        <SignalRule />
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="#top" className="flex items-center gap-2.5">
              <LogoMark size={26} />
              <span className="mk-display text-sm font-bold">uVise</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="uVise auf Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border text-[var(--mk-ink-70)] transition hover:text-[var(--mk-ink)]"
                style={{ borderColor: "var(--mk-line)" }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.92 8.44-9.94Z" />
                </svg>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="uVise auf Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border text-[var(--mk-ink-70)] transition hover:text-[var(--mk-ink)]"
                style={{ borderColor: "var(--mk-line)" }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.25.64.42 1.36.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.79-.47 2.43-.26.66-.6 1.22-1.16 1.77-.55.56-1.11.9-1.77 1.16-.64.25-1.36.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.25-.64-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.79.47-2.43.26-.66.6-1.22 1.16-1.77.55-.56 1.11-.9 1.77-1.16.64-.25 1.36-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.51.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.35-.31.88-.35 1.86-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.98.21 1.51.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.31 1.86.35 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.51-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.31-.88.35-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.21-1.51-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.14-.88-.31-1.86-.35C14.99 3.81 14.67 3.8 12 3.8Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68Zm5.34-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
                </svg>
              </a>
            </div>
          </div>
          <nav aria-label="Rechtliches" className="flex gap-5 text-xs text-[var(--mk-ink-60)]">
            <Link href="/ratgeber/unterweisung-vorlage" className="hover:text-[var(--mk-ink)]">Unterweisung-Vorlage</Link>
            <Link href="/kontakt" className="hover:text-[var(--mk-ink)]">Kontakt</Link>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=uVise%20Support`} className="hover:text-[var(--mk-ink)]">Support</a>
            <Link href="/impressum" className="hover:text-[var(--mk-ink)]">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-[var(--mk-ink)]">Datenschutz</Link>
            <Link href="/agb" className="hover:text-[var(--mk-ink)]">AGB</Link>
          </nav>
          <p className="text-xs text-[var(--mk-ink-45)]">© {new Date().getFullYear()} uVise</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
