"use client";

import { useState } from "react";
import { initials, CATEGORY_ICON_OPTIONS, istMinderjaehrig as isMinderjaehrig, type Employee } from "@/lib/mockData";
import { useAppData } from "@/lib/store";
import { Switch } from "@/components/Switch";
import { DateSelect } from "@/components/DateSelect";

export function EditEmployeeModal({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  const { categories, employees, updateEmployee, uploadEmployeePhoto, addCategory } = useAppData();
  // Immer den LIVE-Stand aus dem Store lesen (sonst zeigt das Fenster nach
  // dem Foto-Upload wieder den alten Stand ohne Foto).
  const live = employees.find((e) => e.id === employee.id) ?? employee;
  const [uploading, setUploading] = useState(false);
  const [vorname, setVorname] = useState(employee.vorname);
  const [nachname, setNachname] = useState(employee.nachname);
  const [personalnummer, setPersonalnummer] = useState(employee.personalnummer);
  const [email, setEmail] = useState(employee.email ?? "");
  const [telefon, setTelefon] = useState(employee.telefon ?? "");
  const [geburtsdatum, setGeburtsdatum] = useState(employee.geburtsdatum ?? "");
  const [kategorie, setKategorie] = useState(employee.kategorie);
  const [istBeauftragter, setIstBeauftragter] = useState(employee.istBeauftragter);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Inline neue Kategorie anlegen (wie im Neu-Assistenten)
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  async function handleCreateCategory() {
    if (!newCategoryIcon || newCategoryName.trim() === "") return;
    setCreatingCategory(true);
    setError(null);
    try {
      await addCategory({ name: newCategoryName.trim(), icon: newCategoryIcon });
      setKategorie(newCategoryName.trim());
      setShowNewCategory(false);
      setNewCategoryName("");
      setNewCategoryIcon(null);
    } catch {
      setError("Kategorie anlegen fehlgeschlagen.");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateEmployee(employee.id, {
        vorname,
        nachname,
        personalnummer,
        email: email.trim() || null,
        telefon: telefon.trim() || null,
        geburtsdatum: geburtsdatum || null,
        kategorie,
        istBeauftragter,
      });
      onClose();
    } catch {
      setError("Speichern fehlgeschlagen. Bist du als Beauftragte/r eingeloggt?");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadEmployeePhoto(employee.id, file);
    } catch {
      setError("Foto-Upload fehlgeschlagen. Ist der Datei-Speicher (Migration 0010) eingerichtet?");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mitarbeiter bearbeiten</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="flex flex-col items-center mb-5">
          <div className="relative">
            {live.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={live.fotoUrl}
                alt="Foto"
                className="h-20 w-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                style={{ background: "var(--accent-gradient)" }}
              >
                {initials(vorname, nachname)}
              </div>
            )}
            <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full text-white flex items-center justify-center text-sm cursor-pointer" style={{ background: "var(--accent-gradient)" }}>
              +
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <p className="text-xs text-foreground/65 mt-2">{uploading ? "Lädt Foto hoch…" : "Foto ändern"}</p>
        </div>

        <div className="space-y-3">
          <input
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            placeholder="Vorname"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={nachname}
            onChange={(e) => setNachname(e.target.value)}
            placeholder="Nachname"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={personalnummer}
            onChange={(e) => setPersonalnummer(e.target.value)}
            placeholder="Mitarbeiternummer"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail (für App-Login, optional)"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            type="tel"
            placeholder="Telefon (Alternative/Kontakt, optional)"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <div>
            <span className="text-xs text-foreground/65 mb-1 block">
              Geburtsdatum (für minderjährige Mitarbeiter)
            </span>
            <DateSelect value={geburtsdatum} onChange={setGeburtsdatum} minYear={1940} maxYear={2015} />
            {geburtsdatum && isMinderjaehrig(geburtsdatum) && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Minderjährig — Unterweisungen 2× jährlich erforderlich.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setKategorie(c.name)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    kategorie === c.name ? "text-white" : "border border-border text-foreground/70"
                  }`}
                  style={kategorie === c.name ? { background: "var(--accent-gradient)" } : undefined}
                >
                  {c.icon} {c.name}
                </button>
              ))}
              <button
                onClick={() => setShowNewCategory((v) => !v)}
                className={`rounded-full px-4 py-2 text-sm border ${
                  showNewCategory
                    ? "border-foreground/50 bg-surface"
                    : "border-dashed border-border text-foreground/65"
                }`}
              >
                + Neue Kategorie
              </button>
            </div>

            {showNewCategory && (
              <div className="mt-3 rounded-2xl bg-surface p-3">
                <div className="grid grid-cols-6 gap-2 mb-3 max-h-32 overflow-y-auto pr-1">
                  {CATEGORY_ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      title={opt.name}
                      onClick={() => {
                        setNewCategoryIcon(opt.icon);
                        if (newCategoryName.trim() === "" && !opt.name.startsWith("Sonstiges")) {
                          setNewCategoryName(opt.name);
                        }
                      }}
                      className={`h-10 rounded-xl border text-lg flex items-center justify-center ${
                        newCategoryIcon === opt.icon
                          ? "border-foreground/50 bg-background"
                          : "border-border"
                      }`}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Name der Kategorie"
                  className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none mb-3"
                />
                <button
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryIcon || newCategoryName.trim() === ""}
                  className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {creatingCategory ? "Legt an…" : "Kategorie anlegen"}
                </button>
              </div>
            )}
          </div>

          <div
            className={`flex items-center justify-between gap-3 mt-2 rounded-2xl border p-4 ${
              istBeauftragter ? "border-green-400 bg-green-500/10" : "border-border"
            }`}
          >
            <div>
              <p className="text-sm font-medium">Beauftragte/r</p>
              <p className="text-xs text-foreground/65 mt-0.5">
                Darf alle Mitarbeiter der Firma einsehen und verwalten (Chef-Zugriff)
              </p>
            </div>
            <Switch
              checked={istBeauftragter}
              activeColor="#22c55e"
              label="Beauftragte/r — Chef-Zugriff"
              onChange={(next) => {
                if (next) {
                  const ok = window.confirm(
                    `${vorname} ${nachname} als Beauftragte/n markieren? Diese Person kann dann ALLE Mitarbeiter der Firma einsehen und verwalten — auch Gehaltssensibles wie Qualifikationen und Kontaktdaten.`
                  );
                  if (!ok) return;
                }
                setIstBeauftragter(next);
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || vorname.trim() === "" || nachname.trim() === ""}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
