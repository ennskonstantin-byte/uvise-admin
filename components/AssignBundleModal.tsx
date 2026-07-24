"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { useAppData } from "@/lib/store";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import type { Bundle } from "@/lib/types";

// Spiegelt die "Verteilen"-Funktion aus der Chef-App (assignBundle) --
// bisher gab es auf der Website keinen Weg, ein Bundle tatsächlich an
// Mitarbeiter zu verschicken (Runde-1-Audit, P1-03).
export function AssignBundleModal({
  bundle,
  onClose,
}: {
  bundle: Bundle;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
  const { employees, employeeTrainings, assignBundle } = useAppData();
  // Ein Mitarbeiter gilt als "bereits versorgt", wenn ihm schon JEDE
  // Unterweisung des Bundles zugewiesen ist -- teilweise zugewiesene
  // Mitarbeiter bleiben auswählbar, assignBundle() überspringt beim
  // Speichern intern nur die einzelnen, schon vorhandenen Kombinationen.
  const already = new Set(
    employees
      .filter((e) =>
        bundle.trainingIds.every((trainingId) =>
          employeeTrainings.some((et) => et.trainingId === trainingId && et.employeeId === e.id)
        )
      )
      .map((e) => e.id)
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeEmployees = employees
    .filter((e) => !e.archiviert)
    .filter((e) => `${e.vorname} ${e.nachname}`.toLowerCase().includes(query.toLowerCase()));

  function toggle(id: string) {
    if (already.has(id)) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await assignBundle(bundle.trainingIds, selected);
      setSentCount(selected.length);
      setTimeout(onClose, 1400);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Verteilen fehlgeschlagen. Bitte erneut versuchen."
      );
    } finally {
      setSaving(false);
    }
  }

  if (sentCount !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-background border border-border p-8 flex flex-col items-center text-center gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--ampel-green)" }}
          >
            <Check size={26} />
          </div>
          <p className="font-medium">
            „{bundle.name}" verschickt an {sentCount} {sentCount === 1 ? "Mitarbeiter" : "Mitarbeiter"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">„{bundle.name}" verteilen</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <p className="text-xs text-foreground/65 mb-3">
          Verteilt alle {bundle.trainingIds.length} Unterweisungen des Bundles an:
        </p>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/65" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mitarbeiter suchen…"
            className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-sm outline-none"
          />
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
          {activeEmployees.map((e) => {
            const has = already.has(e.id);
            const checked = selected.includes(e.id) || has;
            return (
              <label
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 ${
                  has ? "border-border bg-surface opacity-60" : "border-border cursor-pointer hover:border-foreground/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={has}
                  onChange={() => toggle(e.id)}
                />
                <EmployeeAvatar vorname={e.vorname} nachname={e.nachname} fotoUrl={e.fotoUrl} size={36} />
                <span className="text-sm">
                  {e.vorname} {e.nachname}
                  {has && <span className="text-foreground/65"> (bereits vollständig zugewiesen)</span>}
                </span>
              </label>
            );
          })}
          {activeEmployees.length === 0 && (
            <p className="text-sm text-foreground/65">
              {query ? "Keine Mitarbeiter gefunden." : "Keine Mitarbeiter vorhanden."}
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || selected.length === 0}
          className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Verteilt…" : "Verteilen"}
        </button>
      </div>
    </div>
  );
}
