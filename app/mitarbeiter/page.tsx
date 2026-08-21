"use client";

// Mitarbeiter -- Liste nach Abteilung gruppiert (App-Parität,
// chef/components/MitarbeiterScreen.tsx: "Reihenfolge = angelegte
// Abteilungen, MA ohne Abteilung als letzte Gruppe"), Karte mit
// Status-Tönung + zwei Info-Feldern (Unterweisungen/Qualifikationen)
// statt Badge+Icon-Leiste.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, Settings2, MoreHorizontal, ChevronRight, Crown, RotateCcw } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewEmployeeWizard } from "@/components/NewEmployeeWizard";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { EditCategoryModal } from "@/components/EditCategoryModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { Icon3D } from "@/components/Icon3D";
import { type Category, type Employee } from "@/lib/types";
import { useAppData } from "@/lib/store";
import { IconImg } from "@/components/Icon3D";
import { resolveDynamicIcon } from "@/lib/icons";

export default function MitarbeiterPage() {
  const router = useRouter();
  const { employees, categories, deleteEmployee, setEmployeeArchived, deleteCategory } =
    useAppData();
  const [query, setQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [tab, setTab] = useState<"aktiv" | "archiviert">("aktiv");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    | { type: "archive"; id: string; name: string }
    | { type: "deleteForever"; id: string; name: string }
    | { type: "deleteCategory"; id: string; name: string }
    | null
  >(null);

  const active = employees.filter((e) => !e.archiviert);
  const archived = employees.filter((e) => e.archiviert);

  function confirmArchive(id: string, name: string) {
    setPendingAction({ type: "archive", id, name });
  }

  function confirmDeleteForever(id: string, name: string) {
    setPendingAction({ type: "deleteForever", id, name });
  }

  function confirmDeleteCategory(id: string, name: string) {
    setPendingAction({ type: "deleteCategory", id, name });
  }

  async function handleDelete(id: string) {
    setPendingAction(null);
    setDeletingId(id);
    try {
      await setEmployeeArchived(id, true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Archivieren fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteForever(id: string) {
    setPendingAction(null);
    setDeletingId(id);
    try {
      await deleteEmployee(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Löschen fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestore(id: string) {
    setDeletingId(id);
    try {
      await setEmployeeArchived(id, false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Wiederherstellen fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteCategory(id: string) {
    setPendingAction(null);
    setDeletingCategoryId(id);
    try {
      await deleteCategory(id);
    } finally {
      setDeletingCategoryId(null);
    }
  }

  const base = tab === "aktiv" ? active : archived;

  const filtered = useMemo(
    () =>
      base
        .filter((e) =>
          `${e.vorname} ${e.nachname} ${e.personalnummer}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        // Ampel-Sortierung: Rot zuerst, dann nach offenen Punkten (App-Parität)
        .sort((a, b) =>
          a.ampel === b.ampel ? b.offenePunkte - a.offenePunkte : a.ampel === "rot" ? -1 : 1
        ),
    [base, query]
  );

  // Nach Abteilung gruppiert (App-Parität, MitarbeiterScreen.tsx:105-117):
  // Reihenfolge = angelegte Abteilungen, MA ohne Abteilung als letzte Gruppe.
  const groups = useMemo(() => {
    const result: { key: string; label: string; cat: Category | null; list: Employee[] }[] = [];
    for (const c of categories) {
      const list = filtered.filter((e) => e.kategorie === c.name);
      if (list.length > 0) result.push({ key: c.id, label: c.name, cat: c, list });
    }
    const rest = filtered.filter((e) => !categories.some((c) => c.name === e.kategorie));
    if (rest.length > 0) result.push({ key: "__ohne__", label: "Ohne Abteilung", cat: null, list: rest });
    return result;
  }, [filtered, categories]);

  return (
    <DashboardShell>
      <PageHeader
        title="Mitarbeiter"
        subtitle="Alle Mitarbeiter deiner Firma — nach Abteilung gruppiert."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategories((v) => !v)}
              className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
              aria-label="Kategorien verwalten"
              title="Kategorien verwalten"
            >
              <Settings2 size={18} />
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="h-11 w-11 rounded-full text-white text-2xl flex items-center justify-center leading-none"
              style={{ background: "var(--accent-gradient)" }}
              aria-label="Neuen Mitarbeiter anlegen"
            >
              +
            </button>
          </div>
        }
      />

      {showCategories && (
        <Card>
          <h2 className="font-medium mb-4">Kategorien verwalten</h2>
          <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                {resolveDynamicIcon("category", c.icon) ? (
                  <IconImg src={resolveDynamicIcon("category", c.icon)!} size="xs" />
                ) : (
                  <span className="text-lg">{c.icon}</span>
                )}
                <p className="flex-1 min-w-0 font-medium truncate">{c.name}</p>
                <button
                  onClick={() => setEditingCategory(c)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                  aria-label="Bearbeiten"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => confirmDeleteCategory(c.id, c.name)}
                  disabled={deletingCategoryId === c.id}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                  aria-label="Löschen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-foreground/65 text-sm text-center py-6">
                Noch keine Kategorien angelegt.
              </p>
            )}
          </div>
        </Card>
      )}

      <Card>
        {/* Reiter Aktiv/Archiviert — ersetzt den früheren Schalter unten */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => setTab("aktiv")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === "aktiv" ? "text-white" : "border border-border text-foreground/70"
            }`}
            style={tab === "aktiv" ? { background: "var(--accent-gradient)" } : undefined}
          >
            Aktiv ({active.length})
          </button>
          <button
            onClick={() => setTab("archiviert")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === "archiviert" ? "text-white" : "border border-border text-foreground/70"
            }`}
            style={tab === "archiviert" ? { background: "var(--accent-gradient)" } : undefined}
          >
            Archiviert ({archived.length})
          </button>
        </div>

        <div className="relative w-full max-w-sm mb-6">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/65"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name oder MA-Nummer"
            className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-sm outline-none focus:border-foreground/30"
          />
        </div>

        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="flex items-center gap-3 mb-2.5">
                <p className="text-xs font-semibold tracking-widest text-foreground/50 uppercase shrink-0">
                  {g.label} · {g.list.length}
                </p>
                <div className="flex-1 h-px bg-border" />
                {g.cat && (
                  <button
                    onClick={() => setEditingCategory(g.cat)}
                    className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-foreground/30 shrink-0"
                    aria-label={`Abteilung ${g.label} bearbeiten`}
                  >
                    <MoreHorizontal size={14} className="text-foreground/50" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {g.list.map((e) => {
                  const attention = tab === "aktiv" && e.offenePunkte > 0;
                  // Status-Tönung (F6, App-Parität): rot=offen, grün=erledigt,
                  // archiviert = neutral + gedimmt statt Statusfarbe.
                  const tintColor = tab === "archiviert" ? null : attention ? "var(--ampel-red)" : "var(--ampel-green)";
                  return (
                    <div
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/mitarbeiter/${e.id}`)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          router.push(`/mitarbeiter/${e.id}`);
                        }
                      }}
                      style={{
                        background: tintColor ? `color-mix(in srgb, ${tintColor} 10%, transparent)` : undefined,
                      }}
                      className={`btn-feedback rounded-2xl border border-border shadow-sm cursor-pointer hover:bg-surface px-5 py-3.5 ${
                        tab === "archiviert" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {e.istBeauftragter ? (
                          <div
                            className="rounded-full p-[2px] shrink-0"
                            style={{ background: "var(--accent-gradient)" }}
                          >
                            <div className="rounded-full bg-background p-[2px]">
                              <EmployeeAvatar
                                vorname={e.vorname}
                                nachname={e.nachname}
                                fotoUrl={e.fotoUrl}
                                size={40}
                                grayscale={tab === "archiviert"}
                              />
                            </div>
                          </div>
                        ) : (
                          <EmployeeAvatar
                            vorname={e.vorname}
                            nachname={e.nachname}
                            fotoUrl={e.fotoUrl}
                            size={44}
                            grayscale={tab === "archiviert"}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">
                              {e.vorname} {e.nachname}
                            </p>
                            {e.istBeauftragter && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-violet-500">
                                <Crown size={10} /> Leitung
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/65 mt-0.5">
                            {[e.kategorie, e.personalnummer].filter(Boolean).join(" · ") || "—"}
                          </p>
                        </div>
                        {tab === "aktiv" ? (
                          <>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setEditing(e);
                              }}
                              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30 shrink-0"
                              aria-label="Bearbeiten"
                            >
                              <Pencil size={14} className="text-blue-500" />
                            </button>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                confirmArchive(e.id, `${e.vorname} ${e.nachname}`);
                              }}
                              disabled={deletingId === e.id}
                              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-600 hover:border-red-300 disabled:opacity-40 shrink-0"
                              aria-label="Löschen"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleRestore(e.id);
                              }}
                              disabled={deletingId === e.id}
                              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30 disabled:opacity-40 shrink-0"
                              aria-label="Wiederherstellen"
                              title="Wiederherstellen"
                            >
                              <RotateCcw size={14} className="text-violet-500" />
                            </button>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                confirmDeleteForever(e.id, `${e.vorname} ${e.nachname}`);
                              }}
                              disabled={deletingId === e.id}
                              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-600 hover:border-red-300 disabled:opacity-40 shrink-0"
                              aria-label="Endgültig löschen"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        <ChevronRight size={16} className="text-foreground/40 shrink-0" />
                      </div>

                      {/* Zwei Info-Felder (App-Parität, MitarbeiterScreen.tsx:307-334):
                          Unterweisungen-Status + Qualifikationen-Anzahl. */}
                      {tab === "aktiv" && (
                        <div className="grid grid-cols-2 gap-2.5 mt-3">
                          <div
                            className="flex items-center gap-2 rounded-xl px-3 py-2"
                            style={{
                              background: attention
                                ? "color-mix(in srgb, var(--ampel-red) 12%, transparent)"
                                : "color-mix(in srgb, var(--ampel-green) 12%, transparent)",
                            }}
                          >
                            <Icon3D name={attention ? "unterweisungen" : "erledigt"} size="xs" />
                            <div className="min-w-0">
                              <p
                                className="text-xs font-semibold truncate"
                                style={{ color: attention ? "var(--ampel-red)" : "var(--ampel-green)" }}
                              >
                                {attention ? `${e.offenePunkte} offen` : "Alles erledigt"}
                              </p>
                              <p className="text-[10px] text-foreground/50">Unterweisungen</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
                            <Icon3D name="qualifikation" size="xs" />
                            <p className="text-xs font-semibold text-blue-500 truncate">
                              {e.qualifikationsIcons.length > 0 ? `${e.qualifikationsIcons.length} Quali` : "Keine Quali"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="px-5 py-6 text-sm text-foreground/65 text-center rounded-2xl border border-border">
              {tab === "aktiv" ? "Keine Mitarbeiter gefunden." : "Keine archivierten Mitarbeiter."}
            </p>
          )}
        </div>
      </Card>

      {showWizard && <NewEmployeeWizard onClose={() => setShowWizard(false)} />}
      {editing && (
        <EditEmployeeModal employee={editing} onClose={() => setEditing(null)} />
      )}
      {editingCategory && (
        <EditCategoryModal category={editingCategory} onClose={() => setEditingCategory(null)} />
      )}
      {pendingAction?.type === "archive" && (
        <ConfirmModal
          title="Mitarbeiter archivieren"
          message={`${pendingAction.name} archivieren (z.B. bei Kündigung)? Nachweise und Daten bleiben erhalten und sind über den Reiter „Archiviert" erreichbar.`}
          confirmLabel="Archivieren"
          onConfirm={() => handleDelete(pendingAction.id)}
          onClose={() => setPendingAction(null)}
        />
      )}
      {pendingAction?.type === "deleteForever" && (
        <ConfirmModal
          title="Mitarbeiter endgültig löschen"
          message={`${pendingAction.name} endgültig löschen? Persönliche Daten und noch offene (unsignierte) Zuweisungen werden entfernt. Bereits signierte, aufbewahrungspflichtige Nachweise bleiben davon unberührt bestehen -- in dem Fall ist nur Archivieren möglich. Das lässt sich nicht rückgängig machen.`}
          confirmLabel="Endgültig löschen"
          danger
          onConfirm={() => handleDeleteForever(pendingAction.id)}
          onClose={() => setPendingAction(null)}
        />
      )}
      {pendingAction?.type === "deleteCategory" && (
        <ConfirmModal
          title="Kategorie löschen"
          message={`Kategorie "${pendingAction.name}" wirklich löschen? Mitarbeiter behalten die Kategorie als Text, bis sie neu zugeordnet werden.`}
          confirmLabel="Löschen"
          danger
          onConfirm={() => handleDeleteCategory(pendingAction.id)}
          onClose={() => setPendingAction(null)}
        />
      )}
    </DashboardShell>
  );
}
