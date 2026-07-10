"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, Settings2 } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewEmployeeWizard } from "@/components/NewEmployeeWizard";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { EditCategoryModal } from "@/components/EditCategoryModal";
import { QualiIcons } from "@/components/QualiIcons";
import { initials, type Category, type Employee } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

export default function MitarbeiterPage() {
  const { employees, categories, deleteEmployee, setEmployeeArchived, deleteCategory } =
    useAppData();
  const [query, setQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const archived = employees.filter((e) => e.archiviert);

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `${name} archivieren (z.B. bei Kündigung)? Nachweise und Daten bleiben erhalten und sind über den Regler „Archivierte anzeigen" erreichbar.`
      )
    )
      return;
    setDeletingId(id);
    try {
      await setEmployeeArchived(id, true);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteForever(id: string, name: string) {
    if (
      !confirm(
        `${name} und ALLE Nachweise ENDGÜLTIG löschen? Das kann nicht rückgängig gemacht werden.`
      )
    )
      return;
    setDeletingId(id);
    try {
      await deleteEmployee(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (
      !confirm(
        `Kategorie "${name}" wirklich löschen? Mitarbeiter behalten die Kategorie als Text, bis sie neu zugeordnet werden.`
      )
    )
      return;
    setDeletingCategoryId(id);
    try {
      await deleteCategory(id);
    } finally {
      setDeletingCategoryId(null);
    }
  }

  const grouped = useMemo(() => {
    const filtered = employees.filter(
      (e) =>
        !e.archiviert &&
        `${e.vorname} ${e.nachname} ${e.personalnummer}`
          .toLowerCase()
          .includes(query.toLowerCase())
    );
    return categories
      .map((cat) => ({
        kategorie: cat.name,
        icon: cat.icon,
        employees: filtered.filter((e) => e.kategorie === cat.name),
      }))
      .filter((g) => g.employees.length > 0);
  }, [employees, categories, query]);

  return (
    <DashboardShell>
      <PageHeader
        title="Mitarbeiter"
        subtitle="Alle Mitarbeiter deiner Firma, gruppiert nach Kategorie."
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
                <span className="text-lg">{c.icon}</span>
                <p className="flex-1 min-w-0 font-medium truncate">{c.name}</p>
                <button
                  onClick={() => setEditingCategory(c)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                  aria-label="Bearbeiten"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(c.id, c.name)}
                  disabled={deletingCategoryId === c.id}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                  aria-label="Löschen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-foreground/50 text-sm text-center py-6">
                Noch keine Kategorien angelegt.
              </p>
            )}
          </div>
        </Card>
      )}

      <Card>
        <div className="relative w-full max-w-sm mb-8">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name oder MA-Nummer"
            className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-sm outline-none focus:border-foreground/30"
          />
        </div>

        <div className="space-y-8">
          {grouped.map(({ kategorie, icon, employees }) => (
            <div key={kategorie}>
              <div className="flex items-center gap-2 mb-3">
                <span>{icon}</span>
                <h2 className="font-medium">{kategorie}</h2>
                <span className="text-sm text-foreground/40">({employees.length})</span>
              </div>

              <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
                {employees.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-3">
                    {e.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.fotoUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                        style={{ background: "var(--accent-gradient)" }}
                      >
                        {initials(e.vorname, e.nachname)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">
                          {e.vorname} {e.nachname}
                        </p>
                        <QualiIcons icons={e.qualifikationsIcons} />
                      </div>
                      <p className="text-xs text-foreground/50">{e.personalnummer}</p>
                    </div>
                    <Link
                      href={`/mitarbeiter/${e.id}`}
                      className="text-sm rounded-full border border-border px-3 py-1.5 hover:border-foreground/30"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => setEditing(e)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
                      aria-label="Bearbeiten"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id, `${e.vorname} ${e.nachname}`)}
                      disabled={deletingId === e.id}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                      aria-label="Löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <p className="text-foreground/50 text-sm text-center mt-10">
              Keine Mitarbeiter gefunden.
            </p>
          )}

          {/* Regler: Archivierte/gekündigte Mitarbeiter einblenden */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              role="switch"
              aria-checked={showArchived}
              aria-label="Archivierte Mitarbeiter anzeigen"
              onClick={() => setShowArchived((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                showArchived ? "bg-green-500" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  showArchived ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium">Archivierte anzeigen</p>
              <p className="text-xs text-foreground/50">
                Gekündigte Mitarbeiter ({archived.length}) — Daten bleiben erhalten
              </p>
            </div>
          </div>

          {showArchived && (
            <div>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <span>🗄️</span>
                <h2 className="font-medium">Archiviert / Gekündigt</h2>
                <span className="text-sm text-foreground/40">({archived.length})</span>
              </div>
              <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
                {archived.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-3 opacity-60">
                    {e.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.fotoUrl} alt="" className="h-10 w-10 rounded-full object-cover grayscale" />
                    ) : (
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 bg-foreground/40">
                        {initials(e.vorname, e.nachname)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {e.vorname} {e.nachname}
                      </p>
                      <p className="text-xs text-foreground/50">{e.kategorie || "—"}</p>
                    </div>
                    <button
                      onClick={() => setEmployeeArchived(e.id, false)}
                      className="text-sm rounded-full border border-border px-3 py-1.5 hover:border-foreground/30"
                      aria-label="Wiederherstellen"
                    >
                      ♻️ Wiederherstellen
                    </button>
                    <button
                      onClick={() => handleDeleteForever(e.id, `${e.vorname} ${e.nachname}`)}
                      disabled={deletingId === e.id}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-red-500 hover:border-red-300 disabled:opacity-40"
                      aria-label="Endgültig löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {archived.length === 0 && (
                  <p className="px-5 py-4 text-sm text-foreground/50">
                    Keine archivierten Mitarbeiter.
                  </p>
                )}
              </div>
            </div>
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
    </DashboardShell>
  );
}
