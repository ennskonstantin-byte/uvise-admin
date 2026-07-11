"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bell, ArrowLeft, Pencil, Send, Plus } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/Card";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { AssignTrainingToEmployeeModal } from "@/components/AssignTrainingToEmployeeModal";
import { NewQualificationModal } from "@/components/NewQualificationModal";
import { useToast } from "@/components/Toast";
import { trainingName, initials } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

const REMINDER_HINT =
  "Erinnerung vorgemerkt. Der automatische E-Mail-Versand wird aktiv, sobald Resend eingerichtet ist.";

const STATUS_LABEL: Record<string, string> = {
  offen: "Offen",
  signiert: "Signiert",
  abgelehnt: "Abgelehnt",
};

const QUALIFICATION_STATUS_COLOR: Record<string, string> = {
  gueltig: "var(--ampel-green)",
  laeuft_ab: "#f59e0b",
  abgelaufen: "var(--ampel-red)",
};

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const { employees, employeeTrainings, qualifications, trainings } = useAppData();
  const { showToast, ToastView } = useToast();
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [addingQualification, setAddingQualification] = useState(false);
  const employee = employees.find((e) => e.id === params.id);
  const empTrainings = employeeTrainings.filter((et) => et.employeeId === params.id);
  const empQualifications = qualifications.filter((q) => q.employeeId === params.id);
  const openCount = empTrainings.filter((t) => t.status === "offen").length;

  if (!employee) {
    return (
      <DashboardShell>
        <Card>
          <p className="text-foreground/60">Mitarbeiter nicht gefunden.</p>
          <Link href="/mitarbeiter" className="text-sm underline mt-2 inline-block">
            Zurück zur Liste
          </Link>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Link
        href="/mitarbeiter"
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} />
        Zurück zur Mitarbeiter-Liste
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {employee.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={employee.fotoUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-white text-lg font-semibold"
              style={{ background: "var(--accent-gradient)" }}
            >
              {initials(employee.vorname, employee.nachname)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold">
              {employee.vorname} {employee.nachname}
            </h1>
            <p className="text-foreground/60 text-sm">
              {employee.personalnummer} · {employee.kategorie}
              {employee.istBeauftragter ? " · Beauftragte/r" : ""}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/30"
          >
            <Pencil size={14} />
            Bearbeiten
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Unterweisungen</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setAssigning(true)}
              className="flex items-center gap-2 text-sm rounded-full px-4 py-2 border border-border hover:border-foreground/30"
            >
              <Send size={14} />
              Zuweisen
            </button>
            {openCount > 0 && (
              <button
                onClick={() => showToast(REMINDER_HINT)}
                className="flex items-center gap-2 text-sm rounded-full px-4 py-2 border border-border hover:border-foreground/30"
              >
                <Bell size={14} />
                Alle erinnern
              </button>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden mb-8">
          {empTrainings.map((et) => (
            <div key={et.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{trainingName(trainings, et.trainingId)}</p>
                <p className="text-xs text-foreground/65">
                  {STATUS_LABEL[et.status]}
                  {et.signiertAm ? ` · signiert am ${et.signiertAm}` : ""}
                </p>
              </div>
              {et.status === "offen" && (
                <button
                  onClick={() => showToast(REMINDER_HINT)}
                  className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border hover:border-foreground/30"
                >
                  <Bell size={12} />
                  Erinnern
                </button>
              )}
            </div>
          ))}
          {empTrainings.length === 0 && (
            <p className="px-5 py-4 text-sm text-foreground/65">
              Keine Unterweisungen zugewiesen.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Qualifikationen</h2>
          <button
            onClick={() => setAddingQualification(true)}
            className="flex items-center gap-2 text-sm rounded-full px-4 py-2 border border-border hover:border-foreground/30"
          >
            <Plus size={14} />
            Hinzufügen
          </button>
        </div>
        <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
          {empQualifications.map((q) => (
            <div key={q.id} className="flex items-center gap-4 px-5 py-3">
              <span className="text-3xl">{q.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{q.name}</p>
                <p className="text-xs text-foreground/65">Läuft ab: {q.ablaufdatum}</p>
              </div>
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: QUALIFICATION_STATUS_COLOR[q.status] }}
              />
            </div>
          ))}
          {empQualifications.length === 0 && (
            <p className="px-5 py-4 text-sm text-foreground/65">
              Keine Qualifikationen erfasst.
            </p>
          )}
        </div>
      </Card>

      {editing && (
        <EditEmployeeModal employee={employee} onClose={() => setEditing(false)} />
      )}
      {assigning && (
        <AssignTrainingToEmployeeModal employee={employee} onClose={() => setAssigning(false)} />
      )}
      {addingQualification && (
        <NewQualificationModal
          defaultEmployeeId={employee.id}
          onClose={() => setAddingQualification(false)}
        />
      )}
      <ToastView />
    </DashboardShell>
  );
}
