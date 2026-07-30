"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Scale,
  Languages,
  ShieldCheck,
  Smartphone,
  Check,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Switch } from "@/components/Switch";
import { Reveal } from "@/components/marketing/Reveal";
import { VorlesenDemo } from "@/components/marketing/VorlesenDemo";
import { SignalRule } from "@/components/marketing/SignalRule";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { SUPPORT_EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/legal";
import { TrackPageView } from "@/components/TrackPageView";
import { AffiliateRef } from "@/components/AffiliateRef";
import { ChatWidget } from "@/components/marketing/ChatWidget";

type FaqItem = { q: string; a: string };

const VORTEILE = [
  {
    icon: Scale,
    title: "Rechtssicher",
    text: "Erfüllt die Vorgabe aus ArbSchG & DGUV Vorschrift 1, dass die Unterweisung in einer für den Mitarbeiter verständlichen Sprache erfolgen muss.",
  },
  {
    icon: ShieldCheck,
    title: "Lückenlos dokumentiert",
    text: "Gewählte Sprache, Zeitstempel und Unterschrift landen automatisch im Nachweis — startklar für die Berufsgenossenschaft.",
  },
  {
    icon: Languages,
    title: "Kein Dolmetscher nötig",
    text: "uVise übersetzt und liest jede Unterweisung selbst vor — ohne externen Übersetzer und ohne Wartezeit.",
  },
  {
    icon: Smartphone,
    title: "Auf jedem Handy",
    text: "Jeder Mitarbeiter wählt seine Sprache selbst in der eigenen App — kein Firmen-Gerät nötig.",
  },
];

// Placard-Tag im selben Stil wie auf der Startseite (components/marketing/MarketingHome.tsx).
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

// Eigenständige Landingpage für die Ziel-Keywords rund um mehrsprachige
// Unterweisungen — nutzt exakt dieselben Bausteine, Farben (--mk-*-Variablen)
// und denselben Hell/Dunkel-Support wie die Startseite (MarketingHome.tsx),
// damit sie sich nahtlos einfügt, ohne deren Code zu verändern.
export function UnterweisungMehrsprachig({ faq }: { faq: FaqItem[] }) {
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
      <TrackPageView path="/unterweisung-mehrsprachig" />
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
            <a href="#rechtslage" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Die Rechtslage</a>
            <a href="#loesung" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Wie uVise das löst</a>
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
          <a href="#rechtslage" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Die Rechtslage
          </a>
          <a href="#loesung" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Wie uVise das löst
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
                <Languages size={13} /> 41 Sprachen
              </PlacardTag>
              <h1
                className="mk-display font-bold tracking-[-0.03em] leading-[1.04] mt-7 mb-6"
                style={{ fontSize: "clamp(2.25rem, 3.8vw, 3.25rem)" }}
              >
                Unterweisungen, die auch{" "}
                <span style={{ color: "var(--mk-blue)" }}>fremdsprachige Mitarbeiter verstehen.</span>
              </h1>
              <p className="text-lg text-[var(--mk-ink-65)] mb-9 max-w-md leading-relaxed">
                Eine Unterweisung mehrsprachig durchzuführen ist keine Kür, sondern für viele Betriebe
                Pflicht: Wer nicht ausreichend Deutsch versteht, muss die Unterweisung in seiner
                Muttersprache oder in verständlicher Form erhalten. uVise übersetzt und liest jede
                Unterweisung automatisch in 41 Sprachen vor.
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
              <VorlesenDemo />
            </motion.div>
          </div>
        </section>

        {/* Die Rechtslage */}
        <section id="rechtslage" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal>
              <PlacardTag>
                <Scale size={13} /> Gesetzliche Pflicht
              </PlacardTag>
              <h2 className="mk-display text-3xl sm:text-4xl font-bold mb-6 mt-5 leading-tight">
                Die Rechtslage: Unterweisung in verständlicher Sprache
              </h2>
              <p className="text-[var(--mk-ink-65)] mb-4 leading-relaxed">
                Nach{" "}
                <a
                  href="https://www.gesetze-im-internet.de/arbschg/__12.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                  style={{ color: "var(--mk-blue)" }}
                >
                  § 12 Arbeitsschutzgesetz (ArbSchG)
                </a>{" "}
                muss ein Arbeitgeber seine Beschäftigten „ausreichend und angemessen" unterweisen.
                „Angemessen" bedeutet dabei auch: verständlich für die Person, die davor sitzt. Ergänzt
                wird das durch § 4 DGUV Vorschrift 1, der ausdrücklich verlangt, dass Unterweisungen „in
                für die Versicherten verständlicher Form und Sprache" erfolgen.
              </p>
              <p className="text-[var(--mk-ink-65)] mb-4 leading-relaxed">
                Das Gesetz schreibt damit keine bestimmte Sprache vor — es schreibt das Ergebnis vor:
                der Mitarbeiter muss die Unterweisung tatsächlich verstehen können. Reicht das
                Deutsch dafür nicht aus, muss die Unterweisung in der Muttersprache oder auf andere
                Weise verständlich gemacht werden. Die Verantwortung dafür liegt beim Arbeitgeber,
                nicht beim Mitarbeiter.
              </p>
              <p className="text-[var(--mk-ink-65)] mb-4 leading-relaxed">
                Eine Unterschrift allein ist dafür kein ausreichender Nachweis: Sie belegt, dass jemand
                unterschrieben hat, nicht dass er den Inhalt verstanden hat. Wer im Betrieb erkennbar
                kaum Deutsch spricht und trotzdem nur einen deutschen Text unterschreibt, hat rechtlich
                weiterhin ein offenes Risiko — bis hin zu Bußgeldern oder persönlicher Haftung nach
                einem Arbeitsunfall.
              </p>
              <p className="text-[var(--mk-ink-65)] leading-relaxed">
                Mehr zu Fristen, Inhalt und Nachweis einer Unterweisung findest du in unserer{" "}
                <Link
                  href="/ratgeber/unterweisung-vorlage"
                  className="underline hover:no-underline"
                  style={{ color: "var(--mk-blue)" }}
                >
                  Unterweisung-Vorlage
                </Link>
                . Eine ausführlichere Einordnung der Rechtslage bei fremdsprachigen Teams gibt es im
                Ratgeber{" "}
                <Link
                  href="/ratgeber/unterweisung-fremdsprachige-mitarbeiter"
                  className="underline hover:no-underline"
                  style={{ color: "var(--mk-blue)" }}
                >
                  Unterweisung für fremdsprachige Mitarbeiter
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* Wie uVise das löst */}
        <section id="loesung" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center py-28 sm:py-32">
            <Reveal>
              <PlacardTag>
                <Languages size={13} /> Verstanden wird jeder
              </PlacardTag>
              <h2 className="mk-display text-3xl sm:text-4xl font-bold mb-4 mt-5 leading-tight">
                Wie uVise das löst
              </h2>
              <p className="text-[var(--mk-ink-65)] mb-6 max-w-md">
                Statt Übersetzer zu organisieren oder auf gut Glück zu unterschreiben, übernimmt uVise
                die Verständlichkeit direkt in der App — für jeden Mitarbeiter in seiner eigenen
                Sprache.
              </p>
              <ul className="space-y-3">
                {[
                  "41 Sprachen zur Auswahl, u. a. Türkisch, Ukrainisch, Arabisch, Polnisch und Rumänisch",
                  "Jede Unterweisung wird automatisch übersetzt und laut vorgelesen",
                  "Die Unterschrift wird erst freigeschaltet, nachdem der Text vollständig gelesen oder vorgelesen wurde",
                  "Die gewählte Sprache wird zusammen mit Zeitstempel und Unterschrift im Nachweis dokumentiert",
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

        {/* Vorteile */}
        <section id="vorteile" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Vorteile einer mehrsprachigen Unterweisung mit uVise</h2>
              <p className="text-[var(--mk-ink-65)]">
                Verständlich für jeden Mitarbeiter, rechtssicher dokumentiert — ohne zusätzlichen
                Aufwand für dich.
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
          </div>
        </section>

        {/* Häufige Fragen */}
        <section id="faq" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="mb-10">
              <h2 className="mk-display text-3xl font-bold mb-3">Häufige Fragen</h2>
              <p className="text-[var(--mk-ink-65)]">Zur Unterweisung fremdsprachiger Mitarbeiter.</p>
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
              Unterweisungen, die jeder Mitarbeiter versteht
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
              Zurück zur{" "}
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
