import Link from "next/link";
import { type Employee } from "@/lib/types";
import { QualiIcons } from "@/components/QualiIcons";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

// hrefBase erlaubt die Wiederverwendung unter /sifa/[companyId]/mitarbeiter/...
// (Web-Port Phase 5) -- ohne den Prop-Default bliebe der Link immer auf der
// Chef-Route hängen, deren useAppData() für eine SiFa leer wäre.
export function EmployeeCard({
  employee,
  hrefBase = "/mitarbeiter",
}: {
  employee: Employee;
  hrefBase?: string;
}) {
  const { id, vorname, nachname, kategorie, ampel, offenePunkte, qualifikationsIcons, fotoUrl } =
    employee;

  return (
    <Link
      href={`${hrefBase}/${id}`}
      className="uv-glass-panel btn-feedback text-left p-5 block transition-transform hover:-translate-y-0.5"
      style={{ ["--glow" as string]: ampel === "rot" ? "var(--uv-glow-amber, rgba(245,179,1,0.28))" : "var(--uv-glow-green, rgba(23,178,106,0.3))" }}
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
