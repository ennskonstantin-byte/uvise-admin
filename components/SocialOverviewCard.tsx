"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/store";
import { isOwnerEmail } from "@/lib/owner";
import { Card } from "@/components/Card";

type Overview = {
  eingerichtet: boolean;
  followers?: number;
  postsGesamt?: number;
  likesGesamt?: number;
  kommentareGesamt?: number;
  letzteKommentare?: { name: string; text: string; datum: string }[];
};

// Nur für den Betreiber: Social-Media-Überblick (Facebook-Seite) im Dashboard —
// Follower, Likes und Kommentare der veröffentlichten Beiträge auf einen Blick.
export function SocialOverviewCard() {
  const { session } = useAppData();
  const istBetreiber = isOwnerEmail(session?.user?.email);
  const [data, setData] = useState<Overview | null>(null);
  const [laedt, setLaedt] = useState(true);

  async function laden() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const t = session?.access_token;
    if (!t) return;
    try {
      const res = await fetch("/api/social-overview", { headers: { Authorization: `Bearer ${t}` } });
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLaedt(false);
    }
  }

  useEffect(() => {
    if (istBetreiber) laden();
    else setLaedt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [istBetreiber]);

  if (!istBetreiber || laedt || !data) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Social-Media-Überblick</h2>
        <button onClick={() => { setLaedt(true); laden(); }} className="text-xs text-blue-500">
          🔄 Aktualisieren
        </button>
      </div>

      {!data.eingerichtet ? (
        <p className="text-sm text-foreground/50">
          Sobald der Facebook-Zugang eingerichtet ist und Beiträge veröffentlicht wurden, siehst du hier Follower,
          Likes und Kommentare.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Follower", wert: data.followers ?? 0, icon: "👥" },
              { label: "Likes", wert: data.likesGesamt ?? 0, icon: "👍" },
              { label: "Kommentare", wert: data.kommentareGesamt ?? 0, icon: "💬" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-page-bg p-4 text-center">
                <div className="text-2xl font-bold">{s.wert}</div>
                <div className="mt-1 text-xs text-foreground/60">
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>

          {data.letzteKommentare && data.letzteKommentare.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-medium mb-2">Neueste Kommentare</h3>
              <div className="flex flex-col gap-2">
                {data.letzteKommentare.map((k, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <p className="text-xs font-medium">
                      {k.name}
                      {k.datum && (
                        <span className="ml-2 font-normal text-foreground/40">
                          {new Date(k.datum).toLocaleDateString("de-DE")}
                        </span>
                      )}
                    </p>
                    <p className="text-sm">{k.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-[11px] text-foreground/40">
            Facebook-Nachrichten (Postfach) brauchen eine zusätzliche Meta-Berechtigung — sag Bescheid, wenn du die
            auch hier haben möchtest. Instagram folgt nach Metas Prüfung.
          </p>
        </>
      )}
    </Card>
  );
}
