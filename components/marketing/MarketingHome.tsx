"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Languages,
  Check,
  Menu,
  X,
  HardHat,
  Zap,
  HeartPulse,
  UtensilsCrossed,
  Car,
  Wrench,
  Warehouse,
  TreeDeciduous,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useAppData } from "@/lib/store";
import { PLANS, CHEF_GRATIS_HINWEIS, ENTERPRISE_KONTAKT } from "@/lib/types";
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
import { DriftBackground } from "@/components/marketing/DriftBackground";
import { Icon3D } from "@/components/Icon3D";
import type { IconKey } from "@/lib/icons";

// Akzent je Bereich (STYLE.md: Unterweisungen=Blau, Rückfragen=Cyan,
// Mitarbeiter=Grün, Erinnerungen=Amber) — als 3D-Glas-Kachel-Verlauf +
// passender Glow hinter der jeweiligen Feature-Karte.
const ACCENTS = {
  blau: { from: "#3AA0FF", to: "#0A5BFF", glow: "rgba(10,108,255,0.38)" },
  cyan: { from: "#5BD7FF", to: "#17A8E8", glow: "rgba(23,193,254,0.3)" },
  gruen: { from: "#3FD98A", to: "#12945A", glow: "rgba(23,178,106,0.32)" },
  amber: { from: "#FFD05A", to: "#F0A000", glow: "rgba(245,179,1,0.32)" },
} as const;

// Diese Karten nutzen jetzt unser eigenes i3d-hq-Symbol-Set (statt
// generischer Lucide-Icons) -- gleiche Symbole wie im eingeloggten
// Chef-/SiFa-Bereich, siehe lib/icons.ts. Branchen-Kacheln weiter unten
// behalten Lucide, dafür gibt es kein passendes i3d-Symbol.
const FEATURES = [
  {
    img: "signieren" as IconKey,
    accent: "blau" as const,
    title: "Rechtssichere Signatur",
    text: "Unterweisungen werden nach eIDAS-Grundsätzen digital unterschrieben — Zeitstempel, Gerät und Unterschrift unveränderlich gespeichert.",
  },
  {
    img: "erinnerung" as IconKey,
    accent: "amber" as const,
    title: "Automatische Erinnerungen",
    text: "Läuft eine Qualifikation oder Unterweisung bald ab, bekommen Chef und Mitarbeiter rechtzeitig eine E-Mail.",
  },
  {
    img: "rueckfragen" as IconKey,
    accent: "cyan" as const,
    title: "Rückfragen in Echtzeit",
    text: "Unklarheiten direkt aus der Unterweisung heraus klären — die Antwort kommt sofort auf dem Handy an.",
  },
  {
    // Einzige Karte mit eigenem Ampel-Symbol statt Icon-Kachel: die
    // Funktion, die dem gesamten Seiten-Leitmotiv (der Ampel-Leiste)
    // ihren Namen gibt, bekommt auch visuell die echte Ampel.
    special: "ampel" as const,
    accent: "blau" as const,
    title: "Ampel-System",
    text: "Auf einen Blick sehen, wer offene Punkte hat — sortiert nach Kategorie, Abteilung oder Standort.",
  },
  {
    img: "export" as IconKey,
    accent: "gruen" as const,
    title: "Export für Prüfungen",
    text: "Nachweise und Qualifikationen als CSV oder gebündeltes ZIP-Backup — startklar für die Berufsgenossenschaft.",
  },
  {
    img: "mitarbeiter" as IconKey,
    accent: "blau" as const,
    title: "Eigene Mitarbeiter-App",
    text: "Kein Firmen-Laptop nötig — dein Team erledigt Unterweisungen bequem auf dem eigenen Handy.",
  },
  {
    img: "vorlesen" as IconKey,
    accent: "cyan" as const,
    title: "Vorlesen & 41 Sprachen",
    text: "Jede Unterweisung wird laut vorgelesen und verstanden — auch von fremdsprachigen Mitarbeitern.",
  },
];

const PRODUCTS = [
  {
    tag: "Für Beauftragte & Chefs",
    accent: "blau" as const,
    title: "Web-Dashboard",
    text: "Mitarbeiter anlegen, Unterweisungen verteilen, Qualifikationen im Blick behalten — genau das, was du gerade ansiehst.",
  },
  {
    tag: "Für Beauftragte & Chefs",
    accent: "cyan" as const,
    title: "Chef-App fürs Handy",
    text: "Dieselbe Verwaltung wie das Dashboard, aber unterwegs — z.B. direkt in der Werkstatt oder auf der Baustelle.",
  },
  {
    tag: "Für dein Team",
    accent: "gruen" as const,
    title: "Mitarbeiter-App",
    text: "Unterweisungen ansehen, vorlesen lassen, unterschreiben, Rückfragen stellen — komplett von unterwegs, ohne Papier.",
  },
];

const BRANCHEN = [
  { icon: HardHat, title: "Handwerk", href: "/unterweisung-handwerk" },
  { icon: HardHat, title: "Baustelle", href: "/unterweisung-baustelle" },
  { icon: Zap, title: "Elektro", href: "/unterweisung-elektro" },
  { icon: HeartPulse, title: "Pflege", href: "/unterweisung-pflege" },
  { icon: UtensilsCrossed, title: "Gastronomie", href: "/unterweisung-gastronomie" },
  { icon: Car, title: "KFZ-Werkstatt", href: "/unterweisung-kfz" },
  { icon: Wrench, title: "SHK", href: "/unterweisung-shk" },
  { icon: Warehouse, title: "Lager & Logistik", href: "/unterweisung-lager-logistik" },
  { icon: TreeDeciduous, title: "GaLaBau", href: "/unterweisung-galabau" },
  { icon: Languages, title: "Mehrsprachige Teams", href: "/unterweisung-mehrsprachig" },
];

// Eyebrow-Pille: schmales Glas-Etikett mit Cyan-Rand-Glow (STYLE.md:
// "Eyebrow-Pille"), ersetzt das frühere Werkstattschild-Etikett.
function PlacardTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mk-mono inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md"
      style={{
        background: "var(--uv-glass-bg)",
        border: "1px solid var(--uv-glass-border)",
        color: "var(--mk-ink-70)",
        boxShadow: "0 0 20px var(--uv-glow-cyan), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      {children}
    </span>
  );
}

// Kleine Trust-Pille (eIDAS · 41 Sprachen · Fristen) — dezenter als die
// Eyebrow-Pille, ohne Glow, für die ruhige Vertrauens-Zeile im Hero.
function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{ background: "var(--uv-glass-bg)", border: "1px solid var(--mk-line)", color: "var(--mk-ink-65)" }}
    >
      {children}
    </span>
  );
}

// Glas-Karte (Feature/Branchen/FAQ) — echtes Milchglas mit Lichtkante +
// Glow statt eines flachen Border-Kartons.
function GlassCard({
  children,
  glow = "var(--uv-glow-blue)",
  className = "",
}: {
  children: React.ReactNode;
  glow?: string;
  className?: string;
}) {
  return (
    <div className={`uv-glass-panel ${className}`} style={{ ["--glow" as string]: glow }}>
      {children}
    </div>
  );
}

// Erhabene 3D-Icon-Kachel (Feature-Karten, Branchen, Produkt-Akzent).
// `img` (i3d-hq-Symbol, wie im eingeloggten Bereich) hat Vorrang vor `icon`
// (Lucide) -- Branchen-Kacheln haben kein passendes i3d-Symbol und nutzen
// weiterhin `icon`.
function AccentTile({
  icon: Icon,
  img,
  accent,
  size = 20,
}: {
  icon?: React.ComponentType<{ size?: number }>;
  img?: IconKey;
  accent: keyof typeof ACCENTS;
  size?: number;
}) {
  const a = ACCENTS[accent];
  return (
    <div
      className="uv-glass-tile h-11 w-11 shrink-0 flex items-center justify-center text-white"
      style={{ ["--tile-from" as string]: a.from, ["--tile-to" as string]: a.to, ["--glow" as string]: a.glow }}
    >
      {img ? <Icon3D name={img} size="md" /> : Icon ? <Icon size={size} /> : null}
    </div>
  );
}

export function MarketingHome() {
  const { session, loading } = useAppData();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Die Website trägt jetzt durchgehend das dunkle Glas-3D-Design der App
  // (STYLE.md) — kein Hell/Dunkel-Umschalter mehr, genau wie in der App
  // seit dem Redesign selbst nicht mehr wählbar.
  useEffect(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);
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
    <div className="uv-glass min-h-screen overflow-x-hidden">
      <DriftBackground />
      <TrackPageView path="/" />
      <AffiliateRef />
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{ borderColor: "var(--mk-line)", background: "color-mix(in srgb, var(--mk-paper) 78%, transparent)" }}
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
            <a href="#branchen" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Branchen</a>
            <a href="#preise" className="whitespace-nowrap hover:text-[var(--mk-ink)]">Preise</a>
            <a href="#faq" className="whitespace-nowrap hover:text-[var(--mk-ink)]">FAQ</a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="btn-feedback whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-70)] hover:text-[var(--mk-ink)] border"
              style={{ borderColor: "var(--mk-line)", background: "var(--uv-glass-bg)" }}
            >
              Anmelden
            </Link>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="uv-glass-tile btn-feedback whitespace-nowrap px-4 py-2 text-sm font-semibold text-white"
              style={{ ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "10px" }}
            >
              Kostenlos testen
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-[8px] border text-[var(--mk-ink)]"
            style={{ borderColor: "var(--mk-line)" }}
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
        className={`uv-glass lg:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`uv-glass lg:hidden fixed top-0 left-0 z-50 h-full w-[78%] max-w-xs shadow-2xl px-6 py-5 flex flex-col rounded-r-[18px] backdrop-blur-xl transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "color-mix(in srgb, var(--mk-panel) 92%, transparent)", borderRight: "1px solid var(--mk-line)" }}
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
          <a href="#branchen" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Branchen
          </a>
          <a href="#preise" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            Preise
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)} className="rounded-[8px] px-3 py-3 text-sm font-medium text-[var(--mk-ink-70)]">
            FAQ
          </a>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/login"
            className="text-center rounded-[10px] px-4 py-2.5 text-sm font-medium border"
            style={{ borderColor: "var(--mk-line)", background: "var(--uv-glass-bg)" }}
          >
            Anmelden
          </Link>
          <Link
            href="/login?mode=register"
            rel="nofollow"
            className="uv-glass-tile text-center px-4 py-2.5 text-sm font-semibold text-white"
            style={{ ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "10px" }}
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

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-28 pb-24 sm:pb-32 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PlacardTag>🇩🇪 Gemacht für deutsche Betriebe</PlacardTag>
              <h1
                className="mk-display font-bold tracking-[-0.03em] leading-[1.04] mt-7 mb-6"
                style={{ fontSize: "clamp(2.25rem, 3.8vw, 3.25rem)" }}
              >
                Die Unterweisungssoftware, die sich
                <br />
                <span
                  style={{
                    background: "linear-gradient(120deg, #5BD7FF, #0A6CFF)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  von selbst erledigt.
                </span>
              </h1>
              <p className="text-lg text-[var(--mk-ink-65)] mb-7 max-w-md leading-relaxed">
                Die Unterweisungssoftware für den Arbeitsschutz kümmert sich selbst um Fristen,
                Erinnerungen und rechtssichere Unterschriften — mehrsprachig und erledigt den
                Papierkram für dich.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mb-8">
                {["eIDAS-konform", "41 Sprachen", "Fristen-Erinnerungen"].map((t) => (
                  <TrustPill key={t}>{t}</TrustPill>
                ))}
              </div>
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
                  className="px-6 text-sm font-semibold text-white border-transparent bg-[linear-gradient(160deg,#3AA0FF,#0A5BFF)] shadow-[0_7px_13px_rgba(0,0,0,0.5),0_0_20px_rgba(10,108,255,0.38),inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-4px_7px_rgba(0,0,0,0.4)]"
                >
                  7 Tage kostenlos testen
                </MovingBorderButton>
                <a
                  href="#live-demo"
                  className="btn-feedback h-12 inline-flex items-center rounded-[10px] px-6 text-sm font-semibold backdrop-blur-md"
                  style={{
                    background: "var(--uv-glass-bg)",
                    border: "1px solid var(--uv-glass-border)",
                    color: "var(--mk-ink)",
                  }}
                >
                  Live-Demo ansehen
                </a>
              </div>
              <p className="text-xs text-[var(--mk-ink-50)] mt-4">
                Keine Kreditkarte nötig · 12 Monate Laufzeit
              </p>
              <div className="mt-8 max-w-xs">
                <SignalRule animate={!reduceMotion} />
              </div>
            </motion.div>

            {/* Echte, klickbare App-Vorschau statt eines Fake-Mockups */}
            <motion.div
              id="live-demo"
              className="scroll-mt-24"
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
          <div className="mx-auto max-w-6xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center py-28 sm:py-32">
            <Reveal>
              <PlacardTag>
                <Languages size={13} /> Verstanden wird jeder
              </PlacardTag>
              <h2 className="mk-display text-3xl sm:text-4xl font-bold mb-4 mt-5 leading-tight">
                Unterweisungen in 41 Sprachen —
                <br />
                rechtssicher für fremdsprachige Mitarbeiter.
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
              <Link
                href="/unterweisung-mehrsprachig"
                className="inline-block mt-5 text-sm font-medium underline hover:no-underline"
                style={{ color: "var(--mk-blue)" }}
              >
                Mehr zur mehrsprachigen Unterweisung erfahren →
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <VorlesenDemo />
            </Reveal>
          </div>
        </section>

        {/* Funktionen */}
        <section id="funktionen" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Digitale Unterweisung für Handwerk & Kleinbetriebe</h2>
              <p className="text-[var(--mk-ink-65)]">
                Sicherheitsunterweisungen, Qualifikationen und Nachweise an einem Ort — von der
                Erinnerung bis zur rechtssicheren Unterschrift. Konzipiert für Handwerk und kleine
                Betriebe, nicht für die IT-Abteilung.
              </p>
              <Link
                href="/unterweisung-handwerk"
                className="inline-block mt-5 text-sm font-medium underline hover:no-underline"
                style={{ color: "var(--mk-blue)" }}
              >
                Mehr zur Unterweisung im Handwerk erfahren →
              </Link>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 4) * 0.06}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                    <GlassCard glow={ACCENTS[f.accent].glow} className="h-full p-6">
                      {"special" in f && f.special === "ampel" ? (
                        <div className="mb-4">
                          <AmpelDots size={20} />
                        </div>
                      ) : (
                        "img" in f && <AccentTile img={f.img} accent={f.accent} />
                      )}
                      <h3 className="font-semibold mt-4 mb-1.5" style={{ color: "var(--mk-ink)" }}>{f.title}</h3>
                      <p className="text-sm text-[var(--mk-ink-60)] leading-relaxed">{f.text}</p>
                    </GlassCard>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Die App / Produkte */}
        <section id="app" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Deine Unterweisungen in einem System, drei Oberflächen</h2>
              <p className="text-[var(--mk-ink-65)]">
                Chefs verwalten am Rechner oder unterwegs auf dem Handy — Mitarbeiter erledigen alles in
                ihrer eigenen App.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {PRODUCTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                    <div
                      className="uv-glass-panel h-full p-7"
                      style={{
                        ["--glow" as string]: ACCENTS[p.accent].glow,
                        borderTop: `3px solid ${ACCENTS[p.accent].to}`,
                      }}
                    >
                      <span className="mk-mono inline-block text-[11px] uppercase tracking-wide mb-4" style={{ color: "var(--mk-ink-50)" }}>
                        {p.tag}
                      </span>
                      <h3 className="mk-display text-xl font-bold mb-2" style={{ color: "var(--mk-ink)" }}>{p.title}</h3>
                      <p className="text-sm text-[var(--mk-ink-65)] leading-relaxed">{p.text}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Branchen */}
        <section id="branchen" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-12">
              <h2 className="mk-display text-3xl font-bold mb-3">Für deine Branche</h2>
              <p className="text-[var(--mk-ink-65)]">
                uVise passt sich keiner bestimmten Branche an — die Unterweisungsinhalte bringst du
                selbst mit. Typische Gefährdungen und Anforderungen unterscheiden sich trotzdem je
                nach Branche:
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BRANCHEN.map((b, i) => (
                <Reveal key={b.href} delay={(i % 3) * 0.06}>
                  <Link href={b.href} className="block h-full">
                    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                      <GlassCard
                        glow={ACCENTS[(["blau", "cyan", "gruen", "amber"] as const)[i % 4]].glow}
                        className="h-full p-6 flex items-center gap-4"
                      >
                        <AccentTile icon={b.icon} accent={(["blau", "cyan", "gruen", "amber"] as const)[i % 4]} />
                        <span className="font-semibold" style={{ color: "var(--mk-ink)" }}>{b.title}</span>
                      </GlassCard>
                    </motion.div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Preise */}
        <section id="preise" className="scroll-mt-16">
          <SignalRule />
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-28 sm:py-32">
            <Reveal className="max-w-xl mb-8">
              <h2 className="mk-display text-3xl font-bold mb-3">Ein Preis pro Team-Größe</h2>
              <p className="text-[var(--mk-ink-65)]">
                7 Tage kostenlos testen, danach 12 Monate Laufzeit bei monatlicher Zahlung. Keine
                Einrichtungsgebühr.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => {
                const featured = i === 1;
                return (
                  <Reveal key={plan.name} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className={`relative h-full ${featured ? "md:-translate-y-2" : ""}`}
                    >
                      <div
                        className="uv-glass-panel h-full p-7"
                        style={
                          featured
                            ? { ["--glow" as string]: "rgba(23,193,254,0.4)", border: "2px solid var(--accent-cyan)" }
                            : { ["--glow" as string]: "var(--uv-glow-blue)" }
                        }
                      >
                        {featured && (
                          <span
                            className="mk-mono absolute -top-3 left-7 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                            style={{ background: "var(--mk-yellow)", color: "#14171a" }}
                          >
                            Am beliebtesten
                          </span>
                        )}
                        <h3 className="mk-display text-xl font-bold mb-1" style={{ color: "var(--mk-ink)" }}>{plan.name}</h3>
                        <p className="text-sm mb-5 text-[var(--mk-ink-60)]">{plan.limit}</p>
                        <p className="mb-6" style={{ color: "var(--mk-ink)" }}>
                          <span className="text-4xl font-bold">{plan.preis}€</span>
                          <span className="text-sm text-[var(--mk-ink-55)]"> /Monat</span>
                        </p>
                        <ul className="space-y-2.5 mb-7">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <Check size={16} className="shrink-0 mt-0.5" style={{ color: "var(--mk-green)" }} />
                              <span className="text-[var(--mk-ink-70)]">{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href="/login?mode=register"
                          rel="nofollow"
                          className="uv-glass-tile btn-feedback block text-center px-5 py-2.5 text-sm font-semibold text-white"
                          style={{
                            ["--tile-from" as string]: "#3AA0FF",
                            ["--tile-to" as string]: "#0A5BFF",
                            ["--glow" as string]: "var(--uv-glow-blue)",
                            borderRadius: "10px",
                          }}
                        >
                          Jetzt starten
                        </Link>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={0.2}>
              <p className="mt-6 text-center text-sm text-[var(--mk-ink-60)]">{CHEF_GRATIS_HINWEIS}</p>
              <p className="mt-2 text-center text-sm text-[var(--mk-ink-60)]">
                {ENTERPRISE_KONTAKT.text}{" "}
                <Link href={ENTERPRISE_KONTAKT.href} className="font-semibold hover:underline" style={{ color: "var(--mk-blue-strong)" }}>
                  {ENTERPRISE_KONTAKT.linkText}
                </Link>
              </p>
              <p className="mt-2 text-center text-sm">
                <Link href="/preise" className="font-semibold hover:underline" style={{ color: "var(--mk-blue-strong)" }}>
                  Alle Details & Tarifvergleich →
                </Link>
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
              <p className="text-[var(--mk-ink-65)]">Was uVise-Kunden uns am häufigsten fragen.</p>
            </Reveal>
            <div className="space-y-3">
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 0.04}>
                    <div className="uv-glass-panel overflow-hidden" style={{ ["--glow" as string]: "var(--uv-glow-blue)" }}>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                        aria-expanded={open}
                      >
                        <span className="font-medium" style={{ color: "var(--mk-ink)" }}>{item.q}</span>
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
          <Reveal className="mx-auto max-w-3xl px-5 sm:px-8 py-28 sm:py-32 text-center">
            <h2 className="mk-display text-3xl font-bold mb-4">Bereit, das Ordner-Chaos zu beenden?</h2>
            <p className="text-[var(--mk-ink-65)] mb-8">
              In wenigen Minuten eingerichtet — leg direkt los, keine Kreditkarte nötig.
            </p>
            <Link
              href="/login?mode=register"
              rel="nofollow"
              className="uv-glass-tile btn-feedback inline-block px-7 py-3.5 text-sm font-semibold text-white"
              style={{ ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "10px" }}
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
          <nav aria-label="Rechtliches" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[var(--mk-ink-60)]">
            <Link href="/unterweisung-handwerk" className="hover:text-[var(--mk-ink)]">Unterweisung Handwerk</Link>
            <Link href="/unterweisung-baustelle" className="hover:text-[var(--mk-ink)]">Unterweisung Baustelle</Link>
            <Link href="/unterweisung-elektro" className="hover:text-[var(--mk-ink)]">Unterweisung Elektro</Link>
            <Link href="/unterweisung-pflege" className="hover:text-[var(--mk-ink)]">Unterweisung Pflege</Link>
            <Link href="/unterweisung-gastronomie" className="hover:text-[var(--mk-ink)]">Unterweisung Gastronomie</Link>
            <Link href="/unterweisung-kfz" className="hover:text-[var(--mk-ink)]">Unterweisung KFZ</Link>
            <Link href="/unterweisung-shk" className="hover:text-[var(--mk-ink)]">Unterweisung SHK</Link>
            <Link href="/unterweisung-lager-logistik" className="hover:text-[var(--mk-ink)]">Unterweisung Lager & Logistik</Link>
            <Link href="/unterweisung-galabau" className="hover:text-[var(--mk-ink)]">Unterweisung GaLaBau</Link>
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
