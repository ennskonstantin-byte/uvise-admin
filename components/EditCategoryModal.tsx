"use client";

import { useState } from "react";
import { CATEGORY_ICON_OPTIONS, type Category } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

export function EditCategoryModal({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const { updateCategory, employees, setEmployeeCategory } = useAppData();
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateCategory(category.id, { name, icon });
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
          <h2 className="text-xl font-semibold">Kategorie bearbeiten</h2>
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
              {CATEGORY_ICON_OPTIONS.map((opt) => (
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
            placeholder="Name der Kategorie"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />

          <div>
            <p className="text-xs text-foreground/65 mb-2">
              Mitarbeiter in „{category.name}" (an-/abwählen)
            </p>
            <div className="max-h-40 overflow-y-auto rounded-2xl border border-border divide-y divide-border">
              {employees.map((e) => {
                const inCat = e.kategorie === category.name;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEmployeeCategory(e.id, inCat ? "" : category.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-surface"
                  >
                    <span
                      className={`h-5 w-5 rounded border flex items-center justify-center text-xs ${
                        inCat ? "text-white border-transparent" : "border-border"
                      }`}
                      style={inCat ? { background: "var(--accent-gradient)" } : undefined}
                    >
                      {inCat ? "✓" : ""}
                    </span>
                    {e.vorname} {e.nachname}
                  </button>
                );
              })}
              {employees.length === 0 && (
                <p className="px-3 py-2 text-sm text-foreground/65">Noch keine Mitarbeiter.</p>
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
