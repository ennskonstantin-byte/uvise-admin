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
  bild_url?: string | null;
  bild_titel?: string | null;
  geplant_am?: string | null;
  fb_post_id?: string | null;
  veroeffentlicht_am?: string | null;
};

// Likes/Kommentare eines echten Facebook-Posts (aus /api/fb-engagement).
type Engagement = {
  likes: number;
  kommentareAnzahl: number;
  kommentare: { name: string; text: string; datum: string }[];
  permalink?: string;
  fehler?: boolean;
};

// Datum als YYYY-MM-DD (ohne Zeitzonen-Verschiebung).
function isoDatum(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Verkleinert ein hochgeladenes Bild im Browser auf max. 1280px (JPEG),
// damit der Upload klein und schnell bleibt.
async function bildVerkleinern(file: File): Promise<string> {
  const bild = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
    img.src = URL.createObjectURL(file);
  });
  const max = 1280;
  let { width, height } = bild;
  if (width > max || height > max) {
    const f = max / Math.max(width, height);
    width = Math.round(width * f);
    height = Math.round(height * f);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bild, 0, 0, width, height);
  URL.revokeObjectURL(bild.src);
  return canvas.toDataURL("image/jpeg", 0.85);
}

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

// Motive für das automatische Foto (echtes Bild als Hintergrund).
const MOTIVE: { k: string; l: string }[] = [
  { k: "handwerk", l: "Handwerk" },
  { k: "werkstatt", l: "Werkstatt" },
  { k: "lager", l: "Lager" },
  { k: "baustelle", l: "Baustelle" },
  { k: "buero", l: "Büro" },
  { k: "gastro", l: "Gastro" },
  { k: "team", l: "Team" },
];

// Fallback fürs Bild, wenn (noch) kein kurzer Bild-Titel vorhanden ist:
// Hashtags raus, nur der erste Satz, hart auf ~70 Zeichen gekürzt.
function kurzText(inhalt: string): string {
  const ohneHashtags = inhalt
    .split("\n")
    .filter((z) => !z.trim().startsWith("#"))
    .join(" ")
    .trim();
  const ersterSatz = ohneHashtags.split(/(?<=[.!?])\s/)[0]?.trim() || ohneHashtags;
  return ersterSatz.length > 70 ? ersterSatz.slice(0, 68).trim() + "…" : ersterSatz;
}

// Der Text, der aufs Bild kommt: bevorzugt der kurze KI-Bild-Titel.
function bildText(p: Post): string {
  return (p.bild_titel && p.bild_titel.trim()) || kurzText(p.inhalt);
}

export default function MarketingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fehler, setFehler] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(true);

  const [thema, setThema] = useState("");
  const [plattform, setPlattform] = useState<"facebook" | "instagram" | "beide">("beide");
  const [generiert, setGeneriert] = useState(false);

  const [bearbeiteId, setBearbeiteId] = useState<string | null>(null);
  const [bearbeiteText, setBearbeiteText] = useState("");
  const [bildId, setBildId] = useState<string | null>(null);
  const [ladeBildId, setLadeBildId] = useState<string | null>(null);
  const [motiv, setMotiv] = useState("handwerk");
  const [appAn, setAppAn] = useState(true);
  const [zeigeKalender, setZeigeKalender] = useState(true);
  const [kalDatum, setKalDatum] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [planStart, setPlanStart] = useState(() => isoDatum(new Date()));
  const [planSchritt, setPlanSchritt] = useState(1);
  const [kampAnzahl, setKampAnzahl] = useState(7);
  const [kampLaeuft, setKampLaeuft] = useState(false);
  const [tagModal, setTagModal] = useState<string | null>(null);
  const [neuLaeuftId, setNeuLaeuftId] = useState<string | null>(null);
  const [veroeffId, setVeroeffId] = useState<string | null>(null);

  // Galerie „Veröffentlicht": Likes/Kommentare je Facebook-Beitragsnummer.
  const [engagement, setEngagement] = useState<Record<string, Engagement>>({});
  const [engagementLaedt, setEngagementLaedt] = useState(false);
  const [offeneKommentareId, setOffeneKommentareId] = useState<string | null>(null);
  const [ganzerTextId, setGanzerTextId] = useState<string | null>(null);
  const [alleZeigen, setAlleZeigen] = useState(false); // Galerie: alle vs. erste 6

  async function kampagneErzeugen() {
    setKampLaeuft(true);
    const ok = await aktion({
      aktion: "kampagne-erzeugen",
      start: planStart,
      schritt: planSchritt,
      anzahl: kampAnzahl,
      plattform,
      thema,
    });
    setKampLaeuft(false);
    if (ok) {
      // Zum Monat des Startdatums springen, damit man den Plan gleich sieht.
      const d = new Date(planStart + "T00:00:00");
      setKalDatum(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  async function tagErzeugen(datum: string) {
    setKampLaeuft(true);
    await aktion({ aktion: "kampagne-erzeugen", start: datum, schritt: 1, anzahl: 1, plattform, thema });
    setKampLaeuft(false);
  }

  async function neuGenerieren(id: string) {
    setNeuLaeuftId(id);
    await aktion({ aktion: "neu-generieren", id });
    setNeuLaeuftId(null);
  }

  async function bildHochladen(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLadeBildId(id);
    try {
      const dataUrl = await bildVerkleinern(file);
      await aktion({ aktion: "bild-hochladen", id, bild: dataUrl });
    } catch {
      setFehler("Bild konnte nicht verarbeitet werden — bitte ein anderes probieren.");
    } finally {
      setLadeBildId(null);
    }
  }

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

  // Likes/Kommentare für alle veröffentlichten Posts mit Facebook-Nummer holen.
  async function ladeEngagement(ids: string[]) {
    if (ids.length === 0) return;
    const t = await token();
    if (!t) return;
    setEngagementLaedt(true);
    try {
      const res = await fetch("/api/fb-engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (res.ok && json.engagement) setEngagement(json.engagement);
    } catch {
      // Kein harter Fehler — die Galerie zeigt dann einfach keine Zahlen.
    } finally {
      setEngagementLaedt(false);
    }
  }

  const fbIdsKey = posts
    .filter((p) => p.status === "veroeffentlicht" && p.fb_post_id)
    .map((p) => p.fb_post_id as string)
    .join(",");
  useEffect(() => {
    if (fbIdsKey) ladeEngagement(fbIdsKey.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbIdsKey]);

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

  // Postet einen freigegebenen Beitrag über die Meta Graph API auf Facebook.
  async function veroeffentlichen(p: Post) {
    const t = await token();
    if (!t) return;
    // Bild: hochgeladenes bild_url (schon öffentliche URL) oder das generierte
    // Beitragsbild von uvise.de (Facebook holt es sich über diese öffentliche URL).
    const bild =
      p.bild_url ??
      `https://www.uvise.de/api/beitragsbild?text=${encodeURIComponent(bildText(p))}&format=quadrat&motiv=${motiv}${appAn ? "&app=1" : ""}`;
    setVeroeffId(p.id);
    setFehler(null);
    setHinweis(null);
    try {
      const res = await fetch("/api/veroeffentlichen", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ id: p.id, text: p.inhalt, bildUrl: bild }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFehler(data.error ?? "Veröffentlichen fehlgeschlagen.");
        return;
      }
      setHinweis(data.warnung ?? "Auf Facebook und Instagram veröffentlicht. 🎉");
      await laden();
    } catch {
      setFehler("Veröffentlichen fehlgeschlagen.");
    } finally {
      setVeroeffId(null);
    }
  }

  async function generieren() {
    setGeneriert(true);
    await aktion({ aktion: "generieren", thema, plattform, anzahl: 3 });
    setGeneriert(false);
  }

  // „Veröffentlicht" hat eine eigene Galerie rechts — hier nur die Arbeitsschritte.
  const gruppen: { status: Post["status"]; titel: string; hinweis?: string }[] = [
    { status: "entwurf", titel: "Zu prüfen", hinweis: "Von der KI erstellt — bearbeiten und freigeben oder verwerfen." },
    {
      status: "freigegeben",
      titel: "Freigegeben — wartet auf Veröffentlichung",
      hinweis: "Mit dem 🚀-Knopf direkt veröffentlichen — oder ein Datum für den Redaktionsplan setzen.",
    },
  ];
  const veroeffentlichtDatum = (p: Post) => p.veroeffentlicht_am || p.created_at;
  const veroeffentlichte = posts
    .filter((p) => p.status === "veroeffentlicht")
    .sort((a, b) => (veroeffentlichtDatum(a) < veroeffentlichtDatum(b) ? 1 : -1));
  // Bei vielen Posts erst 6 zeigen, Rest per Klick ausklappen.
  const GALERIE_ANFANG = 6;
  const galerieSichtbar = alleZeigen ? veroeffentlichte : veroeffentlichte.slice(0, GALERIE_ANFANG);

  // Zellen für das Monatsraster: Leerfelder vor dem 1., dann alle Tage mit
  // den auf diesen Tag geplanten Beiträgen.
  const kalenderZellen: ({ tag: number; iso: string; posts: Post[] } | null)[] = [];
  {
    const jahr = kalDatum.getFullYear();
    const monat = kalDatum.getMonth();
    const ersterWochentag = (new Date(jahr, monat, 1).getDay() + 6) % 7; // Mo=0
    const tageImMonat = new Date(jahr, monat + 1, 0).getDate();
    for (let i = 0; i < ersterWochentag; i++) kalenderZellen.push(null);
    for (let t = 1; t <= tageImMonat; t++) {
      const iso = isoDatum(new Date(jahr, monat, t));
      kalenderZellen.push({ tag: t, iso, posts: posts.filter((p) => p.geplant_am === iso) });
    }
  }
  const heuteIso = isoDatum(new Date());
  const modalPosts = tagModal ? posts.filter((p) => p.geplant_am === tagModal) : [];

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold">Marketing</h1>
      <p className="text-foreground/60 text-sm mt-1 mb-8">
        KI-Beiträge für Facebook &amp; Instagram — du prüfst jeden Text, bevor er rausgeht. Nur für den Betreiber sichtbar.
      </p>

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">

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

      {zeigeKalender ? (
        <section className="rounded-2xl border border-border bg-background p-5 max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">📅 Redaktionsplan</h2>
            <button onClick={() => setZeigeKalender(false)} className="text-xs text-foreground/50">
              ausblenden
            </button>
          </div>

          {/* Kampagne mit KI erzeugen */}
          <div className="rounded-xl border border-border bg-page-bg p-3 mb-4">
            <p className="text-sm font-medium mb-2">🤖 Kampagne mit KI erzeugen</p>
            <div className="flex flex-wrap items-end gap-2 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-foreground/60 text-xs">Ab</span>
                <input
                  type="date"
                  value={planStart}
                  onChange={(e) => setPlanStart(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-foreground/60 text-xs">Anzahl</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={kampAnzahl}
                  onChange={(e) => setKampAnzahl(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 31))}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-1.5"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-foreground/60 text-xs">Rhythmus</span>
                <select
                  value={planSchritt}
                  onChange={(e) => setPlanSchritt(parseInt(e.target.value, 10))}
                  className="rounded-lg border border-border bg-background px-3 py-1.5"
                >
                  <option value={1}>jeden Tag</option>
                  <option value={2}>jeden 2. Tag</option>
                  <option value={3}>jeden 3. Tag</option>
                  <option value={7}>jede Woche</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {(["beide", "facebook", "instagram"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlattform(p)}
                  className={`rounded-full border px-3 py-1 text-xs transition active:scale-95 ${
                    plattform === p ? "border-blue-500 text-blue-500 font-medium" : "border-border text-foreground/60"
                  }`}
                >
                  {PLATTFORM_LABEL[p]}
                </button>
              ))}
              <button
                onClick={kampagneErzeugen}
                disabled={kampLaeuft}
                className="ml-auto rounded-full bg-gradient-to-r from-violet-600 to-sky-400 px-4 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-60"
              >
                {kampLaeuft ? "KI plant…" : "📅 Kampagne erzeugen"}
              </button>
            </div>
            <p className="text-[11px] text-foreground/40 mt-2">
              Die KI schreibt {kampAnzahl} Beiträge (Thema oben eintragen) und legt sie ab{" "}
              {new Date(planStart + "T00:00:00").toLocaleDateString("de-DE")} im gewählten Rhythmus auf die Kalendertage.
              Danach auf einen Tag klicken zum Bearbeiten. Automatisch posten kommt mit der Meta-Anbindung.
            </p>
          </div>

          {/* Monatsnavigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setKalDatum(new Date(kalDatum.getFullYear(), kalDatum.getMonth() - 1, 1))}
              className="rounded-full border border-border px-3 py-1 text-sm"
              aria-label="Vorheriger Monat"
            >
              ←
            </button>
            <div className="font-medium text-sm">
              {MONATE[kalDatum.getMonth()]} {kalDatum.getFullYear()}
            </div>
            <button
              onClick={() => setKalDatum(new Date(kalDatum.getFullYear(), kalDatum.getMonth() + 1, 1))}
              className="rounded-full border border-border px-3 py-1 text-sm"
              aria-label="Nächster Monat"
            >
              →
            </button>
          </div>

          {/* Wochentage */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-foreground/50 mb-1">
            {WOCHENTAGE.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          {/* Tage */}
          <div className="grid grid-cols-7 gap-1">
            {kalenderZellen.map((zelle, i) =>
              zelle ? (
                <button
                  key={i}
                  onClick={() => setTagModal(zelle.iso)}
                  className={`min-h-[64px] rounded-lg border p-1 text-left transition hover:border-blue-400 hover:bg-blue-500/5 active:scale-95 ${
                    zelle.iso === heuteIso ? "border-blue-500" : "border-border"
                  }`}
                >
                  <div className={`text-[11px] ${zelle.iso === heuteIso ? "text-blue-500 font-semibold" : "text-foreground/50"}`}>
                    {zelle.tag}
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {zelle.posts.map((p) => (
                      <div
                        key={p.id}
                        className="truncate rounded bg-blue-500/15 px-1 py-0.5 text-[10px] text-blue-600 dark:text-blue-300"
                      >
                        {bildText(p)}
                      </div>
                    ))}
                  </div>
                </button>
              ) : (
                <div key={i} className="min-h-[64px] rounded-lg border border-transparent" />
              )
            )}
          </div>
        </section>
      ) : (
        <button
          onClick={() => setZeigeKalender(true)}
          className="max-w-2xl mb-6 rounded-full border border-border px-4 py-1.5 text-xs text-foreground/60"
        >
          📅 Redaktionsplan anzeigen
        </button>
      )}

      {posts.length > 0 && (
        <div className="max-w-2xl mb-6 flex justify-end">
          <button
            onClick={() => {
              if (confirm(`Wirklich ALLE ${posts.length} Beiträge löschen? Das kann nicht rückgängig gemacht werden.`)) {
                aktion({ aktion: "alle-loeschen" });
              }
            }}
            className="rounded-full border border-red-300 px-4 py-1.5 text-xs text-red-500 dark:border-red-500/40"
          >
            🗑 Alle löschen
          </button>
        </div>
      )}

      {fehler && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm max-w-2xl mb-8 whitespace-pre-wrap">{fehler}</div>
      )}

      {hinweis && (
        <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-4 text-sm max-w-2xl mb-8 whitespace-pre-wrap">{hinweis}</div>
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
                                onClick={() => veroeffentlichen(p)}
                                disabled={veroeffId === p.id}
                                className="rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                                style={{ background: "#1877F2" }}
                                title="Jetzt auf Facebook und Instagram (mit Bild) veröffentlichen"
                              >
                                {veroeffId === p.id ? "Wird gepostet…" : "🚀 Auf Facebook + Instagram posten"}
                              </button>
                              <button
                                onClick={() => navigator.clipboard.writeText(p.inhalt)}
                                className="rounded-full border border-border px-4 py-1.5 text-xs"
                              >
                                📋 Text kopieren
                              </button>
                              <input
                                type="date"
                                value={p.geplant_am ?? ""}
                                onChange={(e) => aktion({ aktion: "plan-setzen", id: p.id, datum: e.target.value || null })}
                                title="Geplantes Datum"
                                className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                              />
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
                            🖼️ Bild{p.bild_url ? " ✓" : ""}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Diesen Beitrag wirklich löschen?")) aktion({ aktion: "loeschen", id: p.id });
                            }}
                            className="rounded-full border border-border px-4 py-1.5 text-xs text-red-500"
                          >
                            🗑 Löschen
                          </button>
                        </div>
                        {bildId === p.id && (
                          <div className="mt-3 flex flex-col gap-4 rounded-xl border border-border bg-page-bg p-3">
                            {/* Gewähltes (hochgeladenes) Bild */}
                            {p.bild_url && (
                              <div>
                                <p className="text-xs font-medium mb-1">Gewähltes Bild für diesen Beitrag:</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={p.bild_url}
                                  alt="Hochgeladenes Beitragsbild"
                                  className="w-full max-w-[280px] rounded-xl border border-border"
                                />
                                <button
                                  onClick={() => aktion({ aktion: "bild-entfernen", id: p.id })}
                                  className="mt-2 rounded-full border border-border px-4 py-1.5 text-xs text-foreground/60"
                                >
                                  Bild entfernen
                                </button>
                              </div>
                            )}

                            {/* Eigenes Bild hochladen */}
                            <div>
                              <p className="text-xs font-medium mb-1">Eigenes Bild hochladen (z. B. aus Higgsfield):</p>
                              <label className="inline-block cursor-pointer rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white">
                                {ladeBildId === p.id ? "Lädt hoch…" : "📤 Bild wählen"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={ladeBildId === p.id}
                                  onChange={(e) => bildHochladen(p.id, e)}
                                />
                              </label>
                            </div>

                            {/* Automatisch: echtes Foto + uVise-Marke */}
                            <div>
                              <p className="text-xs font-medium mb-1">Oder automatisch ein Bild (echtes Foto + uVise-Marke):</p>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {MOTIVE.map((m) => (
                                  <button
                                    key={m.k}
                                    onClick={() => setMotiv(m.k)}
                                    className={`rounded-full border px-3 py-1 text-[11px] ${
                                      motiv === m.k
                                        ? "border-blue-500 text-blue-500 font-medium"
                                        : "border-border text-foreground/60"
                                    }`}
                                  >
                                    {m.l}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => setAppAn((v) => !v)}
                                className={`mb-2 rounded-full border px-3 py-1 text-[11px] ${
                                  appAn ? "border-blue-500 text-blue-500 font-medium" : "border-border text-foreground/60"
                                }`}
                              >
                                📱 App-Handy {appAn ? "an" : "aus"}
                              </button>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/api/beitragsbild?text=${encodeURIComponent(bildText(p))}&format=quadrat&motiv=${motiv}${appAn ? "&app=1" : ""}`}
                                alt="Vorschau des automatischen Bilds"
                                className="w-full max-w-[280px] rounded-xl border border-border"
                              />
                              <div className="flex flex-wrap gap-2 mt-2">
                                <a
                                  href={`/api/beitragsbild?text=${encodeURIComponent(bildText(p))}&format=quadrat&motiv=${motiv}${appAn ? "&app=1" : ""}`}
                                  download="uvise-instagram.png"
                                  className="rounded-full border border-border px-4 py-1.5 text-xs"
                                >
                                  ⬇︎ Instagram (quadrat)
                                </a>
                                <a
                                  href={`/api/beitragsbild?text=${encodeURIComponent(bildText(p))}&format=quer&motiv=${motiv}${appAn ? "&app=1" : ""}`}
                                  download="uvise-facebook.png"
                                  className="rounded-full border border-border px-4 py-1.5 text-xs"
                                >
                                  ⬇︎ Facebook (quer)
                                </a>
                              </div>
                              <p className="text-[11px] text-foreground/40 mt-1">
                                Kostenlos. Echte Fotos erscheinen, sobald der Pexels-Schlüssel eingetragen ist — sonst die dunkle Vorlage.
                              </p>
                            </div>
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

      </div>{/* Ende linke Spalte */}

      {/* Galerie „Veröffentlicht" — rechte Spalte mit Vorschau, Likes & Kommentaren */}
      {!laedt && (
        <aside className="w-full xl:w-[360px] xl:shrink-0 xl:sticky xl:top-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-medium">Veröffentlicht ({veroeffentlichte.length})</h2>
            <button
              onClick={() => fbIdsKey && ladeEngagement(fbIdsKey.split(","))}
              disabled={engagementLaedt || !fbIdsKey}
              title="Likes & Kommentare neu von Facebook laden"
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground/60 disabled:opacity-50"
            >
              {engagementLaedt ? "Lädt…" : "🔄 Aktualisieren"}
            </button>
          </div>
          <p className="text-xs text-foreground/50 mb-3">Deine Facebook-Posts mit Likes &amp; Kommentaren.</p>

          {veroeffentlichte.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-foreground/50">
              Noch nichts veröffentlicht — links einen freigegebenen Beitrag mit „🚀 Auf Facebook + Instagram posten" rausschicken.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {galerieSichtbar.map((p) => {
              const eng = p.fb_post_id ? engagement[p.fb_post_id] : undefined;
              const bild =
                p.bild_url ??
                `/api/beitragsbild?text=${encodeURIComponent(bildText(p))}&format=quadrat&motiv=${motiv}${appAn ? "&app=1" : ""}`;
              return (
                <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bild} alt="Beitragsbild" loading="lazy" className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-[11px] text-foreground/50 mb-1.5">
                      <span className="rounded-full border border-border px-2 py-0.5">{PLATTFORM_LABEL[p.plattform]}</span>
                      <span className="ml-auto" title="Veröffentlicht am">
                        📅{" "}
                        {new Date(veroeffentlichtDatum(p)).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className={`text-xs whitespace-pre-wrap ${ganzerTextId === p.id ? "" : "line-clamp-3"}`}>{p.inhalt}</p>
                    <button
                      onClick={() => setGanzerTextId(ganzerTextId === p.id ? null : p.id)}
                      className="mt-1 text-[11px] text-blue-500"
                    >
                      {ganzerTextId === p.id ? "weniger anzeigen ▴" : "ganzen Text anzeigen ▾"}
                    </button>

                    {/* Likes & Kommentare */}
                    {p.fb_post_id ? (
                      <div className="mt-2 border-t border-border pt-2">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span title="Reaktionen (Likes, Herzen …)">👍 {eng ? eng.likes : "…"}</span>
                          <button
                            onClick={() => setOffeneKommentareId(offeneKommentareId === p.id ? null : p.id)}
                            className="text-blue-500"
                          >
                            💬 {eng ? eng.kommentareAnzahl : "…"} Kommentar{eng && eng.kommentareAnzahl === 1 ? "" : "e"}{" "}
                            {offeneKommentareId === p.id ? "▴" : "▾"}
                          </button>
                          {eng?.permalink && (
                            <a
                              href={eng.permalink}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-foreground/50 hover:text-foreground"
                            >
                              Auf Facebook ↗
                            </a>
                          )}
                        </div>
                        {eng?.fehler && (
                          <p className="mt-1 text-[11px] text-foreground/40">
                            Konnte nicht von Facebook geladen werden — später „Aktualisieren" drücken.
                          </p>
                        )}
                        {offeneKommentareId === p.id && (
                          <div className="mt-2 flex flex-col gap-2">
                            {!eng || eng.kommentare.length === 0 ? (
                              <p className="text-[11px] text-foreground/40">Noch keine Kommentare.</p>
                            ) : (
                              eng.kommentare.map((k, i) => (
                                <div key={i} className="rounded-xl bg-page-bg px-3 py-2">
                                  <p className="text-[11px] font-medium">
                                    {k.name}
                                    {k.datum && (
                                      <span className="ml-2 font-normal text-foreground/40">
                                        {new Date(k.datum).toLocaleDateString("de-DE")}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs whitespace-pre-wrap">{k.text}</p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 border-t border-border pt-2 text-[11px] text-foreground/40">
                        Likes &amp; Kommentare gibt es erst für Beiträge, die ab jetzt gepostet werden.
                      </p>
                    )}

                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm("Diesen Beitrag aus der Liste löschen? (Der Facebook-Post bleibt bestehen.)"))
                            aktion({ aktion: "loeschen", id: p.id });
                        }}
                        className="text-[11px] text-red-500/70 hover:text-red-500"
                      >
                        🗑 Aus Liste entfernen
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {veroeffentlichte.length > GALERIE_ANFANG && (
            <button
              onClick={() => setAlleZeigen((v) => !v)}
              className="mt-4 w-full rounded-full border border-border px-4 py-2 text-xs text-foreground/70 hover:bg-surface"
            >
              {alleZeigen
                ? "Weniger anzeigen ▴"
                : `Alle ${veroeffentlichte.length} anzeigen ▾ (${veroeffentlichte.length - GALERIE_ANFANG} weitere)`}
            </button>
          )}
        </aside>
      )}
      </div>{/* Ende zweispaltiges Layout */}

      {/* Tag-Pop-up */}
      {tagModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 uv-fade"
          onClick={() => setTagModal(null)}
        >
          <div
            className="uv-pop w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {new Date(tagModal + "T00:00:00").toLocaleDateString("de-DE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <button
                onClick={() => setTagModal(null)}
                className="rounded-full px-2 py-1 text-foreground/60 hover:bg-surface transition active:scale-90"
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>

            {modalPosts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-foreground/60 mb-3">Für diesen Tag ist noch kein Beitrag geplant.</p>
                <button
                  onClick={() => tagErzeugen(tagModal)}
                  disabled={kampLaeuft}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
                >
                  {kampLaeuft ? "KI schreibt…" : "✨ Beitrag für diesen Tag erzeugen"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {modalPosts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3 uv-fade">
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
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                          >
                            Speichern
                          </button>
                          <button
                            onClick={() => setBearbeiteId(null)}
                            className="rounded-full border border-border px-4 py-1.5 text-xs transition active:scale-95"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{p.inhalt}</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            p.bild_url ||
                            `/api/beitragsbild?text=${encodeURIComponent(bildText(p))}&format=quadrat&motiv=${motiv}${appAn ? "&app=1" : ""}`
                          }
                          alt="Bild-Vorschau"
                          className="mt-2 w-full max-w-[220px] rounded-lg border border-border"
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => {
                              setBearbeiteId(p.id);
                              setBearbeiteText(p.inhalt);
                            }}
                            className="rounded-full border border-border px-4 py-1.5 text-xs transition active:scale-95"
                          >
                            ✏️ Bearbeiten
                          </button>
                          <button
                            onClick={() => neuGenerieren(p.id)}
                            disabled={neuLaeuftId === p.id}
                            className="rounded-full border border-border px-4 py-1.5 text-xs transition active:scale-95 disabled:opacity-60"
                          >
                            {neuLaeuftId === p.id ? "KI schreibt…" : "🔄 Neu generieren"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Diesen Beitrag wirklich löschen?")) aktion({ aktion: "loeschen", id: p.id });
                            }}
                            className="rounded-full border border-border px-4 py-1.5 text-xs text-red-500 transition active:scale-95"
                          >
                            🗑 Löschen
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => tagErzeugen(tagModal)}
                  disabled={kampLaeuft}
                  className="self-start rounded-full border border-border px-4 py-1.5 text-xs transition active:scale-95 disabled:opacity-60"
                >
                  {kampLaeuft ? "KI schreibt…" : "+ Weiteren Beitrag für diesen Tag"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
