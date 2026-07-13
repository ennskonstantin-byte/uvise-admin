import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/mitarbeiter",
        "/unterweisungen",
        "/qualifikationen",
        "/rueckfragen",
        "/archiv",
        "/einstellungen",
        "/api/",
      ],
    },
    sitemap: "https://www.uvise.de/sitemap.xml",
  };
}
