"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewQualificationModal } from "@/components/NewQualificationModal";
import { EditQualificationModal } from "@/components/EditQualificationModal";
import { useToast } from "@/components/Toast";
import { employeeName, istErinnerungFaellig, type Qualification } from "@/lib/types";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { useAppData } from "@/lib/store";

const STATUS_META: Record<string, { label: string; color: string }> = {
  gueltig: { label: "Gültig", color: "var(--ampel-green)" },
  laeuft_ab: { label: "Läuft bald ab", color: "#f59e0b" },
  abgelaufen: { label: "Überfällig", color: "var(--ampel-red)" },
};

export default function QualifikationenPage() {
  const { qualifications: allQualifications, employees, qualifikationTerminVereinbart, qualifikationNochmalErinnern } =
    useAppData();
  const { showToast, ToastView } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  // [Erinnerungs-Flow] Zeigt bei genau einer Zeile gerade die 2 Wahl-Knöpfe
  // ("Termin vereinbart" / "Nochmal erinnern") statt des Erinnern-Knopfs.
  const [erinnernOpenId, setErinnernOpenId] = useState<string | null>(null);
  const [erinnernBusyId, setErinnernBusyId] = useState<string | null>(null);

  async function handleTerminVereinbart(id: string) {
    if (erinnernBusyId) return;
    setErinnernBusyId(id);
    try {
      await qualifikationTerminVereinbart(id);
      setErinnernOpenId(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Konnte nicht gespeichert werden.");
    } finally {
      setErinnernBusyId(null);
    }
  }

  async function handleNochmalErinnern(id: string) {
    if (erinnernBusyId) return;
    setErinnernBusyId(id);
    try {
      await qualifikationNochmalErinnern(id);
      setErinnernOpenId(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Konnte nicht gespeichert werden.");
    } finally {
      setErinnernBusyId(null);
    }
  }
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
        <div className="uv-list-zebra rounded-3xl border border-border overflow-hidden">
          {qualifications.map((q) => {
            const meta = STATUS_META[q.status];
            const emp = employees.find((e) => e.id === q.employeeId);
            const faellig = istErinnerungFaellig(q);
            return (
              <div key={q.id} className="px-5 py-4">
                <div className="flex items-center gap-4">
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
                  {/* [Erinnerungs-Flow] Nur anzeigen, wenn wirklich eine
                      Erinnerung fällig ist -- Qualifikationen brauchen keine
                      Signatur, nur diese Erinnerung. */}
                  {faellig && (
                    <button
                      onClick={() => setErinnernOpenId(erinnernOpenId === q.id ? null : q.id)}
                      className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-amber-400 text-amber-700 hover:border-amber-500"
                    >
                      <Bell size={12} />
                      Erinnern
                    </button>
                  )}
                  <button
                    onClick={() => setEditingQualification(q)}
                    className="text-xs rounded-full px-3 py-1.5 border border-border hover:border-foreground/30"
                    aria-label={`Qualifikation ${q.name} bearbeiten`}
                  >
                    Bearbeiten
                  </button>
                </div>
                {faellig && erinnernOpenId === q.id && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-[60px]">
                    <button
                      onClick={() => handleTerminVereinbart(q.id)}
                      disabled={erinnernBusyId === q.id}
                      className="text-xs font-semibold rounded-full px-3 py-2 text-white disabled:opacity-50"
                      style={{ background: "var(--accent-gradient)" }}
                    >
                      {erinnernBusyId === q.id ? "…" : "Termin bereits vereinbart"}
                    </button>
                    <button
                      onClick={() => handleNochmalErinnern(q.id)}
                      disabled={erinnernBusyId === q.id}
                      className="text-xs font-semibold rounded-full px-3 py-2 border border-border hover:border-foreground/30 disabled:opacity-50"
                    >
                      {erinnernBusyId === q.id ? "…" : "In 1 Woche nochmal erinnern"}
                    </button>
                  </div>
                )}
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
      {editingQualification && (
        <EditQualificationModal
          qualification={editingQualification}
          onClose={() => setEditingQualification(null)}
        />
      )}
      <ToastView />
    </DashboardShell>
  );
}
