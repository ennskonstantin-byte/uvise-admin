"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";
import { QUALIFICATION_PRESETS } from "@/lib/mockData";
import { DateSelect } from "@/components/DateSelect";

export function NewQualificationModal({ onClose }: { onClose: () => void }) {
  const { employees, addQualification } = useAppData();
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [ablaufdatum, setAblaufdatum] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await addQualification({
        employeeId,
        name,
        ablaufdatum: ablaufdatum || null,
      });
      onClose();
    } catch {
      setError("Speichern fehlgeschlagen. Bist du als Beauftragte/r eingeloggt?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Qualifikation hinzufügen</h2>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/50 mb-1">Mitarbeiter</p>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            >
              <option value="">Bitte wählen…</option>
              {employees.filter((e) => !e.archiviert).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.vorname} {e.nachname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs text-foreground/50 mb-2">Qualifikation</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eigene Qualifikation frei eingeben…"
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
            <p className="text-[11px] text-foreground/40 mt-2 mb-2">oder aus 20 gängigen wählen:</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {QUALIFICATION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setName(preset.name)}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    name === preset.name ? "text-white" : "border border-border text-foreground/70"
                  }`}
                  style={name === preset.name ? { background: "var(--accent-gradient)" } : undefined}
                >
                  <span className="font-mono">{preset.icon}</span> {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-foreground/50 mb-1">Ablaufdatum (optional)</p>
            <DateSelect value={ablaufdatum} onChange={setAblaufdatum} minYear={2024} maxYear={2045} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || employeeId === "" || name.trim() === ""}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
