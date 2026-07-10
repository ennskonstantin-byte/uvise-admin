"use client";

import { useState } from "react";
import { TRAINING_ICON_OPTIONS, type Training } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

// Wandelt ein angezeigtes Datum (dd.mm.yyyy oder "—") in ein <input type=date>-Wert (yyyy-mm-dd)
function toInputDate(display: string): string {
  if (!display || display === "—") return "";
  const parts = display.split(".");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

export function EditTrainingModal({
  training,
  onClose,
}: {
  training: Training;
  onClose: () => void;
}) {
  const { updateTraining } = useAppData();
  const [name, setName] = useState(training.name);
  const [icon, setIcon] = useState(training.icon);
  const [inhalt, setInhalt] = useState(training.inhalt ?? "");
  const [ablaufdatum, setAblaufdatum] = useState(toInputDate(training.ablaufdatum));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateTraining(training.id, {
        name,
        icon,
        inhalt: inhalt.trim() || null,
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
          <h2 className="text-xl font-semibold">Unterweisung bearbeiten</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/65 mb-2">Symbol</p>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
              {TRAINING_ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  title={opt.name}
                  onClick={() => setIcon(opt.icon)}
                  className={`h-10 rounded-xl border text-lg flex items-center justify-center ${
                    icon === opt.icon ? "border-foreground/50 bg-surface" : "border-border"
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Unterweisung"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />

          <textarea
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            placeholder="Inhalt der Unterweisung (wird dem Mitarbeiter angezeigt)…"
            className="w-full h-28 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
          />

          <div>
            <p className="text-xs text-foreground/65 mb-1">Ablaufdatum</p>
            <input
              type="date"
              value={ablaufdatum}
              onChange={(e) => setAblaufdatum(e.target.value)}
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || name.trim() === ""}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
