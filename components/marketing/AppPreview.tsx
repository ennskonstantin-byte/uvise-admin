"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const APPS = [
  {
    key: "chef",
    label: "Chef-App",
    src: "/preview-chef/index.html",
    hint: "Angemeldet als Nina Müller (Beauftragte) — Mitarbeiter, Unterweisungen und Qualifikationen der Demo-Firma \"uVise Demo GmbH\".",
  },
  {
    key: "ma",
    label: "Mitarbeiter-App",
    src: "/preview-ma/index.html",
    hint: "Angemeldet als Lena Bauer (Mitarbeiterin) — probier ruhig \"Jetzt signieren\" und die Vorlese-/Übersetzungsfunktion aus.",
  },
] as const;

// Original-Apple-Logo (Silhouette), nicht das lucide-Obst-Icon.
function AppleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.415-3.132c.843-1.012 1.4-2.427 1.245-3.831-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}

// Play-Store-Dreieck in den vier Marken-Farben statt eines generischen
// Play-Icons.
function GooglePlayLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#00d2ff" />
      <path d="M14.499 12.707l2.302 2.302-10.937 6.333 8.635-8.635z" fill="#34a853" />
      <path d="M17.698 9.509l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626-2.303-2.302 2.304-2.68z" fill="#fbbc05" />
      <path d="M5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" fill="#ea4335" />
    </svg>
  );
}

// Echte, live laufende Instanzen von Chef-App und Mitarbeiter-App als iframe
// im Handy-Rahmen — mit einer eigenen, isolierten Demo-Firma (Fake-Daten,
// automatisch eingeloggt). Besucher können sich wirklich durchklicken statt
// nur Screenshots zu sehen.
export function AppPreview() {
  const [active, setActive] = useState<(typeof APPS)[number]["key"]>("ma");
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  // Nur bereits aktivierte Tabs werden überhaupt als iframe gemountet — sonst
  // laden Chef- und Mitarbeiter-App-Bundle beide gleichzeitig im Hintergrund,
  // auch wenn nur eine Vorschau sichtbar ist, und alles wirkt doppelt so langsam.
  const [mounted, setMounted] = useState<Record<string, boolean>>({});

  // Die erste Vorschau (Standard: Mitarbeiter-App) erst mounten, nachdem die
  // restliche Landingpage fertig geladen ist — sonst konkurriert das
  // Demo-App-Bundle beim allerersten Seitenaufruf mit Schriften, Animationen
  // und Bildern um Bandbreite/CPU und wirkt dadurch quälend langsam, obwohl
  // das Bundle selbst nicht größer ist als das der Chef-App.
  useEffect(() => {
    if (document.readyState === "complete") {
      setMounted((p) => ({ ...p, [active]: true }));
      return;
    }
    const onLoad = () => setMounted((p) => ({ ...p, [active]: true }));
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = APPS.find((a) => a.key === active)!;

  function handleSelect(key: (typeof APPS)[number]["key"]) {
    setActive(key);
    setMounted((p) => ({ ...p, [key]: true }));
  }

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex rounded-[10px] border p-1 mb-6" style={{ borderColor: "var(--mk-line)", background: "var(--mk-panel)" }}>
        {APPS.map((a) => (
          <button
            key={a.key}
            onClick={() => handleSelect(a.key)}
            className={`rounded-[8px] px-4 py-2 text-sm font-medium transition-colors ${
              active === a.key ? "text-white" : "text-[var(--mk-ink-60)] hover:text-[var(--mk-ink)]"
            }`}
            style={active === a.key ? { background: "var(--mk-blue-strong)" } : undefined}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="relative w-[330px] sm:w-[360px] rounded-[2.5rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden" style={{ aspectRatio: "375 / 812" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-b-2xl z-10" />
        {!loaded[active] && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs" style={{ background: "var(--mk-paper)", color: "var(--mk-ink-50)" }}>
            <div className="h-6 w-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--mk-line)", borderTopColor: "var(--mk-blue)" }} />
            Lädt Vorschau …
          </div>
        )}
        {APPS.filter((a) => mounted[a.key]).map((a) => (
          <iframe
            key={a.key}
            src={a.src}
            title={a.label}
            onLoad={() => setLoaded((p) => ({ ...p, [a.key]: true }))}
            className="w-full h-full border-none bg-background"
            style={{ display: active === a.key ? "block" : "none" }}
          />
        ))}
      </div>

      <motion.p
        key={current.key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-center mt-5 max-w-xs"
        style={{ color: "var(--mk-ink-55)" }}
      >
        {current.hint}
      </motion.p>

      {/* Offizielle Apple-/Google-Play-Buttons (schwarz mit hellem Keyline-Rand,
          damit sie auch auf dunklem Hintergrund gut sichtbar sind). flex-wrap:
          bricht auf schmalen Handy-Ansichten sauber um. */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {[
          { Logo: AppleLogo, line1: "Laden im", line2: "App Store" },
          { Logo: GooglePlayLogo, line1: "Jetzt bei", line2: "Google Play" },
        ].map(({ Logo, line1, line2 }) => (
          <div
            key={line2}
            className="flex items-center gap-2.5 rounded-[11px] border border-white/50 bg-black px-4 py-2 text-white shadow-lg"
            title={`${line2} — bald verfügbar`}
          >
            <Logo size={24} />
            <div className="text-left leading-none">
              <p className="text-[10px] font-normal tracking-wide text-white/85">{line1}</p>
              <p className="mt-0.5 text-[17px] font-semibold">{line2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
