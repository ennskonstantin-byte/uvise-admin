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
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduceMotion ? 0.2 : 0.5, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
