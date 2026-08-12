"use client";

// Pendant zu components/Sidebar.tsx für den SiFa-Bereich (Web-Port von
// Phase 5/App, mirror chef/SifaRoot.tsx NAV_OUTER/NAV_INNER). Zwei
// Zustände: außerhalb einer Firma (Meine Firmen/Archiv/Abmelden) und
// innerhalb einer gewählten Firma (dieselben Menüpunkte wie die normale
// Chef-Sidebar, bewusst OHNE Einstellungen -- das ist keine SiFa-Sache).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAppData } from "@/lib/store";
import { LogoMark } from "@/components/Logo";
import { Icon3D } from "@/components/Icon3D";
import type { IconKey } from "@/lib/icons";

const NAV_OUTER: { label: string; href: string; icon: IconKey }[] = [
  { label: "Meine Firmen", href: "/sifa", icon: "firma" },
  { label: "Archiv", href: "/sifa/archiv", icon: "archiv" },
];

export function SifaSidebar({
  mode,
  companyId,
  companyName,
}: {
  mode: "outer" | "inner";
  companyId?: string;
  companyName?: string;
}) {
  const pathname = usePathname();
  const { questions, signOut } = useAppData();
  const openQuestions = mode === "inner" ? questions.filter((q) => q.status === "offen").length : 0;

  const navInner: { label: string; href: string; icon: IconKey }[] = companyId
    ? [
        { label: "Dashboard", href: `/sifa/${companyId}/dashboard`, icon: "dashboard" },
        { label: "Mitarbeiter", href: `/sifa/${companyId}/mitarbeiter`, icon: "mitarbeiter" },
        { label: "Unterweisungen", href: `/sifa/${companyId}/unterweisungen`, icon: "unterweisungen" },
        { label: "Qualifikationen", href: `/sifa/${companyId}/qualifikationen`, icon: "qualifikation" },
        { label: "Rückfragen", href: `/sifa/${companyId}/rueckfragen`, icon: "rueckfragen" },
        { label: "Archiv", href: `/sifa/${companyId}/archiv`, icon: "archiv" },
      ]
    : [];

  return (
    <aside
      className="uv-glass-panel w-64 shrink-0 flex flex-col text-white overflow-hidden sticky top-0 h-[calc(100vh-1.5rem)] my-3"
      style={{
        ["--glow" as string]: "var(--uv-glow-navy, rgba(18,48,126,0.55))",
        borderRadius: "24px",
      }}
    >
      <Link href="/sifa" className="px-6 py-6 flex items-center gap-3">
        <div className="shrink-0">
          <LogoMark size={40} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-tight truncate">
            {mode === "inner" ? companyName ?? "Firma" : "Meine Firmen"}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/50">
            {mode === "inner" ? "Du arbeitest als SiFa" : "uVise · SiFa"}
          </p>
        </div>
      </Link>

      {mode === "inner" && (
        <Link
          href="/sifa"
          className="btn-feedback flex items-center gap-2 mx-3 mb-2 rounded-full px-4 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={14} />
          Zurück zu meinen Firmen
        </Link>
      )}

      <nav className="flex-1 px-3 space-y-1">
        {(mode === "outer" ? NAV_OUTER : navInner).map(({ label, href, icon }) => {
          const active = pathname === href || (href !== "/sifa" && pathname?.startsWith(href));
          const badge = label === "Rückfragen" ? openQuestions : undefined;
          return (
            <Link
              key={label}
              href={href}
              className={`btn-feedback w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                active ? "uv-glass-tile font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              style={
                active
                  ? { ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "9999px" }
                  : undefined
              }
            >
              <Icon3D name={icon} size="sm" />
              <span className="flex-1 text-left">{label}</span>
              {!!badge && (
                <span className="rounded-full bg-red-600 text-white px-2 py-0.5 text-xs font-bold min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={async () => {
          if (!confirm("Möchtest du dich wirklich abmelden?")) return;
          await signOut();
          window.location.assign("/");
        }}
        className="flex items-center gap-3 mx-3 mb-2 rounded-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
      >
        <LogOut size={18} />
        Abmelden
      </button>

      <nav aria-label="Rechtliches" className="flex justify-center gap-3 pb-4 text-[11px] text-white/40">
        <Link href="/impressum" className="hover:text-white/80">Impressum</Link>
        <Link href="/datenschutz" className="hover:text-white/80">Datenschutz</Link>
        <Link href="/agb" className="hover:text-white/80">AGB</Link>
      </nav>
    </aside>
  );
}
