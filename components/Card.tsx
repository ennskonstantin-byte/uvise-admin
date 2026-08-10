export function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`uv-glass-panel p-6 sm:p-8 ${className}`}
      style={{ ["--glow" as string]: "var(--uv-glow-blue, rgba(10,108,255,0.38))", ...style }}
    >
      {children}
    </div>
  );
}
