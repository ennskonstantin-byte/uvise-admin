"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bell, ArrowLeft, Pencil, Send, Plus, Copy } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/Card";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { AssignTrainingToEmployeeModal } from "@/components/AssignTrainingToEmployeeModal";
import { NewQualificationModal } from "@/components/NewQualificationModal";
import { useToast } from "@/components/Toast";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { trainingName } from "@/lib/types";
import { useAppData } from "@/lib/store";

const REMINDER_HINT =
  "Erinnerung vorgemerkt. Der automatische E-Mail-Versand wird aktiv, sobald Resend eingerichtet ist.";

// Zeigt pro zugewiesener Unterweisung denselben Ampel-Status wie die
// Mitarbeiter-App (siehe sicherakte/App.tsx isOverdue): ein offener Punkt
// nach Ablaufdatum ist "Überfällig" (rot), davor "Ausstehend" (gelb) —
// vorher stand hier immer nur neutral "Offen", ohne Ablauf-Hinweis, was
// zu Verwirrung führte, wenn die App bereits Rot/Überfällig anzeigte.
function trainingRowStatus(
  status: "offen" | "signiert" | "abgelehnt",
  ablaufdatum: string | undefined
): { label: string; color: string } {
  if (status === "signiert") return { label: "Signiert", color: "var(--ampel-green)" };
  if (status === "abgelehnt") return { label: "Abgelehnt", color: "var(--ampel-red)" };
  const overdue = !!ablaufdatum && new Date(ablaufdatum).getTime() < Date.now();
  return overdue
    ? { label: "Überfällig", color: "var(--ampel-red)" }
    : { label: "Ausstehend", color: "#f59e0b" };
}

const QUALIFICATION_STATUS_COLOR: Record<string, string> = {
  gueltig: "var(--ampel-green)",
  laeuft_ab: "#f59e0b",
  abgelaufen: "var(--ampel-red)",
};

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const { employees, employeeTrainings, qualifications, trainings, regenerateInviteToken } =
    useAppData();
  const { showToast, ToastView } = useToast();
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [addingQualification, setAddingQualification] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const employee = employees.find((e) => e.id === params.id);
  const empTrainings = employeeTrainings.filter((et) => et.employeeId === params.id);
  const empQualifications = qualifications.filter((q) => q.employeeId === params.id);
  const openCount = empTrainings.filter((t) => t.status === "offen").length;

  async function handleRegenerateInvite() {
    if (
      !confirm(
        "Neuen Einladungscode erzeugen? Der bisherige Code funktioniert danach nicht mehr — sinnvoll, wenn er versehentlich weitergegeben wurde."
      )
    )
      return;
    setRegenerating(true);
    try {
      await regenerateInviteToken(params.id);
      showToast("Neuer Einladungscode erzeugt, alter ist ungültig.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Konnte keinen neuen Code erzeugen.");
    } finally {
      setRegenerating(false);
    }
  }

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
          <EmployeeAvatar
            vorname={employee.vorname}
            nachname={employee.nachname}
            fotoUrl={employee.fotoUrl}
            size={64}
          />
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

        {!employee.registriert && employee.inviteToken && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 mb-8">
            <div>
              <p className="text-sm font-medium">Noch nicht registriert</p>
              <p className="text-xs text-foreground/60">
                Gib {employee.vorname} diesen Einladungscode für die App-Registrierung:{" "}
                <span className="font-mono text-foreground">{employee.inviteToken}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(employee.inviteToken!);
                  showToast("Einladungscode kopiert");
                }}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:border-foreground/30"
              >
                <Copy size={14} />
                Kopieren
              </button>
              <button
                onClick={handleRegenerateInvite}
                disabled={regenerating}
                title="Alten Code widerrufen und einen neuen erzeugen — z.B. wenn er versehentlich weitergegeben wurde."
                className="rounded-full border border-border px-3 py-2 text-xs hover:border-foreground/30 disabled:opacity-50"
              >
                {regenerating ? "…" : "Code neu erzeugen"}
              </button>
            </div>
          </div>
        )}

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
          {empTrainings.map((et) => {
            const rowStatus = trainingRowStatus(et.status, et.ablaufdatumIso ?? undefined);
            return (
            <div key={et.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{trainingName(trainings, et.trainingId)}</p>
                <p className="text-xs text-foreground/65 flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ background: rowStatus.color }}
                  />
                  {rowStatus.label}
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
            );
          })}
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
