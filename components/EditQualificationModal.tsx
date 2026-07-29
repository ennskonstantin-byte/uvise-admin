"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";
import { QUALIFICATION_PRESETS, qualIcon, type Qualification } from "@/lib/types";
import { DateSelect } from "@/components/DateSelect";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { fehlerText } from "@/lib/fehler";

// Bearbeiten + Löschen einer bestehenden Qualifikation -- im Web bisher gar
// nicht möglich (Runde-1/2-Audit, M-08), obwohl die Chef-App beides konnte.
export function EditQualificationModal({
  qualification,
  onClose,
}: {
  qualification: Qualification;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
  const { updateQualification, deleteQualification } = useAppData();
  const [name, setName] = useState(qualification.name);
  const [ablaufdatum, setAblaufdatum] = useState(qualification.ablaufdatumIso ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateQualification(qualification.id, { name, ablaufdatum: ablaufdatum || null });
      onClose();
    } catch (err) {
      setError(fehlerText(err, "Speichern"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Qualifikation „${qualification.name}" wirklich löschen?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteQualification(qualification.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen. Bitte erneut versuchen.");
      setDeleting(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Qualifikation bearbeiten" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Qualifikation bearbeiten</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/65 mb-2">Qualifikation</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eigene Qualifikation frei eingeben…"
              maxLength={80}
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setPresetsOpen(true)}
              className="mt-2 w-full rounded-full border border-border px-4 py-2.5 text-sm text-left text-foreground/80 hover:border-foreground/30"
            >
              {name && QUALIFICATION_PRESETS.some((q) => q.name === name)
                ? `${qualIcon(name)} ${name} — ändern`
                : "📋 Aus gängigen Qualifikationen wählen"}
            </button>
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-1">Ablaufdatum (optional)</p>
            <DateSelect value={ablaufdatum} onChange={setAblaufdatum} minYear={2024} maxYear={2045} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || deleting || name.trim() === ""}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
        <button
          onClick={handleDelete}
          disabled={saving || deleting}
          className="mt-3 w-full rounded-full border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-40"
        >
          {deleting ? "Löscht…" : "Qualifikation löschen"}
        </button>
      </div>

      {presetsOpen && (
        <div role="dialog" aria-modal="true" aria-label="Gängige Qualifikationen" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gängige Qualifikationen</h3>
              <button
                onClick={() => setPresetsOpen(false)}
                className="text-foreground/65 hover:text-foreground text-sm"
              >
                Schließen
              </button>
            </div>
            <div className="overflow-y-auto divide-y divide-border rounded-2xl border border-border">
              {QUALIFICATION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setPresetsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-surface ${
                    name === preset.name ? "font-semibold text-blue-600" : ""
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="flex-1">{preset.name}</span>
                  {name === preset.name && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
