"use client";

// Übersicht-Kachel (STYLE.md F3: Mitarbeiter/signiert/offen/Rückfragen),
// Web-Port des App-Bausteins Kachel (components/design/bausteine.tsx).
import type { ReactNode } from "react";
import { Icon3D } from "@/components/Icon3D";
import type { IconKey } from "@/lib/icons";

const TINTS = {
  gruen: { glow: "var(--uv-glow-green, rgba(23,178,106,0.3))" },
  blau: { glow: "var(--uv-glow-blue, rgba(10,108,255,0.38))" },
  violett: { glow: "rgba(139,123,255,0.32)" },
} as const;

export function Kachel({
  icon,
  n,
  label,
  sub,
  tint,
  onClick,
}: {
  icon: IconKey;
  n: number;
  label: string;
  sub: ReactNode;
  tint: keyof typeof TINTS;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="uv-glass-panel btn-feedback flex-1 text-left p-5 hover:-translate-y-0.5 transition-transform"
      style={{ ["--glow" as string]: TINTS[tint].glow }}
    >
      <Icon3D name={icon} size="md" />
      <p className="mt-3 text-2xl font-bold" style={{ color: "var(--mk-ink)" }}>
        {n}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--mk-ink)" }}>
        {label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--mk-ink-60)" }}>
        {sub}
      </p>
    </button>
  );
}
