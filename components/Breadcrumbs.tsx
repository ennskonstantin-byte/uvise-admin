import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  // Ohne href = aktuelle Seite (letztes Element, nicht anklickbar).
  href?: string;
};

// Wiederverwendbare Breadcrumb-Leiste: rendert sowohl die sichtbare
// Navigation als auch das passende BreadcrumbList-JSON-LD (schema.org) —
// serverseitig, kein "use client" nötig. Wird aus den Seiten-Items generiert
// (Startseite/Ratgeber-Übersicht + aktuelle Seite), nicht pro Seite von Hand
// gepflegt.
export function Breadcrumbs({
  items,
  className = "mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground/50",
  currentClassName = "text-foreground/70",
  linkClassName = "hover:text-foreground hover:underline underline-offset-4",
}: {
  items: BreadcrumbItem[];
  className?: string;
  currentClassName?: string;
  linkClassName?: string;
}) {
  const strukturierteDaten = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://www.uvise.de${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }}
      />
      <nav aria-label="Breadcrumb" className={className}>
        {items.map((item, i) => (
          <span key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link href={item.href} className={linkClassName}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={currentClassName}>
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
