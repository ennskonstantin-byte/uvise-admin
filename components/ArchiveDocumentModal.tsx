"use client";

import { useEffect, useState } from "react";
import type { EmployeeTraining } from "@/lib/types";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { saveArchiveDocumentPdf } from "@/lib/exportArchiveDocument";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/store";
import { isTypedSignature, typedSignatureName } from "@/lib/signature";

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
  const { fetchSignatureDetails } = useAppData();
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ gueltig: boolean; grund: string } | null>(
    null
  );
  // [Audit-Fund SUPABASE & DATEN, 28.07.2026] signatur_bild_url/signatur_hash
  // sind nicht mehr Teil des Bulk-/Archiv-Loads -- hier gezielt nachgeladen,
  // weil dieses Detail-Modal sie wirklich braucht (Anzeige + PDF-Export).
  const [signatureDetails, setSignatureDetails] = useState<{
    signaturBildUrl: string | null;
    signaturHash: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSignatureDetails(entry.id).then((details) => {
      if (!cancelled) setSignatureDetails(details);
    });
    return () => {
      cancelled = true;
    };
  }, [entry.id, fetchSignatureDetails]);

  // Solange die Signatur-Details noch nachgeladen werden, mit den (evtl.
  // bereits vorhandenen) Werten aus `entry` als Platzhalter arbeiten -- kann
  // z.B. bei sehr schnellem Öffnen kurz null sein.
  const fullEntry = signatureDetails ? { ...entry, ...signatureDetails } : entry;

  async function handleSave() {
    setSaving(true);
    try {
      await saveArchiveDocumentPdf(fullEntry, trainingName, employeeName);
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    setChecking(true);
    setVerifyResult(null);
    const { data, error } = await supabase
      .rpc("verify_training_signature", { p_employee_training_id: entry.id })
      .maybeSingle<{ gueltig: boolean; grund: string }>();
    setChecking(false);
    if (error || !data) {
      setVerifyResult({ gueltig: false, grund: "Prüfung fehlgeschlagen. Bitte erneut versuchen." });
      return;
    }
    setVerifyResult({ gueltig: data.gueltig, grund: data.grund });
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Unterschrifts-Nachweis" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
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

          {fullEntry.signaturHash && (
            <div>
              <p className="text-xs text-foreground/65">Siegel (Prüfsumme SHA-256)</p>
              <p className="font-mono text-[11px] break-all leading-snug">{fullEntry.signaturHash}</p>
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
            {!fullEntry.signaturBildUrl ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-foreground/65">
                {signatureDetails ? "Kein Unterschriftsbild gespeichert." : "Lädt…"}
              </div>
            ) : isTypedSignature(fullEntry.signaturBildUrl) ? (
              <div className="w-full h-[140px] flex items-center justify-center rounded-2xl border border-border bg-white">
                <p className="text-xl font-bold italic text-foreground">
                  „{typedSignatureName(fullEntry.signaturBildUrl)}"
                </p>
              </div>
            ) : (
              // [H-04-Nachtrag] War zuvor fälschlich <img src={entry.signaturBildUrl}>
              // -- signatur_bild_url speichert rohe SVG-Path-Daten (M...L...),
              // keine Bild-URL. Ein <img> kann das nie laden; das
              // Unterschriftsbild war in dieser Vorschau immer unsichtbar.
              <svg
                viewBox="0 0 320 160"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-[140px] rounded-2xl border border-border bg-white"
              >
                <path d={fullEntry.signaturBildUrl} stroke="#14161b" strokeWidth={2.5} fill="none" />
              </svg>
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
