"use client";

import { useState } from "react";
import { CATEGORY_ICON_OPTIONS, QUALIFICATION_PRESETS, istMinderjaehrig as isMinderjaehrig } from "@/lib/types";
import { useAppData } from "@/lib/store";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { DateSelect } from "@/components/DateSelect";

export function NewEmployeeWizard({ onClose }: { onClose: () => void }) {
  useEscapeClose(onClose);
  const {
    trainings,
    bundles,
    categories,
    addEmployee,
    addCategory,
    assignTraining,
    addQualification,
    uploadEmployeePhoto,
  } = useAppData();
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [personalnummer, setPersonalnummer] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [kategorie, setKategorie] = useState<string | null>(null);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryIcon, setNewCategoryIcon] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [zuweisungModus, setZuweisungModus] = useState<"bundle" | "einzeln">("bundle");
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([]);
  const [qualificationDates, setQualificationDates] = useState<Record<string, string>>({});
  const [customQualification, setCustomQualification] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const matchingBundle = bundles.find((b) => b.name === kategorie);
  const canSave = vorname.trim() !== "" && nachname.trim() !== "" && kategorie !== null;

  function toggleTraining(id: string) {
    setSelectedTrainings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function toggleQualification(name: string) {
    setSelectedQualifications((prev) =>
      prev.includes(name) ? prev.filter((q) => q !== name) : [...prev, name]
    );
  }

  async function handleCreateCategory() {
    if (!newCategoryIcon || newCategoryName.trim() === "") return;
    setCreatingCategory(true);
    try {
      await addCategory({ name: newCategoryName, icon: newCategoryIcon });
      setKategorie(newCategoryName);
      setShowNewCategory(false);
      setNewCategoryIcon(null);
      setNewCategoryName("");
    } catch {
      setError("Kategorie anlegen fehlgeschlagen.");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      const employee = await addEmployee({
        vorname,
        nachname,
        personalnummer,
        email: email.trim() || null,
        telefon: telefon.trim() || null,
        geburtsdatum: geburtsdatum || null,
        kategorie: kategorie ?? categories[0]?.name ?? "Sonstiges",
        istBeauftragter: false,
      });

      const trainingIdsToAssign =
        zuweisungModus === "bundle" ? matchingBundle?.trainingIds ?? [] : selectedTrainings;
      for (const trainingId of trainingIdsToAssign) {
        await assignTraining(trainingId, [employee.id]);
      }

      for (const qualificationName of selectedQualifications) {
        await addQualification({
          employeeId: employee.id,
          name: qualificationName,
          ablaufdatum: qualificationDates[qualificationName] || null,
        });
      }

      if (photoFile) {
        try {
          await uploadEmployeePhoto(employee.id, photoFile);
        } catch {
          // Mitarbeiter ist trotzdem angelegt — Foto kann später über
          // "Bearbeiten" nachgetragen werden, kein Abbruch nötig.
        }
      }

      setDone(true);
    } catch {
      setError("Anlegen fehlgeschlagen. Bitte prüfe, ob du als Beauftragte/r eingeloggt bist.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8 text-center">
          <p className="text-4xl mb-4">✅</p>
          <p className="font-medium">
            {vorname} {nachname} wurde angelegt.
          </p>
          <p className="text-sm text-foreground/60 mt-2 mb-6">
            Erscheint jetzt in der Mitarbeiter-Liste, dem Dashboard und im Archiv. Ein
            Einladungslink zur Passwortvergabe wurde simuliert an{" "}
            {email || "die angegebene E-Mail"} versendet.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            Schließen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Neuer Mitarbeiter</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Vorschau"
                className="h-24 w-24 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-surface border border-border flex items-center justify-center text-foreground/65 text-sm">
                Foto
              </div>
            )}
            <label
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white flex items-center justify-center text-lg cursor-pointer"
              style={{ background: "var(--accent-gradient)" }}
              aria-label="Foto auswählen"
            >
              +
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
            </label>
          </div>
          <p className="text-xs text-foreground/65 mt-2">
            {photoFile ? "Wird beim Anlegen hochgeladen" : "Foto optional"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              placeholder="Vorname"
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
            />
            <input
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              placeholder="Nachname"
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
            />
          </div>

          <input
            value={personalnummer}
            onChange={(e) => setPersonalnummer(e.target.value)}
            placeholder="Mitarbeiternummer"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail (für App-Login, optional)"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
          />
          <input
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            type="tel"
            placeholder="Telefon (Alternative/Kontakt, optional)"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
          />

          <div>
            <span className="text-xs text-foreground/65 mb-1 block">
              Geburtsdatum — für minderjährige Mitarbeiter (optional)
            </span>
            <DateSelect value={geburtsdatum} onChange={setGeburtsdatum} minYear={1940} maxYear={2015} />
            {geburtsdatum && isMinderjaehrig(geburtsdatum) && (
              <p className="text-xs text-amber-700 mt-2">
                ⚠️ Minderjährig — Unterweisungen 2× jährlich (halbjährlich) erforderlich.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setKategorie(c.name);
                    setShowNewCategory(false);
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    kategorie === c.name ? "text-white" : "border border-border text-foreground/70"
                  }`}
                  style={kategorie === c.name ? { background: "var(--accent-gradient)" } : undefined}
                >
                  {c.icon} {c.name}
                </button>
              ))}
              <button
                type="button"
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
              <div className="mt-3">
                <div className="grid grid-cols-4 gap-2 mb-3 max-h-40 overflow-y-auto pr-1">
                  {CATEGORY_ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => {
                        setNewCategoryIcon(opt.icon);
                        if (newCategoryName.trim() === "" && !opt.name.startsWith("Sonstiges")) {
                          setNewCategoryName(opt.name);
                        }
                      }}
                      className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-center ${
                        newCategoryIcon === opt.icon
                          ? "border-foreground/50 bg-surface"
                          : "border-border"
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-[10px] leading-tight text-foreground/60">
                        {opt.name}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="z.B. Staplerfahrer"
                  className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none mb-3"
                />
                <button
                  type="button"
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

          <div>
            <p className="text-xs text-foreground/65 mb-2">Unterweisungen zuweisen (optional)</p>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setZuweisungModus("bundle")}
                className={`rounded-full px-4 py-2 text-xs ${
                  zuweisungModus === "bundle" ? "bg-surface font-medium" : "text-foreground/60"
                }`}
              >
                Bundle der Abteilung
              </button>
              <button
                type="button"
                onClick={() => setZuweisungModus("einzeln")}
                className={`rounded-full px-4 py-2 text-xs ${
                  zuweisungModus === "einzeln" ? "bg-surface font-medium" : "text-foreground/60"
                }`}
              >
                Einzeln auswählen
              </button>
            </div>

            {zuweisungModus === "bundle" ? (
              matchingBundle ? (
                <div className="flex flex-wrap gap-2">
                  {matchingBundle.trainingIds.length === 0 && (
                    <span className="text-sm text-foreground/65">
                      Dieses Bundle enthält noch keine Unterweisungen.
                    </span>
                  )}
                  {matchingBundle.trainingIds.map((tid) => {
                    const t = trainings.find((tr) => tr.id === tid);
                    return t ? (
                      <span
                        key={tid}
                        className="rounded-full bg-surface border border-border px-3 py-1.5 text-sm"
                      >
                        {t.name}
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-foreground/60">
                  {kategorie
                    ? `Für „${kategorie}" existiert noch kein Bundle — leg eins unter Unterweisungen → Bundles an, oder wähle „Einzeln auswählen".`
                    : "Erst Kategorie wählen, um das passende Bundle zu sehen."}
                </p>
              )
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {trainings.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTrainings.includes(t.id)}
                      onChange={() => toggleTraining(t.id)}
                    />
                    {t.name}
                  </label>
                ))}
                {trainings.length === 0 && (
                  <p className="text-sm text-foreground/65">Noch keine Unterweisungen vorhanden.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-2">Qualifikationen (optional)</p>
            <div className="flex gap-2 mb-2">
              <input
                value={customQualification}
                onChange={(e) => setCustomQualification(e.target.value)}
                placeholder="Eigene Qualifikation frei eingeben…"
                className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
              />
              <button
                type="button"
                onClick={() => {
                  const name = customQualification.trim();
                  if (!name || selectedQualifications.includes(name)) return;
                  setSelectedQualifications((prev) => [...prev, name]);
                  setCustomQualification("");
                }}
                disabled={customQualification.trim() === ""}
                className="rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 shrink-0"
                style={{ background: "var(--accent-gradient)" }}
              >
                + Hinzufügen
              </button>
            </div>
            <p className="text-[11px] text-foreground/65 mb-2">oder aus 20 gängigen wählen:</p>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {QUALIFICATION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => toggleQualification(preset.name)}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    selectedQualifications.includes(preset.name)
                      ? "text-white"
                      : "border border-border text-foreground/70"
                  }`}
                  style={
                    selectedQualifications.includes(preset.name)
                      ? { background: "var(--accent-gradient)" }
                      : undefined
                  }
                >
                  <span className="text-sm">{preset.icon}</span> {preset.name}
                </button>
              ))}
            </div>

            {selectedQualifications.length > 0 && (
              <div className="space-y-3 border-t border-border pt-3 mt-3">
                {selectedQualifications.map((q) => {
                  const preset = QUALIFICATION_PRESETS.find((p) => p.name === q);
                  return (
                    <div key={q} className="flex items-center gap-3">
                      <span className="text-sm flex-1 flex items-center gap-2">
                        <span className="text-base">{preset?.icon ?? "📋"}</span>
                        {q}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleQualification(q)}
                        className="text-xs text-foreground/65 hover:text-red-600"
                        aria-label={`${q} entfernen`}
                      >
                        Entfernen
                      </button>
                    </div>
                  );
                })}
                <div className="pt-1">
                  <p className="text-xs text-foreground/65 mb-2">Ablaufdatum je Qualifikation (optional)</p>
                  <div className="space-y-2">
                    {selectedQualifications.map((q) => (
                      <div key={q} className="flex items-center gap-2">
                        <span className="text-xs text-foreground/60 w-24 truncate shrink-0">{q}</span>
                        <DateSelect
                          value={qualificationDates[q] ?? ""}
                          onChange={(v) => setQualificationDates((prev) => ({ ...prev, [q]: v }))}
                          minYear={2024}
                          maxYear={2045}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={saving || !canSave}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Legt an…" : "Mitarbeiter anlegen"}
        </button>
      </div>
    </div>
  );
}
