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
  const [showArchived, setShowArchived] = useState(false);

  function matchesFilters(e: (typeof employees)[number]) {
    const matchesCategory = !category || e.kategorie === category;
    const matchesQuery = `${e.vorname} ${e.nachname}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }

  const filteredEmployees = useMemo(
    () => employees.filter((e) => !e.archiviert && matchesFilters(e)),
    [employees, category, query]
  );
  const filteredArchived = useMemo(
    () => employees.filter((e) => e.archiviert && matchesFilters(e)),
    [employees, category, query]
  );

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
                  <p className="text-xs text-foreground/65">
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
              <p className="px-5 py-4 text-sm text-foreground/65">
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
          {filteredEmployees.length === 0 && (
            <p className="text-foreground/65 text-sm col-span-full text-center py-6">
              Keine Mitarbeiter gefunden.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border">
          <button
            role="switch"
            aria-checked={showArchived}
            aria-label="Archivierte Mitarbeiter anzeigen"
            onClick={() => setShowArchived((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              showArchived ? "bg-green-500" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                showArchived ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-medium">Archivierte anzeigen</p>
            <p className="text-xs text-foreground/65">
              Gekündigte Mitarbeiter ({filteredArchived.length}) — Nachweise bleiben erhalten
            </p>
          </div>
        </div>

        {showArchived && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredArchived.map((e) => (
              <button
                key={e.id}
                onClick={() => setEmployeeId(e.id)}
                className="text-left rounded-3xl border border-border bg-surface p-5 hover:shadow-md transition-shadow opacity-60"
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold mb-3 bg-foreground/40">
                  {initials(e.vorname, e.nachname)}
                </div>
                <p className="font-medium">
                  {e.vorname} {e.nachname}
                </p>
                <p className="text-sm text-foreground/60">{e.kategorie || "—"}</p>
              </button>
            ))}
            {filteredArchived.length === 0 && (
              <p className="text-foreground/65 text-sm col-span-full text-center py-6">
                Keine archivierten Mitarbeiter.
              </p>
            )}
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
