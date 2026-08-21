"use client";

// Unterweisungen (SiFa) -- Web-Port von Phase 5/App, identischer Kern-Inhalt
// zu app/unterweisungen/page.tsx (Vorlagen + Bundles, keine Chef-only-Teile
// hier -- alles operative Verwaltung, die auch SiFa laut Migration 0078
// (auth_can_admin) darf).
import { useState } from "react";
import { AlertTriangle, Bell, MoreVertical, Pencil, Printer, Send, Trash2, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewTrainingWizard } from "@/components/NewTrainingWizard";
import { NewBundleWizard } from "@/components/NewBundleWizard";
import { EditTrainingModal } from "@/components/EditTrainingModal";
import { EditBundleModal } from "@/components/EditBundleModal";
import { AssignTrainingModal } from "@/components/AssignTrainingModal";
import { AssignBundleModal } from "@/components/AssignBundleModal";
import type { Bundle, Training } from "@/lib/types";
import { useAppData } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { printTraining } from "@/lib/printTraining";
import { IconImg } from "@/components/Icon3D";
import { resolveDynamicIcon } from "@/lib/icons";

export default function SifaUnterweisungenPage() {
  const { trainings, bundles, deleteTraining, deleteBundle, withdrawTraining, employeeTrainings } = useAppData();
  const [tab, setTab] = useState<"vorlagen" | "bundles">("vorlagen");
  const [showTrainingWizard, setShowTrainingWizard] = useState(false);
  const [showBundleWizard, setShowBundleWizard] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [assigningTraining, setAssigningTraining] = useState<Training | null>(null);
  const [assigningBundle, setAssigningBundle] = useState<Bundle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [erinnernId, setErinnernId] = useState<string | null>(null);
  const [erinnernHinweis, setErinnernHinweis] = useState<{ id: string; text: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const expiringSoon = trainings.filter((t) => t.status === "laeuft_ab" || t.status === "abgelaufen");

  async function handleDeleteTraining(id: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    setDeletingId(id);
    try {
      await deleteTraining(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Löschen fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setDeletingId(null);
    }
  }

  function offeneZuweisungen(trainingId: string) {
    return employeeTrainings.filter((et) => et.trainingId === trainingId && et.status === "offen").length;
  }

  function ruecklauf(trainingId: string) {
    const zuweisungen = employeeTrainings.filter((et) => et.trainingId === trainingId);
    const signiert = zuweisungen.filter((et) => et.status === "signiert").length;
    return { signiert, gesamt: zuweisungen.length };
  }

  async function handleErneutErinnern(id: string, name: string) {
    setErinnernId(id);
    setErinnernHinweis(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Nicht angemeldet.");
      const res = await fetch("/api/erinnerungen/sofort", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ trainingId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erinnerung fehlgeschlagen.");
      setErinnernHinweis({
        id,
        text: json.angeschrieben === 0 ? `„${name}" — niemand mehr zu erinnern.` : `${json.angeschrieben} Mitarbeiter zu „${name}" erinnert.`,
      });
    } catch (err) {
      setErinnernHinweis({ id, text: err instanceof Error ? err.message : "Erinnerung fehlgeschlagen." });
    } finally {
      setErinnernId(null);
    }
  }

  async function handleWithdrawTraining(id: string, name: string) {
    const anzahl = offeneZuweisungen(id);
    if (
      !confirm(
        `„${name}" wirklich zurückziehen? ${anzahl} offene Zuweisung(en) werden gelöscht — die Mitarbeiter sehen die Unterweisung dann nicht mehr. Bereits signierte Nachweise bleiben erhalten.`
      )
    )
      return;
    setDeletingId(id);
    try {
      const entfernt = await withdrawTraining(id);
      if (anzahl > 0 && entfernt === 0) {
        alert("Alle betroffenen Zuweisungen wurden inzwischen bereits signiert oder waren schon zurückgezogen.");
      }
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
    <>
      <PageHeader
        title="Unterweisungen"
        subtitle="Vorlagen verwalten und zu Bundles für neue Mitarbeiter bündeln."
        action={
          <button
            onClick={() => (tab === "vorlagen" ? setShowTrainingWizard(true) : setShowBundleWizard(true))}
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
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            tab === "vorlagen" ? "uv-glass-tile text-white font-medium" : "border border-border text-foreground/70"
          }`}
          style={
            tab === "vorlagen"
              ? { ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "9999px" }
              : undefined
          }
        >
          Vorlagen
        </button>
        <button
          onClick={() => setTab("bundles")}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            tab === "bundles" ? "uv-glass-tile text-white font-medium" : "border border-border text-foreground/70"
          }`}
          style={
            tab === "bundles"
              ? { ["--tile-from" as string]: "#3AA0FF", ["--tile-to" as string]: "#0A5BFF", borderRadius: "9999px" }
              : undefined
          }
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
                  {expiringSoon.length} Vorlage(n) laufen bald ab oder sind überschritten — bitte prüfen, ob der Inhalt
                  noch aktuell ist.
                </span>
              </div>
            )}

            <div className="uv-list-zebra rounded-3xl border border-border overflow-hidden">
              {trainings.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                  {resolveDynamicIcon("training", t.icon) ? (
                    <IconImg src={resolveDynamicIcon("training", t.icon)!} size="md" />
                  ) : (
                    <span className="text-lg">{t.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-foreground/65">
                      Erstellt: {t.erstelltAm} · Läuft ab: {t.ablaufdatum}
                      {ruecklauf(t.id).gesamt > 0 && (
                        <>
                          {" "}
                          · {ruecklauf(t.id).signiert} von {ruecklauf(t.id).gesamt} zurück
                        </>
                      )}
                    </p>
                    {erinnernHinweis?.id === t.id && <p className="text-xs text-foreground/70 mt-1">{erinnernHinweis.text}</p>}
                  </div>
                  {t.status === "laeuft_ab" && (
                    <span className="text-xs rounded-full bg-amber-500/15 text-amber-700 px-3 py-1">Läuft bald ab</span>
                  )}
                  {t.status === "abgelaufen" && (
                    <span className="text-xs rounded-full bg-red-500/15 text-red-700 px-3 py-1">Abgelaufen</span>
                  )}
                  <button
                    onClick={() => setAssigningTraining(t)}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                    aria-label={`${t.name} — an Mitarbeiter verteilen`}
                  >
                    <Send size={14} />
                  </button>
                  <button
                    onClick={() => setEditingTraining(t)}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                    aria-label={`${t.name} — bearbeiten`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTraining(t.id, t.name)}
                    disabled={deletingId === t.id}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                    aria-label={`${t.name} — löschen`}
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                      aria-label={`${t.name} — weitere Aktionen`}
                      aria-expanded={openMenuId === t.id}
                    >
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === t.id && (
                      <>
                        <button
                          aria-label="Menü schließen"
                          onClick={() => setOpenMenuId(null)}
                          className="fixed inset-0 z-40 cursor-default"
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-2xl border border-border bg-background shadow-lg py-1.5">
                          <button
                            onClick={() => {
                              printTraining(t);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-surface"
                          >
                            <Printer size={14} className="text-blue-500" />
                            Drucken / teilen
                          </button>
                          {offeneZuweisungen(t.id) > 0 && (
                            <button
                              onClick={() => {
                                handleErneutErinnern(t.id, t.name);
                                setOpenMenuId(null);
                              }}
                              disabled={erinnernId === t.id}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-surface disabled:opacity-40"
                            >
                              <Bell size={14} className="text-blue-500" />
                              Erneut erinnern ({offeneZuweisungen(t.id)})
                            </button>
                          )}
                          {offeneZuweisungen(t.id) > 0 && (
                            <button
                              onClick={() => {
                                handleWithdrawTraining(t.id, t.name);
                                setOpenMenuId(null);
                              }}
                              disabled={deletingId === t.id}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left text-amber-600 hover:bg-surface disabled:opacity-40"
                            >
                              <Undo2 size={14} />
                              Verteilung zurückziehen
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundles.map((b) => (
              <div key={b.id} className="uv-glass-panel p-5" style={{ ["--glow" as string]: "var(--uv-glow-cyan)" }}>
                <div className="flex items-start justify-between">
                  {resolveDynamicIcon("category", b.icon) ? (
                    <IconImg src={resolveDynamicIcon("category", b.icon)!} size="md" />
                  ) : (
                    <span className="text-2xl">{b.icon}</span>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssigningBundle(b)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                      aria-label={`${b.name} — an Mitarbeiter verteilen`}
                    >
                      <Send size={14} />
                    </button>
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
                <p className="text-sm text-foreground/65">{b.trainingIds.length} Unterweisung(en)</p>
              </div>
            ))}
            {bundles.length === 0 && (
              <p className="text-foreground/65 text-sm text-center col-span-full mt-6">Noch keine Bundles angelegt.</p>
            )}
          </div>
        )}
      </Card>

      {showTrainingWizard && <NewTrainingWizard onClose={() => setShowTrainingWizard(false)} />}
      {showBundleWizard && <NewBundleWizard onClose={() => setShowBundleWizard(false)} />}
      {editingTraining && <EditTrainingModal training={editingTraining} onClose={() => setEditingTraining(null)} />}
      {editingBundle && <EditBundleModal bundle={editingBundle} onClose={() => setEditingBundle(null)} />}
      {assigningBundle && <AssignBundleModal bundle={assigningBundle} onClose={() => setAssigningBundle(null)} />}
      {assigningTraining && <AssignTrainingModal training={assigningTraining} onClose={() => setAssigningTraining(null)} />}
    </>
  );
}
