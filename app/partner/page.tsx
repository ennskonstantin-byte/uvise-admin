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
  provisionsProzent: number;
  connectOnboardingComplete: boolean;
  provisionEuro: number;
};

function PartnerInhalt() {
  const searchParams = useSearchParams();
  const schluessel = searchParams.get("schluessel") ?? "";
  const [daten, setDaten] = useState<Ansicht | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);
  const [startingOnboarding, setStartingOnboarding] = useState(false);

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

  // [F3] Startet/setzt das Stripe-Connect-Onboarding fort (Auszahlungen).
  async function startOnboarding() {
    setStartingOnboarding(true);
    try {
      const res = await fetch("/api/partner-connect-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schluessel }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setFehler(json.error ?? "Onboarding konnte nicht gestartet werden.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setFehler("Onboarding konnte nicht gestartet werden.");
    } finally {
      setStartingOnboarding(false);
    }
  }

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

          {/* [F3] Provision: {daten.provisionsProzent}% jeder monatlichen Rechnung
              einer geworbenen Firma, solange sie zahlt. */}
          <div className="rounded-2xl border border-border p-4 mt-4">
            <p className="text-xs text-foreground/50 mb-1">
              Provision ({daten.provisionsProzent}% jeder monatlichen Zahlung deiner geworbenen Firmen)
            </p>
            {daten.connectOnboardingComplete ? (
              <p className="text-2xl font-semibold tabular-nums">
                {daten.provisionEuro.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                <span className="text-xs font-normal text-foreground/50 ml-2">bisher ausgezahlt</span>
              </p>
            ) : (
              <>
                <p className="text-sm text-foreground/60 mb-3">
                  Auszahlungen sind noch nicht eingerichtet — hinterlege einmalig deine Bankverbindung bei
                  unserem Zahlungsdienstleister Stripe, danach wird deine Provision automatisch monatlich
                  ausgezahlt.
                </p>
                <button
                  onClick={startOnboarding}
                  disabled={startingOnboarding}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {startingOnboarding ? "Leitet weiter…" : "Auszahlungen einrichten"}
                </button>
              </>
            )}
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
