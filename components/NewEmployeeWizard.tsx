"use client";

import { useState } from "react";
import { WizardShell } from "@/components/WizardShell";
import { CATEGORY_ICON_OPTIONS, istMinderjaehrig as isMinderjaehrig } from "@/lib/mockData";
import { useAppData } from "@/lib/store";

const STEP_LABELS = [
  "Persönliche Daten",
  "Profilbild",
  "Kategorie",
  "Unterweisungen",
  "Qualifikationen",
  "Zusammenfassung",
];

const QUALIFICATION_OPTIONS = ["Ersthelfer", "Sonstiges…", "Brandschutzhelfer", "Staplerschein"];

export function NewEmployeeWizard({ onClose }: { onClose: () => void }) {
  const { trainings, bundles, categories, addEmployee, addCategory, assignTraining, addQualification } =
    useAppData();
  const [step, setStep] = useState(0);
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
  const [done, setDone] = useState(false);

  const canProceedStep0 = vorname.trim() !== "" && nachname.trim() !== "";
  const canProceedStep2 = kategorie !== null;

  const matchingBundle = bundles.find((b) => b.name === kategorie);

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

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

      setDone(true);
    } catch {
      setError("Anlegen fehlgeschlagen. Bitte prüfe, ob du als Beauftragte/r eingeloggt bist.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <WizardShell
        title="Mitarbeiter angelegt"
        stepCount={STEP_LABELS.length}
        currentStep={STEP_LABELS.length - 1}
        onBack={() => {}}
        onNext={onClose}
        onCancel={onClose}
        nextLabel="Schließen"
      >
        <div className="text-center py-8">
          <p className="text-4xl mb-4">✅</p>
          <p className="font-medium">
            {vorname} {nachname} wurde angelegt.
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            Erscheint jetzt in der Mitarbeiter-Liste, dem Dashboard und im Archiv. Ein
            Einladungslink zur Passwortvergabe wurde simuliert an{" "}
            {email || "die angegebene E-Mail"} versendet.
          </p>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell
      title="Neuer Mitarbeiter"
      stepCount={STEP_LABELS.length}
      currentStep={step}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => {
        if (step >= STEP_LABELS.length - 1) {
          handleFinish();
        } else {
          setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
        }
      }}
      onCancel={onClose}
      nextLabel={
        step === STEP_LABELS.length - 1
          ? saving
            ? "Speichert…"
            : "Mitarbeiter anlegen"
          : "Weiter"
      }
      nextDisabled={
        saving ||
        (step === 0 && !canProceedStep0) ||
        (step === 2 && !canProceedStep2)
      }
    >
      {error && (
        <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">
          {error}
        </p>
      )}
      <p className="text-xs uppercase tracking-wide text-foreground/40 mb-4">
        Schritt {step + 1} von {STEP_LABELS.length} · {STEP_LABELS[step]}
      </p>

      {step === 0 && (
        <div className="space-y-3">
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
          <input
            type="date"
            value={geburtsdatum}
            onChange={(e) => setGeburtsdatum(e.target.value)}
            min="1940-01-01"
            max="2015-12-31"
            title="Geburtsdatum (für minderjährige Mitarbeiter)"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
          />
          {geburtsdatum && isMinderjaehrig(geburtsdatum) && (
            <p className="text-xs text-amber-600">
              ⚠️ Minderjährig — Unterweisungen 2× jährlich (halbjährlich) erforderlich.
            </p>
          )}
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
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-surface border border-border flex items-center justify-center text-foreground/30 text-sm">
              Foto
            </div>
            <button
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white flex items-center justify-center text-lg"
              style={{ background: "var(--accent-gradient)" }}
            >
              +
            </button>
          </div>
          <p className="text-xs text-foreground/50 mt-4">Optional — kann später geändert werden</p>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setKategorie(c.name);
                  setShowNewCategory(false);
                }}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  kategorie === c.name
                    ? "text-white"
                    : "border border-border text-foreground/70"
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
                  : "border-dashed border-border text-foreground/50"
              }`}
            >
              + Neue Kategorie
            </button>
          </div>

          {showNewCategory && (
            <div>
              <div className="grid grid-cols-4 gap-2 mb-4 max-h-56 overflow-y-auto pr-1">
                {CATEGORY_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => {
                      setNewCategoryIcon(opt.icon);
                      // Vorschlagsnamen übernehmen (außer den generischen „Sonstiges"-Platzhaltern),
                      // damit der Name nicht leer bleibt und „Anlegen" freigeschaltet wird.
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
      )}

      {step === 3 && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setZuweisungModus("bundle")}
              className={`rounded-full px-4 py-2 text-sm ${
                zuweisungModus === "bundle" ? "bg-surface font-medium" : "text-foreground/60"
              }`}
            >
              Bundle der Abteilung
            </button>
            <button
              onClick={() => setZuweisungModus("einzeln")}
              className={`rounded-full px-4 py-2 text-sm ${
                zuweisungModus === "einzeln" ? "bg-surface font-medium" : "text-foreground/60"
              }`}
            >
              Einzeln auswählen
            </button>
          </div>

          {zuweisungModus === "bundle" ? (
            matchingBundle ? (
              <div>
                <p className="text-sm text-foreground/60 mb-2">Enthält:</p>
                <div className="flex flex-wrap gap-2">
                  {matchingBundle.trainingIds.length === 0 && (
                    <span className="text-sm text-foreground/40">
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
              </div>
            ) : (
              <p className="text-sm text-foreground/60">
                Für „{kategorie ?? "—"}" existiert noch kein Bundle — leg eins unter
                Unterweisungen → Bundles an, oder wähle „Einzeln auswählen".
              </p>
            )
          ) : (
            <div className="space-y-2">
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
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          {QUALIFICATION_OPTIONS.map((q) => (
            <div key={q} className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={selectedQualifications.includes(q)}
                  onChange={() => toggleQualification(q)}
                />
                {q}
              </label>
              {selectedQualifications.includes(q) && (
                <input
                  type="date"
                  min="1990-01-01"
                  max="2026-12-31"
                  value={qualificationDates[q] ?? ""}
                  onChange={(e) =>
                    setQualificationDates((prev) => ({ ...prev, [q]: e.target.value }))
                  }
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="text-sm space-y-1">
          <p>
            <span className="text-foreground/50">Name:</span> {vorname} {nachname}
          </p>
          <p>
            <span className="text-foreground/50">Mitarbeiternummer:</span>{" "}
            {personalnummer || "—"}
          </p>
          <p>
            <span className="text-foreground/50">E-Mail:</span> {email || "—"}
          </p>
          <p>
            <span className="text-foreground/50">Kategorie:</span> {kategorie ?? "—"}
          </p>
          <p>
            <span className="text-foreground/50">Unterweisungen:</span>{" "}
            {zuweisungModus === "bundle"
              ? "Bundle der Abteilung"
              : `${selectedTrainings.length} einzeln ausgewählt`}
          </p>
          <p>
            <span className="text-foreground/50">Qualifikationen:</span>{" "}
            {selectedQualifications.length > 0 ? selectedQualifications.join(", ") : "—"}
          </p>
        </div>
      )}
    </WizardShell>
  );
}
