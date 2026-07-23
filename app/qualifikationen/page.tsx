"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewQualificationModal } from "@/components/NewQualificationModal";
import { useToast } from "@/components/Toast";
import { employeeName } from "@/lib/types";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { useAppData } from "@/lib/store";

const STATUS_META: Record<string, { label: string; color: string }> = {
  gueltig: { label: "Gültig", color: "var(--ampel-green)" },
  laeuft_ab: { label: "Läuft bald ab", color: "#f59e0b" },
  abgelaufen: { label: "Überfällig", color: "var(--ampel-red)" },
};

const REMINDER_HINT =
  "Erinnerung vorgemerkt. Der automatische E-Mail-Versand wird aktiv, sobald Resend eingerichtet ist.";

export default function QualifikationenPage() {
  const { qualifications: allQualifications, employees } = useAppData();
  const { showToast, ToastView } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  // Archivierte (gekündigte) Mitarbeiter tauchen hier nicht mehr auf.
  // Ampel-Sortierung: Überfällig (rot) → Läuft bald ab (gelb) → Gültig (grün),
  // innerhalb der Gruppe das früheste Ablaufdatum zuerst.
  const statusRang: Record<string, number> = { abgelaufen: 0, laeuft_ab: 1, gueltig: 2 };
  // ablaufdatum kommt als deutsches Datum (TT.MM.JJJJ) — zum Sortieren umdrehen
  const sortierbar = (datum: string | null) =>
    datum ? datum.split(".").reverse().join("-") : "9999";
  const qualifications = allQualifications
    .filter((q) => !employees.find((e) => e.id === q.employeeId)?.archiviert)
    .sort(
      (a, b) =>
        (statusRang[a.status] ?? 3) - (statusRang[b.status] ?? 3) ||
        sortierbar(a.ablaufdatum).localeCompare(sortierbar(b.ablaufdatum))
    );

  return (
    <DashboardShell>
      <PageHeader
        title="Qualifikationen"
        subtitle="Erste-Hilfe-Kurse, Brandschutzhelfer & Co. — getrennt von den Unterweisungen."
        action={
          <button
            onClick={() => setShowWizard(true)}
            className="h-11 w-11 rounded-full text-white text-2xl flex items-center justify-center leading-none"
            style={{ background: "var(--accent-gradient)" }}
            aria-label="Neue Qualifikation hinzufügen"
          >
            +
          </button>
        }
      />

      <Card>
        <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
          {qualifications.map((q) => {
            const meta = STATUS_META[q.status];
            const emp = employees.find((e) => e.id === q.employeeId);
            return (
              <div key={q.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative shrink-0">
                  <EmployeeAvatar
                    vorname={emp?.vorname ?? "?"}
                    nachname={emp?.nachname ?? ""}
                    fotoUrl={emp?.fotoUrl}
                    size={44}
                  />
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center text-[11px]">
                    {q.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{q.name}</p>
                  <p className="text-xs text-foreground/65">
                    {employeeName(employees, q.employeeId)} · Läuft ab: {q.ablaufdatum}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{ background: meta.color, color: "#171717" }}
                >
                  {meta.label}
                </span>
                <button
                  onClick={() => showToast(REMINDER_HINT)}
                  className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border hover:border-foreground/30"
                >
                  <Bell size={12} />
                  Erinnern
                </button>
              </div>
            );
          })}
          {qualifications.length === 0 && (
            <p className="px-5 py-4 text-sm text-foreground/65">
              Keine Qualifikationen erfasst.
            </p>
          )}
        </div>
      </Card>

      {showWizard && <NewQualificationModal onClose={() => setShowWizard(false)} />}
      <ToastView />
    </DashboardShell>
  );
}
