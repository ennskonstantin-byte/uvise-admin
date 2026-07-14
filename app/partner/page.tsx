"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

type Ansicht = {
  name: string;
  code: string;
  aktiv: boolean;
  seit: string;
  budgetEuro: number;
  klicks: number;
  geworbeneFirmen: number;
  link: string;
};

function PartnerInhalt() {
  const searchParams = useSearchParams();
  const schluessel = searchParams.get("schluessel") ?? "";
  const [daten, setDaten] = useState<Ansicht | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    if (!schluessel) {
      setFehler("Ungültiger Zugangslink — bitte den vollständigen Link aus deiner Einladung verwenden.");
      return;
    }
    fetch(`/api/partner-ansicht?schluessel=${encodeURIComponent(schluessel)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) setFehler(json.error ?? "Laden fehlgeschlagen.");
        else setDaten(json);
      })
      .catch(() => setFehler("Laden fehlgeschlagen."));
  }, [schluessel]);

  return (
    <div className="rounded-3xl bg-background border border-border p-6 sm:p-10">
      <h1 className="text-2xl font-semibold mb-2">Partner-Übersicht</h1>

      {fehler && <p className="text-sm text-red-500 mt-4">{fehler}</p>}
      {!fehler && !daten && <p className="text-sm text-foreground/50 mt-4">Lädt…</p>}

      {daten && (
        <>
          <p className="text-sm text-foreground/60 mb-8">
            Hallo {daten.name} — hier siehst du jederzeit den Stand deines uVise-Partnerlinks.
            {!daten.aktiv && " (Dein Link ist aktuell deaktiviert — melde dich bei uns.)"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Klicks auf deinen Link", wert: daten.klicks.toLocaleString("de-DE") },
              { label: "Geworbene Firmen", wert: daten.geworbeneFirmen.toLocaleString("de-DE") },
              {
                label: "Dein Budget",
                wert: daten.budgetEuro.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
              },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-border p-4">
                <p className="text-xs text-foreground/50">{k.label}</p>
                <p className="text-2xl font-semibold mt-1 tabular-nums">{k.wert}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-xs text-foreground/50 mb-1">Dein Werbe-Link</p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="text-sm break-all">{daten.link}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(daten.link);
                  setKopiert(true);
                  setTimeout(() => setKopiert(false), 1500);
                }}
                className="rounded-full border border-border px-4 py-1.5 text-xs shrink-0"
              >
                {kopiert ? "✓ Kopiert" : "📋 Kopieren"}
              </button>
            </div>
            <p className="text-xs text-foreground/50 mt-3">
              Jede Firma, die über diesen Link auf uvise.de kommt und sich registriert, wird dir zugerechnet.
              Partner seit {new Date(daten.seit).toLocaleDateString("de-DE")}.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-page-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="flex items-center gap-3 mb-8 w-fit">
          <LogoMark size={40} />
          <span className="text-lg font-semibold">uVise</span>
        </Link>
        <Suspense fallback={<p className="text-sm text-foreground/50">Lädt…</p>}>
          <PartnerInhalt />
        </Suspense>
        <nav aria-label="Rechtliches" className="flex flex-wrap gap-4 mt-6 text-sm text-foreground/60">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">← Zur Startseite</Link>
          <Link href="/impressum" className="hover:text-foreground underline-offset-4 hover:underline">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-foreground underline-offset-4 hover:underline">Datenschutz</Link>
        </nav>
      </div>
    </div>
  );
}
