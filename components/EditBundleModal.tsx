"use client";

import { useState } from "react";
import { BUNDLE_ICONS as ICONS, type Bundle } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

export function EditBundleModal({
  bundle,
  onClose,
}: {
  bundle: Bundle;
  onClose: () => void;
}) {
  const { trainings, updateBundle } = useAppData();
  const [name, setName] = useState(bundle.name);
  const [icon, setIcon] = useState(bundle.icon);
  const [selected, setSelected] = useState<string[]>(bundle.trainingIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateBundle(bundle.id, { name, icon, trainingIds: selected });
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
          <h2 className="text-xl font-semibold">Bundle bearbeiten</h2>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/50 mb-2">Symbol</p>
            <div className="flex flex-wrap gap-3">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-12 w-12 rounded-full border text-xl flex items-center justify-center ${
                    icon === i ? "border-foreground/50 bg-surface" : "border-border"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name des Bundles"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />

          <div>
            <p className="text-xs text-foreground/50 mb-2">Unterweisungen</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {trainings.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                      )
                    }
                  />
                  {t.name}
                </label>
              ))}
            </div>
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
