"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewQualificationModal } from "@/components/NewQualificationModal";
import { useToast } from "@/components/Toast";
import { employeeName } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

const STATUS_META: Record<string, { label: string; color: string }> = {
  gueltig: { label: "Gültig", color: "var(--ampel-green)" },
  laeuft_ab: { label: "Läuft bald ab", color: "#f59e0b" },
  abgelaufen: { label: "Überfällig", color: "var(--ampel-red)" },
};

const REMINDER_HINT =
  "Erinnerung vorgemerkt. Der automatische E-Mail-Versand wird aktiv, sobald Resend eingerichtet ist.";

export default function QualifikationenPage() {
  const { qualifications, employees } = useAppData();
  const { showToast, ToastView } = useToast();
  const [showWizard, setShowWizard] = useState(false);

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
            return (
              <div key={q.id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-3xl">{q.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{q.name}</p>
                  <p className="text-xs text-foreground/50">
                    {employeeName(employees, q.employeeId)} · Läuft ab: {q.ablaufdatum}
                  </p>
                </div>
                <span
                  className="text-xs rounded-full px-3 py-1 text-white"
                  style={{ background: meta.color }}
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
            <p className="px-5 py-4 text-sm text-foreground/50">
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
