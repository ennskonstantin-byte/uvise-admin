"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useAppData } from "@/lib/store";
import type { Training } from "@/lib/mockData";

// Spiegelt die "Verteilen"-Funktion aus der Chef-App — bisher gab es auf der
// Website keinen Weg, eine bereits bestehende Unterweisung nachträglich
// einem bestehenden Mitarbeiter zuzuweisen.
export function AssignTrainingModal({
  training,
  onClose,
}: {
  training: Training;
  onClose: () => void;
}) {
  const { employees, employeeTrainings, assignTraining } = useAppData();
  const already = new Set(
    employeeTrainings.filter((et) => et.trainingId === training.id).map((et) => et.employeeId)
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const activeEmployees = employees
    .filter((e) => !e.archiviert)
    .filter((e) => `${e.vorname} ${e.nachname}`.toLowerCase().includes(query.toLowerCase()));

  function toggle(id: string) {
    if (already.has(id)) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await assignTraining(training.id, selected);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">„{training.name}" verteilen</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        <p className="text-xs text-foreground/65 mb-3">An welche Mitarbeiter?</p>
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
                <span className="text-sm">
                  {e.vorname} {e.nachname}
                  {has && <span className="text-foreground/65"> (bereits zugewiesen)</span>}
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
