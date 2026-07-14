"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";

type Post = {
  id: string;
  created_at: string;
  plattform: "facebook" | "instagram" | "beide";
  thema: string;
  inhalt: string;
  status: "entwurf" | "freigegeben" | "veroeffentlicht" | "verworfen";
};

const STATUS_LABEL: Record<Post["status"], string> = {
  entwurf: "Entwurf",
  freigegeben: "Freigegeben",
  veroeffentlicht: "Veröffentlicht",
  verworfen: "Verworfen",
};

const PLATTFORM_LABEL: Record<Post["plattform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  beide: "Facebook + Instagram",
};

// Kürzt den Beitragstext auf eine knackige Zeile fürs Marken-Bild.
function kurzText(inhalt: string): string {
  const ersteZeile = inhalt.split("\n").map((s) => s.trim()).filter(Boolean)[0] ?? inhalt;
  return ersteZeile.slice(0, 160);
}

export default function MarketingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(true);

  const [thema, setThema] = useState("");
  const [plattform, setPlattform] = useState<"facebook" | "instagram" | "beide">("beide");
  const [generiert, setGeneriert] = useState(false);

  const [bearbeiteId, setBearbeiteId] = useState<string | null>(null);
  const [bearbeiteText, setBearbeiteText] = useState("");
  const [bildId, setBildId] = useState<string | null>(null);

  async function token(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function laden() {
    const t = await token();
    if (!t) {
      setFehler("Nicht angemeldet.");
      setLaedt(false);
      return;
    }
    const res = await fetch("/api/marketing", { headers: { Authorization: `Bearer ${t}` } });
    const json = await res.json();
    if (!res.ok) {
      setFehler(json.error ?? "Laden fehlgeschlagen.");
    } else {
      setPosts(json.posts);
      setFehler(null);
    }
    setLaedt(false);
  }

  useEffect(() => {
    laden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function aktion(body: Record<string, unknown>): Promise<boolean> {
    const t = await token();
    if (!t) return false;
    const res = await fetch("/api/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFehler(json.error ?? "Aktion fehlgeschlagen.");
      return false;
    }
    setFehler(null);
    await laden();
    return true;
  }

  async function generieren() {
    setGeneriert(true);
    await aktion({ aktion: "generieren", thema, plattform, anzahl: 3 });
    setGeneriert(false);
  }

  const gruppen: { status: Post["status"]; titel: string; hinweis?: string }[] = [
    { status: "entwurf", titel: "Zu prüfen", hinweis: "Von der KI erstellt — bearbeiten und freigeben oder verwerfen." },
    {
      status: "freigegeben",
      titel: "Freigegeben — wartet auf Veröffentlichung",
      hinweis: "Wird automatisch gepostet, sobald die Facebook/Instagram-Verbindung eingerichtet ist. Bis dahin: Text kopieren und selbst posten.",
    },
    { status: "veroeffentlicht", titel: "Veröffentlicht" },
  ];

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold">Marketing</h1>
      <p className="text-foreground/60 text-sm mt-1 mb-8">
        KI-Beiträge für Facebook &amp; Instagram — du prüfst jeden Text, bevor er rausgeht. Nur für den Betreiber sichtbar.
      </p>

      <section className="rounded-2xl border border-border bg-background p-5 max-w-2xl mb-8">
        <h2 className="font-medium mb-3">Neue Beitragsentwürfe erstellen</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-foreground/70">Thema (leer lassen für freie Themenwahl)</span>
            <input
              type="text"
              value={thema}
              onChange={(e) => setThema(e.target.value)}
              maxLength={500}
              placeholder='z.B. "Erste-Hilfe-Fristen laufen oft unbemerkt ab"'
              className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {(["beide", "facebook", "instagram"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlattform(p)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  plattform === p ? "border-blue-500 text-blue-500 font-medium" : "border-border text-foreground/60"
                }`}
              >
                {PLATTFORM_LABEL[p]}
              </button>
            ))}
            <button
              onClick={generieren}
              disabled={generiert}
              className="ml-auto rounded-full bg-gradient-to-r from-violet-600 to-sky-400 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {generiert ? "KI schreibt…" : "3 Entwürfe erstellen"}
            </button>
          </div>
        </div>
      </section>

      {fehler && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm max-w-2xl mb-8 whitespace-pre-wrap">{fehler}</div>
      )}

      {laedt && <p className="text-sm text-foreground/50">Lädt…</p>}

      {!laedt &&
        gruppen.map((g) => {
          const eintraege = posts.filter((p) => p.status === g.status);
          if (eintraege.length === 0 && g.status !== "entwurf") return null;
          return (
            <section key={g.status} className="mb-8 max-w-2xl">
              <h2 className="font-medium">{g.titel} ({eintraege.length})</h2>
              {g.hinweis && <p className="text-xs text-foreground/50 mt-0.5 mb-3">{g.hinweis}</p>}
              {eintraege.length === 0 && (
                <p className="text-sm text-foreground/50 mt-2">Keine Einträge — oben neue Entwürfe erstellen.</p>
              )}
              <div className="flex flex-col gap-3 mt-2">
                {eintraege.map((p) => (
                  <article key={p.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2">
                      <span className="rounded-full border border-border px-2 py-0.5">{PLATTFORM_LABEL[p.plattform]}</span>
                      <span className="rounded-full border border-border px-2 py-0.5">{STATUS_LABEL[p.status]}</span>
                      <span className="ml-auto">{new Date(p.created_at).toLocaleDateString("de-DE")}</span>
                    </div>
                    {bearbeiteId === p.id ? (
                      <>
                        <textarea
                          value={bearbeiteText}
                          onChange={(e) => setBearbeiteText(e.target.value)}
                          rows={6}
                          className="w-full rounded-xl border border-border bg-page-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-y"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={async () => {
                              if (await aktion({ aktion: "speichern", id: p.id, inhalt: bearbeiteText })) setBearbeiteId(null);
                            }}
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white"
                          >
                            Speichern
                          </button>
                          <button onClick={() => setBearbeiteId(null)} className="rounded-full border border-border px-4 py-1.5 text-xs">
                            Abbrechen
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{p.inhalt}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {p.status === "entwurf" && (
                            <>
                              <button
                                onClick={() => aktion({ aktion: "status", id: p.id, status: "freigegeben" })}
                                className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white"
                              >
                                ✓ Freigeben
                              </button>
                              <button
                                onClick={() => {
                                  setBearbeiteId(p.id);
                                  setBearbeiteText(p.inhalt);
                                }}
                                className="rounded-full border border-border px-4 py-1.5 text-xs"
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => aktion({ aktion: "status", id: p.id, status: "verworfen" })}
                                className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground/60"
                              >
                                Verwerfen
                              </button>
                            </>
                          )}
                          {p.status === "freigegeben" && (
                            <>
                              <button
                                onClick={() => navigator.clipboard.writeText(p.inhalt)}
                                className="rounded-full border border-border px-4 py-1.5 text-xs"
                              >
                                📋 Text kopieren
                              </button>
                              <button
                                onClick={() => aktion({ aktion: "status", id: p.id, status: "entwurf" })}
                                className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground/60"
                              >
                                Zurück zu Entwurf
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setBildId(bildId === p.id ? null : p.id)}
                            className="rounded-full border border-border px-4 py-1.5 text-xs"
                          >
                            🖼️ Marken-Bild
                          </button>
                        </div>
                        {bildId === p.id && (
                          <div className="mt-3">
                            <img
                              src={`/api/beitragsbild?text=${encodeURIComponent(kurzText(p.inhalt))}&format=quadrat`}
                              alt="Vorschau des Beitragsbilds"
                              className="w-full max-w-[280px] rounded-xl border border-border"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              <a
                                href={`/api/beitragsbild?text=${encodeURIComponent(kurzText(p.inhalt))}&format=quadrat`}
                                download="uvise-instagram.png"
                                className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white"
                              >
                                ⬇︎ Instagram-Bild
                              </a>
                              <a
                                href={`/api/beitragsbild?text=${encodeURIComponent(kurzText(p.inhalt))}&format=quer`}
                                download="uvise-facebook.png"
                                className="rounded-full border border-border px-4 py-1.5 text-xs"
                              >
                                ⬇︎ Facebook-Bild
                              </a>
                            </div>
                            <p className="text-[11px] text-foreground/40 mt-1">
                              Automatisch aus dem Text erzeugt, in deinen uVise-Farben — kostenlos.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
    </DashboardShell>
  );
}
