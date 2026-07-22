import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { AppDataProvider } from "@/lib/store";
import { AuthGate } from "@/components/AuthGate";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Nur von der öffentlichen Landingpage genutzt (siehe globals.css, .mk-display
// / .mk-mono) — eigene, kräftigere Typografie für die Marketing-Seite, ohne
// das Dashboard anzufassen, das weiterhin durchgängig Inter verwendet.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-mk-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-mk-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.uvise.de"),
  title: "uVise Admin",
  description: "Verwaltung von Mitarbeiter-Unterweisungen und Qualifikationen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Gespeicherte Darstellung (hell/dunkel) vor dem ersten Rendern anwenden */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("uvise-theme");if(t==="dark"||t==="light"){document.documentElement.classList.add(t);}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppDataProvider>
          <AuthGate>{children}</AuthGate>
        </AppDataProvider>
      </body>
    </html>
  );
}
