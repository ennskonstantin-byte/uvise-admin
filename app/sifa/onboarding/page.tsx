"use client";

// Sicherheitsnetz für bereits angemeldete Konten ohne (vollständiges)
// SiFa-Profil -- z.B. eine über AuthGate erreichte, abgebrochene
// Registrierung, oder ein Konto, dessen sifa_profiles-Zeile zwar existiert,
// aber onboarding_completed_at noch leer ist. Der reguläre Weg für neue
// Besucher ist app/sifa/registrieren (eigener Signup), diese Seite braucht
// bereits eine Sitzung (AuthGate lässt sie nicht öffentlich durch).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store";
import { useSifaProfile } from "@/lib/useSifaProfile";
import { Card } from "@/components/Card";

const FIRMEN_OPTIONEN: { value: "1-3" | "4-10" | "11-25" | "25+"; label: string }[] = [
  { value: "1-3", label: "1–3" },
  { value: "4-10", label: "4–10" },
  { value: "11-25", label: "11–25" },
  { value: "25+", label: "25+" },
];

export default function SifaOnboardingPage() {
  const router = useRouter();
  const { session } = useAppData();
  const sifa = useSifaProfile(session);
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [firmenSchaetzung, setFirmenSchaetzung] = useState<"1-3" | "4-10" | "11-25" | "25+" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sifa.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg text-foreground/65 text-sm">
        Lädt…
      </div>
    );
  }

  if (sifa.profile?.onboardingCompletedAt) {
    router.replace("/sifa");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firmenSchaetzung) return;
    setSaving(true);
    setError(null);
    try {
      if (!sifa.profile) {
        if (vorname.trim() === "" || nachname.trim() === "") {
          setError("Bitte Vor- und Nachnamen angeben.");
          setSaving(false);
          return;
        }
        await sifa.createProfile(vorname.trim(), nachname.trim());
      }
      await sifa.completeOnboarding(firmenSchaetzung);
      router.push("/sifa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <Card>
          <h1 className="text-xl font-semibold mb-1">SiFa-Profil einrichten</h1>
          <p className="text-sm text-foreground/60 mb-6">
            uVise ist für dich kostenlos. Jede betreute Firma hat ihr eigenes Abo.
          </p>

          {error && <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>}

          {!sifa.profile && (
            <div className="flex gap-3 mb-3">
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
            </div>
          )}

          <p className="text-xs text-foreground/65 mb-2">Wie viele Firmen betreust du ungefähr?</p>
          <div className="flex flex-wrap gap-2">
            {FIRMEN_OPTIONEN.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFirmenSchaetzung(opt.value)}
                className={`rounded-full px-4 py-2 text-sm ${
                  firmenSchaetzung === opt.value ? "text-white" : "border border-border text-foreground/70"
                }`}
                style={firmenSchaetzung === opt.value ? { background: "var(--accent-gradient)" } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving || !firmenSchaetzung}
            className="w-full mt-6 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent-gradient)" }}
          >
            {saving ? "Speichert…" : "Fertig"}
          </button>
        </Card>
      </form>
    </div>
  );
}
