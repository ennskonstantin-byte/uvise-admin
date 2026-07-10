"use client";

export function WizardShell({
  title,
  stepCount,
  currentStep,
  onBack,
  onNext,
  onCancel,
  nextLabel = "Weiter",
  nextDisabled = false,
  children,
}: {
  title: string;
  stepCount: number;
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onCancel}
            className="text-foreground/50 hover:text-foreground text-sm"
          >
            Abbrechen
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: stepCount }).map((_, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full transition-colors"
              style={{
                background:
                  i <= currentStep ? "var(--accent-violet)" : "var(--border)",
              }}
            />
          ))}
        </div>

        <div className="min-h-[220px]">{children}</div>

        <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
          <button
            onClick={onBack}
            disabled={currentStep === 0}
            className="rounded-full px-5 py-2.5 text-sm font-medium border border-border disabled:opacity-30"
          >
            Zurück
          </button>
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ background: "var(--accent-gradient)" }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
