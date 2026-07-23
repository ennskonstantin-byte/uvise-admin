"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { SuccessOverlay, SUCCESS_OVERLAY_MS } from "@/components/SuccessOverlay";
import type { Employee } from "@/lib/types";

// Umgekehrte Blickrichtung zu AssignTrainingModal: hier startet man beim
// Mitarbeiter und wählt aus, welche noch fehlenden Unterweisungen er/sie
// bekommen soll.
export function AssignTrainingToEmployeeModal({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
  const { trainings, employeeTrainings, assignTraining } = useAppData();
  const alreadyIds = new Set(
    employeeTrainings.filter((et) => et.employeeId === employee.id).map((et) => et.trainingId)
  );
  const available = trainings.filter((t) => !alreadyIds.has(t.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      for (const trainingId of selected) {
        await assignTraining(trainingId, [employee.id]);
      }
      setDone(true);
      setTimeout(onClose, SUCCESS_OVERLAY_MS);
    } catch {
      setError("Zuweisen fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <SuccessOverlay
        message={`${selected.length} Unterweisung(en) für ${employee.vorname} zugewiesen.`}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Unterweisung für {employee.vorname} zuweisen
          </h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
          {available.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border px-4 py-2.5 cursor-pointer hover:border-foreground/30"
            >
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span className="text-sm">
                {t.icon} {t.name}
              </span>
            </label>
          ))}
          {available.length === 0 && (
            <p className="text-sm text-foreground/65">
              Alle vorhandenen Unterweisungen sind bereits zugewiesen.
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || selected.length === 0}
          className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Weist zu…" : "Zuweisen"}
        </button>
      </div>
    </div>
  );
}
