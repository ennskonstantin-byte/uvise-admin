"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { DateSelect } from "@/components/DateSelect";
import { useAppData } from "@/lib/store";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { TRAINING_ICON_OPTIONS, BUNDLE_ICONS, type Training } from "@/lib/types";

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
  // Bewusst leer starten (nicht alle Mitarbeiter vorausgewählt) -- ein
  // unachtsamer Klick auf "Senden" direkt nach dem Anlegen hätte sonst die
  // gesamte Belegschaft erfasst, auch wenn nur eine Testgruppe gemeint war
  // (Runde-3-Audit, P1-05). Analog zum Verhalten in der Chef-App.
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [distributionError, setDistributionError] = useState<string | null>(null);

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
    setDistributionError(null);
    try {
      const targetIds =
        tab === "mitarbeiter"
          ? selectedEmployees
          : employees.filter((e) => selectedCategories.includes(e.kategorie)).map((e) => e.id);
      await assignTraining(training.id, targetIds);
      // Kurze Bestätigung, bevor das Fenster sich schließt -- vorher schloss
      // es sofort ohne Rückmeldung, an wie viele MA tatsächlich verschickt wurde.
      setSentCount(targetIds.length);
      setTimeout(onClose, 1400);
    } catch {
      setDistributionError("Versenden fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSending(false);
    }
  }

  if (sentCount !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-background border border-border p-8 flex flex-col items-center text-center gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--ampel-green)" }}
          >
            <Check size={26} />
          </div>
          <p className="font-medium">
            {sentCount === 0
              ? `„${training.name}“ noch an niemanden verschickt`
              : `„${training.name}“ verschickt an ${sentCount} Mitarbeiter`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-background border border-border p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-1">„{training.name}&quot; weiterleiten</h2>
        <p className="text-sm text-foreground/60 mb-5">
          An einzelne Mitarbeiter oder ganze Abteilungen senden — kann auch später über die
          Mitarbeiter-Seite nachgeholt werden.
        </p>

        {distributionError && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">
            {distributionError}
          </p>
        )}

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
                  <label
                    key={e.id}
                    className="flex items-center gap-3 rounded-2xl border border-border px-3 py-2 text-sm cursor-pointer hover:border-foreground/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(e.id)}
                      onChange={() => toggleEmployee(e.id)}
                    />
                    <EmployeeAvatar vorname={e.vorname} nachname={e.nachname} fotoUrl={e.fotoUrl} size={32} />
                    <span>
                      {e.vorname} {e.nachname}{" "}
                      <span className="text-foreground/65">({e.kategorie})</span>
                    </span>
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
  useEscapeClose(onClose);
  const { bundles, addTraining, addBundle } = useAppData();
  const [methode, setMethode] = useState<"upload" | "text">("text");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreateBundle() {
    if (!newBundleIcon || newBundleName.trim() === "") return;
    setCreatingBundle(true);
    try {
      const bundle = await addBundle({ name: newBundleName, icon: newBundleIcon, trainingIds: [] });
      setBundleId(bundle.id);
      setShowNewBundle(false);
      setNewBundleIcon(null);
      setNewBundleName("");
    } catch {
      setError("Bundle anlegen fehlgeschlagen.");
    } finally {
      setCreatingBundle(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const pdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    // Nur echte PDFs werden unterstützt -- es gibt keine Texterkennung (OCR).
    // Ein Bild anzunehmen und den Dateinamen zu bestätigen hätte fälschlich
    // suggeriert, der Bildinhalt sei übernommen worden (Runde-1/2-Audit, H-02).
    if (!pdf) {
      setError("Nur PDF-Dateien werden unterstützt. Bitte den Text stattdessen von Hand eingeben.");
      e.target.value = "";
      return;
    }
    setError(null);
    setFileName(file.name);
    setIsPdf(true);
    setPdfFile(file);
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
        pdfFile,
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

  const canSave =
    name.trim() !== "" &&
    (methode === "text" ? inhalt.trim() !== "" : !!fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-background border border-border p-6 sm:p-8 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Neue Unterweisung</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/65 mb-2">Symbol</p>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
              {TRAINING_ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  title={opt.name}
                  aria-label={opt.name}
                  onClick={() => setIcon(opt.icon)}
                  className={`h-10 rounded-xl border text-lg flex items-center justify-center ${
                    icon === opt.icon ? "border-foreground/50 bg-surface" : "border-border"
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Unterweisung (z.B. Staplerfahrer)"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />

          <div>
            <p className="text-xs text-foreground/65 mb-2">Inhalt</p>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setMethode("text")}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs ${
                  methode === "text" ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={methode === "text" ? { background: "var(--accent-gradient)" } : undefined}
              >
                ✍️ Text eingeben
              </button>
              <button
                type="button"
                onClick={() => setMethode("upload")}
                className={`flex-1 rounded-full px-3 py-1.5 text-xs ${
                  methode === "upload" ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={methode === "upload" ? { background: "var(--accent-gradient)" } : undefined}
              >
                📄 Datei hochladen
              </button>
            </div>

            {methode === "text" ? (
              <textarea
                value={inhalt}
                onChange={(e) => setInhalt(e.target.value)}
                placeholder="Inhalt der Unterweisung (wird dem Mitarbeiter angezeigt)…"
                className="w-full h-28 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
              />
            ) : (
              <div>
                <label className="flex items-center gap-3 mb-2">
                  <span className="rounded-full border border-border px-4 py-2 text-sm cursor-pointer">
                    Datei auswählen
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </span>
                  {fileName && <span className="text-sm text-foreground/60">📎 {fileName}</span>}
                </label>
                {isPdf && (
                  <p className="text-xs text-foreground/60 mb-2">
                    Die PDF wird 1:1 in der App angezeigt — Mitarbeiter sehen das Original.
                  </p>
                )}
                {fileName && (
                  <textarea
                    value={inhalt}
                    onChange={(e) => setInhalt(e.target.value)}
                    placeholder="Optional: Text für die Vorlese-Stimme hier einfügen (die PDF selbst wird trotzdem angezeigt)."
                    className="w-full h-24 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none"
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-1">Ablaufdatum / Erneuerung (optional)</p>
            <DateSelect value={ablaufdatum} onChange={setAblaufdatum} minYear={2024} maxYear={2045} />
          </div>

          <div>
            <p className="text-xs text-foreground/65 mb-2">Bundle (optional)</p>
            <div className="flex flex-wrap gap-2">
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
              <div className="mt-3 rounded-2xl border border-border p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {BUNDLE_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewBundleIcon(i)}
                      aria-label={`Symbol ${i}`}
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
        </div>

        <button
          onClick={handleFinish}
          disabled={saving || !canSave}
          className="mt-6 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "var(--accent-gradient)" }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
