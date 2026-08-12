"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Megaphone,
  Handshake,
  Gauge,
  LogOut,
} from "lucide-react";
import { useAppData } from "@/lib/store";
import { LogoMark } from "@/components/Logo";
import { isOwnerEmail } from "@/lib/owner";
import { countRecentlySigned } from "@/lib/recentlySigned";
import { Icon3D } from "@/components/Icon3D";
import type { IconKey } from "@/lib/icons";

const NAV_ITEMS: { label: string; href: string; icon: IconKey }[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Mitarbeiter", href: "/mitarbeiter", icon: "mitarbeiter" },
  { label: "Unterweisungen", href: "/unterweisungen", icon: "unterweisungen" },
  { label: "Qualifikationen", href: "/qualifikationen", icon: "qualifikation" },
  { label: "Rückfragen", href: "/rueckfragen", icon: "rueckfragen" },
  { label: "Archiv", href: "/archiv", icon: "archiv" },
  { label: "Einstellungen", href: "/einstellungen", icon: "einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { questions, employeeTrainings, company, session, signOut } = useAppData();
  const openQuestions = questions.filter((q) => q.status === "offen").length;
  // Wie viele Nachweise in den letzten Tagen signiert zurückkamen und noch
  // nicht gedruckt/archiviert wurden -- damit man im Archiv sieht, "wo es
  // leuchtet", statt jeden Mitarbeiter einzeln durchzuklicken.
  const recentlySignedCount = countRecentlySigned(employeeTrainings);
  const companyName = company?.name ?? "uVise";
  // Betreiber-Ansichten (Besucherstatistik) nur für die Betreiber-Logins zeigen —
  // der Server prüft die Berechtigung zusätzlich selbst.
  const istBetreiber = isOwnerEmail(session?.user?.email);

  // Die Chef-Oberfläche trägt jetzt durchgehend das dunkle Glas-3D-Design
  // (STYLE.md) — kein Hell/Dunkel-Umschalter mehr, genau wie in der App.
  useEffect(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <aside
      className="uv-glass-panel w-64 shrink-0 flex flex-col text-white overflow-hidden sticky top-0 h-[calc(100vh-1.5rem)] my-3"
      style={{
        ["--glow" as string]: "var(--uv-glow-navy, rgba(18,48,126,0.55))",
        borderRadius: "24px",
      }}
    >
      <Link href="/dashboard" className="px-6 py-6 flex items-center gap-3">
        <div className="shrink-0">
          <LogoMark size={40} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-tight truncate">
            {companyName}
          </p>
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50">
            {company?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt="Firmenlogo"
                className="h-3.5 w-3.5 rounded object-cover bg-white/10"
              />
            )}
            uVise
          </p>
        </div>
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {[
          ...NAV_ITEMS.map((it) => ({ ...it, kind: "i3d" as const })),
          ...(istBetreiber
            ? [
                { label: "Überwachung", href: "/ueberwachung", icon: Gauge, kind: "lucide" as const },
                { label: "Statistik", href: "/statistik", icon: BarChart3, kind: "lucide" as const },
                { label: "Marketing", href: "/marketing", icon: Megaphone, kind: "lucide" as const },
                { label: "Partner", href: "/partner-verwaltung", icon: Handshake, kind: "lucide" as const },
              ]
            : []),
        ].map(({ label, href, icon, kind }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          const badge =
            label === "Rückfragen"
              ? openQuestions
              : label === "Archiv"
                ? recentlySignedCount
                : undefined;
          const LucideIcon = kind === "lucide" ? icon : null;
          return (
            <Link
              key={label}
              href={href}
              className={`btn-feedback w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "uv-glass-tile font-medium text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              style={
                active
                  ? { ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "9999px" }
                  : undefined
              }
            >
              {kind === "i3d" ? <Icon3D name={icon} size="sm" /> : LucideIcon && <LucideIcon size={18} />}
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
          // Immer erst fragen — ein versehentlicher Klick soll niemanden
          // aus dem Dashboard werfen.
          if (!confirm("Möchtest du dich wirklich abmelden?")) return;
          // Harte Navigation statt router.push: sobald signOut() die Sitzung
          // beendet, würde die noch aktive Dashboard-Seite kurz das
          // Login-Formular zeigen, BEVOR die Weiterleitung zur Startseite
          // greift ("erst Anmelde-Feld, dann rausgeschmissen"). Ein voller
          // Seitenwechsel reißt den alten Baum sofort ab, ohne diesen
          // Zwischenzustand jemals zu rendern.
          await signOut();
          window.location.assign("/");
        }}
        className="flex items-center gap-3 mx-3 mb-2 rounded-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>

      <nav aria-label="Rechtliches" className="flex justify-center gap-3 pb-4 text-[11px] text-white/40">
        <Link href="/impressum" className="hover:text-white/80">Impressum</Link>
        <Link href="/datenschutz" className="hover:text-white/80">Datenschutz</Link>
        <Link href="/agb" className="hover:text-white/80">AGB</Link>
      </nav>
    </aside>
  );
}
