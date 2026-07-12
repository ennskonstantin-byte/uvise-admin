"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

// Entspricht der echten Sprachliste der Mitarbeiter-App (lib/languages.ts,
// dort 41 Einträge) — hier nur eine kleine, repräsentative Auswahl fürs
// automatische Durchwechseln.
const LANGS = [
  { flag: "🇩🇪", name: "Deutsch" },
  { flag: "🇹🇷", name: "Türkçe" },
  { flag: "🇺🇦", name: "Українська" },
  { flag: "🇵🇱", name: "Polski" },
  { flag: "🇬🇧", name: "English" },
  { flag: "🇸🇦", name: "العربية" },
];

// Kleine, sich selbst abspielende Demo für die Marketing-Seite: zeigt,
// wie ein Mitarbeiter sich eine Unterweisung vorlesen lässt und dabei
// zwischen Sprachen wechseln kann — ohne echtes Audio, rein visuell.
export function VorlesenDemo() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LANGS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-3xl border border-border/60 bg-background shadow-xl overflow-hidden p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={LANGS[index].name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <span className="text-3xl">{LANGS[index].flag}</span>
            <div>
              <p className="text-sm font-semibold">{LANGS[index].name}</p>
              <p className="text-xs text-foreground/50">Antippen zum Ändern</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <span className="text-xs rounded-full bg-surface px-3 py-1.5 text-foreground/60 font-medium">
          41 Sprachen
        </span>
      </div>

      <button
        onClick={() => setPlaying((p) => !p)}
        className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-white mb-5"
        style={{ background: "var(--accent-gradient)" }}
      >
        <motion.span
          animate={playing ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ repeat: playing ? Infinity : 0, duration: 1.1 }}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white/20"
        >
          <Volume2 size={18} />
        </motion.span>
        <span className="text-sm font-medium">{playing ? "Wird vorgelesen …" : "Vorlesen"}</span>
        <span className="flex-1 flex items-end justify-end gap-1 h-6">
          {[6, 14, 20, 12, 18, 8].map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-white/70"
              animate={playing ? { height: [h * 0.4, h, h * 0.4] } : { height: h * 0.4 }}
              transition={{ repeat: playing ? Infinity : 0, duration: 0.9, delay: i * 0.08 }}
            />
          ))}
        </span>
      </button>

      <div className="rounded-2xl bg-surface/60 border border-border/50 px-5 py-4">
        <p className="text-[11px] font-semibold tracking-wide text-foreground/45 mb-2">
          DOKUMENT · {LANGS[index].name.toUpperCase()}
        </p>
        <div className="space-y-2">
          <div className="h-2.5 rounded-full bg-foreground/10 w-full" />
          <div className="h-2.5 rounded-full bg-foreground/10 w-11/12" />
          <div className="h-2.5 rounded-full bg-foreground/10 w-4/5" />
        </div>
      </div>
    </div>
  );
}
