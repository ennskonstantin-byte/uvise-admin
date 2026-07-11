import Link from "next/link";
import { type Employee } from "@/lib/mockData";
import { QualiIcons } from "@/components/QualiIcons";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

export function EmployeeCard({ employee }: { employee: Employee }) {
  const { id, vorname, nachname, kategorie, ampel, offenePunkte, qualifikationsIcons, fotoUrl } =
    employee;

  return (
    <Link
      href={`/mitarbeiter/${id}`}
      className="btn-feedback text-left rounded-3xl border border-border bg-surface p-5 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between">
        <div className="relative">
          <EmployeeAvatar vorname={vorname} nachname={nachname} fotoUrl={fotoUrl} size={56} />
          {offenePunkte > 0 && (
            <div className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center">
              {offenePunkte}
            </div>
          )}
        </div>

        <span
          className="h-3 w-3 rounded-full mt-1"
          style={{
            background:
              ampel === "rot" ? "var(--ampel-red)" : "var(--ampel-green)",
          }}
        />
      </div>

      <p className="mt-4 font-medium">
        {vorname} {nachname}
      </p>
      <p className="text-sm text-foreground/60">{kategorie}</p>
      {qualifikationsIcons.length > 0 && (
        <div className="mt-2">
          <QualiIcons icons={qualifikationsIcons} />
        </div>
      )}
    </Link>
  );
}
