"use client";

// Firmen-Dashboard (SiFa) -- Web-Port von Phase 5/App, Ansicht 31: gleicher
// Ring/Kacheln-Inhalt wie app/dashboard/page.tsx, nur der Kopf zeigt
// Firmenname + "Du arbeitest als SiFa in dieser Firma" statt Begrüßung
// (STYLE.md Ansicht 31: "identisch zum Chef-Dashboard, Kopfzeile ersetzt").
// Ohne die Chef-only-Abschnitte Abo/Testphase, Social-Übersicht, Feedback --
// das sind Firmenprofil-/Betreiber-Angelegenheiten, keine SiFa-Aufgabe.
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/Card";
import { RingHero } from "@/components/RingHero";
import { Kachel } from "@/components/Kachel";
import { Icon3D } from "@/components/Icon3D";
import { useAppData } from "@/lib/store";

export default function SifaDashboardPage() {
  const router = useRouter();
  const params = useParams<{ companyId: string }>();
  const base = `/sifa/${params.companyId}`;
  const { company, employees: allEmployees, employeeTrainings, questions, qualifications, trainings } = useAppData();
  const [remindersOpen, setRemindersOpen] = useState(false);

  const employees = useMemo(() => allEmployees.filter((e) => !e.archiviert), [allEmployees]);

  const zuweisungen = useMemo(() => {
    const activeIds = new Set(employees.map((e) => e.id));
    return employeeTrainings.filter((et) => activeIds.has(et.employeeId) && et.status !== "anonymisiert");
  }, [employees, employeeTrainings]);
  const offeneGesamt = zuweisungen.filter((et) => et.status === "offen").length;
  const zuweisungenGesamt = zuweisungen.length;
  const signiertGesamt = zuweisungen.filter((et) => et.status === "signiert").length;
  const ruecklaufquote = zuweisungenGesamt > 0 ? Math.round((signiertGesamt / zuweisungenGesamt) * 100) : 0;
  const offeneFragen = questions.filter((q) => q.status === "offen").length;

  const empName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.vorname} ${e.nachname}` : "";
  };
  const isArchivedEmployee = (id: string) => allEmployees.find((e) => e.id === id)?.archiviert ?? false;
  const reminders = [
    ...qualifications
      .filter((q) => !isArchivedEmployee(q.employeeId))
      .filter((q) => q.status === "laeuft_ab" || q.status === "abgelaufen")
      .map((q) => ({
        key: "q" + q.id,
        text: `${q.name} — ${empName(q.employeeId)}`,
        sub: q.status === "abgelaufen" ? `abgelaufen (${q.ablaufdatum})` : `läuft ab: ${q.ablaufdatum}`,
        overdue: q.status === "abgelaufen",
      })),
    ...trainings
      .filter((t) => t.status === "laeuft_ab" || t.status === "abgelaufen")
      .map((t) => ({
        key: "t" + t.id,
        text: `${t.name} (Unterweisung)`,
        sub: t.status === "abgelaufen" ? "Jährliche Kontrolle überfällig — bitte prüfen" : "Jährliche Kontrolle: noch aktuell? / läuft ab",
        overdue: t.status === "abgelaufen",
      })),
    ...employees
      .filter((e) => e.minderjaehrig)
      .map((e) => ({
        key: "m" + e.id,
        text: `${e.vorname} ${e.nachname} — minderjährig`,
        sub: "Unterweisung 2× jährlich (halbjährlich) erforderlich",
        overdue: false,
      })),
  ];

  const aktive = employees.filter((e) => e.registriert).length;
  const eingeladene = employees.length - aktive;

  return (
    <>
      <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "var(--mk-ink-50)" }}>
        <span>Du arbeitest als SiFa in dieser Firma</span>
      </div>
      <h1 className="mk-display text-2xl font-bold mb-6" style={{ color: "var(--mk-ink)" }}>
        {company?.name ?? "Firmen-Dashboard"}
      </h1>

      <Card className="mb-6">
        <div className="flex items-center gap-5">
          <RingHero percent={ruecklaufquote} logoUrl={company?.logoUrl ?? null} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--mk-ink-50)" }}>
              UNTERWEISUNGEN
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--mk-ink)" }}>
              {signiertGesamt} von {zuweisungenGesamt} signiert
            </p>
            <div className="h-2 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(2, ruecklaufquote)}%`, background: "linear-gradient(90deg,#3f92ff,#7cc6ff)" }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--mk-ink-60)" }}>
              <span className="font-semibold" style={{ color: "var(--mk-ink)" }}>{offeneGesamt}</span> offen ·{" "}
              <span className="font-semibold text-green-500">{signiertGesamt}</span> abgeschlossen
            </p>
          </div>
          <button
            onClick={() => router.push(`${base}/unterweisungen`)}
            aria-label="Zu den Unterweisungen"
            className="shrink-0 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => router.push(`${base}/rueckfragen`)}
            className="btn-feedback flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5 text-left hover:bg-surface"
          >
            <Icon3D name="rueckfragen" size="md" />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight" style={{ color: "var(--mk-ink)" }}>{offeneFragen}</p>
              <p className="text-xs" style={{ color: "var(--mk-ink-60)" }}>offene Rückfragen</p>
              <p className={`text-xs font-medium ${offeneFragen === 0 ? "text-green-500" : "text-amber-500"}`}>
                {offeneFragen === 0 ? "Alles ist geklärt!" : "wartet auf Antwort"}
              </p>
            </div>
          </button>
          <button
            onClick={() => setRemindersOpen((v) => !v)}
            aria-expanded={remindersOpen}
            className="btn-feedback flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5 text-left hover:bg-surface"
          >
            <Icon3D name="erinnerung" size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-tight" style={{ color: "var(--mk-ink)" }}>{reminders.length}</p>
              <p className="text-xs" style={{ color: "var(--mk-ink-60)" }}>
                {reminders.length === 1 ? "Erinnerung" : "Erinnerungen"}
              </p>
              <p className={`text-xs font-medium ${reminders.length === 0 ? "text-green-500" : "text-amber-500"}`}>
                {reminders.length === 0 ? "Nichts fällig" : "Unterweisung fällig"}
              </p>
            </div>
            <ChevronRight size={14} className="shrink-0" style={{ color: "var(--mk-ink-50)" }} />
          </button>
        </div>
      </Card>

      {reminders.length > 0 && (
        <>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--mk-ink-50)" }}>
            HEUTE
          </p>
          <div className="flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-5 py-4 mb-6">
            <Icon3D name="erinnerung" size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--mk-ink)" }}>
                {reminders.length} {reminders.length === 1 ? "Erinnerung" : "Erinnerungen"}
              </p>
              <p className="text-xs" style={{ color: "var(--mk-ink-60)" }}>
                {reminders.length === 1
                  ? "Etwas ist fällig und wartet auf deine Aufmerksamkeit."
                  : "Mehrere Punkte sind fällig und warten auf dich."}
              </p>
            </div>
            <button
              onClick={() => setRemindersOpen((v) => !v)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              {remindersOpen ? "Einklappen" : "Jetzt öffnen"}
              <ChevronRight size={12} />
            </button>
          </div>
        </>
      )}

      {remindersOpen && reminders.length > 0 && (
        <Card className="mb-6">
          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.key} className="flex items-start gap-3">
                <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${r.overdue ? "bg-red-500" : "bg-amber-500"}`} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--mk-ink)" }}>{r.text}</p>
                  <p className="text-xs" style={{ color: "var(--mk-ink-60)" }}>{r.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--mk-ink-50)" }}>
        ÜBERSICHT
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kachel
          icon="mitarbeiter"
          n={employees.length}
          label="Mitarbeiter"
          sub={
            <>
              <span className="text-green-500">{aktive} aktiv</span> · {eingeladene} eingeladen
            </>
          }
          tint="gruen"
          onClick={() => router.push(`${base}/mitarbeiter`)}
        />
        <Kachel
          icon="signiert"
          n={signiertGesamt}
          label="signiert"
          sub={`${ruecklaufquote}% aller Unterweisungen`}
          tint="blau"
          onClick={() => router.push(`${base}/archiv`)}
        />
        <Kachel
          icon="unterweisungen"
          n={offeneGesamt}
          label="offen"
          sub={`von ${zuweisungenGesamt} Unterweisungen`}
          tint="blau"
          onClick={() => router.push(`${base}/unterweisungen`)}
        />
        <Kachel
          icon="rueckfragen"
          n={offeneFragen}
          label="Rückfragen"
          sub={offeneFragen === 0 ? <span className="text-green-500">✓ Alles ist geklärt!</span> : "wartet auf Antwort"}
          tint="violett"
          onClick={() => router.push(`${base}/rueckfragen`)}
        />
      </div>
    </>
  );
}
