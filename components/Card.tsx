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
      className={`rounded-[2rem] bg-background border border-border/60 shadow-sm p-6 sm:p-8 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
