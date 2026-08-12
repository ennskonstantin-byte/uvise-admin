"use client";

// Chef-Einstellungen-Sektion "SiFa-Zugang" (Web-Port von Phase 5/App,
// mirror chef/components/SifaZugangSection.tsx). Eigene, direkte
// Supabase-Aufrufe statt useAppData() -- diese Daten (sifa_code,
// sifa_grants) gehören nicht zum großen Firmen-Datensatz und werden nur
// hier gebraucht. Der Chef hat keinen RLS-Lesezugriff auf sifa_profiles
// anderer Nutzer, deshalb bleiben die Anzeigenamen bewusst generisch.
import { useCallback, useEffect, useState } from "react";
import { Copy, RefreshCw, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";

type Grant = { id: string; status: "angefragt" | "freigegeben"; requestedAt: string };

export function SifaZugangSection({ companyId }: { companyId: string }) {
  const { showToast, ToastView } = useToast();
  const [sifaCode, setSifaCode] = useState<string | null>(null);
  const [pending, setPending] = useState<Grant[]>([]);
  const [approved, setApproved] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<Grant | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: companyRow }, { data: grantRows }] = await Promise.all([
      supabase.from("companies").select("sifa_code").eq("id", companyId).single(),
      supabase
        .from("sifa_grants")
        .select("id, status, requested_at")
        .eq("company_id", companyId)
        .neq("status", "entfernt")
        .order("requested_at", { ascending: false }),
    ]);
    setSifaCode(companyRow?.sifa_code ?? null);
    const rows = (grantRows ?? []).map((g: any) => ({ id: g.id, status: g.status, requestedAt: g.requested_at }));
    setPending(rows.filter((g) => g.status === "angefragt"));
    setApproved(rows.filter((g) => g.status === "freigegeben"));
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegenerate() {
    setConfirmRegenerate(false);
    setRegenerating(true);
    try {
      const { data, error } = await supabase.rpc("regenerate_sifa_code", { p_company_id: companyId });
      if (error) throw error;
      setSifaCode(data as string);
      showToast("Neuer SiFa-Code erzeugt, alter ist ungültig.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Konnte keinen neuen Code erzeugen.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      const { error } = await supabase.rpc("approve_sifa_grant", { p_grant_id: id });
      if (error) throw error;
      await load();
      showToast("SiFa freigegeben.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Freigeben fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(grant: Grant) {
    setConfirmRevoke(null);
    setBusyId(grant.id);
    try {
      const { error } = await supabase.rpc("reject_sifa_grant", { p_grant_id: grant.id });
      if (error) throw error;
      await load();
      showToast(grant.status === "angefragt" ? "Anfrage abgelehnt." : "Zugriff entfernt.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 mb-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">SiFa-Code dieser Firma</p>
          <p className="text-xs text-foreground/65 font-mono truncate">{loading ? "Lädt…" : sifaCode ?? "—"}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              if (sifaCode) {
                navigator.clipboard.writeText(sifaCode);
                showToast("SiFa-Code kopiert");
              }
            }}
            disabled={!sifaCode}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:border-foreground/30 disabled:opacity-40"
          >
            <Copy size={14} />
            Kopieren
          </button>
          <button
            onClick={() => setConfirmRegenerate(true)}
            disabled={regenerating}
            title="Alten Code widerrufen und einen neuen erzeugen — z.B. wenn er versehentlich weitergegeben wurde."
            className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:border-foreground/30 disabled:opacity-40"
          >
            <RefreshCw size={14} />
            Neu erzeugen
          </button>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-foreground/65 mb-2">Offene Anfragen</p>
          <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {pending.map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">SiFa-Anfrage</p>
                  <p className="text-xs text-foreground/65">angefragt am {new Date(g.requestedAt).toLocaleDateString("de-DE")}</p>
                </div>
                <button
                  onClick={() => handleApprove(g.id)}
                  disabled={busyId === g.id}
                  className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 text-white disabled:opacity-50"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  <Check size={12} />
                  Freigeben
                </button>
                <button
                  onClick={() => setConfirmRevoke(g)}
                  disabled={busyId === g.id}
                  className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border text-red-600 hover:border-red-300 disabled:opacity-50"
                >
                  <X size={12} />
                  Ablehnen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-foreground/65 mb-2">Freigegebene SiFa ({approved.length})</p>
        <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {approved.map((g) => (
            <div key={g.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Freigegebene SiFa</p>
                <p className="text-xs text-foreground/65">seit {new Date(g.requestedAt).toLocaleDateString("de-DE")}</p>
              </div>
              <button
                onClick={() => setConfirmRevoke(g)}
                disabled={busyId === g.id}
                className="text-xs rounded-full px-3 py-1.5 border border-border text-red-600 hover:border-red-300 disabled:opacity-50"
              >
                Zugriff entfernen
              </button>
            </div>
          ))}
          {approved.length === 0 && !loading && (
            <p className="px-4 py-4 text-sm text-foreground/65">Noch keine SiFa freigegeben.</p>
          )}
        </div>
      </div>

      {confirmRegenerate && (
        <ConfirmModal
          title="Neuen SiFa-Code erzeugen"
          message="Der bisherige Code funktioniert danach nicht mehr — bereits freigegebene SiFa behalten ihren Zugriff, aber niemand kann sich mehr mit dem alten Code neu anfragen."
          confirmLabel="Neu erzeugen"
          onConfirm={handleRegenerate}
          onClose={() => setConfirmRegenerate(false)}
        />
      )}
      {confirmRevoke && (
        <ConfirmModal
          title={confirmRevoke.status === "angefragt" ? "Anfrage ablehnen" : "Zugriff entfernen"}
          message={
            confirmRevoke.status === "angefragt"
              ? "Diese Anfrage wirklich ablehnen?"
              : "Zugriff dieser SiFa wirklich entfernen? Sie sieht die Firma danach nicht mehr."
          }
          confirmLabel={confirmRevoke.status === "angefragt" ? "Ablehnen" : "Entfernen"}
          danger
          onConfirm={() => handleReject(confirmRevoke)}
          onClose={() => setConfirmRevoke(null)}
        />
      )}
      <ToastView />
    </div>
  );
}
