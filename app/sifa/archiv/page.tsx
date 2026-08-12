"use client";

// SiFa-Archiv Ebene 0 (Web-Port von Phase 5/App, Ansicht 30, mirror
// chef/components/SifaArchivScreen.tsx): "Erst Firma, dann Jahr" -- diese
// Seite ist nur der Firmen-Picker, danach übernimmt die normale,
// firmen-gescopte Archiv-Seite unter /sifa/[companyId]/archiv.
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store";
import { useSifaProfile } from "@/lib/useSifaProfile";
import { SifaShell } from "@/components/SifaShell";
import { Card } from "@/components/Card";
import { Icon3D } from "@/components/Icon3D";

export default function SifaArchivAuswahlPage() {
  const router = useRouter();
  const { session } = useAppData();
  const sifa = useSifaProfile(session);
  const freigegeben = sifa.grants.filter((g) => g.status === "freigegeben");

  return (
    <SifaShell mode="outer">
      <h1 className="text-2xl font-semibold mb-1">Archiv</h1>
      <p className="text-sm text-foreground/60 mb-6">
        Erst Firma wählen, danach das Jahr — dieselbe Jahres-Ordner-Ansicht wie im Chef-Archiv.
      </p>

      <Card>
        <div className="flex flex-col gap-2.5">
          {freigegeben.map((g) => (
            <button
              key={g.id}
              onClick={() => router.push(`/sifa/${g.companyId}/archiv`)}
              className="btn-feedback flex items-center gap-4 rounded-2xl border border-border bg-background px-5 py-3.5 text-left hover:bg-surface"
            >
              <Icon3D name="firma" size="md" />
              <p className="flex-1 min-w-0 font-medium truncate">{g.companyName}</p>
            </button>
          ))}
          {freigegeben.length === 0 && !sifa.loading && (
            <p className="text-sm text-foreground/65 text-center py-6">Noch keine freigegebene Firma.</p>
          )}
        </div>
      </Card>
    </SifaShell>
  );
}
