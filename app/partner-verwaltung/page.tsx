"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";

type Partner = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  code: string;
  schluessel: string;
  budget_cents: number;
  aktiv: boolean;
  klicks: number;
  geworbeneFirmen: number;
};

export default function PartnerVerwaltungPage() {
  const [partner, setPartner] = useState<Partner[]>([]);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [legtAn, setLegtAn] = useState(false);
  const [kopiert, setKopiert] = useState<string | null>(null);

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
    const res = await fetch("/api/partner", { headers: { Authorization: `Bearer ${t}` } });
    const json = await res.json();
    if (!res.ok) setFehler(json.error ?? "Laden fehlgeschlagen.");
    else {
      setPartner(json.partner);
      setFehler(null);
    }
    setLaedt(false);
  }

  useEffect(() => {
    laden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function aktion(body: Record<string, unknown>) {
    const t = await token();
    if (!t) return;
    const res = await fetch("/api/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFehler(json.error ?? "Aktion fehlgeschlagen.");
      return;
    }
    setFehler(null);
    await laden();
  }

  async function anlegen(e: React.FormEvent) {
    e.preventDefault();
    setLegtAn(true);
    await aktion({ aktion: "anlegen", name, email, budgetEuro: budget });
    setName("");
    setEmail("");
    setBudget("");
    setLegtAn(false);
  }

  function kopieren(text: string, was: string) {
    navigator.clipboard.writeText(text);
    setKopiert(was);
    setTimeout(() => setKopiert(null), 1500);
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold">Partner</h1>
      <p className="text-foreground/60 text-sm mt-1 mb-8">
        Affiliate-Partner verwalten: Werbe-Links, Klicks, geworbene Firmen und Budget. Nur für den Betreiber sichtbar.
        Auszahlungen macht uVise nicht automatisch — das Budget hier ist eine Anzeige für dich und den Partner.
      </p>

      <section className="rounded-2xl border border-border bg-background p-5 max-w-2xl mb-8">
        <h2 className="font-medium mb-3">Neuen Partner anlegen</h2>
        <form onSubmit={anlegen} className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground/70">Name*</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground/70">E-Mail (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
                className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground/70">Start-Budget in € (optional)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="rounded-xl border border-border bg-page-bg px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-44"
              />
            </label>
            <button
              type="submit"
              disabled={legtAn}
              className="rounded-full bg-gradient-to-r from-violet-600 to-sky-400 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {legtAn ? "Legt an…" : "Partner anlegen"}
            </button>
          </div>
        </form>
      </section>

      {fehler && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm max-w-2xl mb-8">{fehler}</div>}
      {laedt && <p className="text-sm text-foreground/50">Lädt…</p>}
      {!laedt && partner.length === 0 && !fehler && (
        <p className="text-sm text-foreground/50">Noch keine Partner — oben den ersten anlegen.</p>
      )}

      <div className="flex flex-col gap-4 max-w-2xl">
        {partner.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{p.name}</h3>
              {!p.aktiv && (
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground/50">deaktiviert</span>
              )}
              <span className="ml-auto text-xs text-foreground/50">
                seit {new Date(p.created_at).toLocaleDateString("de-DE")}
              </span>
            </div>
            {p.email && <p className="text-xs text-foreground/50 mt-0.5">{p.email}</p>}

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Klicks", wert: p.klicks.toLocaleString("de-DE") },
                { label: "Geworbene Firmen", wert: p.geworbeneFirmen.toLocaleString("de-DE") },
                { label: "Budget", wert: (p.budget_cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" }) },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-foreground/50">{k.label}</p>
                  <p className="text-lg font-semibold tabular-nums mt-0.5">{k.wert}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => kopieren(`https://www.uvise.de/?ref=${p.code}`, p.id + "-link")}
                className="rounded-full border border-border px-4 py-1.5 text-xs"
              >
                {kopiert === p.id + "-link" ? "✓ Kopiert" : "📋 Werbe-Link kopieren"}
              </button>
              <button
                onClick={() => kopieren(`https://www.uvise.de/partner?schluessel=${p.schluessel}`, p.id + "-zugang")}
                className="rounded-full border border-border px-4 py-1.5 text-xs"
              >
                {kopiert === p.id + "-zugang" ? "✓ Kopiert" : "🔑 Partner-Zugangslink kopieren"}
              </button>
              <button
                onClick={() => {
                  const neu = prompt("Neues Budget in € für " + p.name + ":", String(p.budget_cents / 100));
                  if (neu !== null) aktion({ aktion: "aendern", id: p.id, budgetEuro: neu });
                }}
                className="rounded-full border border-border px-4 py-1.5 text-xs"
              >
                Budget ändern
              </button>
              <button
                onClick={() => aktion({ aktion: "aendern", id: p.id, aktiv: !p.aktiv })}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground/60"
              >
                {p.aktiv ? "Deaktivieren" : "Aktivieren"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
