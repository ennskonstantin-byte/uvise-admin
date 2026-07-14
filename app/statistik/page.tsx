"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";

type TagesWert = { datum: string; aufrufe: number; besucher: number };
type MonatsWert = { monat: string; aufrufe: number; besucher: number };
type Statistik = {
  heute: TagesWert;
  gesamtJahr: number;
  tage: TagesWert[];
  monate: MonatsWert[];
  topHerkunft: { domain: string; aufrufe: number }[];
  topSeiten: { path: string; aufrufe: number }[];
};

const MONATSNAMEN = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function BalkenDiagramm({
  werte,
  beschriftung,
  hover,
}: {
  werte: { key: string; wert: number; extra: number }[];
  beschriftung: (key: string, index: number) => string;
  hover: (w: { key: string; wert: number; extra: number }) => string;
}) {
  const [aktiv, setAktiv] = useState<number | null>(null);
  const max = Math.max(1, ...werte.map((w) => w.wert));
  const breite = 640;
  const hoehe = 180;
  const lueckenAnteil = 0.18;
  const balkenBreite = (breite / werte.length) * (1 - lueckenAnteil);

  return (
    <div className="relative overflow-x-auto">
      <svg viewBox={`0 0 ${breite} ${hoehe + 24}`} className="w-full min-w-[480px]" role="img" aria-label="Balkendiagramm">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0}
            x2={breite}
            y1={hoehe - hoehe * f}
            y2={hoehe - hoehe * f}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}
        {werte.map((w, i) => {
          const x = (breite / werte.length) * i + ((breite / werte.length) * lueckenAnteil) / 2;
          const h = Math.max(w.wert > 0 ? 3 : 0, (w.wert / max) * hoehe);
          return (
            <g key={w.key}>
              {/* Unsichtbare, größere Trefferfläche für den Hover */}
              <rect
                x={(breite / werte.length) * i}
                y={0}
                width={breite / werte.length}
                height={hoehe}
                fill="transparent"
                onMouseEnter={() => setAktiv(i)}
                onMouseLeave={() => setAktiv(null)}
              />
              <rect
                x={x}
                y={hoehe - h}
                width={balkenBreite}
                height={h}
                rx={3}
                fill="#2563eb"
                opacity={aktiv === null || aktiv === i ? 1 : 0.45}
                pointerEvents="none"
              />
              {beschriftung(w.key, i) && (
                <text x={x + balkenBreite / 2} y={hoehe + 16} textAnchor="middle" className="fill-foreground/50" fontSize={10}>
                  {beschriftung(w.key, i)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {aktiv !== null && (
        <div className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs shadow-lg whitespace-nowrap">
          {hover(werte[aktiv])}
        </div>
      )}
    </div>
  );
}

export default function StatistikPage() {
  const [daten, setDaten] = useState<Statistik | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setFehler("Nicht angemeldet.");
        return;
      }
      const res = await fetch("/api/statistik", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        setFehler(json.error ?? "Laden fehlgeschlagen.");
        return;
      }
      setDaten(json);
    })();
  }, []);

  const tage30 = daten ? daten.tage.reduce((s, t) => s + t.aufrufe, 0) : 0;
  const besucher30 = daten ? daten.tage.reduce((s, t) => s + t.besucher, 0) : 0;

  return (
    <DashboardShell>
        <h1 className="text-2xl font-semibold">Besucherstatistik</h1>
        <p className="text-foreground/60 text-sm mt-1 mb-8">
          Aufrufe der öffentlichen Website (uvise.de) — cookielos und anonymisiert gezählt.
          Nur für den Betreiber sichtbar.
        </p>

        {fehler && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm max-w-lg">{fehler}</div>
        )}

        {!fehler && !daten && <p className="text-sm text-foreground/50">Lädt…</p>}

        {daten && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Besucher heute", wert: daten.heute?.besucher ?? 0 },
                { label: "Aufrufe heute", wert: daten.heute?.aufrufe ?? 0 },
                { label: "Besucher (30 Tage)", wert: besucher30 },
                { label: "Aufrufe (12 Monate)", wert: daten.gesamtJahr },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs text-foreground/50">{k.label}</p>
                  <p className="text-2xl font-semibold mt-1 tabular-nums">{k.wert.toLocaleString("de-DE")}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-border bg-background p-5">
              <h2 className="font-medium mb-4">Besucher pro Tag — letzte 30 Tage</h2>
              <BalkenDiagramm
                werte={daten.tage.map((t) => ({ key: t.datum, wert: t.besucher, extra: t.aufrufe }))}
                beschriftung={(key, i) => (i % 5 === 0 ? key.slice(8, 10) + "." + key.slice(5, 7) + "." : "")}
                hover={(w) =>
                  `${w.key.slice(8, 10)}.${w.key.slice(5, 7)}.: ${w.wert} Besucher · ${w.extra} Aufrufe`
                }
              />
            </section>

            <section className="rounded-2xl border border-border bg-background p-5">
              <h2 className="font-medium mb-4">Besucher pro Monat — letzte 12 Monate</h2>
              <BalkenDiagramm
                werte={daten.monate.map((m) => ({ key: m.monat, wert: m.besucher, extra: m.aufrufe }))}
                beschriftung={(key) => MONATSNAMEN[parseInt(key.slice(5, 7), 10) - 1]}
                hover={(w) => {
                  const monat = MONATSNAMEN[parseInt(w.key.slice(5, 7), 10) - 1];
                  return `${monat} ${w.key.slice(0, 4)}: ${w.wert} Besucher · ${w.extra} Aufrufe`;
                }}
              />
            </section>

            <div className="grid sm:grid-cols-2 gap-4">
              <section className="rounded-2xl border border-border bg-background p-5">
                <h2 className="font-medium mb-3">Woher die Besucher kommen</h2>
                {daten.topHerkunft.length === 0 ? (
                  <p className="text-sm text-foreground/50">
                    Noch keine Daten — Herkunft erscheint, sobald jemand über einen Link (z.B. Google) kommt.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {daten.topHerkunft.map((h) => (
                      <li key={h.domain} className="flex justify-between gap-4">
                        <span className="truncate">{h.domain}</span>
                        <span className="tabular-nums text-foreground/60">{h.aufrufe}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="rounded-2xl border border-border bg-background p-5">
                <h2 className="font-medium mb-3">Meistbesuchte Seiten</h2>
                <ul className="flex flex-col gap-2 text-sm">
                  {daten.topSeiten.map((s) => (
                    <li key={s.path} className="flex justify-between gap-4">
                      <span className="truncate">{s.path}</span>
                      <span className="tabular-nums text-foreground/60">{s.aufrufe}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        )}
    </DashboardShell>
  );
}
