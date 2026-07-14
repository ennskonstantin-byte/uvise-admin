"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { LogoMark } from "@/components/Logo";
import { useAppData } from "@/lib/store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuOffen, setMenuOffen] = useState(false);
  const { company } = useAppData();
  const pathname = usePathname();

  // Beim Seitenwechsel das mobile Menü automatisch schließen.
  useEffect(() => {
    setMenuOffen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* Breite Bildschirme: feste Seitenleiste */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Schmale Bildschirme (Handy/Tablet hochkant): Kopfzeile mit ☰ */}
      <header
        className="lg:hidden fixed inset-x-0 top-0 z-40 flex items-center gap-3 px-4 h-14 text-white"
        style={{ background: "linear-gradient(90deg, var(--sidebar-from), var(--sidebar-to))" }}
      >
        <button
          onClick={() => setMenuOffen(true)}
          aria-label="Menü öffnen"
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
        <Link href="/dashboard" aria-label="Zum Dashboard" className="flex items-center gap-3 min-w-0">
          <LogoMark size={28} />
          <span className="font-semibold text-sm truncate">{company?.name ?? "uVise"}</span>
        </Link>
      </header>

      {menuOffen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="relative h-full overflow-y-auto">
            <Sidebar />
            <button
              onClick={() => setMenuOffen(false)}
              aria-label="Menü schließen"
              className="absolute top-4 right-3 p-1.5 rounded-lg text-white/80 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
          {/* Abgedunkelter Rest der Seite — Tippen schließt das Menü */}
          <button
            aria-label="Menü schließen"
            onClick={() => setMenuOffen(false)}
            className="flex-1 bg-black/50"
          />
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pt-20 lg:pt-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
