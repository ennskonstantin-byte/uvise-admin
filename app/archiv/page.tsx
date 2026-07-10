"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, FileDown, Printer } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ArchiveDocumentModal } from "@/components/ArchiveDocumentModal";
import { initials, trainingName, type EmployeeTraining } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

const YEARS = ["2026", "2025", "2024"];

export default function ArchivPage() {
  const { employees, employeeTrainings, trainings, categories } = useAppData();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [viewingEntry, setViewingEntry] = useState<EmployeeTraining | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesCategory = !category || e.kategorie === category;
      const matchesQuery = `${e.vorname} ${e.nachname}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [employees, category, query]);

  const selectedEmployee = employees.find((e) => e.id === employeeId);
  const entries = employeeTrainings.filter(
    (et) => et.employeeId === employeeId && (!year || (et.signiertAm ?? "").endsWith(year))
  );

  if (selectedEmployee && year) {
    return (
      <DashboardShell>
        <button
          onClick={() => setYear(null)}
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} />
          Zurück zur Jahresauswahl
        </button>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold">
              {selectedEmployee.vorname} {selectedEmployee.nachname} · {year}
            </h1>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/30"
            >
              <Printer size={14} />
              Gesamtes Jahr als PDF drucken
            </button>
          </div>

          <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
            {entries.map((et) => (
              <div key={et.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{trainingName(trainings, et.trainingId)}</p>
                  <p className="text-xs text-foreground/50">
                    Status: {et.status}
                    {et.signiertAm ? ` · signiert am ${et.signiertAm}` : ""}
                  </p>
                </div>
                {et.status === "signiert" && (
                  <button
                    onClick={() => setViewingEntry(et)}
                    className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border hover:border-foreground/30"
                  >
                    <FileDown size={12} />
                    Dokument ansehen
                  </button>
                )}
              </div>
            ))}
            {entries.length === 0 && (
              <p className="px-5 py-4 text-sm text-foreground/50">
                Keine Einträge für dieses Jahr.
              </p>
            )}
          </div>
        </Card>

        {viewingEntry && (
          <ArchiveDocumentModal
            entry={viewingEntry}
            trainingName={trainingName(trainings, viewingEntry.trainingId)}
            employeeName={`${selectedEmployee.vorname} ${selectedEmployee.nachname}`}
            onClose={() => setViewingEntry(null)}
          />
        )}
      </DashboardShell>
    );
  }

  if (selectedEmployee) {
    return (
      <DashboardShell>
        <button
          onClick={() => setEmployeeId(null)}
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} />
          Zurück zur Mitarbeiter-Auswahl
        </button>

        <Card>
          <h1 className="text-2xl font-semibold mb-6">
            {selectedEmployee.vorname} {selectedEmployee.nachname}
          </h1>

          <p className="text-sm text-foreground/60 mb-3">Jahr wählen</p>
          <div className="flex flex-wrap gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-foreground/30"
              >
                {y}
              </button>
            ))}
          </div>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Archiv & Historie"
        subtitle="Erst Kategorie und Mitarbeiter wählen, danach das Jahr — für eine schnellere Übersicht."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full px-4 py-2 text-sm ${
                category === null ? "text-white" : "border border-border text-foreground/70"
              }`}
              style={category === null ? { background: "var(--accent-gradient)" } : undefined}
            >
              Alle
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.name)}
                className={`rounded-full px-4 py-2 text-sm ${
                  category === c.name ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={category === c.name ? { background: "var(--accent-gradient)" } : undefined}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name oder MA-Nummer"
            className="ml-auto w-64 rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((e) => (
            <button
              key={e.id}
              onClick={() => setEmployeeId(e.id)}
              className="text-left rounded-3xl border border-border bg-surface p-5 hover:shadow-md transition-shadow"
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold mb-3"
                style={{ background: "var(--accent-gradient)" }}
              >
                {initials(e.vorname, e.nachname)}
              </div>
              <p className="font-medium">
                {e.vorname} {e.nachname}
              </p>
              <p className="text-sm text-foreground/60">{e.kategorie}</p>
            </button>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
