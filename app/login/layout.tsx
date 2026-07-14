import type { Metadata } from "next";

// Die Login-/Admin-Seite soll NICHT in Google-Suchergebnissen auftauchen —
// sie ist nur für Kunden gedacht, nicht für die öffentliche Suche. "noindex"
// sorgt dafür, dass Google diesen Eintrag ("uVise Admin") wieder entfernt.
export const metadata: Metadata = {
  title: "Anmelden",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
