"use client";

import { useState } from "react";
import { BUNDLE_ICONS as ICONS, type Bundle } from "@/lib/types";
import { useAppData } from "@/lib/store";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { fehlerText } from "@/lib/fehler";
import { IconImg } from "@/components/Icon3D";
import { resolveDynamicIcon } from "@/lib/icons";

export function EditBundleModal({
  bundle,
  onClose,
}: {
  bundle: Bundle;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
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
    } catch (err) {
      setError(fehlerText(err, "Speichern"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Bundle bearbeiten" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Bundle bearbeiten</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/65 mb-2">Symbol</p>
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
                  {resolveDynamicIcon("category", i) ? <IconImg src={resolveDynamicIcon("category", i)!} size="sm" /> : i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-1">Abteilung / Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Produktion"
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-2">Unterweisungen im Bundle</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {trainings.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-foreground/70">
                  <input
                    type="checkbox"
                    checked={trainings.every((t) => selected.includes(t.id))}
                    onChange={(e) => setSelected(e.target.checked ? trainings.map((t) => t.id) : [])}
                  />
                  Alle Unterweisungen
                </label>
              )}
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
                  <span className="inline-flex items-center gap-1.5">
                    {resolveDynamicIcon("training", t.icon) ? <IconImg src={resolveDynamicIcon("training", t.icon)!} size="xs" /> : t.icon}
                    {t.name}
                  </span>
                </label>
              ))}
              {trainings.length === 0 && (
                <p className="text-sm text-foreground/65">Noch keine Unterweisungen vorhanden.</p>
              )}
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
