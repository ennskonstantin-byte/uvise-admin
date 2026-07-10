// Qualifikations-Icons als kleine runde Plaketten neben dem Namen.
// Zeigt bis zu `max` Icons, danach einen "+N"-Zähler für den Rest.
export function QualiIcons({ icons, max = 3 }: { icons: string[]; max?: number }) {
  if (icons.length === 0) return null;
  const shown = icons.slice(0, max);
  const rest = icons.length - shown.length;
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${icons.length} Qualifikation(en)`}>
      {shown.map((ic, i) => (
        <span
          key={i}
          className="h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center text-base shrink-0"
        >
          {ic}
        </span>
      ))}
      {rest > 0 && (
        <span className="h-7 min-w-7 px-1.5 rounded-full bg-background border border-border flex items-center justify-center text-[11px] font-semibold text-foreground/60 shrink-0">
          +{rest}
        </span>
      )}
    </span>
  );
}
