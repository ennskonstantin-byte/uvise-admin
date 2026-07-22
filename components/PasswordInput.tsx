"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Passwort-Eingabe mit Augen-Umschalter zum Anzeigen/Verbergen. Einfügen
// (Strg/Cmd+V) ist ausdrücklich erlaubt — Passwort-Manager funktionieren.
export function PasswordInput({
  value,
  onChange,
  placeholder = "Passwort",
  autoComplete = "current-password",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [sichtbar, setSichtbar] = useState(false);
  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          // Mobile Safari übernimmt beim Einfügen in ein type="password"-Feld
          // manchmal nur das erste Zeichen (bekannter WebKit-Eigenheit bei
          // React-kontrollierten Eingaben). Der eingefügte Text wird deshalb
          // hier direkt aus der Zwischenablage gelesen und komplett gesetzt,
          // statt dem nativen Einfüge-Verhalten des Browsers zu vertrauen.
          const pasted = e.clipboardData.getData("text");
          if (pasted) {
            e.preventDefault();
            onChange(pasted);
          }
        }}
        type={sichtbar ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-full border border-border bg-surface px-4 py-2.5 pr-11 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => setSichtbar((s) => !s)}
        aria-label={sichtbar ? "Passwort verbergen" : "Passwort anzeigen"}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full text-foreground/50 hover:text-foreground"
      >
        {sichtbar ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
