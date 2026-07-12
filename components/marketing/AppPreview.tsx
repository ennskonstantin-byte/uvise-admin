"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const APPS = [
  {
    key: "chef",
    label: "Chef-App",
    src: "/preview-chef/index.html",
    hint: "Angemeldet als Nina Beispiel (Beauftragte) — Mitarbeiter, Unterweisungen und Qualifikationen der Demo-Firma \"uVise Demo GmbH\".",
  },
  {
    key: "ma",
    label: "Mitarbeiter-App",
    src: "/preview-ma/index.html",
    hint: "Angemeldet als Lena Bauer (Mitarbeiterin) — probier ruhig \"Jetzt signieren\" und die Vorlese-/Übersetzungsfunktion aus.",
  },
] as const;

// Echte, live laufende Instanzen von Chef-App und Mitarbeiter-App als iframe
// im Handy-Rahmen — mit einer eigenen, isolierten Demo-Firma (Fake-Daten,
// automatisch eingeloggt). Besucher können sich wirklich durchklicken statt
// nur Screenshots zu sehen.
export function AppPreview() {
  const [active, setActive] = useState<(typeof APPS)[number]["key"]>("ma");
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const current = APPS.find((a) => a.key === active)!;

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex rounded-full border border-border bg-surface p-1 mb-6">
        {APPS.map((a) => (
          <button
            key={a.key}
            onClick={() => setActive(a.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === a.key ? "text-white" : "text-foreground/60 hover:text-foreground"
            }`}
            style={active === a.key ? { background: "var(--accent-gradient)" } : undefined}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="relative w-[300px] sm:w-[320px] rounded-[2.5rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden" style={{ aspectRatio: "375 / 812" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-b-2xl z-10" />
        {!loaded[active] && (
          <div className="absolute inset-0 flex items-center justify-center bg-page-bg text-xs text-foreground/50">
            Lädt Vorschau …
          </div>
        )}
        {APPS.map((a) => (
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
        className="text-xs text-foreground/55 text-center mt-5 max-w-xs"
      >
        {current.hint}
      </motion.p>
    </div>
  );
}
