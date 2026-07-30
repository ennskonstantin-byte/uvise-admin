// Reine Share-Links als <a>-Tags — kein Drittanbieter-Widget, kein
// Tracking-Skript (DSGVO-freundlich). Rein serverseitig renderbar: URL und
// Titel kommen als Props rein, kein window/document nötig.
const SHARE_LINKS = (url: string, title: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return [
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "E-Mail",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];
};

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const links = SHARE_LINKS(url, title);
  return (
    <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-border">
      <span className="text-sm text-foreground/50">Teilen:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          {...(l.label !== "E-Mail" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
