"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { WizardShell } from "@/components/WizardShell";
import { DateSelect } from "@/components/DateSelect";
import { useAppData } from "@/lib/store";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { TRAINING_ICON_OPTIONS, BUNDLE_ICONS, type Training } from "@/lib/mockData";

const STEP_LABELS = ["Methode", "Inhalt", "Beschriftung", "Ablauf", "Speichern"];

function DistributionDialog({
  training,
  onClose,
}: {
  training: Training;
  onClose: () => void;
}) {
  useEscapeClose(onClose);
  const { employees, categories, assignTraining } = useAppData();
  const [tab, setTab] = useState<"mitarbeiter" | "abteilungen">("mitarbeiter");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    employees.map((e) => e.id)
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");

  function toggleEmployee(id: string) {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  async function handleSend() {
    setSending(true);
    try {
      const targetIds =
        tab === "mitarbeiter"
          ? selectedEmployees
          : employees.filter((e) => selectedCategories.includes(e.kategorie)).map((e) => e.id);
      await assignTraining(training.id, targetIds);
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-background border border-border p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-1">„{training.name}" weiterleiten</h2>
        <p className="text-sm text-foreground/60 mb-5">
          An einzelne Mitarbeiter oder ganze Abteilungen senden — kann auch später über die
          Mitarbeiter-Seite nachgeholt werden.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("mitarbeiter")}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === "mitarbeiter" ? "bg-surface font-medium" : "text-foreground/60"
            }`}
          >
            Mitarbeiter
          </button>
          <button
            onClick={() => setTab("abteilungen")}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === "abteilungen" ? "bg-surface font-medium" : "text-foreground/60"
            }`}
          >
            Abteilungen
          </button>
        </div>

        {tab === "mitarbeiter" && (
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/65" />
            <input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Mitarbeiter suchen…"
              className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-sm outline-none"
            />
          </div>
        )}

        <div className="max-h-72 overflow-y-auto space-y-2 mb-6">
          {tab === "mitarbeiter"
            ? employees
                .filter((e) =>
                  `${e.vorname} ${e.nachname}`.toLowerCase().includes(memberQuery.toLowerCase())
                )
                .map((e) => (
                  <label key={e.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(e.id)}
                      onChange={() => toggleEmployee(e.id)}
                    />
                    {e.vorname} {e.nachname}{" "}
                    <span className="text-foreground/65">({e.kategorie})</span>
                  </label>
                ))
            : categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.name)}
                    onChange={() => toggleCategory(c.name)}
                  />
                  {c.icon} {c.name}
                </label>
              ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium border border-border"
          >
            Später
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent-gradient)" }}
          >
            {sending ? "Sendet…" : "Senden"}
          </button>
        </div>
      </div>
    </div>
  );
}


export function NewTrainingWizard({ onClose }: { onClose: () => void }) {
  const { bundles, addTraining, addBundle } = useAppData();
  const [step, setStep] = useState(0);
  const [methode, setMethode] = useState<"upload" | "text" | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [inhalt, setInhalt] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [ablaufdatum, setAblaufdatum] = useState("");
  const [bundleId, setBundleId] = useState<string>("");
  const [showNewBundle, setShowNewBundle] = useState(false);
  const [newBundleIcon, setNewBundleIcon] = useState<string | null>(null);
  const [newBundleName, setNewBundleName] = useState("");
  const [creatingBundle, setCreatingBundle] = useState(false);
  const [savedTraining, setSavedTraining] = useState<Training | null>(null);
  const [showDistribution, setShowDistribution] = useState(false);

  async function handleCreateBundle() {
    if (!newBundleIcon || newBundleName.trim() === "") return;
    setCreatingBundle(true);
    try {
      await addBundle({ name: newBundleName, icon: newBundleIcon, trainingIds: [] });
      setShowNewBundle(false);
      setNewBundleIcon(null);
      setNewBundleName("");
    } catch {
      setError("Bundle anlegen fehlgeschlagen.");
    } finally {
      setCreatingBundle(false);
    }
  }

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsPdf(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    setInhalt(
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        ? ""
        : ""
    );
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      const training = await addTraining({
        name,
        typ: methode === "upload" ? "hochgeladen" : "online",
        icon: icon ?? (methode === "upload" ? "📄" : "✍️"),
        inhalt: inhalt.trim() || null,
        erstelltAm: "—",
        ablaufdatum: ablaufdatum || "—",
        status: "aktuell",
        bundleId: bundleId || null,
      });
      setSavedTraining(training);
      setShowDistribution(true);
    } catch {
      setError("Speichern fehlgeschlagen. Bitte prüfe, ob du als Beauftragte/r eingeloggt bist.");
    } finally {
      setSaving(false);
    }
  }

  if (showDistribution && savedTraining) {
    return <DistributionDialog training={savedTraining} onClose={onClose} />;
  }

  return (
    <WizardShell
      title="Neue Unterweisung"
      stepCount={STEP_LABELS.length}
      currentStep={step}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() =>
        step >= STEP_LABELS.length - 1
          ? handleFinish()
          : setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1))
      }
      onCancel={onClose}
      nextLabel={
        step === STEP_LABELS.length - 1 ? (saving ? "Speichert…" : "Speichern") : "Weiter"
      }
      nextDisabled={
        saving ||
        (step === 0 && !methode) ||
        (step === 1 && methode === "upload" && !fileName) ||
        (step === 1 && methode === "text" && inhalt.trim() === "") ||
        (step === 2 && name.trim() === "")
      }
    >
      {error && (
        <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">
          {error}
        </p>
      )}
      <p className="text-xs uppercase tracking-wide text-foreground/65 mb-4">
        Schritt {step + 1} von {STEP_LABELS.length} · {STEP_LABELS[step]}
      </p>

      {step === 0 && (
        <div>
          <p className="mb-4 font-medium">Wie möchtest du die Unterweisung erstellen?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setMethode("upload")}
              className={`flex-1 rounded-2xl border p-5 text-center ${
                methode === "upload" ? "border-foreground/50 bg-surface" : "border-border"
              }`}
            >
              <p className="text-2xl mb-1">📄</p>
              <p className="text-sm">Datei hochladen</p>
            </button>
            <button
              onClick={() => setMethode("text")}
              className={`flex-1 rounded-2xl border p-5 text-center ${
                methode === "text" ? "border-foreground/50 bg-surface" : "border-border"
              }`}
            >
              <p className="text-2xl mb-1">✍️</p>
              <p className="text-sm">Text selbst eingeben</p>
            </button>
          </div>
        </div>
      )}

      {step === 1 && methode === "upload" && (
        <div>
          <p className="mb-2 font-medium">Dokument hochladen</p>
          <p className="text-xs text-foreground/65 mb-2">PDF oder Foto der Unterweisung</p>
          <label className="flex items-center gap-3 mb-3">
            <span className="rounded-full border border-border px-4 py-2 text-sm cursor-pointer">
              Datei auswählen
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </span>
            {fileName && <span className="text-sm text-foreground/60">📎 {fileName}</span>}
          </label>
          <p className="text-sm mb-4">Am Handy öffnet sich direkt die Kamera.</p>
          {fileName && (
            <div>
              <p className="text-xs text-foreground/65 mb-2">Erkannter Text — bitte prüfen</p>
              <textarea
                value={inhalt}
                onChange={(e) => setInhalt(e.target.value)}
                placeholder={
                  isPdf
                    ? "Automatische Texterkennung ist für PDFs im Prototyp nicht verfügbar — bitte den Text hier manuell einfügen."
                    : "Erkannter Text erscheint hier, editierbar…"
                }
                className="w-full h-24 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
              />
            </div>
          )}
        </div>
      )}

      {step === 1 && methode === "text" && (
        <textarea
          value={inhalt}
          onChange={(e) => setInhalt(e.target.value)}
          placeholder="Inhalt der Unterweisung…"
          className="w-full h-32 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
        />
      )}

      {step === 2 && (
        <div>
          <p className="mb-2 text-sm text-foreground/60">Symbol wählen</p>
          <div className="grid grid-cols-6 gap-2 mb-4 max-h-40 overflow-y-auto pr-1">
            {TRAINING_ICON_OPTIONS.map((opt) => (
              <button
                key={opt.name}
                type="button"
                title={opt.name}
                onClick={() => setIcon(opt.icon)}
                className={`h-10 rounded-xl border text-lg flex items-center justify-center ${
                  icon === opt.icon ? "border-foreground/50 bg-surface" : "border-border"
                }`}
              >
                {opt.icon}
              </button>
            ))}
          </div>
          <p className="mb-2 text-sm text-foreground/60">Name der Unterweisung</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Staplerfahrer"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-2 text-sm text-foreground/60">Ablaufdatum / Erneuerung</p>
          <DateSelect value={ablaufdatum} onChange={setAblaufdatum} minYear={2024} maxYear={2045} />
          <p className="text-sm mt-3">
            Automatische Vorwarnung 2 Wochen vor Ablauf wird danach aktiv.
          </p>
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="font-medium mb-1">Speichern</p>
          <div className="rounded-2xl bg-surface px-4 py-3 mb-4">
            <p className="font-medium">
              {icon ?? (methode === "upload" ? "📄" : "✍️")} {name}
            </p>
            <p className="text-sm text-foreground/65">
              Ablauf: {ablaufdatum ? new Date(ablaufdatum).toLocaleDateString("de-DE") : "—"}
            </p>
          </div>
          <p className="text-sm text-foreground/60 mb-2">Optional gleich einem Bundle zuordnen</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setBundleId("")}
              className={`rounded-full px-4 py-2 text-sm ${
                bundleId === "" ? "text-white" : "border border-border text-foreground/70"
              }`}
              style={bundleId === "" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Kein Bundle
            </button>
            {bundles.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBundleId(b.id);
                  setShowNewBundle(false);
                }}
                className={`rounded-full px-4 py-2 text-sm ${
                  bundleId === b.id ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={bundleId === b.id ? { background: "var(--accent-gradient)" } : undefined}
              >
                {b.icon} {b.name}
              </button>
            ))}
            <button
              onClick={() => setShowNewBundle((v) => !v)}
              className={`rounded-full px-4 py-2 text-sm border ${
                showNewBundle
                  ? "border-foreground/50 bg-surface"
                  : "border-dashed border-border text-foreground/65"
              }`}
            >
              + Neues Bundle
            </button>
          </div>

          {showNewBundle && (
            <div className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {BUNDLE_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setNewBundleIcon(i)}
                    className={`h-10 w-10 rounded-full border text-lg flex items-center justify-center ${
                      newBundleIcon === i ? "border-foreground/50 bg-surface" : "border-border"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <input
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
                placeholder="Name des Bundles"
                className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none mb-3"
              />
              <button
                onClick={handleCreateBundle}
                disabled={creatingBundle || !newBundleIcon || newBundleName.trim() === ""}
                className="rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                style={{ background: "var(--accent-gradient)" }}
              >
                {creatingBundle ? "Legt an…" : "Bundle anlegen"}
              </button>
            </div>
          )}
        </div>
      )}
    </WizardShell>
  );
}
