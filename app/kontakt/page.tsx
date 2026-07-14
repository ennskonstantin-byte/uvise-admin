"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { SUPPORT_EMAIL } from "@/lib/legal";

// Öffentliches Kontaktformular — bewusst ohne Login erreichbar, damit auch
// Interessenten (noch keine Kunden) Anfragen stellen können.
export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setFehler(null);
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, nachricht }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFehler(data.error ?? "Versand fehlgeschlagen.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setFehler("Versand fehlgeschlagen. Bitte später erneut versuchen.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-page-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="flex items-center gap-3 mb-8 w-fit">
          <LogoMark size={40} />
          <span className="text-lg font-semibold">uVise</span>
        </Link>

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10">
          <h1 className="text-2xl font-semibold mb-2">Kontakt</h1>
          <p className="text-sm text-foreground/60 mb-8">
            Fragen zu uVise, Preisen oder einer Zusammenarbeit? Schreib uns — wir melden
            uns so schnell wie möglich. Bei technischen Problemen mit deinem Konto
            erreichst du den Support direkt unter{" "}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=uVise%20Support`} className="underline underline-offset-4 hover:text-foreground">
              {SUPPORT_EMAIL}
            </a>.
          </p>

          {status === "sent" ? (
            <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-6 text-sm">
              ✅ Danke! Deine Nachricht ist angekommen — wir melden uns bald bei dir.
            </div>
          ) : (
            <form onSubmit={absenden} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Dein Name</span>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="Vor- und Nachname"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Deine E-Mail-Adresse</span>
                <input
                  type="email"
                  required
                  maxLength={200}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="name@firma.de"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Deine Nachricht</span>
                <textarea
                  required
                  maxLength={5000}
                  rows={6}
                  value={nachricht}
                  onChange={(e) => setNachricht(e.target.value)}
                  className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-y"
                  placeholder="Worum geht es?"
                />
              </label>

              {fehler && <p className="text-sm text-red-500">{fehler}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 rounded-full bg-gradient-to-r from-violet-600 to-sky-400 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 w-fit"
              >
                {status === "sending" ? "Wird gesendet…" : "Nachricht senden"}
              </button>
            </form>
          )}
        </div>

        <nav aria-label="Rechtliches" className="flex flex-wrap gap-4 mt-6 text-sm text-foreground/60">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">← Zur Startseite</Link>
          <Link href="/impressum" className="hover:text-foreground underline-offset-4 hover:underline">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-foreground underline-offset-4 hover:underline">Datenschutz</Link>
          <Link href="/agb" className="hover:text-foreground underline-offset-4 hover:underline">AGB</Link>
        </nav>
      </div>
    </div>
  );
}
