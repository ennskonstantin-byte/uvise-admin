"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { employeeName, trainingName } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

export default function RueckfragenPage() {
  const { questions, employees, trainings, answerQuestion } = useAppData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <DashboardShell>
      <PageHeader
        title="Rückfragen"
        subtitle="Fragen deiner Mitarbeiter zu einzelnen Unterweisungen — direkt hier beantworten."
      />

      <Card>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="rounded-3xl border border-border p-5">
              <p className="text-xs text-foreground/65 mb-2">
                {employeeName(employees, q.employeeId)} ·{" "}
                {trainingName(trainings, q.trainingId)} · {q.gestelltAm}
              </p>

              <div className="flex justify-start mb-2">
                <div className="max-w-md rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5 text-sm">
                  {q.frage}
                </div>
              </div>

              {q.antwort ? (
                <div className="flex justify-end">
                  <div
                    className="max-w-md rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-white"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    {q.antwort}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <input
                    value={drafts[q.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="Antwort schreiben…"
                    className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={() => answerQuestion(q.id, drafts[q.id] ?? "")}
                    disabled={!drafts[q.id]}
                    className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    Senden
                  </button>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <p className="text-sm text-foreground/65 text-center py-6">
              Noch keine Rückfragen vorhanden.
            </p>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
