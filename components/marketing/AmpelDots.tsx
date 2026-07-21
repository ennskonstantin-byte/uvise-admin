// Echtes Drei-Punkte-Ampel-Symbol statt eines generischen Lucide-Icons —
// für die Funktionskarte, die das Ampel-System selbst beschreibt. Ein
// Icon, das zeigt statt beschreibt, was die Funktion tut.
export function AmpelDots({ size = 22 }: { size?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-[3px] rounded-[3px] px-[5px] py-[6px]"
      style={{ background: "#14171a", width: size + 12, height: (size + 12) * 1.4 }}
      aria-hidden="true"
    >
      <span className="block rounded-full" style={{ width: size * 0.32, height: size * 0.32, background: "var(--mk-red)" }} />
      <span className="block rounded-full" style={{ width: size * 0.32, height: size * 0.32, background: "var(--mk-yellow)" }} />
      <span className="block rounded-full" style={{ width: size * 0.32, height: size * 0.32, background: "var(--mk-green)" }} />
    </div>
  );
}
