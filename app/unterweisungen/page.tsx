"use client";

import { useState } from "react";
import { AlertTriangle, Pencil, Send, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewTrainingWizard } from "@/components/NewTrainingWizard";
import { NewBundleWizard } from "@/components/NewBundleWizard";
import { EditTrainingModal } from "@/components/EditTrainingModal";
import { EditBundleModal } from "@/components/EditBundleModal";
import { AssignTrainingModal } from "@/components/AssignTrainingModal";
import type { Bundle, Training } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

export default function UnterweisungenPage() {
  const { trainings, bundles, deleteTraining, deleteBundle } = useAppData();
  const [tab, setTab] = useState<"vorlagen" | "bundles">("vorlagen");
  const [showTrainingWizard, setShowTrainingWizard] = useState(false);
  const [showBundleWizard, setShowBundleWizard] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [assigningTraining, setAssigningTraining] = useState<Training | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const expiringSoon = trainings.filter((t) => t.status === "laeuft_ab");

  async function handleDeleteTraining(id: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    setDeletingId(id);
    try {
      await deleteTraining(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteBundle(id: string, name: string) {
    if (!confirm(`Bundle "${name}" wirklich löschen?`)) return;
    setDeletingId(id);
    try {
      await deleteBundle(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Unterweisungen"
        subtitle="Vorlagen verwalten und zu Bundles für neue Mitarbeiter bündeln."
        action={
          <button
            onClick={() =>
              tab === "vorlagen" ? setShowTrainingWizard(true) : setShowBundleWizard(true)
            }
            className="h-11 w-11 rounded-full text-white text-2xl flex items-center justify-center leading-none"
            style={{ background: "var(--accent-gradient)" }}
            aria-label={tab === "vorlagen" ? "Neue Unterweisung anlegen" : "Neues Bundle anlegen"}
          >
            +
          </button>
        }
      />

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("vorlagen")}
          className={`rounded-full px-4 py-2 text-sm ${
            tab === "vorlagen" ? "text-white" : "border border-border text-foreground/70"
          }`}
          style={tab === "vorlagen" ? { background: "var(--accent-gradient)" } : undefined}
        >
          Vorlagen
        </button>
        <button
          onClick={() => setTab("bundles")}
          className={`rounded-full px-4 py-2 text-sm ${
            tab === "bundles" ? "text-white" : "border border-border text-foreground/70"
          }`}
          style={tab === "bundles" ? { background: "var(--accent-gradient)" } : undefined}
        >
          Bundles
        </button>
      </div>

      <Card>
        {tab === "vorlagen" ? (
          <>
            {expiringSoon.length > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-5 py-3 mb-6 text-sm">
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                <span>
                  {expiringSoon.length} Vorlage(n) laufen bald ab oder sind überschritten — bitte
                  prüfen, ob der Inhalt noch aktuell ist. (E-Mail-Erinnerung wird aktiv, sobald
                  Resend eingerichtet ist.)
                </span>
              </div>
            )}

            <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
              {trainings.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="text-lg">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-foreground/65">
                      Erstellt: {t.erstelltAm} · Läuft ab: {t.ablaufdatum}
                    </p>
                  </div>
                  {t.status === "laeuft_ab" && (
                    <span className="text-xs rounded-full bg-amber-500/15 text-amber-600 px-3 py-1">
                      Läuft bald ab
                    </span>
                  )}
                  <button
                    onClick={() => setAssigningTraining(t)}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                    aria-label="Verteilen"
                    title="An Mitarbeiter verteilen"
                  >
                    <Send size={14} />
                  </button>
                  <button
                    onClick={() => setEditingTraining(t)}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                    aria-label="Bearbeiten"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTraining(t.id, t.name)}
                    disabled={deletingId === t.id}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                    aria-label="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundles.map((b) => (
              <div key={b.id} className="rounded-3xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{b.icon}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingBundle(b)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                      aria-label="Bearbeiten"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBundle(b.id, b.name)}
                      disabled={deletingId === b.id}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                      aria-label="Löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="font-medium mt-3">{b.name}</p>
                <p className="text-sm text-foreground/65">
                  {b.trainingIds.length} Unterweisung(en)
                </p>
              </div>
            ))}
            {bundles.length === 0 && (
              <p className="text-foreground/65 text-sm text-center col-span-full mt-6">
                Noch keine Bundles angelegt.
              </p>
            )}
          </div>
        )}
      </Card>

      {showTrainingWizard && (
        <NewTrainingWizard onClose={() => setShowTrainingWizard(false)} />
      )}
      {showBundleWizard && <NewBundleWizard onClose={() => setShowBundleWizard(false)} />}
      {editingTraining && (
        <EditTrainingModal training={editingTraining} onClose={() => setEditingTraining(null)} />
      )}
      {editingBundle && (
        <EditBundleModal bundle={editingBundle} onClose={() => setEditingBundle(null)} />
      )}
      {assigningTraining && (
        <AssignTrainingModal training={assigningTraining} onClose={() => setAssigningTraining(null)} />
      )}
    </DashboardShell>
  );
}
