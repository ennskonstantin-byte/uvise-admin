"use client";

import { useState } from "react";
import type { EmployeeTraining } from "@/lib/types";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { saveArchiveDocumentPdf } from "@/lib/exportArchiveDocument";
import { supabase } from "@/lib/supabase";

export function ArchiveDocumentModal({
  entry,
  trainingName,
  employeeName,
  onClose,
}: {
  entry: EmployeeTraining;
  trainingName: string;
  employeeName: string;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ gueltig: boolean; grund: string } | null>(
    null
  );

  async function handleSave() {
    setSaving(true);
    try {
      await saveArchiveDocumentPdf(entry, trainingName, employeeName);
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    setChecking(true);
    setVerifyResult(null);
    const { data, error } = await supabase
      .rpc("verify_training_signature", { p_employee_training_id: entry.id })
      .maybeSingle();
    setChecking(false);
    if (error || !data) {
      setVerifyResult({ gueltig: false, grund: "Prüfung fehlgeschlagen. Bitte erneut versuchen." });
      return;
    }
    setVerifyResult({ gueltig: data.gueltig, grund: data.grund });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Unterschrifts-Nachweis</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Schließen
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-foreground/65">Unterweisung</p>
            <p className="font-medium">{trainingName}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/65">Mitarbeiter</p>
            <p className="font-medium">{employeeName}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/65">Signiert am</p>
            <p className="font-medium">{entry.signiertAm ?? "—"}</p>
          </div>
          {entry.signiertAls && entry.signiertAls !== employeeName && (
            <div>
              <p className="text-xs text-foreground/65">Damals signiert als</p>
              <p className="font-medium">{entry.signiertAls}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-foreground/65">Gerät</p>
            <p className="font-medium">{entry.geraet ?? "Nicht erfasst"}</p>
          </div>

          {entry.signaturHash && (
            <div>
              <p className="text-xs text-foreground/65">Siegel (Prüfsumme SHA-256)</p>
              <p className="font-mono text-[11px] break-all leading-snug">{entry.signaturHash}</p>
              <p className="text-[11px] text-foreground/55 mt-1 mb-2">
                Fälschungssicherer Fingerabdruck über Unterweisung, Unterschrift, Zeitpunkt,
                Mitarbeiter und Gerät.
              </p>
              <button
                onClick={handleVerify}
                disabled={checking}
                className="w-full rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-foreground/30 disabled:opacity-50"
              >
                {checking ? "Prüft…" : "Nachweis jetzt prüfen"}
              </button>
              {verifyResult && (
                <p
                  className={`text-xs font-medium mt-2 rounded-xl px-3 py-2 ${
                    verifyResult.gueltig
                      ? "bg-green-500/10 text-green-700"
                      : "bg-red-500/10 text-red-700"
                  }`}
                >
                  {verifyResult.gueltig ? "✓ " : "⚠️ "}
                  {verifyResult.grund}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs text-foreground/65 mb-1">Unterschrift</p>
            {entry.signaturBildUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.signaturBildUrl}
                alt="Unterschrift"
                className="w-full rounded-2xl border border-border bg-white"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-foreground/65">
                Kein Unterschriftsbild gespeichert.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            Drucken
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30 disabled:opacity-50"
          >
            {saving ? "Speichert…" : "Als PDF speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
