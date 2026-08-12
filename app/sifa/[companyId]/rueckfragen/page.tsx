"use client";

// Rückfragen (SiFa) -- 3-Ebenen-Navigation wie in der App und im Web-Chef-
// Bereich (app/rueckfragen/page.tsx): Mitarbeiter → Unterweisung → Chat.
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Search, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { trainingName, type Question, type Employee } from "@/lib/types";
import { useAppData } from "@/lib/store";

type Thread = {
  key: string;
  employeeId: string;
  employee: Employee | undefined;
  trainingId: string;
  questions: Question[];
  openCount: number;
};

export default function SifaRueckfragenPage() {
  const { questions, employees, trainings, answerQuestion } = useAppData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"offen" | "alle">("offen");
  const [suche, setSuche] = useState("");

  const threads = useMemo<Thread[]>(() => {
    const groups = new Map<string, Question[]>();
    for (const q of questions) {
      const key = `${q.employeeId}__${q.trainingId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(q);
    }
    return Array.from(groups.entries()).map(([key, qs]) => {
      const [empId, trnId] = key.split("__");
      return {
        key,
        employeeId: empId,
        employee: employees.find((e) => e.id === empId),
        trainingId: trnId,
        questions: qs,
        openCount: qs.filter((q) => q.status === "offen").length,
      };
    });
  }, [questions, employees]);

  const employeeGroups = useMemo(() => {
    const map = new Map<
      string,
      { employeeId: string; employee: Employee | undefined; openCount: number; threadCount: number; letzte: Question | undefined }
    >();
    for (const t of threads) {
      const letzteDesThreads = t.questions[t.questions.length - 1];
      const existing = map.get(t.employeeId);
      if (existing) {
        existing.openCount += t.openCount;
        existing.threadCount += 1;
        if (letzteDesThreads && (!existing.letzte || letzteDesThreads.gestelltAm > existing.letzte.gestelltAm)) {
          existing.letzte = letzteDesThreads;
        }
      } else {
        map.set(t.employeeId, { employeeId: t.employeeId, employee: t.employee, openCount: t.openCount, threadCount: 1, letzte: letzteDesThreads });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.openCount - a.openCount);
  }, [threads]);

  const employeeThreads = useMemo(
    () => threads.filter((t) => t.employeeId === employeeId).sort((a, b) => b.openCount - a.openCount),
    [threads, employeeId]
  );

  const activeThread = useMemo(
    () => threads.find((t) => t.employeeId === employeeId && t.trainingId === trainingId) ?? null,
    [threads, employeeId, trainingId]
  );

  async function send(id: string) {
    const text = drafts[id]?.trim();
    if (!text) return;
    try {
      await answerQuestion(id, text);
      setDrafts((p) => ({ ...p, [id]: "" }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Antwort konnte nicht gesendet werden.");
    }
  }

  if (employeeId && trainingId && activeThread) {
    return (
      <>
        <button onClick={() => setTrainingId(null)} className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6">
          <ArrowLeft size={16} />
          Zurück zu den Unterweisungen
        </button>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <EmployeeAvatar
              vorname={activeThread.employee?.vorname ?? "?"}
              nachname={activeThread.employee?.nachname ?? ""}
              fotoUrl={activeThread.employee?.fotoUrl}
              size={40}
            />
            <div className="min-w-0">
              <p className="font-medium truncate">
                {activeThread.employee ? `${activeThread.employee.vorname} ${activeThread.employee.nachname}` : "Unbekannt"}
              </p>
              <p className="text-xs text-foreground/65 truncate">Rückfrage · {trainingName(trainings, activeThread.trainingId)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {activeThread.questions.map((q) => (
              <div key={q.id}>
                <p className="text-[11px] text-foreground/65 mb-1.5">{q.gestelltAm}</p>
                <div className="flex justify-start mb-2">
                  <div
                    className="max-w-md rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm"
                    style={{ background: "var(--uv-glass-bg-strong, rgba(255,255,255,0.08))", border: "1px solid var(--uv-glass-border, rgba(255,255,255,0.14))" }}
                  >
                    {q.frage}
                  </div>
                </div>

                {q.antwort ? (
                  <div className="flex justify-end">
                    <div className="max-w-md rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-white" style={{ background: "var(--accent-gradient)" }}>
                      {q.antwort}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={drafts[q.id] ?? ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Antwort schreiben…"
                      className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={() => send(q.id)}
                      disabled={!drafts[q.id]?.trim()}
                      className="flex items-center justify-center rounded-full h-10 w-10 text-white disabled:opacity-40"
                      style={{ background: "var(--accent-gradient)" }}
                      aria-label="Antwort senden"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </>
    );
  }

  if (employeeId) {
    const emp = employees.find((e) => e.id === employeeId);
    return (
      <>
        <button onClick={() => setEmployeeId(null)} className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6">
          <ArrowLeft size={16} />
          Zurück zur Mitarbeiter-Liste
        </button>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <EmployeeAvatar vorname={emp?.vorname ?? "?"} nachname={emp?.nachname ?? ""} fotoUrl={emp?.fotoUrl} size={40} />
            <p className="font-medium">{emp ? `${emp.vorname} ${emp.nachname}` : "Unbekannt"}</p>
          </div>

          <div className="space-y-2.5">
            {employeeThreads.map((t) => {
              const erledigt = t.openCount === 0;
              const letzte = t.questions[t.questions.length - 1];
              const vorschau = letzte?.antwort ?? letzte?.frage ?? "";
              return (
                <button
                  key={t.key}
                  onClick={() => setTrainingId(t.trainingId)}
                  className={`btn-feedback w-full flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5 text-left hover:bg-surface ${erledigt ? "opacity-70" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{trainingName(trainings, t.trainingId)}</p>
                    <p className="text-xs text-foreground/65 truncate">{vorschau}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {letzte?.gestelltAm && <span className="text-[11px] text-foreground/50">{letzte.gestelltAm}</span>}
                    {erledigt ? (
                      <Check size={15} className="text-green-500" aria-label="Alle Fragen beantwortet" />
                    ) : (
                      <span className="rounded-full bg-red-600 text-white text-xs font-bold min-w-[22px] h-[22px] px-1.5 flex items-center justify-center">
                        {t.openCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {employeeThreads.length === 0 && (
              <p className="text-sm text-foreground/65 text-center py-6">Dieser Mitarbeiter hat keine Rückfragen gestellt.</p>
            )}
          </div>
        </Card>
      </>
    );
  }

  const offeneGespraeche = employeeGroups.filter((g) => g.openCount > 0).length;
  const sucheKlein = suche.trim().toLowerCase();
  const sichtbareGruppen = employeeGroups
    .filter((g) => tab === "alle" || g.openCount > 0)
    .filter((g) => {
      if (!sucheKlein) return true;
      const name = g.employee ? `${g.employee.vorname} ${g.employee.nachname}`.toLowerCase() : "";
      const trainingsNamen = threads
        .filter((t) => t.employeeId === g.employeeId)
        .map((t) => trainingName(trainings, t.trainingId).toLowerCase())
        .join(" ");
      return name.includes(sucheKlein) || trainingsNamen.includes(sucheKlein);
    });

  return (
    <>
      <PageHeader title="Rückfragen" subtitle="Sortierung: Mitarbeiter → Unterweisung → Chat." />

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-1 p-1 rounded-full border border-border bg-surface">
            <button
              onClick={() => setTab("offen")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === "offen" ? "text-white" : "text-foreground/70"}`}
              style={tab === "offen" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Offen · {offeneGespraeche}
            </button>
            <button
              onClick={() => setTab("alle")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === "alle" ? "text-white" : "text-foreground/70"}`}
              style={tab === "alle" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Alle
            </button>
          </div>
          <div className="relative ml-auto w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/65" />
            <input
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Mitarbeiter oder Unterweisung suchen…"
              className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {sichtbareGruppen.map((g) => {
            const erledigt = g.openCount === 0;
            const vorschau = g.letzte?.antwort ?? g.letzte?.frage ?? "";
            return (
              <button
                key={g.employeeId}
                onClick={() => setEmployeeId(g.employeeId)}
                className={`btn-feedback w-full flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5 text-left hover:bg-surface ${erledigt ? "opacity-70" : ""}`}
              >
                <EmployeeAvatar vorname={g.employee?.vorname ?? "?"} nachname={g.employee?.nachname ?? ""} fotoUrl={g.employee?.fotoUrl} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{g.employee ? `${g.employee.vorname} ${g.employee.nachname}` : "Unbekannt"}</p>
                  <p className="text-xs text-foreground/65 truncate">
                    {erledigt
                      ? `${g.threadCount} ${g.threadCount === 1 ? "Unterweisung" : "Unterweisungen"} · geklärt`
                      : `${g.threadCount} ${g.threadCount === 1 ? "Unterweisung" : "Unterweisungen"}${vorschau ? ` · „${vorschau}"` : ""}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {!erledigt && g.letzte?.gestelltAm && <span className="text-[11px] text-foreground/50">{g.letzte.gestelltAm}</span>}
                  {erledigt ? (
                    <Check size={15} className="text-green-500" aria-label="Geklärt" />
                  ) : (
                    <span className="rounded-full bg-red-600 text-white text-xs font-bold min-w-[22px] h-[22px] px-1.5 flex items-center justify-center">
                      {g.openCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {sichtbareGruppen.length === 0 && (
            <p className="text-sm text-foreground/65 text-center py-6">
              {employeeGroups.length === 0 ? "Noch keine Rückfragen vorhanden." : "Nichts gefunden — anderen Tab oder Suchbegriff versuchen."}
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
