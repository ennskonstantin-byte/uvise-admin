"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useAppData, throwIfError } from "@/lib/store";
import { fehlerText } from "@/lib/fehler";
import { exportNachweiseCsv, exportQualifikationenCsv } from "@/lib/exportCsv";
import { exportGesamtBackupZip } from "@/lib/exportZip";
import { PLANS, CHEF_GRATIS_HINWEIS, ENTERPRISE_KONTAKT } from "@/lib/types";
import { earliestCancellationDate } from "@/lib/contractTerm";
import { supabase } from "@/lib/supabase";

const ABO_STATUS_LABELS: Record<string, string> = {
  canceled: "gekündigt",
  past_due: "Zahlung überfällig",
  unpaid: "nicht bezahlt",
  incomplete: "nicht abgeschlossen",
  incomplete_expired: "abgelaufen (nicht abgeschlossen)",
  trialing: "in der Testphase",
  paused: "pausiert",
};

export default function EinstellungenPage() {
  const {
    company,
    session,
    updateCompany,
    updateAufbewahrungsfrist,
    uploadCompanyLogo,
    employees,
    trainings,
    qualifications,
    employeeTrainings,
    reload,
  } = useAppData();
  const { showToast, ToastView } = useToast();
  const [firmenname, setFirmenname] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [adresse, setAdresse] = useState("");
  const [adminName, setAdminName] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [zippingBackup, setZippingBackup] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [startingCheckout, setStartingCheckout] = useState<string | null>(null);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(false);
  const [savingFrist, setSavingFrist] = useState(false);
  // Nur für den destruktiven Weg (eine echte Frist aktivieren/verschärfen)
  // genutzt -- null bedeutet "kein Dialog offen". Der Rückweg auf "nie
  // automatisch anonymisieren" macht nichts Unwiderrufliches kaputt und
  // läuft deshalb ohne Bestätigung direkt durch.
  const [fristConfirmValue, setFristConfirmValue] = useState<number | null>(null);

  // DSGVO + Konsistenz zu den Apps: Firma & Konto endgültig löschbar.
  // Tipp-Bestätigung im Modal übernimmt die zweite Sicherheitsabfrage.
  async function handleDeleteCompany() {
    setShowDeleteCompanyModal(false);
    setDeletingCompany(true);
    try {
      const { error } = await supabase.rpc("delete_own_company_account");
      throwIfError(error);
      // Konto ist gelöscht — Abmelden darf keinen Fehler mehr werfen.
      await supabase.auth.signOut().catch(() => {});
      // Harte Navigation statt auf den State-Wechsel zu warten (siehe
      // AuthGate.tsx/Sidebar.tsx): sonst rendert diese noch aktive Seite kurz
      // das Login-Formular, bevor AuthGate zur Startseite umleitet.
      window.location.assign("/");
    } catch {
      setDeletingCompany(false);
      showToast("Die Firma konnte nicht gelöscht werden. Bitte später erneut versuchen.");
    }
  }

  async function startCheckout(planName: string) {
    if (!session?.access_token) {
      showToast("Bitte neu einloggen und erneut versuchen.");
      return;
    }
    setStartingCheckout(planName);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ planName }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        showToast(`Fehlgeschlagen: ${json.error ?? "Unbekannter Fehler"}`);
        return;
      }
      window.location.href = json.url;
    } finally {
      setStartingCheckout(null);
    }
  }

  // [E1] Ordentliche Kündigung -- wirksam erst zum von der Route berechneten,
  // nächstmöglichen Laufzeitende (12-Monats-Mindestlaufzeit).
  async function cancelSubscription() {
    if (!session?.access_token) return;
    setShowCancelModal(false);
    setCancelling(true);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ aktion: "kuendigen" }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(`Kündigung fehlgeschlagen: ${json.error ?? "Unbekannter Fehler"}`);
        return;
      }
      showToast(`Gekündigt zum ${new Date(json.cancelAt).toLocaleDateString("de-DE")}.`);
      await reload();
    } catch {
      showToast("Kündigung fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setCancelling(false);
    }
  }

  async function widerrufeKuendigung() {
    if (!session?.access_token) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ aktion: "widerrufen" }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(`Widerruf fehlgeschlagen: ${json.error ?? "Unbekannter Fehler"}`);
        return;
      }
      showToast("Kündigung zurückgezogen.");
      await reload();
    } catch {
      showToast("Widerruf fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setCancelling(false);
    }
  }

  async function sendTestMail() {
    if (!session?.user.email) return;
    setSendingTestMail(true);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ to: session.user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unbekannter Fehler");
      showToast(`Test-E-Mail an ${session.user.email} verschickt.`);
    } catch (e) {
      showToast(`Fehlgeschlagen: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`);
    } finally {
      setSendingTestMail(false);
    }
  }

  // Nutzt die bestehende öffentliche Kontaktformular-Route (app/kontakt) --
  // Name/E-Mail kommen automatisch aus dem eingeloggten Konto, damit man nur
  // noch die Nachricht eintippen muss. Vorher standen hier zwei sichtbare
  // Support-Adressen (identisch) statt eines echten Formulars.
  async function handleSendSupport() {
    if (!session?.user.email) return;
    setSendingSupport(true);
    setSupportError(null);
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: company?.chefName || company?.name || "uVise-Kunde",
          email: session.user.email,
          nachricht: supportMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unbekannter Fehler");
      setSupportSent(true);
    } catch (e) {
      setSupportError(e instanceof Error ? e.message : "Versand fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setSendingSupport(false);
    }
  }

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      await uploadCompanyLogo(file);
      showToast("Firmenlogo gespeichert.");
    } catch {
      showToast("Logo-Upload fehlgeschlagen. Ist der Datei-Speicher (Migration 0010) eingerichtet?");
    } finally {
      setUploadingLogo(false);
    }
  }

  useEffect(() => {
    if (company) {
      setFirmenname(company.name);
      setAdresse(company.address ?? "");
      setAdminName(company.chefName ?? "");
    }
  }, [company]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCompany({ name: firmenname, address: adresse, chefName: adminName });
      showToast("Firmenprofil gespeichert.");
    } finally {
      setSaving(false);
    }
  }

  // Auswahl im <select>: der sichere Rückweg ("nie") speichert sofort, jede
  // echte Frist geht erst über den Bestätigungsdialog unten (handleFristSave).
  function handleFristSelect(value: string) {
    if (value === "") {
      handleFristSave(null);
      return;
    }
    setFristConfirmValue(Number(value));
  }

  async function handleFristSave(monate: number | null) {
    setSavingFrist(true);
    try {
      await updateAufbewahrungsfrist(monate);
      showToast("Aufbewahrungsfrist gespeichert.");
    } catch (e) {
      showToast(fehlerText(e, "Aufbewahrungsfrist speichern"));
    } finally {
      setSavingFrist(false);
      setFristConfirmValue(null);
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Einstellungen" />

      <div className="space-y-8">
        <section>
          <h2 className="font-medium">Firmen-Setup</h2>
          <p className="text-foreground/60 text-sm mb-4">
            Euer Erscheinungsbild — so sehen dich Chef und alle Mitarbeiter in der App.
          </p>

          <Card className="max-w-lg mx-auto text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {company?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt="Firmenlogo"
                    className="h-24 w-24 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div
                    className="h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    {firmenname
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
                <label
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white flex items-center justify-center text-lg cursor-pointer"
                  style={{ background: "var(--accent-gradient)" }}
                  aria-label="Firmenlogo hochladen"
                >
                  +
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
              </div>
              {uploadingLogo && <p className="text-xs text-foreground/65 mt-2">Lädt Logo hoch…</p>}

              {editingName ? (
                <input
                  autoFocus
                  value={firmenname}
                  onChange={(e) => setFirmenname(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  className="mt-4 text-xl font-semibold text-center rounded-full border border-border bg-surface px-4 py-1.5 outline-none"
                />
              ) : (
                <button onClick={() => setEditingName(true)} className="mt-4 text-center">
                  <p className="text-xl font-semibold">{firmenname}</p>
                  <p className="text-xs text-foreground/65">Firmenname antippen, um ihn zu ändern</p>
                </button>
              )}
            </div>

            <div className="space-y-4 text-left">
              <label className="block">
                <span className="text-xs text-foreground/65 mb-1 block">Admin-Name</span>
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
                />
                <span className="text-xs text-foreground/65 mt-1 block">
                  Wird statt „Chef&quot; angezeigt — z.B. bei Rückfragen und Erinnerungen.
                </span>
              </label>
              <label className="block">
                <span className="text-xs text-foreground/65 mb-1 block">Firmenadresse</span>
                <input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
                />
                <span className="text-xs text-foreground/65 mt-1 block">
                  Adresse eintippen — Vorschläge erscheinen automatisch. Erscheint z.B. auf
                  exportierten Archiv-PDFs.
                </span>
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent-gradient)" }}
            >
              {saving ? "Speichert…" : "Speichern"}
            </button>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Aufbewahrungsfrist Unterweisungsnachweise</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            Es gibt keine einzige, branchenübergreifend richtige Frist für die Aufbewahrung
            signierter Unterweisungsnachweise (Arbeitsschutzgesetz und DGUV Vorschrift 1 nennen
            keine feste Frist; die DGUV Information 211-005 empfiehlt unverbindlich mindestens
            2 Jahre). Lass dich bei Unsicherheit rechtlich beraten. Standardmäßig wird nichts
            automatisch gelöscht.
          </p>
          <Card className="max-w-lg">
            <label className="block text-xs text-foreground/65 mb-2">
              Signierte Nachweise nach Ablauf der Frist automatisch anonymisieren
            </label>
            <select
              value={company?.aufbewahrungsfristMonate ?? ""}
              onChange={(e) => handleFristSelect(e.target.value)}
              disabled={savingFrist}
              className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
            >
              <option value="">Nie automatisch anonymisieren (Standard)</option>
              <option value="24">Nach 2 Jahren</option>
              <option value="60">Nach 5 Jahren</option>
              <option value="120">Nach 10 Jahren</option>
            </select>
            <p className="text-xs text-foreground/50 mt-3">
              Anonymisiert wird nur die Unterschrift selbst — dass die Unterweisung stattgefunden
              hat, bleibt weiterhin nachweisbar.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">E-Mail-Erinnerungen</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            Automatische Erinnerungen (Ablauf, Rückfragen) werden verschickt, sobald eine eigene
            Absender-Domain eingerichtet ist. Bis dahin kannst du hier eine Test-E-Mail an dich
            selbst schicken, um zu prüfen, ob der Versand grundsätzlich funktioniert.
          </p>
          <Card className="max-w-lg">
            <button
              onClick={sendTestMail}
              disabled={sendingTestMail || !session?.user.email}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent-gradient)" }}
            >
              {sendingTestMail ? "Sendet…" : `✉️ Test-E-Mail an ${session?.user.email ?? "dich"} senden`}
            </button>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Backup & Export</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            Alle Nachweise und Qualifikationen als CSV-Datei herunterladen — z.B. für
            Prüfungen durch die Berufsgenossenschaft oder als eigene Sicherung. Die Dateien
            lassen sich direkt in Excel öffnen.
          </p>
          <Card className="max-w-lg">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const n = exportNachweiseCsv(employees, trainings, employeeTrainings);
                  showToast(`${n} Nachweis-Zeile(n) exportiert.`);
                }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: "var(--accent-gradient)" }}
              >
                📄 Nachweise als CSV
              </button>
              <button
                onClick={() => {
                  const n = exportQualifikationenCsv(employees, qualifications);
                  showToast(`${n} Qualifikation(en) exportiert.`);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30"
              >
                🎖️ Qualifikationen als CSV
              </button>
              <button
                onClick={async () => {
                  setZippingBackup(true);
                  try {
                    await exportGesamtBackupZip(company, employees, trainings, employeeTrainings, qualifications);
                    showToast("Gesamt-Backup als ZIP heruntergeladen.");
                  } finally {
                    setZippingBackup(false);
                  }
                }}
                disabled={zippingBackup}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30 disabled:opacity-50"
              >
                🗜️ {zippingBackup ? "Erstellt ZIP…" : "Gesamt-Backup als ZIP"}
              </button>
            </div>
            <p className="text-xs text-foreground/65 mt-3">
              „Gesamt-Backup&quot; bündelt beide CSV-Dateien in einer ZIP-Datei. Tipp: Für ein
              druckbares PDF einzelner Jahre gibt es im Archiv den Knopf
              „Gesamtes Jahr als PDF drucken&quot;.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Support & Hilfe</h2>
          <p className="text-foreground/60 text-sm mb-4">
            Fragen oder Probleme? Schreib uns — wir melden uns so schnell wie möglich.
          </p>
          <Card className="max-w-lg">
            {supportSent ? (
              <p className="text-sm rounded-2xl bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-3">
                ✅ Danke! Deine Nachricht ist angekommen — wir melden uns bald bei dir.
              </p>
            ) : (
              <>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Worum geht es?"
                  rows={4}
                  maxLength={5000}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm outline-none resize-y mb-3"
                />
                {supportError && <p className="text-sm text-red-600 mb-3">{supportError}</p>}
                <button
                  onClick={handleSendSupport}
                  disabled={sendingSupport || supportMessage.trim() === ""}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {sendingSupport ? "Sendet…" : "Nachricht senden"}
                </button>
              </>
            )}
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Preise & Abo</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            7 Tage kostenlos testen, keine Kreditkarte nötig. Jeder Vertrag läuft danach 12 Monate
            (monatliche Zahlung) und verlängert sich ohne Kündigung automatisch um weitere 12 Monate.
            Bezahlung per Apple Pay, Google Pay, Visa, Lastschrift, PayPal oder Klarna.
          </p>

          {company?.subscriptionStatus === "active" && company.plan && (
            <div className="text-sm mb-4 rounded-2xl bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-2.5 max-w-xl">
              <p>
                ✅ Aktives Abo: <strong>{company.plan}</strong> (monatlich)
              </p>
              {company.cancelAt ? (
                <p className="mt-1.5">
                  Gekündigt zum {new Date(company.cancelAt).toLocaleDateString("de-DE")}.{" "}
                  <button onClick={widerrufeKuendigung} disabled={cancelling} className="underline disabled:opacity-50">
                    {cancelling ? "…" : "Kündigung zurückziehen"}
                  </button>
                </p>
              ) : (
                <p className="mt-1.5">
                  <button onClick={() => setShowCancelModal(true)} disabled={cancelling} className="underline disabled:opacity-50">
                    Abo kündigen
                  </button>
                </p>
              )}
            </div>
          )}
          {company?.subscriptionStatus && company.subscriptionStatus !== "active" && (
            <p className="text-sm mb-4 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 max-w-xl">
              ⚠️ Abo-Status: {ABO_STATUS_LABELS[company.subscriptionStatus] ?? company.subscriptionStatus}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PLANS.map((plan) => {
              const active = company?.subscriptionStatus === "active" && company.plan === plan.name;
              return (
                <Card
                  key={plan.name}
                  className={`p-6 ${active ? "border-2" : ""}`}
                  style={active ? { borderColor: "var(--accent-violet)" } : undefined}
                >
                  <p className="font-medium mb-1">{plan.name}</p>
                  <p className="text-2xl font-semibold">
                    {plan.preis}€<span className="text-sm font-normal text-foreground/65">/Monat</span>
                  </p>
                  <p className="text-sm text-foreground/65 mb-4">
                    {plan.limit}
                    {active ? " · aktuell aktiv" : ""}
                  </p>
                  <ul className="text-sm space-y-1.5 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-foreground/70">
                        <Check size={14} className="text-foreground/65 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MovingBorderButton
                    onClick={() => startCheckout(plan.name)}
                    disabled={startingCheckout !== null}
                    borderRadius="9999px"
                    duration={3000}
                    containerClassName="w-full h-11 disabled:opacity-50"
                    className={`font-medium ${
                      active
                        ? "text-white border-transparent bg-[image:var(--accent-gradient)]"
                        : ""
                    }`}
                  >
                    {startingCheckout === plan.name
                      ? "Leitet weiter…"
                      : active
                        ? "Erneut abonnieren"
                        : "Jetzt abonnieren"}
                  </MovingBorderButton>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-foreground/65 max-w-xl mb-2">{CHEF_GRATIS_HINWEIS}</p>
          <p className="text-xs text-foreground/65 max-w-xl mb-2">
            {ENTERPRISE_KONTAKT.text}{" "}
            <a href={ENTERPRISE_KONTAKT.href} className="underline hover:text-foreground/80">
              {ENTERPRISE_KONTAKT.linkText}
            </a>
          </p>

          <p className="text-xs text-foreground/65 max-w-xl">
            Zahlung und Kartendaten werden sicher über Stripe abgewickelt — nie direkt bei uVise
            gespeichert. Nach dem Klick auf &bdquo;Jetzt abonnieren&ldquo; geht es auf Stripes
            eigener, gesicherter Seite weiter.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-red-500">Firma &amp; Konto löschen</h2>
          <p className="text-sm text-foreground/70 mt-1 mb-3 max-w-xl">
            Löscht deine Firma mit allen Mitarbeitern, Unterweisungen, Nachweisen und Logins
            endgültig. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <Card className="max-w-lg border-red-500/40">
            <button
              onClick={() => setShowDeleteCompanyModal(true)}
              disabled={deletingCompany}
              className="w-full rounded-full border border-red-500 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-50"
            >
              {deletingCompany ? "Wird gelöscht…" : "🗑 Firma & Konto endgültig löschen"}
            </button>
          </Card>
        </section>
      </div>
      <ToastView />
      {fristConfirmValue !== null && (
        <ConfirmModal
          title="Aufbewahrungsfrist aktivieren?"
          message={`Ab sofort werden signierte Nachweise, deren Unterschrift älter als ${fristConfirmValue} Monate ist, bei jedem Lauf automatisch anonymisiert: Signaturbild und der damals festgehaltene Name werden unwiderruflich entfernt und lassen sich danach nicht wiederherstellen. Das betrifft auch bereits bestehende, ältere Nachweise, nicht nur künftige. Dass die Unterweisung stattgefunden hat, bleibt weiterhin nachweisbar.`}
          confirmLabel="Frist aktivieren"
          danger
          onConfirm={() => handleFristSave(fristConfirmValue)}
          onClose={() => setFristConfirmValue(null)}
        />
      )}
      {showCancelModal && (
        <ConfirmModal
          title="Abo kündigen?"
          message={
            company?.contractStartedAt
              ? `Dein Vertrag läuft 12 Monate und verlängert sich sonst automatisch. Bei einer Kündigung jetzt wird sie zum ${earliestCancellationDate(
                  new Date(company.contractStartedAt)
                ).toLocaleDateString("de-DE")} wirksam — bis dahin läuft das Abo normal weiter und wird weiter monatlich abgebucht.`
              : "Dein Vertrag läuft 12 Monate und verlängert sich sonst automatisch."
          }
          confirmLabel="Kündigen"
          danger
          onConfirm={cancelSubscription}
          onClose={() => setShowCancelModal(false)}
        />
      )}
      {showDeleteCompanyModal && (
        <ConfirmModal
          title="Firma & Konto endgültig löschen"
          message={`„${company?.name ?? "Deine Firma"}" wird gelöscht: Alle Logins (auch deiner) werden entfernt und persönliche Mitarbeiterdaten (E-Mail, Telefon, Geburtsdatum, Foto) gelöscht. Gesetzlich aufbewahrungspflichtige Unterweisungs-Nachweise bleiben dabei anonymisiert erhalten und lassen sich nicht separat entfernen. Das lässt sich nicht rückgängig machen.`}
          confirmLabel="Endgültig löschen"
          danger
          requireTypedText="LÖSCHEN"
          onConfirm={handleDeleteCompany}
          onClose={() => setShowDeleteCompanyModal(false)}
        />
      )}
    </DashboardShell>
  );
}
