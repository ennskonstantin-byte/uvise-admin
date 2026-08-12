"use client";

// SiFa-Registrierung (Web-Port von Phase 5/App, Ansicht 37 SiFa-Onboarding
// + Ansicht 32 Rolle wählen -- Web ist Desktop, deshalb EIN Formular statt
// der App-Popup-Kette, genau wie die bereits bestehende Chef-Registrierung
// in AuthGate.tsx). Öffentlich erreichbar (siehe PUBLIC_PATHS in
// AuthGate.tsx), weil hier ein neues Konto entsteht.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoMark } from "@/components/Logo";
import { PasswordInput } from "@/components/PasswordInput";

const FIRMEN_OPTIONEN: { value: "1-3" | "4-10" | "11-25" | "25+"; label: string }[] = [
  { value: "1-3", label: "1–3" },
  { value: "4-10", label: "4–10" },
  { value: "11-25", label: "11–25" },
  { value: "25+", label: "25+" },
];

export default function SifaRegistrierenPage() {
  const router = useRouter();
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmenSchaetzung, setFirmenSchaetzung] = useState<"1-3" | "4-10" | "11-25" | "25+" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firmenSchaetzung) return;
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
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

    const { error: profileError } = await supabase.rpc("create_sifa_profile", {
      p_vorname: vorname.trim(),
      p_nachname: nachname.trim(),
    });
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }
    const { error: onboardingError } = await supabase.rpc("complete_sifa_onboarding", {
      p_firmen_schaetzung: firmenSchaetzung,
    });
    if (onboardingError) {
      setError(onboardingError.message);
      setLoading(false);
      return;
    }

    router.push("/sifa");
    setLoading(false);
  }

  const canSubmit =
    vorname.trim() !== "" &&
    nachname.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 6 &&
    !!firmenSchaetzung;

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[2rem] bg-background border border-border/60 shadow-sm p-8"
      >
        <div className="flex justify-center mb-3">
          <Link href="/" aria-label="Zur Startseite">
            <LogoMark size={52} />
          </Link>
        </div>
        <h1 className="text-xl font-semibold text-center mb-1">Als Sicherheitsfachkraft registrieren</h1>
        <p className="text-sm text-foreground/60 text-center mb-6">
          Für dich als SiFa ist uVise kostenlos — die betreuten Firmen zahlen ihr eigenes Abo.
        </p>

        {error && <p className="text-sm text-red-600 mb-4 rounded-2xl bg-red-500/10 px-4 py-2">{error}</p>}

        <div className="space-y-3">
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
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Mail"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          />
          <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
          <p className={`text-xs ${password.length > 0 && password.length < 6 ? "text-red-600" : "text-foreground/55"}`}>
            Mindestens 6 Zeichen.
          </p>
        </div>

        <div className="mt-5">
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
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full mt-6 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent-gradient)" }}
        >
          {loading ? "Lädt…" : "Als SiFa registrieren"}
        </button>

        <Link href="/login" className="block w-full mt-3 text-center text-sm text-foreground/60 hover:text-foreground">
          Schon ein Konto? Zum Login
        </Link>
        <Link href="/login" className="block w-full mt-1 text-center text-sm text-foreground/60 hover:text-foreground">
          Chef/Betrieb? Hier registrieren
        </Link>

        <nav aria-label="Rechtliches" className="flex justify-center gap-4 mt-6 text-xs text-foreground/65">
          <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          <Link href="/agb" className="hover:text-foreground">AGB</Link>
        </nav>
      </form>
    </div>
  );
}
