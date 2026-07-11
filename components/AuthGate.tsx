"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/store";
import { LogoMark } from "@/components/Logo";

// Diese Seiten sind gesetzlich ohne Login erreichbar (Impressumspflicht)
// + die Passwort-zurücksetzen-Seite, die per E-Mail-Link ohne Login geöffnet wird.
const PUBLIC_PATHS = ["/impressum", "/datenschutz", "/agb", "/passwort-zuruecksetzen"];

function AuthForm() {
  const { reload } = useAppData();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [firma, setFirma] = useState("");
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/");
    setLoading(false);
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/passwort-zuruecksetzen`,
    });
    if (error) setError(error.message);
    else setResetSent(true);
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      setError(
        "Konto angelegt, aber noch keine aktive Sitzung. Bitte in Supabase unter Authentication die E-Mail-Bestätigung („Confirm email“) ausschalten und erneut versuchen."
      );
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("create_company_and_owner", {
      p_company_name: firma,
      p_vorname: vorname,
      p_nachname: nachname,
    });
    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    await reload();
    router.push("/");
    setLoading(false);
  }

  const isRegister = mode === "register";
  const isReset = mode === "reset";

  if (isReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg px-4">
        <form
          onSubmit={handleResetRequest}
          className="w-full max-w-sm rounded-[2rem] bg-background border border-border/60 shadow-sm p-8"
        >
          <div className="flex justify-center mb-3">
            <LogoMark size={52} />
          </div>
          <h1 className="text-xl font-semibold text-center mb-1">Passwort vergessen</h1>
          <p className="text-sm text-foreground/60 text-center mb-6">
            Wir schicken dir einen Link zum Zurücksetzen an deine E-Mail-Adresse.
          </p>

          {error && (
            <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
          )}
          {resetSent && (
            <p className="text-sm text-green-600 mb-4 rounded-2xl bg-green-500/10 px-4 py-2">
              E-Mail verschickt — bitte Posteingang prüfen und dem Link folgen.
            </p>
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />

          <button
            type="submit"
            disabled={loading || email.trim() === ""}
            className="w-full mt-5 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent-gradient)" }}
          >
            {loading ? "Sendet…" : "Link zum Zurücksetzen senden"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setResetSent(false);
            }}
            className="w-full mt-3 text-sm text-foreground/60 hover:text-foreground"
          >
            Zurück zum Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4">
      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="w-full max-w-sm rounded-[2rem] bg-background border border-border/60 shadow-sm p-8"
      >
        <div className="flex justify-center mb-3">
          <LogoMark size={52} />
        </div>
        <h1 className="text-xl font-semibold text-center mb-1">uVise Admin</h1>
        <p className="text-sm text-foreground/60 text-center mb-1">
          {isRegister
            ? "Neue Firma anlegen und Chef-Konto erstellen"
            : "Login für Beauftragte/Admin deiner Firma"}
        </p>
        {!isRegister && (
          <p className="text-xs text-foreground/65 text-center mb-6">
            Bist du Mitarbeiter*in? Nutze stattdessen die uVise-App.
          </p>
        )}
        {isRegister && <div className="mb-6" />}

        {error && (
          <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          {isRegister && (
            <>
              <input
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                placeholder="Firmenname"
                className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
              />
              <div className="flex gap-3">
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
            </>
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Passwort"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            (isRegister && (firma.trim() === "" || vorname.trim() === "" || nachname.trim() === ""))
          }
          className="w-full mt-5 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent-gradient)" }}
        >
          {loading ? "Lädt…" : isRegister ? "Firma anlegen" : "Einloggen"}
        </button>

        {!isRegister && (
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setError(null);
            }}
            className="w-full mt-3 text-sm text-foreground/60 hover:text-foreground"
          >
            Passwort vergessen?
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setError(null);
          }}
          className="w-full mt-1 text-sm text-foreground/60 hover:text-foreground"
        >
          {isRegister
            ? "Schon ein Konto? Zum Login"
            : "Neue Firma? Hier registrieren"}
        </button>

        <nav aria-label="Rechtliches" className="flex justify-center gap-4 mt-6 text-xs text-foreground/65">
          <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          <Link href="/agb" className="hover:text-foreground">AGB</Link>
        </nav>
      </form>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAppData();
  const pathname = usePathname();
  // Anmelde-Weiche: nur Beauftragte dürfen ins Admin — normale Mitarbeiter
  // bekommen einen freundlichen Hinweis auf die uVise-App.
  // null = Rolle wird noch geprüft
  const [isChef, setIsChef] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session) {
      setIsChef(null);
      return;
    }
    let cancelled = false;
    // Direkt nach einer Registrierung ist der session-Wechsel oft schneller
    // als die create_company_and_owner-RPC, die den employees-Datensatz erst
    // anlegt — ohne Wiederholung würde das fälschlich als "Mitarbeiter-Konto"
    // erkannt. Bis zu 5x mit kurzer Pause erneut versuchen, bevor wir final
    // "kein Beauftragter" annehmen.
    async function checkRole() {
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data } = await supabase
          .from("employees")
          .select("ist_beauftragter")
          .eq("auth_user_id", session!.user.id)
          .maybeSingle();
        if (cancelled) return;
        if (data) {
          setIsChef(!!data.ist_beauftragter);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      if (!cancelled) setIsChef(false);
    }
    checkRole();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg text-foreground/65 text-sm">
        Lädt…
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  if (isChef === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg text-foreground/65 text-sm">
        Lädt…
      </div>
    );
  }

  if (isChef === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg px-4">
        <div className="w-full max-w-sm rounded-[2rem] bg-background border border-border/60 shadow-sm p-8 text-center">
          <div className="flex justify-center mb-3">
            <LogoMark size={52} />
          </div>
          <h1 className="text-xl font-semibold mb-2">Dies ist der Chef-Bereich</h1>
          <p className="text-sm text-foreground/60 mb-6">
            Dein Konto ist ein Mitarbeiter-Konto. Bitte nutze die uVise-App — dort
            findest du deine Unterweisungen und Nachweise.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            Abmelden
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
