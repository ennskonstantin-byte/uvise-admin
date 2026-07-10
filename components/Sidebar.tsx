"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  MessageCircleQuestion,
  Archive,
  Settings,
  LogOut,
} from "lucide-react";
import { useAppData } from "@/lib/store";
import { LogoMark } from "@/components/Logo";
import { Switch } from "@/components/Switch";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Mitarbeiter", href: "/mitarbeiter", icon: Users },
  { label: "Unterweisungen", href: "/unterweisungen", icon: FileText },
  { label: "Qualifikationen", href: "/qualifikationen", icon: Clock },
  { label: "Rückfragen", href: "/rueckfragen", icon: MessageCircleQuestion },
  { label: "Archiv", href: "/archiv", icon: Archive },
  { label: "Einstellungen", href: "/einstellungen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { questions, company, signOut } = useAppData();
  const openQuestions = questions.filter((q) => q.status === "offen").length;
  const companyName = company?.name ?? "SicherAkte";

  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
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
      <Link href="/" className="px-6 py-6 flex items-center gap-3">
        <div className="shrink-0">
          {company?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt="Firmenlogo"
              className="h-10 w-10 rounded-xl object-cover bg-white/10"
            />
          ) : (
            <LogoMark size={40} />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-tight truncate">
            {companyName}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/50">
            uVise
          </p>
        </div>
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between mx-3 mb-2 px-4 py-2.5 text-sm text-white/70">
        <span className="flex items-center gap-2">{dark ? "🌙" : "☀️"} Dunkles Design</span>
        <Switch checked={dark} onChange={toggleTheme} label="Dunkles Design umschalten" inactiveColor="rgba(255,255,255,0.25)" />
      </div>

      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 mx-3 mb-2 rounded-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>

      <div className="p-4 mx-3 mb-2 rounded-2xl bg-white/5 text-xs text-white/70">
        <p className="font-medium text-white">Testphase: 4 Tage übrig</p>
        <p className="mt-1">Wähle jetzt dein Abo, um nahtlos weiterzumachen.</p>
      </div>

      <nav aria-label="Rechtliches" className="flex justify-center gap-3 pb-4 text-[11px] text-white/40">
        <Link href="/impressum" className="hover:text-white/80">Impressum</Link>
        <Link href="/datenschutz" className="hover:text-white/80">Datenschutz</Link>
        <Link href="/agb" className="hover:text-white/80">AGB</Link>
      </nav>
    </aside>
  );
}
