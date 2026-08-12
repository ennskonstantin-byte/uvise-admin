"use client";

// "Meine Firmen" (Web-Port von Phase 5/App, Ansicht 29, mirror
// chef/components/MeineFirmenScreen.tsx). Landing-Seite für SiFa-Konten.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/store";
import { useSifaProfile } from "@/lib/useSifaProfile";
import { SifaShell } from "@/components/SifaShell";
import { Card } from "@/components/Card";
import { Icon3D } from "@/components/Icon3D";

type FirmaStat = { mitarbeiter: number; quote: number | null };

function ampelColor(quote: number | null): string {
  if (quote === null) return "var(--foreground)";
  if (quote >= 80) return "var(--ampel-green)";
  if (quote >= 50) return "#f59e0b";
  return "var(--ampel-red)";
}

export default function MeineFirmenPage() {
  const router = useRouter();
  const { session } = useAppData();
  const sifa = useSifaProfile(session);
  const [stats, setStats] = useState<Record<string, FirmaStat>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const freigegeben = sifa.grants.filter((g) => g.status === "freigegeben");
  const wartend = sifa.grants.filter((g) => g.status === "angefragt");

  useEffect(() => {
    if (sifa.loading) return;
    if (!sifa.profile) {
      router.replace("/sifa/onboarding");
      return;
    }
    if (!sifa.profile.onboardingCompletedAt) {
      router.replace("/sifa/onboarding");
    }
  }, [sifa.loading, sifa.profile, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: Record<string, FirmaStat> = {};
      for (const g of freigegeben) {
        const { data: employeeRows } = await supabase.from("employees").select("id").eq("company_id", g.companyId);
        const employeeIds = (employeeRows ?? []).map((e: any) => e.id);
        if (employeeIds.length === 0) {
          results[g.companyId] = { mitarbeiter: 0, quote: null };
          continue;
        }
        const { data: etRows } = await supabase
          .from("employee_trainings")
          .select("status")
          .in("employee_id", employeeIds)
          .neq("status", "anonymisiert");
        const gesamt = etRows?.length ?? 0;
        const signiert = (etRows ?? []).filter((r: any) => r.status === "signiert").length;
        results[g.companyId] = {
          mitarbeiter: employeeIds.length,
          quote: gesamt > 0 ? Math.round((signiert / gesamt) * 100) : null,
        };
      }
      if (!cancelled) setStats(results);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freigegeben.map((g) => g.id).join(",")]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      await sifa.requestAccess(code.trim());
      setCode("");
      setShowAdd(false);
    } catch (err) {
      setAddError(
        err instanceof Error && err.message.toLowerCase().includes("nicht gefunden")
          ? "Code ungültig oder unbekannt."
          : err instanceof Error
            ? err.message
            : "Code ungültig oder unbekannt."
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <SifaShell mode="outer">
      <h1 className="text-2xl font-semibold mb-1">Meine Firmen</h1>
      <p className="text-sm text-foreground/60 mb-6">
        Klick auf eine Firma öffnet deren Chef-Dashboard — du arbeitest dann in dieser Firma.
      </p>

      <Card>
        <div className="flex flex-col gap-2.5">
          {freigegeben.map((g) => {
            const s = stats[g.companyId];
            return (
              <button
                key={g.id}
                onClick={() => router.push(`/sifa/${g.companyId}/dashboard`)}
                className="btn-feedback flex items-center gap-4 rounded-2xl border border-border bg-background px-5 py-3.5 text-left hover:bg-surface"
              >
                <Icon3D name="firma" size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{g.companyName}</p>
                  <p className="text-xs text-foreground/65">{s ? `${s.mitarbeiter} Mitarbeiter` : "Lädt…"}</p>
                </div>
                {s?.quote !== null && s?.quote !== undefined && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ color: ampelColor(s.quote), border: `1px solid ${ampelColor(s.quote)}` }}
                  >
                    {s.quote}% Rücklauf
                  </span>
                )}
              </button>
            );
          })}

          {wartend.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-4 rounded-2xl border border-dashed border-border px-5 py-3.5 opacity-70"
            >
              <Icon3D name="wartetAufFreigabe" size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{g.companyName}</p>
                <p className="text-xs text-foreground/65">Wartet auf Freigabe</p>
              </div>
            </div>
          ))}

          {freigegeben.length === 0 && wartend.length === 0 && !sifa.loading && (
            <p className="text-sm text-foreground/65 text-center py-6">
              Noch keine Firma hinzugefügt. Frag deinen Ansprechpartner nach dem SiFa-Code der Firma.
            </p>
          )}
        </div>

        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full mt-5 rounded-full px-5 py-2.5 text-sm font-medium border border-border hover:border-foreground/30"
          >
            + Firma hinzufügen
          </button>
        ) : (
          <form onSubmit={handleAdd} className="mt-5 flex flex-col gap-3">
            {addError && <p className="text-sm text-red-600 rounded-2xl bg-red-500/10 px-4 py-2">{addError}</p>}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SiFa-Code der Firma"
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding || code.trim() === ""}
                className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--accent-gradient)" }}
              >
                {adding ? "Sendet…" : "Anfragen"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setAddError(null);
                }}
                className="rounded-full px-5 py-2.5 text-sm border border-border hover:border-foreground/30"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}
      </Card>
    </SifaShell>
  );
}
