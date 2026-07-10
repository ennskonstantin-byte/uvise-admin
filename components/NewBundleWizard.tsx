"use client";

import { useState } from "react";
import { WizardShell } from "@/components/WizardShell";
import { useAppData } from "@/lib/store";
import { BUNDLE_ICONS as ICONS } from "@/lib/mockData";

export function NewBundleWizard({ onClose }: { onClose: () => void }) {
  const { trainings, addBundle } = useAppData();
  const [step, setStep] = useState(0);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const steps = ["Abteilung", "Symbol", "Unterweisungen"];
  const [done, setDone] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      await addBundle({ name, icon: icon ?? "📦", trainingIds: selected });
      setDone(true);
    } catch {
      setError("Speichern fehlgeschlagen. Bitte prüfe, ob du als Beauftragte/r eingeloggt bist.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <WizardShell
        title="Bundle gespeichert"
        stepCount={steps.length}
        currentStep={steps.length - 1}
        onBack={() => {}}
        onNext={onClose}
        onCancel={onClose}
        nextLabel="Schließen"
      >
        <div className="text-center py-8">
          <p className="text-4xl mb-4">✅</p>
          <p className="font-medium">Bundle „{name}" wurde gespeichert.</p>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell
      title="Neues Bundle"
      stepCount={steps.length}
      currentStep={step}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() =>
        step >= steps.length - 1
          ? handleFinish()
          : setStep((s) => Math.min(s + 1, steps.length - 1))
      }
      onCancel={onClose}
      nextLabel={step === steps.length - 1 ? (saving ? "Speichert…" : "Speichern") : "Weiter"}
      nextDisabled={saving || (step === 0 && name.trim() === "") || (step === 1 && !icon)}
    >
      {error && (
        <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">
          {error}
        </p>
      )}
      <p className="text-xs uppercase tracking-wide text-foreground/65 mb-4">
        Schritt {step + 1} von {steps.length} · {steps[step]}
      </p>
      {step === 0 && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Abteilung / Name des Bundles (z.B. Produktion)"
          className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
        />
      )}
      {step === 1 && (
        <div className="flex flex-wrap gap-3">
          {ICONS.map((i) => (
            <button
              key={i}
              onClick={() => setIcon(i)}
              className={`h-12 w-12 rounded-full border text-xl flex items-center justify-center ${
                icon === i ? "border-foreground/50 bg-surface" : "border-border"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          {trainings.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() =>
                  setSelected((prev) =>
                    prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                  )
                }
              />
              {t.name}
            </label>
          ))}
        </div>
      )}
    </WizardShell>
  );
}
