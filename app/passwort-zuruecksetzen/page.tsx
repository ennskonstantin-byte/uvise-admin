"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogoMark } from "@/components/Logo";

export default function PasswortZuruecksetzenPage() {
  // Der E-Mail-Link setzt automatisch eine Sitzung (Supabase erkennt das
  // Token in der URL) — bis das passiert ist, zeigen wir "Lädt…".
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Falls die Sitzung schon vor dem Event-Listener gesetzt wurde
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-background border border-border/60 shadow-sm p-8">
        <div className="flex justify-center mb-3">
          <LogoMark size={52} />
        </div>
        <h1 className="text-xl font-semibold text-center mb-1">Neues Passwort</h1>

        {done ? (
          <p className="text-sm text-green-600 text-center mt-4 rounded-2xl bg-green-500/10 px-4 py-2">
            Passwort gespeichert! Du kannst dich jetzt mit dem neuen Passwort einloggen.
          </p>
        ) : !ready ? (
          <p className="text-sm text-foreground/60 text-center mt-4">
            Öffne diese Seite über den Link aus deiner E-Mail.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <p className="text-sm text-foreground/60 text-center mb-6">
              Wähle ein neues Passwort für dein Konto.
            </p>
            {error && (
              <p className="text-sm text-red-500 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
            )}
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Neues Passwort"
              minLength={6}
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full mt-5 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent-gradient)" }}
            >
              {loading ? "Speichert…" : "Passwort speichern"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
