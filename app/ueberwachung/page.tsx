"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Megaphone, Handshake, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";

type Daten = {
  website: { besucherHeute: number; aufrufeHeute: number; aufrufe30Tage: number };
  marketing: { offeneEntwuerfe: number; freigegeben: number };
  partner: { anzahl: number; klicksGesamt: number; geworbeneFirmen: number };
  firmen: { gesamt: number };
};

function Zahl({ label, wert }: { label: string; wert: number }) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums">{wert.toLocaleString("de-DE")}</p>
      <p className="text-xs text-foreground/50 mt-0.5">{label}</p>
    </div>
  );
}

export default function UeberwachungPage() {
  const [daten, setDaten] = useState<Daten | null>(null);
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
      const res = await fetch("/api/ueberwachung", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const json = await res.json();
      if (!res.ok) setFehler(json.error ?? "Laden fehlgeschlagen.");
      else setDaten(json);
    })();
  }, []);

  const karten = daten
    ? [
        {
          titel: "Website-Besucher",
          icon: BarChart3,
          href: "/statistik",
          zahlen: [
            { label: "Besucher heute", wert: daten.website.besucherHeute },
            { label: "Aufrufe heute", wert: daten.website.aufrufeHeute },
            { label: "Aufrufe (30 Tage)", wert: daten.website.aufrufe30Tage },
          ],
          detail: "Zur Statistik",
        },
        {
          titel: "Marketing",
          icon: Megaphone,
          href: "/marketing",
          zahlen: [
            { label: "Entwürfe zu prüfen", wert: daten.marketing.offeneEntwuerfe },
            { label: "Freigegeben", wert: daten.marketing.freigegeben },
          ],
          detail: "Zu den Beiträgen",
        },
        {
          titel: "Partner",
          icon: Handshake,
          href: "/partner-verwaltung",
          zahlen: [
            { label: "Partner", wert: daten.partner.anzahl },
            { label: "Klicks gesamt", wert: daten.partner.klicksGesamt },
            { label: "Über Partner geworben", wert: daten.partner.geworbeneFirmen },
          ],
          detail: "Zur Partner-Verwaltung",
        },
      ]
    : [];

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold">Überwachung</h1>
      <p className="text-foreground/60 text-sm mt-1 mb-8">
        Dein Überblick über Website, Marketing und Partner. Nur für den Betreiber sichtbar.
      </p>

      {fehler && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm max-w-lg">{fehler}</div>}
      {!fehler && !daten && <p className="text-sm text-foreground/50">Lädt…</p>}

      {daten && (
        <div className="flex flex-col gap-6 max-w-4xl">
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs text-foreground/50">Registrierte Firmen (Kunden gesamt)</p>
            <p className="text-3xl font-semibold tabular-nums mt-1">{daten.firmen.gesamt.toLocaleString("de-DE")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {karten.map(({ titel, icon: Icon, href, zahlen, detail }) => (
              <Link
                key={titel}
                href={href}
                className="group rounded-2xl border border-border bg-background p-5 flex flex-col gap-4 hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-foreground/60" />
                  <h2 className="font-medium">{titel}</h2>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {zahlen.map((z) => (
                    <Zahl key={z.label} label={z.label} wert={z.wert} />
                  ))}
                </div>
                <span className="flex items-center gap-1 text-sm text-blue-500 group-hover:gap-2 transition-all">
                  {detail} <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
