"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Kleiner Wiederverwendungs-Baustein: blendet Inhalte beim Scrollen sanft
// ein, statt dass die ganze Marketing-Seite starr/statisch wirkt. Wer in
// den Systemeinstellungen Animationen reduziert hat, bekommt nur ein
// reines Einblenden ohne Bewegung (Barrierefreiheit).
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      // Schweres, cinematisches Einblenden: sanftes Aufsteigen mit leichtem
      // Weichzeichner, das sich über eine eigene Bewegungskurve auflöst —
      // statt eines flachen Standard-Fades. Wer Animationen reduziert hat,
      // bekommt nur ein reines Einblenden ohne Bewegung/Blur.
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28, filter: reduceMotion ? "none" : "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.8,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
