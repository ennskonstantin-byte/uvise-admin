"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  MessageCircleQuestion,
  Archive,
  Settings,
  LogOut,
  BarChart3,
  Megaphone,
  Handshake,
  Gauge,
} from "lucide-react";
import { useAppData } from "@/lib/store";
import { LogoMark } from "@/components/Logo";
import { Switch } from "@/components/Switch";
import { isOwnerEmail } from "@/lib/owner";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mitarbeiter", href: "/mitarbeiter", icon: Users },
  { label: "Unterweisungen", href: "/unterweisungen", icon: FileText },
  { label: "Qualifikationen", href: "/qualifikationen", icon: Clock },
  { label: "Rückfragen", href: "/rueckfragen", icon: MessageCircleQuestion },
  { label: "Archiv", href: "/archiv", icon: Archive },
  { label: "Einstellungen", href: "/einstellungen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { questions, company, session, signOut } = useAppData();
  const openQuestions = questions.filter((q) => q.status === "offen").length;
  const companyName = company?.name ?? "uVise";
  // Betreiber-Ansichten (Besucherstatistik) nur für die Betreiber-Logins zeigen —
  // der Server prüft die Berechtigung zusätzlich selbst.
  const istBetreiber = isOwnerEmail(session?.user?.email);

  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDark(
      el.classList.contains("dark") ||
        (!el.classList.contains("light") && systemPrefersDark)
    );
  }, []);

  function toggleTheme(nextDark: boolean) {
    setDark(nextDark);
    const mode = nextDark ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    localStorage.setItem("uvise-theme", mode);
  }

  return (
    <aside
      className="w-64 shrink-0 flex flex-col text-white rounded-r-3xl overflow-hidden sticky top-0 h-screen"
      style={{
        background:
          "linear-gradient(180deg, var(--sidebar-from), var(--sidebar-to))",
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
          ...NAV_ITEMS,
          ...(istBetreiber
            ? [
                { label: "Überwachung", href: "/ueberwachung", icon: Gauge },
                { label: "Statistik", href: "/statistik", icon: BarChart3 },
                { label: "Marketing", href: "/marketing", icon: Megaphone },
                { label: "Partner", href: "/partner-verwaltung", icon: Handshake },
              ]
            : []),
        ].map(({ label, href, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          const badge = label === "Rückfragen" ? openQuestions : undefined;
          return (
            <Link
              key={label}
              href={href}
              className={`btn-feedback w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
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

      <div className="flex items-center justify-between mx-3 mb-2 px-4 py-2.5 text-sm text-white/70">
        <span className="flex items-center gap-2">
          {dark ? "🌙 Dunkles Design" : "☀️ Helles Design"}
        </span>
        <Switch checked={dark} onChange={toggleTheme} label="Dunkles Design umschalten" inactiveColor="rgba(255,255,255,0.25)" />
      </div>

      <button
        onClick={async () => {
          await signOut();
          router.push("/");
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
