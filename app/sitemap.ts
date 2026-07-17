import type { MetadataRoute } from "next";
import { ARTIKEL } from "./ratgeber/artikel";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.uvise.de";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ratgeber`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // Ratgeber-Artikel automatisch aus der Liste in app/ratgeber/page.tsx —
    // neuer Artikel dort eintragen, Sitemap zieht nach.
    ...ARTIKEL.map((a) => ({
      url: `${base}/ratgeber/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${base}/impressum`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/datenschutz`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/agb`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
