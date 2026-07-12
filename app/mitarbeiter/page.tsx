"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, Settings2, ChevronRight } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NewEmployeeWizard } from "@/components/NewEmployeeWizard";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { EditCategoryModal } from "@/components/EditCategoryModal";
import { QualiIcons } from "@/components/QualiIcons";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { type Category, type Employee } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const active = employees.filter((e) => !e.archiviert);
  const archived = employees.filter((e) => e.archiviert);

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `${name} archivieren (z.B. bei Kündigung)? Nachweise und Daten bleiben erhalten und sind über den Reiter „Archiviert" erreichbar.`
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

  // Grundmenge je Reiter; Kategorie-Filter als Chips darüber (statt der
  // früheren gestapelten Kategorie-Blöcke — eine flache, gefilterte Liste).
  const base = tab === "aktiv" ? active : archived;

  const categoryChips = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, count: base.filter((e) => e.kategorie === c.name).length }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count),
    [base, categories]
  );

  const filtered = useMemo(
    () =>
      base
        .filter((e) => !categoryFilter || e.kategorie === categoryFilter)
        .filter((e) =>
          `${e.vorname} ${e.nachname} ${e.personalnummer}`
            .toLowerCase()
            .includes(query.toLowerCase())
        ),
    [base, categoryFilter, query]
  );

  return (
    <DashboardShell>
      <PageHeader
        title="Mitarbeiter"
        subtitle="Alle Mitarbeiter deiner Firma — nach Kategorie filterbar."
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
            onClick={() => {
              setTab("aktiv");
              setCategoryFilter(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === "aktiv" ? "text-white" : "border border-border text-foreground/70"
            }`}
            style={tab === "aktiv" ? { background: "var(--accent-gradient)" } : undefined}
          >
            Aktiv ({active.length})
          </button>
          <button
            onClick={() => {
              setTab("archiviert");
              setCategoryFilter(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === "archiviert" ? "text-white" : "border border-border text-foreground/70"
            }`}
            style={tab === "archiviert" ? { background: "var(--accent-gradient)" } : undefined}
          >
            Archiviert ({archived.length})
          </button>
        </div>

        <div className="relative w-full max-w-sm mb-4">
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

        {/* Kategorie-Filter als Chips statt gestapelter Gruppen-Blöcke */}
        {categoryChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`rounded-full px-3.5 py-1.5 text-sm ${
                !categoryFilter ? "text-white" : "border border-border text-foreground/70"
              }`}
              style={!categoryFilter ? { background: "var(--accent-gradient)" } : undefined}
            >
              Alle ({base.length})
            </button>
            {categoryChips.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.name)}
                className={`rounded-full px-3.5 py-1.5 text-sm ${
                  categoryFilter === c.name
                    ? "text-white"
                    : "border border-border text-foreground/70"
                }`}
                style={
                  categoryFilter === c.name ? { background: "var(--accent-gradient)" } : undefined
                }
              >
                {c.icon} {c.name} ({c.count})
              </button>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-border divide-y divide-border overflow-hidden">
          {filtered.map((e) => (
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
              className={`btn-feedback flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-surface ${
                tab === "archiviert" ? "opacity-60" : ""
              }`}
            >
              <div
                className="relative shrink-0"
                title={
                  tab === "archiviert"
                    ? "Archiviert"
                    : e.offenePunkte > 0
                      ? `${e.offenePunkte} offene Unterweisung(en)`
                      : "Alles unterschrieben"
                }
              >
                <EmployeeAvatar
                  vorname={e.vorname}
                  nachname={e.nachname}
                  fotoUrl={e.fotoUrl}
                  size={40}
                  grayscale={tab === "archiviert"}
                />
                {tab === "aktiv" &&
                  (e.offenePunkte > 0 ? (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-background">
                      {e.offenePunkte}
                    </span>
                  ) : (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
                      style={{ background: "var(--ampel-green)" }}
                    />
                  ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">
                    {e.vorname} {e.nachname}
                  </p>
                  {tab === "aktiv" && <QualiIcons icons={e.qualifikationsIcons} />}
                </div>
                <p className="text-xs text-foreground/65">
                  {e.kategorie || "—"}
                  {e.personalnummer ? ` · ${e.personalnummer}` : ""}
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
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(e.id, `${e.vorname} ${e.nachname}`);
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
                      setEmployeeArchived(e.id, false);
                    }}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30 shrink-0"
                    aria-label="Wiederherstellen"
                    title="Wiederherstellen"
                  >
                    ♻️
                  </button>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeleteForever(e.id, `${e.vorname} ${e.nachname}`);
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
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-6 text-sm text-foreground/65 text-center">
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
    </DashboardShell>
  );
}
