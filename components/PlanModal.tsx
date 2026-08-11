"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { PLANS, CHEF_GRATIS_HINWEIS, ENTERPRISE_KONTAKT } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { supabase } from "@/lib/supabase";

// Große Kachel-Auswahl fürs Abo — direkt vom Dashboard aus erreichbar,
// ohne erst zu den Einstellungen navigieren und suchen zu müssen.
export function PlanModal({ onClose }: { onClose: () => void }) {
  useEscapeClose(onClose);
  const { showToast, ToastView } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("Team");
  const [starting, setStarting] = useState(false);

  async function startCheckout() {
    setStarting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        showToast("Bitte neu einloggen und erneut versuchen.");
        return;
      }
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ planName: selectedPlan }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        showToast(`Fehlgeschlagen: ${json.error ?? "Unbekannter Fehler"}`);
        return;
      }
      window.location.href = json.url;
    } finally {
      setStarting(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Abo wählen" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Dein Abo wählen</h2>
          <button onClick={onClose} className="text-foreground/65 hover:text-foreground text-sm">
            Abbrechen
          </button>
        </div>
        <p className="text-sm text-foreground/60 mb-6 max-w-xl">
          7 Tage kostenlos testen, danach 12 Monate Laufzeit bei monatlicher Zahlung.
          Bezahlung per Apple Pay, Google Pay, Visa, Lastschrift, PayPal oder Klarna.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.name;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 ${active ? "border-2" : "border-border"}`}
                style={active ? { borderColor: "var(--accent-violet)" } : undefined}
              >
                <p className="font-medium mb-1">{plan.name}</p>
                <p className="text-2xl font-semibold">
                  {plan.preis}€<span className="text-sm font-normal text-foreground/65">/Monat</span>
                </p>
                <p className="text-sm text-foreground/65 mb-4">
                  {plan.limit}
                  {active ? " · ausgewählt" : ""}
                </p>
                <ul className="text-sm space-y-1.5 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground/70">
                      <Check size={14} className="text-foreground/65 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan.name)}
                  disabled={active}
                  className={`w-full rounded-full py-2.5 text-sm font-medium ${
                    active ? "text-white" : "border border-border"
                  }`}
                  style={active ? { background: "var(--accent-gradient)" } : undefined}
                >
                  {active ? "Ausgewählt" : "Auswählen"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-foreground/55 mb-4">
          {CHEF_GRATIS_HINWEIS} {ENTERPRISE_KONTAKT.text}{" "}
          <a href={ENTERPRISE_KONTAKT.href} className="underline hover:text-foreground/80">
            {ENTERPRISE_KONTAKT.linkText}
          </a>
        </p>

        <MovingBorderButton
          onClick={startCheckout}
          disabled={starting}
          borderRadius="9999px"
          duration={3000}
          containerClassName="w-full h-12 disabled:opacity-50"
          className="font-medium text-white border-transparent bg-[image:var(--accent-gradient)]"
        >
          {starting ? "Leitet weiter…" : `${selectedPlan}-Abo starten`}
        </MovingBorderButton>
        <ToastView />
      </div>
    </div>
  );
}
