"use client";

// Dashboard -- Web-Port der App-Struktur (STYLE.md, chef/components/
// DashboardScreen.tsx): Ring-Hero (F2: Prozent im Ring, Logo darunter) +
// Rückfragen-/Erinnerungen-Minikacheln + HEUTE-Alert + Übersicht-Kacheln
// (F3: Mitarbeiter/signiert/offen/Rückfragen). Ersetzt die frühere
// Mitarbeiter-Such-/Filterliste -- die lebt unverändert auf der eigenen
// Mitarbeiter-Seite weiter, hier steht nur noch der Kennzahlen-Überblick.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/Card";
import { RingHero } from "@/components/RingHero";
import { Kachel } from "@/components/Kachel";
import { Icon3D } from "@/components/Icon3D";
import { PlanModal } from "@/components/PlanModal";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { FeedbackCard } from "@/components/FeedbackCard";
import { SocialOverviewCard } from "@/components/SocialOverviewCard";
import { ReviewBanner } from "@/components/ReviewBanner";
import { useAppData } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const { company, employees: allEmployees, employeeTrainings, questions, qualifications, trainings } = useAppData();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);

  // Archivierte (gekündigte) Mitarbeiter zählen im Dashboard nicht mit.
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
  const vorname = (company?.chefName ?? "").trim().split(/\s+/)[0] || "Chef";

  const trialDaysLeft = useMemo(() => {
    if (!company?.createdAt) return null;
    const msLeft = new Date(company.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now();
    return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  }, [company?.createdAt]);
  const isActivePlan = company?.subscriptionStatus === "active";
  const isCanceledPlan = !!company?.subscriptionStatus && company.subscriptionStatus !== "active";

  return (
    <DashboardShell>
      {!isActivePlan && (
        <div
          className="rounded-2xl px-5 py-3 mb-6 flex items-center justify-between text-sm text-white"
          style={{ background: "var(--accent-gradient)" }}
        >
          <span>
            {isCanceledPlan
              ? "Dein Abo ist derzeit nicht aktiv."
              : trialDaysLeft !== null && trialDaysLeft > 0
                ? `Testphase: noch ${trialDaysLeft} ${trialDaysLeft === 1 ? "Tag" : "Tage"} kostenlos.`
                : "Deine kostenlose Testphase ist abgelaufen."}
          </span>
          <MovingBorderButton
            onClick={() => setShowPlanModal(true)}
            borderRadius="9999px"
            duration={3000}
            containerClassName="h-11 w-auto shrink-0"
            borderClassName="bg-[radial-gradient(#ffffff_40%,transparent_60%)]"
            className="px-4 font-medium text-white bg-white/20 hover:bg-white/30 transition-colors border-white/30"
          >
            Abo wählen
          </MovingBorderButton>
        </div>
      )}

      {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}

      <h1 className="mk-display text-2xl font-bold mb-1" style={{ color: "var(--mk-ink)" }}>
        Guten Tag, {vorname}!
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--mk-ink-60)" }}>
        Hier ist dein aktueller Status.
      </p>

      {/* Statistik-Karte: Ring (F2) + Balken + Rückfragen-/Erinnerungen-Minikacheln */}
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
            onClick={() => router.push("/unterweisungen")}
            aria-label="Zu den Unterweisungen"
            className="shrink-0 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => router.push("/rueckfragen")}
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

      {/* HEUTE-Alert -- bewusst amber (einzige Ausnahme im Design) */}
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
          <p className="text-xs mt-4 italic" style={{ color: "var(--mk-ink-50)" }}>
            Automatische E-Mail an Chef & Mitarbeiter (1 Monat vorher) wird aktiv, sobald Resend eingerichtet ist.
          </p>
        </Card>
      )}

      {/* Übersicht 2×2 (F3: Mitarbeiter / signiert / offen / Rückfragen) */}
      <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--mk-ink-50)" }}>
        ÜBERSICHT
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          onClick={() => router.push("/mitarbeiter")}
        />
        <Kachel
          icon="signiert"
          n={signiertGesamt}
          label="signiert"
          sub={`${ruecklaufquote}% aller Unterweisungen`}
          tint="blau"
          onClick={() => router.push("/archiv")}
        />
        <Kachel
          icon="unterweisungen"
          n={offeneGesamt}
          label="offen"
          sub={`von ${zuweisungenGesamt} Unterweisungen`}
          tint="blau"
          onClick={() => router.push("/unterweisungen")}
        />
        <Kachel
          icon="rueckfragen"
          n={offeneFragen}
          label="Rückfragen"
          sub={offeneFragen === 0 ? <span className="text-green-500">✓ Alles ist geklärt!</span> : "wartet auf Antwort"}
          tint="violett"
          onClick={() => router.push("/rueckfragen")}
        />
      </div>

      {/* Nur für den Betreiber sichtbar (rendern sich selbst weg, wenn kein Betreiber) */}
      <div className="flex flex-col gap-6">
        <ReviewBanner bereit={employees.length > 0 && trainings.length > 0} />
        <SocialOverviewCard />
        <FeedbackCard />
      </div>
    </DashboardShell>
  );
}
