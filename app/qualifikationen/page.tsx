"use client";

import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewQualificationModal } from "@/components/NewQualificationModal";
import { EditQualificationModal } from "@/components/EditQualificationModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { employeeName, istErinnerungFaellig, type Qualification } from "@/lib/types";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { useAppData } from "@/lib/store";
import { IconImg } from "@/components/Icon3D";
import { qualificationIconSrc } from "@/lib/icons";

const STATUS_META: Record<string, { label: string; color: string }> = {
  gueltig: { label: "Gültig", color: "var(--ampel-green)" },
  laeuft_ab: { label: "Läuft bald ab", color: "#f59e0b" },
  abgelaufen: { label: "Überfällig", color: "var(--ampel-red)" },
};

export default function QualifikationenPage() {
  const {
    qualifications: allQualifications,
    employees,
    qualifikationTerminVereinbart,
    qualifikationNochmalErinnern,
    deleteQualification,
  } = useAppData();
  const { showToast, ToastView } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  // [Erinnerungs-Flow] Zeigt bei genau einer Zeile gerade die 2 Wahl-Knöpfe
  // ("Termin vereinbart" / "Nochmal erinnern") statt des Erinnern-Knopfs.
  const [erinnernOpenId, setErinnernOpenId] = useState<string | null>(null);
  const [erinnernBusyId, setErinnernBusyId] = useState<string | null>(null);
  // [App-Parität] Beide Aktionen ändern die nächste Erinnerung/den Termin --
  // die App fragt vor beidem noch mal nach, damit kein versehentlicher Klick
  // eine fällige Erinnerung stillschweigend verschiebt.
  const [confirmAction, setConfirmAction] = useState<{ id: string; kind: "termin" | "erinnern" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await deleteQualification(id);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Löschen fehlgeschlagen.");
    } finally {
      setDeletingId(null);
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
        {/* Status-Tönung statt Zebra (App-Parität, F6): jede Zeile ist nach
            ihrem eigenen Status gefärbt, nicht nach Position in der Liste. */}
        <div className="rounded-3xl border border-border overflow-hidden divide-y divide-border">
          {qualifications.map((q) => {
            const meta = STATUS_META[q.status];
            const emp = employees.find((e) => e.id === q.employeeId);
            const faellig = istErinnerungFaellig(q);
            return (
              <div
                key={q.id}
                className="px-5 py-4"
                style={{ background: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <EmployeeAvatar
                      vorname={emp?.vorname ?? "?"}
                      nachname={emp?.nachname ?? ""}
                      fotoUrl={emp?.fotoUrl}
                      size={44}
                    />
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center text-[11px] overflow-hidden">
                      {qualificationIconSrc(q.icon) ? <IconImg src={qualificationIconSrc(q.icon)!} size="xs" /> : q.icon}
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
                  <button
                    onClick={() => setConfirmDeleteId(q.id)}
                    disabled={deletingId === q.id}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                    aria-label={`Qualifikation ${q.name} löschen`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {faellig && erinnernOpenId === q.id && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-[60px]">
                    <button
                      onClick={() => setConfirmAction({ id: q.id, kind: "termin" })}
                      disabled={erinnernBusyId === q.id}
                      className="text-xs font-semibold rounded-full px-3 py-2 text-white disabled:opacity-50"
                      style={{ background: "var(--accent-gradient)" }}
                    >
                      {erinnernBusyId === q.id ? "…" : "Termin bereits vereinbart"}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ id: q.id, kind: "erinnern" })}
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
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.kind === "termin" ? "Termin bereits vereinbart?" : "In 1 Woche nochmal erinnern?"}
          message={
            confirmAction.kind === "termin"
              ? "Die Erinnerung ruht dann bis zum Ablaufdatum — nur bestätigen, wenn der Termin wirklich vereinbart ist."
              : "Die Erinnerung meldet sich in 7 Tagen erneut."
          }
          confirmLabel="Bestätigen"
          onConfirm={() => {
            if (confirmAction.kind === "termin") handleTerminVereinbart(confirmAction.id);
            else handleNochmalErinnern(confirmAction.id);
            setConfirmAction(null);
          }}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {confirmDeleteId && (
        <ConfirmModal
          title="Qualifikation löschen"
          message="Diese Qualifikation wirklich löschen? Das lässt sich nicht rückgängig machen."
          confirmLabel="Löschen"
          danger
          onConfirm={() => handleDelete(confirmDeleteId)}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}
      <ToastView />
    </DashboardShell>
  );
}
