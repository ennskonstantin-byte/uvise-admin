"use client";

import type { Employee, EmployeeTraining, Qualification, Training } from "@/lib/mockData";

// CSV für deutsches Excel: Semikolon als Trenner, BOM am Anfang (sonst
// zeigt Excel Umlaute kaputt an), Anführungszeichen um jeden Wert.
function toCsv(rows: string[][]): string {
  const body = rows
    .map((row) => row.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  return "﻿" + body;
}

function download(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function heute(): string {
  return new Date().toISOString().slice(0, 10);
}

// Prüfungs-Export: eine Zeile pro zugewiesener Unterweisung mit Signatur-Status.
export function exportNachweiseCsv(
  employees: Employee[],
  trainings: Training[],
  employeeTrainings: EmployeeTraining[]
) {
  const rows: string[][] = [
    ["Nachname", "Vorname", "Mitarbeiternummer", "Kategorie", "Unterweisung", "Status", "Signiert am", "Gerät", "Archiviert"],
  ];
  for (const et of employeeTrainings) {
    const e = employees.find((x) => x.id === et.employeeId);
    const t = trainings.find((x) => x.id === et.trainingId);
    rows.push([
      e?.nachname ?? "Unbekannt",
      e?.vorname ?? "",
      e?.personalnummer ?? "",
      e?.kategorie ?? "",
      t?.name ?? "Unbekannte Unterweisung",
      et.status,
      et.signiertAm ?? "",
      et.geraet ?? "",
      e?.archiviert ? "ja" : "nein",
    ]);
  }
  download(`uvise-nachweise-${heute()}.csv`, toCsv(rows));
  return rows.length - 1;
}

// Qualifikationen-Export: eine Zeile pro Qualifikation mit Ablauf/Status.
export function exportQualifikationenCsv(employees: Employee[], qualifications: Qualification[]) {
  const rows: string[][] = [
    ["Nachname", "Vorname", "Mitarbeiternummer", "Kategorie", "Qualifikation", "Läuft ab", "Status", "Archiviert"],
  ];
  for (const q of qualifications) {
    const e = employees.find((x) => x.id === q.employeeId);
    rows.push([
      e?.nachname ?? "Unbekannt",
      e?.vorname ?? "",
      e?.personalnummer ?? "",
      e?.kategorie ?? "",
      q.name,
      q.ablaufdatum,
      q.status,
      e?.archiviert ? "ja" : "nein",
    ]);
  }
  download(`uvise-qualifikationen-${heute()}.csv`, toCsv(rows));
  return rows.length - 1;
}
