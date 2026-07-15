"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { GOOGLE_REVIEW_URL } from "@/lib/legal";

// Dezenter Bewertungs-Banner fürs Web-Dashboard.
// - Erscheint erst, wenn der Betrieb schon läuft (bereit = 1. Mitarbeiter + 1. Unterweisung).
// - Fragt höchstens einmal alle 7 Tage nach (Stand in localStorage).
// - „Auf Google bewerten" öffnet die Google-Bewertung; „Nein danke" beendet das Nachfragen.
// - Ohne hinterlegte GOOGLE_REVIEW_URL erscheint der Banner nicht (kein toter Knopf).

const KEY = "uvise-web-review";
const WOCHE_MS = 7 * 24 * 60 * 60 * 1000;

type State = { fertig?: boolean; zuletztGefragt?: number };

function laden(): State {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function speichern(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* egal */
  }
}

export function ReviewBanner({ bereit }: { bereit: boolean }) {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    if (!GOOGLE_REVIEW_URL || !bereit) return;
    const s = laden();
    if (s.fertig) return;
    const jetzt = Date.now();
    if (s.zuletztGefragt && jetzt - s.zuletztGefragt < WOCHE_MS) return;
    speichern({ ...s, zuletztGefragt: jetzt });
    setSichtbar(true);
  }, [bereit]);

  if (!sichtbar) return null;

  const jetzt = Date.now();
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3">
      <Star className="text-amber-500" size={20} />
      <p className="text-sm flex-1 min-w-[200px]">
        <span className="font-medium">Gefällt dir uVise?</span> Eine kurze Google-Bewertung hilft anderen Betrieben und uns
        enorm. ⭐
      </p>
      <div className="flex items-center gap-2">
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            speichern({ fertig: true, zuletztGefragt: jetzt });
            setSichtbar(false);
          }}
          className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white"
        >
          Auf Google bewerten
        </a>
        <button
          onClick={() => setSichtbar(false)}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground/60"
        >
          Später
        </button>
        <button
          onClick={() => {
            speichern({ fertig: true, zuletztGefragt: jetzt });
            setSichtbar(false);
          }}
          aria-label="Nicht mehr fragen"
          className="rounded-full p-1.5 text-foreground/40 hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
