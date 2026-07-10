export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="text-foreground/60 mt-1 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
