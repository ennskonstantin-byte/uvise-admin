"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Hammer,
  HardHat,
  Smartphone,
  BellRing,
  ShieldCheck,
  FileDown,
  Languages,
  Check,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Switch } from "@/components/Switch";
import { Reveal } from "@/components/marketing/Reveal";
import { AmpelDots } from "@/components/marketing/AmpelDots";
import { AppPreview } from "@/components/marketing/AppPreview";
import { SignalRule } from "@/components/marketing/SignalRule";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { SUPPORT_EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/legal";
import { TrackPageView } from "@/components/TrackPageView";
import { AffiliateRef } from "@/components/AffiliateRef";
import { ChatWidget } from "@/components/marketing/ChatWidget";

type FaqItem = { q: string; a: string };

const GRUENDE = [
  {
    icon: HardHat,
    title: "Der Alltag lässt keine Zeit",
    text: "Baustelle, Werkstatt, Kundentermin — für Unterweisungen bleibt oft nur der Feierabend, und dann fehlt die Vorlage.",
  },
  {
    icon: Smartphone,
    title: "Wechselnde Teams",
    text: "Neue Mitarbeiter, Aushilfen, Subunternehmer: Wer wurde wann und worüber unterwiesen, verliert man schnell aus dem Blick.",
  },
  {
    icon: FileDown,
    title: "Zettelwirtschaft",
    text: "Unterschriebene Zettel liegen im Auto, im Ordner oder gar nicht mehr vor, wenn die Berufsgenossenschaft danach fragt.",
  },
];

const LOESUNG = [
  "Unterweisung auf dem eigenen Handy jedes Mitarbeiters — kein Firmen-Tablet nötig",
  "Automatische Erinnerungen, bevor eine Frist abläuft",
  "Rechtssichere Unterschrift mit Zeitstempel und Gerätekennung",
  "Ampel-System zeigt auf einen Blick, wer noch offene Punkte hat",
  "Export als CSV oder ZIP — startklar für die Berufsgenossenschaft",
];

const GEWERKE = [
  "Bau & Rohbau",
  "Elektro",
  "Sanitär, Heizung, Klima (SHK)",
  "KFZ & Kfz-Werkstatt",
  "Maler & Lackierer",
  "Tischler & Schreiner",
  "Garten- und Landschaftsbau",
  "Dach & Zimmerei",
];

const VORTEILE = [
  {
    icon: Hammer,
    title: "Günstig",
    text: "Pakete ab 19 € im Monat — kalkulierbar für kleine Handwerksbetriebe, ohne Einrichtungsgebühr.",
  },
  {
    icon: BellRing,
    title: "In Minuten eingerichtet",
    text: "Firma anlegen, Mitarbeiter einladen, erste Unterweisung verteilen — ohne Schulung oder IT-Abteilung.",
  },
  {
    icon: Smartphone,
    title: "Kein Firmen-Gerät nötig",
    text: "Die Mitarbeiter-App läuft auf dem privaten Smartphone — kein zusätzliches Diensthandy erforderlich.",
  },
  {
    icon: Languages,
    title: "Mehrsprachig für gemischte Teams",
    text: "Viele Handwerksteams sind international besetzt — uVise übersetzt und liest jede Unterweisung in 41 Sprachen vor.",
  },
];

// Placard-Tag im selben Stil wie auf der Startseite und auf /unterweisung-mehrsprachig.
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

// Landingpage für die Ziel-Keywords rund um Unterweisungen im Handwerk —
// gleiche Bausteine, Farben (--mk-*-Variablen) und Hell/Dunkel-Support wie
// die Startseite und /unterweisung-mehrsprachig (components/marketing/
// MarketingHome.tsx, UnterweisungMehrsprachig.tsx), eigener Inhalt.
export function UnterweisungHandwerk({ faq }: { faq: FaqItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
  const reduceMotion = useReducedMotion();

  return (
    <div className="uv-mk min-h-screen overflow-x-hidden">
      <TrackPageView path="/unterweisung-handwerk" />
      <AffiliateRef />
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{ borderColor: "var(--mk-line)", background: "color-mix(in srgb, var(--mk-panel) 85%, transparent)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="mk-display text-lg font-bold tracking-tight">uVise</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm text-[var(--mk-ink-70)]">
            <a href="#warum" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Warum liegenbleibt</a>
            <a href="#loesung" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Die Lösung</a>
            <a href="#gewerke" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Gewerke</a>
            <a href="#vorteile" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Vorteile</a>
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
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="mk-display font-bold text-lg tracking-tight">uVise</span>
          </Link>
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
          <a href="#warum" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Warum liegenbleibt
          </a>
          <a href="#loesung" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Die Lösung
          </a>
          <a href="#gewerke" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Gewerke
          </a>
          <a href="#vorteile" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Vorteile
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
        {/* Hero */}
        <section className="scroll-mt-16 relative">
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

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-28 pb-24 sm:pb-32 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PlacardTag>
                <HardHat size={13} /> Für Handwerk & Kleinbetriebe
              </PlacardTag>
              <h1
                className="mk-display font-bold tracking-[-0.03em] leading-[1.04] mt-7 mb-6"
                style={{ fontSize: "clamp(2.25rem, 3.8vw, 3.25rem)" }}
              >
                Unterweisungen im Handwerk,{" "}
                <span style={{ color: "var(--mk-blue)" }}>ohne Papierkram und ohne IT-Abteilung.</span>
              </h1>
              <p className="text-lg text-[var(--mk-ink-65)] mb-9 max-w-md leading-relaxed">
                uVise ist die Unterweisungssoftware für Handwerksbetriebe: Sicherheitsunterweisungen,
                Fristen und Nachweise laufen auf dem Handy jedes Mitarbeiters — ohne Zettel, ohne
                Excel-Tabelle, ohne Konzern-Software.
              </p>
              <div className="flex flex-wrap gap-3">
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <AppPreview />
            </motion.div>
          </div>
        </section>

        {/* Warum Unterweisungen im Handwerk oft liegenbleiben */}
        <section id="warum" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">
                Warum Unterweisungen im Handwerk oft liegenbleiben
              </h2>
              <p className="text-[var(--mk-ink-65)]">
                Nicht aus Nachlässigkeit — sondern weil der Alltag auf Baustelle und in der Werkstatt
                anders tickt als im Büro.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {GRUENDE.map((g, i) => (
                <Reveal key={g.title} delay={(i % 3) * 0.06}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-[14px] border p-6"
                    style={{ borderColor: "var(--mk-line)", background: "var(--mk-panel)" }}
                  >
                    <div
                      className="h-11 w-11 rounded-[8px] flex items-center justify-center mb-4 border"
                      style={{ borderColor: "var(--mk-line-strong)", color: "var(--mk-ink)" }}
                    >
                      <g.icon size={20} />
                    </div>
                    <h3 className="font-semibold mb-1.5">{g.title}</h3>
                    <p className="text-sm text-[var(--mk-ink-60)] leading-relaxed">{g.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Wie uVise das für Handwerksbetriebe löst */}
        <section id="loesung" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center py-28 sm:py-32">
            <Reveal>
              <PlacardTag>
                <ShieldCheck size={13} /> Gemacht für 1–30 Mitarbeiter
              </PlacardTag>
              <h2 className="mk-display text-3xl sm:text-4xl font-bold mb-4 mt-5 leading-tight">
                Wie uVise das für Handwerksbetriebe löst
              </h2>
              <p className="text-[var(--mk-ink-65)] mb-6 max-w-md">
                uVise ist bewusst für kleine Handwerksbetriebe gebaut — nicht für die IT-Abteilung
                eines Konzerns. Kein Server, keine Schulung, keine Excel-Liste, die niemand pflegt.
              </p>
              <ul className="space-y-3">
                {LOESUNG.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm">
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: "var(--mk-green)" }} />
                    <span className="text-[var(--mk-ink-70)]">{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div
                className="rounded-[14px] border p-6 flex flex-col items-center justify-center gap-4"
                style={{ borderColor: "var(--mk-line)", background: "var(--mk-panel)" }}
              >
                <AmpelDots size={28} />
                <p className="text-sm text-center text-[var(--mk-ink-60)] max-w-xs">
                  Das Ampel-System zeigt auf einen Blick, welcher Mitarbeiter offene Unterweisungen
                  oder Qualifikationen hat — sortiert nach Kategorie oder Standort.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Für welche Gewerke */}
        <section id="gewerke" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Für welche Gewerke</h2>
              <p className="text-[var(--mk-ink-65)]">
                uVise passt sich keinem bestimmten Gewerk an — die Unterweisungsinhalte bringst du
                selbst mit, uVise sorgt dafür, dass sie ankommen und nachweisbar sind. Im Einsatz u. a. bei:
              </p>
            </Reveal>
            <div className="flex flex-wrap gap-3">
              {GEWERKE.map((g) => (
                <Reveal key={g}>
                  <span
                    className="mk-mono inline-block rounded-[8px] border px-4 py-2 text-sm"
                    style={{ borderColor: "var(--mk-line)", color: "var(--mk-ink-70)" }}
                  >
                    {g}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Vorteile */}
        <section id="vorteile" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Vorteile für deinen Handwerksbetrieb</h2>
              <p className="text-[var(--mk-ink-65)]">
                Kalkulierbar, schnell eingerichtet und für jedes Team im Betrieb verständlich.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VORTEILE.map((v, i) => (
                <Reveal key={v.title} delay={(i % 4) * 0.06}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-[14px] border p-6"
                    style={{ borderColor: "var(--mk-line)", background: "var(--mk-panel)" }}
                  >
                    <div
                      className="h-11 w-11 rounded-[8px] flex items-center justify-center mb-4 border"
                      style={{ borderColor: "var(--mk-line-strong)", color: "var(--mk-ink)" }}
                    >
                      <v.icon size={20} />
                    </div>
                    <h3 className="font-semibold mb-1.5">{v.title}</h3>
                    <p className="text-sm text-[var(--mk-ink-60)] leading-relaxed">{v.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2} className="mt-8">
              <p className="text-sm text-[var(--mk-ink-65)]">
                Arbeitest du mit einem international besetzten Team?{" "}
                <Link
                  href="/unterweisung-mehrsprachig"
                  className="underline hover:no-underline font-medium"
                  style={{ color: "var(--mk-blue)" }}
                >
                  Mehr zur mehrsprachigen Unterweisung
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* Häufige Fragen */}
        <section id="faq" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="mb-10">
              <h2 className="mk-display text-3xl font-bold mb-3">Häufige Fragen</h2>
              <p className="text-[var(--mk-ink-65)]">Zur Unterweisung im Handwerksbetrieb.</p>
            </Reveal>
            <div className="space-y-3">
              {faq.map((item, i) => {
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
          <Reveal className="mx-auto max-w-3xl px-5 sm:px-8 py-28 sm:py-32 text-center">
            <h2 className="mk-display text-3xl font-bold mb-4">
              Unterweisungen, die im Handwerksalltag wirklich funktionieren
            </h2>
            <p className="text-[var(--mk-ink-65)] mb-8">
              In wenigen Minuten eingerichtet — leg direkt los, keine Kreditkarte nötig.
            </p>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="btn-feedback inline-block rounded-[10px] px-7 py-3.5 text-sm font-semibold text-white"
              style={{ background: "var(--mk-blue-strong)" }}
            >
              7 Tage kostenlos testen
            </Link>
            <p className="text-sm text-[var(--mk-ink-60)] mt-8">
              Mehr Details zu Fristen und Inhalt findest du in unserer{" "}
              <Link
                href="/ratgeber/unterweisung-vorlage"
                className="underline hover:no-underline"
                style={{ color: "var(--mk-blue)" }}
              >
                Unterweisung-Vorlage
              </Link>
              . Zurück zur{" "}
              <Link href="/" className="underline hover:no-underline" style={{ color: "var(--mk-blue)" }}>
                uVise-Startseite
              </Link>
              .
            </p>
          </Reveal>
        </section>
      </main>

      <footer>
        <SignalRule />
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark size={26} />
              <span className="mk-display text-sm font-bold">uVise</span>
            </Link>
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
            <Link href="/unterweisung-handwerk" className="hover:text-[var(--mk-ink)]">Unterweisung Handwerk</Link>
            <Link href="/unterweisung-mehrsprachig" className="hover:text-[var(--mk-ink)]">Unterweisung mehrsprachig</Link>
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
