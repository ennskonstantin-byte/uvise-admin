"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/store";
import { isOwnerEmail } from "@/lib/owner";
import { Card } from "@/components/Card";

type Feedback = {
  id: string;
  kategorie: "lob" | "kritik" | "wunsch" | "problem" | "sonstiges";
  zusammenfassung: string;
  original: string | null;
  gelesen: boolean;
  created_at: string;
};

const KAT: Record<Feedback["kategorie"], { label: string; klasse: string }> = {
  lob: { label: "👍 Lob", klasse: "bg-green-500/10 text-green-600 dark:text-green-400" },
  kritik: { label: "⚠️ Kritik", klasse: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  wunsch: { label: "💡 Wunsch", klasse: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  problem: { label: "🐞 Problem", klasse: "bg-red-500/10 text-red-600 dark:text-red-400" },
  sonstiges: { label: "💬 Sonstiges", klasse: "bg-foreground/10 text-foreground/70" },
};

// Nur für den Betreiber sichtbar: Feedback, das der Chatbot auf der Website
// gesammelt hat. Wird über die betreiber-gated Route /api/feedback geladen.
export function FeedbackCard() {
  const { session } = useAppData();
  const istBetreiber = isOwnerEmail(session?.user?.email);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [ungelesen, setUngelesen] = useState(0);
  const [laedt, setLaedt] = useState(true);
  const [zeigeAlle, setZeigeAlle] = useState(false);

  async function token(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function laden() {
    const t = await token();
    if (!t) return;
    try {
      const res = await fetch("/api/feedback", { headers: { Authorization: `Bearer ${t}` } });
      const json = await res.json();
      if (res.ok) {
        setFeedback(json.feedback ?? []);
        setUngelesen(json.ungelesen ?? 0);
      }
    } finally {
      setLaedt(false);
    }
  }

  useEffect(() => {
    if (istBetreiber) laden();
    else setLaedt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [istBetreiber]);

  async function aktion(id: string, body: Record<string, unknown>) {
    const t = await token();
    if (!t) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ id, ...body }),
    });
    await laden();
  }

  if (!istBetreiber || laedt) return null;

  const sichtbar = zeigeAlle ? feedback : feedback.slice(0, 5);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Feedback aus dem Chat</h2>
        {ungelesen > 0 && (
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">{ungelesen} neu</span>
        )}
      </div>

      {feedback.length === 0 ? (
        <p className="text-sm text-foreground/50">
          Noch kein Feedback. Sobald Besucher im Website-Chat eine Meinung, einen Wunsch oder ein Problem äußern,
          erscheint es hier.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {sichtbar.map((f) => (
              <div
                key={f.id}
                className={`rounded-2xl border border-border p-3 ${f.gelesen ? "opacity-60" : "bg-blue-500/5"}`}
              >
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${KAT[f.kategorie].klasse}`}>
                    {KAT[f.kategorie].label}
                  </span>
                  <span className="ml-auto text-foreground/40">
                    {new Date(f.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <p className="text-sm">{f.zusammenfassung}</p>
                {f.original && <p className="mt-1 text-xs text-foreground/50 italic">„{f.original}"</p>}
                <div className="mt-2 flex gap-3 text-xs">
                  <button onClick={() => aktion(f.id, { gelesen: !f.gelesen })} className="text-blue-500">
                    {f.gelesen ? "als ungelesen" : "als gelesen markieren"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Dieses Feedback löschen?")) aktion(f.id, { aktion: "loeschen" });
                    }}
                    className="text-red-500/70 hover:text-red-500"
                  >
                    löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
          {feedback.length > 5 && (
            <button
              onClick={() => setZeigeAlle((v) => !v)}
              className="mt-3 w-full rounded-full border border-border px-4 py-2 text-xs text-foreground/70 hover:bg-surface"
            >
              {zeigeAlle ? "Weniger anzeigen ▴" : `Alle ${feedback.length} anzeigen ▾`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
