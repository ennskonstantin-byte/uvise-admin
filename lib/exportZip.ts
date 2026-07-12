"use client";

import JSZip from "jszip";
import type { Employee, EmployeeTraining, Qualification, Training } from "@/lib/mockData";
import { heute, nachweiseCsvString, qualifikationenCsvString } from "@/lib/exportCsv";

type CompanyInfo = { name: string; address: string | null; chefName: string | null } | null;

// Gesamt-Backup als ZIP: beide CSVs + eine kleine Info-Datei in einem
// Download — für Prüfungen/Sicherung, wenn man nicht zwei Dateien einzeln
// herunterladen will. Läuft komplett im Browser (kein Server nötig).
export async function exportGesamtBackupZip(
  company: CompanyInfo,
  employees: Employee[],
  trainings: Training[],
  employeeTrainings: EmployeeTraining[],
  qualifications: Qualification[]
) {
  const zip = new JSZip();
  const datum = heute();

  zip.file(`nachweise-${datum}.csv`, nachweiseCsvString(employees, trainings, employeeTrainings));
  zip.file(`qualifikationen-${datum}.csv`, qualifikationenCsvString(employees, qualifications));

  const info = [
    `uVise — Gesamt-Backup`,
    `Firma: ${company?.name ?? "—"}`,
    `Erstellt am: ${new Date().toLocaleString("de-DE")}`,
    `Mitarbeiter gesamt: ${employees.length} (davon aktiv: ${employees.filter((e) => !e.archiviert).length})`,
    ``,
    `Enthaltene Dateien:`,
    `- nachweise-${datum}.csv — eine Zeile pro zugewiesener Unterweisung mit Signatur-Status`,
    `- qualifikationen-${datum}.csv — eine Zeile pro Qualifikation mit Ablaufdatum/Status`,
  ].join("\n");
  zip.file("info.txt", info);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `uvise-backup-${datum}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
