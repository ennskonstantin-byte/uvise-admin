"use client";

import { useState } from "react";
import { TRAINING_ICON_OPTIONS, type Training } from "@/lib/types";
import { useAppData } from "@/lib/store";
import { IconImg } from "@/components/Icon3D";
import { trainingIconSrc } from "@/lib/icons";
import { DateSelect } from "@/components/DateSelect";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { fehlerText } from "@/lib/fehler";

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
  useEscapeClose(onClose);
  const { updateTraining } = useAppData();
  const [name, setName] = useState(training.name);
  const [icon, setIcon] = useState(training.icon);
  const [methode, setMethode] = useState<"upload" | "text">(
    training.typ === "hochgeladen" ? "upload" : "text"
  );
  const [inhalt, setInhalt] = useState(training.inhalt ?? "");
  // Vorhandener Dateiname ist uns nicht bekannt (nur der Storage-Pfad) --
  // zeigen stattdessen "Aktuelle PDF" an, solange keine neue Datei gewählt
  // wurde. Erst mit echter Auswahl wird pdfFile gesetzt und hochgeladen.
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [ablaufdatum, setAblaufdatum] = useState(toInputDate(training.ablaufdatum));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const pdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!pdf) {
      setError("Nur PDF-Dateien werden unterstützt. Bitte den Text stattdessen von Hand eingeben.");
      e.target.value = "";
      return;
    }
    setError(null);
    setPdfFile(file);
    setPdfFileName(file.name);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateTraining(training.id, {
        name,
        icon,
        inhalt: inhalt.trim() || null,
        ablaufdatum: ablaufdatum || null,
        pdfFile: methode === "upload" ? pdfFile : null,
      });
      onClose();
    } catch (err) {
      setError(fehlerText(err, "Speichern"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Unterweisung bearbeiten" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Unterweisung bearbeiten</h2>
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
                  {trainingIconSrc(opt.icon) ? <IconImg src={trainingIconSrc(opt.icon)!} size="xs" /> : opt.icon}
                </button>
              ))}
            </div>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Unterweisung"
            maxLength={120}
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />

          <div>
            <p className="text-xs text-foreground/65 mb-2">Inhalt für den Mitarbeiter</p>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setMethode("text")}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs ${
                  methode === "text" ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={methode === "text" ? { background: "var(--accent-gradient)" } : undefined}
              >
                ✍️ Text selbst verfassen
              </button>
              <button
                type="button"
                onClick={() => setMethode("upload")}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs ${
                  methode === "upload" ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={methode === "upload" ? { background: "var(--accent-gradient)" } : undefined}
              >
                📄 PDF hochladen
              </button>
            </div>

            {methode === "text" ? (
              <textarea
                value={inhalt}
                onChange={(e) => setInhalt(e.target.value)}
                placeholder="Inhalt der Unterweisung (wird dem Mitarbeiter angezeigt)…"
                maxLength={20000}
                className="w-full h-28 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
              />
            ) : (
              <div>
                <label className="flex items-center gap-3 mb-2">
                  <span className="rounded-full border border-border px-4 py-2 text-sm cursor-pointer">
                    {training.typ === "hochgeladen" ? "PDF ändern" : "Datei auswählen"}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </span>
                  {pdfFileName ? (
                    <span className="text-sm text-foreground/60">📎 {pdfFileName}</span>
                  ) : training.typ === "hochgeladen" ? (
                    <span className="text-sm text-foreground/60">📎 Aktuelle PDF bleibt erhalten</span>
                  ) : null}
                </label>
                <p className="text-xs text-foreground/60 mb-2">
                  Die PDF wird 1:1 in der App angezeigt — Mitarbeiter sehen das Original.
                </p>
                <textarea
                  value={inhalt}
                  onChange={(e) => setInhalt(e.target.value)}
                  placeholder="Optional: Text für die Vorlese-Stimme hier einfügen (die PDF selbst wird trotzdem angezeigt)."
                  maxLength={20000}
                  className="w-full h-24 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-1">Ablaufdatum (optional)</p>
            <DateSelect value={ablaufdatum} onChange={setAblaufdatum} minYear={2024} maxYear={2045} />
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
