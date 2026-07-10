"use client";

import type { EmployeeTraining } from "@/lib/mockData";

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Unterschrifts-Nachweis</h2>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground text-sm">
            Schließen
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-foreground/50">Unterweisung</p>
            <p className="font-medium">{trainingName}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Mitarbeiter</p>
            <p className="font-medium">{employeeName}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Signiert am</p>
            <p className="font-medium">{entry.signiertAm ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Gerät</p>
            <p className="font-medium">{entry.geraet ?? "Nicht erfasst"}</p>
          </div>

          <div>
            <p className="text-xs text-foreground/50 mb-1">Unterschrift</p>
            {entry.signaturBildUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.signaturBildUrl}
                alt="Unterschrift"
                className="w-full rounded-2xl border border-border bg-white"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-foreground/50">
                Kein Unterschriftsbild gespeichert.
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white"
          style={{ background: "var(--accent-gradient)" }}
        >
          Als PDF drucken
        </button>
      </div>
    </div>
  );
}
