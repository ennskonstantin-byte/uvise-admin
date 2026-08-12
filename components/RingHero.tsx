"use client";

// Fortschritts-Ring (STYLE.md: "Prozent im Ring-Zentrum, darunter das
// Firmenlogo/Foto" -- Entscheidung F2). Web-Port des App-Rings
// (components/design/bausteine.tsx StatRing) als reines CSS-Conic-Gradient
// + Radial-Mask statt SVG/Reanimated.
import { Building2 } from "lucide-react";

export function RingHero({ percent, logoUrl }: { percent: number; logoUrl: string | null }) {
  const fill = Math.max(2, Math.min(100, percent));
  return (
    <div className="relative h-[120px] w-[120px] shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, #3AA0FF ${fill}%, rgba(255,255,255,0.10) 0)`,
          WebkitMask: "radial-gradient(closest-side, transparent 76%, #000 77%)",
          mask: "radial-gradient(closest-side, transparent 76%, #000 77%)",
          filter: "drop-shadow(0 0 14px rgba(10,108,255,0.45))",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <span className="text-2xl font-bold" style={{ color: "var(--mk-ink)" }}>
          {percent}%
        </span>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-white/10" />
        ) : (
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Building2 size={15} />
          </div>
        )}
      </div>
    </div>
  );
}
