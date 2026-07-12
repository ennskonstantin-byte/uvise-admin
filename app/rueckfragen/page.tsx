"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { trainingName, type Question, type Employee } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

type Thread = {
  key: string;
  employee: Employee | undefined;
  trainingId: string;
  questions: Question[];
  openCount: number;
};

export default function RueckfragenPage() {
  const { questions, employees, trainings, answerQuestion } = useAppData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());

  // Ein "Chat" pro Mitarbeiter + Unterweisung, statt jeder einzelnen Frage
  // ein eigenes Kästchen — bei vielen Mitarbeitern sonst schnell unübersichtlich.
  const threads = useMemo<Thread[]>(() => {
    const groups = new Map<string, Question[]>();
    for (const q of questions) {
      const key = `${q.employeeId}__${q.trainingId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(q);
    }
    return Array.from(groups.entries())
      .map(([key, qs]) => {
        const [employeeId, trainingId] = key.split("__");
        return {
          key,
          employee: employees.find((e) => e.id === employeeId),
          trainingId,
          questions: qs,
          openCount: qs.filter((q) => q.status === "offen").length,
        };
      })
      // Chats mit offenen Fragen zuerst, danach nach letzter Nachricht.
      .sort((a, b) => b.openCount - a.openCount);
  }, [questions, employees]);

  function toggle(key: string) {
    setOpenThreads((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Rückfragen"
        subtitle="Fragen deiner Mitarbeiter zu einzelnen Unterweisungen — direkt hier beantworten."
      />

      <Card>
        <div className="space-y-3">
          {threads.map((t) => {
            const isOpen = openThreads.has(t.key);
            return (
              <div key={t.key} className="rounded-3xl border border-border overflow-hidden">
                <button
                  onClick={() => toggle(t.key)}
                  aria-expanded={isOpen}
                  aria-label={`Chat mit ${t.employee ? `${t.employee.vorname} ${t.employee.nachname}` : "Unbekannt"} ${isOpen ? "einklappen" : "aufklappen"}`}
                  className="btn-feedback w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface"
                >
                  <EmployeeAvatar
                    vorname={t.employee?.vorname ?? "?"}
                    nachname={t.employee?.nachname ?? ""}
                    fotoUrl={t.employee?.fotoUrl}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {t.employee ? `${t.employee.vorname} ${t.employee.nachname}` : "Unbekannt"}
                    </p>
                    <p className="text-xs text-foreground/65 truncate">
                      {trainingName(trainings, t.trainingId)}
                    </p>
                  </div>
                  {t.openCount > 0 && (
                    <span className="rounded-full bg-red-600 text-white text-xs font-bold min-w-[22px] h-[22px] px-1.5 flex items-center justify-center">
                      {t.openCount}
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-foreground/65 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                    {t.questions.map((q) => (
                      <div key={q.id}>
                        <p className="text-[11px] text-foreground/65 mb-1.5">{q.gestelltAm}</p>
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
                          <div className="flex gap-2">
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
                  </div>
                )}
              </div>
            );
          })}

          {threads.length === 0 && (
            <p className="text-sm text-foreground/65 text-center py-6">
              Noch keine Rückfragen vorhanden.
            </p>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
