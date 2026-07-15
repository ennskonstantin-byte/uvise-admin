"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, FilePlus2 } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmployeeCard } from "@/components/EmployeeCard";
import { NewEmployeeWizard } from "@/components/NewEmployeeWizard";
import { NewTrainingWizard } from "@/components/NewTrainingWizard";
import { PlanModal } from "@/components/PlanModal";
import { FeedbackCard } from "@/components/FeedbackCard";
import { useAppData } from "@/lib/store";

export default function DashboardPage() {
  const { employees, categories, company, qualifications, trainings } = useAppData();
  const empName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.vorname} ${e.nachname}` : "";
  };
  const isArchivedEmployee = (id: string) => employees.find((e) => e.id === id)?.archiviert ?? false;
  const reminders = [
    ...qualifications
      .filter((q) => !isArchivedEmployee(q.employeeId))
      .filter((q) => q.status === "laeuft_ab" || q.status === "abgelaufen")
      .map((q) => ({
        key: "q" + q.id,
        text: `${q.name} — ${empName(q.employeeId)}`,
        sub: q.status === "abgelaufen" ? `abgelaufen (${q.ablaufdatum})` : `läuft ab: ${q.ablaufdatum}`,
        overdue: q.status === "abgelaufen",
      })),
    ...trainings
      .filter((t) => t.status === "laeuft_ab")
      .map((t) => ({
        key: "t" + t.id,
        text: `${t.name} (Unterweisung)`,
        sub: "Jährliche Kontrolle: noch aktuell? / läuft ab",
        overdue: false,
      })),
    ...employees
      .filter((e) => !e.archiviert && e.minderjaehrig)
      .map((e) => ({
        key: "m" + e.id,
        text: `${e.vorname} ${e.nachname} — minderjährig`,
        sub: "Unterweisung 2× jährlich (halbjährlich) erforderlich",
        overdue: false,
      })),
  ];
  const TABS = ["Alle", ...categories.map((c) => c.name)];
  const [category, setCategory] = useState("Alle");
  const [query, setQuery] = useState("");
  const [showEmployeeWizard, setShowEmployeeWizard] = useState(false);
  const [showTrainingWizard, setShowTrainingWizard] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (e.archiviert) return false;
      const matchesCategory = category === "Alle" || e.kategorie === category;
      const matchesQuery = `${e.vorname} ${e.nachname}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [employees, category, query]);

  return (
    <DashboardShell>
      <div
        className="rounded-2xl px-5 py-3 mb-6 flex items-center justify-between text-sm text-white"
        style={{ background: "var(--accent-gradient)" }}
      >
        <span>Testphase: noch 4 Tage kostenlos.</span>
        <button
          onClick={() => setShowPlanModal(true)}
          className="rounded-full bg-white/20 px-4 py-1.5 font-medium hover:bg-white/30 transition-colors"
        >
          Abo wählen
        </button>
      </div>

      {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}

      {reminders.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-4">
          <button
            onClick={() => setRemindersOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={remindersOpen}
          >
            <p className="text-sm font-semibold text-amber-900">
              🔔 {reminders.length} Erinnerung(en) — läuft bald ab
            </p>
            <span className="text-amber-900/60 text-sm shrink-0 ml-3">
              {remindersOpen ? "Einklappen ▲" : "Anzeigen ▼"}
            </span>
          </button>
          {remindersOpen && (
            <>
              <ul className="space-y-1 mt-3">
                {reminders.map((r) => (
                  <li key={r.key} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className={`h-2 w-2 rounded-full ${r.overdue ? "bg-red-500" : "bg-amber-500"}`} />
                    <span className="font-medium">{r.text}</span>
                    <span className="text-foreground/65">· {r.sub}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-800/80 mt-2 italic">
                Automatische E-Mail an Chef & Mitarbeiter (1 Monat vorher) wird aktiv, sobald Resend eingerichtet ist.
              </p>
            </>
          )}
        </div>
      )}

      <PageHeader
        title="Dashboard"
        subtitle={`2026 · ${company?.name ?? ""}`}
        action={
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowEmployeeWizard(true)}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              <UserPlus size={16} />
              Mitarbeiter einladen
            </button>
            <button
              onClick={() => setShowTrainingWizard(true)}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border border-border bg-background"
            >
              <FilePlus2 size={16} />
              Unterweisung erstellen
            </button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {TABS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  category === c
                    ? "text-white"
                    : "border border-border text-foreground/70 hover:border-foreground/30"
                }`}
                style={
                  category === c ? { background: "var(--accent-gradient)" } : undefined
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative ml-auto w-64">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/65"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name oder MA-Nummer"
              className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-foreground/65 text-sm mt-10 text-center">
            Keine Mitarbeiter gefunden.
          </p>
        )}
      </Card>

      {/* Nur für den Betreiber sichtbar (rendert sich selbst weg, wenn kein Betreiber) */}
      <div className="mt-6">
        <FeedbackCard />
      </div>

      {showEmployeeWizard && (
        <NewEmployeeWizard onClose={() => setShowEmployeeWizard(false)} />
      )}
      {showTrainingWizard && (
        <NewTrainingWizard onClose={() => setShowTrainingWizard(false)} />
      )}
    </DashboardShell>
  );
}
